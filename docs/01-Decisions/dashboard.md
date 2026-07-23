# DASHBOARD — LOCKED ARCHITECTURE

Status: locked — items 64, 65, 68, 71, 134, 135 superseded (see notes on each item below). Items 66, 67, 69, 70 remain current.

64. ~~Single `dashboard.html` detects `supplierType` on load — no separate dashboard-spa.html~~ **SUPERSEDED 18 July 2026:** separate `dashboard.html` (therapist) and `dashboard-spa.html` (spa, not yet built). The two dashboards differ enough that a single branching file means constant runtime "which fields for which type" checks. Gallery stays a single shared `gallery.html`. See 18 July session log.
65. ~~Therapist dashboard: 8 sections. Spa dashboard: 9 sections.~~ **SUPERSEDED** — superseded by spa-eight-sections.md — S9 Ownership dissolved 16 Jun, spa is 8 sections. Therapist 8 sections is unchanged.
66. `associationMembership` is multi-select for BOTH therapist and spa — reads dynamically from offerings collection
67. No progress bar on dashboard
68. ~~Services section split deferred to Phase D~~ **SUPERSEDED** — built 12 Jul — see section7-subaccordions.md.
69. `displayName` move: from Personal section to About section — editable
70. "Sign Out" button label: must read "Back to Main Menu" — LOCKED
71. ~~Photo storage path: `suppliers/{phone}/photos/{filename}` — LOCKED~~ **SUPERSEDED — corrected 23 Jul 2026.** Storage paths use the Firebase Auth **`uid`**, never the phone number. The phone number is the `suppliers` document ID only.
    - Verification photo: `suppliers/{uid}/id/` — private folder, read requires auth. See verification-photo.md.
    - Gallery: `suppliers/{uid}/gallery/` — see gallery-m11.md.
    - Phone-number storage paths were the root cause of issue #44 (403 `storage/unauthorized`).
134. **SUPERSEDED** — superseded by golden-rule-locked-fields.md — 18 Jul unified rule, GR01 never built. Original text retained below for audit trail.
GOLDEN RULE 01 (Therapist) — Section 1 (Personal) becomes permanently locked the moment it is first SAVED (not submitted) — locked by design, both in the UI and the backend. The therapist can still see the section but cannot open or access it to edit — visible but not clickable/reachable, not merely a save-blocked field. Never editable by the therapist again after that save. Only admin can change it. This governs the registration record.
135. **SUPERSEDED** — superseded by golden-rule-locked-fields.md — 18 Jul unified rule, GR01 never built. Original text retained below for audit trail.
GOLDEN RULE 02 (Therapist) — Section 8 (Photos) verification face photo can be freely uploaded, deleted, and replaced any number of times DURING active registration (pre-submit) — no restriction. The moment registration is SUBMITTED, the face photo becomes permanently locked — can never be changed again by the therapist, ever, only admin. Both golden rules deliberately decided and locked together, 17 July 2026, for the M3 therapist dashboard build - do not re-litigate. Spa equivalents (M4) to be decided separately, not assumed to be identical.
