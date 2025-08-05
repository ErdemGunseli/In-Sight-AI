from fastapi import HTTPException, status as st


class UserNotFoundException(HTTPException):
    def __init__(self, detail="Please log in with a valid account."):
        super().__init__(status_code=st.HTTP_404_NOT_FOUND, detail=detail)


class InvalidCredentialsException(HTTPException):
    def __init__(self, detail="Please check the email and password."):
        super().__init__(status_code=st.HTTP_401_UNAUTHORIZED, detail=detail)


class UserExistsException(HTTPException):
    def __init__(self, detail="A user with this email already exists. Please log in instead."):
        super().__init__(status_code=st.HTTP_409_CONFLICT, detail=detail)


class JWTException(HTTPException):
    def __init__(self, detail="Your authentication token has expired. Please log in again."):
        super().__init__(status_code=st.HTTP_401_UNAUTHORIZED, detail=detail)


class NoMessageException(HTTPException):
    def __init__(self, detail="Please type a message, record audio, or upload an image."):
        super().__init__(status_code=st.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


class UnprocessableMessageException(HTTPException):
    def __init__(self, detail="Please ensure your message is in a valid format."):
        super().__init__(status_code=st.HTTP_400_BAD_REQUEST, detail=detail)


class APIRequestException(HTTPException):
    def __init__(self, detail="Something went wrong while processing your request. Please try again later."):
        super().__init__(status_code=st.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)


class MessageNotFoundException(HTTPException):
    def __init__(self, detail="The specified message was not found."):
        super().__init__(status_code=st.HTTP_404_NOT_FOUND, detail=detail)


