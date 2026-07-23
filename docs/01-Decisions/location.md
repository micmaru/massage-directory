# LOCATION

Status: locked — item 43 superseded and corrected 23 Jul 2026 (see note on item 43 below). Items 37-42, 44-46 remain current.

37. Three-level hierarchy: Province → Town → Suburb
38. Areas = optional admin-created clusters within a town — max 5 per town
39. A suburb can only belong to ONE area. Deleting an area returns all suburbs to pool.
40. Area vs suburb rule: if areas exist for town, show area dropdown with "My suburb is not in these areas" escape. If no areas, suburb required directly.
41. Location data: IEC Electoral Commission 2024 — 9 provinces, 189 towns, 8,626 suburbs, zero duplicates confirmed
42. Location Firestore collections: `locations_provinces`, `locations_towns`, `locations_suburbs`, `locations_areas`
43. ~~Firestore field names CRITICAL: `provinceName` (not `province`), `townName` (not `town`), `areaName` (not `name`) in locations_areas~~ **SUPERSEDED — corrected 23 Jul 2026.** The old wording conflated two different things. Verified live 11 Jun 2026:
    - **Own display name** — `locations_provinces`, `locations_towns` and `locations_suburbs` each use **`name`**. `locations_areas` is the exception and uses **`areaName`**, never `name`.
    - **Denormalised parent name** — `provinceName` sits on `locations_towns`; `townName` sits on `locations_suburbs` and `locations_areas`. These are parent references, not the document's own name.
    - **On the supplier document** — display names `provinceName` / `townName` / `locationArea` are saved alongside the ID fields `province` / `townId` / `suburb`. See location-cascade.md item 3.
    - Confirmed by the composite indexes in MM-Field-Register-v3.md: `locations_towns` = provinceName + name; `locations_suburbs` = townName + name; `locations_areas` = townName + areaName.
    - See location-cascade.md item 9.
44. `locationArea` field name: LOCKED as of S3. Previously `massageArea` — renamed platform-wide across all files.
45. `locations.json`: retired. **register-spa.html still reads it — update in Phase D spa rebuild ONLY. Do not patch.**
46. Location data = MassageMap core competency — no public write access, admin-only management.
