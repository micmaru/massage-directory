# COMMUNICATION CHANNELS — THREE-CHANNEL MODEL

Status: locked

Source: Session Log — 12 July 2026 item 2 (WhatsApp); 18 July 2026 (three-channel model, cellNumberTwo, contactPreferences)

Three structurally independent channels (full detail: `docs/MM-Communication-Channels-Reference-v1.md`):

1. **Admin ↔ MassageMap** — Telegram + admin@massagemap.co.za. Not driven by any therapist field.
2. **MassageMap → Therapist** — `cellNumber` always, via BulkSMS. `email` conditionally, via Resend. WhatsApp not used until Phase 2.
3. **Therapist ↔ Customer** — `cellNumber` always revealed; `cellNumberTwo` and `whatsappNumber` toggle-gated. **`email` is excluded from this channel entirely** — customers reach a therapist by phone or WhatsApp, never email.

**WhatsApp** is therapist↔customer only: a public `wa.me/{number}` link on the listing, phone-to-phone, zero backend or API integration. It is not part of the therapist↔platform notification stack.

**`cellNumberTwo`** — secondary public phone number, toggle-gated by `showCellNumberTwo`, optional, never locked, never used for OTP or tokens. Every phone number shown on the public frontend (both `cellNumber` and `cellNumberTwo`) must route through the same shared call mechanism — no plain static-text rendering.

**`contactPreferences`** (`[sms, email, whatsapp]`) has NO actual effect in current T1-T12 trigger logic for therapists — every trigger hardcodes unconditional SMS + conditional email and never reads the array. Narrowed to `[sms, email]` for therapist at launch (`whatsapp` parked to Phase 2, despite being therapists' actual preferred channel). The field is NOT retired — it becomes functional for spa, which has a genuine routing need (owner / manager / main-office number) that therapist does not have.
