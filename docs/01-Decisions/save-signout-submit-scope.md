# SAVE / SUBMIT / SIGN OUT / BACK — FOUR DISTINCT ACTIONS

Status: locked

Source: Session Log — 7 July 2026 locked decision 6; 18 July 2026 (three dashboard exit routes)

- **Save (per section)** — on both register.html and dashboard.html. No completion signal.
- **Submit Registration** — register.html only. Gated on required sections complete. Flips `registrationComplete: true` and fires the vetting notification.
- **Sign Out** — dashboard.html only. Clears the device session token (`mm_session_<phone>`) via `clearSession()`. Zero Firestore effect. For shared-device use. Full OTP required on next entry.
- **Back to Main Menu / < Back** — same on both screens. Leave, no signal, saved data stays saved, token persists.

Three dashboard exit routes confirmed 18 July: (1) view-only → Back to Main Menu, token persists; (2) edits made → Back to Main Menu (not Sign Out), token persists; (3) explicit Sign Out → token wiped. Routes (1) and (2) only trigger OTP on return if the existing 30-day expiry has actually elapsed.

Button label is **"Back to Main Menu"** — never "Sign Out" or "Log-out" for the primary exit.
