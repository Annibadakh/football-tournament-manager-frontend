# Phase 0: Foundation (module plan)

Status: **In progress** (decisions confirmed 2026-11-26). Part of `plans/implementation-plan.md`. Delete or archive this file when Phase 0 is done.
Goal: the skeleton every later phase builds on. **No business features in this phase.**

## Backend tasks
1. **Structure**: create the layer folders from `04-project-structure.md` (`constants/`, `middlewares/`, `services/`, `repositories/`, `validations/`, `utils/`, `migrations/`, `seeders/`).
2. **App bootstrap**: `app.js` (helmet, CORS allow-list from env, JSON body limit, rate limiter, request logging, `/api/v1` router, 404 + error handler) and `server.js` (DB connect check, listen, graceful shutdown).
3. **Config**: `config/env.js` loads dotenv once (`quiet: true`) and validates every variable with zod. The server refuses to start with a clear message if something is missing. `config/database.js` reads from it. Add `.env.example`.
4. **Response layer**: `utils/apiResponse.js` (`sendSuccess`), `utils/ApiError.js`, `constants/common.constants.js` (`ERROR_CODES`, pagination defaults).
5. **Middlewares**: `validate.middleware.js` (zod body/params/query), `error.middleware.js` (envelope, no stack traces in production, maps Sequelize validation/unique errors), `rateLimit.middleware.js` (general + strict auth limiter), `auth.middleware.js` skeleton (filled in Phase 1).
6. **Pagination helper**: `utils/pagination.js` (page/pageSize/sortBy/sortOrder → limit/offset/order + `meta`).
7. **Database tooling**: sequelize-cli with `.sequelizerc`, `models/index.js` (loader + associations hook), first migration/seeder pipeline working (`npm run db:migrate`, `db:seed`, `db:reset`).
8. **Health endpoint**: `GET /api/v1/health` (uptime + DB status) as the reference module through every layer.
9. **Logging**: `pino` + `pino-http` (pretty in dev, JSON in production, request id per request).
10. **Quality**: ESLint + Prettier, Vitest + Supertest with a health test, `.nvmrc` (Node 22), commit `package-lock.json`.
11. **Cleanup**: delete v1 backend modules (controllers, models, routes, `controllers.zip`). v1 stays available on `main` for reference.

## Frontend tasks
1. **Structure**: create the folders from `05-project-structure.md` and add the `@/` alias.
2. **Config & constants**: `config/env.js`, `constants/common.constants.js`, `constants/routes.constants.js`.
3. **API layer**: `services/apiClient.js` (axios, token header, 401 handling, timeout) and `services/request.js` (`{ ok, data, meta, message, errors }` + Sonner toasts).
4. **App shell**: Redux store, `<Toaster />`, `AppRoutes.jsx`, `RoleRoute.jsx`, `PublicLayout`, `DashboardLayout`, 404 page, `ErrorBoundary`.
5. **Theme**: brand tokens (done), fonts loaded via `@fontsource`, base styles (page background, text colours, focus ring).
6. **P1 generic components**: Button, FormInput, Select, SearchInput, Card, Badge, Loader (Spinner/PageLoader/Skeleton), Modal, ConfirmDialog, EmptyState, DataTable + Pagination, PageHeader.
7. **Utils & hooks**: `utils/date.js`, `utils/number.js`, `utils/form.js` (zod issues → field errors), `hooks/useDebounce.js`, `hooks/useServerTable.js`.
8. **Showcase page**: `/dev/components` (dev builds only) renders every generic component and its states.
9. **Quality**: Prettier, lint clean on all new code, `.nvmrc`, `.env.example` (and stop committing `.env`).
10. **Cleanup**: delete v1 screens and components (they call v1 APIs that no longer exist). The home route shows a simple branded placeholder until Phase 2.

## Done when
- The backend starts only with a valid env, `GET /api/v1/health` returns the standard envelope, migrations run, and tests and lint pass.
- The frontend builds, lint passes, the showcase page shows all P1 components in their states, and calling `/api/v1/health` through `request()` works end to end.

## Decisions (confirmed 2026-11-26)
| Topic | Decision |
|---|---|
| v1 code | **Delete in Phase 0**. v1 stays on `main` for reference |
| Local database | Developer's **own MySQL** (no Docker). Connection via `.env` |
| Fonts | **Baloo 2** for headings and brand, **Noto Sans** for body/UI text (both via `@fontsource`, both support Devanagari) |
| Dark mode | **Light and dark from the start**. Default follows the **system setting**, with a Light / Dark / System toggle remembered per device |
| Backend modules | **CommonJS** |
| Code style (Prettier) | Double quotes, semicolons, 2-space indent, trailing commas, 100-char lines |
| Tests | **Set up now**: Vitest + Supertest (backend), Vitest + Testing Library (frontend) |
| Database | **MySQL 8** (8.4 LTS recommended), utf8mb4 / `utf8mb4_0900_ai_ci`. Not MariaDB |
| API prefix | **`/api/v1`** (versioned for the future mobile app) |
| Mobile readiness | The API follows the client compatibility rules in backend `docs/02-api-response-standard.md` |
| Frontend language | **JavaScript** (`.js`/`.jsx`) |
| Frontend `.env` | Removed from git and replaced by `.env.example`. Hosting sets `VITE_API_URL` |
| Home page until Phase 2 | Branded placeholder. Light / Dark / System toggle in the header (public + dashboard) |
