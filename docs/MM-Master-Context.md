# MassageMap — Master Context v56
**Version:** 56 | **Date:** 2026-07-09 | **Author:** Johan Cilliers | **Confidential**
**STANDALONE — no previous version needed. This is the single source of truth.**
**Note: v50 header was never updated despite 13-16 June sessions being appended — those sessions are present in the body of this file under their own dated headings. v51 bumped 24 June. This is the second consecutive on-time version bump.**

---

## QUICK STATUS — READ THIS FIRST

| Item | Status |
|---|---|
| Launch target | 31 July 2026 |
| Current phase | Phase B — Dashboard & Admin |
| Next session starts with | Cluster A fix — Storage rules path mismatch (#44), expected to also resolve #45/#46/#27/#40 |
| Primary blocker | #44 Photos Storage rules mismatch — blocks registrationComplete flag, which blocks all notifications |
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
