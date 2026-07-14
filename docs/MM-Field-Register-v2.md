# MassageMap — Field Register v2
**Date:** 2026-07-13 | **Source:** Field Register v1 + Master Context sessions through 13 July 2026 | **Confidential**

This is the authoritative field reference for all Firestore collections. Every field name in every brief and Claude Code instruction must come from this document. No guessing.

**Changes from v1 (13 July 2026):** `facePhotoUrl` renamed to `facePhotoPath` and description corrected (path, not URL; private path, not public); `showFacePhoto` retired; `classification` retired; `displayName` section corrected from Personal to About; `photos` array description flagged as stale pending M11-Gallery design.

---

## suppliers collection

| Field | Type | Therapist | Spa | Section | Notes |
|---|---|---|---|---|---|
| `supplierType` | string | Y | Y | Account | `individual` or `spa` — written on registration, never changed |
| `supplierNumber` | string | Y | Y | Account | T-YY-COUNTER / S-YY-COUNTER. Admin/internal only, never shown publicly |
| `status` | string | Y | Y | Account | `pending` / `active` / `suspended` / `review` / `rejected` |
| `subscriptionStatus` | string | Y | Y | Account | `active` / `expired` / `not_paid` — NEVER mix with `status` |
| `subscriptionExpiry` | timestamp | Y | Y | Account | Date subscription expires |
| `registrationComplete` | boolean | Y | Y | Account | `false` = lightweight. `true` = fully submitted. |
| `cellNumber` | string | Y | Y | Account | Primary cell — OTP login and SMS notifications |
| `whatsappNumber` | string | Y | Y | Account | WhatsApp contact number — always captured |
| `showWhatsapp` | boolean | Y | Y | Account | `true` = WhatsApp button shown on public profile |
| `email` | string | Y | Y | Account | Optional therapists. Mandatory spas. |
| `contactPreferences` | array | Y | Y | Account | Therapist: `[sms,email,whatsapp]`. Spa: `[phone,whatsapp,email]` |
| `dataConsentGiven` | boolean | Y | Y | Account | POPIA consent — captured at consent gate |
| `dataConsentTimestamp` | timestamp | Y | Y | Account | Exact moment consent was given |
| `requiresInvoice` | boolean | N | Y | Account | Spa only. Invoice generation Phase 2. |
| `spaPhone` | string | N | Y | Account | Spa landline number |
| `spaPhoneVisible` | boolean | N | Y | Account | Show landline on listing |
| `spaMobile` | string | N | Y | Account | Spa mobile number |
| `spaMobileVisible` | boolean | N | Y | Account | Show mobile on listing |
| `ownerFirstName` | string | N | Y | Account | Spa only. Admin/vetting only. Never shown publicly. |
| `ownerLastName` | string | N | Y | Account | Spa only. Admin/vetting only. |
| `ownerMobile` | string | N | Y | Account | Spa only. Admin/vetting only. |
| `managerFirstName` | string | N | Y | Account | Spa only. Admin/vetting only. |
| `managerLastName` | string | N | Y | Account | Spa only. Admin/vetting only. |
| `managerMobile` | string | N | Y | Account | Spa only. Admin/vetting only. |
| `firstName` | string | Y | N | Personal | Therapist only. LOCKED post-registration. |
| `lastName` | string | Y | N | Personal | Therapist only. LOCKED post-registration. |
| `displayName` | string | Y | Y | About | Therapist: public name. Spa: public trading name. LOCKED post-registration. Moved from Personal (Section 1) to About (Section 5), 11 July 2026. |
| `tradingName` | string | N | Y | Personal | Spa only. Legal trading name. LOCKED post-registration. Admin only. |
| `registrationNumber` | string | N | Y | Personal | Spa only. Company reg number. Admin only. |
| `vatNumber` | string | N | Y | Personal | Spa only. VAT number (optional). Admin only. |
| `gender` | string | Y | N | Personal | Therapist only — `male` / `female` / `non-binary`. LOCKED post-registration. |
| `genderServed` | string | Y | Y | About | `both` / `female` / `male` (labels: Ladies / Gents on UI) |
| `experienceYears` | string | Y | N | About | Therapist only — `0-1` / `1-3` / `3-5` / `5+` |
| `province` | string | Y | Y | Location | Lowercase slug e.g. `gauteng`. LOCKED post-registration. |
| `suburb` | string | Y | Y | Location | Therapist: suburb only shown publicly (privacy). Spa: shown publicly. LOCKED post-registration. |
| `area` | string | Y | Y | Location | Town document ID from locations_towns |
| `locationArea` | string | Y | Y | Location | Admin-created area grouping within a town. LOCKED field name. Previously `massageArea`. |
| `addressLine1` | string | Y | Y | Location | Full street address — ADMIN ONLY for therapists. Mandatory for spas. |
| `addressVisible` | boolean | Y | Y | Location | `false` = suburb only shown (therapist default). `true` = full address shown (spa default). |
| `gpsLat` | double | Y | Y | Location | Therapist: suburb centroid. Spa: device GPS. |
| `gpsLng` | double | Y | Y | Location | Same source rules as `gpsLat` |
| `premisesType` | string | Y | N | Premises | Therapist only — `home` / `business` |
| `mobileAvailable` | boolean | Y | N | Premises | Therapist only — travels to client |
| `willingToTravelKm` | string | Y | N | Premises | Therapist only — `10` / `25` / `50` / `100` |
| `amenities` | array | Y | Y | Premises | Dynamic from offerings collection (category: amenities). Replaces retired `parkingAvailable` and `showerFacilities`. |
| `aboutMe` | string | Y | N | About | Therapist only — free text max 300 chars |
| `aboutSpa` | string | N | Y | About | Spa only — free text max 300 chars |
| `specialsText` | string | Y | Y | About | Promotions / specials — free text |
| `qualifications` | string | Y | N | About | Therapist only. Single text input. |
| `associationMembership` | array | Y | Y | About | Both: reads from offerings category: `associations`. Saves as array. LOCKED v44. |
| `massageStyles` | array | Y | Y | Services | Therapist: includes Tantric. Spa: Tantric excluded. |
| `traditions` | array | Y | Y | Services | From offerings collection |
| `treatments` | array | Y | Y | Services | From offerings collection |
| `serviceOfferings` | array | Y | Y | Services | Commercial packages from offerings collection |
| `weeklyHours` | map | Y | Y | Availability | `{monday:{available,from,to},...sunday}` — `available` bool, `from`/`to` int (hour) |
| `availableOutsideHours` | boolean | Y | Y | Availability | `true` = by arrangement outside listed hours |
| `facePhotoPath` | string | Y | Y | Photos | Required verification photo — ADMIN ONLY, never shown publicly, no visibility toggle. Stores the **Storage path** (e.g. `suppliers/{uid}/id/verification-{filename}`), NOT a public download URL. Located on the private `id/` Storage path (`allow read: if request.auth != null`), not the public `photos/` path. Fetched live via authenticated `getDownloadURL()` at render time — never persisted as a standing public link. Renamed from `facePhotoUrl` 13 July 2026 to reflect this. Locked once set — only admin can reset (post-Submit). |
| `photos` | array | Y | Y | Photos | **STALE — pending review.** Originally spec'd as `photos[0]`=face photo, `photos[1]`=card photo (public), `photos[2]+`=additional profile photos. This multi-slot model does not exist in the current registration build — Section 8 was reduced to the single `facePhotoPath` field only (7 July 2026 decision). Public marketing photos are planned as a separate, not-yet-built standalone flow (M11-Gallery, own field(s), own Storage rules, OTP required every access). `admin.html` and `dashboard.html` still read/write this legacy `photos` array as of 12 July — needs reconciliation once M11-Gallery is designed. Do not use this field for any new work without checking current state first. |
| `galleryPhotos` | array | Y | N | Gallery | Therapist only (M11-Gallery flow). Array of objects, max 4 entries: `{ path: string, visible: boolean }`. `path` is the **Storage path** under `suppliers/{uid}/gallery/{filename}` — never a download URL; thumbnails fetch a live `getDownloadURL()` at render time. Public field — displayed on the customer-facing frontend when `visible: true`. Written only via `saveGallery()` in `gallery.html` using `setDoc merge:true`. Batched: uploads and visibility toggles accumulate in memory and write once on Save tap. Exception — delete removes the Storage file and the array entry immediately, before Save. |
| `galleryTermsAcknowledgedAt` | timestamp | Y | N | Gallery | Therapist only (M11-Gallery flow). Firestore `serverTimestamp()`. Set once, the first time a therapist reaches the gallery warning/acknowledgment screen and ticks the checkbox. Presence of this field on the supplier document determines whether that screen shows again — if present, she skips straight to the gallery screen. |
| `vetNotes` | string | Y | Y | Admin only | Admin vetting notes. NEVER shown to supplier. |
| `rejectionReason` | string | Y | Y | Admin only | Shown to supplier only when `status = rejected` |
| `uid` | string | Y | Y | Admin only | Firebase Auth UID. Stored as field — NOT used as document ID. |
| `referralCode` | string | Y | Y | Admin only | Phase 2 referral system. Generated on submit. |
| `createdAt` | timestamp | Y | Y | Admin only | When supplier registered. On therapist Submit, this must survive from the lightweight record created by `generateSupplierNumber()` — the final `setDoc` must NOT re-set this via `serverTimestamp()`, or it clobbers the true registration-start time (fixed in register.html 13 July 2026; register-spa.html has the same clobber bug, not yet fixed — see Known Gaps). |
| `lastUpdated` | timestamp | Y | Y | Admin only | When supplier last updated profile |

