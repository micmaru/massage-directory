# SUPPLIERS vs pending_registrations — CONFLICT RESOLVED

Status: locked

Source: Session Log — 8 July 2026 (M1-Firebase); 16 July 2026 (architecture question surfaced)

**The conflict**: the 9 June compiled decisions say sections 2-8 save to `pending_registrations`, with the full suppliers doc written only at Submit. The 8 July M1-Firebase diagram says sections 2-8 are direct merge writes to `suppliers/{phone}`, with `pending_registrations` left permanently inert after Section 1. Live code follows the 9 June pattern (confirmed by grep, 16 July). The 8 July version was either never implemented or implemented and reverted — not established which.

**Origin**: `pending_registrations` is a leftover from a post-25-May-crash workaround (there was an issue creating suppliers docs directly at the time), kept afterward because reworking it was judged not worth the effort. Not a current structural requirement.

**Locked resolution (16 July)**:
1. Do NOT touch or remove `pending_registrations` from the therapist flow — too risky this close to launch, registration is otherwise complete and working.
2. For SPA registration (built from scratch, separate session): write only to `suppliers`, no `pending_registrations` collection at all.
3. ONE gap must be deliberately designed before spa build starts: OTP verified + consent given but Section 1 not yet saved means no suppliers doc exists to hold `dataConsentGiven` / `dataConsentTimestamp`. Where consent lands in that window must be decided on purpose — not left to default into recreating a parallel pending collection unintentionally.

`pending_registrations` is otherwise kept as a dev-phase debug trail; whether to add a cleanup routine is a pre-launch question.
