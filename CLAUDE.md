# MassageMap — Claude Code Project Brief

## Master Context
docs/MM-Master-Context.md is Johan's accountability record for this project — priority above all else. Always read it before any dev work. Every new version ADDS to the previous — nothing dropped, summarised, or reformatted. All parked items carry forward until explicitly closed by Johan. (General rule for how master context files work lives in global ~/.claude/CLAUDE.md.)

## Project overview
MassageMap is a three-sided massage therapy directory for the South African market:
- Public — browse therapists and spas by province, area, suburb, or map. No login required.
- Supplier — self-registration, profile management, subscription payments, dashboard
- Admin — approve, manage and monitor listings (hidden URL, Johan only, never linked publicly)

## Tech stack
- Frontend: HTML / CSS / JavaScript — vanilla only, no frameworks, mobile-first
- Database: Firebase Firestore — project ID: massage-directory-57e19, region: africa-south1
- Auth: Firebase Phone Auth (OTP via SMS)
- Storage: Firebase Storage — path: suppliers/{phone}/photos/{filename}
- Payments: PayFast via Cloud Functions only — never client-side
- Email: Resend — currently onboarding@resend.dev. Switch to notifications@massagemap.co.za after domain verification
- SMS: BulkSMS — token auth, credentials in functions/.env
- Maps: Google Maps JavaScript API — load on demand only, never eagerly
- Admin notifications: Telegram Bot API + Resend — fires on registrationComplete: true only
- Cloud Functions: Firebase Functions — ALWAYS us-central1. Never africa-south1 for functions.

## File structure
- index.html — home screen, province grid
- suburb.html — area/suburb browse
- listings.html — therapist/spa listing cards
- profile.html — full supplier profile
- map.html — map view, all active suppliers
- register.html — therapist registration (8-section accordion). Therapist only.
- register-spa.html — spa registration (8-section accordion). Spa only.
- dashboard.html — therapist supplier dashboard (8 sections). Therapist only.
- dashboard-spa.html — spa supplier dashboard (9 sections). Spa only. Not yet built. (Split confirmed 18 July 2026 — same no-suffix/-spa convention as register.html/register-spa.html.)
- subscribe.html — subscription selection
- payment.html — PayFast payment screen
- admin.html — admin dashboard (hidden URL, desktop only, never link publicly)
- admin-supplier.html — admin supplier detail view. Has its own legacy name-based location cascade (province/town/area/suburb as four selects, `area` = locationArea grouping) — NOT wired to shared location-cascade.js. Never assume the register pattern here.
- style.css — shared styles, never duplicate
- functions/ — Firebase Cloud Functions (Node.js)
- functions/.env — credentials (GITIGNORED, never commit)
- backup/ — archived file versions, not live

## Design system — LOCKED, never override
- Background: #f8f5f0 off-white throughout. Dark mode permanently retired.
- Primary colour: Teal #1a7a6e
- Accent colour: Mustard gold #c9a84c
- Font: System sans-serif — no Google Fonts
- Mobile-first: 375px base width. Desktop is secondary.
- Design language: Warm, trustworthy, local. Brand north star: The Trusted Referral.
- Full design pass is Phase D — do not apply design changes outside of Phase D sessions

## Coding rules — always follow
- Mobile-first on all public screens
- Never hardcode API keys — always use environment variables or Firebase config
- Google Maps API: load on demand only, never on page load
- Location data: always read from Firestore collections, never hardcode
- No frameworks — vanilla HTML/CSS/JS only
- Never hardcode prices — always read priceIndividual and priceSpa from Firebase settings/config
- Cloud Functions are the sole notification sender — no frontend notification calls ever
- All offerings (massage styles, traditions, treatments, amenities, associations) read from offerings Firestore collection — never hardcode in HTML

## Architecture — locked decisions, never change without instruction
- supplierType values: individual (therapist) or spa. Never use 'therapist' as a value.
- suppliers document ID: phone number (e.g. +27842500422) — LOCKED
- supplierNumber format: T-YY-COUNTER for therapists, S-YY-COUNTER for spas. Starts at 1001. Never reused.
- Registration flow: OTP → consent gate → Personal section → remaining sections → submit
- pending_registrations collection: progressive saves via setDoc merge:true
- registrationComplete: false = lightweight record. true = fully submitted. Cloud Function fires on false→true transition only.
- onSupplierRegistered: onUpdate trigger. Guard exits immediately if registrationComplete !== true or was already true.
- Location privacy — therapists: suburb or area centroid only. Never exact address. Never device GPS.
- Location privacy — spas: exact street address. Device GPS button captures gpsLat/gpsLng.
- locationArea field name: LOCKED. Previously massageArea — never use massageArea again.
- visibleTo values in offerings: 'therapist', 'spa', 'both'. Never use 'individual' in visibleTo.
- Tantric massage: in offerings visibleTo: ['therapist'] only. Always excluded from spa.
- Adult classification: PERMANENTLY REMOVED. No age gate needed.
- Four Hands massage: standard massage style — do not remove.
- associationMembership: multi-select array for both therapist and spa. Reads from offerings category: associations.
- amenities: dynamic from offerings category: amenities. Replaces old boolean fields.
- auditLog collection: append-only. No update, no delete — ever. Legal record.
- facePhotoPath: required face/vetting photo (NOT an ID or passport copy). Its own field on the supplier document — not part of the photos array. Stores a Firebase Storage PATH, never a URL. Path: suppliers/{uid}/id/ — the private folder (read requires auth), never suppliers/{uid}/photos/ (public read). Rendered by fetching a fresh authenticated getDownloadURL() at render time; never persist a download URL — those carry a permanent bypass token and leak the file regardless of Storage rules. (Locked 13 July 2026 — renamed from facePhotoUrl, which stored a public download URL under the public photos path.)
- photos array: card + additional photos. Indices under review — M11-Gallery not yet built; admin pages still read the legacy array. (Locked 9 June 2026 — retired idPhotoUrl.)
- Dashboard: split into dashboard.html (therapist) and dashboard-spa.html (spa). (Reversed 18 July 2026 — previously one file; the two dashboards differ enough that a single branching file means constant runtime "which fields for which type" checks. Gallery stays a single shared gallery.html.)
- admin.html: hidden URL — never link from any public page