---

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

## locations_provinces collection

Document ID: `provinceId`

| Field | Notes |
|---|---|
| `provinceName` | Province name — use `provinceName` NOT `province` |
| `createdAt` | Timestamp |

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

## KNOWN GAPS (as of 13 July 2026 — not yet fixed)

| Gap | Detail |
|---|---|
| `register-spa.html` createdAt clobber | Same bug as the therapist-side fix applied 13 July — `finalData` re-sets `createdAt: serverTimestamp()` on Submit, clobbering the original registration-start time. Not yet fixed. Deferred to the planned spa session. |
| `photos` array vs `facePhotoPath` | `admin.html` and `admin-supplier.html` still read the legacy `photos`/`idPhotoUrl` fields, never `facePhotoPath` — any therapist registered under the new flow will show "No photos uploaded" in admin vetting until this is reconciled. |
| Admin notification email | Sends from Resend's sandbox domain (`onboarding@resend.dev`), which only delivers to the Resend account owner's own address — `admin@massagemap.co.za` is silently blocked. Fix requires verifying `massagemap.co.za` as a sending domain in Resend + DNS records. DNS records could not be added via cPanel Zone Editor (Add Record tool only offered MX type) — support ticket opened with domains.co.za 13 July 2026, awaiting response. |

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
*MassageMap Field Register v2 | 2026-07-13 | Confidential*
