# API Response Contract & Frontend Request Wrapper (Planning)

The goal is one predictable response shape from the backend and one place in the frontend that turns it into data and a toast message.
The same contract is documented in `football-tournament-manager-backend/docs/02-api-response-standard.md`.

> Reference: the Dnyanganga Education frontend uses one axios instance with a token interceptor and a 401 redirect
> (`src/Api.jsx`), a `useToast` hook, and `{ success, message, data }` responses. However, every component re-checks
> `res.data.success` and calls `alert()` itself. v2 centralizes that.

## Response shape (from backend)

```jsonc
// success
{ "success": true,  "message": "Team created", "data": { ... }, "meta": { "page": 1, "pageSize": 10, "total": 42, "totalPages": 5 } }

// error
{ "success": false, "message": "Validation failed", "code": "VALIDATION_ERROR",
  "errors": [{ "field": "teamName", "message": "Team name is required" }] }
```
- `meta` is present only on paginated list endpoints.
- `errors` is present only for validation errors, and its entries map onto form fields.
- `code` is a stable machine-readable string (`VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`).

## Server-side table queries
Requests send `?page=1&pageSize=10&sortBy=teamName&sortOrder=asc&search=abc&<filterKey>=<value>`.
Responses return rows in `data` and pagination in `meta`. This maps directly onto TanStack Table's `pagination`, `sorting` and `globalFilter` state.

## Frontend layers (planned)
1. **`apiClient`**: a single axios instance. It reads `baseURL` from `VITE_API_URL`, attaches the Bearer token safely (no crash when logged out), and on `401` clears the session and redirects to `/login`.
2. **`request(config, options)`**: the central wrapper used by every call. `config` is an axios request config (`{ method, url, params, data, signal }`), which lets it pick toast defaults from the method.
   - It returns `{ ok, data, meta, message, errors }` and never throws to the component.
   - Options: `successToast` (default: off for GET and on for mutations, using the backend `message`), `errorToast` (default on), and `loadingToast` (uses `toast.promise`).
   - It normalizes network errors, timeouts and non-standard bodies into the same shape.
3. **Feature services** (`services/team.service.js`, …): thin functions such as `getTeams(params)` and `createTeam(body)` that call `request`.

Example use in a form:
```js
const res = await createTeam(values);
if (!res.ok) { setErrors(toFieldErrors(res.errors)); return; }
navigate("/dashboard/teams");
```

## Session and token refresh (Phase 1)
- The access token lives in Redux memory only. The refresh token is an httpOnly cookie the browser sends to `/api/v1/auth/*`.
- On app load, `SessionBootstrap` calls `POST /auth/refresh` once to restore the session.
- On any 401, `apiClient` calls `refreshSession()` once (shared by parallel requests) and replays the original request. If the refresh fails, the session is cleared and guards redirect to `/login`.
- Auth calls pass `skipAuthRefresh: true` so they never loop.
- Uploads: `uploadFile(file, purpose)` gets a presigned POST from `/uploads`, then posts the file directly to S3 with plain axios (no auth header or cookies), and returns the object key.
