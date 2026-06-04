---
name: Auth flow
description: Email/password JWT auth flow for OLLCOLLAB frontend + backend
---

**UX:** 2-step login — email first → check-email → then password (create or sign in)

**Token storage:** `localStorage.getItem("ollcollab_token")` — key is `ollcollab_token`

**Session restoration:** AppContext.restoreSession() runs on mount; calls /api/auth/me; sets isAuthed + onboardingComplete; authLoading=true until done

**Route guards:** AppRoute and OnboardingRoute both show AuthLoading spinner while authLoading=true (prevents redirect flash to login screen on refresh)

**Why:** Without authLoading guard, users get flashed to /login on every page refresh then redirected back — bad UX

**How to apply:**
- loginWithToken() in AppContext stores token + sets auth state
- logout() clears token + resets all state to mock defaults
- All protected API calls include `Authorization: Bearer <token>` header via api.js authHeaders()
