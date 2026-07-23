# MAP

Status: locked

104. Map pins: Red teardrop T = therapist, Amber teardrop S = spa — FIXED, never change
105. Therapist GPS: suburb centroid — never device GPS.
    - **NOTE ADDED 23 Jul 2026:** unchanged. This governs the **public map pin only** — the therapist pin is still a jittered suburb/area centroid and device GPS is never used for it. The 21 Jul 2026 silent device-GPS capture writes to separate **admin-only** fields `registrationGpsLat` / `registrationGpsLng`, which are never read by the public map. See silent-gps-capture.md and map-pin-jitter.md.
106. Spa GPS: device GPS button on registration screen
107. GPS fallback: suburb centroid if street address geocoding fails
108. Separate MarkerClusterer instances per supplier type
