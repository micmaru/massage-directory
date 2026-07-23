# CLOUD FUNCTIONS — DEPLOYED

Status: locked

114. `onSupplierRegistered`: onUpdate — fires when `registrationComplete` transitions false→true
115. `createPayfastPayment`: HTTPS callable — builds signed PayFast payment form
116. `payfastNotify`: HTTPS endpoint — receives PayFast ITN, updates subscription
117. `checkIncompleteRegistrations`: Scheduled every 24h — sends reminder SMS to incomplete registrations
118. `dailyNotificationCheck`: Scheduled 08:00 SAST — checks expiry dates (Phase 2)
119. `onAuditLogWrite`: onWrite — fires Telegram/SMS/email based on action and severity
120. `helloMassageMap`: HTTPS health check
121. All functions region: us-central1 — CRITICAL, never change

**ADDED 23 Jul 2026** — deployed functions missing from the original 114-121 list:

121a. `generateSupplierNumber`: HTTPS callable — allocates the next `supplierNumber` (T-YY-COUNTER / S-YY-COUNTER) from the settings/config counter. Deployed 9 Jul 2026.
121b. `recordOtpEvent`: HTTPS callable — records OTP attempts server-side for the lockout mechanism. Deployed 16 Jul 2026.
121c. `geocodeAddress`: HTTPS callable — server-side geocoding, applies jitter before returning coordinates. Deployed 21 Jul 2026. See map-pin-jitter.md and addressline1-and-geocoding.md.
