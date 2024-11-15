# Random Forest Regressor is a ML model used for regression tasks:
from sklearn.ensemble import RandomForestRegressor
from sqlalchemy.orm import Session
import numpy as np
import pickle
from apscheduler.schedulers.background import BackgroundScheduler

from models import User, UserInsight, Message, MessageInsight, MessageFeedback
from enums import MessageType

MODEL_PATH = 'preference_model.pkl'

# Initialize the scheduler
scheduler = BackgroundScheduler()

def prepare_training_data(db: Session):
    """
    Prepares training data for preference prediction.
    Separately processes user and assistant messages based on their purposes.
    """
    users = db.query(User).all()
    training_data = []
    labels = []

    for user in users:
        user_insights = db.query(UserInsight).filter_by(user_id=user.id).all()
        insights_dict = {insight.category.name: insight.score for insight in user_insights}

        # Process messages
        messages = db.query(Message).filter_by(user_id=user.id).all()
        for message in messages:
            message_insights = db.query(MessageInsight).filter_by(message_id=message.id).all()
            if message.type == MessageType.USER:
                # Use user message category values directly as features
                feature_vector = [insight.score for insight in message_insights]
                training_data.append(feature_vector)

                # Target labels are user insights
                label_vector = [insights_dict.get(insight.category.name, 1.0) for insight in message_insights]
                labels.append(label_vector)

            elif message.type == MessageType.ASSISTANT and message.feedback != MessageFeedback.NEUTRAL:
                # Use assistant message category values + feedback
                feature_vector = [insight.score for insight in message_insights]
                feature_vector.append(1 if message.feedback == MessageFeedback.POSITIVE else -1)
                training_data.append(feature_vector)

                # Target labels are user insights, adjusted by feedback
                label_vector = [insights_dict.get(insight.category.name, 1.0) for insight in message_insights]
                labels.append(label_vector)

    return np.array(training_data), np.array(labels)


def train_preference_model(db: Session):
    """
    Trains a preference prediction model and saves it to disk.
    """
    # Prepare the training data and labels
    training_data, labels = prepare_training_data(db)

    # Check if there is enough data to train the model
    if training_data.size == 0 or labels.size == 0:
        print("Not enough data to train the model.")
        return

    # Initialize the Random Forest Regressor
    # n_estimators=100: The number of trees in the forest
    # random_state=42: Ensures reproducibility of results
    model = RandomForestRegressor(n_estimators=100, random_state=42)

    # Fit the model to the training data
    # training_data: Features for training
    # labels: Target values for training
    model.fit(training_data, labels)

    # Save the trained model to a file using pickle
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    print("Model trained and saved successfully.")

def schedule_model_training(db_session):
    """
    Schedules the model training to run every day.
    """
    # Schedule the train_preference_model function to run every day
    # args=[db_session]: Pass the database session as an argument to the function
    scheduler.add_job(train_preference_model, 'interval', days=1, args=[db_session])
    scheduler.start()
