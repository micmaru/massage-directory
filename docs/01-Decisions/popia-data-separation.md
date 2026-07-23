# POPIA PUBLIC/PRIVATE DATA SEPARATION

Status: open — decided to defer, design not started

Source: Session Log — 7 July 2026 open item 3; 11 July 2026 decision 8; 18 July 2026; 21 July 2026 (sequencing)

**Requirement**: private supplier data must be structurally separated from customer-facing data. Firestore is flat — this needs a separate collection/subcollection or a field-level split, not everything commingled in one publicly-readable `suppliers/{phone}` document. Data shown on the frontend (e.g. phone number) must not render in the open by default — click-to-reveal or a separate interaction.

**Current state, confirmed 18 July**: no structural separation exists. Everything — including fields already marked "admin only" in the Field Register (`addressLine1`, `facePhotoPath`, `firstName`, `lastName`, `gender`, `vetNotes`) — lives in one flat document. "Admin only" is enforced purely by frontend display convention, not by any data-layer restriction, so it says nothing about what a direct Firestore query or a scrape can read.

**Scope so far**: at minimum `firstName`, `lastName`, `gender`, `addressLine1`, `facePhotoPath`, `vetNotes` are candidates for the private store. Structure (separate collection vs subcollection), security-rules impact, and every read/write path across register.html / dashboard.html / gallery.html / admin.html all still need designing.

**Status history**: deferred to Phase 2 pending legal/developer input (11 July) → reversed to "build it now, starting from register.html", with the 24 July internal-completion and 31 July launch targets explicitly accepted as at risk (18 July) → deferred again so register.html's known-issue list could be closed first (21 July).

**Current position**: deliberately deferred, not abandoned. Remains the explicit next major topic, as a dedicated standalone session. Johan connected it to competitive risk — "as soon as the platform is launched, my competitor will immediately hunt to see what we have done".
