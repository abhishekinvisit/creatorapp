---
name: No mock data in state
description: AppContext no longer seeds state with mock data — all lists start empty and are filled from the API.
---

## Rule
All AppContext state arrays (`opportunities`, `applications`, `threads`, `notifications`, `activePosts`) initialise as `[]`, not from mockData imports. The only mockData imports that remain are `DEFAULT_USER` (user shape template) and `CATEGORIES` (HomeFeed UI filter labels) — both are UI constants, not data.

**Why:** The old pattern seeded mock data on load, so real DB data never fully replaced it. Screens showed fake brands/opportunities even when real data existed.

## How to apply
- `mergeOpportunities(realOpps)` now calls `setOpportunities(realOpps)` — a full replacement, not a merge.
- `logout()` resets all arrays to `[]` and clears localStorage saved key (`ollcollab_saved`).
- `savedIds` is persisted to `localStorage` under key `ollcollab_saved` (survives refresh, cleared on logout).
- `Messages.js` and `Notifications.js` always call `setThreads`/`setNotifications` from API — no `if (!data.length) return` guard.
- `BrandsList.js` and `SearchScreen.js` derive unique brands from `opportunities` in context (no BRANDS mock import).
- `MyProfile.js` Share button calls `navigator.share` / clipboard with URL `${origin}/brand/creator/${currentUserId}`.
