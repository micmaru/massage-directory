# TRAVEL DISTANCE — 5/10/15/20 km

Status: locked

Source: Session Log — 12 July 2026, item 4 (commit 432ad9e)

The travel-distance `<select>` (10/25/50/100 km) is replaced by four press/click buttons: **5 / 10 / 15 / 20 km**. LOCKED VALUES — 20 km deliberately chosen as the ceiling ("already quite far"). Supersedes 10/25/50/100 as the standard set.

The field only appears when the mobile-massage toggle is on.

No validation forces a distance choice — toggling mobile massage on with nothing selected is an intentionally allowed state, saving as `null`. It represents "prepared to travel, exact distance/fee negotiated directly with the customer" — out of platform scope by design.

OUTSTANDING: dashboard.html and register-spa.html both still use the old 10/25/50/100 values and need reconciling, or a therapist who picks 15 km at registration hits a mismatched dropdown later.
