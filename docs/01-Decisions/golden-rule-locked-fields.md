# GOLDEN RULE (UNIFIED) — SECTION 1 + SECTION 8 LOCK ON SUBMIT

Status: locked

Source: Session Log — 18 July 2026 (GOLDEN RULE — unified)

**Supersedes the two previously-separate rules** (GOLDEN RULE 01: Section 1 locks on first save; GOLDEN RULE 02: Section 8 locks on submit). GOLDEN RULE 01 as written was never actually built — confirmed by direct code check: register.html's Section 1 (`firstName`/`lastName`) has ZERO lock logic, no `readonly`, no `disabled`, no `input--locked` class, and is freely re-editable after every save. It is formally retired.

**Unified rule**: Section 1 (Personal) and Section 8 (Photos) lock TOGETHER, triggered by **Submit**, not by save.

- Freely editable throughout registration, right up to Submit.
- The instant `registrationComplete: true`, both lock permanently — visible in the dashboard using the same `input--locked` treatment as the phone/token field.
- Only admin can change either after that point.

**Reason**: these are the two things admin actually vets (identity + verification photo) before approval. Letting them change quietly post-approval would mean the live listing no longer matches what was checked.

**This is a dashboard-only concern.** No lock logic needs retrofitting into register.html — a submitted therapist can never reach register.html again through any path (index.html's `resolveIdentity()` routes `verified` straight to dashboard.html, and register.html has its own defensive redirect as a second guard).

Section 1 and Section 8 are excluded from the dashboard's "Edit Sections (2-8)" entirely — shown read-only elsewhere on the screen, not absent.
