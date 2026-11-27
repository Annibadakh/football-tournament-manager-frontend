# Phase 7: Public profiles, stats & awards (module plan)

Status: **Done** (decisions confirmed 2026-11-27). Part of `plans/implementation-plan.md`.
Goal: public player profiles with career stats and history, a players directory, awards (automatic + organizer), richer team and tournament pages, PDF downloads and share buttons.

## Decisions (confirmed 2026-11-27)
| Topic | Decision |
|---|---|
| Awards | **Automatic** when a tournament is marked **Completed**: Champion, Runner-up, Third place (team awards, also shown on their players' profiles), Golden Boot (top scorer), Most assists, Most Player of the Match (ties: all tied players). **Organizer awards**: custom title (e.g. Best goalkeeper, Fair play team) for a player or a team, any time. Re-completing recalculates automatic awards; organizer awards are kept |
| Champion rules | Knockout / groups + knockout: final winner and loser, third-place match winner. League: table positions 1–3. Groups + round robin: each group winner ("Group A winner") |
| Link previews | **Later** (with server-side rendering). Pages get a **Share** button now |
| Share button | Phones: native share sheet. Desktop: WhatsApp and Copy link |
| Player URL | `/players/:playerId` with the existing non-guessable id |
| Public profile | Photo, city, positions, **age** (from date of birth, never the date itself), bio. **Never** email or phone. **Verified players only** (guests have no public page) |
| Career stats | Matches played, wins, draws, losses (the whole active squad counts as playing every **completed** match of their team; walkovers/forfeits excluded), goals, assists (own goals not counted), Player of the Match count. Cards stay private |
| History | One row per team membership: team, tournament, position, jersey, matches, goals, assists, POTM, team's finish / awards |
| Directory | Public **/players**: verified players, search by name, filter by city and position, paginated |
| PDFs | Public downloads: **points table**, **fixtures & results**, **tournament summary** (final standings, awards, top scorers; after completion) |

## Data model
`awards`: `id`, `uuid`, `tournament_id`, `type` (1 champion, 2 runner-up, 3 third place, 4 group winner, 5 golden boot, 6 most assists, 7 most POTM, 10 custom), `title`, `team_id` (nullable), `user_id` (nullable), `value` (e.g. goals), `is_automatic`, `created_by`, timestamps. Indexes: `tournament_id`, `user_id`, `team_id`.

## API (`/api/v1`)
| Method | Path | Who / what |
|---|---|---|
| GET | `/players` | **Public** directory: `search`, `cityPlaceId`, `positionId`, pagination (logged-in squad search keeps working) |
| GET | `/players/:playerId` | Public profile: details, career totals, history, awards |
| GET | `/teams/:teamId/stats` | Public: record, goals, table position, top scorers, awards |
| GET | `/tournaments/:id/awards` | Public awards |
| POST / DELETE | `/tournaments/:id/awards`, `/awards/:id` | Organizer/admin: custom awards |
| GET | `/tournaments/:id/exports/{standings,fixtures,summary}.pdf` | Public PDFs (`?download=1` to save) |

Completing a tournament (`PATCH /tournaments/:id/status` → Completed) recalculates automatic awards.

## Frontend
- `/players` directory and `/players/:playerId` profile (stats tiles, history table, awards).
- Player names link to profiles from squads, timelines, leaders, POTM.
- Team page: record and stats card, awards.
- Tournament page: Awards card, PDF download buttons, Share button.
- Organizer: Awards card in the editor (add / remove custom awards; automatic ones shown after completion).
- `ShareButton` on tournament, team, match and player pages.

## Tests
Unit: age calculation, award rules per format (including ties), career aggregation. E2E: complete tournaments of each format, check awards, profile totals and history, privacy (no email/phone/date of birth; guests hidden), directory filters, custom awards permissions, PDFs. Browser: directory → profile, team stats, awards, downloads, share, phone + dark mode.

## Outcome
- **Backend**:
  - `awards` table and `utils/awards.js` (placings per format, ties share awards, age from date of birth). `award.service` recalculates automatic awards when a tournament is marked Completed (blocked while a match is live); custom awards are add/remove by the organizer.
  - `profile.service`: public profile (verified only: no email, phone or birth date), career totals, history and awards; team stats.
  - `/players` is now a public directory with city and position filters. `export.service`: points table, fixtures & results and summary PDFs (data is checked before any PDF header is sent; rows are positioned from a fixed top so spacing stays even).
  - Players in events, leaders, awards and POTM carry `isVerified`.
  - Tests: 104 unit tests; the 37-check Phase 7 e2e run passes, and so do the Phase 3–6 runs. The Phase 2 venue/city search and Phase 3 player-search checks now miss on page 1 because of accumulated test data (not a regression).
- **Frontend**:
  - Public `/players` directory and `/players/:playerId` profile (stat tiles, awards, history table that collapses to one line per row on phones), "Players" in the header.
  - Team stats card, tournament Awards + Downloads cards, `ShareButton` (native sheet on phones, WhatsApp / Copy link on desktop) on tournament, team, match and profile pages.
  - Verified player names link to profiles across squads, timelines, leaders, POTM and awards. Organizer Awards card (add/remove custom awards) in the Fixtures tab.
  - Tests: 64 tests. Verified in Chromium: directory filters, profile with no contact data, share menu, awards and PDF downloads, team stats, POTM link, organizer custom award, phone in dark mode.
