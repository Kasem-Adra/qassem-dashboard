import secrets
from app.core.config import settings

# Simple in-memory token for starter version.
# Replace with signed JWT or database sessions in production.
_ACTIVE_TOKENS: set[str] = set()

def login(password: str) -> str | None:
    if password != settings.admin_password:
        return None
    token = secrets.token_urlsafe(32)
    _ACTIVE_TOKENS.add(token)
    return token

def is_authorized(auth_header: str | None) -> bool:
    if not auth_header:
        return False
    if not auth_header.startswith("Bearer "):
        return False
    token = auth_header.removeprefix("Bearer ").strip()
    return token in _ACTIVE_TOKENS

def logout(auth_header: str | None) -> None:
    if not auth_header or not auth_header.startswith("Bearer "):
        return
    token = auth_header.removeprefix("Bearer ").strip()
    _ACTIVE_TOKENS.discard(token)
