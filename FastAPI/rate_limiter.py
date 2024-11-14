from slowapi import Limiter
from slowapi.util import get_remote_address

# Initializing the rate limiter:
limiter = Limiter(key_func=get_remote_address, default_limits=["3/second", "120/minute"])
