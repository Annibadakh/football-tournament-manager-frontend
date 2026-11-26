# Phase 1: Identity & Accounts (module plan)

Status: **Done** (2026-11-26). Part of `plans/implementation-plan.md`.
Goal: everyone can have an account; admins can create admins and organizers; guests can exist and claim their account. No tournaments yet.

## Scope
| # | Feature | Who |
|---|---|---|
| 1 | Sign up (member), with email OTP verification and phone capture | Public |
| 2 | Log in / log out / log out of all devices, with access + refresh tokens | Everyone |
| 3 | Forgot password → email OTP → set a new password | Everyone |
| 4 | "Verify to continue" guard for unverified accounts | Everyone |
| 5 | My profile: view/edit personal info, photo, playing positions (multi, one primary) | Logged-in user |
| 6 | Change password | Logged-in user |
| 7 | Superadmin creates admins; admin creates organizers (invite-based) | Superadmin / Admin |
| 8 | User management list (server-side table: search, filter by role/status, block/unblock) | Superadmin / Admin |
| 13 | File uploads: presigned POST to S3 + signed GET URLs (profile photo first) | Logged-in user |
| 9 | Guest creation service (by email) + guest claim via invite link | Used by Phase 3; testable via admin tools in dev |
| 10 | Email sending (provider + branded templates) | System |
| 11 | Positions master list (seeded) | System |
| 12 | Superadmin bootstrap command | Owner |

## Constants (backend source of truth, mirrored in frontend)
```js
ACCOUNT_ROLE   = { SUPERADMIN: 1, ADMIN: 2, ORGANIZER: 3, MEMBER: 4 }            // VIEWER: 5 later
ACCOUNT_STATUS = { GUEST: 1, PENDING_VERIFICATION: 2, VERIFIED: 3, BLOCKED: 4 }
OTP_PURPOSE    = { EMAIL_VERIFY: 1, PASSWORD_RESET: 2 }
INVITE_TYPE    = { ACCOUNT_SETUP: 1 }   // TEAM_JOIN, STAFF_ASSIGN added in Phase 3
INVITE_STATUS  = { PENDING: 1, ACCEPTED: 2, EXPIRED: 3, REVOKED: 4 }
```

## Tables (migrations)
| Table | Columns | Constraints / indexes |
|---|---|---|
| `users` | id, uuid, full_name, email, phone (CHAR 10), password_hash, account_role, account_status, email_verified_at, date_of_birth, gender, city, photo_key, bio, last_login_at, created_by, updated_by, timestamps, deleted_at | uq email, uq phone (nullable), uq uuid, idx (account_role, account_status) |
| `positions` | id, code, name, short_name, sort_order | uq code. Seeded: Goalkeeper (GK), Defender (DEF), Midfielder (MID), Forward/Striker (FWD) |
| `user_positions` | id, user_id, position_id, is_primary, timestamps | uq (user_id, position_id), FK cascade on user |
| `auth_otps` | id, user_id, purpose, code_hash, expires_at, attempts, consumed_at, created_at | idx (user_id, purpose) |
| `refresh_tokens` | id, user_id, token_hash, expires_at, revoked_at, replaced_by_id, user_agent, ip, platform, created_at | uq token_hash, idx user_id |
| `invites` | id, uuid, token_hash, type, user_id, invited_by, status, expires_at, accepted_at, payload (JSON), timestamps | uq token_hash, idx (user_id, type, status) |

## Key flows
1. **Sign up** → status PENDING_VERIFICATION → 6-digit OTP emailed → verify OTP + add phone → VERIFIED.
2. **Admin creates an organizer** (or superadmin creates an admin) with name + email → user created without a password → ACCOUNT_SETUP invite emailed → the person opens the link, sets a password + phone → VERIFIED. The link proves email ownership, so no separate OTP is needed.
3. **Guest** (created later by organizer/captain) → status GUEST, no password → the same ACCOUNT_SETUP invite and link → VERIFIED. Same user row, so history is kept.
4. **Existing verified email** when creating a guest → not reused silently. The API returns `CONFLICT` with a "user exists, use them instead" message (business rule 2.3).
5. **Tokens**: short-lived JWT access token (`Authorization: Bearer`) + rotating refresh token. Web: refresh token in an httpOnly, Secure, SameSite cookie. App (future): refresh token in the body. Reusing an already-rotated refresh token revokes that whole session chain (theft detection).
6. **OTP security**: 6 digits, stored as a hash, expires in 10 min, max 5 attempts, resend cooldown 60 s, strict rate limit per IP and per email.

