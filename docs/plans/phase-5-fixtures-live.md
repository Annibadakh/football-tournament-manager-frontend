# Phase 5: Fixtures & live scoring (module plan)

Status: **5A done, 5B next** (decisions confirmed 2026-11-27). Part of `plans/implementation-plan.md`.
Goal: the organizer builds and schedules fixtures for every tournament format; scorers run matches live from a phone; the public follows fixtures, live scores, results, standings, brackets and top scorers.

Built in two parts, each with its own backend → frontend → tests → commit cycle:
- **5A: Fixtures.** Groups, fixture generator, manual edits, scheduling on grounds with clash checks, public fixtures, bracket.
- **5B: Live & results.** Scorer console (clock, events, undo, match log), results (regular / extra time / penalties / tie, walkover, forfeit), Player of the Match, standings, top scorers and assists, card notices, public live match page (polling).

## Decisions (confirmed 2026-11-27)
| Topic | Decision |
|---|---|
| Creating fixtures | **Auto-generate for the tournament's format, then edit.** The organizer can change date, time, ground or teams of any not-started match, add single matches and delete not-started matches |
| Eligible teams | Only **confirmed teams with a locked squad** |
| Groups | Organizer sets the **number of groups** (and **qualifiers per group** for Groups + knockout), clicks **Draw** (random, balanced sizes), can move teams between groups, then generates fixtures |
| Knockout pairings | **Automatic bracket, editable.** Knockout format: random draw, with **byes** when the team count isn't a power of 2. After groups: standard crossover (A1 v B2, B1 v A2, …). **Winners advance automatically.** The organizer can swap teams in a round that hasn't started |
| Events | **Goal** (optional **assist**), **own goal** (counts for the other team), **yellow card**, **red card** (a 2nd yellow in the same match automatically adds a red), **period markers** (kick-off, half-time, 2nd half, full-time, extra-time periods). Every event has a player (except markers) and a minute |
| Undo | Removes the **last** event (soft revert). Every click, undo included, is stored in the **match log** (who, when, what) |
| Clock | **Running clock.** The scorer taps Start → Half-time → 2nd half → Full-time (→ ET 1st half → ET half-time → ET 2nd half → End). Each event gets the current minute (editable). The half length and the extra-time half length are tournament settings, prefilled from the game format |
| Live updates | **Polling (~10 s)** from a light endpoint that returns score, status, clock and a version number. Shaped so Socket.IO can replace polling later without page changes |
| Card notices | **No automatic suspension.** Before a player's next match the console and organizer see a notice: "X got a red card" or "X has 2 yellow cards in this tournament", linked to the discipline rules. Yellow threshold is a tournament setting (default **2**); a red always creates a notice. The organizer can mark a notice as handled |
| Walkover / forfeit | Organizer/admin only. The other team gets **win points** and the result counts **3–0** for the table (goal difference and goals for), but **no player goals** are credited. Walkover = a team didn't show; forfeit = a team conceded or was disqualified |
| Knockout ties | Recorded as decided in **regular time**, **extra time**, **penalties** or a **tie** (shared, e.g. a shared final). For extra time and penalties the scorer picks the winner; shootout scores are not stored |
| Player of the Match | Optional, picked from either squad **when declaring the result** |
| Standings | Points from the tournament (win/draw/loss). Tie-breakers: **points → goal difference → goals for → head-to-head points → team name** |
| Rights | **Scorers and the organizer/admin** start matches, record events and declare results. Only the **organizer/admin** schedules, sets walkover/forfeit, cancels or deletes matches |
| Scores | Editable **only while live**. Locked once the result is declared |

## Formats → stages
| Tournament format | Stages generated |
|---|---|
| League | One league stage; round robin, **single or double** legs (chosen when generating) |
| Knockout | Bracket rounds (Round of 16 … Final), byes in round 1 |
| Groups + round robin | Groups, each a single round robin; group tables are the final standings |
| Groups + knockout | Groups (round robin) → top *N* per group into a crossover bracket. Bracket slots show placeholders ("Winner Group A") until the group stage finishes, then fill automatically |

