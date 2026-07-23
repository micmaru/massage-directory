# REGISTRATION FLOW — LOCKED ARCHITECTURE

Status: locked

25. Step 1 — OTP verified: Firebase Auth verifies phone. Session token written to localStorage. `pending_registrations` document created.
26. Step 2 — Consent given: `dataConsentGiven: true` and `dataConsentTimestamp` written to `pending_registrations`.
27. Step 3 — Personal/Business section saved: fields written to `pending_registrations`. `supplierNumber` generated via Firestore transaction. Lightweight `suppliers` document created with `registrationComplete: false`.
28. Step 4 — Remaining sections: each saves to `pending_registrations` via `setDoc merge:true`. Data accumulates progressively.
29. Step 5 — Submit: all fields read from `pending_registrations`. Full `suppliers` document written. `registrationComplete: true`. Cloud Function fires notifications.
30. OTP permissions fix: `pending_registrations` query in `handleNext` wrapped in try/catch to silently ignore permission errors before authentication. Applied to both register.html and register-spa.html.
