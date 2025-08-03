from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

router = APIRouter()

@router.get("/", response_class=PlainTextResponse, include_in_schema=False)
async def root():
    return "Welcome to the In-Sight API! You can send requests to this URL. For documentation, please visit https://api.in-sight.ai/docs."