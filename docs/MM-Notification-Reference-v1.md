# MassageMap — Notification Trigger Reference — T1 to T12
**Version 1.0 | May 2026 | Confidential**

This document defines every notification trigger on the MassageMap platform. Each trigger specifies the screen or system that fires it, the step-by-step flow, the channels used, and notes for implementation. Use this as the master reference for building and testing all notification logic.

**See also:** `MM-Communication-Channels-Reference-v1.md` — the three-channel model (Admin↔MassageMap, MassageMap↔Therapist, Therapist↔Customer) that sits above this document. This file is the full detail for Channel 1 and Channel 2 triggers only; Channel 3 (Therapist↔Customer) is not a system-triggered notification and lives entirely in the Communication Channels reference instead.

---

## Summary — All Triggers

| Trigger | Title | Channels | Services |
|---|---|---|---|
| T1 | Therapist Registration Submitted | Therapist SMS, Therapist Email, Admin Telegram, Admin Email | BulkSMS, Resend, Telegram Bot API |
| T2 | Spa Registration Submitted | Spa Email, Admin Telegram, Admin Email | Resend, Telegram Bot API |
| T3a | Therapist Adds Email for First Time | Therapist Email | Resend |
| T3b | First Payment Received (New Registration) | Supplier Email, Supplier SMS (therapist only) | Resend, BulkSMS |
| T3c | Vetting Approved — Listing Goes Live | Therapist SMS, Therapist Email, Spa Email | BulkSMS, Resend |
| T4 | Renewal Payment Received | Therapist SMS, Therapist Email, Spa Email | BulkSMS, Resend |
| T5 | Vetting Rejected — Internal Log Only | Audit Log | Firestore auditLog collection |
| T6 | Admin Alert — Any New Registration | Admin Telegram, Admin Email | Telegram Bot API, Resend |
| T7 | Manual Payment — Proof of Payment Submitted and Approved | Admin Telegram, Therapist SMS, Therapist Email, Spa Email | Telegram Bot API, BulkSMS, Resend |
| T8 | Subscription Expiry Reminder — 7 Days Before | Therapist SMS, Therapist Email, Spa Email | BulkSMS, Resend |
| T9 | Subscription Expired | Therapist SMS, Therapist Email, Spa Email | BulkSMS, Resend |
| T10 | Win-Back Reminder — 7 Days After Expiry | Therapist Email, Spa Email | Resend |
| T11 | Win-Back Reminder — 14 Days After Expiry | Therapist Email, Spa Email | Resend |
| T12 | Exit Survey — 14 Days After Expiry | Therapist Email, Spa Email | Resend |

---

## Detailed Trigger Flows

### T1 — Therapist Registration Submitted
**Screen / Origin:** register.html

Fires when a therapist completes and submits the registration form.

**Steps:**
- Therapist completes registration form and submits.
- Firebase writes supplier record to Firestore (status: pending).
- IF email provided at registration: BulkSMS fires to therapist → "Welcome to MassageMap. Your registration is received. We will contact you shortly." AND Resend email fires same message.
- IF no email at registration: BulkSMS fires only → "Welcome to MassageMap. Your registration is received. Please add your email address to your profile to activate your listing." (Email deferred to T3a.)
- Cloud Function fires Telegram notification to admin → "New therapist registration: [Name] — [Suburb] — [Phone]"
- Resend email fires to admin with same registration details.

**Notification Channels:**

| Channel | Condition | Service |
|---|---|---|
| Therapist SMS | Always | BulkSMS |
| Therapist Email | Only if email provided at registration | Resend |
| Admin Telegram | Always | Telegram Bot API |
| Admin Email | Always | Resend |

*Note: If no email is given at registration, the welcome email is deferred to T3a (first email added to profile).*

### T2 — Spa Registration Submitted
**Screen / Origin:** register-spa.html

Fires when a spa completes and submits the registration form. Email is mandatory for spas — no SMS.

**Steps:**
- Spa completes registration form and submits.
- Firebase writes supplier record to Firestore (status: pending).
- Resend welcome email fires to spa → "Welcome to MassageMap. Your registration is received. We will contact you shortly."
- Cloud Function fires Telegram notification to admin → "New spa registration: [Name] — [Area] — [Email]"
- Resend email fires to admin with same registration details.

