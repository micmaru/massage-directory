# REQUIRED SECTIONS AND FIELD-LEVEL GATES

Status: locked

Source: Session Log — 15 June 2026 decision 12; 16 June 2026 decisions 8-9; 17 July 2026 (required-sections audit)

**Section-level requirements**
- Therapist Submit Registration requires: S1 + S3 + S5 + S7 + S8.
- Spa Submit Registration requires: S1 + S3 + S7 + S8 — S5 (About) is NOT required for spa.

**Field-level gates (17 July 2026 — first field-level, as opposed to section-level, gates on the platform)**
- S5 `displayName`: Save is blocked (with an inline message) if blank. The rest of Section 5 stays optional. Label reads "Display Name / Alias (Required)" — no bare asterisks.
- S3: Save blocked with an inline error unless province, town, and (suburb OR locationArea) are all filled. (Added 21 July 2026 — saveAccSection(3) previously had no validation at all.)
- S7.1 Genders Served: no block. Defaults to "both" if nothing is selected at Save. Accepted risk, Johan's call — "both" is a genuinely neutral fallback, unlike a specific style or treatment. Needs no required marker since it can never be incomplete.
- S7.2 Massage Styles: heading reads "(Select at least one)". Save blocked — no write, no done-state — if zero ticked.
- S7.3 Traditions: optional, no block.
- S7.4 Treatments: heading reads "(Select at least one)". Save blocked if zero ticked.
- S7.5 Service Offerings: optional, unchanged.
- S8 Photos: `saveAccSection(8)` checks `facePhotoPath` (existing value or freshly selected file) before marking done. No photo → inline "Verification photo required", section stays not-done, Submit stays locked.

**No silent defaults principle**
A silent default would put an unchosen, specific claim (e.g. "Aromatherapy") on a real listing, contradicting the platform's trust positioning. Instead of defaults, a selectable **"General"** option was added as a real choice in `massageStyles`, `traditions` and `treatments` (three offerings documents, `sortOrder: 0` so it sorts first, `visibleTo: [therapist, spa]`, `launchActive: true`).

**S4 ordering**: the "Mobile massage available" toggle and km travel-distance field appear AFTER Amenities — before that they read as being about the therapist's own premises rather than her travelling to the customer.
