from typing import Optional
from datetime import datetime

from pydantic import BaseModel, Field, EmailStr

from enums import MessageType


class CreateUserRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr = Field(max_length=254)
    password: str = Field(min_length=6, max_length=100)


class UserResponse(BaseModel):
    id: int
    name: str = Field()
    email: EmailStr = Field()

    class Config: from_attributes = True


class TokenResponse(BaseModel):
    access_token: str = Field()
    token_type: str = Field()


class MessageResponse(BaseModel):
    type: MessageType = Field()
    text: Optional[str] = Field(None)
    encoded_audio: Optional[str] = Field(None)

    class Config: from_attributes = True
