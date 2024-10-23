from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime

from database import Base
from enums import MessageType


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, index=True, unique=True, nullable=False)
    password = Column(String, nullable=False)

    messages = relationship("Message", back_populates="user", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    # null if system message that applies to all users:
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    type = Column(Enum(MessageType), nullable=False, index=True)
    text = Column(String, nullable=False)
    encoded_audio = Column(String, nullable=True)
    timestamp = Column(DateTime, server_default=func.now(), index=True)

    user = relationship("User", back_populates="messages")
