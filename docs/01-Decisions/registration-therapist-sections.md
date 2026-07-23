# REGISTRATION — THERAPIST (register.html) — LOCKED SECTION ORDER

Status: locked — items 47, 48, 49, 50, 51, 53, 54 updated 23 Jul 2026 to match live code (see notes on each item). Item 52 is an **UNRESOLVED CONTRADICTION** — see below, awaiting Johan's decision.

The eight-section order itself is unchanged. What changed is the field list inside several sections. Original text retained struck through for audit trail.

47. ~~Section 1 — Personal (Required): firstName, lastName, displayName, gender~~ **UPDATED 11 Jul 2026** — `displayName` moved out of Section 1 to Section 5 (About). Section 1 is now: firstName, lastName, gender. See issue #30.
48. ~~Section 2 — Account: cellNumber (readonly), whatsappNumber, showWhatsapp, email, contactPreferences~~ **UPDATED 21 Jul 2026** — added `cellNumberTwo` and `showCellNumberTwo`. Section 2 is now: cellNumber (readonly), cellNumberTwo, showCellNumberTwo, whatsappNumber, showWhatsapp, email, contactPreferences.
49. ~~Section 3 — Location (Required): province, town, locationArea, suburb, addressLine1, addressVisible~~ **UPDATED 12 Jul + 21 Jul 2026** — `addressVisible` toggle removed from register.html (12 Jul). `addressLine1` is optional and carries new explanatory note text (21 Jul). Section 3 is now: province, town, locationArea, suburb, addressLine1 (optional). See addressline1-and-geocoding.md.
50. ~~Section 4 — Premises & Facilities: premisesType, mobileAvailable, willingToTravelKm, amenities~~ **SUPERSEDED** — Superseded by travel-distance-values.md — field is now a 5/10/15/20 km lookup with a willing-to-travel toggle, not free text.
51. ~~Section 5 — About (Required): genderServed, experienceYears, aboutMe, qualifications, associationMembership, specialsText~~ **UPDATED 11–12 Jul 2026** — `genderServed` moved out to Section 7.1 (12 Jul). `displayName` moved in from Section 1 (11 Jul) and is now the **sole required field** in Section 5. Section 5 is now: displayName (required), experienceYears, aboutMe, qualifications, associationMembership, specialsText.
52. Section 6 — Availability: weeklyHours, availableOutsideHours
    - ⚠️ **UNRESOLVED CONTRADICTION — flagged 23 Jul 2026, NOT resolved. Johan to decide.**
      The 15 Jun 2026 diagram decision places `mobileAvailable` and `willingToTravelKm` in **Section 6 (Availability)**.
      Live code has both fields in **Section 4 (Premises & Facilities)** — as item 50 above records.
      Both positions are noted here deliberately. Neither has been changed. Do not silently resolve this — the fix is either a code move or a diagram correction, and that is Johan's call.
53. ~~Section 7 — Services (Required): massageStyles (includes Tantric), traditions, treatments, classification, serviceOfferings~~ **UPDATED 12 Jul 2026** — `classification` deleted platform-wide. `genderServed` added as 7.1. Section 7 is now split into 5 sub-accordions. Section 7 is now: 7.1 genderServed, massageStyles (includes Tantric), traditions, treatments, serviceOfferings. See section7-subaccordions.md and classification-field-removed.md.
54. ~~Section 8 — Photos (Required): min 1 face photo, up to 4 additional~~ **UPDATED 11–12 Jul 2026** — the 4 additional photo slots were removed. Section 8 is a single required verification photo only; the gallery is a separate flow. See verification-photo.md and gallery-m11.md.