**Notification Channels:**

| Channel | Condition | Service |
|---|---|---|
| Spa Email | Always (email mandatory for spas) | Resend |
| Admin Telegram | Always | Telegram Bot API |
| Admin Email | Always | Resend |

*Note: No SMS for spas. Email is a required field at spa registration.*

### T3a — Therapist Adds Email for First Time
**Screen / Origin:** dashboard.html

Fires when a therapist who registered without an email address adds one to their profile for the first time. Keeps T1 and T2 in sync — both supplier types receive a welcome email, just at different times.

**Steps:**
- Therapist opens dashboard and adds email address to profile, then saves.
- Firestore updates supplier record with email field.
- Cloud Function detects email field was previously empty and is now populated.
- Resend welcome email fires → "Welcome to MassageMap. Your listing is now being processed."

**Notification Channels:**

| Channel | Condition | Service |
|---|---|---|
| Therapist Email | Only fires once — first time email is added | Resend |

*Note: This trigger only fires once per supplier. If email was already present at T1, this trigger does not fire. Vetting and payment status do not affect this trigger — it fires purely on email being added.*

### T3b — First Payment Received (New Registration)
**Screen / Origin:** subscribe.html

Fires when a newly registered supplier completes their first payment, whether via PayFast or manual EFT/cash deposit.

**Steps:**
- Supplier completes first payment (PayFast or manual EFT/cash).
- Payment record written to Firestore (status: pending_manual for EFT, or confirmed via PayFast ITN).
- Resend email fires to supplier → "Thank you for your payment. Your MassageMap listing is being reviewed and will go live shortly."

**Notification Channels:**

| Channel | Condition | Service |
|---|---|---|
| Supplier Email | Always | Resend |
| Supplier SMS (therapist only) | Always | BulkSMS |

*Note: This is specifically for first-time registrations. Renewal payments use T4. Vetting may still be outstanding at this point.*

### T3c — Vetting Approved — Listing Goes Live
**Screen / Origin:** admin.html

Fires when admin approves a supplier after vetting. Supplier listing becomes visible on the public browse front end.

**Steps:**
- Admin reviews supplier in vetting screen on admin.html.
- Admin clicks Approve.
- Firestore updates supplier status: pending → active.
- Therapist: BulkSMS fires → "Your MassageMap listing has been approved. Your profile is now live." AND Resend email fires if email on file.
- Spa: Resend email fires → "Your MassageMap listing has been approved. Your profile is now live."
- Listing surfaces on public browse (status filter: active only).
- Audit log entry written: supplier ID, action: approved, actor: admin, timestamp.

**Notification Channels:**

| Channel | Condition | Service |
|---|---|---|
| Therapist SMS | Always | BulkSMS |
| Therapist Email | Only if email on file | Resend |
| Spa Email | Always | Resend |

*Note: 8-hour hold timer consideration: if a hold period before going live is implemented, the notification fires at approval but listing surfaces after the hold. Confirm with Johan.*

### T4 — Renewal Payment Received
**Screen / Origin:** subscribe.html / dashboard.html

Fires when an existing active or expired supplier makes a renewal subscription payment.

**Steps:**
- Supplier makes renewal payment (PayFast or manual EFT/cash).
- PayFast: ITN fires to payfastNotify Cloud Function, validates COMPLETE status, updates Firestore subscription record.
- Manual EFT: admin approves proof of payment in admin.html, Firestore subscription record updated.
- Therapist: BulkSMS fires → "Your MassageMap subscription has been renewed. Your listing remains active." AND Resend email if on file.
- Spa: Resend email → same message.
- Audit log entry written: supplier ID, action: subscription_renewed, payment method, amount, timestamp.

**Notification Channels:**

| Channel | Condition | Service |
|---|---|---|
| Therapist SMS | Always | BulkSMS |
| Therapist Email | Only if email on file | Resend |
| Spa Email | Always | Resend |

*Note: PayFast renewals are fully automatic — no admin action required. Manual EFT renewals require admin approval (see T7).*

### T5 — Vetting Rejected — Internal Log Only
**Screen / Origin:** admin.html

Fires when admin rejects a supplier application. No communication is sent to the supplier. Rejection reason is logged internally for legal and operational record-keeping.

