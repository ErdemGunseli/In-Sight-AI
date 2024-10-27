from typing import Optional
from datetime import datetime

from pydantic import BaseModel, Field, EmailStr

from enums import MessageType


class CreateUserRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100, alias="Name")
    email: EmailStr = Field(max_length=254, alias="Email")
    password: str = Field(min_length=6, max_length=100, alias="Password")


class UserResponse(BaseModel):
    id: int
    name: str = Field(alias="Name")
    email: EmailStr = Field(alias="Email")

    # Pydantic models normally expect data in the form of dictionaries.
    # We have objects, so setting ORM mode to true:
    # In Pydantic version 2, "orm_mode" has been renamed to "from_attributes"
    class Config: from_attributes = True


class TokenResponse(BaseModel):
    access_token: str = Field(alias="Access Token")
    token_type: str = Field(alias="Token Type")

    # from_attributes is false because data will be provided as a dictionary, not from the db.


class MessageResponse(BaseModel):
    type: MessageType = Field(alias="Type")
    text: Optional[str] = Field(None, alias="Text")
    # Only has a value if generate_audio is True:
    encoded_audio: Optional[str] = Field(None, alias="Encoded Audio")

    class Config: from_attributes = True
