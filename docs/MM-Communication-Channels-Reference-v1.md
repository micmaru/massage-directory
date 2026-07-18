# MassageMap — Communication Channels Reference v1
**Date:** 2026-07-18 | **Source:** M3 Therapist Dashboard planning session, 18 July 2026, cross-checked against `MassageMap_Notification_Reference_v1.docx` (T1–T12) | **Confidential**

Three structurally independent communication channels exist on the platform. No field or address is shared across more than one channel except where explicitly noted. This document exists because the channels had never been mapped explicitly in one place before — decisions about `email`, `contactPreferences`, and phone-number display were scattered and, in the case of `contactPreferences`, disconnected from what the trigger logic actually does.

---

## Channel 1 — Admin ↔ MassageMap (system)

Not driven by any therapist or spa field. Fires on new registrations requiring admin action.

| Address | Source | Fires on |
|---|---|---|
| Telegram Chat ID `917892632` | Admin's own config | T1, T2, T6 — always |
| `admin@massagemap.co.za` | Hardcoded platform address | Same triggers — always |

---

## Channel 2 — MassageMap (system) → Therapist

Automated account-status/lifecycle messages only — welcome, payment confirmation, vetting outcome, renewal reminders, expiry, win-back. Never customer-initiated.

| Field | Condition | Service | Fires on |
|---|---|---|---|
| `cellNumber` | Always | BulkSMS | T1, T3b, T3c, T4, T7, T8, T9 |
| `email` | Only if on file | Resend | T1, T3a, T3b, T3c, T4, T7, T8, T9, T10, T11, T12 |
| `whatsappNumber` | **Not used at launch** | — | Phase 2 (Master Context #189) — parked despite being therapists' actual preferred channel |

`contactPreferences` (`[sms, email]` for therapist at launch) exists on the schema but **has no effect on this channel's actual send logic** — every trigger hardcodes unconditional SMS + conditional email regardless of this field's contents. Confirmed dead-for-therapist, 18 July. Reserved and will become functional for **spa**, which has a genuine routing need this field can serve — choosing between owner/manager/main-office numbers.

---

## Channel 3 — Therapist ↔ Customer

Public-facing contact only. No account/lifecycle messaging happens here — that's Channel 2.

| Field | Toggle | Mechanism | Notes |
|---|---|---|---|
| `cellNumber` | **No — always revealed** | Call mechanism | The primary token number. Reveal-via-call is mandatory functionality, not an option the therapist can disable |
| `cellNumberTwo` | **Y** — dedicated toggle, name TBD (proposed `showCellNumberTwo`) | Call mechanism | New field, 18 July. Secondary number. Never used for OTP/token (rare re-registration edge case, not policed or tested for) |
| `whatsappNumber` | **Y** — `showWhatsapp` | WhatsApp mechanism | Existing field/toggle |

**`email` is explicitly excluded from this channel.** A customer can never contact a therapist by email through the platform — phone (via the call mechanism) or WhatsApp only.

**Every phone number rendered on the public front end must go through the shared call mechanism** — no plain static-text rendering of any number, `cellNumber` or `cellNumberTwo`, anywhere on the site.

---

## Open items

1. `showCellNumberTwo` (or equivalent toggle field name) — proposed, not confirmed.
2. Full design of the click-to-reveal/call mechanism itself — parked, referenced in Master Context as "click-to-reveal or separate-tab interaction, mechanism not yet decided."
3. Spa's version of this document — not built. Do not assume therapist's channel rules (e.g. email exclusion from Channel 3) apply identically to spa without a dedicated review, since spa has a mandatory public address and a different contact structure (owner/manager/office).

---
*MassageMap Communication Channels Reference v1 | 2026-07-18 | Confidential*
