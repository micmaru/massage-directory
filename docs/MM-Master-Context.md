# MassageMap — Master Context v49
**Version:** 49 | **Date:** 9 June 2026 | **Author:** Johan Cilliers | **Confidential**
**STANDALONE — no previous version needed. This is the single source of truth.**

---

## QUICK STATUS — READ THIS FIRST

| Item | Status |
|---|---|
| Launch target | 31 July 2026 |
| Current phase | Phase B — Dashboard & Admin |
| Next session starts with | #12 verify associations seeded → #10 dashboard therapist end-to-end test → #26 OTP loop fix |
| Primary blocker | #26 Dashboard OTP loop — returning supplier asked for OTP on 2nd+ visit |
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
4. Single `dashboard.html` — detects supplierType on load, renders correct sections (therapist: 8 sections, spa: 9 sections)
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

64. Single `dashboard.html` detects `supplierType` on load — no separate dashboard-spa.html
65. Therapist dashboard: 8 sections. Spa dashboard: 9 sections.
66. `associationMembership` is multi-select for BOTH therapist and spa — reads dynamically from offerings collection
67. No progress bar on dashboard
68. Services section split deferred to Phase D
69. `displayName` move: from Personal section to About section — editable
70. "Sign Out" button label: must read "Back to Main Menu" — LOCKED
71. Photo storage path: `suppliers/{phone}/photos/{filename}` — LOCKED

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
*STANDALONE — this file contains everything needed to start any session without any other document.*
