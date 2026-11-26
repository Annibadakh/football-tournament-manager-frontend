# v2 Implementation Plan

Status: **Draft for review** (2026-11-25). Based on `*-business-requirements.md` and `plans/v1-to-v2-gap-analysis.md`.
All work is on the `version-2` branch of both repos. Fresh database, no v1 data migration.

## How we build
- **Vertical slices**: each phase delivers backend + frontend for one area, testable end to end. The next phase starts once it is reviewed.
- **Replace, don't patch**: v1 files are deleted as their v2 module lands. Until a phase is complete, `version-2` may not run the full app. That is expected.
- **Every module follows the standards**: routes → middlewares (auth, rate limit, zod `validate`) → controller → service → repository → model, numeric constants per module, the standard response envelope, transactions for dependent writes, and indexes in migrations.
- **Details are decided per module**: each phase starts with a short `plans/<module>.md` covering the open details (fields, rules, UI flows). It is reviewed, built, and then deleted or archived.

## Database design principles
- **IDs**: internal `id` (INT auto-increment) for joins, plus a public `uuid` used in every URL and API response (non-guessable, for example `/players/:playerId`).
- **Enums**: `TINYINT` columns holding the per-module numeric constants (`MATCH_STATUS.LIVE = 2`, …).
- **Audit and safety**: `created_at`, `updated_at`, `deleted_at` (soft delete, `paranoid`), plus `created_by`/`updated_by` on main tables. All times are stored in UTC.
- **Naming**: snake_case tables and columns (`underscored: true`). All schema changes and indexes go through sequelize-cli **migrations**. Master data (positions, rules, superadmin) goes through **seeders**.

## Draft schema (core tables)
> Columns shown are the key ones. Full column lists are finalized in each module plan.

| Table | Key columns | Notes / constraints |
|---|---|---|
| `users` | uuid, name, email, phone, password_hash, account_role, account_status, email_verified_at, dob, gender, city, photo_url, bio | email unique; phone unique (nullable until verification); `account_role`: SUPERADMIN, ADMIN, ORGANIZER, MEMBER (later VIEWER); `account_status`: GUEST, VERIFIED, BLOCKED; guests have no password |
| `positions` | code, name, short_name, sort_order | Seeded master list |
| `user_positions` | user_id, position_id, is_primary | unique (user_id, position_id) |
| `auth_otps` | user_id, purpose, code_hash, expires_at, attempts, consumed_at | Purposes: EMAIL_VERIFY, PASSWORD_RESET. Hashed, expiring, attempt-limited |
| `refresh_tokens` | user_id, token_hash, expires_at, revoked_at, user_agent | httpOnly cookie sessions |
| `invites` | token_hash, type, invited_user_id, invited_by, tournament_id, team_id, staff_role, position_id, status, expires_at | Types: GUEST_CLAIM, TEAM_JOIN, STAFF_ASSIGN. Status: PENDING, ACCEPTED, DECLINED, EXPIRED |
| `places` | google_place_id, name, formatted_address, area, city, district, state, pincode, latitude, longitude, location (POINT SRID 4326), details_fetched_at | From Google Places. Spatial index on location. Referenced by tournaments, teams, users (city) and CMS |
| `tournaments` | uuid, slug, organizer_id, venue_place_id, visibility, published_at, name, description, logo_url, banner_url, status, format, is_streaming_enabled, entry_fee, start_date, end_date, registration_deadline, team/squad limits, points_win/draw/loss, venue, area, city, district, state, pincode, latitude, longitude | Admin fills the basic fields and the streaming flag; the organizer fills the rest. Indexes: organizer_id, status, city, area, (latitude, longitude) |
| `tournament_staff` | tournament_id, user_id, staff_role, status | staff_role: SCORER, MEDIA_OPERATOR. Max 2 each (enforced in the service). unique (tournament_id, user_id, staff_role) |
| `teams` | uuid, tournament_id, name, logo_url, captain_user_id, status, is_squad_locked, confirmed_at, confirmed_by | Status: PENDING_PAYMENT, CONFIRMED (…). The captain is fixed after creation |
| `team_members` | team_id, tournament_id, user_id, position_id, is_captain, jersey_number, status | **unique (tournament_id, user_id)**: one team per tournament. unique (team_id, jersey_number). The captain is the first member |
| `matches` | uuid, tournament_id, home_team_id, away_team_id, stage, round, scheduled_at, status, home_score, away_score, decided_by, winner_team_id, result_declared_at, result_declared_by | Status: SCHEDULED, LIVE, COMPLETED, CANCELLED, WALKOVER, FORFEIT. `decided_by`: REGULAR, EXTRA_TIME, PENALTIES, TIE. Scores are cached totals of the events. Locked once the result is declared |
| `match_events` | match_id, team_id, team_member_id, type, minute, is_reverted, created_by | Types: GOAL, OWN_GOAL, YELLOW_CARD, RED_CARD (the list grows in the match module). `team_member_id` links the user, team and tournament for stats |
| `match_logs` | match_id, actor_id, action, payload (JSON), created_at | Every scorer click. Append-only |
| `streams` | uuid, tournament_id, match_id, title, youtube_video_id, status, scheduled_at, created_by | **unique (match_id)**: one stream per match. `match_id` is null for tournament-level streams |
| `payments` | team_id, tournament_id, payer_user_id, amount, currency, method, status, razorpay_order_id, razorpay_payment_id, confirmed_by, paid_at | Method: ONLINE, MANUAL. unique razorpay_order_id. Verified by signature + webhook |
| `rules` | title, description, category, sort_order, is_active | The rule book. Whether tournaments can add their own rules is decided in Phase 2 |
| `notifications` | user_id, type, title, body, link, read_at | In-app notification list |

