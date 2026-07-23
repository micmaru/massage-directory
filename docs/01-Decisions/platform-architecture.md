# PLATFORM & ARCHITECTURE

Status: locked

1. Three-sided platform: Public/Customer (no login) / Supplier / Admin (Johan only)
2. `supplierType` = `individual` (therapist) or `spa` — from URL parameter only, no toggle. **Never use `'therapist'` as a value anywhere in code.**
3. Single `suppliers` Firestore collection — do not split. `supplierType` is the differentiator.
4. ~~Single `dashboard.html` — detects supplierType on load, renders correct sections (therapist: 8 sections, spa: 9 sections)~~ **SUPERSEDED 18 July 2026:** dashboard split into separate `dashboard.html` (therapist) and `dashboard-spa.html` (spa) — same convention as register.html/register-spa.html. See 18 July session log for reasoning.
5. Supplier document ID: phone number (e.g. `+27842500422`) — LOCKED as of S2.
6. `uid` field: stored as a field on supplier document but NOT used as document ID
7. Supplier number format: `T-YY-COUNTER` (therapist) / `S-YY-COUNTER` (spa), counter starts at 1001. Two counters in `settings/config`: `counterIndividual` and `counterSpa`.
8. Supplier number generated after Personal section saved — not at OTP
9. `supplierNumber` is permanent — survives deregistration
10. Post-launch expansion to neighbouring African countries — Phase 2
11. Supplier UX principle: 50%+ of suppliers are non-highly-educated smartphone users — simple screens, big buttons, one action per screen
12. Hosting: massagemap.co.za — cPanel on domains.co.za
13. Admin email: admin@massagemap.co.za — replaces Johan's personal email everywhere
