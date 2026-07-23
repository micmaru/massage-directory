# PAYMENT ENTRY POINTS

Status: locked

Source: Session Log — 13 June 2026 decisions 5, 9, 11; 14 June 2026 decisions 18-20; 8 July 2026 (payment flow restructured off M1 and M3b)

1. M9 is the payment flow. Both PayFast and Manual EFT are part of M9.
2. Payment lives ONLY on the Main Menu (M0), gated on `status = 'active'` AND `subscriptionStatus` not already active within the 30-day window.
3. **SUPERSEDED — 13 June 2026 decision "Post-payment flow: Registration → Payment → M-0 (not dashboard)"**: superseded by payment-entry-points.md — payment is now M0-only. The "Pay now?" diamond and Payment branch were REMOVED from directly after Submit on M1, and the "Make Payment" box was removed from the M3b dashboard (8 July).
4. M1 now shows a 3-way admin vetting outcome after Submit (Approve / Investigate / Reject-equivalent). The Approve outcome fires the T3-equivalent "pay now" SMS, which is what unlocks the Payment option on the Main Menu.
5. Two M9 entry points on the diagram: "Entry from M0" (teal) and "Entry from M1/M2" (purple).
6. The hamburger "Make Payment" path always requires OTP regardless of a valid session token — it deliberately bypasses the session-skip logic.
7. KNOWN DEPENDENCY: this design cannot go live until Cluster H (`subscriptionStatus` never transitions to `active`) is fixed. The design is correct; the underlying payfastNotify mechanism is not.
