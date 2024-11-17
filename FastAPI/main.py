from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware
from fastapi.exceptions import RequestValidationError
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from dotenv import load_dotenv
import uvicorn
import os
import sys
from rich.console import Console
from rich.table import Table
from rich.progress import track
import time

# Loading environment variables and declaring FastAPI instance before local imports:
load_dotenv()
app = FastAPI()

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

from apscheduler.schedulers.background import BackgroundScheduler
from services.ml_services.preference_prediction import schedule_model_training, shutdown_scheduler

# Initialize scheduler - TODO: Local only, too memory-expensive for Render hosting:
scheduler = BackgroundScheduler()

# Create a Console instance
console = Console()

@app.on_event("startup")
def startup_event():
    print("\033[1;32mApplication startup successful.\033[0m")
    
    # Scheduling the training:
    schedule_model_training(scheduler)
    print("\033[1;34mScheduler started and model training job scheduled.\033[0m")

@app.on_event("shutdown")
def shutdown_event():
    shutdown_scheduler(scheduler)
    print("\033[1;31mApplication shutdown\033[0m")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
