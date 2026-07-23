# AUTHENTICATION & SESSION

Status: locked

19. 30-day session token in localStorage, key: `mm_session_<phone>`. Contains: displayName, supplierType, expiry.
20. OTP required: first login, new device, or every 30 days — skipped same device within 30 days
21. Sign out ONLY clears Firebase Auth — does NOT delete session token from localStorage
22. New device always requires OTP regardless of 30-day window
23. OTP skip logic: `handleNext` checks `suppliers` first, then `pending_registrations` (silently, auth not required). If found in either with valid session token, skip OTP.
    - **ADDED 11 Jul 2026:** a valid session token alone is no longer sufficient. The skip must also confirm a **live Firebase Auth session** via `authReadyPromise` before it is trusted. Trusting the token on its own was the root cause of the `uid: null` lockout bug — the token survived in localStorage while the Auth session had expired, so downstream uid-dependent operations (Storage paths, callables) failed.
24. Return redirect: if `registrationComplete = false` → redirect to register.html/register-spa.html. If `true` → dashboard.html.
