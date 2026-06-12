# MassageMap — Claude Code Project Brief

## Who I am
- Johan, Johannesburg, South Africa
- Mac only — always use Mac commands, zsh terminal, Mac keyboard shortcuts
- Never suggest Windows alternatives

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
- dashboard.html — supplier dashboard. Single file. Detects supplierType, renders therapist (8 sections) or spa (9 sections) accordion.
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
- Never commit functions/.env or service account keys
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
- photos array: photos[0] = ID (admin only). photos[1] = card photo. photos[2]+ = additional.
- Dashboard: one file (dashboard.html). No separate dashboard-spa.html.
- admin.html: hidden URL — never link from any public page

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

## Known outstanding items — see GitHub Issues for full list
- Dashboard end-to-end testing not yet done (all test records deleted 3 June 2026)
- register-spa.html: premisesType + mobileAvailable showing for spa — fix pending (#1)
- info.html missing — success screen redirect broken (#4)
- suburb null on submit when locationArea selected (#3)
- Admin email still going to personal address — fix in S7 (#6)

## Master Context
Always read docs/MM-Master-Context.md before any dev work.
