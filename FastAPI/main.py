from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware
from fastapi.responses import PlainTextResponse, JSONResponse
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

from routers import assistant, auth, users
from database import engine
import models

from rate_limiter import limiter

# Adding CORS middleware before other middlewares
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

# Including routers:
app.include_router(assistant.router)
app.include_router(auth.router)
app.include_router(users.router)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom exception handler for Pydantic validation errors.
    """
    errors = []
    for error in exc.errors():
        # Construct a user-friendly field name
        field = " -> ".join([
            str(elem).replace('_', ' ').capitalize() for elem in error['loc'] if elem != 'body'
        ])
        
        # Get the error message
        message = error['msg']
        
        # Remove ': Type' from the message
        # Find the position of ': ' if it exists
        colon_pos = message.find(': ')
        if colon_pos != -1:
            # Remove everything from ': ' onwards
            message = message[:colon_pos]
        
        # Capitalize the message
        message = message.capitalize()
        
        errors.append(f"{field}: {message}")
    # Combine all error messages into one string
    friendly_message = " ".join(errors)
    return JSONResponse(
        status_code=422,
        content={"detail": friendly_message}
    )

@app.get("/", response_class=PlainTextResponse, include_in_schema=False)
async def root():
    return "Welcome to the In-Sight API! You can send requests to this URL. For documentation, please visit https://api.in-sight.ai/docs."

# TODO: Incorporate Video
# TODO: Incorporate NLP & ML
# TODO: Incorporate RealTime
# TODO: After RealTime, Endpoint to change voice type, detail length, voice speed

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=8000)
"""
Run the backend:
cd FastAPI
source .venv/bin/activate
uvicorn main:app --reload
"""
