# Project Structure (Frontend)

Decision: **layer folders**, matching the backend. Folders use kebab-case and component files use PascalCase.
Status: target structure for v2. Existing files move into it as each screen is rewritten.

```
src/
├── main.jsx                   # Mounts App with providers (Redux, Auth, Toaster)
├── App.jsx                    # Providers + <AppRoutes />
├── index.css                  # Tailwind import + @theme tokens
├── assets/
│   └── images/                # Moved from Components/Images + tournament.png (compressed)
├── config/
│   └── env.js                 # Only reader of import.meta.env
├── constants/                 # Per-module constants mirroring backend codes (see 04 › rule 7)
│   ├── common.constants.js    # Page sizes, date formats, polling intervals
│   ├── routes.constants.js    # App route paths
│   ├── user.constants.js      # ROLES
│   ├── tournament.constants.js
│   ├── team.constants.js
│   ├── player.constants.js
│   └── match.constants.js     # MATCH_STATUS + labels + badge variants
├── services/
│   ├── apiClient.js           # axios instance: baseURL, token, 401 handling
│   ├── request.js             # Central wrapper → { ok, data, meta, message, errors } + toasts
│   └── <module>.service.js
├── store/
│   ├── index.js               # configureStore
│   └── slices/<module>Slice.js
├── context/
│   └── AuthContext.jsx
├── hooks/                     # useDebounce, useServerTable, usePolling, ...
├── utils/                     # date.js (date-fns), number.js (Intl), form.js (zod → field errors)
├── validations/<module>.schema.js
├── routes/
│   ├── AppRoutes.jsx          # All route definitions (moved out of App.jsx)
│   └── RoleRoute.jsx          # Replaces ProtectedRoute.jsx and enforces roles
├── layouts/
│   ├── PublicLayout.jsx       # From Components/Main.jsx
│   └── DashboardLayout.jsx    # From Dashboard/Dashboard.jsx
├── components/
│   ├── ui/                    # Generic components (see 02)
│   ├── layout/                # Header, Sidebar, Footer, DashboardHeader
│   └── match/, team/, tournament/  # Domain components (ScoreBoard, TeamCard, ...)
└── pages/
    ├── public/                # home/, committee/, tournaments/, team-details/, matches/, live-match/, points-table/, login/
    └── dashboard/             # home/, tournaments/, teams/, players/, matches/, scorer/, match-details/, users/
```

## Changes from the current code
| # | Change | Reason |
|---|---|---|
| 1 | `Components/` and `Dashboard/` split into `pages/` (screens), `components/` (reusable) and `layouts/` | Separation of concerns |
| 2 | Lowercase/kebab-case folders (`Components/` → `components/`, `Context/` → `context/`) | Naming conventions |
| 3 | `Api.jsx` → `services/apiClient.js` + `request.js` + module services | Centralized API layer that never crashes when logged out |
| 4 | Routes move out of `App.jsx` into `routes/`, and `RoleRoute` enforces `allowedRoles` | Today any logged-in role can open any dashboard URL |
| 5 | Add `config/`, `constants/`, `store/`, `hooks/`, `utils/`, `validations/` | Matches the standards in 04 |
| 6 | Images move to `assets/images/` and are compressed (`rishi.jpg` alone is 5.9 MB) | Page load speed |
| 7 | `@/` import alias → `src/` in `vite.config.js` | No `../../../` imports |
| 8 | Fix `PointsTable .jsx` (space in name) and `Comittee` | Naming |
| 9 | Remove committed `.env` and add `.env.example` | Env hygiene |
| 10 | Remove unused files (`LiveCommentary`/`TeamOperations` are replaced by the match-events feature) | Dead code |
