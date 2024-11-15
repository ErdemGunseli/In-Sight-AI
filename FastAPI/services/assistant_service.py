import os
import base64
import requests
import io
from io import BytesIO
from typing import List, Optional
import wave

from openai import OpenAI
from fastapi import UploadFile, HTTPException
from pyneuphonic import Neuphonic, TTSConfig

from services.ml_services.keyword_extraction import KeywordExtractor
from exceptions import NoMessageException, UnprocessableMessageException, APIRequestException, MessageNotFoundException
from dependencies import db_dependency, user_dependency
from models import Message, MessageInsight
from strings import ASSISTANT_CONTEXT
from enums import MessageType, AIModel, TTSModel, OpenAIVoice, MessageFeedback

client = OpenAI()

# Initializing the Neuphonic client:
neuphonic_client = Neuphonic(api_key=os.environ.get('NEUPHONIC_API_KEY'))

# Initializing the nlp extractor:
# keyword_extractor = KeywordExtractor()


def get_messages(db: db_dependency, user: user_dependency, limit: int = 20) -> List[Message]:
    user_messages = get_user_messages(db, user, limit)
    return format_messages([Message(type=MessageType.SYSTEM, text=ASSISTANT_CONTEXT)] + user_messages, user)


# Returns messages between a specific user and the assistant:
def get_user_messages(db: db_dependency, user: user_dependency, limit: int = 20) -> List[Message]:
    # Combining desc and then reversing the order may seem redundant, 
    # but this way we get only the last X messages, with the oldest message appearing first:
    result = db.query(Message).filter_by(user_id=user.id).order_by(Message.timestamp.desc()).limit(limit).all()[::-1]
    return result


def format_message(message: List[Message], user: user_dependency):
    if message.type == MessageType.USER: text = f"{user.name}'s Prompt: {message.text}"
    else: text = message.text
    
    return {"role": message.type.value, "content": [{"type": "text", "text": text}]}


def format_messages(messages: List[Message], user: user_dependency) -> List[str]:
    # Need to use the string value of the enum to avoid issues with JSON serialization:
    formatted_messages = []

    for message in messages:
        formatted_messages.append(format_message(message, user))

    return formatted_messages


def add_message(db: db_dependency, user: user_dependency, type: MessageType, text: str, encoded_audio: Optional[str] = None) -> Message:
    new_message = Message(user_id=user.id, type=type, text=text, encoded_audio=encoded_audio)
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # Scoring the message:
    # scores = keyword_extractor.score_categories(text)
    # for category, score in scores.items():
    #     db.add(MessageInsight(message_id=new_message.id, category=category, score=score))
    # db.commit()

    return new_message


def add_message_feedback(db: db_dependency, user, message_id: int, feedback: MessageFeedback) -> None:
    # Retrieving the message from the database:
    message = db.query(Message).filter_by(id=message_id, user_id=user.id, type=MessageType.ASSISTANT).first()

    # Checking if the message exists:
    if not message:
        raise MessageNotFoundException

    # Updating the message feedback:
    message.feedback = feedback
    db.commit()

def delete_messages(db: db_dependency, user: user_dependency) -> None:
    messages = db.query(Message).filter((Message.user_id == user.id) & ((Message.type == MessageType.USER) | (Message.type == MessageType.ASSISTANT))).all()
    for message in messages: db.delete(message)
    db.commit()


def speech_to_text(audio_bytes: bytes, file_name: str) -> str:
    audio_file = BytesIO(audio_bytes)
    audio_file.name = file_name
    result = client.audio.transcriptions.create(model="whisper-1", file=audio_file).text
    return result


