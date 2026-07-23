# OTP FAILED-ATTEMPT LOCKOUT

Status: locked

Source: Session Log — 15 July 2026 decisions 1-2 (supersedes 7 July decisions 3-4); 16 July 2026 (build, Option A, recordOtpEvent, App Check)

**Current locked flow — single cooldown, no second tier.** Supersedes 7/8 July's two-tier escalation (15-min cooldown → 1-hour lockout). There is no 1-hour tier.

- Phone entered → check the record's `otpLockedUntil` BEFORE firing any OTP. If `now < otpLockedUntil`: flash message, NO SMS fires, back to Main Menu.
- Wrong pin, attempts 1-2: loop back to the same OTP screen, same code, no resend, counter increments.
- Wrong pin, attempt 3: `otpFailedAttempts` written as 0 (reset) + `otpLockedUntil = serverTimestamp() + 15 min` (a Firestore Timestamp, not a raw duration). "Too many incorrect attempts. Please contact admin or try again in 15 minutes." Routes back to the phone-entry screen.
- Re-entry after expiry (or with the field absent): fresh PIN fires, cycle restarts clean at 0.
- Correct pin at any point: existing flow unchanged.

**Fields**: `otpFailedAttempts`, `otpLockedUntil` — on suppliers / pending_registrations only. No `otp_attempts` collection.

**Which collection (the fix that made it work for real users)**: `handleNext()` checks `suppliers` FIRST, and a lightweight suppliers doc exists from Section 1 save onward — so for any therapist past Section 1, `pending_registrations` is never consulted. The counter routes to `suppliers` when the doc exists, `pending_registrations` only as the pre-Section-1 fallback.

**Brand-new number, zero history — Option A (accepted)**: the first-ever OTP cycle on a number with no record falls back to Firebase's own built-in rate limiting. The 3-strike/15-min lockout engages from the second cycle onward, once a doc exists. Option B (create a lightweight doc pre-consent just to hold the counter) was **rejected outright — unauthorized personal data capture pre-consent, a POPIA violation**. Verified against industry practice: 3-5 attempts and 15-minute cooldowns are standard, and all major providers assume a pre-existing user record; MassageMap's brand-new-registration case is a POPIA-specific gap, not an engineering oversight.

**Server-side only**: counters are written by the `recordOtpEvent` Cloud Function (us-central1, Admin SDK), signature `recordOtpEvent({ phone, collection, action })` with `action: 'check' | 'fail'`. A wrong OTP means Firebase Auth sign-in never succeeded, so the client has no live session and every client-side write hits permission-denied — the first client-side implementation could never have functioned for anyone. Loosening Firestore rules to allow unauthenticated writes was rejected: it would let anyone clear their own lockout via devtools.

**Concurrency**: the `fail` branch uses `admin.firestore().runTransaction()`, matching the existing `generateSupplierNumber` pattern. A plain read-then-write let concurrent attempts all read the same stale counter and never reach 3.

**App Check**: `recordOtpEvent` is guarded by Firebase App Check (reCAPTCHA v3), declared via `.runWith({ enforceAppCheck: true })`, closing auth-bypass lockout-DoS and information-disclosure. Scoped narrowly to this function — a broader App Check rollout was explicitly not evaluated.
