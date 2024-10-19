from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize the rate limiter here
limiter = Limiter(key_func=get_remote_address, default_limits=["3/second", "120/minute"])