# 30-DAY VERIFICATION WINDOW — WHAT IS ACTUALLY CHECKED

Status: locked

Source: Session Log — 7 July 2026, locked decision 5

The 30-day device-memory check is `DaysSinceLastVerification > 30`, checked ONCE at phone entry, before OTP starts.

It is not a check on the phone number itself, and it is not repeated later in the flow.

`getValidSession()` in identity-service.js already implements this expiry — no separate 30-day logic is needed anywhere else.
