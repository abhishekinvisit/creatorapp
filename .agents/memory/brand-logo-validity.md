---
name: Brand logo validity check
description: Brand logo must be validated as a real image before rendering as <img> or saving to API
---

## Rule
`user.brand.logo` is an empty string `""` when no logo has been uploaded. DEFAULT_USER has `brand.logo = "GLOW"` (a text abbreviation for the BrandLogo initials component — NOT a valid image src). Never treat any truthy string as a valid image src.

**Why:** The bug: `b.logo ? <img src={b.logo}> : <BrandLogo>` — when `b.logo = "GLOW"`, the img renders with a broken src instead of the initials fallback. Similarly, EditProfile.js initialized avatar from `user.brand.logo` and then `save()` sent "GLOW" as `logo_data` to the API, overwriting any real logo.

**How to apply:**
- Use `const isValidImg = (s) => s && (s.startsWith("data:") || s.startsWith("http"))` before rendering `<img>` for brand logos
- In `AppContext.js mapBrandProfile`, only set `logo` from `p.logo_data` if it passes `isValidImg`; do NOT fall back to `prev.brand.logo` unless that also passes `isValidImg`
- In `EditProfile.js`, initialize `avatar` state with `isValidImg(user.brand.logo) ? user.brand.logo : ""`
- In `MyProfile.js` and any screen displaying a brand logo image, guard with `isValidImg` before using `<img>`
