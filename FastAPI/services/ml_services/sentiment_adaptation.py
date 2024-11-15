# sentiment_adaptation.py

from transformers import pipeline
from sqlalchemy.orm import Session
from models import Message
from dependencies import get_db
from typing import List

# Initialize sentiment analysis pipeline once
sentiment_analyzer = pipeline("sentiment-analysis")

def analyze_feedback(db: Session, user_id: int):
    """
    Analyzes user feedback and adjusts user preferences based on sentiment.
    This function should be called as a background task.
    """
    # Fetch messages with feedback from the user
    feedback_messages = db.query(Message).filter(
        Message.user_id == user_id,
        Message.feedback.isnot(None)
    ).all()

    if not feedback_messages:
        return

    category_adjustments = {
        "scene": 0.0,
        "activities": 0.0,
        "emotions": 0.0,
        "atmosphere": 0.0,
        "colors": 0.0,
        "text": 0.0,
        "conciseness": 0.0
    }

    for message in feedback_messages:
        sentiment = sentiment_analyzer(message.feedback)[0]
        adjustment = 1.0 if sentiment['label'] == 'POSITIVE' else -1.0
        for category, score in message.category_scores.items():
            category_adjustments[category] += adjustment * score

    # Normalize adjustments and apply to user preferences
    user_pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if not user_pref:
        return

    for category, adjustment in category_adjustments.items():
        current_pref = getattr(user_pref, category)
        # Apply a small learning rate to adjustments
        new_pref = current_pref + 0.1 * adjustment
        # Ensure preferences stay within a reasonable range
        new_pref = max(0.5, min(new_pref, 2.0))
        setattr(user_pref, category, new_pref)

    db.commit()