# WORKING METHOD — THERAPIST SIDE FIRST, THEN SPA

Status: locked

Source: Session Log — 24 June 2026 decision 1; 25 June 2026 decisions 1-2

1. Finish all therapist-side issues fully before starting any spa-side testing or fixes. Issue by issue, no jumping back and forth.
2. Cluster bugs by likely shared root cause rather than treating every open issue as independent.
3. Fix order used for the 25 June cluster sweep: Cluster A (Storage rules / registrationComplete chain) → B (Section 1 identity) → C (session/OTP) → D (quick UI fixes) → E (missing fields) → F as final verification.
4. Test record 0800000004 (Jane Le Roux, T-26-1044) is the permanent known-good cascade reference — never delete without an explicit replacement plan.
