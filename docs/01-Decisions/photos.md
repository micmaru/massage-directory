# PHOTOS — LOCKED (updated 9 June 2026)

Status: superseded — items 79, 81, 82, 83, 84 superseded. Item 80 remains current. Item 78 stale on the field name only (see note).

Superseded by verification-photo.md — facePhotoUrl replaced by facePhotoPath, multi-photo array model dropped.

78. `facePhotoUrl` field: required close-up face photo. NOT an ID or passport copy. Replaces retired `idPhotoUrl`. *(Field renamed `facePhotoPath` 13 Jul — see verification-photo.md. The rest of this item stands.)*
79. ~~`showFacePhoto` Boolean: supplier-controlled. `true` = face photo shown publicly. `false` = face photo hidden.~~ **SUPERSEDED**
80. No face photo = no vetting = no live profile. Hard gate, no exceptions.
81. ~~If `showFacePhoto = false` + other photos exist → other photos display, face photo hidden~~ **SUPERSEDED**
82. ~~If `showFacePhoto = false` + no other photos → photo space empty on frontend~~ **SUPERSEDED**
83. ~~`photos[0]` = face photo slot. `photos[1]` = card photo (public). `photos[2]+` = additional profile photos.~~ **SUPERSEDED**
84. ~~facePhotoUrl and showFacePhoto fields — must be added to schema and all code in Phase D~~ **SUPERSEDED**
