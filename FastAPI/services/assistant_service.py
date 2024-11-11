import os
import base64
import requests
from io import BytesIO
from typing import List, Optional
import time

from openai import OpenAI
from fastapi import UploadFile, HTTPException

from exceptions import NoMessageException, UnprocessableMessageException, APIRequestException
from dependencies import db_dependency, user_dependency
from models import Message
from strings import ASSISTANT_CONTEXT
from enums import MessageType, AIModel
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import os
import asyncio
import websockets
import json


client = OpenAI()


def get_messages(db: db_dependency, user: user_dependency, limit: int = 20) -> List[Message]:
    start_time = time.time()
    user_messages = get_user_messages(db, user, limit)
    time_taken = time.time() - start_time
    print(f"Time taken to retrieve messages: {time_taken:.4f} seconds")

    return format_messages([Message(type=MessageType.SYSTEM, text=ASSISTANT_CONTEXT)] + user_messages, user)


# Returns messages between a specific user and the assistant:
def get_user_messages(db: db_dependency, user: user_dependency, limit: int = 20) -> List[Message]:
    start_time = time.time()
    # Combining desc and then reversing the order may seem redundant, 
    # but this way we get only the last X messages, with the oldest message appearing first:
    result = db.query(Message).filter_by(user_id=user.id).order_by(Message.timestamp.desc()).limit(limit).all()[::-1]
    time_taken = time.time() - start_time
    print(f"Time taken to get user messages: {time_taken:.4f} seconds")

    return result


def format_messages(messages: List[Message], user: user_dependency) -> List[str]:
    start_time = time.time()  # Start timing
    # Need to use the string value of the enum to avoid issues with JSON serialization:
    formatted_messages = []
    for message in messages:
        if message.type == MessageType.USER: text = f"{user.name}'s Prompt: {message.text}"
        else: text = message.text

        formatted_messages.append({"role": message.type.value, "content": [{"type": "text", "text": text}]})
    
    time_taken = time.time() - start_time  # Calculate time taken
    print(f"Time taken to format messages: {time_taken:.4f} seconds")
    return formatted_messages


def add_message(db: db_dependency, user: user_dependency, type: MessageType, text: str, encoded_audio: Optional[str] = None) -> Message:
    start_time = time.time()
    new_message = Message(user_id=user.id, type=type, text=text, encoded_audio=encoded_audio)
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    time_taken = time.time() - start_time

    print(f"Time taken to add message: {time_taken:.4f} seconds")

    return new_message


def delete_messages(db: db_dependency, user: user_dependency) -> None:
    start_time = time.time()
    messages = db.query(Message).filter((Message.user_id == user.id) & ((Message.type == MessageType.USER) | (Message.type == MessageType.ASSISTANT))).all()
    for message in messages: db.delete(message)
    db.commit()
    time_taken = time.time() - start_time

    print(f"Time taken to delete messages: {time_taken:.4f} seconds")


def speech_to_text(audio_bytes: bytes, file_name: str) -> str:
    start_time = time.time()
    audio_file = BytesIO(audio_bytes)
    audio_file.name = file_name
    result = client.audio.transcriptions.create(model="whisper-1", file=audio_file).text
    time_taken = time.time() - start_time

    print(f"Time taken for speech to text: {time_taken:.4f} seconds")
    return result


def text_to_speech(text: str) -> bytes: 
    start_time = time.time()
    result = client.audio.speech.create(model="tts-1", voice="alloy", input=text).content
    time_taken = time.time() - start_time

    print(f"Time taken for text to speech: {time_taken:.4f} seconds")
    return result


def send_completion_request(_: user_dependency, messages: dict, encoded_image: str = None, model: AIModel = AIModel.GPT_4O, max_tokens: int = 300) -> str:
    # Ensuring the messages are in the correct format for the API:

    print(f"\n\nFormatted Messages:\n{messages}\n\n")

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

    # Print the full response data for debugging
    print(f"Full API response: {response_data}")

    # Check if 'choices' is in the response data
    if "choices" not in response_data:
        print("Error: 'choices' key not found in the response data")
        raise UnprocessableMessageException

    # Need to obtain values from dict (rather than attributes) since we are using requests instead of SDK:
    response_message = response_data["choices"][0]["message"]

    response_text = response_message["content"]

    return response_text


async def completion(db: db_dependency, user: user_dependency, text: Optional[str],
    audio: Optional[UploadFile], image: Optional[UploadFile], encoded_image: Optional[str] = None,
    model: AIModel = AIModel.GPT_4O, generate_audio: bool = False, max_tokens: int = 300, context_message_count: int= 20) -> dict: 

    print("\n\n\n")
    start_time = time.time()
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

        # Concatenating user's text and audio prompts:
        user_text = f"{text or ''} {transcription or ''}".strip()

        # Adding the user's message to the DB:
        add_message(db, user, MessageType.USER, user_text)

        # Getting all the messages associated to that user:
        messages = get_messages(db, user, context_message_count)

        # Sending the completion request to the API:
        completion_text = send_completion_request(user, messages, encoded_image, model, max_tokens=max_tokens)

        encoded_audio = None
        if generate_audio:
            # Converting the response text to audio:
            audio_bytes = text_to_speech(completion_text)
            encoded_audio = base64.b64encode(audio_bytes).decode("utf-8")
        
        # Adding the assistant response to the db:
        assistant_message = add_message(db, user, MessageType.ASSISTANT, completion_text, encoded_audio)

        time_taken = time.time() - start_time
        print(f"Total time taken for completion (incl image processing, TTS, STT): {time_taken:.4f} seconds")

        return assistant_message

    except HTTPException as h:
        # Raising HTTP Exceptions again without modification:
        raise h
    
    except Exception as e:
        print(f"Error during completion: {e}")
        raise UnprocessableMessageException from e
        