# Future: Home Feeds & CMS (provisions plan)

Status: **Agreed direction** (2026-11-26). The feeds and CMS themselves are built in the **last phase** (schemas, management UI, frontend).
This document lists what **earlier phases must store now** so that the last phase needs no data migration.

## Target features (last phase)
- **Algorithmic home feeds**: ongoing, upcoming and recently completed tournaments, both **near the user** and **global**. The same idea applies to players (players near you, top performers).
- **CMS for the home page**: posters and banners, announcements, and external app advertisements. Each item can link to a tournament (or team, player, match) or to an external URL, and can be **targeted by location**, with start/end dates and ordering.

## Provisions built into earlier phases
| # | Provision | Why | Phase |
|---|---|---|---|
| 1 | **`places` table from Google Places**: every location (tournament venue, team home, player city, CMS target) references a row in `places` instead of free text | One consistent location source for "near me", feeds and CMS targeting | 2 |
| 2 | Structured location columns on `places`: `google_place_id`, name, formatted address, area/sublocality, city, district, state, pincode, `latitude`, `longitude`, and a `POINT SRID 4326` column with a **spatial index** | Distance queries (`ST_Distance_Sphere`) and grouping by city/district/state | 2 |
| 3 | `users.city` (free text from Phase 1) becomes **`city_place_id`** linking to `places` (Places autocomplete limited to cities) | Player discovery by location | 2 (no real data yet, so the migration is free) |
| 4 | Tournaments get `status`, `start_date`, `end_date`, `visibility` (DRAFT / PUBLIC / UNLISTED), `published_at`, and a readable unique **`slug`** | Feed buckets (ongoing / upcoming / completed) are computed from these. Only public tournaments ever appear in feeds | 2 |
| 5 | Feed indexes: e.g. `tournaments (visibility, status, start_date)` and location lookups through `places (city)`, `(district)` and the spatial index | Fast home queries | 2 |
| 6 | One shared **`ENTITY_TYPE`** constant (TOURNAMENT, TEAM, PLAYER, MATCH, …). Every public entity has a stable `uuid` | CMS items and notifications link with `target_type + target_uuid`. Deep links for the mobile app | Constant added in Phase 2 |
| 7 | Images stored as S3 keys (already the rule) | CMS posters reuse the upload module. A CDN can be added later as a config change | Done |
| 8 | **No popularity counters** on core tables now | Counters slow down writes. Ranking signals (views, follows) get their own daily stats tables in the last phase | Last phase |

## Google Places: how it is used
- **Frontend**: Places Autocomplete (Maps JavaScript API) with a **browser key restricted by HTTP referrer**, using session tokens to reduce cost. The user picks a suggestion and the frontend sends only the **`place_id`** to our API.
- **Backend**: calls **Place Details** with a **server key** (restricted by server IP), never trusting coordinates sent by the browser. It upserts the `places` row by `google_place_id` and stores `details_fetched_at`.
- **Storage now**: the required place details (place ID, name, address parts, city, district, state, pincode, lat/lng) are stored in `places` with **`details_fetched_at`**. **No refresh job is built now.**
- **Later (with schedulers/cron)**: Google's terms (verify the current version before launch) allow storing place IDs indefinitely but limit caching other Places content to about 30 days. When schedulers are added, a job will re-fetch stale details using `details_fetched_at`. Nothing else needs to change.
- **Owner setup**: a Google Cloud project with billing, the **Maps JavaScript API**, **Places API** and **Geocoding API** enabled, plus the two restricted keys above.

## CMS sketch (last phase, for reference only)
`cms_items` (type: POSTER / ANNOUNCEMENT / AD, title, body, image_key, `target_type` + `target_uuid` **or** `external_url`, `starts_at`, `ends_at`, `sort_order`, `is_active`) and `cms_item_locations` (item → place / city / district / state, or global).
