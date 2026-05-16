from fastapi import APIRouter

router = APIRouter(tags=["system"])

@router.get("/api/health")
async def health():
    return {
        "ok": True,
        "service": "Qassem.net Python API",
        "status": "healthy",
    }
