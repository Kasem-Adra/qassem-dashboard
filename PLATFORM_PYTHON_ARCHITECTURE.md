# Qassem.net Platform Architecture

## Goal

Qassem.net becomes a real digital systems platform:

- Public website
- Full dashboard CMS
- Python FastAPI backend
- API-driven content
- Maintenance mode
- Social links and logo management
- Future AI, analytics and automation modules

## Current Backend

`apps/api-python`

Modules:

- `auth`
- `content`
- `system`
- `storage`

## Next Modules

Recommended next steps:

- PostgreSQL or Supabase instead of JSON file
- JWT authentication
- Media upload service
- Analytics service
- AI insights service
- SEO automation
- Monitoring dashboard

## API Flow

Dashboard:
`POST /api/admin/content`

Public site:
`GET /api/content`

Login:
`POST /api/admin/login`
