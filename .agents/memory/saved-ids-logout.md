---
name: savedIds logout behavior
description: Creator's saved opportunity IDs are per-user scoped in localStorage
---

## Rule
`savedIds` are now per-user: localStorage key is `ollcollab_saved_${userId}`. On logout, `savedIds` is cleared to `[]`. On login/session restore, they are loaded from the user-specific key.

**Why:** Previously the global key `ollcollab_saved` shared saved opportunities across all creators on the same device — every creator saw every other creator's bookmarks.

**How to apply:**
- `savedKey(userId)` helper function in AppContext returns the localStorage key; returns `null` if no userId yet
- `toggleSave(id)` uses `currentUserId` to write to the right key — must be set before calling
- `logout()` calls `setSavedIds([])` and also explicitly clears avatar/logo from user state
- `savedCreatorIds` (brand feature, Set) always resets on logout — stored in memory only, re-fetched from API on next brand login
