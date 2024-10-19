from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn

# Loading environment variables and declaring FastAPI instance before local imports:
load_dotenv()
app = FastAPI()

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
print("Current working directory:", os.getcwd())
print("Files and directories:", os.listdir())

from routers import assistant, auth, users
from config import read_config
from database import engine
import models

from rate_limiter import limiter
app.state.limiter = limiter

# Creating tables if they don't already exist:
models.Base.metadata.create_all(bind=engine)


# Including routers:
app.include_router(assistant.router)
app.include_router(auth.router)
app.include_router(users.router)


# Adding client domains to avoid CORS blocking:
origins = read_config("cors_origins")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, 
                   allow_methods=['*'], allow_headers=['*'])


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
