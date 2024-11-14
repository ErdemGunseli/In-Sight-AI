from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware
from fastapi.exceptions import RequestValidationError
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from dotenv import load_dotenv
import uvicorn

# Loading environment variables and declaring FastAPI instance before local imports:
load_dotenv()
app = FastAPI()

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from handlers import validation_exception_handler
from routers import root, assistant, auth, users
from database import engine
import models

from rate_limiter import limiter

# Adding CORS middleware before other middleware:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Creating tables if they don't already exist:
models.Base.metadata.create_all(bind=engine)

app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Including routers:
app.include_router(root.router)
app.include_router(assistant.router)
app.include_router(auth.router)
app.include_router(users.router)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
"""
Run the backend:
cd FastAPI
source .venv/bin/activate
uvicorn main:app --reload
"""
