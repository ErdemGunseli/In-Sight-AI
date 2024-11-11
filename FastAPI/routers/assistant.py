from typing import List, Optional

from fastapi import APIRouter, status as st, UploadFile, File, Form, Request, WebSocket
from starlette.requests import Request

from rate_limiter import limiter
from enums import AIModel, TTSModel
from services import assistant_service
from schemas import MessageResponse
from dependencies import db_dependency, user_dependency

router = APIRouter(prefix="/assistant", tags=["Assistant"])

@router.post("/completion", response_model=MessageResponse, status_code=st.HTTP_201_CREATED)
@limiter.limit("5/minute, 20/month")
async def completion(db: db_dependency, user: user_dependency, request: Request,
                     text: Optional[str] = Form(None), audio: UploadFile = File(None), 
                     image: UploadFile = File(None), encoded_image: Optional[str] = Form(None),
                     model: AIModel = Form(AIModel.GPT_4O), generate_audio: bool = Form(False),
                     tts_model: TTSModel = Form(TTSModel.NEUPHONIC)):

    return await assistant_service.completion(db, user, text, audio, image, encoded_image, model, generate_audio, tts_model)

@router.get("/messages", response_model=List[MessageResponse], status_code=st.HTTP_200_OK)
@limiter.limit("10/minute")
async def read_messages(db: db_dependency, user: user_dependency, request: Request):
    return assistant_service.get_user_messages(db, user)


@router.delete("/messages", status_code=st.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
async def delete_messages(db: db_dependency, user: user_dependency, request: Request):
    assistant_service.delete_messages(db, user)