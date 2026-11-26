# Phase 2: Tournaments (module plan)

Status: **Done** (2026-11-27). Part of `plans/implementation-plan.md`.
Goal: tournaments exist end to end. Admins create them under organizers, organizers complete and run them through their lifecycle, and the public can find them by name, place or near me and open a tournament page.
Teams, squads, staff, payments and matches come in later phases. This phase only stores the settings they will use.

## Scope
| # | Feature | Who |
|---|---|---|
| 1 | `places` from Google Places (autocomplete → place ID → server-side Place Details) | System |
| 2 | Player city moves to `users.city_place_id` (replaces free-text `city`) | Members |
| 3 | Create a tournament under an organizer with basic fields + live-streaming flag | Admin / Superadmin |
| 4 | Complete and edit tournament details (format, category, dates, fee, limits, points, grounds, logo/banner, description, contact) | Organizer (own) · Admin (any) |
| 5 | Status lifecycle with guarded transitions; publish/visibility | Organizer (own) · Admin (any) |
| 6 | Grounds per tournament (name + optional place). Used by fixtures in Phase 5 | Organizer · Admin |
| 7 | Rule book: master rules + tournament rules | Superadmin/Admin (master) · Organizer (tournament) |
| 8 | Dashboard: tournaments list (server-side table) for admin (all) and organizer (own), create/edit screens | Admin · Organizer |
| 9 | Public: tournaments list with search (name, place, area), filters (status, format, category) and **near me**; tournament page (overview, venue map link, rules) | Public |
| 10 | Uploads: `TOURNAMENT_LOGO`, `TOURNAMENT_BANNER` purposes (presigned POST, reuse Phase 1) | Organizer · Admin |

## Draft data model
| Table | Key columns | Notes |
|---|---|---|
| `places` | id, google_place_id (uq), name, formatted_address, area, city, district, state, pincode, latitude, longitude, location `POINT SRID 4326` (spatial index), types (JSON), details_fetched_at | Upserted by `google_place_id` |
| `tournaments` | id, uuid, slug (uq), organizer_id, name, description, logo_key, banner_key, status, visibility, published_at, game_format, age_category, gender_category, tournament_format, start_date, end_date, registration_deadline, entry_fee (DECIMAL 10,2), min_teams, max_teams, min_squad_size, max_squad_size, points_win, points_draw, points_loss, venue_place_id, venue_details, contact_phone, is_streaming_enabled, created_by, updated_by, timestamps, deleted_at | Indexes: (visibility, status, start_date), organizer_id, venue_place_id, FULLTEXT-free name search via prefix/LIKE |
| `tournament_grounds` | id, tournament_id, name, place_id (nullable), sort_order | uq (tournament_id, name) |
| `rules` | id, title, description, category, sort_order, is_active | Master rule book |
| `tournament_rules` | id, tournament_id, rule_id (nullable), title, description, sort_order | Selected master rules + custom ones (if confirmed) |

Constants (proposed): `TOURNAMENT_STATUS`, `TOURNAMENT_VISIBILITY`, `TOURNAMENT_FORMAT` (LEAGUE, KNOCKOUT, GROUP_KNOCKOUT), `GAME_FORMAT` (5/6/7/8/9/11-a-side), `AGE_CATEGORY`, `GENDER_CATEGORY`, `RULE_CATEGORY`, `ENTITY_TYPE`.

## API (draft, `/api/v1`)
| Method | Endpoint | Who |
|---|---|---|
| POST | `/places` (body: `placeId`, session token) → resolve and store the place | Logged-in |
| GET | `/tournaments` (public list: search, status, format, category, `lat`/`lng`/`radiusKm`, page) | Public |
| GET | `/tournaments/:tournamentId` (uuid or slug) | Public (only published) · owner/admin (any) |
| POST | `/tournaments` | Admin |
| PATCH | `/tournaments/:tournamentId` | Organizer (own) · Admin |
| PATCH | `/tournaments/:tournamentId/status` | Organizer (own) · Admin |
| GET | `/me/tournaments` (dashboard list) | Organizer (own) · Admin (all) |
| GET | `/tournament-categories` (game formats, age groups, gender categories) | Public |
| GET | `/places/autocomplete` | Logged-in |
| GET/PUT | `/tournaments/:tournamentId/grounds` | Owner · Admin |
| GET/PUT | `/tournaments/:tournamentId/rules` | Public (GET) · Owner · Admin |
| GET/POST/PATCH | `/rules` (master rule book) | Public (GET) · Admin |

