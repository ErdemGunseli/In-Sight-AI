from typing import List, Optional

from fastapi import APIRouter, status as st, UploadFile, File, Form, Request, WebSocket
from starlette.requests import Request

from main import app
from enums import AIModel
from services import assistant_service
from schemas import MessageResponse
from dependencies import db_dependency, user_dependency


router = APIRouter(prefix="/assistant", tags=["Assistant"])


@router.post("/completion", response_model=MessageResponse, status_code=st.HTTP_201_CREATED)
# FIXME: Activate rate limit: @app.state.limiter.limit("5/minute, 30/hour, 50/day")
async def completion(db: db_dependency, user: user_dependency, request: Request, 
                     text: Optional[str] = Form(None), audio: UploadFile = File(None), image: UploadFile = File(None), model: AIModel = Form(AIModel.GPT_4O), generate_audio: bool = Form(False)):
    return await assistant_service.completion(db, user, text, audio, image, model, generate_audio, max_tokens=100)


@router.get("/messages", response_model=List[MessageResponse], status_code=st.HTTP_200_OK)
@app.state.limiter.limit("10/minute")
async def read_messages(db: db_dependency, user: user_dependency, request: Request):
    return assistant_service.get_user_messages(db, user)


@router.delete("/messages", status_code=st.HTTP_204_NO_CONTENT)
@app.state.limiter.limit("")
async def delete_messages(db: db_dependency, user: user_dependency, request: Request):
    assistant_service.delete_messages(db, user)


