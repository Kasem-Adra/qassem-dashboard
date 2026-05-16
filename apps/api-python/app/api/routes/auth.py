from fastapi import APIRouter, Header, HTTPException
from app.models.content import LoginRequest, LoginResponse, ApiResponse
from app.services.auth_service import login, logout

router = APIRouter(tags=["auth"])

@router.post("/api/admin/login", response_model=LoginResponse)
async def admin_login(payload: LoginRequest):
    token = login(payload.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid password")
    return LoginResponse(ok=True, token=token)

@router.post("/api/auth/logout", response_model=ApiResponse)
async def admin_logout(authorization: str | None = Header(default=None)):
    logout(authorization)
    return ApiResponse(ok=True, message="Logged out")
