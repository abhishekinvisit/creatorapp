---
name: Mock data fallback
description: How mock and real data coexist in OLLCOLLAB
---

**Strategy:** Mock opportunities from mockData.js are always present as fallback; real DB opportunities are merged on top via mergeOpportunities()

**Mock IDs:** always start with "op-" (e.g. "op-1", "op-2")

**Real IDs:** UUIDs from PostgreSQL (e.g. "8c77ecc7-0219-4b28-bdd8-a0b1d80348b9")

**mergeOpportunities():** in AppContext.js — takes real opps array, filters out any mock entries whose IDs collide, prepends real opps

**Why:** Chicken-and-egg problem — creators see empty feed if no brands have posted yet; mock data keeps the feed populated until real content builds up

**How to apply:** As real content grows, can phase out mock data by clearing OPPORTUNITIES from initial state
