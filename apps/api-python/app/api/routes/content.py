from typing import Any
from fastapi import APIRouter, Header, HTTPException
from app.core.config import settings
from app.models.content import ApiResponse
from app.services.auth_service import is_authorized
from app.storage.json_store import JsonContentStore

router = APIRouter(tags=["content"])
store = JsonContentStore(settings.content_file)

@router.get("/api/content")
async def get_public_content() -> dict[str, Any]:
    return store.read()

@router.post("/api/admin/content", response_model=ApiResponse)
async def save_admin_content(
    payload: dict[str, Any],
    authorization: str | None = Header(default=None),
):
    if not is_authorized(authorization):
        raise HTTPException(status_code=401, detail="Unauthorized")
    store.write(payload)
    return ApiResponse(ok=True, message="Content saved")
