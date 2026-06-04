---
name: API proxy
description: How frontend reaches backend in development
---

**Setup:** craco.config.js proxies `/api` → `http://localhost:8000`

**Frontend calls:** always use `/api/...` relative paths — never `http://localhost:8000`

**Production:** the proxy is development-only; in production, frontend and backend need to be on the same domain or CORS configured

**Why:** Replit preview is a proxied iframe; backend runs on port 8000, frontend on 5000; the craco proxy bridges them without CORS issues in dev

**How to apply:** frontend/src/lib/api.js uses `const BASE = "/api"` — keep it that way
