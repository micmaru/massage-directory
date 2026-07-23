# STATUS FIELDS — CRITICAL, NEVER MIX

Status: locked

14. Registration status field name: `status`. Values: `pending` / `active` / `suspended` / `review` / `rejected`
15. Subscription status field name: `subscriptionStatus`. Values: `active` / `expired` / `not_paid`
16. These are two completely separate Firestore fields — NEVER mix them
17. `registrationComplete` Boolean: `false` = lightweight record after Personal section saved. `true` = full registration submitted.
18. `onSupplierRegistered` trigger: `onUpdate` — fires only when `registrationComplete` transitions false → true
