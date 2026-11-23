# v1 → v2 Gap Analysis

Status: **Draft for review** (2026-11-23). Compares the v1 code with the agreed business requirements (`*-business-requirements.md`).
Legend: **Keep** (concept stays and is rewritten to the v2 standards) · **Change** (works differently) · **New** · **Remove**.
v2 uses a fresh schema, so every table is redesigned. "Keep" means the *idea* survives, not the code.

## 1. Users, roles & auth
| Area | v1 | v2 | Type |
|---|---|---|---|
| Roles | Single `role` ENUM: superadmin, admin, captain, scorer | Account role (`superadmin, admin, organizer, member`, later `viewer`) + **tournament assignments** | Change |
| Organizer | Does not exist (admin does everything) | Single-person account created by admin | New |
| Public sign-up | None. All accounts are created by admin/superadmin | Anyone signs up as a `member` | New |
| Guest users | None | Guest status in `users`, unique email, guest badge, reusable | New |
| Verification | None | Email OTP, phone captured (unique), guest claim via invite link | New |
| Captain account | Auto-created with **password = email** | Captain is a member (verified or guest) and is invited by email | Change |
| Login | Email + password + **role dropdown** | Email + password. Role comes from the account, assignments loaded after login | Change |
| JWT | Signs `user.id` (undefined) and expires in 60 min | Signs `uuid` + role, config-driven expiry | Change |
| Superadmin creates admins | `POST /auth/register` | `POST /api/users` | Keep |
| Invites | None | Email invites: guest claim, team join, staff assignment, with accept/decline | New |
| Public profiles | None | Profile page with participation, stats, achievements and badges | New |

## 2. Tournaments
| Area | v1 | v2 | Type |
|---|---|---|---|
| Ownership | No owner, global list | Belongs to an **organizer** | Change |
| Who creates | Admin fills every field | Admin fills **basic** details. Organizer fills fee, format, dates, limits. Admin can manage all | Change |
| Location | None | Fields for name/place/area search and "near me" | New |
| Live streaming flag | None | `isStreamingEnabled`, set by admin only | New |
| Status lifecycle | None | Draft → registration → ongoing → completed (exact states TBD) | New |
| Points rules | Stored but **ignored** (hard-coded 3/1) | Used for standings | Change |
| Public search | List only | Search by name, place, area and near me, with pagination | New |

## 3. Staff (scorers, media operators)
| Area | v1 | v2 | Type |
|---|---|---|---|
| Scorer | Global account role, can score **any** match | Tournament assignment, max 2 per tournament | Change |
| Media operator | None | Tournament assignment, max 2, manages live stream links | New |
| Staff can play | N/A | Yes, also allowed in the same tournament | New |

## 4. Teams & squads
| Area | v1 | v2 | Type |
|---|---|---|---|
| Team identity | `team.uuid` = the captain's user uuid. Captain name, email and phone are copied onto the team | Own id. Captain linked through team membership | Change |
| Created by | Admin | Organizer, with the captain assigned at creation (fixed, counted as the first player) | Change |
| Players | A separate `Player` table per team. Not users. Random 4-digit id (can collide) | Players are **users** (verified or guest) linked through membership | Change |
| Joining | Captain adds directly | Captain invites by email and the player accepts | Change |
| Uniqueness | None | A user can be in **one team per tournament** (DB unique constraint) | New |
| Squad lock | None | Organizer locks/unlocks the squad | New |
| Approval | `isApproved` toggle, **no auth** on the endpoint | Team is confirmed by **successful payment** or by the organizer | Change |

## 5. Matches & live
| Area | v1 | v2 | Type |
|---|---|---|---|
| Fixtures | Admin creates them | Organizer creates and manages them (schedule and timings) | Change |
| Team references | String ids, no foreign keys | Foreign keys with indexes | Change |
| Status/stage/outcome | String ENUMs | Numeric constants (`MATCH_STATUS`, …) | Change |
| Scoring | +/- counters on match, team and player with no transaction (race conditions) | Match **events** (goals and more, list TBD) recorded in transactions, with totals derived from them | Change |
| Points on match end | Hard-coded, and **double-counts** if a match is ended twice | From tournament rules, idempotent | Change |
| Who scores | Global scorer or admin | Organizer + the tournament's scorers only | Change |
| Commentary events | Single global row that gets overwritten (`MatchEvent`) | Per-match event timeline | Change |
| Live updates | Polling every 30 s, N+1 calls per player | One match-detail endpoint. Polling for now, sockets later | Change |
| Live streaming | None | Phase 1: embedded external stream link per match (organizer and media operators) | New |

## 6. Standings & stats
| Area | v1 | v2 | Type |
|---|---|---|---|
| Points table | Sorted on the frontend from team counters | Computed by the backend from results and tournament rules | Change |
| Top scorers | Global across all tournaments | Per tournament, plus career stats on profiles | Change |
| PDF export | Points table PDF | Keep | Keep |
| Achievements | None | Defined at implementation time | New |

## 7. Payments
| Area | v1 | v2 | Type |
|---|---|---|---|
| Who pays | Create-order endpoint for admin/superadmin, with the UI commented out | Captain pays the entry fee for their team | Change |
| Verification | Frontend calls a `/payment/verify-payment` endpoint that **does not exist** | Server-side signature check + webhook, with a payments table | New |
| Manual confirmation | None | Organizer can confirm or mark as paid | New |

## 8. Public site & misc
| Area | v1 | v2 | Type |
|---|---|---|---|
| Home / tournaments / matches / live / points table | Exist | Keep, redesigned around search and multiple tournaments | Keep |
| Committee page | Hard-coded college committee with photos | **To decide** (see below) | ? |
| Image uploads | Unauthenticated, raw files | Authenticated, processed with sharp (WebP, resized) | Change |
| Dashboard endpoint | Unused | Remove | Remove |

## 9. To decide
1. **Committee page**: remove it, keep it as a static page, or replace it with an organizer/tournament info section?
2. **Password reset**: "forgot password" via email OTP is assumed to be needed. Confirm.
3. **Tournament status lifecycle**: confirm the states and who moves the tournament between them.
4. **Fixtures**: should only **confirmed** (paid) teams be allowed in fixtures?
