# MassageMap — Claude Code Project Brief

## Who I am
- Johan, Johannesburg, South Africa
- Mac only — always use Mac commands, zsh terminal, Mac keyboard shortcuts
- Never suggest Windows alternatives

## Project overview
MassageMap is a three-sided massage therapy directory:
- Public — browse therapists and spas by province, area, suburb, or map
- Supplier — self-registration, profile management, subscription payments
- Admin — approve, manage and monitor listings (hidden URL, never linked publicly)

## Tech stack
- Frontend: HTML / CSS / JavaScript — vanilla only, no frameworks
- Database: Firebase Firestore — project ID: massage-directory-57e19, region: africa-south1
- Auth: Firebase Phone Auth (OTP via SMS)
- Storage: Firebase Storage (ID photos + profile photos)
- Payments: PayFast (prepaid subscriptions: 1 / 3 / 6 / 12 months)
- Email: Resend (transactional)
- Maps: Google Maps JavaScript API — load on demand only, never eagerly
- Admin notifications: Telegram Bot API

## File structure
- index.html — home screen, province grid
- suburb.html — area/suburb browse
- listings.html — therapist/spa listing cards
- profile.html — full supplier profile
- map.html — map view, all active suppliers
- register.html — therapist registration (3-step form)
- register-spa.html — spa registration
- dashboard.html — supplier dashboard (therapist + spa, single file)
- subscribe.html — subscription selection
- payment.html — PayFast payment screen
- enquiry.html — customer enquiry form
- info.html — info screen
- admin.html — admin dashboard (hidden URL, desktop only)
- style.css — shared design system, never duplicate styles here
- config.js — API keys and tokens — GITIGNORED, never commit this file
- locations.json — 9 provinces, 189 towns, 8,626 suburbs (IEC source)
- seed.js — seed data script, run manually only

## Design system — never override these
- Theme: dark
- Background: #0f1117
- Card background: #161b27
- Accent colour: #6c63ff
- Text colour: #e2e8f0
- Green (active/verified): #10b981
- Mobile-first: 375px base width
- Buttons: pill/rounded, outlined with #6c63ff border
- No bottom navigation bar
- Admin screens: desktop only, left sidebar layout

## Coding rules — always follow
- Mobile-first on all public screens
- Never hardcode API keys — always use config.js
- Never commit config.js — it is in .gitignore
- Google Maps API: load on demand only, never on page load
- locations.json: fetch on demand, never hardcode location data
- No frameworks — vanilla HTML/CSS/JS only
- style.css is the single source of truth for all styles
- Never duplicate CSS — always check style.css first

## Key locked decisions — never change without instruction
- supplierType set from URL parameter only — no toggle on registration screen
- Therapist registration: register.html | Spa registration: register-spa.html
- Dashboard: single dashboard.html — shows/hides fields based on supplierType
- Session: 30-day token — OTP only on first login or new device
- Sign out clears Firebase Auth only — session token in localStorage survives
- Supplier number format: MM-YYYY-NNNNN-T/S — permanent, never reused
- Adult classification: shown on therapist listings, excluded from spas entirely
- Four Hands massage type: REMOVED — do not add back
- Spa: no mobile massage, no available outside hours, no qualifications, no affiliations
- Spa premises type: Business only — hardcoded
- Prices: never shown to customers on any public screen
- Full street address: admin only, never shown publicly
- admin.html: hidden URL — never link from any public page
- Vetting: Approve / Reject / Investigate — all require mandatory reason text
- Reject: silent status change, no email, supplier record kept forever (legal)
- Photo delete button: white X, not red
- Email: optional for therapists, required for spas
- Map pins: Red teardrop T = therapist, Amber teardrop S = spa
- GPS denied on map: show message and return to index.html — no fallback map
- Bottom navigation bar: not used anywhere

## Location hierarchy — locked
- Province → Town → Suburb (from locations.json)
- Areas: admin-created clusters of suburbs, stored in Firestore areas collection
- Max 5 areas per town
- Supplier registration: Area required if areas exist for town; Suburb required if no areas
- Customer sees: Area name on listing, Suburb on profile and map

## Firebase collections
- suppliers — all supplier data
- areas — admin-created area clusters
- enquiries — customer enquiries
- subscriptions — payment records
- settings — admin-controlled app settings (prices etc)
- changeLogs — admin action audit trail

## Session and auth
- Test number 1: 0800000001 / OTP: 123456 (therapist)
- Test number 2: 0800000002 / OTP: 123456 (spa)
- Phone Auth SMS quota: 10/day on dev — do not waste OTPs on testing

## Brief and git rules
- Always write code changes as numbered steps
- Git add and commit are allowed in briefs
- Git push only at end of session or when Johan explicitly asks — never mid-session
- Never include testing instructions in briefs
- For complex precise changes: include exact code in the brief
- For simple structural changes: numbered instructions are sufficient
