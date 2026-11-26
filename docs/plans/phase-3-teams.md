# Phase 3: Staff, Teams & Squads (module plan)

Status: **Done** (decisions confirmed 2026-11-27). Part of `plans/implementation-plan.md`.
Goal: tournaments get teams (added by the organizer or requested by captains), squads built by captains through email invites, and scorers/media operators assigned through invites. Payments come in Phase 4. This phase prepares the "awaiting payment" state.

## Team lifecycle
```
Organizer adds team ───────────────────────────────┐
                                                   ├─► AWAITING_PAYMENT (paid tournament) ─► CONFIRMED
Captain request ─► PENDING_APPROVAL ─► approve ────┘   CONFIRMED (free tournament)          ▲
        │                         └─► REJECTED (reason)                                     │
        └─► WITHDRAWN (captain, before confirmation)          organizer "confirm" (offline payment)
CONFIRMED ─► captain builds squad ─► organizer LOCKS (checks) ⇄ UNLOCK
Any non-final team ─► REMOVED (organizer/admin, until the tournament is Ongoing)
```

## Decisions (confirmed 2026-11-27)
| Topic | Decision |
|---|---|
| Ways to add a team | **Organizer/admin adds teams any time** (until the tournament ends). **A verified player can request** to join as captain with the team details |
| Request window | Only while the tournament is **Registration open** and the registration deadline hasn't passed |
| Request limit | **Max 2 requests per captain per tournament**. If the 1st is rejected, the captain may send a 2nd. The decision on the 2nd is **final**. Only one pending request at a time |
| Confirmation | **Free tournament**: approving a request (or the organizer adding a team) confirms it immediately. **Paid tournament**: the team waits for payment (Phase 4) or the organizer's manual confirmation (offline payment) |
| Max teams | Requests can still arrive (waiting list), but the organizer **can't approve or add teams beyond `maxTeams`** active teams |
| Squad building | Only **after the team is confirmed**. The captain invites players by email: **verified players** (picked from player search) or **guests** (name + email). Players must **accept** the invite. Guests accept through the same link that claims their account |
| Position | Verified player: the captain picks one of the player's profile positions. Guest: any position, auto-added to the guest's profile positions |
| Jersey number | **Required** (1–99), unique within the team, editable until the team is locked |
| One team per tournament | A player (including the captain) can be in only one team per tournament. Pending invites and pending requests also count. Enforced by a DB unique index |
| Squad changes | Before lock: **only the captain** removes players or cancels pending invites (the captain can't remove themselves). Players can't leave on their own |
| Locking | Organizer/admin locks a **confirmed** team after checks: active squad size between the tournament's min and max, no pending invites, every player has a jersey and position. Organizer can unlock |
| Removing teams | **Organizer/admin until the tournament is Ongoing**. A captain can **withdraw** their own request or team **before it's confirmed** |
| Team fields | **Team name** (required, unique among active teams in the tournament) and **short name** (2–4 letters/digits, e.g. "KFC") |
| Staff | Organizer/admin **invites** scorers and media operators by email (verified or guest), **max 2 per role** (pending invites count). They accept from the email or the app. The organizer can remove them any time. Staff may also play in the same tournament |

## Data model
| Table | Key columns | Constraints |
|---|---|---|
| `teams` | uuid, tournament_id, name, short_name, captain_user_id, status, source (ORGANIZER / REQUEST), request_number, is_squad_locked, locked_at, locked_by, confirmed_at, confirmed_by, reviewed_by, reviewed_at, rejection_reason, created_by, timestamps | idx (tournament_id, status), idx (captain_user_id, tournament_id) |
| `team_members` | uuid, team_id, tournament_id, user_id, position_id, jersey_number, is_captain, status (INVITED / ACTIVE / DECLINED / REMOVED / CANCELLED), invited_by, joined_at, **active_lock** (1 while INVITED/ACTIVE, else NULL) | **uq (tournament_id, user_id, active_lock)** = one team per tournament. **uq (team_id, jersey_number, active_lock)** = unique jerseys |
| `tournament_staff` | uuid, tournament_id, user_id, staff_role (SCORER / MEDIA_OPERATOR), status (INVITED / ACTIVE / DECLINED / REMOVED), invited_by, active_lock | uq (tournament_id, user_id, staff_role, active_lock) |
| `invites` (existing) | new types: **TEAM_JOIN**, **STAFF_ASSIGN**. `payload` holds the team member / staff id | Email link and in-app acceptance |

## API (`/api/v1`)
| Method | Endpoint | Who |
|---|---|---|
| GET | `/tournaments/:tournamentId/teams` | Public: confirmed teams. Managers: all, with status filter |
| POST | `/tournaments/:tournamentId/teams` | Organizer/admin adds a team (captain: verified player id **or** guest name + email, plus captain jersey/position) |
| POST | `/tournaments/:tournamentId/team-requests` | Verified player requests as captain (name, short name, own jersey + position) |
| GET | `/teams/:teamId` | Public (confirmed) team page with squad. Captain/managers see more |
| PATCH | `/teams/:teamId` | Name/short name: captain or organizer, before lock |
| PATCH | `/teams/:teamId/review` | Organizer approves/rejects a request (with reason) |
| PATCH | `/teams/:teamId/confirmation` | Organizer confirms a paid team manually |
| PATCH | `/teams/:teamId/lock` | Organizer locks/unlocks (`isLocked`) |
| POST | `/teams/:teamId/withdrawal` | Captain withdraws before confirmation |
| DELETE | `/teams/:teamId` | Organizer removes (until Ongoing) |
| POST | `/teams/:teamId/members` | Captain invites (verified id or guest name + email, position, jersey) |
| PATCH / DELETE | `/teams/:teamId/members/:memberId` | Captain edits jersey/position, or removes/cancels (before lock) |
| POST | `/teams/:teamId/members/:memberId/invites` | Captain resends a pending invite |
| GET / POST / DELETE | `/tournaments/:tournamentId/staff` (+ `/:staffId`) | Organizer/admin |
| GET | `/players?search=` | Logged-in: search verified players (name, city, positions; no contact details) |
| GET | `/me/teams`, `/me/invitations` | My teams and pending invitations |
| POST | `/me/invitations/:inviteId/response` | Accept/decline in the app |
| GET / POST | `/invites/:token`, `/invites/:token/acceptance`, `/invites/:token/decline` | Email links (guests set password + phone while accepting) |

## Open points (later phases)
- Age-group eligibility checks against date of birth (guests and some players have none).
- Refunds for removed paid teams (handled outside the app for now).

## Outcome
- **Backend**: teams, team members and tournament staff tables (`active_lock` pattern for one-team-per-tournament and unique jerseys), invite UUIDs plus a handler registry for team-join and staff invites. Covers captain requests (max 2, the second decision is final), organizer approval or rejection, confirmation (free teams confirm on approval), squad invites for verified players and guests (guests set a password and phone while accepting), jersey and position edits, squad lock with the min-squad check, withdraw/remove, staff invites (2 per role), player search, my teams and in-app invitations. 29 unit tests; the 69-check Phase 3 e2e run passes, along with the Phase 1 and Phase 2 runs.
- **Frontend**: Register-your-team modal on the tournament page, team page (public, member, captain and organizer views), Teams and Staff tabs in the tournament editor, Invitations and My teams cards on the member dashboard, and a generalized accept-invite page (account setup for guests). New components: `FormModal`, `DropdownPortal` (dropdowns inside modals and tables are no longer clipped), and `components/team/*`; new hooks `usePositions` and `useViewerKey`. 33 tests. Verified end to end in Chromium: captain request → approval → verified and guest invites → in-app accept → guest activation → staff invite, plus phone and dark mode.
- **Bugs fixed during testing**: (1) squad invite emails had no recipient because `email` was not loaded with the person; (2) after a hard reload the team page loaded before the session restored, so a captain saw the public view. Viewer-dependent pages now wait for the session via `useViewerKey`; (3) the squad summary rendered a `<p>` inside a `<p>`.
