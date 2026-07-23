# 3-IDENTIFIER ARCHITECTURE RE-CONFIRMED / PHONE-LOSS RECOVERY

Status: locked

Source: Session Log — 7 July 2026 (continued after 6 July crash), locked decision 1

Re-confirmed, NOT reversed: phone number = Firestore document ID (suppliers / pending_registrations), Auth UID = a field on the suppliers doc, `supplierNumber` = the stable phone-independent anchor.

Reversing to supplierNumber-as-document-ID would require reworking OTP, PayFast, Resend, BulkSMS, Telegram and the admin routines platform-wide — a month-plus setback.

Phone-loss recovery is therefore a **manual admin operation** (copy-doc in the Firebase console) until a dedicated Cloud Function is built.
