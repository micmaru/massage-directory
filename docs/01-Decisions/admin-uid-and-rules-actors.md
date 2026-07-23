# FIRESTORE RULES — THREE ACTORS, HARDCODED ADMIN UID

Status: locked

Source: Session Log — Audit Session (28 June – 1 July 2026), decisions 6-7; 21 July 2026 (admin.html permission failures)

Three actors only, in firestore.rules: **admin**, **own supplier**, **nobody else**.

Admin UID locked: `BGI0KYCKnYVM85GdlH1CG2KHP0p2` (phone +27842500422), hardcoded — "Option 1". Must be upgraded to Option 2 (an `admins` collection) before scaling or adding a second admin.

Rules deployed and verified in the Playground (all three critical tests — anonymous auditLog read/write, anonymous suppliers update, any-authenticated settings/config write — flipped from allowed to denied). Committed c3af816.

Known consequence, found 21 July 2026 and NOT fixed: admin.html's Approve/Reject/Investigate all fail with "Missing or insufficient permissions" because the browser session authenticates as a different UID (`vg5bwe3c5uT7zS4mT1BL41Q950A3`) — admin.html has no real sign-in screen yet, so whatever authenticates in the background will essentially never match the hardcoded UID. Pre-existing roadmap gap (Cluster D, admin authentication), must close before launch.
