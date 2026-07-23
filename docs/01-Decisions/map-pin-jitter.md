# PUBLIC MAP PIN — JITTER AND MINIMUM SEPARATION

Status: locked

Source: Session Log — 21 July 2026 (location/address design, piece 3; commits 4e4e1b7, da75915, dda5b9d)

The public `gpsLat`/`gpsLng` pin is never a precise geocode.

- `addressLine1` filled → geocode the address, then **jitter 200 m** before writing to public `gpsLat`/`gpsLng`.
- `addressLine1` blank → geocode the suburb (or `locationArea` if suburb is unset — the informal-settlement path), then **jitter 500 m**.
- **Minimum 100 m separation** enforced between any two suppliers' jittered pins in the same suburb/area: `jitterWithSeparation()` queries peers sharing the same `suburb`/`locationArea` and retries, max 10 attempts, accepting the closest result if the cap is reached rather than blocking Submit.
- Helpers: `jitterCoordinate()`, `haversineMeters()`.
- The separation query keys off the same geo-target field actually used (suburb or locationArea), not always suburb.

This restores the locked "therapist: suburb or area centroid, never exact address" privacy rule, which the previous live-geocode behaviour had been violating: a precise coordinate IS the address in a different format, regardless of whether `addressLine1` is ever displayed.
