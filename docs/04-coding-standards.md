# Coding Philosophy & Standards (Frontend)

These rules apply to every v2 change. If a rule and "clever" code conflict, the rule wins.
The same philosophy applies to the backend (`football-tournament-manager-backend/docs/03-coding-standards.md`).

## Philosophy
1. Readability over clever code.
2. Reusability over duplication.
3. Separation of concerns.
4. Consistent naming conventions.
5. Explicit validation and error handling.
6. Small functions with a single responsibility.
7. Centralized configurations and constants.
8. Predictable API responses.
9. Database operations separated from business logic.
10. Avoid unnecessary abstractions.

## How it applies in the frontend

### 1. Readability over clever code
- Prefer clear `if`/early `return` over nested ternaries. Allow at most one ternary per JSX expression.
- No long chained one-liners. Break the logic into named variables.
- Keep JSX flat. Move a complex conditional block into a small sub-component.

### 2. Reusability over duplication
- When UI repeats a second time, it becomes a generic component (see 02).
- Repeated logic becomes a custom hook (`useXxx`) or a pure util.
- Never copy and paste a component to make a "v2 copy". Extend it with a prop.

### 3. Separation of concerns
| Layer | Responsibility | Must NOT |
|---|---|---|
| `pages/` | Route-level screen: composes components, owns page state | Call axios directly, hold reusable UI |
| `components/` | Presentational UI | Fetch data, know about routes or the API |
| `hooks/` | Reusable stateful logic (data fetching, debounce, table state) | Render UI |
| `services/` | API calls through the `request` wrapper (see 03) | Touch React state or show UI |
| `store/` | Redux slices (shared state) | Make API calls inside reducers |
| `validations/` or `*.schema.js` | zod schemas | Contain UI logic |
| `utils/` | Pure helpers (date, number, string) | Have side effects |

### 4. Naming conventions
| Thing | Convention | Example |
|---|---|---|
| Component file and name | PascalCase | `TeamCard.jsx` |
| Hook | camelCase starting with `use` | `useDebounce.js` |
| Service | `<entity>.service.js` | `team.service.js` |
| Schema | `<entity>.schema.js`, exported as `<entity>Schema` | `teamSchema` |
| Redux slice | `<entity>Slice.js` | `authSlice.js` |
| Util / plain JS file | camelCase | `formatDate.js` |
| Variables / functions | camelCase, verb-first for functions | `fetchTeams`, `isLoading` |
| Booleans | `is/has/can/should` prefix | `isApproved`, `canEdit` |
| Event handlers | `handle<Event>`; props are `on<Event>` | `handleSubmit` / `onSubmit` |
| Constants | UPPER_SNAKE_CASE | `MATCH_STATUS`, `API_ROUTES` |
| Folders | kebab-case for multi-word names | `match-details/` |
| Routes (URLs) | kebab-case | `/dashboard/match-details/:matchId` |

No file names with spaces (for example the current `PointsTable .jsx`) and no misspellings (`Comittee`). Fix these when a file is touched.

### 5. Explicit validation & error handling
- Every form is validated with its zod schema before submit, and field errors are shown inline.
- Every API call goes through `request()`, which never throws. Components handle `res.ok` explicitly.
- No silent `catch {}` and no `console.log` left in committed code. `alert()` and `window.confirm` are not allowed.
- Handle the loading, empty and error states for every data view.

### 6. Small functions, single responsibility
- Aim for functions under ~30 lines and components under ~150 lines. Split anything larger.
- Each function does one thing. Its name says what that is.

### 7. Centralized configuration & constants
- `src/config/env.js` is the only place that reads `import.meta.env`.
- `src/constants/` holds roles, match statuses, stages, API route paths, route paths, date formats and the page-size options.
- No magic strings or numbers in components (`"admin"`, `30000`, `"started"` → constants).

### 8. Predictable API responses
- All responses follow the envelope in 03. Components read only `res.data`, `res.meta`, `res.message` and `res.errors`.

### 9. Data access separated from UI logic
- Components never build URLs or call axios. They call service functions, and the services call `request()`.

### 10. Avoid unnecessary abstractions
- Do not create a component, hook or util until it is needed at least twice (the generic component list in 02 is the agreed exception).
- No wrapper-around-a-wrapper and no premature generic "factory" helpers.
- Plain React state is fine. Use Redux only for genuinely shared state.

## Comments
Comments are **short, meaningful, one line**. They explain **why** (or a non-obvious *what*), never repeat the code.

```js
// Debounce so typing doesn't fire a request per keystroke
const debouncedSearch = useDebounce(search, 400);

// Backend returns goals as strings for old matches
const goals = Number(match.totalGoalsTeam1);
```
Avoid:
```js
// set loading to true
setIsLoading(true);
```
- No commented-out code blocks. Git keeps the history.
- `// TODO:` must say what is left to do, for example `// TODO: switch to socket updates`.

## Tooling (to be set up)
- ESLint (already configured) plus Prettier for formatting. Lint must pass on new and changed files.
