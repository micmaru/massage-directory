# MassageMap — Field Register v3
**Date:** 2026-07-18 | **Source:** Field Register v2 (13 July 2026) + M3 Therapist Dashboard planning session (18 July 2026) | **Confidential**

This is the authoritative field reference for all Firestore collections. Every field name in every brief and Claude Code instruction must come from this document. No guessing.

**Changes from v2 (18 July 2026):**
1. Added three explicit attribute columns to the `suppliers` collection table — **Public**, **Required**, **Locked** — replacing free-text lock/privacy notes buried in Notes. This was raised as a structural gap during M3 planning: "LOCKED post-registration" was applied inconsistently in v2 and had gone stale on at least three fields without being caught.
2. **Corrected three stale "LOCKED post-registration" notes**, confirmed stale during M3 planning:
   - `province`, `suburb` — Section 3 (Location) confirmed **fully editable, never locked** ("therapist moves between provinces" — she can relocate at any time).
   - `displayName` — confirmed **required but never locked**, editable at any time. (Locking would contradict the reason this field was moved from Personal to About on 11 July 2026 in the first place — issue #30, "therapist needs to be able to change her public alias without it being locked into initial signup.")
3. **New unified GOLDEN RULE locked** (supersedes two previously-separate rules): Section 1 (Personal — `firstName`, `lastName`, `gender`) and Section 8 (Photos — `facePhotoPath`) both lock together, triggered by **Submit**, not by individual section save. Before submit, both freely editable. After submit, both visible but non-interactive in dashboard — only admin can change either. Reason: these are the two things admin actually vets before approval; letting them change quietly after approval would mean the live listing no longer matches what was checked.
4. **`gpsLat`/`gpsLng` calculation method corrected.** Previously the live code geocoded the full `addressLine1` + suburb string via the Google Maps API whenever an address was present, only falling back to suburb centroid if that call failed — producing a precise pinpoint most of the time. This contradicted the already-locked rule ("Therapist: suburb centroid") and was flagged as a live privacy/POPIA risk during M3 planning: if `gpsLat`/`gpsLng` are used to place the public map pin, a precise geocode leaks the therapist's exact address even though `addressLine1` itself is never displayed. **Corrected:** therapist `gpsLat`/`gpsLng` must always derive from a suburb-centroid lookup against stored Locations Reference data — no live geocode API call, no fallback-from-precise logic. Spa `gpsLat`/`gpsLng` (device GPS) unaffected — spa premises are deliberately meant to be found precisely.
5. **`addressLine1` (therapist) status: PENDING REDESIGN.** Raised during M3 planning as part of a broader, not-yet-designed requirement: private supplier PII (currently confirmed to include at minimum `firstName`, `lastName`, `gender`, `addressLine1`, `facePhotoPath`, `vetNotes` for therapists) must be structurally separated from the public-readable `suppliers` document — a separate collection/subcollection, not field-level "admin only" notes with no actual data-layer enforcement. Which section's UI collects `addressLine1` and where it's stored is **not decided** — do not assume it stays in Section 3 or in the `suppliers` document as currently structured. Full design session required before any brief touches this.
6. Section-by-section Required/Locked table for the M3 Therapist Dashboard build locked in full — see **M3 Dashboard — Section Attribute Summary** below.
7. **Three-channel communication model locked** — Admin↔MassageMap, MassageMap↔Therapist, Therapist↔Customer. See **Communication Channels** section below. New field added: `cellNumberTwo`. `email` confirmed Channel-2-only (never customer-facing). `contactPreferences` narrowed to `[sms, email]` for therapist (whatsapp parked, Phase 2) and confirmed informational-only for therapist — real send logic is unconditional SMS + conditional email, not driven by this array. Field is reserved and will become functional for spa (owner/manager/office-number routing).

---

## suppliers collection — THERAPIST fields

| Field | Type | Section | Public | Required | Locked | Notes |
|---|---|---|---|---|---|---|
| `supplierType` | string | Account | N | Y | Y (system) | `individual` — written on registration, never changed |
| `supplierNumber` | string | Account | N | Y | Y (system) | T-YY-COUNTER. Admin/internal only, never shown publicly |
| `status` | string | Account | N | Y | N (admin-managed) | `pending` / `active` / `suspended` / `review` / `rejected` |
| `subscriptionStatus` | string | Account | N | Y | N (system-managed) | `active` / `expired` / `not_paid` — NEVER mix with `status` |
| `subscriptionExpiry` | timestamp | Account | N | N | N (system-managed) | Date subscription expires |
| `registrationComplete` | boolean | Account | N | Y | N→Y once true (system) | `false` = draft. `true` = fully submitted, never reverts |
| `cellNumber` | string | Account | **Y — always revealed, no toggle** | Y | Y | Doc ID / session token. The reveal-via-call mechanism itself is mandatory, not optional — this is Channel 3's primary contact path. Not editable in Section 2 (readonly display only) — phone-loss recovery is a separate manual admin process |
| `cellNumberTwo` | string | Account | **Y — toggle-gated** | N | N | **NEW FIELD, 18 July.** Secondary number, Channel 3 only. Never used for OTP/token (rare re-registration edge case not policed or tested for). Needs a dedicated display-toggle field, name TBD — proposed `showCellNumberTwo`, matching the `showWhatsapp` convention. Confirm naming before build. |
| `whatsappNumber` | string | Account | **Y — toggle-gated via `showWhatsapp`** | N | N | Channel 3 only. Editable, no validation |
| `showWhatsapp` | boolean | Account | N/A (toggle) | N | N | Controls whether WhatsApp button shows on public profile. Not used for Channel 2 (platform notifications) — WhatsApp notifications parked for Phase 2, see Master Context #189 |
| `email` | string | Account | **N — Channel 2 only, never customer-facing** | N | N | Platform → therapist notifications only (welcome, payment, vetting, renewal, expiry, win-back — T1, T3a–T4, T7–T12). Customers never see this field, no reveal mechanism, no toggle needed. Editable, no validation |
| `contactPreferences` | array | Account | N (internal) | N | N | **Therapist: informational only, no real effect.** Narrowed to `[sms, email]` at launch — `whatsapp` parked for Phase 2 despite being therapists' actual preferred channel. Actual T1–T12 send logic is unconditional SMS + conditional email ("if on file") — never reads this array. **Reserved and will become functional for spa** — routes between owner/manager/main-office number, a real routing need spa has that therapist doesn't. |
| `dataConsentGiven` | boolean | Account | N | Y | Y (system) | POPIA consent, set once at consent gate |
| `dataConsentTimestamp` | timestamp | Account | N | Y | Y (system) | Set once at consent gate |
| `firstName` | string | Personal (S1) | N | Y | **Y — locks on Submit** | Part of the unified GOLDEN RULE. Not publicly displayed — `displayName` is the public name. **PENDING**: candidate for private-data separation redesign |
| `lastName` | string | Personal (S1) | N | Y | **Y — locks on Submit** | Same as above |
| `gender` | string | Personal (S1) | N | Y | **Y — locks on Submit** | `male` / `female` / `non-binary`. Same as above |
| `displayName` | string | About (S5) | Y | Y | **N — never locked** | **CORRECTED 18 July.** Public name, required, freely editable at any time — this was the entire reason it moved out of Section 1 on 11 July |
| `genderServed` | string | Services (S7.1) | Y | N | N | Defaults silently to `both` if nothing selected on save |
| `experienceYears` | string | About (S5) | Y | N | N | `0-1` / `1-3` / `3-5` / `5+` |
| `province` | string | Location (S3) | Y | **Y** | **N — CORRECTED 18 July** | Freely editable — "therapist moves between provinces" |
| `suburb` | string | Location (S3) | Y (suburb only, never full address) | **Y** | **N — CORRECTED 18 July** | Freely editable |
| `area` | string | Location (S3) | Y | Y | N | Town document ID |
| `locationArea` | string | Location (S3) | Y | Y | N | Admin-created area grouping |
| `addressLine1` | string | Location (S3) | N — never public | **PENDING REDESIGN** | **PENDING REDESIGN** | See v3 change #5 above. Do not build against current assumption of "Section 3, admin-only field on suppliers doc" |
| `addressVisible` | boolean | Location (S3) | N/A (toggle) | N | N | Therapist default `false` — full address never shown regardless |
| `gpsLat` | double | Location (S3) | Y (coarse only) | Y | N | **CORRECTED 18 July** — suburb-centroid lookup only, never live geocode of `addressLine1`. See v3 change #4 |
| `gpsLng` | double | Location (S3) | Y (coarse only) | Y | N | Same as `gpsLat` |
| `premisesType` | string | Premises (S4) | Y | N | N | `home` / `business` |
| `mobileAvailable` | boolean | Premises (S4) | Y | N | N | Travels to client |
| `willingToTravelKm` | string | Premises (S4) | Y | N | N | Only relevant if `mobileAvailable` true |
| `amenities` | array | Premises (S4) | Y | N | N | From offerings collection |
| `aboutMe` | string | About (S5) | Y | N | N | Free text, max 300 chars |
| `specialsText` | string | About (S5) | Y | N | N | Free text |
| `qualifications` | string | About (S5) | Y | N | N | Single text input |
| `associationMembership` | array | About (S5) | Y | N | N | From offerings collection |
| `weeklyHours` | map | Availability (S6) | Y | N | N | Therapist's call entirely — no forced minimum hours |
| `availableOutsideHours` | boolean | Availability (S6) | Y | N | N | |
| `massageStyles` | array | Services (S7.2) | Y | **Y** | N | Save blocked if empty — at least one required |
| `traditions` | array | Services (S7.3) | Y | N | N | |
| `treatments` | array | Services (S7.4) | Y | **Y** | N | Save blocked if empty — at least one required |
| `serviceOfferings` | array | Services (S7.5) | Y | N | N | |
| `facePhotoPath` | string | Photos (S8) | N — never public | Y | **Y — locks on Submit** | Storage path, not URL. Part of unified GOLDEN RULE. **PENDING**: candidate for private-data separation redesign |
| `vetNotes` | string | Admin only | N — not even shown to supplier | N | N/A | Admin-only, always |
| `rejectionReason` | string | Admin only | N (shown to supplier only if `status = rejected`) | N | N/A | |
| `uid` | string | Admin only | N | Y | Y (system) | Firebase Auth UID, field not doc ID |
| `referralCode` | string | Admin only | N | N | N/A | Phase 2, generated on submit |
| `createdAt` | timestamp | Admin only | N | Y | Y (system) | Must survive from lightweight record — never re-set on Submit |
| `lastUpdated` | timestamp | Admin only | N | Y | N (system, updates every save) | |

**Spa fields** (`spaPhone`, `spaMobile`, `ownerFirstName`, `tradingName`, `registrationNumber`, `vatNumber`, `aboutSpa`, etc.) — carried forward unchanged from v2. Public/Required/Locked attributes **not yet assigned** — out of scope for this session (therapist-only), to be done at the dedicated spa design session. Do not assume therapist attribute values apply to the spa equivalents.

---

## Communication Channels (locked 18 July 2026)

Three structurally separate channels — confirmed against `MassageMap_Notification_Reference_v1.docx` (T1–T12) and today's planning session. No field or address is ever shared across more than one channel except where explicitly noted.

### Channel 1 — Admin ↔ MassageMap (system)
| Address | Source | Fires on |
|---|---|---|
| Telegram Chat ID `917892632` | Admin's own config, not a supplier field | T1, T2, T6 — always |
| `admin@massagemap.co.za` | Hardcoded platform address, not a supplier field | Same triggers — always |

Not driven by any therapist field.

### Channel 2 — MassageMap (system) → Therapist
| Field | Condition | Service |
|---|---|---|
| `cellNumber` | Always | BulkSMS |
| `email` | Only if on file | Resend |
| `whatsappNumber` | **Not used at launch** — Phase 2, per Master Context #189 | — |

Fires on: T1, T3a, T3b, T3c, T4, T7, T8, T9, T10, T11, T12. Account-status/lifecycle messages only (welcome, payment, vetting, renewal, expiry, win-back) — never customer-initiated contact.

### Channel 3 — Therapist ↔ Customer
| Field | Toggle | Mechanism |
|---|---|---|
| `cellNumber` | No — always revealed | Call mechanism |
| `cellNumberTwo` | Y — dedicated toggle (name TBD, proposed `showCellNumberTwo`) | Call mechanism |
| `whatsappNumber` | Y — `showWhatsapp` | WhatsApp mechanism |

`email` is explicitly **excluded** from this channel — customers can only reach a therapist via phone/WhatsApp, never email. Every number rendered on the public front end must route through the shared call mechanism — no plain static text rendering of any phone number, ever.

---

## M3 Dashboard — Section Attribute Summary (locked 18 July 2026)

| Section | Required | Locked |
|---|---|---|
| 1 — Personal | Y (name, gender) | **Y — locks on Submit** |
| 2 — Account | N | N |
| 3 — Location | **Y** | N |
| 4 — Premises & Facilities | N | N |
| 5 — About | `displayName` only | N (never) |
| 6 — Availability | N | N |
| 7 — Services | 7.2 (Massage Styles) + 7.4 (Treatments) only | N |
| 8 — Photos | Y | **Y — locks on Submit** |

Registration and dashboard behave identically on every one of these — no field is blocked differently or validated differently between the two contexts.

---

## Everything below unchanged from v2 — carried forward in full

## pending_registrations collection

Document ID: phone number (e.g. `+27842500422`)

| Field | Notes |
|---|---|
| `cellNumber` | Phone number from OTP verification |
| `createdAt` | serverTimestamp() — written at OTP verify |
| `status` | `incomplete` → `completed` on submit |
| `supplierNumber` | Added after Personal/Business section saved |
| `smsSent` | Boolean — set `true` after 24h reminder SMS fires. Never fires twice. |
| `dataConsentGiven` | `true` — saved at consent gate |
| `dataConsentTimestamp` | serverTimestamp() — saved at consent gate |
| `facePhotoPath` | Same field/meaning as on `suppliers` — see above. Cleared via `deleteField()` on delete during registration. |
| All section fields | Merged progressively as each section is saved via `setDoc merge:true` |

---

## settings/config document

| Field | Value | Notes |
|---|---|---|
| `priceIndividual` | 299 | NEVER hardcode. Always read from here. |
| `priceSpa` | 999 | NEVER hardcode. Always read from here. |
| `counterIndividual` | 25 (seed) | Increments with each new therapist registration |
| `counterSpa` | 25 (seed) | Increments with each new spa registration |
| `autoApprove` | false | Manual approval. ALWAYS false in production. |
| `verificationHoldHours` | 24 | Hours before profile goes live after payment |

---

## offerings collection

| Field | Notes |
|---|---|
| `category` | `massageStyles` / `traditions` / `treatments` / `serviceOfferings` / `amenities` / `associations`. `classification` retired 11 July 2026 — see Retired Fields. |
| `name` | Display name of the offering |
| `description` | Optional description |
| `launchActive` | Boolean — show at launch |
| `sortOrder` | Display order |
| `visibleTo` | Array — `['therapist']` / `['spa']` / `['therapist','spa']`. NEVER use `'individual'`. |
| `createdAt` | Timestamp |

**Categories seeded:**
- `massageStyles`: Swedish, Deep Tissue, Hot Stone, Sports Massage, Pregnancy Massage, Aromatherapy, Cupping, Lymphatic Drainage, Trigger Point Therapy, Tantric (visibleTo: therapist only), Four Hands, etc.
- `traditions`: Thai, Balinese, Shiatsu, Ayurvedic, Javanese, African Traditional, etc.
- `treatments`: Full Body, Back & Neck, Legs & Feet, Indian Head Massage, Facial, Scalp Massage, Body Scrub, Body Wrap, etc.
- `serviceOfferings`: Couples Massage, Mobile/House Call, Corporate/Workplace, Full Day Spa, Half Day Spa, Gift Voucher, Kiddies Spa, Birthday Package, Membership/Package, etc.
- `amenities`: Parking, Shower, Couples Room, Air Conditioning, Wi-Fi, Wheelchair Access, Baby Changing Facility, Waiting Area, Refreshments, Health Bar
- `associations`: AHPCSA, MTASA, SAAHIP, SPAASA
- `classification` (Therapeutic Massage, Holistic, Beauty & Wellness) — RETIRED as a supplier-facing field 11 July 2026. Offering data may still exist for Phase 2 (extended classification options), but is not read or written anywhere in the current registration flow.

---

## galleryPhotos (on suppliers document, M11-Gallery)

| Field | Notes |
|---|---|
| `galleryPhotos` | Array of `{path, visible}` objects. Storage path: `suppliers/{authUid}/gallery/{filename}`. Separate from `facePhotoPath` — public marketing photos, OTP required every access, no session-skip. |
| `galleryTermsAcknowledgedAt` | Timestamp — set on first gallery visit |

---

## locations_towns collection

Document ID: `townId`

| Field | Notes |
|---|---|
| `townName` | Town name — use `townName` NOT `town` |
| `provinceId` | Reference to province |
| `provinceName` | Denormalised province name |
| `createdAt` | Timestamp |

---

## locations_suburbs collection

| Field | Notes |
|---|---|
| `name` | Suburb name |
| `townId` | Reference to town |
| `townName` | Denormalised town name |
| `provinceId` | Reference to province |
| `provinceName` | Denormalised province name |
| `createdAt` | Timestamp |

---

## locations_areas collection

| Field | Notes |
|---|---|
| `areaName` | Area name — use `areaName` NOT `name` |
| `townId` | Reference to town |
| `townName` | Denormalised town name |
| `provinceId` | Reference to province |
| `provinceName` | Denormalised province name |
| `suburbs` | Array of suburb names in this area |
| `createdAt` | Timestamp |

---

## subscriptions collection

| Field | Notes |
|---|---|
| `supplierId` | Phone number (document ID of supplier) |
| `supplierType` | `individual` or `spa` |
| `status` | Subscription status |
| `monthlyRate` | Rate at time of subscription |
| `startDate` | Timestamp |

---

## payments collection

| Field | Notes |
|---|---|
| `supplierId` | Phone number |
| `amount` | Payment amount |
| `status` | Payment status |
| `paidAt` | Timestamp |

---

## auditLog collection

| Field | Notes |
|---|---|
| `action` | What happened |
| `actor` | Who triggered it |
| `supplierId` | Phone number |
| `supplierName` | firstName + lastName (never displayName alone) |
| `supplierType` | `individual` or `spa` |
| `severity` | `critical` / `important` / `low` |
| `reason` | Mandatory for admin. Auto-populated for system. Not required for supplier self-service. |
| `oldValues` | Previous field values |
| `newValues` | Updated field values |
| `timestamp` | Timestamp |
| `amount` | Payment events only |

**CRITICAL:** append-only — no update, no delete, EVER. Not even admin. Legal record.

---

## termsDocuments collection

3 documents: Supplier T&C, Cookie Policy, Privacy Policy. Admin edits via Terms & Conditions screen under Maintenance menu.

---

## Firestore Indexes (6 confirmed correct — 18 May 2026)

| Collection | Fields |
|---|---|
| `locations_areas` | townName + areaName |
| `locations_suburbs` | townName + name |
| `locations_towns` | provinceName + name |
| `suppliers` | province + status |
| `suppliers` | status + createdAt |
| `suppliers` | suburb + status |

---

## KNOWN GAPS (carried forward from v2, plus new items from 18 July)

| Gap | Detail |
|---|---|
| `register-spa.html` createdAt clobber | Same bug as the therapist-side fix applied 13 July — `finalData` re-sets `createdAt: serverTimestamp()` on Submit, clobbering the original registration-start time. Not yet fixed. Deferred to the planned spa session. |
| `photos` array vs `facePhotoPath` | `admin.html` and `admin-supplier.html` still read the legacy `photos`/`idPhotoUrl` fields, never `facePhotoPath` — any therapist registered under the new flow will show "No photos uploaded" in admin vetting until this is reconciled. |
| Admin notification email | Sends from Resend's sandbox domain (`onboarding@resend.dev`), which only delivers to the Resend account owner's own address — `admin@massagemap.co.za` is silently blocked. Fix requires verifying `massagemap.co.za` as a sending domain in Resend + DNS records. DNS records could not be added via cPanel Zone Editor (Add Record tool only offered MX type) — support ticket opened with domains.co.za 13 July 2026, awaiting response. |
| **NEW — `addressLine1` / private-data separation** | Not yet designed. Private therapist PII (`firstName`, `lastName`, `gender`, `addressLine1`, `facePhotoPath`, `vetNotes` confirmed so far) sits in the same flat, publicly-readable `suppliers` document as public-facing fields. No structural (collection/subcollection) separation exists. Full design session required — do not build against current `addressLine1`/Section 3 assumptions until resolved. |
| **NEW — `gpsLat`/`gpsLng` live geocode bug** | Current register.html code geocodes the full street address via Google Maps API whenever `addressLine1` is present, only falling back to suburb centroid on API failure — producing a precise pinpoint most of the time, contradicting the locked "suburb centroid only" rule and creating a public-map privacy leak. Needs fixing in register.html (not just avoiding in dashboard) — same shared bug. |
| **NEW — `getValidSessionPhone()` duplication** | `index.html` re-implements its own localStorage `mm_session_*` scan instead of calling `identity-service.js`'s `getValidSession(phone)` (can't reuse directly — it doesn't know the phone number yet, it's searching for one). Two independent pieces of code now parse the same token shape — risk of drift if the token structure changes. Status: flagged, not yet resolved whether to log as GitHub issue or accept as-is. |
| **NEW — M1 diagram gap** | M1 (Therapist Registration OTP) needs the same `resolveIdentity()`-after-fresh-OTP-verify addition just locked for M3, to close the same audit-logging gap on the fresh-OTP path. Not yet applied to M1's diagram or code. |

---

## RETIRED FIELDS (do not use — removed from all code)

| Field | Replaced by |
|---|---|
| `parkingAvailable` | `amenities` array |
| `showerFacilities` | `amenities` array |
| `idPhotoUrl` | `facePhotoUrl`, then `facePhotoPath` (13 July 2026) |
| `massageArea` | `locationArea` |
| `massageTypes` | `offerings` collection |
| `facePhotoUrl` | `facePhotoPath` — renamed 13 July 2026. Same purpose, different storage semantics (path, not URL; private path, not public). See suppliers collection entry above. |
| `showFacePhoto` | No replacement. Dropped 7 July 2026 — the face/verification photo has no visibility toggle; it is always admin-only, never shown publicly, no exceptions. |
| `classification` | No replacement. Removed platform-wide 11 July 2026 (HTML, render, prefill, submitForm — zero references remain in register.html). Offerings category data may still exist for Phase 2 use but is not read/written by any current supplier-facing flow. |

---
*MassageMap Field Register v3 | 2026-07-18 | Confidential*
