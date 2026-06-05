---
name: addApplication signature
description: The shape of the object passed to addApplication in AppContext
---

## Rule
`addApplication` accepts a **single full object**, not positional args.

```js
addApplication({
  id: appRow.id,
  opportunityId: appRow.opportunity_id,
  brandName: "...",
  opportunityTitle: "...",
  appliedOn: "formatted date string",
  status: "applied",
  note: "...",
})
```

**Why:** Changed from old `(opportunityId, brandName)` signature when ApplyDialog was updated to use the real API response. Any caller must pass the full shape.

**How to apply:** Only ApplyDialog calls `addApplication`. If adding new entry points, always pass all fields.
