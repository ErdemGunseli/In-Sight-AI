import re
import requests

from sqlalchemy.exc import IntegrityError

from exceptions import UserExistsException
from dependencies import db_dependency
from schemas import CreateUserRequest
from models import User
from security import bcrypt_context


def create_user(db: db_dependency, user_data: CreateUserRequest) -> User:
    # Hashing the password:
    password_hash = bcrypt_context.hash(user_data.password)

    # Creating a new user instance with their name formatted, and the hashed password instead of plaintext:
    new_user = User(**user_data.model_dump(exclude={"password", "name", "postcode"}), name=user_data.name.title(), password=password_hash)

    try: 
        # Returning the new user (will be converted to the response model at the endpoints):
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user
        
    except IntegrityError as e: 
        raise UserExistsException