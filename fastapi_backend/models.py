from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, Boolean, Float

from .database import Base
from .enums import MessageType, DescriptionCategory, MessageFeedback


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, index=True, unique=True, nullable=False)
    password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)

    messages = relationship("Message", back_populates="user", cascade="all, delete-orphan")
    insights = relationship("UserInsight", back_populates="user", cascade="all, delete-orphan")


class UserInsight(Base):
    __tablename__ = "user_insights"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(Enum(DescriptionCategory), nullable=False)
    score = Column(Float, default=1.0)

    user = relationship("User", back_populates="insights")


class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    # null if system message that applies to all users:
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    type = Column(Enum(MessageType), nullable=False, index=True)
    text = Column(String, nullable=False)
    encoded_audio = Column(String, nullable=True)
    timestamp = Column(DateTime, server_default=func.now(), index=True)
    feedback = Column(Enum(MessageFeedback), default=MessageFeedback.NEUTRAL)

    user = relationship("User", back_populates="messages")
    insights = relationship("MessageInsight", back_populates="message", cascade="all, delete-orphan")


class MessageInsight(Base):
    __tablename__ = "message_insights"
    id = Column(Integer, primary_key=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    category = Column(Enum(DescriptionCategory), nullable=False)
    score = Column(Float, default=1.0)

    message = relationship("Message", back_populates="insights")
