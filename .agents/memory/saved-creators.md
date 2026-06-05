---
name: Saved creators feature
description: Backend table, API endpoints, and frontend state for brand saving creators
---

## Rule
Brands can save/unsave creators. State lives in AppContext as a `Set<string>` (`savedCreatorIds`). Loaded from API on brand login/session restore. Persisted to DB via `saved_creators` table.

**Why:** Brands need a shortlist of creators across sessions; creators don't need this feature.

**How to apply:**
- Backend: `saved_creators(id, brand_id, creator_id, saved_at)` with `UNIQUE(brand_id, creator_id)` and `ON CONFLICT DO NOTHING`
- API: `savedCreatorsApi.list() / .save(creatorId) / .unsave(creatorId)` in `frontend/src/lib/api.js`
- AppContext: `savedCreatorIds` (Set), `isCreatorSaved(id)`, `saveCreator(id)`, `unsaveCreator(id)`, `savedCreatorsCount`
- `loadSavedCreators()` called in both `loginWithToken` and `restoreSession` when `account_type === "brand"`
- Optimistic UI: Set updated immediately, API call fires async
- Route: `/brand/saved-creators` → `SavedCreatorsScreen`
- BrandDashboard and MyProfile brand view both show `savedCreatorsCount` as a clickable stat
