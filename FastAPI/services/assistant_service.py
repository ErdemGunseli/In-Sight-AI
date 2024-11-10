# assistant_service.py

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

client = OpenAI()

def get_messages(db: db_dependency, user: user_dependency, limit: int = 20) -> List[Message]:
    start_time = time.time()
    user_messages = get_user_messages(db, user, limit)
    time_taken = time.time() - start_time
    print(f"Time taken to retrieve messages: {time_taken:.4f} seconds")

    return format_messages([Message(type=MessageType.SYSTEM, text=ASSISTANT_CONTEXT)] + user_messages, user)

def get_user_messages(db: db_dependency, user: user_dependency, limit: int = 20) -> List[Message]:
    start_time = time.time()
    result = db.query(Message).filter_by(user_id=user.id).order_by(Message.timestamp.desc()).limit(limit).all()[::-1]
    time_taken = time.time() - start_time
    print(f"Time taken to get user messages: {time_taken:.4f} seconds")

    return result

def format_messages(messages: List[Message], user: user_dependency) -> List[dict]:
    start_time = time.time()
    formatted_messages = []
    for message in messages:
        if message.type == MessageType.USER:
            text = f"{user.name}'s Prompt: {message.text}"
        else:
            text = message.text

        formatted_messages.append({
            "role": message.type.value,
            "content": [{"type": "text", "text": text}]
        })

    time_taken = time.time() - start_time
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
    messages = db.query(Message).filter(
        (Message.user_id == user.id) & 
        ((Message.type == MessageType.USER) | (Message.type == MessageType.ASSISTANT))
    ).all()
    for message in messages:
        db.delete(message)
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

def send_completion_request(
    _: user_dependency, 
    messages: List[dict], 
    encoded_images: Optional[List[str]] = None, 
    model: AIModel = AIModel.GPT_4O, 
    max_tokens: int = 300
) -> str:
    formatted_messages = messages


    if encoded_images:
        for encoded_image in encoded_images:
            formatted_messages[-1]["content"].append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encoded_image}"}})

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"
    }
    payload = {
        "model": model.value,
        "messages": formatted_messages,
        "max_tokens": max_tokens
    }

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=headers,
        json=payload
    )


    if response.status_code != 200:
        print(f"API request failed with status code {response.status_code}")
        print(f"Response content: {response.text}")
        raise APIRequestException

    response_data = response.json()
    if "choices" not in response_data:
        raise UnprocessableMessageException

    response_message = response_data["choices"][0]["message"]
    formatted_messages.append(response_message)

    response_text = response_message["content"]

    return response_text

async def completion(
    db: Optional[db_dependency] = None, 
    user: Optional[user_dependency] = None, 
    text: Optional[str] = None,
    audio: Optional[UploadFile] = None, 
    images: Optional[List[UploadFile]] = None, 
    encoded_images: Optional[List[str]] = None,
    model: AIModel = AIModel.GPT_4O, 
    generate_audio: bool = False, 
    max_tokens: int = 300, 
    context_message_count: int = 20
) -> dict:
    start_time = time.time()
    try:
        if not any([text, audio, images, encoded_images]):
            raise NoMessageException

        transcription = None
        if audio:
            audio_bytes = await audio.read()
            transcription = speech_to_text(audio_bytes, audio.filename)
            await audio.close()

        if images:
            encoded_images = []
            for image in images:
                image_content = await image.read()
                encoded_image = base64.b64encode(image_content).decode("utf-8")
                encoded_images.append(encoded_image)
                await image.close()
        elif not encoded_images:
            encoded_images = []

        user_text = f"{text or ''} {transcription or ''}".strip()

        if db and user:
            add_message(db, user, MessageType.USER, user_text)
            messages = get_messages(db, user, context_message_count)
        else:
            system_message = {
                "role": MessageType.SYSTEM.value,
                "content": [{"type": "text", "text": ASSISTANT_CONTEXT}]
            }
            user_message = {
                "role": MessageType.USER.value,
                "content": [{"type": "text", "text": user_text}]
            }
            messages = [system_message, user_message]

        completion_text = send_completion_request(
            user, messages, encoded_images, model, max_tokens=max_tokens
        )

        encoded_audio = None
        if generate_audio:
            audio_bytes = text_to_speech(completion_text)
            encoded_audio = base64.b64encode(audio_bytes).decode("utf-8")

        if db and user:
            assistant_message = add_message(
                db, user, MessageType.ASSISTANT, completion_text, encoded_audio
            )
        else:
            assistant_message = {
                'type': MessageType.ASSISTANT.value,
                'text': completion_text,
                'encoded_audio': encoded_audio
            }

        time_taken = time.time() - start_time
        print(f"Total time taken for completion: {time_taken:.4f} seconds")

        return assistant_message

    except HTTPException as h:
        raise h

    except Exception as e:
        print(f"Error during completion: {e}")
        raise UnprocessableMessageException from e