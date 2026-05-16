from typing import Any
from pydantic import BaseModel, Field

class ApiResponse(BaseModel):
    ok: bool = True
    message: str | None = None

class LoginRequest(BaseModel):
    password: str = Field(min_length=1)

class LoginResponse(ApiResponse):
    token: str | None = None

ContentPayload = dict[str, Any]
