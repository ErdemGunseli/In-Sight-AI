# machine_learning/preference_prediction.py

from sqlalchemy.orm import Session
from models import User, Message, UserPreference
from dependencies import get_db
from typing import Dict
import numpy as np

def update_user_preferences(db: Session, user_id: int, category_scores: Dict[str, float], feedback_positive: bool):

    # Fetch or create UserPreference
    user_pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if not user_pref:
        user_pref = UserPreference(user_id=user_id)
        db.add(user_pref)
    
    # Adjust preferences based on feedback
    adjustment = 1.0 if feedback_positive else -1.0
    for category, score in category_scores.items():
        current_pref = getattr(user_pref, category)
        # Apply a weighted adjustment based on the score
        new_pref = current_pref + (0.1 * adjustment * score)
        # Ensure preferences stay within a reasonable range
        new_pref = max(0.5, min(new_pref, 2.0))
        setattr(user_pref, category, new_pref)
    
    db.commit()

def predict_preferences(user_id: int, db: Session) -> Dict[str, float]:
    """
    Retrieves the user's preference profile from the database.

    Args:
        user_id (int): The ID of the user.
        db (Session): The database session.

    Returns:
        Dict[str, float]: A dictionary of user preferences.
    """
    user_pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if not user_pref:
        # Return default preferences if none exist
        return {
            "scene": 1.0,
            "activities": 1.0,
            "emotions": 1.0,
            "atmosphere": 1.0,
            "colors": 1.0,
            "text": 1.0,
            "conciseness": 1.0
        }
    return {
        "scene": user_pref.scene,
        "activities": user_pref.activities,
        "emotions": user_pref.emotions,
        "atmosphere": user_pref.atmosphere,
        "colors": user_pref.colors,
        "text": user_pref.text,
        "conciseness": user_pref.conciseness
    }