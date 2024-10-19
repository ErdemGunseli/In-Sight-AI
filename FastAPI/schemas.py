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
    name: str
    email: EmailStr

    # Pydantic models normally expect data in the form of dictionaries.
    # We have objects, so setting ORM mode to true:
    # In Pydantic version 2, "orm_mode" has been renamed to "from_attributes"
    class Config: from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str

    # from_attributes is false because data will be provided as a dictionary, not from the db.


class MessageResponse(BaseModel):
    type: MessageType 
    text: Optional[str] = None
    # Only has a value if generate_audio is True:
    encoded_audio: Optional[str] = None 

    class Config: from_attributes = True
