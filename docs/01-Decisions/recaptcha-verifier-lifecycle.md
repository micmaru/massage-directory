# reCAPTCHA VERIFIER — CREATE ONCE, REUSE

Status: locked

Source: Session Log — 14 July 2026 (Brief 1/1b/1c); 15 July 2026 (parked note)

The clear-then-recreate pattern is fragile: Firebase's `clear()` does not reliably remove the rendered DOM node across SDK versions, so a second attempt in the same page load throws "reCAPTCHA has already been rendered."

Locked pattern: **create once and reuse** (`ensureRecaptchaVerifier()`) — the verifier is created on first send and reused for every retry, never cleared or recreated. The SDK resets the widget itself after each attempt, success or failure, which is what makes reuse safe. `clear()` is the destroy operation and is called nowhere in gallery.html.

OUTSTANDING: register.html likely carries the same latent bug, unfixed. M1's locked design probably sidesteps the trigger condition — attempts 1-2 never resend, and the only resend path (post-cooldown) requires a full page reload via Main Menu, giving a fresh JS context. Verified clean under App Check on 17 July (wrong-wrong-right retry, no re-render errors), but the underlying pattern in register.html was not changed.
