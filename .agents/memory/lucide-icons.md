---
name: Lucide icons
description: Instagram and Youtube icons removed from lucide-react
---

**Rule:** Do NOT import Instagram or Youtube from lucide-react — they were removed in a recent version

**Fix:** Use inline SVGs for both icons wherever needed (already done in CreatorProfileBrandView.js, MyProfile.js, EditProfile.js, OpportunityDetails.js, ReelCard.js)

**How to apply:** When adding new components that need these social icons, copy the inline SVG from any existing file that already has them.