**Steps:**
- Admin reviews supplier in vetting screen on admin.html.
- Admin selects Reject and enters rejection reason.
- Firestore updates supplier status: pending → rejected.
- Audit log entry written: supplier ID, action: rejected, actor: admin, reason (mandatory), timestamp.
- No SMS, no email, no Telegram — supplier receives no notification of any kind.

**Notification Channels:**

| Channel | Condition | Service |
|---|---|---|
| Audit Log only | Always | Firestore auditLog collection |

*Note: Rejection is silent by design — no supplier-facing communication. Record kept forever for legal purposes.*

### T6 — Admin Alert — Any New Registration
Covered under T1 and T2 above (Admin Telegram + Admin Email always fire on any new registration, therapist or spa).

### T7 — Manual Payment — Proof of Payment Submitted and Approved
**Screen / Origin:** subscribe.html (submission) / admin.html (approval)

Fires when a supplier submits proof of manual EFT/cash payment and admin approves it.

**Steps:**
- Supplier uploads proof of payment via subscribe.html.
- Admin Telegram alert fires notifying admin a manual payment needs review.
- Admin reviews and approves in admin.html.
- Therapist: BulkSMS fires + Resend email if on file.
- Spa: Resend email fires.

**Notification Channels:**

| Channel | Condition | Service |
|---|---|---|
| Admin Telegram | On submission | Telegram Bot API |
| Therapist SMS | On admin approval | BulkSMS |
| Therapist Email | On admin approval, if email on file | Resend |
| Spa Email | On admin approval | Resend |

*Note: Proof of payment upload is the critical step. Without it, admin cannot efficiently match payments to suppliers. Banking details placeholder to be replaced with live FNB account details pre-launch (Phase E).*

### T8 — Subscription Expiry Reminder — 7 Days Before
**Screen / Origin:** Scheduled Cloud Function (no screen)

Automated reminder sent 7 days before a supplier's subscription expires.

**Steps:**
- Scheduled Cloud Function runs daily.
- Function queries Firestore for all active suppliers with subscription expiry date = today + 7 days.
- Therapist: BulkSMS fires → "Your MassageMap subscription expires in 7 days. Renew now to keep your listing active: [renewal link]" AND Resend email if on file.
- Spa: Resend email → same message.

**Notification Channels:**

| Channel | Condition | Service |
|---|---|---|
| Therapist SMS | 7 days before expiry | BulkSMS |
| Therapist Email | 7 days before expiry, if email on file | Resend |
| Spa Email | 7 days before expiry | Resend |

*Note: Renewal link to be confirmed — likely subscribe.html with supplier ID pre-populated.*

### T9 — Subscription Expired
**Screen / Origin:** Scheduled Cloud Function (no screen)

Fires on the day a subscription expires with no renewal. Listing goes dark on public browse.

**Steps:**
- Scheduled Cloud Function runs daily.
- Function detects suppliers where subscription expiry date = today and status = active.
- Firestore updates supplier status: active → expired.
- Listing no longer surfaces on public browse (front end filters status = active only).
- Therapist: BulkSMS fires → "Your MassageMap listing has expired. Renew your subscription to go live again: [renewal link]" AND Resend email if on file.
- Spa: Resend email → same message.
- Audit log entry written: supplier ID, action: subscription_expired, timestamp.
- Supplier data retained in Firestore — nothing deleted.

**Notification Channels:**

| Channel | Condition | Service |
|---|---|---|
| Therapist SMS | On expiry day | BulkSMS |
| Therapist Email | On expiry day, if email on file | Resend |
| Spa Email | On expiry day | Resend |

*Note: Data is never deleted on expiry. Supplier can renew and go live again via T4.*

### T10 — Win-Back Reminder — 7 Days After Expiry
**Screen / Origin:** Scheduled Cloud Function (no screen)

First win-back email sent 7 days after subscription expired with no renewal.

**Steps:**
- Scheduled Cloud Function runs daily.
- Function queries Firestore for suppliers with status = expired and expiry date = today minus 7 days.
- Resend email fires to supplier → "Your MassageMap listing expired 7 days ago. Renew now to get back in front of clients: [renewal link]"

