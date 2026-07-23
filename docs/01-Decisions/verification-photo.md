# VERIFICATION PHOTO (facePhotoPath)

Status: locked

Source: Session Log — 11 July 2026 decision 6; 12 July 2026 (Section 8 rebuild); 13 July 2026 (privacy fix); 17 July 2026 (save gate)

Supersedes the earlier `facePhotoUrl` / `showFacePhoto` / `photos[0..2+]` decisions.

1. **One required upload only.** Section 8 is a single verification photo. Slots 2-4 and "add another photo" were REMOVED entirely. Label: "Verification Photo — admin use only."
2. **`showFacePhoto` is DROPPED.** No visibility toggle exists — the photo is never shown publicly, so there is nothing to toggle.
3. **Field name `facePhotoPath`** (renamed from `facePhotoUrl`, 13 July). It stores a Storage PATH, never a URL.
4. **Private path**: `suppliers/{uid}/id/` (`allow read: if request.auth != null`), never the public `suppliers/{uid}/photos/` path. Storage paths use the Auth UID, not the phone number.
5. **Never persist a download URL.** `getDownloadURL()` URLs carry a permanent bypass token — anyone holding the URL can access the file indefinitely regardless of Storage rules, so moving folders alone would not have closed the gap. The thumbnail is fetched live, authenticated, at render time in `prefillSection8()` and nothing is persisted. Works from any device, since the UID is tied to the OTP-verified phone number, not the device.
6. **Freely editable pre-submit** (revises 11 July's "admin-only reset, no self-service change"): during active registration the therapist can delete and re-upload as often as she likes. `deletePhoto()` deletes the Storage object and clears the field from both collections via `deleteField()`, and reopens the Submit gate if the section had been marked complete.
7. **Locked at Submit, not at save.** No separate lock is needed in register.html — the completed-registration guard already makes register.html unreachable after Submit. See the unified Golden Rule.
8. **Save gate** (17 July): `saveAccSection(8)` blocks done-state if no photo is present. Previously ungated — a genuine test-coverage gap, not a regression: every earlier test uploaded a photo first, so the empty-Save path was never exercised.
9. Storage rules must split `allow write` (create/update, keeps size/contentType checks) from `allow delete` (auth + uid match only). `request.resource` is null on delete, so referencing `request.resource.size` errors out and Firebase treats a rule evaluation error as an automatic deny — this was the cause of the 403 on every delete.