## API (`/api/v1`)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Sign up |
| POST | `/auth/login` | Log in → access token (+ refresh cookie/body) |
| POST | `/auth/refresh` | Rotate the refresh token, get a new access token |
| POST | `/auth/logout` | Revoke the current session |
| POST | `/auth/logout-all` | Revoke every session of the user |
| POST | `/auth/email-otp` | (Re)send the email verification OTP |
| POST | `/auth/email-verification` | Verify the OTP + phone → VERIFIED |
| POST | `/auth/password-reset-otp` | Send a password reset OTP (always returns 200, so emails can't be discovered) |
| POST | `/auth/password-reset` | OTP + new password |
| GET | `/invites/:token` | Check an invite link (who, type, expired?) |
| POST | `/invites/:token/acceptance` | Set password + phone → VERIFIED |
| GET / PATCH | `/me` | My account and profile |
| PUT | `/me/positions` | Replace my positions (with primary) |
| POST | `/uploads` | Get a presigned POST for an upload purpose (e.g. profile photo) |
| PATCH | `/me/password` | Change password |
| GET | `/positions` | Master list |
| GET | `/users` | Admin list (page, search, role, status) |
| POST | `/users` | Superadmin → admin, admin → organizer (sends invite) |
| PATCH | `/users/:userId/status` | Block / unblock |
| POST | `/users/:userId/invites` | Resend the setup invite |

## Frontend screens
Login · Sign up · Verify email (OTP + phone) · Forgot / reset password · Accept invite (set password) · My profile (info, photo, positions) · Change password · Admin: users list + create admin/organizer dialog · Dashboard home per role · Header user menu (profile, logout).
The Redux auth slice gets session bootstrap on app load (silent refresh), auto-refresh on 401, and logout.

## Decisions (confirmed 2026-11-26)
| Topic | Decision |
|---|---|
| Email | **Nodemailer + SMTP**, starting with **Gmail + app password** (`maidaan.app@gmail.com`). Gmail allows about 500 emails/day; the provider can be swapped by changing SMTP env vars only. In development without SMTP settings, emails are printed to the server log |
| Name | **Single full name** field (`full_name`) |
| Unverified login | **Allowed**: every screen redirects to "Verify your email" until OTP + phone are done (`requireVerified` guard on the API) |
| Phone | **India only**. Stored as the **10-digit number only** (`CHAR(10)`, no `+91`), validated as `^[6-9]\d{9}$`. The UI shows a fixed +91 prefix |
| File storage | **AWS S3** (`ap-south-1` Mumbai) for all uploads (photos, PDFs, short videos). Large videos are planned later |
| Upload method | **Presigned POST** (S3 enforces max size via `content-length-range` and the content type). The API stores the **object key**, never a URL |
| File access | **Presigned GET for everything**. Bucket fully private. API responses include short-lived signed URLs (1 hour) |
| Image optimization | **Compressed in the browser** before upload (`browser-image-compression`). `sharp` and `multer` are removed from the backend (no server-side file handling) |
| Sessions | Access token **15 min** + refresh token **30 days**, rotating, multiple devices. Web: httpOnly cookie. Future app: refresh token in the body |
| Passwords | **8–64 characters, at least one letter and one number**. bcrypt (12 rounds) |
| First superadmin | **CLI command** `npm run create:superadmin` (prompts for name, email, password) |
| Unclaimed accounts | `account_status = GUEST` means "created by someone else, not yet claimed" (guest players, and admins/organizers before they accept their invite) |
| Sign up with a guest email | Allowed: the same row is updated and must be verified by email OTP (business rule 2.3). Verified emails get `CONFLICT` |

## Outcome
- **Backend** (`/api/v1`): every endpoint in the API table is built. 18 unit tests pass, plus a 52-check end-to-end run against MySQL 8 and a local S3 emulator (register, OTP, verify, profile, positions, S3 upload, refresh rotation and reuse detection, mobile refresh via body, password reset, invites, roles, block/unblock, change password, logout).
- **Frontend**: login, sign up, verify (OTP + phone), forgot/reset password, accept invite, role-based dashboard, profile (photo, details, positions), security (change password, log out everywhere), and users admin (server-side table, filters, invite, block, resend invite). 24 tests pass, lint is clean. Verified in Chromium end to end against the real API.
- **Session handling**: silent refresh on app load, automatic refresh-and-retry on 401 (one refresh shared by parallel requests), and a "verify to continue" redirect.
- **Additions**: `Avatar`, `Textarea`, `PhoneInput` (+91 prefix, stores 10 digits), `useForm` (plain-state form helper: values, errors, zod validation, API field errors) and `useCountdown`.
- **Fix found during testing**: `browser-image-compression` loaded its web worker from cdn.jsdelivr.net by default. It is now bundled locally (`libURL`).
- **Known limitation**: two browser tabs refreshing at the same instant can trip refresh-token reuse detection and sign the user out. This is rare. Revisit if users report it.
- **Owner setup needed**: Gmail app password, S3 bucket + CORS + IAM user (see backend README), then `npm run create:superadmin`.
