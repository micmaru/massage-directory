# REQUIRED / LOCKED / PUBLIC — EXPLICIT FIELD ATTRIBUTES

Status: locked

Source: Session Log — 18 July 2026 (Required/Locked/Public)

Required, Locked and Public are tracked as three separate, explicit attributes on every field — replacing inconsistent free-text notes.

Reason: "LOCKED post-registration" in the Field Register had gone stale on at least three fields (`province`, `suburb`, `displayName`) without anyone catching it, precisely because Required and Locked were never separate attributes.

Corrections made in the same pass:
- `province` / `suburb` — fully editable, NEVER locked. A therapist relocates between provinces; this is expected to be the most-edited section on the platform.
- `displayName` — required, never locked, public. The stale "locked" note contradicted the entire reason it was moved out of Section 1 on 11 July (issue #30).

The complete section-by-section Required/Locked table lives in **`docs/MM-Field-Register-v3.md`** (supersedes v2), which also flags `addressLine1`, `firstName`, `lastName`, `gender` and `facePhotoPath` as PENDING REDESIGN under the private-data separation work.