## Identity handling — CRITICAL, read before touching auth/storage/notifications
- suppliers document ID = phone number (LOCKED, unchanged)
- uid (Firebase Auth UID) is stored separately on every supplier document
- Storage paths, PayFast, BulkSMS, Telegram, and any Auth-dependent lookup
  must use uid — NOT phone number
- Dashboard lookups and document reads use phone number (the doc ID)
- If unsure which identifier a given operation needs, ask before writing code
- Known history: photo-save bug (fixed cb2e0a9) was Storage path using
  phone number instead of uid — this exact confusion is the recurring risk

## Verification requirement — photos array and Storage paths
Any change touching the photos array or Storage paths must be explicitly
tested and confirmed working before being reported as fixed. This area has
a history of fixes being applied but not verified (see git log / Master
Context for details) — confirmation is not optional here.

## Firestore collections
- suppliers — all supplier data (therapists and spas)
- pending_registrations — partial registrations, progressive saves
- offerings — all massage styles, traditions, treatments, classifications, amenities, associations
- locations_provinces — province data
- locations_towns — town data
- locations_suburbs — suburb data
- locations_areas — admin-created area groupings
- settings — app config (prices, counters, flags). Document: config.
- auditLog — append-only admin action and event log
- enquiries — customer enquiries

## Location hierarchy — locked
- Province → Town → locationArea (optional) → Suburb
- locationArea: admin-created groupings within a town, stored in locations_areas
- Therapist map: always shows suburb or area centroid — never exact address
- Spa map: shows exact GPS pin

## Session and auth
- Session token: written to localStorage at OTP verification. Key: mm_session_{phone}. 30-day expiry.
- OTP skip: if valid session token exists, skip OTP screen
- Test phones: 0800000001–0800000004. OTP: 123456. Quota: 10/day in dev — do not waste.
- Real test phones: 0842500422 (Johan), 0842500421 (spare)

## Firebase rules
- Location collections: admin-only write access. Never public write.
- auditLog: admin-only write. Never public write.
- Full security audit required before launch.

## Design skills — consult before any UI work (Phase D)
All skills are in .agents/skills/. Consult relevant skills before any CSS or UI changes.
- impeccable — spacing and typography polish
- emil-design-eng — motion and interaction
- stitch-design-taste — design quality judgment
- design-taste-frontend — frontend taste
- high-end-visual-design — visual quality
- gpt-taste — taste judgment
- llm-council — pressure-test decisions (council this / pressure-test this)
- imagegen-frontend-mobile — mobile image generation guidance
- imagegen-frontend-web — web image generation guidance
- image-to-code — image to code conversion
- redesign-existing-projects — redesign guidance
- brandkit — brand consistency
- full-output-enforcement — output discipline
- industrial-brutalist-ui — ANTI-REFERENCE: do not apply to MassageMap
- minimalist-ui — ANTI-REFERENCE: do not apply to MassageMap

## Bug tracking
All known bugs and their status live in GitHub Issues — not here. Check Issues before starting any dev work.

## Obsidian Session Logging
- Vault path: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/notes/MassageMap/` (iCloud, NOT the repo)
- One file per CALENDAR DAY in 00-Session-Log/, named YYYY-MM-DD-session.md
- If a file for today's date already exists, APPEND a new dated entry to it — never create a second file for the same day
- Do NOT create a new file per Claude Code restart, per work block, or per hour — only per calendar day
- When asked to "write the Obsidian session log," follow this structure:
  ## Decisions made
  ## Files changed / commits
  ## GitHub issues touched
  ## Parked / carried forward
  ## Next session starts with
- When asked to "update the Phase Tracker," update the CURRENT tracker — the highest-numbered file in 06-Phase-Tracker/ (MM-Phase-Tracker-v2.md as of 14 July 2026). Earlier versions are kept as historical record — never overwrite or delete them.
- Update the current tracker IN PLACE — refresh the status/date lines and add new rows to its existing tables. Never replace its existing sections (Session Build Plan, Phase Plan, Outstanding Items, Parked Items, Platform Status) with a shorter structure. It carries the same accountability weight as the Master Context: nothing dropped, summarised, or reformatted without Johan's explicit permission.
- The tracker must always still answer: current phase / locked-done / active / not started / open questions / next session starts with — but as content within its existing structure, not as a replacement skeleton.
- Never write to Obsidian unless explicitly asked in-session ("write the session log" / "update the Phase Tracker") — no automatic or background writes.