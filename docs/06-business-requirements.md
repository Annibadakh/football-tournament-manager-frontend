# Business Requirements (Core Pillars)

Status: **Agreed core requirements** (2026-11-23). This document covers the pillars and core rules only, not every detail.
Details are decided during feature planning and implementation. Open points are listed at the end.
v2 starts with a **fresh database and schema**. No v1 data is migrated.

## 1. Platform overview
- A multi-tournament platform: many tournaments run at the same time, each managed by an **organizer**.
- The public can browse and **search tournaments by name, place or area**, including location-based ("near me") listing.
- Individuals have **reusable profiles** (player, scorer, media operator) that are independent of any single tournament or team.
- Verified people get a **public profile** with past participation, statistics and achievements.

## 2. Users, roles and identity
### 2.1 One user table
- A single parent `users` table is referenced everywhere. Every person is exactly one user row.
- **Guest** accounts live in the same table, with a guest status.

### 2.2 Two levels of roles
1. **Account role** (on `users`, exactly one per user). Decides which area of the app the user can access:
   | Account role | Purpose |
   |---|---|
   | `superadmin` | Platform owner. Receives all payments and manages funds outside the app |
   | `admin` | Creates organizers and tournaments, and enables live streaming per tournament |
   | `organizer` | Manages their own tournaments |
   | `member` | Any public individual: plays, captains, scores or operates media through assignments |
   | `viewer` *(future)* | Public viewer login for reviews, polls, etc. |
2. **Tournament assignments** (separate tables). Decide what a member can do inside a specific tournament or team. One user can hold many assignments across tournaments:
   | Assignment | Scope | Limit |
   |---|---|---|
   | Player | Team in a tournament | One team per tournament |
   | Captain | Team | The captain is a **player of that team** with an extra captain flag/badge for that team only |
   | Scorer | Tournament | Up to 2 per tournament |
   | Media operator | Tournament | Up to 2 per tournament |
   - A scorer or media operator **may also play** in the same tournament.
   - Permissions inside a tournament always come from assignments, never from the account role.

### 2.3 Verified vs guest
| | Verified | Guest |
|---|---|---|
| Created by | The person (public sign-up) | An organizer or captain adding them by **email** |
| Unique key | Email (+ phone, unique) | Email |
| Badge | Verified | Guest |
| Reusable across tournaments | Yes | Yes (keeps the guest badge) |
| Can log in and act | Yes | No, must verify first |

- **Claiming a guest account**: the guest verifies **the same user record**, so all history is kept. They verify their email with an **OTP** (email service) and add a **phone number** (unique, required, but **not OTP-verified yet**; SMS/WhatsApp OTP comes later).
- Prompting a guest to verify happens through an **email invite**, and through a "verify your account to continue" message on login or dashboard actions.
- If someone tries to add a guest whose email already belongs to a **verified** user, the system does **not** silently swap them. It shows a message suggesting the existing verified user instead.

## 3. Tournament management
- **Admin** creates organizer accounts. An organizer can have many tournaments.
- **Admin** creates each tournament under an organizer and decides whether **live streaming** is enabled for it.
- **Organizer** can edit their tournament and add further information. They cannot create tournaments.
- Organizer adds up to **2 scorers** and **2 media operators** per tournament (verified profiles or guests).
- Organizer adds **teams and captains** (verified players or guests).
- Organizer creates **match fixtures** and manages schedules and timings.
- Tournaments store the location data needed for location search and "near me" listing (exact fields decided in planning).

## 4. Teams and squads
- The **captain manages the team squad** (adds and removes players: verified or guest).
- Adding a player sends an **email invite that must be accepted** before the player joins the squad.
- A player can be in **only one team per tournament**.
- The **organizer locks or unlocks** a team's squad manually. A locked squad cannot be changed by the captain.

## 5. Payments
- **One payment per team** (the tournament entry fee), paid by the **captain** from their login.
- Basic Razorpay flow. All payments go to a **single account (superadmin)**. Distributing funds happens outside the app.
- Payments are verified **server-side** with Razorpay signature verification and webhooks.
- A **successful payment confirms the team**. The organizer can also confirm or mark payment manually (for example offline payment).

## 6. Live matches
- **Scores**: managed by the organizer and the tournament's scorers.
- **Live streaming**: managed by the organizer and the tournament's media operators, **only if the admin enabled it** for that tournament.
  - Phase 1: an embedded external live stream (for example a YouTube Live link) on the match page.
  - Phase 2 (future): streaming inside the app.
- Match events, statistics and achievements cover what a proper football tournament manager needs. The exact list is defined at implementation time and drives the public profiles.

## 7. Future scope (not in the first v2 release)
- Public viewer login (reviews, polls, etc.)
- Phone OTP verification (SMS/WhatsApp)
- In-app live streaming
- Media gallery for media operators

## 8. Open points
- **Organizer identity**: is it a single person, or an organization profile (name, logo, contact) with possibly several logins?
- **Tournament settings ownership**: does the admin set entry fee, format, dates and team/squad limits at creation, or does the organizer?
- **Guest invite flow**: is the invite email for a guest the same link they use to claim and verify their account?
- **Captain change**: can the organizer reassign the captain to another squad player?
- Match events, stats and achievements list (section 6).
