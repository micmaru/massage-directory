# IDENTITY SERVICE — resolveIdentity / getValidSession

Status: locked

Source: Session Log — 2026-07-03 decisions 2-6; 9 July 2026 item 2; 18 July 2026 (M3 identity/session flow); 22 July 2026 (Finding 2 + Clarification)

**The wrapper (M10/M10b)** — `identity-service.js` is the single module every part of the platform calls through to resolve identity. It exports `resolveIdentity()`, `storeSession()`, `getValidSession()`, `clearSession()`. Phone is read from the URL param, with a live UID cross-check, and single-session enforcement. Local session-scanning copies in dashboard.html, register.html and register-spa.html were replaced by it.

**`resolveIdentity()` status table**: `no-auth` / `not-found` / `verified` / `incomplete` / `blocked` / `error`. `incomplete` (added 9 July) distinguishes "registered but not finished" (supplier doc exists, uid matches, `registrationComplete` false) from "fully registered".

**It is a security gate, not audit logging.** It is a UID-ownership + `registrationComplete` check; the audit write fires only on the `blocked` branch. Adding it to a code path therefore changes behaviour — it is never an invisible drop-in.

**Order of checks (locked 18 July, confirmed against index.html's `routeToSupplierArea()`/`getValidSessionPhone()`)**: cheap local token check FIRST, then `resolveIdentity()`'s live Firestore uid-match — conditionally, only if a token was found. Not the reverse.

**register.html usage (clarified 22 July, so it is never re-litigated)**:
- `handleNext()` — the manual phone-entry screen — calls `getValidSession(phone)`. It does NOT call `resolveIdentity()`.
- `resolveIdentity()` is called in exactly ONE place in register.html: inside the `onAuthStateChanged` callback that fires only when the URL carries `?phone=` (the dashboard→register resume path).
- The M1 diagram was corrected to match: the box after "Phone number (token) input screen" reads "getValidSession(phone) check", not "resolveIdentity() Wrapper".

**CLOSED-BY-DECISION (22 July)**: the parked "add `resolveIdentity()` after fresh OTP verify in M1, mirroring M3" item is closed, not open. dashboard.html's own OTP-verify path (`verifyLoginOtp`) does not call it either — it does `confirm()` → `getDoc(suppliers/{phone})` → check `registrationComplete`, structurally identical to register.html's `verifyOtp()`. There is no gap to mirror, and adding it would change behaviour.
