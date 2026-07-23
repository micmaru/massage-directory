# M11-GALLERY — SEPARATE FLOW

Status: locked

Source: Session Log — 11 July 2026 decision 7; 14 July 2026 (built, Briefs 1-4)

Marketing/gallery photos are SPLIT OUT of registration and dashboard entirely into a standalone flow: `gallery.html`, reached via the hamburger menu on index.html.

1. **OTP required every single time** — first upload and every later change. No session-token skip, ever. First flow on the platform with no session-skip path at all. Rationale: a fresh OTP guarantees a live Firebase session, removing the entire auth-timing-race bug class by design.
2. **No admin vetting on gallery photos** — would not scale past ~300 suppliers. Instead: an on-screen warning before upload ("no sexually explicit photos; violation = account deletion, no refund"). Liability shifts to the T&Cs. This supersedes the previously-parked "re-vetting trigger for post-launch profile edits" design session, for photos specifically.
3. **Warning screen**: first-visit-only interstitial with a checkbox; every visit after, no interstitial, with the warning text pinned permanently at the top of the gallery screen. `galleryTermsAcknowledgedAt` written via `serverTimestamp()`, keyed by Auth UID.
4. **`galleryPhotos`** is an array of OBJECTS `{ path, visible }`, max 4 entries — not strings. Thumbnails fetch a live `getDownloadURL()` at render time, never persisted (same pattern as `facePhotoPath`). Upload/toggle/delete mutate an in-memory array; only "Save section" writes to Firestore. Delete is the exception and fires immediately (Storage `deleteObject()` + splice).
5. Storage filenames are prefixed with `Date.now()` — two uploads of the same original filename (IMG_0001.jpg) would otherwise overwrite one object while creating two array entries pointing at it.
6. **Storage path `suppliers/{uid}/gallery/` is PUBLIC read** — every uploaded gallery photo is world-readable by URL, including ones toggled `visible: false`. The `visible` flag controls frontend rendering, not file reachability. Same posture as the existing `photos/` path, and the reason the explicit-content warning exists. On the record as a decision, not an oversight.
7. Rides the existing 8-hour `frontendRefreshHours` cadence.
8. Spa equivalent will be `gallery-spa.html`, mirroring this file once it is fully solid.
