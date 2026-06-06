---
name: Categories system
description: How the 50 master categories are stored, served, and used across the app
---

## Rule
All category lists across the app must use `MASTER_CATEGORIES` from `@/data/categories`. Never add a hardcoded local category array.

**Why:** Previously every screen had its own short list (6–15 items). Now there are 50 canonical categories shared everywhere.

**How to apply:**
- Import `{ MASTER_CATEGORIES }` for single-select or multi-select grids
- Import `{ FILTER_CATEGORIES }` (= ["All", ...MASTER_CATEGORIES]) for horizontal filter bars (HomeFeed, BrandDiscover)
- `CREATOR_CATEGORIES` and `BRAND_CATEGORIES` both alias `MASTER_CATEGORIES` for backward compat
- The DB has a `categories` table seeded via `MIGRATIONS` in database.py; `GET /api/categories` serves it
- `categoriesApi.list()` in api.js fetches from API with a module-level cache
- Screens with pill grids (CreatorOnboarding, BrandOnboarding, EditProfile, AddRequirements, BrandPostDetail) include a search input to filter all 50 pills