**Notification Channels:**

| Channel | Condition | Service |
|---|---|---|
| Therapist Email | 7 days after expiry, if email on file | Resend |
| Spa Email | 7 days after expiry | Resend |

*Note: SMS not used for win-back — email only to avoid being perceived as spam. BulkSMS costs apply per message.*

### T11 — Win-Back Reminder — 14 Days After Expiry
**Screen / Origin:** Scheduled Cloud Function (no screen)

Second and final win-back email sent 14 days after subscription expired with no renewal.

**Steps:**
- Scheduled Cloud Function runs daily.
- Function queries Firestore for suppliers with status = expired and expiry date = today minus 14 days.
- Resend email fires → "Your MassageMap listing has been inactive for 14 days. It's not too late to renew and get back in front of clients: [renewal link]"

**Notification Channels:**

| Channel | Condition | Service |
|---|---|---|
| Therapist Email | 14 days after expiry, if email on file | Resend |
| Spa Email | 14 days after expiry | Resend |

*Note: After T11, no further automated contact is made unless the supplier renews.*

### T12 — Exit Survey — 14 Days After Expiry
**Screen / Origin:** Scheduled Cloud Function (no screen)

Short exit survey email sent at the same time as T11 (14 days post-expiry) to understand why the supplier did not renew.

**Steps:**
- Fires simultaneously with T11 (same scheduled function run, separate email).
- Resend email fires → Short email asking supplier to share their reason for not renewing.
- Survey includes 3-4 selectable reasons:
  1. The subscription price was too high.
  2. I did not receive enough client enquiries.
  3. I have moved to another platform.
  4. I am no longer practicing.
- Responses logged to Firestore collection 'exitSurveys' with supplier ID and timestamp.
- No further automated follow-up after this trigger.

**Notification Channels:**

| Channel | Condition | Service |
|---|---|---|
| Therapist Email | 14 days after expiry, if email on file | Resend |
| Spa Email | 14 days after expiry | Resend |

*Note: Exit survey is separate from T11 but fires on the same day. Responses feed into product improvement and pricing decisions. Survey mechanism to be confirmed — options include a simple link to a lightweight response page or a Firebase-linked form.*

---

## Audit Log

Every status change, rejection, payment event, and admin action must be written to the Firestore collection auditLog. This is a legal and operational requirement. Fields to be finalised in a dedicated session.

**Triggers that write to auditLog:**
- T3c — Vetting approved
- T4 — Renewal payment confirmed
- T5 — Vetting rejected (with reason)
- T7 — Manual payment approved
- T9 — Subscription expired

**Minimum fields per auditLog entry:**
- supplierID
- timestamp
- action (e.g. approved, rejected, payment_confirmed, expired)
- actor (admin / system)
- reason (for rejections — admin-entered text)
- amount (for payment events)

---

## Pre-Launch Actions Required

The following must be completed before notification flows go live:
- BulkSMS — Create account, obtain API credentials, add to Firebase environment config.
- Telegram — Fix broken bot token, confirm Chat ID: 917892632.
- Resend — Verify massagemap.co.za sender domain (currently using onboarding@resend.dev for testing).
- PayFast — Switch to live credentials (Phase E).
- FNB Business Account — Open account, add banking details to manual payment flow placeholder.
- massagemap.co.za domain — Register and configure DNS.

---

## Appendix A — OTP Authentication (Outside Notification Scope)

OTP (One-Time Password) SMS messages are not part of the T1–T12 notification framework. They are handled entirely by Firebase Phone Auth and operate on a separate channel.

OTP fires on three screens:
- register.html — therapist enters phone number to verify identity during registration
- register-spa.html — spa enters phone number to verify identity during registration
- login.html — any supplier enters phone number to authenticate on login

Firebase Phone Auth manages OTP delivery, expiry, retry logic, and quota directly. No Cloud Function, no BulkSMS, no admin alert, and no audit log entry is involved. Firebase Auth maintains its own internal logs for authentication events.

The Firebase test credential for development is +27 80 000 0001 / OTP 123456 — this preserves real SMS quota during testing.

---
*MassageMap — Notification Reference v1.0 | Converted to .md 18 July 2026, content unchanged from original v1.0 (May 2026) .docx | Confidential*