def neuphonic_text_to_speech(text: str) -> str:
    # Using the Neuphonic client to generate audio from text:
    sse = neuphonic_client.tts.SSEClient()

    # Options can be set here:
    tts_config = TTSConfig()
    
    # Sending the text and getting the response:
    response = sse.send(text, tts_config=tts_config)
    
    # Collect the audio data
    audio_data = b''
    for item in response:
        audio_data += item.data.audio
    
    # Writing the raw audio data into a WAV file in memory:
    wav_buffer = io.BytesIO()
    with wave.open(wav_buffer, 'wb') as wf:
        # Setting the parameters for the WAV file:
        # Mono audio, 16-bit audio, 22050 Hz sampling rate:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(22050)
        wf.writeframes(audio_data)
    
    # Retrieving the WAV data from the buffer:
    wav_data = wav_buffer.getvalue()
    
    # Encoding the WAV data to base64:
    encoded_audio = base64.b64encode(wav_data).decode('utf-8')

    return encoded_audio


def text_to_speech(text: str, voice: OpenAIVoice = OpenAIVoice.ALLOY) -> str:
    audio_response = client.audio.speech.create(
        model="tts-1",
        voice=voice.value,
        input=text
    )
    audio_bytes = audio_response.content

    # Encoding to base64:
    encoded_audio = base64.b64encode(audio_bytes).decode("utf-8")

    return encoded_audio


def send_completion_request(_: user_dependency, messages: dict, encoded_image: str = None, model: AIModel = AIModel.GPT_4O, max_tokens: int = 300) -> str:

    if encoded_image: 
        # If there is an image, adding it to the user's last message (all past images excluded due to context window limits):
        # There will always be a content field due to the formatting method.
        messages[-1]["content"].append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encoded_image}"}})
        
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"}
    payload = {"model": model.value, "messages": messages, "max_tokens": max_tokens}

    # Sending the completion request:
    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

    # Checking if the response is successful:
    if response.status_code != 200:
        print(f"API request failed with status code {response.status_code}")
        print(f"Response content: {response.text}")
        raise APIRequestException

    # Extracting the response content:
    response_data = response.json()

    # Need to obtain values from dict (rather than attributes) since we are using requests instead of SDK:
    response_message = response_data["choices"][0]["message"]

    response_text = response_message["content"]

    return response_text


async def completion(db: db_dependency, user: user_dependency, text: Optional[str], audio: Optional[UploadFile], 
                     image: Optional[UploadFile], encoded_image: Optional[str] = None, model: AIModel = AIModel.GPT_4O, 
                     generate_audio: bool = False, tts_model: TTSModel = TTSModel.OPENAI, openai_voice: OpenAIVoice = OpenAIVoice.ALLOY, 
                     max_tokens: int = 300, context_message_count: int = 20) -> dict:

    try:
        # If at least one type of input is not provided, raising an exception:
        if not any([text, audio, image, encoded_image]):
            raise NoMessageException

        transcription = None
        if audio:
            # Reading the audio and converting to text:
            audio_bytes = await audio.read()
            transcription = speech_to_text(audio_bytes, audio.filename)
            await audio.close()

        if image and not encoded_image:
            # Reading and encoding the image file:
            image_content = await image.read()
            encoded_image = base64.b64encode(image_content).decode("utf-8")
            await image.close()

        # Concatenating user's text and audio prompt:
        user_text = f"{text or ''} {transcription or ''}".strip()

        # Adding the user's message to the DB:
        if user_text:
            add_message(db, user, MessageType.USER, user_text)

        # Getting all the messages associated with the user:
        messages = get_messages(db, user, context_message_count)

        # User message object needed to attach image:
        if not user_text:
            messages.append(format_message(Message(type=MessageType.USER, text=user_text), user))

        # Sending the completion request:
        completion_text = send_completion_request(user, messages, encoded_image, model, max_tokens=max_tokens)

        encoded_audio = None
        if generate_audio:
            # Determining which TTS function to use based on tts_model:
            if tts_model == TTSModel.OPENAI:
                encoded_audio = text_to_speech(completion_text, openai_voice)
            elif tts_model == TTSModel.NEUPHONIC:
                encoded_audio = neuphonic_text_to_speech(completion_text)
            
        # Adding the assistant response to the DB:
        assistant_message = add_message(db, user, MessageType.ASSISTANT, completion_text, encoded_audio)

        return assistant_message

    except HTTPException as h:
        # Raising HTTP Exceptions again without modification:
        raise h

    except Exception as e:
        print(f"Error during completion: {e}")
        raise UnprocessableMessageException from e
        