## Decisions (confirmed 2026-11-26)
| Topic | Decision |
|---|---|
| Admin fields on create | **Name, organizer, city (Google Places) and live-streaming on/off**. The organizer fills everything else. Admin can edit everything |
| Categories | **Master tables** seeded now (management screens later): `game_formats` (5/6/7/8/9/11-a-side), `age_groups` (Open, U-12, U-14, U-16, U-17, U-19, U-21, Veterans 35+), `gender_categories` (Men, Women, Mixed). No "level" |
| Tournament structures | Constant `TOURNAMENT_FORMAT`: **LEAGUE** (round robin), **KNOCKOUT**, **GROUP_LEAGUE** (groups, round robin inside each group), **GROUP_KNOCKOUT** (groups, then knockouts). Fixtures in Phase 5 support both an algorithm and manual creation/editing |
| Status flow | **Manual with guards**: DRAFT → REGISTRATION_OPEN → ONGOING → COMPLETED, plus CANCELLED from any non-final status. REGISTRATION_OPEN can go back to DRAFT. The API checks that required details exist before opening registration. Automatic moves come later with schedulers |
| Visibility | **Public whenever status is not DRAFT** (lists, search, page, future feeds). Drafts are visible only to the organizer and admins |
| Entry fee | **Can be 0** (free). Free tournaments skip payment and the organizer confirms teams |
| Grounds | **Main venue + multiple named grounds**, each optionally with its own Google place |
| Rule book | **Master rules + tournament custom rules**. A new tournament starts with the active master rules. The organizer can remove some and add custom rules |
| Google Places | **Backend proxy** with one server key (`GOOGLE_MAPS_API_KEY`): `GET /places/autocomplete` and `POST /places` (Place Details → upsert `places`). Keeps the key private and works for the mobile app. In development without a key, a small built-in sample of Maharashtra places is used so the app works locally |
| Locations stored | `tournaments.city_place_id` (set by admin, used for feeds and search) and `tournaments.venue_place_id` (organizer). `users.city` becomes `users.city_place_id` |
| Editing after start | Once ONGOING, structure fields (format, categories, team/squad limits, points) are locked. Description, logo, banner, contact and grounds stay editable |

## Outcome
- **Backend**: places (Google Places proxy with a dev sample fallback, SRID 4326 points, spatial index), category master tables (seeded), tournaments with guarded status flow and structure locks, public search/filters/near-me, grounds with stable ids, master + tournament rule books, tournament logo/banner uploads, and `users.city_place_id`. 24 unit tests. A 58-check Phase 2 e2e run and the 52-check Phase 1 e2e run pass against MySQL 8 + an S3 emulator.
- **Frontend**: public tournaments list (search, filters, near me via browser location, distance on cards) and tournament page (overview, venue + maps link, grounds, rule book, organizer). Dashboard: tournaments table (admins see all, organizers see their own), admin create modal, editor with Details / Grounds / Rule book tabs and status actions (missing details highlighted), admin master rule book page, profile city via place search. New components: `PlaceSearch`, `Switch`, `Tabs`, `ImageUploadField` (+ `useImageUpload`), `TournamentCard`, `TournamentStatusBadge`. 29 tests. Verified end to end in Chromium (admin → organizer → public, phone + dark mode).
- **Bug fixed during testing**: the public list accepted `status=1` (draft) as a filter. It now rejects non-public statuses.
- **Owner setup**: Google Cloud **Places API (New)** + a server key in `GOOGLE_MAPS_API_KEY` (backend README). No browser key is needed.
