---
name: Backend stack
description: FastAPI + asyncpg + PostgreSQL setup details for OLLCOLLAB
---

**Stack:** FastAPI + asyncpg + PostgreSQL (Replit managed, via DATABASE_URL env var)

**Auth:** python-jose (JWT), passlib[bcrypt] (password hashing), 30-day access tokens

**Key files:**
- `backend/server.py` — all API routes under /api prefix
- `backend/database.py` — schema init + asyncpg connection pool
- `backend/auth.py` — JWT create/decode, password hash/verify

**Why asyncpg:** async native PostgreSQL driver; statement_cache_size=0 required for PgBouncer compatibility on Replit

**Schema tables:** users, creator_profiles, brand_profiles, opportunities, applications, threads, messages, notifications

**How to apply:**
- DATABASE_URL is a Replit secret, never hardcode
- JWT_SECRET is a Replit secret
- Pool is global singleton in database.py, initialized on startup event
