# addressLine1 + SERVER-SIDE GEOCODING

Status: locked

Source: Session Log — 12 July 2026 item 3 (toggle removed); 18 July 2026 (geocode bug found); 21 July 2026 (piece 2-3, commits 2386408, 22a3556, 24f0a18)

**`addressLine1`**
- Stays in Section 3 (not moved to Section 1). Optional, not required.
- Note text: "Optional — filling this in improves your visibility on the map. Precise address will never be shown to customers."
- The "Show full address publicly" toggle was REMOVED from register.html (12 July) — it directly contradicted the field's own helper text a few lines above it. Address is unconditionally admin-only in register.html. Confirmed a dead control, not a live leak: profile.html never rendered a street address publicly at any point.
- OUTSTANDING: dashboard.html and admin-supplier.html both still have their own address-visibility toggles. admin-supplier.html's may be an intentional admin override — needs a decision, not an automatic removal.

**Province/town/suburb/area dropdowns** — unchanged, public, and remain the fallback source for the public map pin.

**Geocoding is server-side.**
- The Google Geocoding API rejects HTTP-referrer-restricted keys entirely (REQUEST_DENIED). This is a hard Google constraint, not a config error: a browser-callable geocoding key can never be properly restricted, because the calling IP is the end user's device, not a fixed server. This forced an architecture change, not just a config fix.
- New callable Cloud Function `geocodeAddress` (us-central1, auth-gated, matching the `generateSupplierNumber` pattern). It calls Google server-side with a separate IP-restricted key ("MassageMap Geocoding Key", Geocoding API only), referenced via `functions/.env` as `GEOCODING_API_KEY` and stored in the macOS Passwords app — never in the repo.
- `window.GOOGLE_MAPS_GEOCODING_KEY` removed from firebase-config.js entirely — no geocoding key ships to the browser. `window.GOOGLE_MAPS_API_KEY` (map display, referrer-restricted) is untouched.
- `geocodeAddress()`'s silent catch block now logs thrown errors AND Google's non-OK API statuses; it previously swallowed both.
