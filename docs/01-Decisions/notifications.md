# NOTIFICATIONS — LOCKED

Status: locked

85. Cloud Function is the SOLE sender of all notifications — no frontend notification calls ever
86. SMS only fires for `supplierType === 'individual'` — NOT `type === 'therapist'`
87. Notification names: always `firstName + lastName` — never `displayName` alone
88. Telegram fires on every completed registration (`registrationComplete: true`)
89. Double-fire fix confirmed working 13 May — removed duplicate blocks from register.html
90. Admin email recipient: must be `admin@massagemap.co.za`. **UPDATED 23 Jul 2026** — recipient fixed 24 Jun 2026. The residual delivery failure was not a recipient bug: the real cause was the Resend sandbox domain (found 13 Jul 2026). Domain verified 15 Jul 2026. Remaining action: switch the `from:` address off `onboarding@resend.dev` to `notifications@massagemap.co.za`. (Issue #6/#8)
