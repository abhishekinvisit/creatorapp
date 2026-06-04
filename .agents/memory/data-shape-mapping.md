---
name: Data shape mapping
description: API snake_case vs frontend camelCase field names for opportunities
---

**API shape → frontend context shape for opportunities:**
- `brand_name` → `brandName`
- `brand_category` → `brandCategory`
- `cover_url` → `cover`
- `creators_needed` → `needed`
- `applicants_count` → `applicants`
- `languages` (array) → `language` (array)

**Mapper function:** `mapApiOpp()` in `frontend/src/screens/HomeFeed.js`

**Why:** The mock data uses camelCase and the existing UI components reference camelCase fields; the API follows Python snake_case convention; mapping keeps both working

**How to apply:** When adding new API opportunity fields, update mapApiOpp() in HomeFeed.js and the _opp_row() helper in server.py
