# RESUME REDIRECT KEYS OFF suppliers.registrationComplete

Status: locked — code-only, not yet tested end-to-end

Source: Session Log — 22 July 2026, Finding 1 (commit b019cd8)

register.html's resume path (the `onAuthStateChanged` callback that fires only when the URL carries `?phone=`) decides "already registered → send to dashboard" by calling `resolveIdentity(verifiedPhone)` and redirecting **only** on `status === 'verified'`.

**What it replaced**: the redirect previously keyed off `pending_registrations/{phone}.status === 'completed'` — the SECOND of two non-atomic writes at Submit (`setDoc(supplierRef, …registrationComplete:true)` then `setDoc(pendRef, {status:'completed'})`). If the second write failed after the first succeeded, the account was genuinely complete but the pending mirror still read `incomplete`, dumping a fully-registered user back into the prefilled registration form. The two sides of the same redirect could disagree because one read the secondary mirror and the other the canonical signal.

**Principle**: completion is decided off the canonical signal `suppliers.registrationComplete`, never off the `pending_registrations` mirror.

Deliberately NOT a wholesale drop-in — only the `verified` branch is acted on; `not-found` / `incomplete` / `blocked` / `error` / `no-auth` all fall through to the pre-existing logic. This preserves the `not-found`-during-registration case, which is exactly why `resolveIdentity` cannot replace the whole callback. The `pending_registrations` read stays, but only for its real job: prefill (`dataConsentGiven` + `prefillSectionN`).

The `pending_registrations.status: 'completed'` write at Submit is now unused by this guard but was LEFT IN PLACE — admin or other reads may depend on it.

NOT tested end-to-end: needs a real register → submit → return-with-`?phone=` run before being called verified.
