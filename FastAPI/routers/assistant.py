from typing import List, Optional

from fastapi import APIRouter, status as st, UploadFile, File, Form, Request, HTTPException, Depends
from starlette.requests import Request
from sqlalchemy.orm import Session

from rate_limiter import limiter
from enums import AIModel, TTSModel, OpenAIVoice, MessageFeedback
from services import assistant_service
from schemas import MessageResponse
from dependencies import db_dependency, user_dependency, get_db, get_current_user

router = APIRouter(prefix="/assistant", tags=["Assistant"])

@router.post("/completion", response_model=MessageResponse, status_code=st.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def completion(db: db_dependency, user: user_dependency, request: Request,
                     text: Optional[str] = Form(None), audio: UploadFile = File(None), 
                     image: UploadFile = File(None), encoded_image: Optional[str] = Form(None),
                     model: AIModel = Form(AIModel.GPT_4O), generate_audio: bool = Form(False),
                     tts_model: TTSModel = Form(TTSModel.OPENAI), openai_voice: OpenAIVoice = Form(OpenAIVoice.ALLOY)):

    return await assistant_service.completion(db, user, text, audio, image, encoded_image, model, generate_audio, tts_model, openai_voice)


@router.get("/messages", response_model=List[MessageResponse], status_code=st.HTTP_200_OK)
@limiter.limit("")
async def read_messages(db: db_dependency, user: user_dependency, request: Request):
    return assistant_service.get_user_messages(db, user)


@router.put("/messages/{message_id}/feedback", status_code=st.HTTP_204_NO_CONTENT)
async def update_message_feedback(db: db_dependency, user: user_dependency, message_id: int, feedback: MessageFeedback):
    assistant_service.add_message_feedback(db, user, message_id, feedback)


@router.delete("/messages", status_code=st.HTTP_204_NO_CONTENT)
@limiter.limit("")
async def delete_messages(db: db_dependency, user: user_dependency, request: Request):
    assistant_service.delete_messages(db, user)