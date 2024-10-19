from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from dotenv import load_dotenv
import uvicorn


# Loading environment variables and declaring FastAPI instance before local imports:
load_dotenv()
app = FastAPI()

import os
import sys
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routers import assistant, auth, users
from database import engine
import models

from rate_limiter import limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Creating tables if they don't already exist:
models.Base.metadata.create_all(bind=engine)


# Including routers:
app.include_router(assistant.router)
app.include_router(auth.router)
app.include_router(users.router)


# Adding client domains to avoid CORS blocking:
app.add_middleware(CORSMiddleware, allow_origins=json.loads(os.getenv("CORS_ORIGINS")), 
                   allow_credentials=True, allow_methods=['*'], allow_headers=['*'])


# TODO: Incorporate RealTime
# TODO: After RealTime, Endpoint to change voice type, detail length, voice speed


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=8000)
"""
Run the backend:
cd FASTAPI
uvicorn main:app --reload
"""
