---
name: savedIds logout behavior
description: Creator's saved opportunity IDs are intentionally kept on logout
---

## Rule
On logout, `savedIds` (creator's bookmarked opportunities, stored in localStorage under `ollcollab_saved`) is **NOT cleared**. Only `savedCreatorIds` (brand's saved creator Set) is reset to `new Set()`.

**Why:** UX continuity — creators should see their bookmarks when they log back in on the same device.

**How to apply:** Don't add `setSavedIds([])` or `localStorage.removeItem(SAVED_KEY)` to the `logout()` function in AppContext.