Standings and stats are **computed from matches and events** (no hand-maintained counters). They are cached only if needed later.

## Phases

### Phase 0: Foundation
**Backend**: `app.js`/`server.js` split, `config/env.js` (zod-validated), `constants/`, `utils/` (`apiResponse`, `ApiError`, `pagination`), middlewares (`validate`, `error`, `rateLimit`, `auth` skeleton), helmet, CORS config, sequelize-cli setup with `models/index.js`, logging, `.env.example`, committed lockfile, removal of v1 dead files.
**Frontend**: new folder structure, `config/env.js`, `services/apiClient.js` + `request.js`, Sonner `<Toaster />`, Redux store, `@/` alias, **brand colour tokens** (from the logo), P1 generic components (Button, FormInput, Select, SearchInput, Card, Badge, Loader, Modal, ConfirmDialog, EmptyState, DataTable + Pagination, PageHeader), layouts, `RoleRoute`, Prettier.
**Done when**: a health endpoint and a component showcase page work, and lint is clean on all new code.

### Phase 1: Identity & accounts
Sign up, login, logout, access + refresh tokens, email OTP verification (the phone number is captured at verification), forgot/reset password, my profile and positions, email provider integration, superadmin → admin creation, admin → organizer creation, guest creation (by email) + guest claim via invite, a "verify to continue" guard.
**Decide in module plan**: email provider, profile fields, password rules, token lifetimes.

### Phase 2: Tournaments
Admin creates a tournament (basic fields + streaming flag) under an organizer. The organizer completes and edits the details. Status lifecycle. Location fields. Admin and organizer dashboards. **Public**: tournament list with search (name, place, area) and near-me, plus the tournament page (overview). Rule book (`rules`).
**Decide in module plan**: categories (format, age, gender), grounds, registration rules, automatic status transitions, rule book scope.

### Phase 3: Staff, teams & squads
The organizer assigns up to 2 scorers and 2 media operators (verified or guest, by invite). The organizer creates teams with a fixed captain. The captain invites players and picks each player's position (from their profile positions; any position for guests, which is then auto-added). Invite accept/decline. One team per tournament. Squad lock/unlock. **Public**: team page (squad, badges).

### Phase 4: Payments
The captain pays the entry fee (Razorpay order → checkout → signature verification). Webhook. The team is confirmed on success. Organizer manual confirmation. Receipt email. Payment lists for organizer and admin.

### Phase 5: Fixtures & live scoring
The organizer creates and schedules matches. Scorer console (only while LIVE): goals, own goals and cards, revert last action, every action in `match_logs`. Card suspension notices with rule book links. Result declaration (regular, extra time, penalties, tie) and lock. Walkover and forfeit. Standings from tournament points rules. Top scorers. **Public**: matches, live score (polling, Socket.IO-ready), points table, PDF export.
**Decide in module plan**: full event list, Player of the Match, walkover/forfeit result rules, whether only confirmed teams can be scheduled, fixture generator.

### Phase 6: Live streaming
Streams at tournament and match level (YouTube URL → video id), status, scheduling, embed preview, replay, "Watch on YouTube" fallback. Only the organizer and media operators can manage streams, and only when the tournament has streaming enabled.

### Phase 7: Public profiles & stats
Player page (personal info without contact details, positions, career totals, participation history). Richer team and tournament pages (results, stats, awards). Achievements. Share links with WhatsApp/Open Graph previews and readable slugs.

### Phase 8: Notifications & launch readiness
In-app notifications + email notifications (invites, receipts, schedule changes). PWA. Error monitoring. Test coverage for points, standings, payments and permissions. CI (lint + tests). Staging and production deployment.

### Phase 9: Home feeds & CMS (last)
Algorithmic home feeds (ongoing / upcoming / recently completed tournaments and players, near the user and global) and a CMS for posters, announcements and external ads, with location targeting and scheduling. Earlier phases store the data it needs (see `plans/future-feeds-and-cms.md`).

## Dependency order
```
0 Foundation → 1 Identity → 2 Tournaments → 3 Staff & teams → 4 Payments
                                                   └──────→ 5 Fixtures & live → 6 Streaming
                                                                          └──→ 7 Profiles & stats → 8 Launch
```
Phase 4 and Phase 5 can run in parallel once Phase 3 is done.
