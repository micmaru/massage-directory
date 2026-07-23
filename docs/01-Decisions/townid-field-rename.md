# `area` FIELD RETIRED — `townId` IS THE REPLACEMENT

Status: locked

Source: Session Log — 12 June 2026, decision 1 (commits da3fc5c, eeef2f9)

`area` retired permanently and renamed `townId` across register.html, register-spa.html, dashboard.html and location-cascade.js.

`admin-supplier.html`'s `area` select was separately renamed to `locationArea` — in that file the control was always the area grouping, not the town.

Known consequence, unresolved: suppliers registered before 12 June 2026 hold `area`, not `townId`, so admin-supplier.html's town dropdown will not pre-fill for them — risk of an admin overwriting location with a blank town on save.
