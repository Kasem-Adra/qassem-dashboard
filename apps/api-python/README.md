# Qassem.net Python API

FastAPI backend for the Qassem.net platform.

## Run locally

```bash
cd apps/api-python
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /api/health`
- `GET /api/content`
- `POST /api/admin/login`
- `POST /api/admin/content`
- `POST /api/auth/logout`

## Dashboard

The dashboard sends content to `/api/admin/content`.
The public website reads from `/api/content`.