Round robin uses the circle method (balanced home/away, a rest round for odd team counts). Third-place playoff: optional when generating a bracket.

## Scheduling
- A match has an optional **ground** (from the tournament's grounds) and **kick-off time**. Unscheduled matches are allowed and show "Time TBA".
- **Auto-schedule** helper: start date, daily first kick-off, daily last kick-off, minutes per slot and the grounds to use. Fills matches round by round and never puts a team in two overlapping slots.
- **Clash checks** on every save: the same ground or the same team in overlapping matches is **blocked**; a team playing twice on the same day is a **warning**.
- Match length for overlap = 2 × half length + 15 min (half-time + buffer).

## Data model
- **`tournaments`** (new columns): `half_minutes`, `extra_time_half_minutes`, `yellow_card_notice_threshold` (default 2), `groups_count`, `qualifiers_per_group`.
- **`tournament_groups`**: `id`, `uuid`, `tournament_id`, `name` (A, B, …), `sort_order`.
- **`group_teams`**: `group_id`, `team_id`, `tournament_id`. A team is in at most one group (unique `tournament_id + team_id`).
- **`matches`**:
  - Identity and placement: `id`, `uuid`, `tournament_id`, `stage` (league / group / knockout), `group_id`, `round_number`, `round_name`, `match_number`.
  - Teams: `home_team_id`, `away_team_id` (null until known), `home_placeholder`, `away_placeholder`, `next_match_id`, `next_match_slot` (home/away).
  - Schedule and state: `ground_id`, `scheduled_at`, `status` (scheduled, live, completed, cancelled, walkover, forfeit), `period`, `period_started_at`.
  - Result: `home_score`, `away_score`, `decided_by` (regular, extra time, penalties, tie), `winner_team_id`, `potm_user_id`.
  - Audit: `started_at`, `ended_at`, `declared_by`, `version` (bumped on every change, used by polling), timestamps.
  - Indexes: `tournament_id + status`, `tournament_id + scheduled_at`, `ground_id + scheduled_at`, `home_team_id`, `away_team_id`.
- **`match_events`**: `id`, `uuid`, `match_id`, `tournament_id`, `team_id`, `type`, `player_user_id`, `assist_user_id`, `minute`, `period`, `is_reverted`, `created_by`, timestamps. Indexes: `match_id`, `tournament_id + type + player_user_id`.
- **`match_logs`**: `id`, `match_id`, `actor_user_id`, `action`, `payload` (JSON), `created_at`. Append-only.
- **`card_notices`**: `id`, `tournament_id`, `team_id`, `user_id`, `reason` (red / yellow threshold), `source_match_id`, `handled_at`, `handled_by`.

Standings, top scorers and assists are **calculated from matches and events** (cheap at tournament size). Cache tables can come later if needed.

## API (`/api/v1`)
| Method | Path | Who / what |
|---|---|---|
| GET / PUT | `/tournaments/:id/groups` | Public read / organizer: set groups (count, qualifiers, team placement) |
| POST | `/tournaments/:id/group-draw` | Organizer: random draw into groups |
| POST | `/tournaments/:id/fixtures` | Organizer: generate fixtures (`legs`, `thirdPlace`, optional auto-schedule options). Refused if any match has started; replaces not-started generated fixtures after confirmation |
| POST | `/tournaments/:id/schedule` | Organizer: auto-schedule unscheduled matches |
| GET | `/tournaments/:id/matches` | Public: filter by stage, group, round, team, status, date |
| POST | `/tournaments/:id/matches` | Organizer: add one match |
| GET / PATCH / DELETE | `/matches/:id` | Public read (events, POTM, teams) / organizer: teams, ground, time / delete a not-started match |
| GET | `/matches/:id/live` | Public, light: score, status, period, clock, `version` |
| POST | `/matches/:id/periods` | Scorer/organizer: start match, next period, end |
| POST | `/matches/:id/events` | Scorer/organizer: add an event (only while live) |
| DELETE | `/matches/:id/events/last` | Scorer/organizer: undo the last event |
| POST | `/matches/:id/result` | Scorer/organizer: declare result (`decidedBy`, `winnerTeamId`, `potmUserId`) → locked |
| POST | `/matches/:id/walkover` | Organizer: `{ type: walkover/forfeit, winnerTeamId }` |
| POST | `/matches/:id/cancellation` | Organizer: cancel a not-completed match |
| GET | `/matches/:id/console` | Scorer/organizer: squads, events, log, card notices for both teams |
| GET | `/tournaments/:id/standings` | Public: league or per-group tables |
| GET | `/tournaments/:id/bracket` | Public: knockout rounds |
| GET | `/tournaments/:id/leaders` | Public: top scorers and assists |
| GET / PATCH | `/tournaments/:id/card-notices`, `/card-notices/:id` | Organizer/scorer: list, mark handled |
| GET | `/me/scoring` | Scorer: my tournaments' upcoming and live matches |

## Frontend
- **Tournament editor → Fixtures tab**: groups (count, draw, drag/move), Generate fixtures (with options), auto-schedule, a match list grouped by round with inline edit, clash messages, card notices.
- **Scorer console** `/matches/:id/console` (mobile-first): big score, clock and period button, per-team event buttons (Goal, Own goal, Yellow, Red) → pick the player (and assist), timeline with undo, card-notice banner, Declare result sheet (decided by, winner, POTM).
- **Public**: on the tournament page, Fixtures & results (by round or date), Standings / group tables, Bracket, Top scorers; on the team page, the team's matches; a **match page** `/matches/:id` with live score, clock, timeline and auto-refresh while live.
- **Dashboard**: a "Matches to score" card for scorers.

## Tests
- Unit: round-robin generator (every pair once per leg, home/away balance, rest rounds), bracket with byes, crossover seeding, standings tie-breakers, walkover 3–0, clock minute calculation.
- E2E (API): every format end to end; clashes; scorer permissions; live-only scoring; undo; 2nd yellow → red; result lock; knockout advancement (including through a bye); card notices; polling version.
- Browser: organizer generates and schedules; scorer runs a match on a phone; public sees live updates, standings and bracket.

## Open points (later phases)
- Points-table / fixtures PDF export (Phase 7 with profiles and stats).
- Socket.IO push (Phase 8).
- Push notifications for match start and results (Phase 8).
- Penalty goal / missed penalty events (not chosen now).

## Outcome: 5A Fixtures (done)
- **Backend**:
  - Migration `create-fixtures`: tournament match settings, `tournament_groups`, `group_teams`, `matches`.
  - Pure generators in `utils/fixtures.js`: circle-method round robin, balanced group draw, bracket with byes (standard seeding), crossover seeds, auto-scheduler, clash checks.
  - `fixture.service`: groups, draw, generation for all 4 formats (with an optional third-place match and placeholders such as "Group A winner" or "Winner of M13"), auto-scheduling, add/edit/delete a match with blocking clashes and same-day warnings, public matches/match/bracket.
  - Tests: 21 new unit tests (61 in total); the 54-check 5A e2e run and the Phase 1–4 runs pass.
- **Frontend**:
  - Tournament editor **Fixtures** tab: match settings, groups (draw, move, save), generate/regenerate with confirmation, schedule modal, add/edit match modal (IST kick-off, clash errors, warnings), delete.
  - Public: a **Matches** card on the tournament page (by round/date, groups, bracket), the **match page** `/matches/:matchId`, and the team page lists its matches.
  - Shared: `components/match/*`, `utils/match` (IST helpers), and an `ariaLabel` prop on `Select`.
  - Tests: 48 tests. Verified in Chromium: draw → move team → generate with third place → schedule 16 matches → blocked clash → edit → public views, on phone and in dark mode.
- **Bugs fixed during testing**: the groups editor remounted before fresh data arrived (it now keys on the loaded data); the bracket widened the public page on phones (the column now has `min-w-0`).
