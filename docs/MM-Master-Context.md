# MassageMap — Master Context v67
**Version:** 67 | **Date:** 2026-07-23 | **Author:** Johan Cilliers | **Confidential**
**File path (repo-relative): docs/MM-Master-Context.md — always read this file at session start.**

**v67 STRUCTURAL CHANGE — 23 July 2026.** This file was restructured. It is now an index, not a container. The full v66 file — every decision, every session log, every field table, unchanged and byte-for-byte — is preserved at `docs/MM-Master-Context-ARCHIVE-thru-22Jul2026.md`. Nothing was deleted. The decision record was split into one file per decision under `docs/01-Decisions/`, and the other long sections now point at the documents that already own them.

---

## QUICK STATUS — READ THIS FIRST

| Item | Status |
|---|---|
| Launch target | 31 July 2026 |
| Current phase | register.html fragility review (22 July) — Finding 1 (resume-redirect keyed off the `pending_registrations` mirror instead of canonical `suppliers.registrationComplete`) FIXED + committed (b019cd8) — fast-forward merged 929ebec..b019cd8 to origin/main and pushed; branch feature/2026-07-22-register-fragile-fixes deleted; Finding 2 (missing `resolveIdentity()` in `verifyOtp()`) assessed and dismissed as a mischaracterisation; M1 diagram phone-entry box label corrected. Prior register.html known-issue list remains CLOSED (21 July — address/gpsLat/jitter chain, cellNumberTwo, Section 3 validation, lock-status verification all done and tested). |
| Next session starts with | POPIA public/private supplier split — DEDICATED SESSION, standalone focus, not bundled with further register.html work unless something new surfaces. Design not yet started (candidates already identified: firstName, lastName, gender, addressLine1, facePhotoPath, vetNotes — see prior session's notes). |
| Primary blocker | None blocking register.html (closed). POPIA split design is the open item ahead of that dedicated session. |
| Also carried forward (not next session's focus unless raised) | Silent device GPS capture UI (decided, not yet built); admin.html login/permission fix (found this session, not fixed); `showCellNumberTwo` public-display build; BulkSMS credits at zero. (M1 diagram `resolveIdentity()`-after-OTP addition CLOSED-BY-DECISION 22 July — see follow-up note.) |
| Google Cloud billing | DONE — Blaze plan, credit card attached, confirmed 9 June 2026 |
| BulkSMS credits | AT ZERO — buy before Stage 2 |
| Free trial expiry | 6 July 2026 — credit card attached, should auto-continue |

---

## Decisions Index

One file per decision under `docs/01-Decisions/`. 65 files. Status shown is the status recorded inside each file — read the file itself before relying on any decision.

**Status key:** `locked` = decided, do not re-litigate · `superseded` = replaced, kept for audit trail only, do not use · `open` = not yet decided

- [locked] addressline1-and-geocoding.md — `addressLine1` optional; server-side geocoding via `geocodeAddress` callable; visibility toggle removed
- [locked] admin-uid-and-rules-actors.md — Firestore rules have three actors; admin identified by hardcoded UID
- [locked] admin.md — `autoApprove` always false in production; manual vetting only; 8h target / 24h max
- [locked] audit-log.md — `auditLog` append-only, no update or delete ever; severity values; legal record
- [locked] audit-verdict.md — 28 Jun–1 Jul audit outcome: keep building, do not rewrite
- [locked] authentication-session.md — 30-day localStorage session token; OTP skip rules; must confirm live Auth session via `authReadyPromise`
- [locked] cell-number-one-supplier-type.md — a cell number belongs to one supplier type permanently, never both
- [locked] classification-field-removed.md — `classification` field deleted platform-wide
- [locked] cloud-functions.md — deployed Cloud Functions and their triggers; region always us-central1
- [locked] communication-channels.md — three-channel contact model; `cellNumberTwo`, WhatsApp, `contactPreferences`
- [locked] customer-browse-m6.md — M6 customer browse flow rules
- [locked] customer-ux.md — max 4 taps home to contact; fixed list order; scroll restore
- [locked] dashboard.md — dashboard architecture. Items 64, 65, 68, 71, 134, 135 superseded; item 71 corrected 23 Jul — Storage paths use `uid`, never phone number
- [locked] exit-and-resume.md — supplier may exit registration and resume later
- [locked] field-attributes.md — explicit Required / Locked / Public attributes per field
- [locked] file-naming-convention.md — no suffix = therapist, `-spa` suffix = spa
- [locked] gallery-m11.md — M11-Gallery is a separate flow from the verification photo
- [locked] git-branch-workflow.md — feature-branch workflow via `mmstart` / `mmdone`
- [locked] golden-rule-locked-fields.md — unified Golden Rule: Section 1 + Section 8 lock on submit (supersedes GR01/GR02)
- [locked] hamburger-menu-m0-only.md — hamburger menu appears on M0 only
- [locked] hosting-domains.md — massagemap.co.za primary; micmaru.com not in active use
- [locked] identity-service.md — `resolveIdentity()` / `getValidSession()` / `storeSession()` / `clearSession()` and status table
- [locked] location-cascade.md — shared location-cascade.js module; verified live Firestore field names
- [locked] location.md — Province → Town → locationArea → Suburb hierarchy. Item 43 superseded and corrected 23 Jul — own display name vs denormalised parent name
- [locked] m-diagram-system.md — M-diagram numbering system and draw.io conventions
- [locked] map-pin-jitter.md — public pin jitter: 200 m addresses, 500 m suburb/area, 100 m minimum peer separation
- [locked] map.md — pin colours by supplier type; therapist pin is centroid only, never device GPS; clustering
- [locked] notifications.md — Cloud Function is sole sender; SMS fires on `individual` only; admin recipient
- [locked] obsidian-mcp-rejected.md — Obsidian MCP for Claude Code assessed and rejected
- [locked] offerings.md — all offerings read from the `offerings` collection; `visibleTo` values; Tantric therapist-only
- [locked] otp-lockout.md — OTP failed-attempt lockout, `recordOtpEvent`, App Check
- [locked] otp-shared-mechanism.md — one shared OTP mechanism across all entry points
- [locked] payment-entry-points.md — payment lives on M0 only; removed from post-submit M1 and from M3b dashboard
- [locked] payments.md — PayFast signature never client-side; fixed parameter order
- [locked] phase-2-scope.md — strict Phase 2 scope boundary
- [locked] phone-loss-recovery.md — 3-identifier architecture; phone-loss recovery path
- [superseded] photos.md — old multi-photo array model. Superseded by verification-photo.md. Item 80 (no photo = no live profile) still current
- [locked] pin-drop-map-parked.md — precise public pin-drop map parked until post-launch
- [locked] platform-architecture.md — three-sided platform; `supplierType` values; core architecture
- [locked] popia-compliance.md — `dataConsentGiven` / `dataConsentTimestamp` and consent gate
- [open] popia-data-separation.md — POPIA public/private supplier data split. **Decided to defer; design not started. This is the next session's work**
- [locked] pre-launch-design-priorities.md — supplier profile + M8 are pre-launch, not Phase D
- [locked] recaptcha-verifier-lifecycle.md — create the reCAPTCHA verifier once and reuse it
- [locked] register-before-popia-sequencing.md — register.html work sequenced before the POPIA split
- [locked] registration-completion-lock.md — what locks once registration is complete
- [locked] registration-flow.md — OTP → consent → Personal → remaining sections → submit; `pending_registrations` progressive saves
- [superseded] registration-spa-sections.md — pre-16-June 9-section spa structure. Superseded by spa-eight-sections.md
- [locked] registration-therapist-sections.md — therapist 8-section order. Items 47–51, 53, 54 updated 23 Jul to match live code; item 50 superseded. **Item 52 is an UNRESOLVED CONTRADICTION — diagram says S6, live code says S4 — awaiting decision**
- [locked] required-sections.md — which sections are required and field-level gates
- [locked] resume-redirect-canonical-signal.md — resume redirect keys off `suppliers.registrationComplete`. **Code-only, not yet tested end-to-end**
- [locked] save-signout-submit-scope.md — Save / Submit / Sign Out / Back are four distinct actions
- [locked] section7-subaccordions.md — Section 7 Services split into 5 sub-accordions
- [locked] session-verification-window.md — what the 30-day verification window actually checks
- [locked] silent-gps-capture.md — silent device GPS capture to admin-only fields. **Decided, not yet built**
- [locked] spa-eight-sections.md — spa has 8 sections; S9 Ownership dissolved 16 Jun
- [locked] status-fields.md — `status` vs `subscriptionStatus` — never mix; permitted values
- [superseded] superseded-decisions.md — table of retired field names and values. Historical reference only, do not use
- [locked] suppliers-vs-pending-registrations.md — which collection owns what, and when
- [locked] therapist-before-spa.md — working method: therapist side complete first, then spa
- [locked] tooling-infrastructure.md — Claude Code setup, hooks, gh CLI, draw.io
- [locked] townid-field-rename.md — `area` retired, `townId` is the replacement
- [locked] traditions-label.md — `traditions` UI label vs field name
- [locked] travel-distance-values.md — travel distance is a 5/10/15/20 km lookup plus willing-to-travel toggle
- [locked] verification-photo.md — `facePhotoPath` stores a Storage PATH in the private `suppliers/{uid}/id/` folder, never a URL
- [locked] vetting-outcomes.md — three vetting outcomes; rejection is never silent

**Index totals:** 61 locked · 3 superseded · 1 open. Five of the locked files carry qualifiers called out above — dashboard.md, location.md and registration-therapist-sections.md each contain item-level supersessions, resume-redirect-canonical-signal.md is untested, silent-gps-capture.md is not yet built.

---

## Field Register

See `docs/MM-Field-Register-v3.md`.

---

## Open Issues

See GitHub Issues — `gh issue list`. Issues are the single source of truth for bugs. Never track bugs in this file.

---

## Phase Tracker

See `MM-Phase-Tracker-v2.md` in the Obsidian vault under `06-Phase-Tracker/`. v2 is the current tracker; `MM-Phase-Tracker-v1.md` is kept as historical record — never overwrite or delete it.

---

## Parked Items

Parked items — see GitHub Issues, labels: `parked` / `pre-launch` / `phase-2`. The original 20 rows are preserved unchanged in `docs/MM-Master-Context-ARCHIVE-thru-22Jul2026.md` section 13.

---

## Session History

See `docs/MM-Master-Context-ARCHIVE-thru-22Jul2026.md` for all sessions through 22 July 2026 — 30 session log entries, 10 June to 22 July, complete and unchanged.

New sessions append below this line going forward.

---
