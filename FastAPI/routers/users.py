from fastapi import APIRouter, status as st
from starlette.requests import Request

from rate_limiter import limiter
from services import user_service as us
from schemas import CreateUserRequest, UserResponse
from dependencies import user_dependency, db_dependency


router = APIRouter(prefix="/user", tags=["User"])


@router.post("/", response_model=UserResponse, status_code=st.HTTP_201_CREATED)
@limiter.limit("")
async def create_user(db: db_dependency, user_data: CreateUserRequest, request: Request):
    return us.create_user(db, user_data)


@router.get("/", response_model=UserResponse, status_code=st.HTTP_200_OK)
@limiter.limit("")
async def read_current_user(user: user_dependency, request: Request):
    return user

@router.delete("/", status_code=st.HTTP_204_NO_CONTENT)
@limiter.limit("")
async def delete_user(db: db_dependency, user: user_dependency, request: Request):
    us.delete_user(db, user)
