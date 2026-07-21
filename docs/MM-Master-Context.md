# MassageMap — Master Context v65
**Version:** 65 | **Date:** 2026-07-21 | **Author:** Johan Cilliers | **Confidential**
**File path (repo-relative): docs/MM-Master-Context.md — always read this file at session start.**
**STANDALONE — no previous version needed. This is the single source of truth.**
**Note: v50 header was never updated despite 13-16 June sessions being appended — those sessions are present in the body of this file under their own dated headings. v51 bumped 24 June. This is the second consecutive on-time version bump.**
**v57 bumped 11 July.**
**v58 bumped 12 July.**
**v59 bumped 13 July.**
**v60 bumped 14 July.**
**v61 bumped 15 July.**
**v62 bumped 16 July.**
**v63 bumped 17 July.**
**v64 bumped 18 July 2026**
**v65 bumped 21 July 2026**

---

## QUICK STATUS — READ THIS FIRST

| Item | Status |
|---|---|
| Launch target | 31 July 2026 |
| Current phase | register.html known-issue list — CLOSED this session (address/gpsLat/jitter chain, cellNumberTwo, Section 3 validation, lock-status verification all done and tested) |
| Next session starts with | POPIA public/private supplier split — DEDICATED SESSION, standalone focus, not bundled with further register.html work unless something new surfaces. Design not yet started (candidates already identified: firstName, lastName, gender, addressLine1, facePhotoPath, vetNotes — see prior session's notes). |
| Primary blocker | None blocking register.html (closed). POPIA split design is the open item ahead of that dedicated session. |
| Also carried forward (not next session's focus unless raised) | Silent device GPS capture UI (decided, not yet built); admin.html login/permission fix (found this session, not fixed); M1 diagram `resolveIdentity()` gap; `showCellNumberTwo` public-display build; BulkSMS credits at zero. |
| Google Cloud billing | DONE — Blaze plan, credit card attached, confirmed 9 June 2026 |
| BulkSMS credits | AT ZERO — buy before Stage 2 |
| Free trial expiry | 6 July 2026 — credit card attached, should auto-continue |

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Firebase Project Details](#3-firebase-project-details)
4. [Design System](#4-design-system)
5. [All Decisions — Authoritative Record](#5-all-decisions)
6. [Field Register — All Collections](#6-field-register)
7. [Open GitHub Issues](#7-open-github-issues)
8. [Phase Tracker & Session Build Plan](#8-phase-tracker)
9. [Product Definition](#9-product-definition)
10. [API Reference](#10-api-reference)
11. [Workflow Rules](#11-workflow-rules)
12. [Build History — Session Log](#12-build-history)
13. [Parked Items](#13-parked-items)

---

## 1. Project Overview

MassageMap is a three-sided massage therapy directory for the South African market. Connects individual therapists and spas (suppliers) with customers, managed via an admin dashboard.

| Side | Description |
|---|---|
| Public / Customer | Browse therapists and spas by province, area, suburb, or map view. No login required. |
| Supplier | Self-registration, profile management, subscription payments, dashboard. |
| Admin | Separate dashboard (hidden URL) to approve, manage, and monitor listings. Johan only. |

- Johan Cilliers is a Chartered Marketer CM(SA) — product positioning, market strategy, and commercial decisions are Johan's domain. Claude executes technical and documentation.
- Never refer to the competitor by name in any documentation, code, chat, or communications — always "the competitor"
- Local project path: `~/dev/playground/massage-directory`
- GitHub: `https://github.com/micmaru/massage-directory`

---

## 2. Tech Stack

| Item | Detail |
|---|---|
| Frontend | HTML / CSS / JavaScript — Mobile-first |
| Database | Firebase Firestore — africa-south1 (Johannesburg). POPIA compliant. |
| Auth | Firebase Phone Auth — OTP via SMS. Test numbers: 0800000001–0800000004. All OTP: 123456. Quota: 10/day dev. |
| Storage | Firebase Storage — Path: `suppliers/{phone}/photos/{filename}` |
| Payments | PayFast via Cloud Functions — Sandbox tested. Live credentials Stage 4. |
| Email | Resend — currently `onboarding@resend.dev`. Switch to `notifications@massagemap.co.za` after domain verification Stage 4. |
| SMS | BulkSMS — Token auth. `BULKSMS_TOKEN_ID` and `BULKSMS_TOKEN_SECRET` in `functions/.env`. **CREDITS AT ZERO — buy before Stage 2.** |
| Maps | Google Maps JavaScript API — On-demand loading only. Never loaded globally. |
| Admin notifications | Telegram Bot API + Resend — fire on `registrationComplete: true` only. Bot: @massagemap_admin_bot. Chat ID: `917892632`. |
| Cloud Functions | Firebase Functions — **us-central1. CRITICAL: always us-central1. App Engine does not support africa-south1.** |
| Hosting | massagemap.co.za — cPanel on domains.co.za. SSL: self-signed — upgrade to Let's Encrypt S31. cPanel: https://cp72.domains.co.za:2083. Username: massagem. |
| Admin email | admin@massagemap.co.za — created in cPanel, confirmed working. Replaces Johan's personal email everywhere. |

---

## 3. Firebase Project Details

| Item | Detail |
|---|---|
| Project ID | `massage-directory-57e19` |
| Firestore region | `africa-south1` (Johannesburg) |
| Functions region | `us-central1` — CRITICAL, never change |
| Plan | Blaze (pay as you go). Credit card attached 9 June 2026. Free trial credit $300 — expires 6 July 2026. |
| Service account key | `massage-directory-57e19-firebase-adminsdk-fbsvc-21529ba152.json` — project root, always in `.gitignore`. NEVER push to GitHub. |
| Node.js version | v22 |

---

## 4. Design System — LOCKED

| Item | Detail |
|---|---|
| Background | `#f8f5f0` off-white throughout. Dark mode permanently retired. Never reintroduce `#0f1117` or `#6c63ff`. |
| Primary colour | Teal `#1a7a6e` |
| Accent colour | Mustard gold `#c9a84c` |
| Font | System sans-serif — no Google Fonts dependency |
| Warm Surface Rule | No pure `#ffffff` or `#000000` |
| Rarity Rule | Teal on ≤10% of screen area |
| Mobile first | All screens designed for 375px width first. Desktop is secondary. |
| Design language | Warm, trustworthy, local. Brand north star: The Trusted Referral. |
| DESIGN.md status | File exists at project root but design system not correctly applied. Full design pass is Phase D. |

---

## 5. All Decisions — Authoritative Record

Compiled 9 June 2026 from Master Context v20–v47 + session v48. 214 decisions reviewed and confirmed current. Superseded decisions listed at end.

### PLATFORM & ARCHITECTURE

1. Three-sided platform: Public/Customer (no login) / Supplier / Admin (Johan only)
2. `supplierType` = `individual` (therapist) or `spa` — from URL parameter only, no toggle. **Never use `'therapist'` as a value anywhere in code.**
3. Single `suppliers` Firestore collection — do not split. `supplierType` is the differentiator.
4. ~~Single `dashboard.html` — detects supplierType on load, renders correct sections (therapist: 8 sections, spa: 9 sections)~~ **SUPERSEDED 18 July 2026:** dashboard split into separate `dashboard.html` (therapist) and `dashboard-spa.html` (spa) — same convention as register.html/register-spa.html. See 18 July session log for reasoning.
5. Supplier document ID: phone number (e.g. `+27842500422`) — LOCKED as of S2.
6. `uid` field: stored as a field on supplier document but NOT used as document ID
7. Supplier number format: `T-YY-COUNTER` (therapist) / `S-YY-COUNTER` (spa), counter starts at 1001. Two counters in `settings/config`: `counterIndividual` and `counterSpa`.
8. Supplier number generated after Personal section saved — not at OTP
9. `supplierNumber` is permanent — survives deregistration
10. Post-launch expansion to neighbouring African countries — Phase 2
11. Supplier UX principle: 50%+ of suppliers are non-highly-educated smartphone users — simple screens, big buttons, one action per screen
12. Hosting: massagemap.co.za — cPanel on domains.co.za
13. Admin email: admin@massagemap.co.za — replaces Johan's personal email everywhere

### STATUS FIELDS — CRITICAL, NEVER MIX

14. Registration status field name: `status`. Values: `pending` / `active` / `suspended` / `review` / `rejected`
15. Subscription status field name: `subscriptionStatus`. Values: `active` / `expired` / `not_paid`
16. These are two completely separate Firestore fields — NEVER mix them
17. `registrationComplete` Boolean: `false` = lightweight record after Personal section saved. `true` = full registration submitted.
18. `onSupplierRegistered` trigger: `onUpdate` — fires only when `registrationComplete` transitions false → true

### AUTHENTICATION & SESSION

19. 30-day session token in localStorage, key: `mm_session_<phone>`. Contains: displayName, supplierType, expiry.
20. OTP required: first login, new device, or every 30 days — skipped same device within 30 days
21. Sign out ONLY clears Firebase Auth — does NOT delete session token from localStorage
22. New device always requires OTP regardless of 30-day window
23. OTP skip logic: `handleNext` checks `suppliers` first, then `pending_registrations` (silently, auth not required). If found in either with valid session token, skip OTP.
24. Return redirect: if `registrationComplete = false` → redirect to register.html/register-spa.html. If `true` → dashboard.html.

### REGISTRATION FLOW — LOCKED ARCHITECTURE

25. Step 1 — OTP verified: Firebase Auth verifies phone. Session token written to localStorage. `pending_registrations` document created.
26. Step 2 — Consent given: `dataConsentGiven: true` and `dataConsentTimestamp` written to `pending_registrations`.
27. Step 3 — Personal/Business section saved: fields written to `pending_registrations`. `supplierNumber` generated via Firestore transaction. Lightweight `suppliers` document created with `registrationComplete: false`.
28. Step 4 — Remaining sections: each saves to `pending_registrations` via `setDoc merge:true`. Data accumulates progressively.
29. Step 5 — Submit: all fields read from `pending_registrations`. Full `suppliers` document written. `registrationComplete: true`. Cloud Function fires notifications.
30. OTP permissions fix: `pending_registrations` query in `handleNext` wrapped in try/catch to silently ignore permission errors before authentication. Applied to both register.html and register-spa.html.

### POPIA COMPLIANCE — LOCKED

31. `dataConsentGiven` Boolean — captured at consent gate before registration
32. `dataConsentTimestamp` Timestamp — records exact moment consent was given
33. Consent gate fires ONCE before registration. `Begin Registration` button greyed until both checkboxes ticked.
34. Two separate checkboxes: (1) POPIA consent. (2) T&C acceptance. Keeping them separate is correct POPIA practice.
35. Data retention: 60 days after supplier deletion — all personal data purged. Logged in `auditLog`.
36. Legal opinion required PRE-LAUNCH: T&Cs, POPIA compliance, Privacy Policy. Not a DIY task.

### LOCATION

37. Three-level hierarchy: Province → Town → Suburb
38. Areas = optional admin-created clusters within a town — max 5 per town
39. A suburb can only belong to ONE area. Deleting an area returns all suburbs to pool.
40. Area vs suburb rule: if areas exist for town, show area dropdown with "My suburb is not in these areas" escape. If no areas, suburb required directly.
41. Location data: IEC Electoral Commission 2024 — 9 provinces, 189 towns, 8,626 suburbs, zero duplicates confirmed
42. Location Firestore collections: `locations_provinces`, `locations_towns`, `locations_suburbs`, `locations_areas`
43. Firestore field names CRITICAL: `provinceName` (not `province`), `townName` (not `town`), `areaName` (not `name`) in locations_areas
44. `locationArea` field name: LOCKED as of S3. Previously `massageArea` — renamed platform-wide across all files.
45. `locations.json`: retired. **register-spa.html still reads it — update in Phase D spa rebuild ONLY. Do not patch.**
46. Location data = MassageMap core competency — no public write access, admin-only management.

### REGISTRATION — THERAPIST (register.html) — LOCKED SECTION ORDER

47. Section 1 — Personal (Required): firstName, lastName, displayName, gender
48. Section 2 — Account: cellNumber (readonly), whatsappNumber, showWhatsapp, email, contactPreferences
49. Section 3 — Location (Required): province, town, locationArea, suburb, addressLine1, addressVisible
50. Section 4 — Premises & Facilities: premisesType, mobileAvailable, willingToTravelKm, amenities
51. Section 5 — About (Required): genderServed, experienceYears, aboutMe, qualifications, associationMembership, specialsText
52. Section 6 — Availability: weeklyHours, availableOutsideHours
53. Section 7 — Services (Required): massageStyles (includes Tantric), traditions, treatments, classification, serviceOfferings
54. Section 8 — Photos (Required): min 1 face photo, up to 4 additional

### REGISTRATION — SPA (register-spa.html) — LOCKED SECTION ORDER

55. Section 1 — Business (Required): displayName, tradingName, registrationNumber, vatNumber
56. Section 2 — Account: cellNumber (readonly), spaPhone, spaPhoneVisible, spaMobile, spaMobileVisible, email, whatsappNumber, showWhatsapp, contactPreferences, requiresInvoice
57. Section 3 — Ownership: ownerFirstName, ownerLastName, ownerMobile, managerFirstName, managerLastName, managerMobile
58. Section 4 — Location (Required): province, town, locationArea, suburb, addressLine1 (mandatory spa), addressVisible (default true)
59. Section 5 — Premises & Facilities: amenities
60. Section 6 — About (Required): genderServed, aboutSpa, qualifications, associationMembership, specialsText
61. Section 7 — Availability: weeklyHours, availableOutsideHours
62. Section 8 — Services (Required): massageStyles (NO Tantric), traditions, treatments, classification, serviceOfferings
63. Section 9 — Photos (Required): min 1 face/front photo, up to 4 additional

### DASHBOARD — LOCKED ARCHITECTURE

64. ~~Single `dashboard.html` detects `supplierType` on load — no separate dashboard-spa.html~~ **SUPERSEDED 18 July 2026:** separate `dashboard.html` (therapist) and `dashboard-spa.html` (spa, not yet built). The two dashboards differ enough that a single branching file means constant runtime "which fields for which type" checks. Gallery stays a single shared `gallery.html`. See 18 July session log.
65. Therapist dashboard: 8 sections. Spa dashboard: 9 sections.
66. `associationMembership` is multi-select for BOTH therapist and spa — reads dynamically from offerings collection
67. No progress bar on dashboard
68. Services section split deferred to Phase D
69. `displayName` move: from Personal section to About section — editable
70. "Sign Out" button label: must read "Back to Main Menu" — LOCKED
71. Photo storage path: `suppliers/{phone}/photos/{filename}` — LOCKED
134. GOLDEN RULE 01 (Therapist) — Section 1 (Personal) becomes permanently locked the moment it is first SAVED (not submitted) — locked by design, both in the UI and the backend. The therapist can still see the section but cannot open or access it to edit — visible but not clickable/reachable, not merely a save-blocked field. Never editable by the therapist again after that save. Only admin can change it. This governs the registration record.
135. GOLDEN RULE 02 (Therapist) — Section 8 (Photos) verification face photo can be freely uploaded, deleted, and replaced any number of times DURING active registration (pre-submit) — no restriction. The moment registration is SUBMITTED, the face photo becomes permanently locked — can never be changed again by the therapist, ever, only admin. Both golden rules deliberately decided and locked together, 17 July 2026, for the M3 therapist dashboard build - do not re-litigate. Spa equivalents (M4) to be decided separately, not assumed to be identical.

### OFFERINGS — LOCKED

72. `massageStyles`: Tantric included for therapists (visibleTo: `['therapist']`). Excluded from spa — never show Tantric in spa registration or dashboard.
73. `visibleTo` values in offerings: `['therapist']` / `['spa']` / `['therapist','spa']`. **Never use `'individual'` in visibleTo.**
74. `amenities` replaces retired `parkingAvailable` and `showerFacilities` booleans — now dynamic from offerings
75. `associations` category seeded into offerings: AHPCSA, MTASA, SAAHIP, SPAASA
76. Adult classification: PERMANENTLY REMOVED. No age gate needed.
77. Enquiry form: PERMANENTLY REMOVED — direct contact only via Call button and WhatsApp button

### PHOTOS — LOCKED (updated 9 June 2026)

78. `facePhotoUrl` field: required close-up face photo. NOT an ID or passport copy. Replaces retired `idPhotoUrl`.
79. `showFacePhoto` Boolean: supplier-controlled. `true` = face photo shown publicly. `false` = face photo hidden.
80. No face photo = no vetting = no live profile. Hard gate, no exceptions.
81. If `showFacePhoto = false` + other photos exist → other photos display, face photo hidden
82. If `showFacePhoto = false` + no other photos → photo space empty on frontend
83. `photos[0]` = face photo slot. `photos[1]` = card photo (public). `photos[2]+` = additional profile photos.
84. facePhotoUrl and showFacePhoto fields — must be added to schema and all code in Phase D

### NOTIFICATIONS — LOCKED

85. Cloud Function is the SOLE sender of all notifications — no frontend notification calls ever
86. SMS only fires for `supplierType === 'individual'` — NOT `type === 'therapist'`
87. Notification names: always `firstName + lastName` — never `displayName` alone
88. Telegram fires on every completed registration (`registrationComplete: true`)
89. Double-fire fix confirmed working 13 May — removed duplicate blocks from register.html
90. Admin email recipient: must be `admin@massagemap.co.za` — currently still going to hjcilliers@gmail.com (Issue #6/#8)

### PAYMENTS — LOCKED

91. PayFast signature generation: NEVER client-side — always via Cloud Function
92. Parameter order is FIXED — any deviation breaks the signature
93. Prices always read from `settings/config` — never hardcoded. `priceIndividual` = 299, `priceSpa` = 999
94. Therapist subscription: R299/month. Spa subscription: R999/month.
95. Manual EFT option in scope for launch — FNB bank account, proof of payment upload, admin approval

### AUDIT LOG — LOCKED

96. `auditLog` is append-only — no update, no delete, EVER. Not even admin. Legal record.
97. `severity` values: `critical` / `important` / `low`
98. `reason` field: mandatory for admin actions. Auto-populated for system. Not required for supplier self-service.

### ADMIN

99. `autoApprove`: always `false` in production. Manual vetting only.
100. Vetting target: 8-hour target, 24-hour maximum
101. `vetNotes`: admin only — NEVER shown to supplier
102. `rejectionReason`: shown to supplier only when `status = rejected`
103. Admin dashboard: hidden URL — Johan only

### MAP

104. Map pins: Red teardrop T = therapist, Amber teardrop S = spa — FIXED, never change
105. Therapist GPS: suburb centroid — never device GPS
106. Spa GPS: device GPS button on registration screen
107. GPS fallback: suburb centroid if street address geocoding fails
108. Separate MarkerClusterer instances per supplier type

### CUSTOMER UX — LOCKED

109. Maximum 4 taps from home to contact — non-negotiable
110. List order fixed per session. Scroll position stored in `sessionStorage` and restored on back navigation.
111. Call button: always visible. Cell number always public. No toggle.
112. WhatsApp button: only shows if `showWhatsapp = true`
113. No enquiry form — direct contact via Call and WhatsApp only (confirmed 9 June 2026)

### CLOUD FUNCTIONS — DEPLOYED

114. `onSupplierRegistered`: onUpdate — fires when `registrationComplete` transitions false→true
115. `createPayfastPayment`: HTTPS callable — builds signed PayFast payment form
116. `payfastNotify`: HTTPS endpoint — receives PayFast ITN, updates subscription
117. `checkIncompleteRegistrations`: Scheduled every 24h — sends reminder SMS to incomplete registrations
118. `dailyNotificationCheck`: Scheduled 08:00 SAST — checks expiry dates (Phase 2)
119. `onAuditLogWrite`: onWrite — fires Telegram/SMS/email based on action and severity
120. `helloMassageMap`: HTTPS health check
121. All functions region: us-central1 — CRITICAL, never change

### HOSTING & DOMAINS

122. massagemap.co.za: primary domain. Coming soon page LIVE since 4 June 2026.
123. micmaru.com: registered, not in active use for MassageMap
124. admin@massagemap.co.za: confirmed working. IMAP port 993 SSL, SMTP port 465 SSL, server: mail.massagemap.co.za
125. Git deployment from GitHub to cPanel — to be set up Stage 4

### TOOLING & INFRASTRUCTURE (confirmed 8 June 2026)

126. Global `~/.claude/CLAUDE.md` created with Karpathy guidelines and permissions
127. Project CLAUDE.md restored, cleaned, committed v45
128. Obsidian vault built — 7 folders under MassageMap, iCloud
129. `.claude/settings.json` — permissions and hooks corrected
130. `mmstart` hook active — pulls GitHub Issues automatically at session start
131. Claude Code safety hooks installed: `block-dangerous-commands.sh`, `warn-large-files.sh`
132. gh CLI installed via Homebrew (v2.93.0) — confirmed 9 June 2026
133. draw.io install — PARKED

### SUPERSEDED DECISIONS (historical reference only — do not use)

| Field/Value | Replaced by |
|---|---|
| `massageArea` | `locationArea` |
| `idPhotoUrl` | `facePhotoUrl` |
| `parkingAvailable` | `amenities` array |
| `showerFacilities` | `amenities` array |
| `massageTypes` | `offerings` collection |
| Supplier document ID = Firebase Auth UID | Phone number |
| Dark theme `#0f1117` | `#f8f5f0` off-white |
| Adult classification | Permanently removed |
| Body map on profile | Permanently removed |
| Enquiry form | Permanently removed |

---

## 6. Field Register — All Collections

### suppliers collection

| Field | Type | Therapist | Spa | Notes |
|---|---|---|---|---|
| `supplierType` | string | Y | Y | `individual` or `spa` — NEVER `therapist` |
| `supplierNumber` | string | Y | Y | T-YY-COUNTER / S-YY-COUNTER — internal only |
| `status` | string | Y | Y | `pending` / `active` / `suspended` / `review` / `rejected` |
| `subscriptionStatus` | string | Y | Y | `active` / `expired` / `not_paid` — NEVER mix with `status` |
| `subscriptionExpiry` | timestamp | Y | Y | Date subscription expires |
| `registrationComplete` | boolean | Y | Y | `false` = lightweight. `true` = fully submitted. |
| `cellNumber` | string | Y | Y | Primary cell — OTP login and SMS notifications |
| `whatsappNumber` | string | Y | Y | WhatsApp contact number |
| `showWhatsapp` | boolean | Y | Y | `true` = WhatsApp button shown on public profile |
| `email` | string | Y | Y | Optional therapists. Mandatory spas. |
| `contactPreferences` | array | Y | Y | Therapist: `[sms,email,whatsapp]`. Spa: `[phone,whatsapp,email]` |
| `dataConsentGiven` | boolean | Y | Y | POPIA consent |
| `dataConsentTimestamp` | timestamp | Y | Y | Exact moment consent was given |
| `requiresInvoice` | boolean | N | Y | Spa only. Invoice generation Phase 2. |
| `spaPhone` | string | N | Y | Spa landline |
| `spaPhoneVisible` | boolean | N | Y | Show landline on listing |
| `spaMobile` | string | N | Y | Spa mobile |
| `spaMobileVisible` | boolean | N | Y | Show mobile on listing |
| `ownerFirstName` | string | N | Y | Spa only. Admin/vetting only. Never public. |
| `ownerLastName` | string | N | Y | Spa only. Admin/vetting only. |
| `ownerMobile` | string | N | Y | Spa only. Admin/vetting only. |
| `managerFirstName` | string | N | Y | Spa only. Admin/vetting only. |
| `managerLastName` | string | N | Y | Spa only. Admin/vetting only. |
| `managerMobile` | string | N | Y | Spa only. Admin/vetting only. |
| `firstName` | string | Y | N | Therapist only. LOCKED post-registration. |
| `lastName` | string | Y | N | Therapist only. LOCKED post-registration. |
| `displayName` | string | Y | Y | Public name. LOCKED post-registration. |
| `tradingName` | string | N | Y | Spa only. Legal trading name. LOCKED. Admin only. |
| `registrationNumber` | string | N | Y | Spa only. Company reg. Admin only. |
| `vatNumber` | string | N | Y | Spa only. Optional. Admin only. |
| `gender` | string | Y | N | Therapist only. `male`/`female`/`non-binary`. LOCKED. |
| `genderServed` | string | Y | Y | `both` / `female` / `male` |
| `experienceYears` | string | Y | N | Therapist only. `0-1`/`1-3`/`3-5`/`5+` |
| `province` | string | Y | Y | Lowercase slug e.g. `gauteng`. LOCKED. |
| `suburb` | string | Y | Y | LOCKED post-registration. |
| `area` | string | Y | Y | Town document ID from locations_towns |
| `locationArea` | string | Y | Y | Admin-created area grouping. LOCKED field name. |
| `addressLine1` | string | Y | Y | Admin only for therapists. Mandatory for spas. |
| `addressVisible` | boolean | Y | Y | `false` = suburb only (therapist default). `true` = full address (spa default). |
| `gpsLat` | double | Y | Y | Therapist: suburb centroid. Spa: device GPS. |
| `gpsLng` | double | Y | Y | Same source rules as `gpsLat` |
| `premisesType` | string | Y | N | Therapist only. `home` / `business` |
| `mobileAvailable` | boolean | Y | N | Therapist only. Travels to client. |
| `willingToTravelKm` | string | Y | N | Therapist only. `10`/`25`/`50`/`100` |
| `amenities` | array | Y | Y | Dynamic from offerings (category: amenities). |
| `aboutMe` | string | Y | N | Therapist only. Max 300 chars. |
| `aboutSpa` | string | N | Y | Spa only. Max 300 chars. |
| `specialsText` | string | Y | Y | Promotions / specials. |
| `qualifications` | string | Y | N | Therapist only. Single text input. |
| `associationMembership` | array | Y | Y | Both. Reads from offerings category: `associations`. |
| `classification` | array | Y | Y | From offerings — Therapeutic / Holistic / Beauty & Wellness |
| `massageStyles` | array | Y | Y | Therapist: includes Tantric. Spa: Tantric excluded. |
| `traditions` | array | Y | Y | From offerings collection |
| `treatments` | array | Y | Y | From offerings collection |
| `serviceOfferings` | array | Y | Y | Commercial packages from offerings collection |
| `weeklyHours` | map | Y | Y | `{monday:{available,from,to},...sunday}` |
| `availableOutsideHours` | boolean | Y | Y | By arrangement outside listed hours |
| `facePhotoUrl` | string | Y | Y | Required close-up face photo. NOT ID or passport. Phase D. |
| `showFacePhoto` | boolean | Y | Y | Supplier-controlled face photo visibility. Phase D. |
| `photos` | array | Y | Y | `[0]`=face, `[1]`=card/public, `[2]+`=additional |
| `vetNotes` | string | Y | Y | Admin only. NEVER shown to supplier. |
| `rejectionReason` | string | Y | Y | Shown to supplier only when `status = rejected` |
| `uid` | string | Y | Y | Firebase Auth UID. Field only — NOT document ID. |
| `createdAt` | timestamp | Y | Y | When supplier registered |
| `lastUpdated` | timestamp | Y | Y | When supplier last updated |

### pending_registrations collection
Document ID: phone number (e.g. `+27842500422`)

| Field | Notes |
|---|---|
| `cellNumber` | Phone from OTP verification |
| `createdAt` | serverTimestamp() — written at OTP verify |
| `status` | `incomplete` → `completed` on submit |
| `supplierNumber` | Added after Personal/Business section saved |
| `smsSent` | Boolean — set `true` after 24h reminder SMS fires. Never fires twice. |
| `dataConsentGiven` | `true` — saved at consent gate |
| `dataConsentTimestamp` | serverTimestamp() — saved at consent gate |
| All section fields | Merged progressively via `setDoc merge:true` |

### settings/config document

| Field | Value | Notes |
|---|---|---|
| `priceIndividual` | 299 | NEVER hardcode. Always read from here. |
| `priceSpa` | 999 | NEVER hardcode. Always read from here. |
| `counterIndividual` | 25 (seed) | Increments with each new therapist |
| `counterSpa` | 25 (seed) | Increments with each new spa |
| `autoApprove` | false | ALWAYS false in production |
| `verificationHoldHours` | 24 | Hours before profile goes live after payment |

### offerings collection

| Field | Notes |
|---|---|
| `category` | `massageStyles`/`traditions`/`treatments`/`classification`/`serviceOfferings`/`amenities`/`associations` |
| `name` | Display name |
| `launchActive` | Boolean — show at launch |
| `sortOrder` | Display order |
| `visibleTo` | Array — `['therapist']`/`['spa']`/`['therapist','spa']`. NEVER `'individual'`. |

### locations_provinces / locations_towns / locations_suburbs / locations_areas

| Collection | Key field names |
|---|---|
| `locations_provinces` | `provinceName` (NOT `province`) |
| `locations_towns` | `townName` (NOT `town`), `provinceId`, `provinceName` |
| `locations_suburbs` | `name`, `townId`, `townName`, `provinceId`, `provinceName` |
| `locations_areas` | `areaName` (NOT `name`), `townId`, `townName`, `suburbs` array |

### auditLog collection
Append-only. No update, no delete, EVER.

| Field | Notes |
|---|---|
| `action` | What happened |
| `actor` | Who triggered it |
| `supplierId` | Phone number |
| `supplierName` | firstName + lastName (never displayName alone) |
| `supplierType` | `individual` or `spa` |
| `severity` | `critical` / `important` / `low` |
| `reason` | Mandatory for admin. Auto-populated for system. |
| `oldValues` / `newValues` | Previous and updated field values |
| `timestamp` | Timestamp |

### Firestore Indexes (6 confirmed — 18 May 2026)

| Collection | Fields |
|---|---|
| `locations_areas` | townName + areaName |
| `locations_suburbs` | townName + name |
| `locations_towns` | provinceName + name |
| `suppliers` | province + status |
| `suppliers` | status + createdAt |
| `suppliers` | suburb + status |

### RETIRED FIELDS — do not use

| Field | Replaced by |
|---|---|
| `parkingAvailable` | `amenities` array |
| `showerFacilities` | `amenities` array |
| `idPhotoUrl` | `facePhotoUrl` |
| `massageArea` | `locationArea` |
| `massageTypes` | `offerings` collection |

---

## 7. Open GitHub Issues

**Total open: 26 | Last updated: 9 June 2026**
Repo: https://github.com/micmaru/massage-directory/issues

### Bugs — fix before launch

| # | Title | Priority |
|---|---|---|
| #26 | Dashboard: session OTP loop — returning supplier asked for OTP on 2nd+ visit | HIGH — primary blocker |
| #27 | Dashboard: Firebase Storage unauthorized on photo upload | HIGH |
| #28 | Dashboard: location cascade broken — province dropdown not triggering town/suburb load | HIGH |
| #29 | Dashboard: sections stay open after save — should auto-close | MEDIUM |
| #30 | Dashboard: move displayName field from Personal to About section | MEDIUM |
| #31 | Dashboard: Sign Out button label must read Back to Main Menu | LOW |
| #5 | Notification area field shows Firestore document ID not area name | MEDIUM — S7 |

### Build Pending

| # | Title | Session |
|---|---|---|
| #8 | S7: Wire admin@massagemap.co.za into Cloud Functions | S7 |
| #9 | S8: admin-supplier.html full field audit | S8 |

### Test Pending

| # | Title |
|---|---|
| #10 | Dashboard end-to-end testing — therapist |
| #11 | Dashboard end-to-end testing — spa |
| #12 | Verify associations seeded in offerings collection |

### Phase D — Design

| # | Title |
|---|---|
| #13 | DESIGN.md not applied — full design pass pending |
| #14 | Services section UX — sub-categories need visual separation |
| #15 | Tantric visual treatment in massageStyles list |

### Pre-Launch — must be done before go-live

| # | Title |
|---|---|
| #16 | Buy BulkSMS credits before Stage 2 testing |
| #17 | Legal opinion — T&Cs, POPIA compliance, Privacy Policy |
| #18 | Let's Encrypt SSL — replace self-signed cert |
| #19 | Switch Resend sender to notifications@massagemap.co.za |
| #20 | Firebase Phone Auth quota increase for production |
| #21 | Firebase rules full security audit before launch |

### Parked

| # | Title |
|---|---|
| #22 | favicon.ico missing — 404 on all pages |
| #23 | Replace deprecated google.maps.Marker with AdvancedMarkerElement |
| #24 | Firebase tools upgrade 15.14 to 15.18 |

### Phase 2

| # | Title |
|---|---|
| #25 | Subscription expiry Cloud Function (dailyNotificationCheck) |

### Next Session — Start Here
1. Close #12 — verify associations seeded
2. Close #10 — dashboard therapist end-to-end test
3. Close #26 — OTP loop fix (primary blocker)
4. Close #28 — location cascade fix
5. Close #27 — Firebase Storage auth fix
6. Then #8 — S7 wire admin email into Cloud Functions

---

## 8. Phase Tracker & Session Build Plan

**Launch target: 31 July 2026**
**Supplier target end 2026: 50 therapists + 10 spas**
**Geography: National — all 9 provinces**

### Session Build Plan

| Session | Description | Status | Date | Commit |
|---|---|---|---|---|
| S1 | Schema clean slate + seed 50 records | DONE | 20 May 2026 | — |
| S2 | Therapist registration full rebuild | DONE | 22 May 2026 | 6f3cdc9 |
| S3 | Spa registration build + test | DONE | 23 May 2026 | — |
| S6 | Supplier dashboard full accordion rebuild | DONE | 3 June 2026 | 0338952 |
| S7 | Wire admin@massagemap.co.za + fix notifications + redirect fix | PENDING | — | — |
| S8 | admin-supplier.html full field audit | PENDING | — | — |
| S30 | Firestore security rules full audit | PENDING — pre-launch | — | — |
| S31 | SSL upgrade to Let's Encrypt | PENDING | — | — |
| S34 | firebase-functions upgrade 15.14 → 15.18 | PARKED | — | — |

### Phase Plan

**Phase A — Core Registration: DONE**
- Therapist registration end-to-end ✓
- Spa registration end-to-end ✓
- POPIA consent gate ✓
- pending_registrations flow ✓
- Schema clean slate + seed ✓

**Phase B — Dashboard & Admin: IN PROGRESS**
- Supplier dashboard accordion rebuild ✓ (S6 — 3 June 2026)
- Wire admin@massagemap.co.za into Cloud Functions (S7)
- Fix notification field values (S7)
- Fix redirect after return login (S7)
- admin-supplier.html full field audit (S8)
- Dashboard end-to-end testing — therapist and spa (next session)
- Seed offerings category: associations (before dashboard testing)

**Phase C — Admin Location Management**
- Admin CRUD for location data
- Area management UI in admin.html

**Phase D — Design Pass + Spa Rebuild + UX**
- Full DESIGN.md design pass
- Spa registration full rebuild (register-spa.html) — design first, mockup approved, then build
- register-spa.html location cascade fix (reads locations.json — replace with Firestore)
- facePhotoUrl and showFacePhoto fields added platform-wide
- Services section UX — sub-category visual separation
- Screen flow diagrams in draw.io
- Real supplier user testing before finalisation

**Phase E — Payments, Hosting & Launch Prep**
- PayFast live credentials
- Switch Resend sender
- Manual EFT flow
- Git deployment GitHub to cPanel
- SSL upgrade
- Firestore security rules full audit
- Legal opinion
- BulkSMS credits top-up
- Launch marketing: TikTok, Facebook, Twitter, Instagram
- SMS outreach to competitor suppliers and Google Maps providers

### Platform Status — 9 June 2026

| Item | Status |
|---|---|
| register.html (therapist) | WORKING — accordion, end-to-end tested |
| register-spa.html (spa) | WORKING — 2 known bugs (Issues #1, #2) |
| dashboard.html | BUILT — 3 June 2026 (944 lines, commit 0338952). End-to-end testing pending. |
| Coming soon page | LIVE — massagemap.co.za since 4 June 2026 |
| Google Cloud billing | DONE — Blaze plan, credit card attached, 9 June 2026 |
| admin@massagemap.co.za | DONE — cPanel, Outlook confirmed working |
| Global CLAUDE.md | DONE — 8 June 2026 |
| Obsidian vault | DONE — 7 folders, iCloud, mmstart hook active |
| BulkSMS credits | AT ZERO — buy before Stage 2 |
| associations seeding | NOT CONFIRMED — verify before dashboard testing |

---

## 9. Product Definition

*(Full detail in MM-Product-Definition-v1.md in Obsidian — key facts below)*

- Real market: 15,000–30,000 active providers nationally. Competitor has less than 5%.
- Therapist subscription: R299/month. Spa subscription: R999/month.
- Customer journey: maximum 4 taps from home to contact.
- No reviews, no booking system, no customer accounts at launch.
- Enquiry form permanently removed — Call and WhatsApp direct contact only.
- Out of scope forever: adult classification, body map, ID photo upload at registration, online booking.

---

## 10. API Reference

*(Full detail in MM-API-Reference-v1.md in Obsidian — critical rules below)*

| Service | Critical rule |
|---|---|
| PayFast | Signature NEVER client-side. Parameter order FIXED. Prices from settings/config only. |
| BulkSMS | SMS only for `supplierType === 'individual'`. Cloud Function only. Credits at ZERO. |
| Resend | Never called from browser. Cloud Function only. Admin recipient must be admin@massagemap.co.za (not yet wired). |
| Telegram | Always `firstName + lastName`. Fires on `registrationComplete: true`. |
| Google Maps | On-demand loading only. Never load globally. |
| Firebase Functions | ALWAYS us-central1. Never africa-south1. |

---

## 11. Workflow Rules

*(Full detail in MM-Workflow-Rules-v1.md in Obsidian — critical rules below)*

1. Every session starts with: review CLAUDE.md → run mmstart → load Master Context → GitHub Issues deep dive
2. Discuss and agree in claude.ai BEFORE any code. Claude never writes code in claude.ai unless Johan explicitly approves.
3. Brief labels: `CLAUDE CODE terminal` or `ZSH terminal` — OUTSIDE the code block, never inside
4. git push: end of session only, or when Johan explicitly asks. Never mid-session.
5. Every field name comes from this document or MM-Field-Register-v1.md. No guessing.
6. Dark theme permanently retired. Never reintroduce.
7. Prices always from settings/config. Never hardcode R299 or R999.
8. Cloud Function is sole notification sender — never from browser.
9. ONE BRIEF AT A TIME, WAIT FOR THE ACTUAL COMMIT. Never issue a second brief, a mockup discussion, or a test instruction until Claude Code's commit confirmation (hash + files-changed summary) for the current brief has been seen and checked against what the brief asked for. Added 12 July 2026 after a session where combined/rapid briefing caused two sub-fixes (thumbnail wiring in Section 8's onPhotoChange/deletePhoto) to get silently skipped — Claude Code had moved on to a later brief before the earlier one's full scope had landed, and testing began before the gap was caught.

---

## 12. Build History — Session Log

| Date | Session | Summary |
|---|---|---|
| 8 April 2026 | Start | Project started. Firebase setup. Initial HTML structure. |
| 9 April 2026 | — | index.html, listings.html, profile.html built. Google Maps integrated. |
| 21 April 2026 | — | PayFast integration. Cloud Functions setup. subscribe.html, payment.html built. |
| 28 April 2026 | — | Admin dashboard built. Vetting flow. Approve/Reject/Investigate. |
| 5 May 2026 | — | Phone Auth OTP integrated. register.html v1 built. Session token localStorage pattern. |
| 6 May 2026 | — | BulkSMS integrated. Telegram Bot. Resend email. Full notification stack working. |
| 7 May 2026 | — | Cloud Function response logging. Firestore field name mismatches fixed. Node.js v20→v22. BulkSMS confirmed working. |
| 12 May 2026 | — | Claude Code safety hooks installed. Therapist welcome email fix. Adult removed from massage types. WhatsApp removed from Contact Preferences. |
| 13 May 2026 | — | Double-fire notification bug FIXED. supplierName scoping bug fixed. Location data audit — 9 provinces, 189 towns, 8,626 suburbs. |
| 14 May 2026 | — | LOCATION MIGRATION TO FIRESTORE. locations.json → four Firestore collections. Admin Location Manager updated. Service account key accidentally committed — removed from git history. Key fe6da6441d revoked. Key 21529ba152 active. |
| 15 May 2026 | — | Firestore rules updated. changeLogs index created. register.html location cascade migrated to Firestore. locationArea dropdown added. locations.json deleted. |
| 16 May 2026 | — | Phase A formally closed. Location Manager rebuilt. T&Cs screen added. subscriptionStatus field introduced. |
| 17 May 2026 | — | OFFERINGS ARCHITECTURE. massageTypes → offerings Firestore collection. 6 categories, 72 items seeded. 46 supplier documents migrated. admin-supplier.html built (836 lines). |
| 18 May 2026 | — | Schema Reference v1 built. auditLog architecture finalised. Product Definition Document v1 built. Launch date confirmed end July 2026. Git commit fad495c pushed. |
| 19 May 2026 | — | Session Build Plan v1 — 40 sessions, 5 stages. Supplier Field Reference v2 built. Key decisions locked: supplierNumber format, amenities, GPS rules. |
| 20 May 2026 | S1 | POPIA decisions locked. S1 executed: 46 old records deleted, 25 therapists + 25 spas seeded. Git commit 0d55a8c pushed. |
| 21 May 2026 | S2 begin | admin@massagemap.co.za created. S2 therapist registration full rebuild — git commit 6f3cdc9 (724 insertions). POPIA consent gate. pending_registrations introduced. supplierNumber format locked. |
| 22 May 2026 | S2 test | Firestore rules fixed. Two missing indexes created. Session token OTP skip fixed. Suppliers document ID changed to phone number — LOCKED. registrationComplete added. End-to-end confirmed working. |
| 23 May 2026 | S3 | Spa registration full build. register-spa.html built in 9 briefs. associationMembership multi-select. onSupplierRegistered changed onCreate→onUpdate. Spa confirmed working end-to-end: S-26-1001. Git pushed. |
| 25 May 2026 | CRASH | **SYSTEM CRASH — dashboard files and one register file wiped. Recovery session followed with significant reconstruction effort.** |
| 1 June 2026 | Recovery | Context fully recovered. Ground truth confirmed: d1802ad is baseline. Dashboard build plan locked. Key decisions confirmed: one dashboard.html, no separate dashboard-spa.html. No code written — planning only. |
| 3 June 2026 | S6 | DASHBOARD BUILD. dashboard.html built from scratch using register.html as template. commit f3a8404 (944 insertions). Two JS errors fixed. Both therapist (8 sections) and spa (9 sections) confirmed rendering. Final git push: 0338952. |
| 4 June 2026 | Housekeeping | GitHub Issues set up — 7 labels, 25 issues logged. CLAUDE.md fully rewritten — committed 76d992a. Coming soon page live on massagemap.co.za. Fresh therapist registered: 0800000001 (clever cathy, T-26-1035). Registration end-to-end confirmed. Session OTP loop partially investigated. Multiple dashboard bugs identified and logged. |
| 8 June 2026 | Infrastructure | Global ~/.claude/CLAUDE.md created. Project CLAUDE.md restored/cleaned. Obsidian vault 7 folders built. settings.json corrected. mmstart hook active. Security-guidance plugin installed. MCP Miro disabled. |
| 9 June 2026 | Decision audit | Full decision audit — 214 decisions reviewed from v20–v47. 7 Obsidian reference files created. Google Cloud billing confirmed. facePhotoUrl replaces idPhotoUrl. showFacePhoto Boolean added. Enquiry form permanently removed. Launch date confirmed 31 July 2026. gh CLI installed. MM-Decision-Review_09062026_v0.xlsx created. |

---

## 13. Parked Items

| Item | Detail |
|---|---|
| draw.io install + screen flow diagrams | Dedicated session — all 6 flows to be built together |
| gh CLI authentication | Token method works — confirm at next session start |
| MM-Architecture diagram | System flow, Cloud Functions map — not yet built |
| Services section split | Break into separate accordion sections — Phase D, review with real users |
| facePhotoUrl + showFacePhoto | Must be added to schema and all code — Phase D |
| firebase-functions upgrade | 15.14 → 15.18 — parked to S34 |
| Let's Encrypt SSL | Replace self-signed cert — S31 |
| Firebase Phone Auth quota | Increase for production — S34 |
| Switch Resend sender | To notifications@massagemap.co.za — Stage 4 |
| Legal opinion | T&Cs, POPIA, Privacy Policy — pre-launch, not DIY |
| Firebase security audit | Full audit before launch |
| Google Maps Marker deprecation | Replace with AdvancedMarkerElement — post-launch |
| GoTyme Bank partnership | Post-launch commercial activity |
| WhatsApp notifications | Phase 2 |
| BulkSMS credits | At zero — buy before Stage 2 |
| 2-day post-registration SMS | If no face photo/email after 2 days — parked until BulkSMS topped up |
| changeLogs vs auditLog | Architecture decision pending — consolidate or keep separate |
| register.html?type=spa redirect | Opening therapist registration with type=spa should redirect to register-spa.html |
| Claude Design setup | claude.ai/design — colour tokens, GitHub repo link — platform issue during attempt |
| favicon.ico | 404 on all pages — fix before launch |

---

*MassageMap Master Context v49 | 9 June 2026 | Johan Cilliers | Confidential*

---

## Session Log — 10 June 2026

### What we did
- Read MM-Master-Context.md and generated full development plan visual tracker (5 phases, S1–S40)
- Generated MassageMap Dev Plan v1 10Jun2026.docx — saved to docs/ and pushed to GitHub
- Compared original Session Build Plan v1 (19 May) against actual progress — confirmed aligned at end of S6
- Ran live tests on S2 (therapist registration), S3 (spa registration), S6 (therapist dashboard)

### Test results
- S2 Therapist registration: NOT DONE — 11 bugs logged (#32–#37 plus existing #3, #5, #6, #28)
- S3 Spa registration: NOT DONE — 5 bugs (shares root causes with S2)
- S6 Therapist dashboard: NOT DONE — sections 2/4/6/7 save correctly, but OTP loop (#26), location broken (#28), photos broken (#27/#40), associations not loading (#12), travel question missing (#39)
- S6 Spa dashboard: NOT TESTED — deferred until therapist dashboard fixed

### GitHub issues created today
- #32 locationArea saves as null
- #33 area + suburb must both show, selecting one clears other
- #34 province saves lowercase/hyphenated
- #35 welcome email uses displayName not firstName+lastName
- #36 premisesType + mobileAvailable on therapist doc
- #37 referralCode generating — parked feature
- #38 qualifications field not editable in dashboard
- #39 travel question + distance options missing
- #40 photos uploaded during registration not showing in dashboard

### Decisions made
1. Dev Plan kept as separate docx — not merged into Master Context
2. S2, S3, S6 confirmed NOT DONE after live testing
3. Spa dashboard test deferred
4. Fix order agreed: location cascade (#3/#28/#32/#33/#34) → OTP loop (#26) → associations (#12) → admin email (#6/#8) → photos (#27/#40)
5. Both area AND suburb always show on registration — selecting one clears the other
6. Sign out button label must read "Sign Out of Dashboard"

### Next session starts with
Fix location cascade first — covers #3, #28, #32, #33, #34 across register.html and register-spa.html. Read this file and Dev Plan before any code. Discuss and agree approach before any brief.

---

## Session Log — 10 June 2026 (Session 2)

### What we did
- Switched to Claude Fable 5 (claude.ai + Claude Code default;
  included until 22 June - revert default after)
- Diagnosed location cascade across register.html,
  register-spa.html, dashboard.html - findings logged below
- Recovered pre-crash dashboard.html from git commit c778baa
- #26 root cause: rebuilt dashboard had NO login/session code,
  hard-redirected to index.html on every visit
- Transplanted OTP/session login from pre-crash file (ba7b966)
- Fixed auth-timing race: session check waits for
  onAuthStateChanged; session never deleted on read errors
  (38f8310)
- #26 VERIFIED FIXED in browser: return visit straight to
  dashboard, no OTP; OTP only after sign-out

### Diagnosis findings (cascade - fix not yet done)
- #32: silent query-failure path + no save validation +
  'none' sentinel leakage
- #33: regression, NOT new decision - spec was always both
  area+suburb visible, selecting one clears the other
- #34: saves doc IDs for province/area, display name for
  suburb - mixed formats
- #28: dashboard has NO cascade at all - must be built
- Cascade duplicated byte-identical in both register files
- Dead buildFormData() in both register files - remove later

### Decisions made
1. #26 fix: restore from git, transplant, adapt to doc-ID
   architecture
2. Lesson locked: NEVER rebuild a working file from scratch -
   restore from git, then clean
3. #33 reclassified as regression
4. NEW ISSUE: Sign Out misaligned - suppliers will tap it
   after every edit, killing session. Proposed Done button
   (keeps session) + small Sign Out link. NOT YET APPROVED.
5. Dashboard hamburger is a bug - remove (not yet done)
6. Product behaviour must be documented before briefs -
   supplier journey doc next session

### Parked items (carry forward)
- Location cascade fix briefs (#3/#28/#32/#33/#34) - pending:
  name+ID vs name only; shared file vs fix twice
- Dashboard cascade build (#28)
- Sign Out / Done redesign - awaiting Johan
- Dashboard hamburger removal
- reCAPTCHA dev throttling - Firebase test-mode skip
- dashboard-precrash.html (untracked, reference) - delete
  after cascade fixes
- Dead buildFormData() removal
- index.html dark theme - Phase D
- draw.io install + supplier journey doc - NEXT SESSION START

### Git
- ba7b966 - Fix #26: restore OTP/session login (c778baa)
- 38f8310 - Fix #26 part 2: session check waits for auth
- Both pushed

### GitHub Issues
- #26: fixed and verified - close when Johan confirms
- New to log: dashboard hamburger removal; Sign Out/Done

### Next session starts with
draw.io install -> supplier journey doc (plain text, Johan's
words) -> Sign Out/Done decision -> cascade fix briefs

---

## Session Log — 11 June 2026

### What we did
- OTP Reference v0.1 created (O1-O9) — supersedes Notification
  Reference v1 Appendix A; login.html never existed, login
  lives in dashboard.html
- Dashboard exit redesign: mockup approved + implemented +
  tested 100% — primary "Back to Main Menu" (navigate only,
  session kept) + secondary "Sign Out" (shared-device case)
- admin.html + admin-supplier.html restored from d1802ad —
  deleted unnoticed in 0338952; HD backup byte-identical
- Repo hygiene: backup/, _backup_pre_offerings_migration/,
  ~$* lock files — untracked and gitignored
- Live Firestore verified: all locations_* collections use
  `name` for own display name (areas: areaName)

### Decisions made
1. Cascade: locationArea saves areaName
2. Cascade: one shared location-cascade.js for register.html,
   register-spa.html, dashboard.html
3. Hamburger removal bundled into next dashboard brief
4. Old sign-out handler deleted mm_session_ tokens against
   Decision 21 — corrected
5. Field Register correction needed: provinces/towns own
   field is `name`, not provinceName/townName

### Parked items (carry forward)
- Location cascade briefs (#3/#28/#32/#33/#34) — ready to write
- Footer "Join here" link — remove/repoint/relabel pending
- Field Register + Master Context locations field correction
- O7/O8 OTP routing — verify in live testing
- draw.io OTP cycle diagram from OTP Reference v0.1
- dashboard-precrash.html — delete after cascade fixes
- Dead buildFormData() removal
- Dashboard dark theme — Phase D

### GitHub Issues
- #26 verified fixed after exit-button testing — close on GitHub
- New to log: hamburger removal; footer "Join here" link

### Next session starts with
Location cascade brief discussion — shared location-cascade.js,
verified live field names, fixes #3/#28/#32/#33/#34

---

## Session Log — 11 June 2026 (Session 2)

### Decisions made
1. location-cascade.js in project root (no js/ folder)
2. 6 location fields saved: province, provinceName, area,
   townName, locationArea, suburb
3. Area/suburb mutual exclusion — select one, other hides;
   clear-selection restores both
4. No areas for town: area field hidden entirely
5. Empty string for unpicked field (not null)
6. Spas keep locationArea — customers search by area
7. Cell number = one supplier type permanently, no cross-use
8. Dashboard login: silent Firestore check BEFORE any OTP
9. In-between choice screen: DELETE (pre-crash baggage)
10. dashboard.html: no supplierType routing
11. Wrong-door/not-found: generic message, auto back to menu
12. OTP sequence locked and logged in full

### What was built
- location-cascade.js created (280b415) — 132 lines
- register.html wired (fef07e8) — 159 deletions
- register-spa.html wired (4338436) — 159 deletions
- dashboard.html cascade built (fd282ab)

### Known bugs to fix next session
- townName not writing to Firestore (getLocationValues bug)
- Dashboard header shows phone not supplier name
- 0800000002 spa loads therapist template

### Parked
- OTP/login rework (full spec logged above)
- Geocoding gap when area selected
- OTP Reference v0.2
- dashboard-precrash.html deletion
- buildFormData() removal
- Hamburger removal

### Next session starts with
Fresh browser test (clear cache) → fix townName bug →
OTP login rework discussion

---

## Session Log — 12 June 2026

### What we did
- Diagnosed and confirmed location cascade working 100% in register.html
- Retired `area` field permanently — renamed to `townId` across all files
- `locationArea` confirmed correct — stores `areaName` value
- Admin vetting card location line fixed — now shows provinceName | townName | locationArea | suburb
- `provinceName` and `townName` added to `finalData` in register.html and register-spa.html
- Fixed OTP double-fire bug — dashboard now redirects to register.html?phone= after OTP for unknown number
- Phone derived from Firebase Auth (onAuthStateChanged) not URL parameter — security fix
- admin-supplier.html `area` → `locationArea` rename (its area select is locationArea, not town)
- CLAUDE.md updated — admin-supplier.html has own legacy cascade, not shared location-cascade.js

### Commits this session
- da3fc5c — Rename area to townId in register/dashboard/location-cascade
- eeef2f9 — Rename area fields in admin files
- 8ab8209 — Fix admin vetting card location display — use display names not IDs
- e52f36c — Copy provinceName and townName to suppliers doc on final submit
- 5d1f986 — Fix double OTP: pass phone in URL redirect, skip OTP in register.html
- 34ca944 — Security fix: derive phone from Firebase Auth not URL parameter

### Decisions made
1. `area` field retired permanently — `townId` is the replacement everywhere
2. `locationArea` stores `areaName` — locked, no change
3. Admin vetting card uses display names not Firestore IDs
4. OTP skip on redirect uses Firebase Auth phone — not URL parameter
5. admin-supplier.html has own legacy cascade — separate session to fix
6. Master Context version number and date must be updated every session

### Known bugs to fix next session
- No exit button on register.html for incomplete registration
- Flash of phone screen on register.html redirect (minor)
- admin-supplier.html legacy cascade — needs full rewrite
- locations_areas Firestore write permission error
- Firestore security rules — allow update: if true on suppliers — pre-launch audit
- admin-supplier.html town dropdown won't pre-fill for suppliers registered before 12 June 2026 (old records have `area` not `townId`) — risk of admin overwriting location with blank town on save

### Parked
- register-spa.html — not tested this session
- dashboard header shows phone not supplier name
- spa loads therapist template on dashboard
- dashboard-precrash.html — delete after all fixes confirmed

### Next session starts with
Fix exit button on register.html for incomplete registration

---

## Session Log — 13 June 2026

### What we did
- Established draw.io workflow — XML from claude.ai, pasted via Extras → Edit Diagram
- Agreed M-numbering system — M-0 master hub, hierarchical sub-numbers (M-1.1, M-1.2 etc.)
- Colour code locked — teal=navigation, light blue=indicators, purple=supplier screens, green=customer screens, yellow=title boxes
- M-0 confirmed as living document — new screens get new M-numbers added
- Post-payment flow confirmed — Registration → Payment → M-0 (not dashboard)
- M1 Therapist Registration flow agreed and completed

### Decisions made
1. draw.io workflow — XML from claude.ai, paste via Extras → Edit Diagram
2. M-numbering system — M-0 master hub, hierarchical sub-numbers
3. Colour code locked — teal=navigation, light blue=indicators, purple=supplier screens, green=customer screens, yellow=title boxes
4. M-0 is a living document — new screens added as M-numbers
5. Post-payment flow — Registration → Payment → M-0 (not dashboard)
6. M1 covers therapist journey only — spa gets own diagram (M2)
7. Hamburger menu on M-0 is intentional and stays — only removing from register.html, register-spa.html, dashboard.html
8. "Registration complete?" — Yes → Save Registration / No → M-0 (back to main menu)
9. "Pay now?" — Yes → Payment M-1-1 → M-0 / No → M-0
10. Valid Session Token → No = wrong/invalid token → back to M-0
11. Hamburger "Make Payment" path always requires OTP regardless of session token
12. Check Supplier Record → Payment M-1-1 → M-0
13. M2 = duplicate of M1 with Therapist→Spa and M-3→M-4 label changes

### Diagrams completed
- M1 Therapist Registration ✅

### GitHub issues to raise
- Remove bottom link "Are you a therapist or spa? Join here" from index.html
- Remove hamburger from register.html and register-spa.html
- Remove hamburger from dashboard.html

### Next session starts with
Continue M-diagram series — M2 through M9

---

## Session Log — 14 June 2026

### What we did
- Completed M0, M2, M3, M4, M6, M7, M8 diagrams
- M9 confirmed as payment flow — PayFast and Manual EFT both part of M9
- M5 confirmed as document library only — no static about us content
- Admin touch points standardised — dashed charcoal nodes across all diagrams
- Payment M-1-1 renamed to M9 across M1 and M2, colour updated to dark olive/green
- Two M9 entry points: "Entry from M0" (teal) and "Entry from M1/M2" (purple)
- M0 updated — M9 added via hamburger menu

### Decisions made
1. M1 never connects to M3 — separate loops, both return to M-0
2. M9 = Payment flow (M-0 → M9 → M-0, separate diagram)
3. Dashboard sections detail = separate diagrams (M3-1, M4-1)
4. M3 entry from M-0 only — M1 never routes to M3
5. No valid token → OTP → OTP invalid = number doesn't exist → redirect to M1 Registration
6. Dashboard actions: View/Edit Profile → Make Payment → M-0 (sequential, not parallel)
7. Back to Main Menu → M-0 (session preserved)
8. Sign Out → M-0 (shared device)
9. M3-1 rule: section edit must be saved before supplier can exit that section
10. M4 is M3 with Therapist→Spa, M1→M2, M3-1→M4-1 label changes
11. M6 active-only filter at every level — zero-count items never display
12. M6 display order — Areas first, then unclustered suburbs, flat list, one pick
13. M6 auto-skip — single area/suburb result → skip selection, go straight to Results
14. M6 back navigation — customer can go back up one level at each step
15. Back to M-0 from within browse flow — parked pending customer testing
16. "No results" at Results List level now impossible due to active-only filter
17. M7 and M8 inherit same active-only filter rule
18. M9 — both PayFast and Manual EFT are part of M9
19. M9 entry points — "Entry from M0" (teal) and "Entry from M1/M2" (purple)
20. Payment M-1-1 renamed to M9 across M1 and M2
21. M5 is purely a document library — no static about us content
22. Admin touch points shown as dashed charcoal nodes — locked standard across all diagrams
23. Supplier profile screen is pre-launch critical — not Phase D
24. M8 is the flagship screen — premium design treatment required
25. Phase 2 strictly: online booking, referral system, extended classifications, TikTok, WhatsApp — no exceptions

### Diagrams completed
- M0 ✅ (updated — M9 added via hamburger menu)
- M1 ✅ (Payment M-1-1 → M9, colour updated)
- M2 ✅ (fixes + Spa Dashboard M-3 → M-4)
- M3 ✅
- M4 ✅
- M5 ✅
- M6 ✅
- M7 ✅
- M8 ✅
- M9 ✅

### Outstanding diagrams
- M3-1 — Therapist Dashboard sections
- M4-1 — Spa Dashboard sections

### Parked
- Supplier profile screen design — pre-launch, tied to M8 flagship
- Dark theme → warm surface rebuild — post all functionality
- Back navigation from within M6 browse flow — pending customer testing

### Next session starts with
M3-1 Therapist Dashboard sections diagram

---

## Session Log — 15 June 2026

### What we did
- M3-1 generated and pasted into draw.io — therapist dashboard sections flow
- M3-1 split into 2 pages: M3-1(a) sections flow and M3-1(b) exit flow
- All S1–S8 fields agreed, confirmed, and updated in diagram
- classification field permanently deleted platform-wide
- displayName moved from S1 to S5 About
- mobileAvailable and willingToTravelKm moved from S4 to S6
- traditions UI label changed to "Traditional massages" — Firestore field name unchanged

### Decisions made
1. S1 Personal (read-only): firstName · lastName · gender · supplierNumber · cellNumber
2. S2 Contact: whatsappNumber · showWhatsapp · email · contactPreferences · cellNumber (read-only)
3. S3 Location: province · provinceName · townId · townName · locationArea · suburb · addressLine1 (admin-only) · addressVisible · gpsLat · gpsLng — both ID and display name fields kept
4. S4 Premises: premisesType · amenities
5. S5 About: displayName · genderServed · experienceYears · aboutMe · qualifications · associationMembership · specialsText
6. S6 Availability: weeklyHours · availableOutsideHours · mobileAvailable · willingToTravelKm
7. S7 split into 4 sub-sections: S7a massageStyles · S7b traditionalMassages · S7c treatments · S7d serviceOfferings
8. traditions Firestore field name unchanged — UI label changes to "Traditional massages" platform-wide
9. classification permanently deleted platform-wide — M1, M2, M3, M4, admin screens, offerings collection, Field Register
10. S8 Photos: facePhotoUrl · showFacePhoto · photos[0] · photos[1] · photos[2+]
11. Dashboard exit flow: Back to Main Menu (session preserved) · Submit Registration · Sign Out (small text link, shared device)
12. Submit Registration condition: all required sections complete — S1 + S3 + S5 + S7 + S8
13. Hamburger menu exists on M0 ONLY — permanent rule, no exceptions platform-wide
14. Sign Out = small secondary option — clears session token only, nothing in Firestore
15. M3-1 split into 2 pages: M3-1(a) sections flow · M3-1(b) exit flow
16. M4-1 = M3-1 with Therapist→Spa label changes (not yet built)

### Diagrams completed
- M3-1 ✅ (2 pages — sections flow and exit flow)

### Outstanding diagrams
- M4-1 — Spa Dashboard sections

### GitHub issues to raise
1. Remove classification field platform-wide — register.html, register-spa.html, dashboard.html, admin.html, admin-supplier.html, offerings collection (delete 3 seeded records), Field Register
2. Rename traditions UI label to "Traditional massages" — all screens where traditions displays to supplier or customer (Firestore field name unchanged)
3. Remove hamburger menu from dashboard.html — confirmed bug, permanent rule: hamburger on M0 only
4. Add Submit Registration button to dashboard — only active when S1+S3+S5+S7+S8 complete; sits alongside Back to Main Menu; Sign Out below as small text link

### Parked
- Supplier profile screen design — pre-launch, tied to M8 flagship
- Dark theme → warm surface rebuild — post all functionality
- Back navigation from within M6 browse flow — pending customer testing
- Photos bugs (#27, #40) — own session
- S7 sub-section split in code (S7a/b/c/d) — Phase D UX pass

### Next session starts with
M4-1 Spa Dashboard sections diagram

---

## Session Log — 16 June 2026

### What we did
- M4-1(a) and M4-1(b) created in draw.io — spa dashboard sections and exit flow
- S9 Ownership dissolved — owner fields moved to S1, manager fields moved to S2
- Spa now has 8 sections (same as therapist) — S9 no longer exists
- Required sections for spa Submit Registration locked: S1 + S3 + S7 + S8 (S5 About optional for spa)
- M-diagram series confirmed 100% complete

### Decisions made
1. Spa S1 — Business Info (read-only, admin-only changes): displayName · tradingName · registrationNumber · vatNumber · ownerFirstName · ownerLastName · ownerMobile
2. Spa S2 — Management & Contact (editable by spa): managerFirstName · managerLastName · managerMobile · cellNumber (r/o) · spaPhone · spaPhoneVisible · spaMobile · spaMobileVisible · email · whatsappNumber · showWhatsapp · contactPreferences · requiresInvoice
3. managerFirstName · managerLastName · managerMobile are editable by spa (managers change)
4. ownerFirstName · ownerLastName · ownerMobile are read-only / admin-only (locked post-registration)
5. S9 Ownership section dissolved — ownership fields distributed into S1 and S2
6. Spa has 8 sections total — not 9
7. S4 for spa = amenities only (no premisesType — spas do not have a premises type)
8. S5 About is NOT a required section for spa Submit Registration
9. Spa Submit Registration required sections: S1 + S3 + S7 + S8
10. S4 premisesType note retained on diagram as reminder only — not a spa field
11. M4-1(b) exit flow identical to M3-1(b) — same for both supplier types
12. M-diagram series 100% complete

### M-Diagram status
- M0 ✅ M1 ✅ M2 ✅ M3 ✅ M4 ✅ M5 ✅ M6 ✅ M7 ✅ M8 ✅ M9 ✅
- M3-1 ✅ (a + b)
- M4-1 ✅ (a + b)
- Diagram series 100% COMPLETE

### Diagrams completed
- M4-1 ✅ (2 pages — sections flow and exit flow)

### Parked
- All parked items from previous sessions carry forward
- Supplier profile screen design — pre-launch, tied to M8 flagship
- Dark theme → warm surface rebuild — post all functionality
- Back navigation from within M6 browse flow — pending customer testing
- Photos bugs (#27, #40) — own session
- S7 sub-section split in code (S7a/b/c/d) — Phase D UX pass

### GitHub issues to raise
- See issues logged in 15 June 2026 session — not yet raised on GitHub

### Next session starts with
Return to active code development — agree priority order from open GitHub issues and session bugs

---

## Session Log — 24 June 2026 (Post-Crash Recovery)

### What happened
- System crash occurred between 16 June and 23 June sessions — Claude Code and claude.ai both unresponsive
- Crash occurred AFTER the #6 admin email fix was made but BEFORE it was committed/pushed to GitHub
- Recovery session today: confirmed fix survived locally, committed and pushed to GitHub successfully — fix is now safe
- A GitHub issues work plan dated 23 June 2026 was produced (separately) listing launch-blocking, should-fix, and deferrable issues — this plan predates today's findings below and needs reconciliation against current live state before being treated as authoritative

### Confirmed working (live-tested today)
- Location cascade CONFIRMED WORKING on register.html (therapist registration) — live tested with new therapist 0800000004 (Jane Le Roux), supplierNumber T-26-1044
- Location cascade CONFIRMED WORKING on dashboard.html (therapist dashboard)
- SPA SIDE NOT YET TESTED — register-spa.html and spa dashboard cascade behaviour unknown, do not assume fixed
- #6 admin email fix CONFIRMED: functions/index.js:169 and functions/sendAdminNotification.js:29 both changed from hjcilliers@gmail.com to admin@massagemap.co.za
- #6 fix CONFIRMED DEPLOYED via firebase deploy --only functions, confirmed live on a therapist registration before the crash
- #6 fix NOT YET TESTED on spa registration path

### New issue identified — not yet confirmed on GitHub issue tracker
Flow-blocker: therapist registration does not allow exit-and-resume after partial completion.

Current (broken) behaviour: once Section 1 (Personal) is saved, the therapist record exists on the platform, but she cannot exit to the main menu and return later to complete remaining sections — she is currently forced to complete sections in one continuous sitting.

Required behaviour:
- After Section 1 (Personal) saved, therapist is lightweight-active on the platform
- After every subsequent section save, therapist must be able to exit to main menu without losing saved progress
- Therapist must be able to return at any time and resume from where she left off
- Registration is considered "complete" only once all required sections are done (per 15 June decision: S1+S3+S5+S7+S8 for therapist, S1+S3+S7+S8 for spa)
- Front-end customer-facing visibility additionally requires admin vetting approval of required fields — completing registration alone does not make her visible to customers

This is related to but distinct from the old known bug "no exit button on register.html for incomplete registration" (that bug concerned leaving the page; this concerns leaving AND resuming). Needs a GitHub issue number — check existing issues for a match before raising new.

### Outstanding from 15 June decisions — confirmed still not coded
- classification field deletion (decided 15 June, never implemented) — still present on supplier documents, confirmed via live document inspection today

### Decisions made today
1. Working method reaffirmed: finish all therapist-side issues fully before starting any spa-side testing or fixes — issue by issue, no jumping back and forth
2. Master Context header version/date must be updated on every session close going forward — v50 silently went four sessions without a bump, will not repeat

### Parked items (carry forward, plus all previous parked items)
- Spa registration cascade re-test
- Spa dashboard cascade re-test
- Spa registration email path re-test (#6)
- Flow-blocker fix (exit-and-resume after partial section save) — needs GitHub issue number first
- classification field platform-wide deletion — still outstanding from 15 June

### Next session starts with
1. Reconcile 23 June GitHub issues work plan against today's confirmed findings (cascade fixed therapist-side, #6 fixed+deployed therapist-side)
2. Pull current `gh issue list` to get accurate open issue state
3. Check/raise GitHub issue for the exit-and-resume flow-blocker
4. Continue therapist-side issue-by-issue fixes before touching spa side

---

## Session Log — 25 June 2026 (Therapist Dashboard Full Sweep)

### What we did
- Pulled live `gh issue list` — 33 open issues confirmed (prior session's "next steps" list was incomplete; dashboard had more bugs than recorded, as suspected)
- Cleaned test data: deleted Firestore records (suppliers + pending_registrations) for 0800000001–3 and 5–8. Left 0800000004 (Jane Le Roux, T-26-1044) untouched as known-good cascade reference. Firebase Auth phone entries NOT cleared (confirmed unnecessary — OTP re-fires regardless of Auth state, all test numbers fixed at 123456)
- Registered brand new therapist from scratch on 0800000001 (sandie sandstone / "lipstick"), supplierNumber T-26-1045, using Incognito window for guaranteed clean localStorage
- Walked full registration end-to-end through all 8 sections, then into dashboard, logging every bug live with screenshots
- Diagnosed root cause of Photos save failure by reading `storage.rules` directly
- Created 11 new GitHub issues (#41–#51) for bugs with no existing match
- Closed 2 issues as not-reproducible: #38 (qualifications editability — tested live, works), #37 (referralCode — field does not exist on fresh document, no evidence of firing)
- Confirmed `gh issue list` post-update: 42 open issues, accurate current state

### Confirmed WORKING (do not re-test, do not touch)
- OTP fires and verifies correctly on both registration and dashboard entry (just unnecessarily often — see #43)
- POPIA consent gate
- Location cascade — province → town → suburb — 100% working, area vs suburb both display correctly (confirms 24 June finding, now reconfirmed on a second fresh record)
- Premises & Facilities section — saves and displays correctly
- About section — saves correctly; qualifications field IS editable post-save (#38 closed)
- Availability section — working hours grid saves correctly
- Services section — massageStyles/traditions/treatments selections save and persist correctly (classification still wrongly present — see bugs below)
- Sections 2–8 (everything except Section 1) correctly reload saved data when dashboard/registration is reopened

### Confirmed BUGS — full list, all logged to GitHub

**Root cause identified — Cluster A (highest priority, fix first):**
- **#44** — Photos: Save fails every time with `403 storage/unauthorized`. Root cause confirmed by reading `storage.rules`: rule requires `request.auth.uid == uid` on path `/suppliers/{uid}/photos/{filename}`, but the upload path uses **phone number** as `{uid}` (e.g. `suppliers/+27800000001/photos/...`). Firebase Auth UID is never equal to a phone number string — this check fails by design for every supplier, every time. Not a regression from today's OTP testing as initially suspected — this is a structural mismatch between the locked phone-number-as-document-ID architecture and storage rules written assuming `uid` = Firebase Auth UID.
- **#45** — `registrationComplete` confirmed `false` in Firestore even after all 8 sections showed "Complete" in the UI on the test record. Suspected linked to #44 (if Photos is required for the completion trigger and Photos save always fails, completion never fires) — needs code review to confirm the exact trigger condition, not yet confirmed as definitely the same root cause.
- **#46** — Zero notifications fired at any point in the registration flow, including Sign Out. Likely a downstream consequence of #45 rather than an independent notification bug.
- **#27** (pre-existing) — Storage unauthorized on photo upload. Same error as #44, likely same root cause, candidate to close as duplicate once #44 is fixed.
- **#40** (pre-existing) — Photos uploaded during registration not showing in Photos section. Likely same root cause as #44, candidate to close as duplicate once fixed.

**Cluster B — Section 1 / identity display:**
- **#41** — Header on both register.html and dashboard.html shows raw mobile number instead of therapist name.
- **#42** — Section 1 (Personal) is the ONLY section that never reloads saved data on return to registration or dashboard. Sections 2–8 all reload correctly. Suspect Section 1 reads from the wrong source (should read `pending_registrations` while incomplete, not `suppliers`, or vice versa).

**Cluster C — Session/OTP behaviour:**
- **#43** — OTP fires every single time re-entering registration after going Back to Main Menu, even though a session token should still be valid within the 30-day window. Dashboard re-entry behaviour not conclusively isolated as different — needs its own retest.
- **#51** — After Sign Out + OTP re-entry, unclear to the user (and to testing) whether the landing screen is registration or dashboard.
- **#7** (pre-existing) — showWelcomeBack redirect logic incomplete. Possibly the same root cause as #51 — needs reproduction steps to confirm link before merging.

**Cluster D — Quick UI fixes, no investigation needed:**
- **#29** (pre-existing) — Sections stay open after Save, should auto-close. Reconfirmed live — every section across the whole sweep stayed open after save.
- **#31** (pre-existing) — Sign Out button label must read "Back to Main Menu" — reconfirmed still showing wrong label.
- **#30** (pre-existing) — `displayName` field must move from Section 1 (Personal) to Section 5 (About). Reconfirmed: therapist needs to be able to change her public alias without it being locked into initial signup. Currently sits on Section 1 in both registration and dashboard.
- **#49** — `classification` field still displayed and selectable on Services section, despite 15 June 2026 decision to permanently delete it platform-wide. Confirmed still present via live registration test.
- **#35** (pre-existing) — Welcome email addressed to `displayName` instead of `firstName + lastName`.

**Cluster E — Missing/incorrect fields:**
- **#39** (pre-existing) — Travel question and distance options (`willingToTravelKm`) missing entirely from registration and dashboard. Confirmed still absent.
- **#36** (pre-existing) — `premisesType` and `mobileAvailable` saving on individual therapist document — needs field audit, not retested in detail this session.
- **#47** — Photos section gives no instruction that Photo 1 must be a face photo for admin vetting purposes. Therapist has no way of knowing this requirement.
- **#48** — No yes/no toggle in the Photos section UI for `showFacePhoto` (field exists in schema per 9 June decision, never wired to frontend).
- **#5** (pre-existing) — Notification area field shows Firestore document ID instead of area name, not retested this session.

**Cluster F — Verification only:**
- **#12** (pre-existing) — Verify associations seeded in offerings collection, not retested this session.
- **#10** (pre-existing) — Dashboard end-to-end testing — therapist. This session's sweep is effectively this test; recommend closing once Clusters A–E are fixed and a final clean re-run confirms.

**Not yet actioned:**
- **#4** (pre-existing) — info.html missing, success screen redirect broken. Not touched this session, needs its own investigation.

### Issues CLOSED this session
- **#38** — qualifications field not editable in About section. Closed: tested live, edited after initial save, change persisted correctly. Not reproducible.
- **#37** — referralCode generating on registration, parked Phase 2 feature. Closed: checked Firestore directly on fresh supplier document, no `referralCode` field present anywhere. Not reproducible on current code.

### Decisions made today
1. Working method reconfirmed: cluster bugs by likely shared root cause to fix efficiently, rather than treating all 24 therapist-side open issues as fully independent
2. Fix order agreed: Cluster A (Storage rules / registrationComplete chain) → Cluster B (Section 1 identity) → Cluster C (session/OTP) → Cluster D (quick UI fixes) → Cluster E (missing fields) → re-run Cluster F as final verification
3. Session closed deliberately early (before any fixes attempted) due to heavy image/screenshot volume in this conversation — risk of model drift. Continuing in a fresh chat for the actual fix work.
4. 0800000004 (Jane Le Roux, T-26-1044) preserved as the permanent known-good cascade reference — never delete this record without explicit replacement plan

### Parked items (carry forward, plus all previous parked items)
- Spa registration cascade re-test
- Spa dashboard cascade re-test
- Spa registration email path re-test (#6)
- All Cluster A–F items above, pending fixes in next session

### Next session starts with
Fix Cluster A first: investigate and correct the Storage rules path mismatch (#44) — `request.auth.uid` vs phone-number-as-path-segment. Confirm whether fixing this also resolves #45 (registrationComplete), #46 (notifications), #27 and #40 (duplicates). Do not start spa-side work until all therapist-side clusters are closed. Read this file before any code.

--- SESSION LOG: Audit Session (28 June – 1 July 2026) ---

DECISIONS MADE:
1. Audit plan created: 24-category checklist (MM_Audit_Plan_v4.xlsx), 
   pressure-tested against 51 GitHub issues + 12 Johan direct reports. 
   Zero gaps found after adding categories 18-24.
2. Cold codebase audit run via Claude Code background agent — 121 findings 
   across all 24 categories (MM_Pass1_Findings_Worksheet_v2.xlsx).
3. 121 findings clustered into 9 root-cause groups A-J 
   (MM_RootCause_Clusters_v1.xlsx). Original Cluster B merged into 
   Cluster A after Johan independently identified they form one feedback 
   loop — unclear identifier handling causes inconsistent identity checks, 
   which in turn causes ad-hoc identifier choices. B is absent from the 
   cluster list because it was absorbed into A.
4. Formal audit verdict written (MM_Audit_Verdict.md): KEEP BUILDING. 
   No structural rework needed. Locked architecture confirmed sound 
   (phone-as-doc-ID, suppliers/pending_registrations split, single 
   dashboard file). Two foundational fixes required before further 
   feature work: Cluster A (identity wrapper) and Clusters C/D/E 
   (security rules).
5. Firebase Console live verification completed (Step 5): 
   - Service account JSON files confirmed never pushed to GitHub — clean.
   - auditLog: anonymous read AND write confirmed live — critical.
   - suppliers: anonymous update confirmed live — critical.
   - settings/config: any authenticated user write confirmed live — high.
   - Phone auth: enabled, 1000/day SMS quota, needs Identity Platform 
     upgrade pre-scale (existing issue #20).
   - Project access: Johan only, Owner role — clean.
6. Firestore security rules fixed (Cluster C) — all open collections 
   locked down. Three actors only: admin (UID BGI0KYCKnYVM85GdlH1CG2KHP0p2, 
   Option 1 hardcoded for now), own supplier, nobody else. Rules deployed, 
   verified in Playground (all three critical tests flipped from allowed 
   to denied), committed (c3af816) and pushed to GitHub.
7. Admin UID locked: BGI0KYCKnYVM85GdlH1CG2KHP0p2 (phone +27842500422). 
   Upgrade to Option 2 (admins collection) before scaling or adding 
   second admin.
8. Supplier public/private field split identified as a required design 
   decision before Phase D customer-facing display cards are built — 
   Firestore cannot restrict individual fields within a document, so 
   public fields need to be separated from private fields at the 
   collection/sub-document level.

BUGS CONFIRMED AND FIXED THIS SESSION:
- Cluster C: All open Firestore security rules — fixed, deployed, 
  verified, committed c3af816, pushed.

PARKED — NEXT SESSION (Cluster A design):
- Identity wrapper (firebaseService.js or equivalent) — single internal 
  module that every part of the platform calls through to resolve identity. 
  Governs: which identifier (phone/UID/supplierNumber) is authoritative 
  for which action, session token handling, OTP decision logic, 
  pending_registrations vs suppliers read routing. Needs full design 
  before any brief is written. This is the highest-priority remaining 
  item from the audit verdict.
- Cluster D: Admin page authentication (accepted temporary tradeoff 
  during build, must close before launch).
- Cluster E: Telegram bot token exposed in config.js — move to 
  server-side only (fast fix, separate brief).
- Clusters F-J: Cleanup, schema fixes, deferred notification functions, 
  UX wording — lower urgency, no blocking risk.
- Four audit files saved in MM-Audit folder on Mac and to be uploaded 
  to claude.ai Project Knowledge:
  MM_Audit_Plan_v4.xlsx
  MM_Pass1_Findings_Worksheet_v2.xlsx  
  MM_RootCause_Clusters_v1.xlsx (note: v2 has Johan's B-absorbed-into-A comment)
  MM_Audit_Verdict.md
- subscriptionStatus field never transitions to 'active' (Cluster H) — 
  needs fixing when payment flow is built.
- supplierNumber null on mid-flow resume (Cluster A/F) — needs fixing 
  as part of the identity wrapper work.
- photos[0] never written — face photo lands at photos[1] not [0], 
  schema mismatch (Cluster F).
- goBack() function referenced but never defined — would throw 
  ReferenceError if button clicked (Cluster G).

GITHUB ISSUES STATUS CHANGES THIS SESSION:
- No issues closed via GitHub this session. Cluster C fix covers issues 
  #21 (Firebase rules security audit) partially — rules are now correct 
  but admin authentication (Cluster D) is still open, so #21 stays open.

NEXT SESSION STARTS WITH:
Open a fresh chat. Upload the four audit files to Project Knowledge first 
if not already done. Opening line: "Cluster C security rules fixed and 
pushed. Next is Cluster A — designing the identity wrapper. Here are the 
audit files." Do not start coding until the wrapper design is agreed.
## Session: 2026-07-03

### Decisions made
1. Rejected Obsidian Claude Code MCP integration — no reviewed
   plugin, gated command execution risk unacceptable given location
   data sensitivity.
2. Designed and locked identity wrapper (M10/M10b) — phone read from
   URL param, live UID cross-check via identity-service.js,
   single-session enforcement.
3. Built and shipped identity-service.js: resolveIdentity(),
   storeSession(), getValidSession(), clearSession().
4. Fixed dashboard.html, register.html, register-spa.html to use the
   shared wrapper instead of local session-scanning copies.
5. Fixed Sign Out to clear the session token (previously survived
   logout).
6. Fixed index.html drawer links to carry ?phone= param so valid
   sessions correctly skip OTP.
7. Confirmed area/townId field-naming confusion is real (per audit)
   — deferred to its own dedicated session, not fixed today.

### Bugs found and fixed (committed + pushed)
- Identity resolution / wrong-supplier-loads bug (M10b) — commit
  422576b
- Sign Out token persistence + OTP-skip on valid session — commit
  be9074a

### Bugs found, confirmed, NOT yet fixed
1. CRITICAL — generateSupplierNumber() transaction fails with
   Firestore permission-denied. No suppliers document is created for
   any new registration past Section 1. Blocks all new therapist
   registrations. Suspected cause: firestore.rules create-rule
   mismatch on the suppliers collection (phone-as-doc-ID vs
   UID-based rule check).
2. register.html has two entry states (?type= vs ?phone=) — needs
   confirming as intentional, not a duplicate-screen bug.
3. 0800000001's old Section 1 data confirmed missing from suppliers
   — abandoned test record predating today's fixes, not a live bug,
   no action needed.
4. dataConsentGiven/dataConsentTimestamp — only one field pair exists
   for what Product Definition specifies as two checkboxes (POPIA +
   T&C). Needs checking whether both write to the same field or a
   second field is missing from the Field Register.

### Parked (carried forward, unchanged)
- Cluster D (admin auth), Cluster E (Telegram token), Clusters F-J
  (cleanup)
- area/townId rename — own dedicated session
- auditLog rule vs CLAUDE.md documentation mismatch (Cluster J)
- register.html missing "Back to Main Menu" at bottom (UI
  inconsistency vs dashboard.html)

### Next session starts with
Pull firestore.rules, diagnose and fix the generateSupplierNumber()
permission-denied bug blocking all new registrations.

--- END SESSION LOG ---
*STANDALONE — this file contains everything needed to start any session without any other document.*

---

## Session Log — 7 July 2026 (continued after 6 July claude.ai crash)

### LOCKED DECISIONS

1. 3-identifier architecture re-confirmed, NOT reversed: phone number =
   Firestore doc ID (suppliers/pending_registrations), Auth UID = field on
   suppliers doc, supplierNumber = stable phone-independent anchor.
   Reversing to supplierNumber-as-doc-ID would require reworking OTP,
   PayFast, Resend, BulkSMS, Telegram, admin routines platform-wide
   (month+ setback). Phone-loss recovery = manual admin operation
   (copy-doc in Firebase console) until a dedicated Cloud Function is built.

2. OTP verification is ONE shared mechanism used by all four supplier
   entry points: M1 (therapist registration), M3b (therapist dashboard),
   M2 (spa registration), M4 (spa dashboard). Must be built once, reused
   identically — not duplicated per supplier type.

3. OTP failed-attempt lockout policy: 3 wrong PIN attempts → retry in
   place (same screen, same sent code) → on 3rd failure, 15-minute
   cooldown. Message: "Too many incorrect attempts. Try again in 15
   minutes, or request a new code." Fresh OTP resend allowed during
   cooldown, resets attempt counter. If 3 more fail after resend,
   escalate to 1-hour lockout. Tracked server-side only
   (otpFailedAttempts, otpLockedUntil fields on the record) — never
   client-side/localStorage.

4. New phone numbers (first-ever OTP, no record yet): rely on Firebase
   Phone Auth's built-in rate limiting. No custom otp_attempts collection.

5. 30-day device-memory check clarified: it is
   DaysSinceLastVerification > 30, checked once at phone-entry, before
   OTP starts — not a check on the phone number itself, and not repeated
   later in the flow.

6. Save / Sign Out / Submit confirmed as three distinct, correctly-scoped
   actions:
   - Save (per section): both register.html and dashboard.html, no
     completion signal.
   - Submit Registration: register.html only, gated on required sections
     (S1, S3, S5, S7, S8) complete, flips registrationComplete: true,
     fires vetting notification.
   - Sign Out: dashboard.html only, clears device session token only,
     zero Firestore effect, for shared-device use.
   - Back to Main Menu / < Back: same on both screens — leave, no
     signal, saved data stays saved.

### DIAGRAMS CORRECTED AND LOCKED

M1 (Therapist Registration):
- "Registration complete? No" loops back to Registration All Sections,
  not Main Menu (matches greyed-out disabled Submit button behaviour).
- Explicit "< Back = leave, no signal" separated from Save section.
- Old "New or Existing?" self-selection removed — OTP outcome itself
  now determines destination.
- Wrong-PIN arrow loops back to "OTP fire PIN (Via SMS)" for retry
  (was incorrectly routing to Main Menu).

M3b (Therapist Dashboard, replaces M3):
- "OTP Valid" split into two real checks: wrong PIN → retry loop;
  correct PIN + no record → M1 Registration; correct PIN + record
  exists → Dashboard.
- Wrong-PIN arrow loops back to "OTP fire PIN (Via SMS)" (was
  incorrectly routing to Main Menu).
- "Back to Main Menu" (session stays) vs "Sign Out" (clears token)
  explicitly distinguished on the diagram.
- Label corrected to "DaysSinceLastVerification > 30" (was ambiguous
  "phone Number is > 30 days").
- New "from M1 (otp check)" connector box documents the shared-
  mechanism handoff between M1 and M3b.

### BUG — ROOT CAUSE CONFIRMED, FIX AGREED, NOT YET BUILT

generateSupplierNumber() runs client-side inside a Firestore transaction
touching settings/config (increment counterIndividual), pending_registrations,
and suppliers. settings/config requires isAdmin() — supplier isn't admin,
so that write fails, and since Firestore transactions are all-or-nothing,
the entire transaction rolls back, including suppliers doc creation.
Confirmed live in Firestore console: +27800000003 exists in
pending_registrations, has no matching suppliers doc.

Agreed fix, not yet built: move generateSupplierNumber() into a Cloud
Function (Admin SDK, bypasses rules safely). suppliers create rule can
then tighten to allow create: if false — only the function creates it.
Side effect: also fixes final Submit reliability, since isOwnSupplier()
checks the uid field this same function sets.

### OPEN — NOT YET RESOLVED

1. Suppliers vs. pending_registrations write pattern: documented decisions
   (#27-32, compiled 9 June) say progressive sections save to
   pending_registrations, full suppliers doc only written at final submit.
   Johan's account: before the 25 May crash, sections wrote straight to
   suppliers from the start — original intended design, not a new request.
   NOT yet verified against pre-crash git history. Needs the same
   diagram-first treatment just used for M1/M3b before any brief is written.

2. Re-vetting trigger on post-launch profile edits (e.g. photo change):
   current architecture has no re-vetting gate after initial
   registrationComplete vetting. Needs dedicated design session — which
   fields trigger it, what "pending re-review" status looks like, whether
   old approved data stays live during re-review, how admin sees it in
   queue. Reference: supplier field reference file.

3. POPIA data separation (raised 7 July, ref: supplier field reference
   file): (a) private supplier data must be structurally separated from
   customer-facing frontend data — Firestore is flat, needs a separate
   collection/subcollection or field-level split, not commingled in one
   publicly-readable suppliers document. (b) Data shown on frontend (e.g.
   phone number) must not render in the open by default — needs
   click-to-reveal or separate-tab interaction. Frontend not yet
   designed — decide exact mechanism at that session, but requirement
   must not be dropped.

### NEXT SESSION PRIORITIES

1. Fresh chat: fix generateSupplierNumber() Cloud Function bug
2. Rebuild therapist registration/OTP screens to match locked M1/M3b
3. Verify suppliers-vs-pending_registrations against pre-crash git
   history, diagram-first before any brief
4. Design session: re-vetting trigger on post-launch edits
5. Design session: POPIA data separation + phone click-to-reveal

---

## Session Log — 8 July 2026

### DIAGRAMS CREATED AND LOCKED

M1-Firebase (new) — created and locked. Zooms into the
generateSupplierNumber() Cloud Function flow from OTP Verified through
Submit:
- Idempotent guard: suppliers/{phone} exists check before counter
  increment.
- UID creation point at Section 1.
- Sections 2-8 are direct merge writes to suppliers/{phone}.
- Resume loop reads from suppliers/{phone}, not
  pending_registrations.
- pending_registrations confirmed left permanently inert after
  Section 1 succeeds — no cleanup/delete step, kept as dev-phase
  debug trail. Revisit pre-launch whether to add a cleanup routine.

### M1 AND M3b UPDATED AND LOCKED

- Wrong-PIN handling rebuilt as a 3-tier structure: attempts 1-2
  retry the same code; attempt 3 = 15-min cooldown box with a
  reset-counter diamond (counter=1 → retry via fresh OTP,
  counter>1 → escalate); lockout box after the second failure cycle
  = 1 hour.
- resolveIdentity() correctly placed between the Hamburger menu and
  the phone-input diamond on both diagrams (was previously misplaced
  between OTP fire PIN and OTP Verification on both — corrected).
- storeSession() shown on both OTP-success branches on both diagrams.
- clearSession() added to M3b Sign Out only (wipes mm_session_<phone>
  from localStorage, zero Firestore write) — M1 has no Sign Out
  action so no clearSession() needed there.
- M1 branch-swap bug found and fixed: "phone on platform" and "phone
  not on platform" outcomes were pointing to swapped destinations
  (was routing existing suppliers to POPIA Consent and new suppliers
  to Dashboard M-3b) — now correctly matches M3b.

### DECISION #151 AMENDED (supersedes prior "silent rejection" rule)

Rejection is no longer silent. On a negative vetting outcome, an SMS
fires to the supplier: "Approval needs further clarification; please
contact admin." No specific reason is disclosed in the SMS itself.
Reasoning: silence risked supplier frustration, repeated contact
attempts, and negative word-of-mouth among therapists. Admin can have
the real conversation directly (e.g. bad photo, missing qualification),
giving her a path to correct and reapply. Investigate outcome
unchanged: no SMS to supplier, admin-only, loops back into vetting for
a second pass.

### PAYMENT FLOW RESTRUCTURED OFF M1 AND M3b

- Removed the "Pay now?" diamond and the Payment M9 branch from
  directly after Submit registration on M1.
- Removed the "Want to make a Pay now?" diamond and the Make Payment
  box from the M3b dashboard.
- Payment now lives only on the Main Menu (M0), gated by
  status = 'active' AND subscriptionStatus not already active within
  the 30-day window.
- M1 now shows a 3-way admin vetting outcome (Approve / Investigate /
  Reject-equivalent) after Submit, replacing the single pass/fail.
- Approve outcome fires the T3-equivalent SMS ("pay now") which
  unlocks the Payment option on the Main Menu.
- Hamburger Menu "Make Payment" path confirmed correctly bypasses the
  resolveIdentity() skip-logic — OTP is always required regardless of
  a valid session token (matches existing locked decision).
- KNOWN DEPENDENCY: this design cannot go live until Cluster H
  (subscriptionStatus never transitions to 'active') is fixed — the
  design is correct, the underlying payfastNotify mechanism is not.

### PARKED (carried forward)

- OTP shared component (single otp.html or otp-component.js reused
  across M1/M2/M3b/M4 instead of duplicated per screen) — Phase 2 /
  pre-launch cleanup candidate, not urgent.

### OPEN — NOT RESOLVED

1. M1 phone-input diamond "No" loop back to Main Menu — the condition
   triggering this path is unclear, could not be recalled from memory.
   Needs checking against live register.html/dashboard.html code next
   session, not decided from memory.
2. generateSupplierNumber() Cloud Function — still not written.
   Remains the actual launch blocker. All diagram work this session
   was preparation for this brief, which is now next session's
   starting task.

### NEXT SESSION STARTS WITH

generateSupplierNumber() Cloud Function brief, built against the
now-locked M1-Firebase diagram.

## Session Log — 9 July 2026

### RESOLVED

1. generateSupplierNumber() permission-denied bug. Root cause: the
   client-side transaction touched admin-only settings/config, which
   the browser has no write access to. Fix: replaced with a new callable
   Cloud Function (Admin SDK, us-central1) that owns the counter
   increment and the suppliers/{phone} + pending_registrations writes.
   Deployed and verified live — T-26-1047 through T-26-1051 confirmed
   created correctly. This was the standing launch blocker; now closed.

2. identity-service.js — new 'incomplete' status added to
   resolveIdentity(), distinguishing "registered but not finished"
   (supplier doc exists, uid matches, registrationComplete false) from
   "fully registered" (verified). Status table now:
   no-auth / not-found / verified / incomplete / blocked / error.

3. dashboard.html confirmed fully excluded from the registration path,
   proven via a file-rename test (dashboard.html temporarily renamed so
   any stray registration-path reference would break loudly). Three
   dashboard entry points — the identity switch, the OTP-verify handler,
   and loadDashboard() — now guard on registrationComplete and redirect
   incomplete users to register.html.

4. index.html hamburger links and the "Join here" footer link now route
   through resolveIdentity() with a proper auth-ready wait
   (waitForAuth), matching the full status table: verified → dashboard;
   incomplete / not-found / no-auth → register; blocked / error → hard
   stop with a generic message, no redirect. Footer "Join here" no
   longer points straight at dashboard.html.

5. register.html — showWelcomeBack() and the ?phone= resume entry path
   both now check dataConsentGiven before showing the consent gate, and
   both call prefillSection1() to restore saved Section 1 data on
   resume. Verified live: register, save, exit, resume — Section 1 loads
   correctly with no data loss, on two different re-entry paths.

7. dashboard.html rename — resolved this session. The file was renamed
   to dashboard.html.bak.html during today's file-rename exclusion test
   (item 3) and that rename had been committed/pushed. Renamed back to
   dashboard.html manually this session; confirmed present,
   dashboard.html.bak.html removed. No longer an open action item.

### OPEN — NOT RESOLVED

6. Sections 2-8 need the same prefill pattern as Section 1, each adapted
   to its own field types. Confirmed this session. Location
   (province/town/suburb cascade dropdowns) is the next case and is more
   complex than Section 1's plain text fields — the cascade logic must
   re-populate its options before the saved values can be set.

### DIAGRAM CORRECTION NEEDED

8. M1 (Therapist Registration) is missing the token-valid-skip-OTP
   branch that M3b already has correctly drawn. Redraw M1 to match
   M3b's pattern when diagrams are next reviewed.

### NEXT SESSION STARTS WITH

Extend the prefill pattern from Section 1 to Sections 2-8, starting with
the Location cascade.

═══════════════════════════════════════
SESSION LOG — 11 July 2026
═══════════════════════════════════════

RESOLVED / BUILT THIS SESSION:

1. Resume-prefill built for Sections 2-7 (prefillSection2 through
   prefillSection7), completing the pattern started with Section 1
   on 9 July. Section 3 (Location) required async handling via the
   pre-existing but unused preSelectLocation() cascade function in
   location-cascade.js. Sections 4 and 7 required a shared
   offeringsReady promise to fix a load-order race against
   loadOfferings() on the fast ?phone= auto-resume path.

2. displayName field moved from Section 1 (Personal) to Section 5
   (About), editable — closes a decision that was agreed multiple
   times previously but never implemented. REQUIRED_SECTIONS
   labels for both sections updated to match.

3. classification field fully removed from Section 7 (Services) —
   HTML block, render call, prefill, both persist locations, and
   submitForm's finalData. Zero references remain, verified.

4. MAJOR ROOT-CAUSE FIX — authUid never set on OTP-skip resume
   path. handleNext()'s session-valid branch (getValidSession()
   finds a valid mm_session token) called showWelcomeBack()
   directly without ever calling verifyOtp() or the ?phone=
   handler — the only two places authUid was ever assigned. Result:
   authUid stayed null for the entire session on this path,
   causing (a) intermittent Section 8 photo upload failures via
   the Storage rules uid check, and (b) submitForm() writing
   uid: null into the final suppliers document — permanently
   locking that therapist out of her own account via
   resolveIdentity()'s uid-match check ("Session invalid, please
   log in again").
   FIX: added a one-shot authReadyPromise (awaits the first
   onAuthStateChanged callback). handleNext()'s session-valid
   branch now confirms a live Firebase Auth session (matching
   phone number) before trusting the token and skipping OTP. If
   Firebase's session is genuinely gone, falls through to a fresh
   OTP send instead of silently proceeding with a broken uid.
   SECOND GAP CLOSED IN SAME FIX: the ?phone= URL-param resume
   path only checked pendData.dataConsentGiven, never completion
   status — meaning a fully-submitted therapist could reopen the
   registration form via an old/bookmarked link and resubmit,
   overwriting her live suppliers document. Fixed by checking
   pendData.status === 'completed' first, redirecting to
   dashboard.html if true.
   TESTED LIVE END-TO-END (not just code-reviewed): Path A
   (valid mm_session token, Firebase Auth user deleted in
   console) confirmed falls through to fresh OTP — tested on
   +27800000004. Path B (re-entry after submit) confirmed
   redirects to dashboard.html — tested on +27800000005, full
   registration completed through Submit first.

5. Stale/corrupted test record +27800000003 (uid: null from the
   bug above, also predates today's field changes) deleted from
   pending_registrations, suppliers, and Firebase Auth. Do not
   reference this number's old data going forward.

DECISIONS LOCKED THIS SESSION:

6. Face/verification photo architecture redesigned:
   - facePhotoUrl (sole remaining field in Section 8) = required
     vetting photo, admin-use-only, NEVER shown publicly. The
     showFacePhoto toggle (previously spec'd, decision 83/#48) is
     explicitly DROPPED — no visibility option exists, superseding
     the earlier decision.
   - Once set, only admin can reset it — no self-service change.
     Enforced via UI (locked thumbnail view replaces upload
     control once facePhotoUrl exists). Full Storage-rules-level
     enforcement deferred to the broader rules audit (#44/S33),
     not built today.
   - Section 8 reduced to ONE required upload only. Slots 2-4 and
     "add another photo" REMOVED entirely. Label changes to
     "Verification Photo — admin use only."
   - CLAUDE.md's stale "photos[0] = ID, admin only" line corrected
     to reflect the actual 9 June locked decision (facePhotoUrl
     replaces retired idPhotoUrl) — docs-only fix, applied.
   - Confirmed dead code, not yet cleaned up: onIdPhotoChange/
     deleteIdPhoto reference idPhoto* HTML elements that don't
     exist anywhere in register.html.

7. Gallery photos (freely-editable marketing photos, up to 4-5)
   SPLIT OUT of registration/dashboard entirely into a new
   standalone flow: M11-Gallery.
   - Reached via hamburger menu, same pattern as existing "Make
     Payment" — OTP required every single time, no session-token
     skip ever, first upload and every later change.
   - Rationale: removes the entire auth-timing-race bug class by
     design (fresh OTP = guaranteed live Firebase session every
     time). Also removes need for per-upload admin vetting.
   - NO admin vetting on gallery photos (would not scale past
     ~300 suppliers). Instead: on-screen warning before upload —
     "no sexually explicit photos; violation = account deletion,
     no refund." Liability shifts to T&Cs.
   - Rides the existing 8-hour frontendRefreshHours cadence.
   - The previously-parked "re-vetting trigger for post-launch
     profile edits" design session is NO LONGER NEEDED for photos
     specifically — superseded by the T&Cs approach.
   - M11-Gallery NOT YET BUILT. Build sequence locked: (1) fix
     face photo in Section 8 [in progress], (2) remove old gallery
     slots [same fix], (3) build M11-Gallery as new flow. Rough
     flow sketched in chat: hamburger -> phone input -> OTP ->
     gallery screen (thumbnails + delete, up to 4 slots) -> save
     -> back to main menu. M11 diagram not yet drawn — M1's
     diagram is out of date re: face photo (still shows
     photos[0]=ID) and needs updating once Section 8 rebuild ships.

8. POPIA data separation (public-displayable fields vs
   never-displayed fields, potentially two separate Firestore
   documents) — reconfirmed as likely necessary eventually, but
   EXPLICITLY DEFERRED to Phase 2, pending professional legal/
   developer input. Same item already on the pre-launch parked
   list — reconfirmed, not newly discovered. Do not design or
   build on current architecture without that input.

9. Registration completion lock reconfirmed as intentional design
   — once submitted, a therapist should never re-enter the
   registration form, only the dashboard. Fully enforced as of
   item 4's fix (both entry paths now covered).

OPEN / NOT YET FIXED:

10. Section 8 (Photos) code REBUILD not yet briefed or built. Plan
    fully locked per item 6 above. Next task.
    CLOSED 12 July — see Session Log 12 July 2026.

11. Admin email notification (admin@massagemap.co.za via Resend)
    NOT firing on registration submit. Confirmed via live test on
    +27800000005: Telegram admin alert fired correctly, therapist
    confirmation email fired correctly (personalized, correct
    membership number, correct dashboard link). Admin email did
    not arrive. Narrower than #46 ("no notifications fire") —
    specifically the admin-recipient email leg only. Not yet
    diagnosed.

12. "Willing to travel" km selector (Section 4) reported not
    appearing when the mobile-massage toggle is on. Code reviewed
    in the last-uploaded register.html shows correct wiring
    (onMobileToggle() shows/hides travelKmField; prefillSection4
    restores it on resume) — no defect found in that copy, but
    that copy predates item 4's authUid fix, so may not reflect
    current state. Needs live reproduction with a screenshot,
    confirmed toggle state, and a fresh register.html upload
    before diagnosing further.
    SUPERSEDED 12 July — the entire dropdown mechanism this item
    referred to was replaced with 5/10/15/20km buttons; no longer
    applicable to current code. See Session Log 12 July 2026.

NOTE: register.html as held in claude.ai is stale as of item 4's
fix — re-upload before relying on any line numbers in a future
session.

---

## Session Log — 12 July 2026

SESSION EVENTS (non-code):
- Johan accidentally deleted code in index.html while setting
  up the dev environment before this session started. Restored
  cleanly via `git restore index.html` — uncommitted
  working-directory change only, nothing lost. No commit.

SECTION 8 (PHOTOS) REBUILD — DONE, LIVE-TESTED, CONFIRMED WORKING:
- Full rebuild per the plan locked 11 July: single required
  `facePhotoUrl` field replacing the old 4-slot gallery
  (`photos[]` array, `visibility: 'public'` on every entry
  including the face photo — this was a live privacy gap,
  confirmed and fixed).
- Dead code removed: `buildFormData()` (defined, zero call
  sites, wrote stale `idPhotoUrl`/`profilePhotos` field names),
  `onIdPhotoChange`, `deleteIdPhoto` (referenced HTML elements
  that didn't exist).
- Storage path: `suppliers/{uid}/photos/verification-{filename}`
  (uid-based, matches the identity architecture rule).
- DECISION REVISED (supersedes "admin-only reset, no
  self-service change" from 11 July's decision 6): during
  ACTIVE REGISTRATION (pre-submit), the therapist can freely
  delete and re-upload her verification photo as many times as
  she likes. The admin-only lock only matters after Submit —
  already fully enforced structurally by the existing
  completed-registration guard (any resume attempt on a
  submitted record redirects straight to dashboard.html,
  register.html unreachable). Section 8 needs no separate lock
  of its own — the guard upstream already does the job.
- `deletePhoto()` rewritten to actually delete the Storage
  object (`deleteObject`) and clear `facePhotoUrl` from both
  `pending_registrations` and `suppliers` (via `deleteField()`),
  not just clear the browser file input. Also reopens the
  Submit gate (`updateAccordionProgress()`) if a photo is
  deleted after the section was marked complete — a real gap
  in the first version of the fix (a therapist could delete her
  photo and still submit with none attached).
- Thumbnail preview added (mockup approved in-session before
  coding, per the UI-decision workflow rule): shows immediately
  on file select via `URL.createObjectURL` (before Save),
  persists after Save, restored on resume via new
  `prefillSection8()` (didn't exist before today — Section 8
  was never included in the 11 July prefill work for
  sections 1-7).
- Live-tested end-to-end via screenshots: select→thumbnail
  updates immediately, Save→section completes, delete→thumbnail
  clears and Submit gate re-locks, re-select→thumbnail updates
  to new photo, Save→completes again, back-to-menu-and-return→
  correct photo thumbnail restored on resume. All confirmed.
- WORKFLOW ISSUE DURING THIS WORK: a combined brief (thumbnail
  + delete-and-replace) was issued, but the session moved on to
  mockup approval and a follow-up brief before Claude Code's
  commit for the first brief was fully checked. Result: the
  `deletePhoto()` Storage/Firestore fix landed (commit 05fc909)
  but the thumbnail-wiring portion of that same brief
  (onPhotoChange local preview, deletePhoto thumbnail-clear)
  silently did not — because the `photoThumb1` element didn't
  exist yet at that point in the sequence. Not caught until
  live retesting showed the thumbnail frozen on old photos.
  Fixed same session (commit 3282496) once traced by directly
  re-reading the actual file rather than relying on
  conversation memory. New Workflow Rule added as a result —
  see Workflow Rules section.
- Minor technical notes, confirmed harmless, left as-is:
  `URL.createObjectURL` leaks one blob reference per file
  selection (never revoked) — bounded to a single image on a
  form filled once, no real impact. Setting `thumb.src = ''` on
  delete technically fires a request for register.html itself
  against the hidden `<img>` element — invisible to the user,
  common practice.
- Commits: c7f3113 (rebuild), 05fc909 (delete Storage+Firestore,
  reopen submit gate), b711b4e (prefillSection8 + thumbnail
  element), 3282496 (thumbnail wiring fix, missed in the
  combined brief above).

KNOWN GAP CONFIRMED, NOT FIXED (ties to #44):
- `deleteObject()` in `deletePhoto()` fails with a live 403
  (storage/unauthorized) — Storage rules don't currently permit
  an authenticated user to delete her own verification photo.
  Function catches the error and continues (Firestore still
  clears correctly), but the Storage file is orphaned. Confirmed
  live in console during testing.

DOWNSTREAM CONSUMER AUDIT (Claude Code ran this proactively,
grep across the repo) — ALL PARKED, dashboard/admin/spa
explicitly out of scope this session:
1. Verification photo writes to a PUBLICLY-READABLE Storage
   path — `storage.rules:16-21` grants `allow read: if true` on
   `suppliers/{uid}/photos/`, contradicting the UI's "Admin use
   only — never shown publicly" text. Correct fix is moving it
   to the existing auth-only `suppliers/{uid}/id/` path
   (`storage.rules:7-12`, `allow read: if request.auth != null`,
   already commented "admin use") — but that requires amending
   the locked CLAUDE.md line `photos[0] = facePhotoUrl`.
   Deliberately not done this session — own session, ties to #44.
2. `admin.html` reads `photos`/`idPhotoUrl` at lines 1260-1266,
   2070-2077, 2411-2419 — never `facePhotoUrl`.
   `admin-supplier.html` does the same via
   `renderPhotoGrid(data.photos, data.idPhotoUrl)` at lines 553,
   616. Every new therapist registered under the new flow will
   show "No photos uploaded" in admin vetting. Not fixed.
3. `dashboard.html` (lines 716-728) still runs the old 4-slot
   photo-loop and writes a legacy `photos` array on save, never
   touches `facePhotoUrl`. Also (lines 833-836, 969) still
   shows therapists a "Show address on listing" toggle and
   writes `addressVisible` back on save — a therapist who
   registers under the new flow (no `addressVisible` field at
   all) could open dashboard and set one, since it currently
   defaults to unchecked when undefined. Needs its own session.
4. `admin-supplier.html` (lines 270-271, 700) has its own
   "Address visible on listing" checkbox — may be an
   intentional admin override, separate from supplier
   self-service, needs a decision later, not an automatic
   removal.
5. `register-spa.html` untouched — still has the full 4-slot
   photo gallery + `photos` array + its own dead `buildFormData`
   with `idPhotoUrl` (lines 1568-1577, 1881-1882, 1985), still
   has Genders Served in its own Section 5, and still uses the
   old 10/25/50/100km distance dropdown. The therapist and spa
   registration flows have now diverged significantly.
6. `seed-s1.js` seeds `idPhotoUrl: ''` and `photos: []` on every
   record — stale field names, worth reviewing whenever seed
   data is next touched.
7. `--border` CSS token resolves to translucent white
   (rgba(255,255,255,0.07)) — a retired dark-mode remnant. The
   new photo thumbnail's border is invisible against the
   current dark background as a result. Phase D (full design
   pass) item, not urgent.
8. `dashboard-precrash.html` sitting in the repo root (not in
   backup/) looks like a stale crash artefact, still references
   `idPhotoUrl`. Flagged, not deleted — confirm with Johan
   before removing.

REGISTRATION FIELD/UX CLEANUP — Johan reviewed all 8 sections
with a 10-point list, worked through one at a time:

0. Sections auto-close on Save — confirmed already correct in
   code. No fix needed.
1. Section 1 — no issues, no action.
2. WhatsApp field (Section 2) — CONFIRMED KEEP: therapist↔
   customer only, a public `wa.me/{number}` link on the
   listing, phone-to-phone, zero backend/API integration
   required. Not the therapist↔platform notification stack
   (BulkSMS/Telegram). No fix needed. Unconfirmed whether
   `profile.html` currently renders the `wa.me` link on the
   public side — check in a future session.
3. FIXED — removed the "Show full address publicly" toggle
   (Section 3), which directly contradicted the field's own
   helper text ("Never shown publicly — admin only") a few
   lines above it. Address is now unconditionally admin-only in
   register.html. Confirmed via audit that this was a dead
   control, not a live leak — `profile.html` never rendered a
   street address publicly at any point. Commit: fd0b2db.
   PARKED: dashboard.html and admin-supplier.html both still
   have their own address-visibility toggles — see downstream
   audit items 3-4.
4. FIXED — replaced the travel-distance `<select>` dropdown
   (10/25/50/100km) with four press/click buttons: 5/10/15/20km
   (LOCKED VALUES — 20km deliberately chosen as the ceiling,
   "already quite far"). Field only appears when mobile-massage
   toggle is on (already correct, no fix needed). No validation
   forcing a distance choice — toggling mobile massage on with
   nothing selected is an intentionally allowed state (saves as
   `null`); Johan confirmed this represents "prepared to
   travel, exact distance/fee negotiated directly with the
   customer," out of platform scope by design. Commit: 432ad9e.
   DECISION CHANGE, PARKED: 5/10/15/20km supersedes
   10/25/50/100km as the standard set. dashboard.html and
   register-spa.html both still use the old values — need
   reconciling before a therapist who picks e.g. 15km at
   registration hits a mismatched dropdown later.
5. FIXED — moved "Genders Served" from Section 5 (About) to
   Section 7 (Services) as its first item (7.1). Section 5
   completion now requires only `displayName`; Section 7
   completion now requires `genderServed` + `massageStyles` +
   `treatments`. Commit: fe9342e.
6. Section 6 (Availability) — no issues, no action.
7. FIXED — Section 7 (Services) restructured from one long flat
   screen into 5 independently-collapsible sub-accordions,
   matching the visual pattern of the main 1-8 accordion:
     7.1 Genders Served (required)
     7.2 Massage Styles (required)
     7.3 Traditions (optional)
     7.4 Treatments (required)
     7.5 Service Offerings (optional)
   Each sub-item saves independently, straight to
   `pending_registrations` via `setDoc(..., {merge:true})` on
   its own Save button — the old shared "Save — Services"
   button and its single combined save call
   (`persistSectionToFirestore`'s `n===7` branch) is now dead
   code, removed. Optional sub-items (7.3, 7.5) save as
   explicit empty arrays when untouched (e.g. `traditions: []`)
   rather than an absent field — fine for optional data. Section
   7 shows "Complete" only once all three required sub-items
   (7.1, 7.2, 7.4) are saved — optional ones don't block it. The
   outer Section 7 accordion auto-collapses the moment it
   transitions into Complete, guarded so it only fires on that
   transition and not on every subsequent save (an early
   version slammed the section shut every time an optional item
   was saved afterward — fixed same session). Resume/prefill
   restores each sub-item's own done-state individually.
   Mockup approved before any code was written. Commits: 9dfa2ea
   (HTML/CSS + JS save/toggle/completion logic, landed as one
   commit — the HTML/CSS was deliberately applied uncommitted
   first, then paired with the JS brief and committed together
   once both were verified working), 22273ed (green tick state on
   saved sub-items — sub-acc__num--done class), 5a79736
   (auto-close on complete — first version, had the
   repeated-slam-shut bug), 816e3ef (transition guard fix).
8. Section 8 (Photos) — see full rebuild above, no further
   action.
9. Submit-locks-photo-editing — CONFIRMED ALREADY WORKING, no
   fix needed. On successful submit, the entire accordion
   (`regPhase`, including Section 8) is hidden immediately and
   replaced by a success screen, then redirects to info.html
   after 3 seconds. No window exists where photo edit/delete is
   reachable post-submit.

RESULT: Johan confirmed register.html's core registration flow
as functionally and cosmetically complete — direct quote:
"this registration screen is now 120% the way I wanted this."
All 10 items from tonight's review list are either fixed or
confirmed-no-action-needed.

GIT: three pushes this session, all confirmed clean.
  Push 1: 5e80211..3282496 (c7f3113, 05fc909, b711b4e, 3282496)
  Push 2: 3282496..fe9342e (fd0b2db, 432ad9e, fe9342e)
  Push 3: fe9342e..816e3ef (9dfa2ea, 22273ed, 5a79736, 816e3ef)

---

## Session Log — 13 July 2026

### Session workflow change (non-code)

Adopted feature-branch workflow going forward, replacing direct-to-main work. Two zsh functions added to ~/.zshrc: mmstart <name> (checks out main, pulls, creates and switches to feature/YYYY-MM-DD-<name>) and mmdone (merges current feature branch into main, pushes, deletes the feature branch). Pattern locked: mmstart at the beginning of each piece of work, confirm branch name matches in both zsh and Claude Code terminals (git branch --show-current in each) before briefing, same check in reverse (both terminals show main) after mmdone. Used correctly across two branches this session (feature/2026-07-13-storage-rules-fix, feature/2026-07-13-post-submit-flow), both merged cleanly.

### RESOLVED — Section 8 Storage delete 403 (ties to #44)

Root cause confirmed via live debug logging (temporary console.log on auth.currentUser?.uid vs authUid, added and removed same session): the two values matched exactly, every time — the earlier theory that authUid was stale/mismatched on the OTP-skip resume path was wrong and disproven live, not assumed.

Actual cause: storage.rules' allow write condition referenced request.resource.size and request.resource.contentType — these only exist on upload/update operations. On a delete, request.resource is null, so the condition errored out evaluating null.size, and Firebase Storage treats a rule evaluation error as an automatic deny. This produced the 403 on every delete attempt regardless of uid matching.

Fix: split the single allow write rule into separate allow write (create/update, keeps the size/type checks) and allow delete (auth + uid match only, no request.resource reference) on both the suppliers/{uid}/id/ and suppliers/{uid}/photos/ match blocks. Deployed live via firebase deploy --only storage. Tested live end-to-end on +27800000006: upload, save, delete, re-upload, delete again — all succeeded, zero console errors, confirmed via screenshots. Committed 3384a48, merged to main.

### RESOLVED — Face verification photo privacy gap (POPIA)

Investigation while fixing the above surfaced a real, live privacy exposure: facePhotoUrl was storing a Firebase Storage download URL generated by getDownloadURL(). These URLs carry a permanent bypass token — anyone possessing the URL can access the file indefinitely, regardless of what the Storage security rule says. Moving the file to a different folder alone would not have closed this gap, since the URL itself is the access mechanism, not the folder's rule.

Fix, agreed and built:
- Upload path moved from the public suppliers/{uid}/photos/ folder to the already-existing private suppliers/{uid}/id/ folder (allow read: if request.auth != null — not public).
- Field renamed facePhotoUrl -> facePhotoPath platform-wide in register.html (9 occurrences across upload, prefillSection8, deletePhoto, submitForm) to reflect that it now stores a Storage path, not a usable URL.
- prefillSection8() (covers both the just-uploaded preview and the resume/reload/post-submit view) now calls getDownloadURL() live, authenticated, at render time — nothing persisted. Works correctly regardless of which device the therapist logs in from, since the Firebase Auth UID is tied to the verified phone number via OTP, not the device.
- deletePhoto() simplified to use the stored path directly, no longer parses a path out of a URL.
Tested live end-to-end on +27800000006: upload, save, exit to main menu, resume, thumbnail correctly reloads via authenticated fetch, delete, re-upload — all confirmed, zero console errors. Committed e4c9f06, merged to main.

Known gap, not addressed this session: this only closes the Storage-file-level exposure. The broader Firestore document-level POPIA separation (private PII vs public frontend fields, same suppliers document today) remains undesigned, as previously logged 7 July — this session deliberately did not expand into that scope.

### RESOLVED — createdAt clobbered on Submit

submitForm()'s final setDoc(supplierRef, finalData) had no merge:true and finalData explicitly included createdAt: serverTimestamp(), overwriting the true registration-start timestamp (set by generateSupplierNumber()'s lightweight record) with the Submit-time timestamp on every registration. Fixed by removing the createdAt line from finalData entirely (merge:true alone would not have been sufficient, since merge:true only preserves fields absent from the write — it does not protect an explicitly-included field) and adding merge:true as a general safeguard for any other field not explicitly restated. Tested live: Submit on +27800000006 (submitted this afternoon) shows suppliers.createdAt as 12 July 12:00:04 PM — the original lightweight-record timestamp — confirming the fix held, verified via Firestore console screenshot in the same window before the commit was made. Committed 9f8e745, merged to main.

register-spa.html has the identical createdAt clobber pattern (finalData re-sets createdAt: serverTimestamp() on Submit) — noted, not fixed, deferred to the planned spa session.

### CONFIRMED — notification/registrationComplete chain works correctly for both supplier types

Claude Code initially flagged the therapist path as missing the lightweight-record step that onSupplierRegistered's onUpdate trigger depends on (register-spa.html creates one inline; register.html appeared not to). Corrected on further check: register.html gets the equivalent lightweight record server-side, via the generateSupplierNumber() callable Cloud Function (which already writes registrationComplete: false at supplier-number-generation time, per the 9 July fix). No defect — architecture works as designed for both supplier types, just via different code paths.

### TESTED — full registration-to-Submit flow, live, end-to-end

+27800000006, complete registration through all 8 sections including Submit. Confirmed working: validation gate, finalData write to suppliers/{phone} with registrationComplete:true, pending_registrations status flips to completed, referral code generated, success screen displays with correct membership number (T-26-1053), 3-second redirect to info.html, Telegram admin alert fires with correct details, therapist confirmation email fires (Resend) with correct content and membership number, facePhotoPath correctly present on the final submitted document confirming the private-path fix survives all the way through Submit.

One unrelated console error observed ("Could not establish connection. Receiving end does not exist") on navigation to info.html — consistent with a browser extension losing its connection on page navigation, not application code. Not investigated further; re-test in Incognito if certainty is wanted.

### DIAGNOSED, NOT YET FIXED — admin email notification (#11 from 11 July log)

Root cause confirmed by reading functions/index.js: all outgoing email (admin notification, therapist welcome, spa welcome) sends from onboarding@resend.dev, Resend's shared sandbox/test domain. Resend enforces a hard restriction on that domain — delivery only succeeds to the Resend account owner's own verified address. This is why the therapist welcome email (sent to hjcilliers@gmail.com, the account owner) fires correctly while the admin email (sent to admin@massagemap.co.za, a different address) is silently rejected — the code itself is correct, not a bug.

Real fix (in progress, blocked): verify massagemap.co.za as a sending domain in Resend, requiring three DNS records (TXT for DKIM, MX + TXT for SPF/sending) added to the domain's zone. Attempted via cPanel Zone Editor (cp72.domains.co.za, Domains -> Zone Editor -> Manage -> Add Record) — the Add Record tool's Type selector only ever offered MX, with no way found to select TXT despite trying multiple approaches (dropdown arrow, keyboard selection, zoom, alternate entry points, cPanel's own documentation walkthrough). Support ticket opened with domains.co.za (ticket "New Ticket: add TXT records (not MX)", Support/Medium/Open) with the exact three records and an explicit note not to touch the existing root-domain MX record. Awaiting response — next session should check ticket status before attempting DNS again.

Once domain is verified: change every from: in functions/index.js from onboarding@resend.dev to an address on massagemap.co.za, then re-test admin email delivery live.

### Documentation

Field Register updated to v2 (docs/MM-Field-Register-v2.md): facePhotoUrl renamed facePhotoPath with corrected description (path not URL, private not public, live-fetched not persisted); showFacePhoto moved to Retired (dropped 7 July, no visibility toggle exists); classification moved to Retired (removed platform-wide 11 July); photos array description flagged stale pending M11-Gallery design; displayName section corrected from Personal to About (moved 11 July, never updated in v1); new Known Gaps section added covering the three open items above (spa createdAt clobber, admin.html/photos legacy mismatch, admin email/DNS).

### Parked (carried forward, unchanged)

- Spa registration and dashboard — untested, likely similar bugs to therapist side
- register-spa.html createdAt clobber — same fix needed as therapist side, deferred to spa session
- admin.html / admin-supplier.html still read legacy photos array, never facePhotoPath — any new-flow therapist shows "no photos" in admin vetting until reconciled
- M11-Gallery — not yet built
- POPIA document-level data separation — not yet designed
- Re-vetting trigger for post-launch profile edits — not yet designed
- Firestore security rules audit (Cluster J, auditLog write-access mismatch) — not yet reconciled
- BulkSMS credits at zero, MFA not enabled
- PayFast sandbox -> live credentials
- Web hosting deployment to massagemap.co.za
- Customer-facing frontend — never had a dedicated design session
- 18+ age gate
- Legal review: T&Cs, POPIA compliance, Privacy Policy

### Next session starts with

1. Check domains.co.za support ticket status (DNS records for Resend domain verification)
2. If DNS is live: verify domain in Resend, update functions/index.js from: addresses, re-test admin email delivery
3. Update GitHub issue list to reflect today's fixes — close/update #44 (Storage rules), log the facePhotoPath rename and createdAt fix if no existing issue covers them
4. Johan to decide next scope: spa registration, dashboard, admin, or continue closing remaining registration-side gaps

---

## Session Log — 14 July 2026 (M11-Gallery)

### Scope

Built M11-Gallery end to end — the therapist gallery flow (gallery.html), reached via the hamburger menu on index.html. OTP required on every visit, no session-skip. New file, and a new precedent: this is the first flow with no session-skip path at all.

### Brief 1 / 1b / 1c — phone + OTP screen, reCAPTCHA lifecycle fix

Phone/OTP screen built, reusing register.html's markup, CSS, and error handling (invalid phone, too-many-requests, code expired — same wording, same catch blocks). goToOtp() always sends a fresh OTP: getValidSession() and knownSupplierData are never consulted, and identity-service.js was deliberately not imported at this stage so no session-read path could exist.

Bug found and fixed: initRecaptchaVerifier()'s clear-then-recreate pattern was fragile. Firebase's clear() does not reliably remove the rendered DOM node across SDK versions, so a second attempt in the same page load threw "reCAPTCHA has already been rendered." Fixed by switching to a create-once, reuse pattern (ensureRecaptchaVerifier()) — the verifier is created on first send and reused for every retry, never cleared or recreated. The SDK resets the widget itself after each attempt (success or failure), which is what makes reuse safe. clear() is the destroy operation and is now called nowhere in gallery.html.

Also flagged: register.html likely carries this same latent bug, unfixed, out of scope tonight — needs its own GitHub issue.

Drawer link "Gallery" added to index.html. Note the brief referenced an existing "Make Payment" menu item as the pattern to follow — no such item exists anywhere in the codebase; the drawer uses plain drawer__link anchors, and that pattern was followed instead. The same drawer markup is duplicated in map.html and was not touched.

Commit 4ac01fb.

### Brief 2 / 2b — warning / acknowledgment screen

Warning/acknowledgment screen built as a single component, not the two-screen version originally on the M11 diagram. The diagram is now stale and needs redrawing — parked.

galleryTermsAcknowledgedAt written via serverTimestamp() on first acknowledgment, keyed by authUid, not phone. The doc reference is taken as snap.docs[0].ref straight off the where('uid','==',authUid) query result, so nothing on this flow reconstructs a document path from a phone number even though the document ID happens to be one.

One intermittent bug encountered during testing: a where('uid','==',authUid) query once returned the correct document but with uid and galleryTermsAcknowledgedAt both reading undefined, despite both fields being confirmed present via direct Firestore console inspection (fromCache was not captured on that run). Never reproduced again across 5-6 follow-up attempts, all clean with fromCache: false. Root cause unknown — logged as GitHub issue #53, not closed. A diagnostic console.log was added, kept through testing, then removed once Brief 3d's routing change made the original symptom (the checkbox reappearing on repeat visits) no longer directly observable. This does not mean the underlying read issue is fixed — only that it is less visible under the new flow.

### Brief 3 / 3b / 3c / 3d — full photo management screen

galleryPhotos is an array of objects ({ path, visible }), max 4 entries — NOT strings. Thumbnails fetch a live getDownloadURL() at render time and are never persisted, the same pattern locked for facePhotoPath on 13 July. Upload, toggle, and delete all update an in-memory array; only "Save section" writes to Firestore (setDoc, merge:true). Delete is the one exception and fires immediately (Storage deleteObject() + array splice), matching the existing Section 8 delete pattern.

Filename collision bug found and fixed: two uploads with the same original filename (e.g. IMG_0001.jpg, common on phones) would overwrite the same Storage object while creating two array entries pointing at one file — deleting either would then break the other. Fixed by prefixing the Storage filename with Date.now().

Separate crash bug found and fixed: Brief 2's shared clearErrors() function was stripping ALL .error-msg elements from the DOM, including gallery.html's static #galleryError container. (register.html's version of clearErrors() only ever encounters dynamically-created .error-msg nodes, so this collision does not exist there — the function was safe in its original home and lethal when copied into a file that also had a permanent .error-msg element.) Fixed by excluding #galleryError from clearErrors()'s selector. This single bug was blocking the entire gallery screen from rendering correctly — native file inputs showed instead of the thumbnail/toggle/delete card UI, because the crash fired before uploadBytes() ever ran — and was blocking Save's Firestore write entirely, because the crash fired before setDoc() ran. That is why galleryPhotos was absent from the test document: the write had never executed once.

Warning screen collapsed per Johan's correction: first-visit-only interstitial with checkbox; every visit after, no interstitial at all, with the warning text pinned permanently at the top of the gallery screen itself.

Save button shows a checkmark + "Saved" directly on the button on a successful write, reverting to the normal label on any new change (upload, toggle, or delete).

Card layout reverted to match the originally approved mockup exactly — 56px thumbnail, label + status text stacked, toggle, trash icon, all on one row — not the drifted full-width-image version that shipped briefly.

Fully tested live end-to-end on +27800000006: upload (4 slots), thumbnail render, toggle (confirmed no Firestore write fires on the toggle itself), Save (confirmed one write with correct visible flags and Date.now()-prefixed paths, verified via Firestore console), delete (confirmed immediate removal from screen AND from the Firestore array, verified via console).

Commit 9fbfd51.

### Brief 4 — Storage rules

New match block for suppliers/{uid}/gallery/{filename}: public read (unlike the private id/ path), auth + uid-matched write with size (<10MB) and contentType (image/*) limits, and delete with no request.resource reference — the same fix pattern as the earlier Section 8 403 bug, since request.resource is null on delete. The existing id/ and photos/ blocks were not touched. Deployed live via firebase deploy --only storage, confirmed "Deploy complete!" on massage-directory-57e19.

Noted at the time: public read on gallery/ means every uploaded gallery photo is world-readable by URL, including ones toggled visible: false. The visible flag controls whether the frontend renders it, not whether the file is reachable. This is the same posture as the existing photos/ path and is intended — it is the reason the explicit-content warning exists — but it is on the record as a decision, not an oversight.

### Field Register updated

docs/MM-Field-Register-v2.md — two new rows added to the suppliers collection: galleryPhotos (array of objects, therapist-only, public, written via saveGallery() batched except delete) and galleryTermsAcknowledgedAt (timestamp, therapist-only, gates the warning screen). Both use a new "Gallery" value in the Section column, since the gallery is its own flow rather than a registration accordion section.

Note the existing stale `photos` row (line 71) still describes M11-Gallery as "planned, not yet built" — it is now built. The row's core warning (admin.html and dashboard.html still read the legacy photos[] array and need reconciliation) still holds and was left unchanged.

Commit 05551d8.

### LOCKED naming decision (14 July)

Dashboard will split into two files per supplier type, same convention as register.html / register-spa.html — no suffix for therapist, "-spa" suffix for spa. This applies to gallery too: therapist = gallery.html (built tonight), spa = gallery-spa.html (future spa session, mirrors gallery.html once it is fully solid, the same way M2/M4 followed M1/M3). Do not use short-code names like "T-Dashboard" / "S-Dashboard" when that work begins.

### CLOSED — not a defect, a misunderstanding

facePhotoPath and galleryPhotos ARE correctly saved to separate Storage locations by design: facePhotoPath in the private, auth-only suppliers/{uid}/id/ folder (verification only), galleryPhotos entries in the public suppliers/{uid}/gallery/ folder (customer-facing marketing photos). This was already correct as of the 13 July facePhotoPath privacy fix and remains correct through tonight's build. Raised as a question mid-session, resolved by re-reading the 13 July log — not an actual gap.

### GitHub issues

Issue #53 created — intermittent uid / galleryTermsAcknowledgedAt reading undefined on a Firestore read. Unreproduced. Not closed.

### Deferred — explicitly not done tonight (Johan's decision, start of session)

- Item 1 — M1's 1-hour lockout dead-end (diagram fix + real tiered lockout logic). Discovered mid-session to not exist in code at all, despite being a locked decision. Needs its own session; the fix is shared across M1/M3b/M11.
- Item 3 — deferred until "after this session" per Johan, then further deferred to next session. (The Field Register was in fact updated tonight, see above, but no further field renaming/creation work was done.)
- Item 6 — M3-1(a)/(b) diagram rebuild (Section 8 photo model, Section 7 5-way split, drifted decisions). Not started tonight, carried forward.

### Parked — cosmetic, not urgent

Gallery card toggle-to-label spacing could be tighter for clarity: the "visible on profile" toggle's position relative to its label may not read clearly to a less sophisticated user. Flagged by Johan, not fixed.

### Parked — register.html reCAPTCHA lifecycle

register.html's reCAPTCHA verifier likely shares the same clear-then-recreate fragility fixed in gallery.html tonight. Untriggered so far because no retry-in-same-session scenario has been tested there. Needs its own GitHub issue — NOT yet filed. Do this first thing next session if it has not been done by then.

### Commits

4ac01fb (Brief 1), 9fbfd51 (Briefs 2-3d), 05551d8 (field register). All merged to main and pushed. Branch feature/2026-07-14-m11-gallery deleted after merge.

---

## Session Log — 15 July 2026 (M1 OTP lockout locked, DNS/Resend verified)

### DECISIONS LOCKED

1. Tiered OTP lockout SIMPLIFIED — supersedes 7/8 July's two-tier
   escalation (15-min cooldown -> 1-hour lockout). No 1-hour tier.
   Single cooldown, immediate escape hatch instead of a second wait
   cycle.

   Locked flow: OTP fire PIN (SMS) -> enter pin -> OTP Valid.
   Wrong, attempts 1-2: loop back to enter pin, same code, no
   resend, no new SMS.
   Wrong, 3rd attempt: "contact admin" message shown immediately +
   OTP Reset counter (counter=1) + otpLockedUntil =
   serverTimestamp() + 15min (Firestore Timestamp, not raw
   duration) -> routed to Main Menu M-0.
   Re-entry: phone re-entered from Main Menu triggers
   otpLockedUntil check before firing a fresh PIN. now 
   otpLockedUntil -> flash screen shown, no SMS fired, back to
   Main Menu. now >= otpLockedUntil (or field absent/never set)
   -> fresh PIN fires, cycle restarts clean.

2. New fields: otpFailedAttempts, otpLockedUntil. Live on
   suppliers/pending_registrations only — a record must already
   exist for the counter to attach to. First-ever OTP attempt on a
   brand-new phone number (no record yet) has nowhere to write the
   counter — falls back to Firebase's built-in rate limiting,
   consistent with the existing 7 July decision for new numbers.
   No new otp_attempts collection needed.

3. M1 diagram bug found and fixed: a redundant "OTP Verification"
   box was wired to check the code before it was sent/entered —
   real logic bug, not just naming. Removed. "OTP Valid" is now the
   single verification decision point, directly after "enter pin".

4. Workflow confirmed going forward: Johan maintains M-diagrams
   directly in draw.io. Claude (claude.ai) reviews and flags issues
   only, does not redraw. Diagram is authoritative once Johan
   confirms it locked.

5. Domain verification for Resend COMPLETE. domains.co.za added
   three DNS records (TXT resend._domainkey, MX send ->
   feedback-smtp.eu-west-1.amazonses.com priority 10, TXT send SPF)
   without touching the existing root MX. Resend confirmed all
   three Verified, domain status "ready to send emails" as of
   15 July ~16:00. functions/index.js from: addresses NOT yet
   switched off onboarding@resend.dev — next session task.

### PARKED

- reCAPTCHA clear-then-recreate bug (flagged 14 July, gallery.html
  fix not ported to register.html) — kept OPEN on GitHub, not fixed
  this session. M1's locked design likely sidesteps the trigger
  condition entirely: attempts 1-2 never resend, and the only
  resend path (post-cooldown) requires a full page reload via Main
  Menu, giving a fresh JS context and clean verifier — no
  same-session double-fire under this flow as designed. Verify live
  once M1 is built.

- Wrong-number OTP check: test +27800000009 (never registered, no
  Firebase Auth entry, no Firestore record) through gallery.html —
  suspected to have broken during 14 July testing, not confirmed or
  reproduced this session, no root cause identified. Verify live
  during registration retest, same session as M1 build.

### NEXT SESSION STARTS WITH

1. Build M1 OTP lockout logic per locked diagram above
2. Wrong-number OTP test (+27800000009) through register.html and
   gallery.html
3. Verify reCAPTCHA does not break under M1's actual retry flow
4. Switch functions/index.js from: addresses off onboarding@resend.dev,
   re-test admin email delivery

---

## Session Log — 16 July 2026

### SESSION START

Branch created: feature/2026-07-15-m1-otp-lockout (via mmstart,
confirmed clean off main). Purpose: build M1 OTP lockout logic per
the M1 diagram, the last piece before therapist registration is
functionally complete.

### M1 DIAGRAM — LOCKED (final revision this session)

Diagram iterated three times this session before lock:
- First pass: "OTP Reset counter (counter = 1)" on the 3rd-wrong-
  attempt box — ambiguous whether 1 was literal or a labeling slip
  for "reset."
- Second pass: Johan confirmed counter=1 is literal (the value
  written AT the moment lockout triggers), and clarified the full
  cycle: counter starts at 0 implicitly, wrong pin -> 1, wrong again
  -> 2, wrong again -> 3 -> triggers cooldown. Re-entry after lockout
  expires fires a fresh OTP and the new cycle starts clean at 0 (the
  counter=1 written at trigger time is overwritten, not carried
  forward).
- Final locked version: "After 3rd attempt Still Wrong Pin counter=3
  (already)" -> screen shows "contact admin" -> 15 min cooldown ->
  OTP Reset counter (counter = 0), otpLockedUntil =
  serverTimestamp() + 15 min -> Main Menu M-0.

Locked flow (final):
- Phone entered -> check pending doc's otpLockedUntil BEFORE firing
  OTP. If locked and now < otpLockedUntil: flash "try again" message,
  no SMS fires. Otherwise fire OTP normally.
- Wrong pin, attempts 1-2: loop back to same OTP screen, same code,
  no resend, counter increments (1, then 2).
- Wrong pin, attempt 3: counter written as 0 (reset) +
  otpLockedUntil = serverTimestamp() + 15 min. "Contact admin" shown.
  Routes to Main Menu M-0 / phone screen (single-page flow
  equivalent).
- Correct pin at any point: existing flow unchanged.

### DECISION — BRAND NEW NUMBER, ZERO HISTORY (confirmed against
industry practice, not a gap)

A phone with NO prior pending_registrations/suppliers doc has nowhere
compliant to write a wrong-attempt counter to, because writing any
phone-linked document pre-consent would violate POPIA (data capture
before consent given). Options considered:
- Option A (accepted): first-ever OTP cycle on a brand-new number
  falls back to Firebase's own built-in rate limiting only. Our
  3-strike/15-min lockout engages from the SECOND verified cycle
  onward (once a doc exists).
- Option B (rejected): create a lightweight doc pre-consent just to
  hold the counter. Rejected outright - this is unauthorized personal
  data capture pre-consent, a POPIA violation, full stop.
Verified against general industry OTP lockout practice (web search,
16 July): confirmed 3-5 wrong attempts and 15-minute cooldowns are
standard; confirmed all major providers (Okta, WSO2, Entra) assume a
pre-existing user record before OTP starts, which MassageMap's
brand-new-registration case does not have - this is a POPIA-specific
gap, not an engineering oversight unique to this platform. Matches
the existing 7 July decision already on record - not new today, just
re-confirmed.

### BUG DISCOVERED — ROOT CAUSE 1: Firestore rules silently blocked
the entire feature

Initial implementation (client-side, writing otpFailedAttempts/
otpLockedUntil directly to pending_registrations from verifyOtp()'s
catch block and handleNext()'s pre-fire check) was tested live and
found completely non-functional: wrong pins looped forever, no
lockout ever triggered, on ANY test number, including ones with
existing pending_registrations docs.

Root cause confirmed via Claude Code reading the actual deployed
firestore.rules: pending_registrations requires
request.auth != null && request.auth.token.phone_number == cellNumber
for BOTH read and write. A wrong OTP means Firebase Auth sign-in
never succeeded - no live session exists at that moment. Every read/
write attempt from verifyOtp()'s catch block hit permission-denied,
silently swallowed by an empty try/catch (a defensive pattern already
used elsewhere in this file for the same class of pre-auth read).
Confirmed both the write side (verifyOtp()) and read side
(handleNext()'s pre-fire lockout check) had this identical structural
problem - meaning the ENTIRE M1 lockout design as first built could
never function for anyone, by construction, not as an edge case.

### FIX — Cloud Function recordOtpEvent (us-central1, 1st gen)

Design decision: server-side Cloud Function using Admin SDK, which
bypasses the client Firestore-rules/auth dependency entirely. Rejected
alternative (loosening Firestore rules to allow unauthenticated writes
to otpFailedAttempts/otpLockedUntil) outright - that would let anyone
reset their own lockout via browser devtools, defeating the feature's
entire purpose. Same reasoning already applied previously to PayFast
signature generation (also moved server-side for the same class of
reason).

Function signature: recordOtpEvent({ phone, collection, action }),
action: 'check' (read-only, called from handleNext() before firing
OTP) or 'fail' (increment/reset, called from verifyOtp()'s catch
block).

### SECURITY REVIEW (automatic background check, unprompted) — 3
issues found in first version, all addressed before deploy

1. auth-bypass-lockout-DoS: function had no App Check/auth guard -
   anyone reachable on the internet could call action:'fail' against
   ANY phone number, griefing a stranger's registration lockout with
   no rate limit. Valid, confirmed.
2. information-disclosure: action:'check' with no auth guard would
   tell any caller whether any given phone number is currently locked
   and exactly when it unlocks - a minor privacy leak. Valid,
   confirmed.
3. race-condition-cap-defeat: the 'fail' branch did a plain read-then-
   write (get() then set()), not atomic. Concurrent wrong-pin calls
   could all read the same stale counter value and all write current+1,
   meaning the counter could never reach 3 under rapid/concurrent
   attempts, silently defeating the entire lockout cap. This one was
   NOT initially flagged by Claude in chat - caught only by Claude
   Code's automatic review. Noted: generateSupplierNumber() elsewhere
   in this same file already uses db.runTransaction() specifically to
   avoid this exact class of bug - established pattern in the
   codebase that the first version of recordOtpEvent should have
   followed and didn't.

Fixes applied, in order:
- Race condition: rewrote the 'fail' branch to use
  admin.firestore().runTransaction(), matching the existing
  generateSupplierNumber pattern exactly.
- Auth-bypass + info-disclosure: both closed via Firebase App Check
  (reCAPTCHA v3 provider). Registered in Firebase Console (site key
  6Leh31YtAAAAAL3uPM1JXyWj4CchliBe-gpg1xla). Client-side:
  initializeAppCheck() added to register.html, placed BEFORE any
  Firebase Functions calls (ordering matters - ES module imports
  hoist regardless of position, but the debug-token bypass line does
  not and must execute before initializeAppCheck() runs).
  Server-side: initially implemented as a manual
  "if (!context.app) throw ..." guard: this WORKS but is not the
  documented Firebase pattern. Corrected after checking the official
  docs AND verifying directly against the installed firebase-functions
  package (not assumed): confirmed firebase-functions@5.1.1's
  top-level require() resolves to the v1 builder (main:
  "lib/v1/index.js"), and .runWith({ enforceAppCheck: true }) chains
  correctly with the existing .region("us-central1").https.onCall()
  pattern with no import changes or version bump needed. Switched to
  the declarative .runWith({ enforceAppCheck: true }) pattern, manual
  guard removed as redundant.
- Local dev debug token: FIREBASE_APPCHECK_DEBUG_TOKEN bypass added
  to register.html for 127.0.0.1/localhost only. Token generated
  (877de9b6-d96e-448e-ae4f-8e633dcc922f), registered in Firebase
  Console under "Johan local dev".

Decision NOT to build: Firebase App Check was scoped narrowly (closes
the specific auth-bypass/info-disclosure gap on recordOtpEvent only).
Broader App Check rollout across other callable functions was
explicitly not evaluated this session - out of scope, not a gap.

### BUG DISCOVERED — ROOT CAUSE 2: wrong collection checked (found
only during live end-to-end testing, after everything above was
already deployed)

After the full fix above was deployed, live wrong-pin testing on
+27800000002 STILL failed to trigger lockout - no counter written
anywhere, in either pending_registrations or suppliers.

Root cause: recordOtpEvent only ever received
collection: 'pending_registrations' from the client, hardcoded.
But handleNext() checks the suppliers collection FIRST (existing,
locked behavior per Decision #23, confirmed unchanged all session) -
and per locked registration architecture (Decision #27-29), a
lightweight suppliers document (registrationComplete: false) is
created as soon as Section 1 is saved, in parallel with
pending_registrations. For ANY therapist past Section 1 - which is
the real-world scenario this entire feature exists to protect - the
suppliers doc is found first by handleNext(), and pending_registrations
(which our lockout was exclusively checking) is never consulted at
all. The lockout was structurally unreachable for the majority of
real users from the moment it was designed this morning, not just
today's testing session - this was missed in the original design
discussion, not introduced by later fixes.

CORRECTION to an earlier same-session misdiagnosis: mid-session, the
presence of a suppliers doc with fields {registrationComplete: false,
status: 'pending', subscriptionStatus: 'not_paid', supplierNumber,
uid} on +27800000002 was initially misread as evidence that number
had gone through actual Submit Registration. This was WRONG - these
exact fields are written at Section 1 save (Decision #29), not submit
- confirmed properly later by direct code trace and by Johan's
correction. +27800000002, 03, and 04 all reached Section 1 only, none
were submitted. Noting this so the misdiagnosis isn't repeated.

Fix: handleNext() now reuses its existing suppliers lookup (no
additional read added) to decide which collection to pass to
recordOtpEvent's 'check' call - suppliers if found, pending_registrations
otherwise. verifyOtp()'s catch block adds one new read
(getDoc(suppliers/{phone})) before calling recordOtpEvent's 'fail'
action, same logic. recordOtpEvent's collection guard updated to
accept both 'pending_registrations' and 'suppliers' (previously
rejected anything but pending_registrations).

### CONFIRMED LIVE, END TO END (final verification, +27800000003)

- Wrong pin attempts 1-2: loop back silently, no lockout message, no
  resend, same OTP code accepted for retry.
- Wrong pin attempt 3: "Too many incorrect attempts. Please contact
  admin or try again in 15 minutes." shown, routes back to phone
  entry screen.
- Firestore confirmed: suppliers/+27800000003 written with
  otpFailedAttempts: 0, otpLockedUntil: ~15 min from trigger
  (22:28:41 UTC+2 tonight). pending_registrations/+27800000003
  confirmed UNTOUCHED - correct, since suppliers was the doc
  handleNext() actually uses to route this phone.
- Immediate re-entry while locked: "Too many attempts. Please try
  again in a few minutes." shown, NO new OTP/SMS fired, confirmed via
  console (no signInWithPhoneNumber call visible).
- Separately confirmed on +27800000004 (brand-new, zero history,
  before any successful verify): wrong pins do NOT create any
  Firestore doc anywhere and do NOT trigger lockout - Firebase's own
  throttling is the only backstop, exactly matching the accepted
  Option A design above.

Cosmetic, parked (not urgent): the "too many incorrect attempts"
error screen state on attempt 3 is functional but not visually
polished - revisit when convenient, not before launch-critical.

### ARCHITECTURE QUESTION SURFACED THIS SESSION — NOT ACTIONED, FLAGGED
FOR SPA BUILD

While diagnosing the above, confirmed via project knowledge search and
direct code trace that two documented decisions contradict each other:
- 9 June decision (#27-32): progressive sections (2-8) save to
  pending_registrations via setDoc merge; full suppliers document
  only written at final Submit.
- 8 July diagram session (M1-Firebase): explicitly states sections
  2-8 should be direct merge writes to suppliers/{phone}, with
  pending_registrations "confirmed left permanently inert after
  Section 1 succeeds - no cleanup/delete step, kept as dev-phase
  debug trail."
Live code today follows the 9 June pattern (confirmed by grep - every
section 2+ save writes to pending_registrations, not suppliers).
The 8 July decision was apparently never actually implemented, or was
implemented and reverted - not established which.

Johan's account, confirmed correct: pending_registrations is a
leftover from a post-25-May-crash workaround (there was an issue
creating suppliers docs directly at the time), kept afterward because
reworking it was judged not worth the effort at that stage. Not a
current structural requirement - Johan confirmed there is now, in
theory, no remaining reason pending_registrations needs to exist for
new registrations.

Explicit decision: NOT touching or removing pending_registrations
from the therapist flow at this late stage - too risky this close to
launch, registration is otherwise complete and working. For SPA
registration (to be built from scratch, separate session): Johan's
direction is to write only to suppliers, no pending_registrations
collection at all - EXCEPT one narrow window needs a deliberate
design decision before spa build starts: OTP verified + consent given
but Section 1 (or spa equivalent) not yet saved means no suppliers
doc exists yet to hold dataConsentGiven/dataConsentTimestamp. Where
consent lands in that gap must be decided on purpose, not left to
default to recreating a parallel pending collection unintentionally.

### TEST NUMBER STATE AS OF SESSION END (for next session reference)

- +27800000001: suppliers doc exists, further progressed (has
  facePhotoPath set) - pre-dates this session.
- +27800000002: suppliers + pending_registrations both exist,
  Section 1 saved (firstName: willie, lastName: botha), NOT
  submitted. No otpFailedAttempts/otpLockedUntil (used for early
  no-lockout-reachable testing before the collection-routing fix).
- +27800000003: suppliers + pending_registrations both exist,
  Section 1 saved (firstName: gerdus, lastName: bouwer), NOT
  submitted. CURRENTLY LOCKED as of session end -
  otpLockedUntil ~22:28 UTC+2 tonight (16 July). Will self-clear.
- +27800000004: suppliers + pending_registrations both exist, Section
  1 saved (firstName: sara, lastName: dlamini), NOT submitted. No
  lockout fields written yet.
- +27800000006: pre-dates this session (14 July gallery testing) -
  not touched today.
- +27800000005, 007, 008: untouched, clean, no docs in either
  collection.

### COMMITS THIS SESSION (branch feature/2026-07-15-m1-otp-lockout,
merged to main via mmdone, fast-forward, pushed)

51beaf0 - initial client-side OTP lockout attempt (direct Firestore
  writes) - later found non-functional, superseded by Cloud Function
  approach, not reverted (superseded in place by later commits to the
  same code paths).
c615b31 - recordOtpEvent Cloud Function created (pending_registrations
  only, no App Check yet).
3ba896f - race condition fix: 'fail' branch rewritten to use
  db.runTransaction(), matching generateSupplierNumber's existing
  pattern.
31dae70 - App Check client-side init added to register.html; manual
  "if (!context.app)" guard added server-side (later superseded by
  7ec785... see below).
e7ec785 - switched recordOtpEvent from the manual context.app guard
  to the documented .runWith({ enforceAppCheck: true }) declarative
  pattern, verified against installed firebase-functions@5.1.1.
5a1fbfbf - App Check debug token bypass added for local 127.0.0.1/
  localhost development; corrected placement (before
  initializeAppCheck() executes, not merely "after the import").
74ef567 - register.html wired to call recordOtpEvent instead of
  direct Firestore writes in both handleNext() and verifyOtp();
  removed now-dead direct pendRef/setDoc counter code and the
  now-unused Timestamp import.
7628b69 - THE fix that made this work for real users: routed the
  lockout counter to the suppliers doc when it exists
  (registrationComplete: false), pending_registrations only as
  fallback before Section 1 is ever saved. functions/index.js
  collection guard updated to accept both.

Two firebase deploy --only functions runs this session (after c615b31
chain completed with App Check, and again after 7628b69) - both
confirmed successful, all other existing functions
(generateSupplierNumber, createPayfastPayment, payfastNotify,
onSupplierRegistered, checkIncompleteRegistrations, helloMassageMap)
redeployed cleanly alongside recordOtpEvent with no errors.

### PARKED / DEFERRED (not resolved this session)

- Cosmetic polish on the attempt-3 "contact admin" error screen.
- Broader Firebase App Check rollout beyond recordOtpEvent - not
  evaluated, scope was deliberately narrow this session.
- suppliers-vs-pending_registrations architecture conflict (9 June vs
  8 July decisions) - flagged for the spa build session, not decided
  today, therapist flow untouched.
- firebase-functions outdated version warning (5.1.1, upgrade
  available) and firebase-tools update (15.14.0 -> 15.24.0) - both
  surfaced again this session during deploy, already on the
  pre-launch checklist, not actioned.

### NEXT SESSION PRIORITIES

1. Dashboard rebuild (therapist) - diagram-first per standard process.
2. Spa registration rebuild - resolve the suppliers-vs-pending_registrations
   design question deliberately BEFORE any code is written, including
   the pre-Section-1 consent-field placement question flagged above.
3. Apply the same suppliers-vs-pending_registrations-aware OTP lockout
   pattern (recordOtpEvent, already generic/reusable by design) to
   register-spa.html once its architecture is settled.
4. Wrong-number OTP test (+27800000009 unregistered) through
   register.html and gallery.html - still outstanding from before this
   session, not touched today.
5. Verify reCAPTCHA holds under M1's actual retry flow - not
   explicitly re-tested this session under the new App Check layer,
   worth a dedicated pass.

## Session Log — 17 July 2026 (Registration required-fields audit + fixes)

### Scope

Started as OTP-lockout loose-end verification (wrong-number path,
reCAPTCHA under App Check) carried over from 16 July. Both confirmed
working cleanly - no regressions, no reCAPTCHA re-render issues on
the wrong-then-right retry loop.

Turned into a full audit of register.html's required-sections logic
ahead of the M3 (therapist dashboard) build, since dashboard is
designed to mirror registration's rules exactly - any gap in
registration would otherwise ship straight into dashboard as an
inherited bug. Branch: feature/2026-07-17-registration-required-fields,
merged to main via mmdone at session close.

### OTP lockout loose ends - closed

- Wrong-number path (+27800000008, clean, unregistered): tested via
  both register.html and gallery.html. Correct behaviour confirmed -
  gallery shows "Not registered yet" -> "Register as a therapist" ->
  clean handoff to register.html. No console errors. UX gap noted
  (second OTP cycle required between gallery and register) - parked
  as nice-to-have, not urgent.
- reCAPTCHA under App Check (+27800000007 clean pass, +27800000005
  wrong-wrong-right retry): both passed. No re-render errors, App
  Check debug token line appears once per load as expected. Console
  errors seen during wrong attempts are expected Firebase SDK
  behaviour (auth/invalid-verification-code), not bugs.
- Cosmetic polish on lockout screens: deliberately deferred to a
  full post-platform polish pass. Function over form this close to
  launch.

### Required-sections audit - decisions locked

Reviewed live UI against locked decision (15 June, re-confirmed 13
July): therapist required = S1+S3+S5+S7+S8. Live code only enforced
S1+S3+S7+S8 at the section level - S5 was required in intent
(REQUIRED_SECTIONS comment already said "About (display name)") but
never actually gated.

Also surfaced: Section 7 sub-items 7.2 (Massage Styles) and 7.4
(Treatments) were "required" only in the sense that requiredSubs =
[1,2,4] existed in updateSection7Progress() - but saveSub7Section()
marked any sub-section done on Save regardless of whether anything
was ticked. sub7HasValue() (the empty-check) existed in the file but
was only wired into the resume/prefill path, never into Save. A
therapist could Save 7.2/7.4 with zero selections and it would count
as complete.

New design locked, working through the false-claim risk of silent
defaults (a default value would put an unchosen, specific claim -
e.g. "Aromatherapy" - on a real listing, contradicting the platform's
trust-brand positioning):

- 7.1 Genders Served: no block. Defaults to "both" if nothing
  selected at Save. Accepted risk (Johan's call) - the only sub-item
  where a default was judged acceptable, since "both" is a
  genuinely neutral fallback, unlike a specific style/treatment.
  Side effect: 7.1 no longer needs a required/label marker since it
  can never be truly incomplete.
- 7.2 Massage Styles: heading updated to "Massage Styles (Select at
  least one)". Save blocked (no write, no done-state) if zero ticked.
- 7.3 Traditions: heading unchanged ("optional"). New selectable
  "General" option added (real choice, not a silent default) for a
  therapist unsure what to pick. No block.
- 7.4 Treatments: heading updated to "Treatments (Select at least
  one)". Save blocked if zero ticked, same pattern as 7.2. New
  selectable "General" option added here too, since 7.4 now blocks
  Save and needs an honest escape valve.
- 7.5 Service Offerings: unchanged.
- S5 displayName: same Save-block pattern as 7.2/7.4 - Save declines
  silently (later given an inline message) if displayName is blank.
  Rest of Section 5 stays optional. First field-level (not
  section-level) required gate on the platform - new pattern, noted
  as such.
- Later in session, decision extended: 7.2 also gets a "General"
  option (originally only planned for 7.3/7.4), added as a third
  Firestore document, same pattern.
- S4 (Premises & Facilities): "Mobile massage available" toggle +
  km travel-distance field reordered to appear AFTER Amenities, not
  before - was causing a real UX misread (read as being about her
  own premises, not about her travelling to the customer).

### Firestore data changes (offerings collection, category-matched)

Three new documents added manually via Firebase Console (not code -
offerings render dynamically from Firestore, confirmed via
loadOfferings()/renderOfferingsGroup(), nothing hardcoded in HTML):

- category: massageStyles, name: General, sortOrder: 0,
  visibleTo: [therapist, spa], launchActive: true
- category: traditions, name: General, sortOrder: 0,
  visibleTo: [therapist, spa], launchActive: true
- category: treatments, name: General, sortOrder: 0,
  visibleTo: [therapist, spa], launchActive: true

sortOrder 0 deliberately set below existing items (seen: Tibetan=11,
Full Day Spa=9) to sort "General" first in each list, so it's easy
to find as the "pick this if unsure" option.

### Bug found and fixed - Section 8 Photos ungated (real gap, not a regression)

Live test surfaced Section 8 (required verification photo) showing
"Complete" and unlocking Submit Registration with no photo uploaded
at all - directly contradicting a 9 July session note that this was
"CONFIRMED ALREADY WORKING."

Investigated via git history before fixing (three passes):

1. saveAccSection(n) for n===8 was checked against commit 93a8e5c
   (9 July close) - byte-identical to current, no photo gate then
   either.
2. Cross-checked submitForm() specifically (not just saveAccSection)
   at c7f3113 (12 July Section 8 rebuild) and e4c9f06 (13 July
   facePhotoUrl->facePhotoPath rename), since two session notes (12
   July: "submit gate re-locks correctly if photo is removed"; 13
   July: full live Submit test with facePhotoPath present)
   contradicted "never existed." Full diff of submitForm() across
   the entire window confirmed no photo-presence check was ever
   added or removed there.
3. Resolution: not a regression, not conflicting test results - a
   genuine test-coverage gap. Both 12 and 13 July tests started by
   uploading a photo first, so the "click Save with nothing
   selected" path was never exercised. deletePhoto() correctly
   re-locks the gate on removal (tested and true), but
   saveAccSection(8) was never given the matching guard to prevent
   reaching done without a photo in the first place - an asymmetry,
   not a break.

Fix applied: saveAccSection(8) now checks facePhotoPath (existing
value from Firestore, or freshly selected file this session) before
marking done. No photo -> inline "Verification photo required",
section stays not-done, Submit stays locked. Photo present -> proceeds
as before.

Verified live, all three paths, on +27800000005, full registration
through to Submit:
- Path C (no photo, click Save): blocked correctly, inline message
  shown, Submit stayed locked. Confirmed.
- Path A (photo selected, click Save): completed correctly, green
  tick, thumbnail shown. Confirmed.
- Full submit: completed successfully - T-26-1060 issued, info.html
  success screen shown correctly, all fields including facePhotoPath
  present.

Correction for the record: the 9 July "confirmed working" note most
likely reflected the old multi-slot photo UI (pre-12-July rebuild)
where testers happened to always upload something, not an actual
code-level gate - the underlying save logic was ungated from that
point through tonight.

### Final fix - S5 label clarity

"Display Name / Alias *" changed to "Display Name / Alias (Required)"
- bare asterisk was unexplained anywhere on screen, matches the
plain-language style already used on 7.2/7.4 headings. Pure label
change, no logic touched.

### Testing - full live end-to-end pass, +27800000005

All 8 sections completed, Submit Registration succeeded. Confirmed:
S4 field order correct, S5 displayName gate working (blocks empty,
saves when filled), S7 sub-item defaults/blocks/General options all
working as designed (7.1 default, 7.2/7.4 block+heading+General,
7.3 General added), S8 photo gate working (all three paths), full
submission flow completed - membership number T-26-1060 issued,
info.html success screen correct.

### Commits (branch feature/2026-07-17-registration-required-fields, merged to main via mmdone)

| Commit | Content |
|---|---|
| ba199f3 | register.html: S4 reorder (Amenities before mobile massage) + S5 displayName Save gate |
| 0893243 | register.html: S7 required validation (7.2/7.4) + default "both" for 7.1 |
| d6dfe41 | register.html: S8 facePhotoPath gate added to saveAccSection, mirroring S5/deletePhoto pattern |
| 14bc466 | register.html: S5 label text "(Required)" replacing bare asterisk |

Plus this session-close commit (Master Context + Obsidian note).

### Parked / carried forward

1. Gallery-to-register UX: requires a second OTP cycle (phone
   re-entered, re-verified) rather than carrying the session across -
   nice-to-have smoothing, not urgent.
2. Cosmetic polish on OTP lockout screens (attempt-3 message,
   re-entry screen) - deferred to full post-platform polish pass.
3. Test data note: +27800000005/T-26-1060 is now a REAL completed
   registration in Firestore (not a mid-flow test) - flag for
   pre-launch test-data cleanup.
4. Dashboard (M3) build: NOT STARTED this session - diagram review
   is the explicit next step, now that registration's required-
   sections logic is fully audited and fixed underneath it.
5. Workflow note (locked earlier same day): QUICK STATUS table must
   be actively rewritten every session close to match actual
   outcome, not left as carryover - applied to this update.

## Session Log — 18 July 2026 (GitHub Issues Reconciliation + M3 Dashboard Planning)

### GitHub Issues reconciled
Stale 9 June issues table replaced with live `gh issue list` state (35 open at session start). Closed: **#12** (offerings associations verified seeded and rendering, 17 July), **#15** (Tantric visual treatment resolved), **#36** (premisesType/mobileAvailable save-target bug resolved), **#39** (travel/distance options confirmed present, resolved via S4 reorder), **#43** (therapist registration OTP/session-skip logic fixed). Created: **#54** (pre-launch: clean up +27800000005/T-26-1060 test registration data), **#55** (gallery-to-register handoff requires second OTP cycle, parked), **#56** (cosmetic polish on OTP lockout screens, parked). Net: 35 → 33 open. Full reconciled list captured; 3 issues (#1, #2, #5) were previously invisible due to `gh`'s default 30-item page cap — no warning given on truncation, resolved with `--limit 100`.

### M3 Therapist Dashboard — architecture decision, supersedes Master Context line 206
**Dashboard split confirmed: separate `dashboard.html` (therapist) and `dashboard-spa.html` (spa, not yet built)** — same no-suffix/-spa convention as register.html/register-spa.html and gallery.html. This **reverses** the previously-LOCKED "single dashboard.html detects supplierType, no separate dashboard-spa.html" decision (Master Context line 206). Reason: the two dashboards look and behave differently enough that a single branching file means constant runtime "which fields for which type" checks — real complexity and frontend-lag risk, not just a maintenance preference. Gallery stays a single shared `gallery.html` (phone-driven, works for both types) — unaffected by this reversal.

dashboard.html confirmed structurally stale — not touched at the architecture level since its original 3 June build (commit `0338952`). Missing: the old 4-slot `photos[]` system never migrated to `facePhotoPath` + M11-Gallery split; no Golden Rule lock logic; none of the 17 July S4/S5/S7/S8 required-field gating. Rebuild will use current register.html as the template (same approach as the original 3 June build), consistent with the "restore from git, then clean" principle — the git history here is register.html's current state, not a clean dashboard.html to restore.

### M3 identity/session flow — locked, diagram-confirmed against live code
Full M3 diagram walked and locked across several iterations. Final locked sequence:
- Hamburger Menu → **token-in-device-memory check first** (`getValidSession`-equivalent) → `resolveIdentity()` wrapper **only fires if a token is found** — confirmed this order (not the reverse) by cross-checking `index.html`'s actual `routeToSupplierArea()`/`getValidSessionPhone()` implementation, which already does exactly this: cheap local check first, `resolveIdentity()`'s live Firestore uid-match + audit-logged check second, conditionally.
- **Fresh-OTP path also gets `resolveIdentity()`** — inserted between `storeSession()` and "View & Edit Sections" on the "Pin correct & phone number on platform" branch. This closes a real gap: register.html's `handleNext()` currently never calls `resolveIdentity()` at all (only a cheap `user.phoneNumber === phone` check, no audit logging) — same gap flagged for M1 to close later, not fixed today.
- "Pin correct & phone NOT on platform" branch → Therapist Registration M1, no `resolveIdentity()` call — correct, nothing to audit-check against a non-existent record.
- Three dashboard exit routes distinguished and confirmed: (1) view-only → "Back to Main Menu", token persists; (2) edits made → "Back to Main Menu" (not Sign Out), token persists; (3) explicit "Sign Out" → `clearSession()` wipes `mm_session_<phone>`, full OTP required next entry. Both (1) and (2) trigger OTP on return only if `getValidSession()`'s existing 30-day expiry has actually elapsed — no new 30-day logic needed, `identity-service.js` already implements it.
- Button label confirmed: **"Back to Main Menu"**, not "Sign Out" or "Log-out" — closes #31 once built.
- Section 1 and Section 8 confirmed excluded from "Edit Sections (2-8)" entirely — visible read-only elsewhere on the dashboard screen (grey dashed box on diagram), not absent. Same for phone/token display.

**M1 diagram still needs the equivalent `resolveIdentity()`-after-fresh-OTP addition applied — not done today, carried to next M1 session.**

### GOLDEN RULE — unified, supersedes the two previously-separate Section 1/Section 8 rules
Confirmed via direct code check: register.html's Section 1 (`firstName`/`lastName`) has **zero** lock logic today — no `readonly`, no `disabled`, no `input--locked` class, freely re-editable after every save. This contradicts the old "GOLDEN RULE 01: locks on save" note, which was never actually built and is now formally retired.

**New unified rule:** Section 1 (Personal) and Section 8 (Photos) both lock together, triggered by **Submit**, not save. Freely editable throughout registration, right up to submit. The instant `registrationComplete: true`, both lock permanently — visible in dashboard using the same `input--locked` treatment as the phone/token field, but applied fresh (not currently present on these fields). Only admin can change either after that point. Reason: these are the two fields admin actually vets (identity + verification photo) before approval — letting them change quietly post-approval would mean the live listing no longer matches what was checked.

Confirmed via code check (register.html lines 1085–1101) that a submitted therapist can never reach register.html again through any path — index.html's `resolveIdentity()` returns `verified` and routes straight to dashboard.html, and register.html has its own independent defensive redirect checking `pending_registrations` status as a second guard. So no lock logic needs retrofitting into register.html itself — the Golden Rule is a dashboard-only concern.

### Required/Locked/Public — new explicit field attributes, replacing inconsistent free-text notes
Raised as a structural gap: "LOCKED post-registration" in the Field Register had gone stale on at least three fields (`province`, `suburb`, `displayName`) without being caught, directly because Required and Locked were never tracked as separate, explicit attributes. Full field-by-field walk completed for all therapist-facing Sections 1–8; results captured in **Field Register v3** (new file, `docs/MM-Field-Register-v3.md` — supersedes v2). Key corrections: `province`/`suburb` confirmed fully editable, never locked (a therapist relocates between provinces — this is expected to be the most-edited section on the platform). `displayName` confirmed required, never locked, public — correcting a stale note that contradicted the entire reason it was moved out of Section 1 on 11 July in the first place (issue #30).

Section-by-section Required/Locked table locked in full — see Field Register v3 for the complete table.

### `gpsLat`/`gpsLng` — live geocode bug found, not yet fixed
Raised via a security/POPIA concern, not just a UX one: register.html's Section 3 save currently geocodes the **full street address** (`addressLine1` + suburb) via the Google Maps API whenever `addressLine1` is present, only falling back to suburb centroid if that API call fails. This produces a precise pinpoint most of the time and directly contradicts the already-locked "Therapist: suburb centroid" rule (Field Register, Master Context line 270). Confirmed as a real exposure, not just a UI-hiding concern: if `gpsLat`/`gpsLng` are used to place the public map pin (they are — needed for "near me" search and map view), a precise geocode leaks the therapist's exact address regardless of whether `addressLine1` itself is ever displayed — the coordinate *is* the address in a different format. **Not fixed today** — needs correcting in register.html directly (shared code path with dashboard), removing the live geocode call entirely in favour of a suburb-centroid lookup against Locations Reference data. Logged in Field Register v3 Known Gaps.

### POPIA private-data separation — raised again, still undesigned, now a confirmed blocker for specific fields
Johan confirmed this is a recurring, real requirement — not scope creep — and connected it explicitly to competitive risk ("as soon as the platform is launched, my competitor will immediately hunt to see what we have done"). Decision: **build it now**, starting from register.html as the platform's foundation, rather than continuing to patch around it field-by-field (as today's `addressLine1`/`gpsLat` discussion was starting to do). Explicitly acknowledged and accepted: this pushes past the 24 July internal-completion and 31 July launch target dates. Johan is deliberately not setting new dates yet — the existing dates remain the working targets to stay as close to as possible, not hard commitments already abandoned.

Confirmed via direct Master Context check: no structural separation exists today. Everything — including fields already marked "admin only" in the Field Register (`addressLine1`, `facePhotoPath`, `firstName`, `lastName`, `gender`, `vetNotes`) — lives in one flat, single `suppliers/{phone}` Firestore document. "Admin only" is enforced purely by frontend display convention, not by any actual data-layer restriction — meaning it says nothing about what's readable by a direct Firestore query or a scrape, if security rules allow any such read at all (unverified, needs checking as part of this design).

**Design not started today** — deliberately deferred until the Section 2–7 review finished, since it surfaced naturally from that review rather than being decided in isolation. Confirmed scope so far: at minimum `firstName`, `lastName`, `gender`, `addressLine1`, `facePhotoPath`, `vetNotes` are candidates for the separated/private store. Structure (separate collection vs. subcollection), security rules impact, and every read/write path touching supplier data across register.html/dashboard.html/gallery.html/admin.html all still need designing. **This is the explicit next major topic**, ahead of resuming Section 8's build-out.

### Communication channels — three-channel model documented for the first time
Confirmed against `MassageMap_Notification_Reference_v1.docx` (T1–T12) and today's discussion: three structurally independent channels — **Admin↔MassageMap** (Telegram + `admin@massagemap.co.za`, not driven by any therapist field), **MassageMap→Therapist** (`cellNumber` always via BulkSMS, `email` conditionally via Resend, WhatsApp not used until Phase 2), and **Therapist↔Customer** (new for today — `cellNumber` always revealed, `cellNumberTwo` and `whatsappNumber` toggle-gated). `email` confirmed **excluded** from the Therapist↔Customer channel entirely — customers can only reach a therapist by phone or WhatsApp, never email.

**New field: `cellNumberTwo`** — secondary public phone number, toggle-gated (proposed toggle name `showCellNumberTwo`, not yet confirmed), optional, never locked, never used for OTP/token. Every phone number shown on the public front end (both `cellNumber` and `cellNumberTwo` when revealed) must route through the same shared call mechanism — no plain static-text rendering.

`contactPreferences` (`[sms, email, whatsapp]`) confirmed to have **no actual effect** in current T1–T12 trigger logic for therapists — every trigger hardcodes unconditional SMS + conditional email, never reads this array. Narrowed to `[sms, email]` for therapist at launch (`whatsapp` parked for Phase 2, despite being therapists' actual preferred channel per Johan). Field is **not retired** — confirmed it will become functional for spa, which has a genuine routing need (owner/manager/main-office number) that therapist doesn't have.

Full detail: new file `docs/MM-Communication-Channels-Reference-v1.md`.

### Documents produced this session
- `docs/MM-Field-Register-v3.md` — supersedes v2. Explicit Public/Required/Locked columns added to every therapist field. Three stale "LOCKED" corrections. `addressLine1`, `firstName`, `lastName`, `gender`, `facePhotoPath` flagged PENDING REDESIGN pending the private-data separation work. New `cellNumberTwo` field documented. Known Gaps section expanded (gpsLat/gpsLng geocode bug, `getValidSessionPhone()` duplication, M1 diagram gap).
- `docs/MM-Communication-Channels-Reference-v1.md` — new. Three-channel model, full field-by-channel breakdown.

### Parked / carried forward
1. `getValidSessionPhone()` in index.html duplicates `identity-service.js`'s localStorage-parsing logic instead of reusing it (can't reuse directly — it doesn't know the phone number yet, it's searching for one). Two independent pieces of code now parse the same `mm_session_*` token shape. Risk of drift if token structure ever changes. **Still undecided:** log as a GitHub issue, or accept as low-risk duplication.
2. `showCellNumberTwo` toggle field name — proposed, not confirmed.
3. M1 diagram — needs the `resolveIdentity()`-after-fresh-OTP-verify addition, mirroring M3. Not applied today; Johan deliberately deferred M1 changes until M3 was fully locked.
4. POPIA private-data separation — full design session required. Explicit next major topic.
5. `gpsLat`/`gpsLng` live-geocode-instead-of-centroid bug — needs fixing in register.html, not yet done.
6. All items previously carried forward from 17 July remain open and untouched today (gallery→register second-OTP-cycle UX, OTP lockout cosmetic polish, +27800000005/T-26-1060 test-data cleanup — now tracked as issues #55, #56, #54 respectively).

---
*Session closed 18 July 2026. No brief written or code changed this session — planning and documentation only, by explicit instruction.*

## Session Log — 21 July 2026 (register.html Known-Issue List Closed — Address/Geocode/Jitter Chain, cellNumberTwo, Section 3 Validation)
**Branch: feature/2026-07-20-registration-fixes — not yet merged to main, not yet pushed.**

### SESSION SEQUENCING DECISION
Read full Master Context v64 at session start. Explicit decision made: register.html's known-issue list gets fixed and closed BEFORE the POPIA public/private supplier split resumes. This reverses the urgency POPIA was given on 18 July — POPIA split is deliberately deferred, not abandoned. Old branch feature/2026-07-15-m1-otp-lockout confirmed gone (never merged, no trace on main or origin). New branch feature/2026-07-20-registration-fixes created for this session's work, not yet merged to main, not yet pushed.

### LOCATION/ADDRESS DESIGN — LOCKED
Three-piece model decided and built this session:

1. **Silent device GPS capture** (registrationGpsLat/registrationGpsLng) — captured on registration-screen entry; if permission is off, prompt again at Submit so it isn't missed; visible to ADMIN only (vetting, area management, confirming therapist is genuinely where she says — corrected from an earlier assumption that this was legal-record-only); never shown to therapist or customer. NOT YET BUILT — this was decided but the actual capture code was not written this session (only the addressLine1/gpsLat path was built — see below). Flag this as the next concrete build item within register.html, separate from the POPIA split.

2. **Province/town/suburb/area dropdowns** — unchanged, public, remains the fallback source for the public map pin.

3. **addressLine1** — stays in Section 3 (not moved to Section 1), optional, not required. New note text: "Optional — filling this in improves your visibility on the map. Precise address will never be shown to customers." If filled: geocoded, then jittered 200m before writing to public gpsLat/gpsLng. If blank: falls back to suburb (or locationArea if suburb unset — informal-settlement path) geocode, jittered 500m. Minimum 100m separation enforced between any two suppliers' jittered pins in the same suburb/area (retry loop, max 10 attempts, accepts closest result if cap reached rather than blocking Submit).

Public precise pin-drop map (WhatsApp-style manual placement) explicitly PARKED as post-launch. Researched during this session: the competitor's site and RoomKing (SA's largest backyard-room platform, active in Johan's actual target informal-settlement market) both use suburb/area text only, no map pins, and both operate successfully at scale on that model. Decision: suburb/area-level display is sufficient for launch; a real interactive map remains a genuine differentiator worth building properly post-launch, not squeezed into the pre-launch window.

### REGISTER.HTML — FIXED AND COMMITTED THIS SESSION
- geocodeAddress() silent catch block fixed — now logs thrown errors AND Google's non-OK API statuses (was previously swallowing both)
- Root cause of gpsLat/gpsLng returning null found: Google Geocoding API was not activated on the Google Cloud project — enabled
- Second root cause found: Geocoding API rejects HTTP-referrer-restricted keys entirely (REQUEST_DENIED) — this is a hard Google constraint, not a config error. A client-side, browser-callable geocoding key can never be properly restricted, since the calling IP is the end user's device, not a fixed server. This forced an architecture change, not just a config fix.
- Geocoding moved server-side: new callable Cloud Function geocodeAddress (us-central1, auth-gated matching the generateSupplierNumber pattern), deployed. Calls Google Geocoding API server-side using a new IP-restricted key (works now because the call originates from Google's Cloud Functions infrastructure, not the browser).
- New API key created: "MassageMap Geocoding Key", restricted to Geocoding API only, IP-restricted. Stored in macOS Passwords app (not in the repo). Referenced by the Cloud Function via functions/.env as GEOCODING_API_KEY.
- Client-side window.GOOGLE_MAPS_GEOCODING_KEY removed from firebase-config.js entirely — no geocoding key ships to the browser anymore. window.GOOGLE_MAPS_API_KEY (map display, referrer-restricted) is untouched and still works as before.
- jitterCoordinate() and haversineMeters() helpers added.
- jitterWithSeparation() added — queries the suppliers collection for peers sharing the same suburb/locationArea, retries the jitter (max 10 attempts) until the result is ≥100m from every existing peer pin.
- Fallback to locationArea as the geocode/separation target when suburb is unset (informal-settlement registration path) — found and fixed same session, in two passes (geocode target first, then the separation-query field, which was still hardcoded to suburb after the first fix).
- Section 3 required-field validation added. BUG FOUND during testing: saveAccSection(3) previously had NO validation at all — a record could be saved with province/town/suburb genuinely empty, silently producing gpsLat/gpsLng: null. Now blocks Save with an inline error if province, town, or (suburb OR locationArea) are empty — matches the existing Section 5/8 validation pattern.
- Section 2: new optional cellNumberTwo field + showCellNumberTwo toggle added (same UX pattern as showWhatsapp). Validated through the existing formatPhoneNumber(). Two gaps found and fixed same session after the initial build: the value wasn't restored on resume-prefill, and it wasn't included in submitForm()'s finalData whitelist (would have silently vanished at Submit, never reaching the live suppliers doc). Both fixed, full round trip confirmed working: save → resume → submit → lands on suppliers doc.
- Public display of cellNumberTwo (profile.html/listings.html, behind showCellNumberTwo) deliberately NOT built this session — depends on the not-yet-designed customer call-up/reveal mechanism. Flagged by CC, declined as out of scope for today.
- Verified (read-only, no changes needed): province, area, suburb, locationArea, and displayName have NO lock logic anywhere in register.html. Confirmed consistent with the Golden Rule (registration never locks fields — only the dashboard does, on Submit, for Section 1 + 8 only) and with Field Register v3's corrected lock-status notes.

### NEW ISSUE FOUND, NOT FIXED — admin.html permission failures
Approve/Reject/Investigate all fail with "Missing or insufficient permissions" (loadSubscriptions, loadChangeLogs, changeLog write, confirmVetAction). Root cause confirmed: firestore.rules' isAdmin() checks a single hardcoded Auth UID (BGI0KYCKnYVM85GdlH1CG2KHP0p2). The browser session testing admin.html was authenticated as a different UID (vg5bwe3c5uT7zS4mT1BL41Q950A3) — because admin.html has no real sign-in/sign-out screen yet, so whatever authenticates in the background will essentially never match the hardcoded UID. This is a known, pre-existing gap (admin login was already on the roadmap) surfacing because admin.html happened to be opened this session. Not fixed. Not blocking register.html work.

### COMMITS THIS SESSION
Branch feature/2026-07-20-registration-fixes, in order: 4e4e1b7, 2386408, 22a3556, dda5b9d, da75915, 24f0a18 (Cloud Function), 303a74d, 6cac490, 79f08cf. Branch not yet merged to main, not yet pushed.

| Commit | Content |
|---|---|
| 4e4e1b7 | jitter gpsLat/gpsLng on Section 3 save, min 100m separation |
| 2386408 | log geocodeAddress errors instead of silent catch |
| 22a3556 | log geocodeAddress non-OK Google status |
| dda5b9d | fall back to locationArea for geocode query when suburb is unset |
| da75915 | key jitter separation query off geoTarget field, not always suburb |
| 24f0a18 | move geocoding server-side via Cloud Function, remove client-side key |
| 303a74d | add cellNumberTwo optional field to Section 2 |
| 6cac490 | carry cellNumberTwo through prefill and submit whitelist |
| 79f08cf | enforce province/town/suburb-or-area validation before Section 3 save |

### Parked / carried forward
1. Silent device GPS capture UI (registrationGpsLat/registrationGpsLng) — decided and locked this session, not yet built. Next concrete build item within register.html, separate from the POPIA split.
2. admin.html login/permission fix — found this session (isAdmin() hardcoded-UID mismatch, no real admin sign-in screen), not fixed. Pre-existing roadmap gap.
3. M1 diagram — still needs the `resolveIdentity()`-after-fresh-OTP-verify addition, mirroring M3. Carried forward from 18 July, not touched this session.
4. showCellNumberTwo public-display build (profile.html/listings.html) — depends on not-yet-designed customer call-up/reveal mechanism.
5. BulkSMS credits at zero — buy before Stage 2.
6. Public precise pin-drop map (WhatsApp-style manual placement) — PARKED post-launch (suburb/area text sufficient for launch, per competitor/RoomKing research).
7. POPIA public/private supplier split — deliberately deferred this session (urgency reversed from 18 July), remains the explicit next major topic as a dedicated standalone session.

---
*Session closed 21 July 2026. register.html known-issue list closed and tested on branch feature/2026-07-20-registration-fixes — not yet merged to main, not yet pushed. Master Context updated for review before the combined close-out commit; no commit made yet.*
