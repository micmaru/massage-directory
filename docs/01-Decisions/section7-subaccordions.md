# SECTION 7 (SERVICES) — 5 SUB-ACCORDIONS

Status: locked

Source: Session Log — 12 July 2026, item 7 (commits 9dfa2ea, 22273ed, 5a79736, 816e3ef)

Section 7 is five independently-collapsible sub-accordions, matching the visual pattern of the main 1-8 accordion:

- 7.1 Genders Served (required)
- 7.2 Massage Styles (required)
- 7.3 Traditions (optional)
- 7.4 Treatments (required)
- 7.5 Service Offerings (optional)

Each sub-item saves independently, straight to `pending_registrations` via `setDoc(..., {merge:true})` on its own Save button. The old shared "Save — Services" button and its combined save call are dead code, removed.

Optional sub-items save as explicit empty arrays when untouched (e.g. `traditions: []`) rather than an absent field.

Section 7 shows "Complete" only once 7.1, 7.2 and 7.4 are saved — optional items never block it. The outer accordion auto-collapses on the transition into Complete only, guarded so it does not slam shut on every later save. Resume/prefill restores each sub-item's own done-state individually.

Supersedes "Services section split deferred to Phase D".
