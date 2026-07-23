# LOCATION CASCADE — SHARED MODULE

Status: locked

Source: Session Log — 11 June 2026 (Session 2), decisions 1-6; 11 June 2026 decisions 1-2; 12 June 2026 decisions 2-3

1. One shared `location-cascade.js` used by register.html, register-spa.html and dashboard.html — never duplicate the cascade per file. Lives in the project root (no `js/` folder).
2. `locationArea` saves `areaName` (the display name), not the document ID — locked, no change.
3. Six location fields saved: `province`, `provinceName`, `townId`, `townName`, `locationArea`, `suburb` — both ID and display-name fields kept.
4. Area/suburb mutual exclusion — select one, the other hides; clearing the selection restores both.
5. No areas exist for the town: the area field is hidden entirely.
6. Unpicked field saves as an empty string, never `null`.
7. Spas keep `locationArea` — customers search by area.
8. Admin vetting card displays location using display names, never Firestore document IDs.
9. Live Firestore verified: `locations_provinces` / `locations_towns` / `locations_suburbs` use `name` for their own display name; `locations_areas` uses `areaName`.
10. `admin-supplier.html` has its own legacy name-based cascade — NOT wired to the shared module. Separate session to fix.
