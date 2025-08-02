from datetime import datetime
from uuid import uuid4
from pydantic import Field

def uuid_str():
    return str(uuid4())

def current_time():
    return datetime.utcnow()
