---
name: Tailwind version
description: Tailwind must stay at v3.4.17 in this project
---

**Rule:** Tailwind CSS must remain at v3.4.17 — do NOT upgrade to v4

**Why:** Tailwind v4 completely changed its PostCSS plugin API; upgrading breaks the build with PostCSS errors that are non-trivial to fix

**How to apply:** When adding dependencies, never `npm install tailwindcss@latest` or `tailwindcss@^4`. Pin to `tailwindcss@3.4.17` if reinstall needed.
