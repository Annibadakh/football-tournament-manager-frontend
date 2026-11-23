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
| `validations/` | zod schemas, `<module>.schema.js` | Contain UI logic |
| `constants/` | Per-module constants, enums and label maps | Import React or components |
| `utils/` | Pure helpers (date, number, string) | Have side effects |

### 4. Naming conventions
| Element | Convention | Example |
|---|---|---|
| Folders | kebab-case | `team-management/` |
| Files | camelCase or kebab-case, with a dotted layer suffix | `team.service.js`, `matchUtils.js` |
| Variables | camelCase | `teamId` |
| Functions | camelCase | `createTeam()` |
| Classes | PascalCase | `TeamService`, `ApiError` |
| Constants | UPPER_SNAKE_CASE | `MAX_TEAM_SIZE` |
| Database tables | snake_case | `tournament_teams` |
| Database columns | snake_case | `created_at` |
| API endpoints | kebab-case, plural resource nouns | `/api/team-members` |
| Boolean variables | `is` / `has` / `can` prefix | `isActive` |
| React components | PascalCase file and name (React convention) | `TeamCard.jsx` |
| Hooks | `use` prefix | `useDebounce.js` |
| Event handlers | `handle<Event>`; props are `on<Event>` | `handleSubmit` / `onSubmit` |

#### Function naming
Names must say **what** the function does and **to what**. No generic names.

| Avoid | Prefer |
|---|---|
| `getData()` | `getTournamentDetails()` |
| `processData()` | `calculateMatchPoints()` |
| `update()` | `updateTeamDetails()` |
| `check()` | `isRegistrationOpen()` |
| `handle()` | `handleMatchCompletion()` |

**Use verbs consistently:**
| Verb | Meaning | Example |
|---|---|---|
| `get` | Retrieve data (by id, or a list) | `getMatchById()`, `getTeamsByTournament()` |
| `find` | Search for a record that may not exist | `findUserByEmail()` |
| `create` | Create a record | `createTournament()` |
| `update` | Modify a record | `updateMatchStatus()` |
| `delete` | Delete a record | `deletePlayer()` |
| `is` / `has` | Boolean checks | `isMatchLive()`, `hasPaidEntryFee()` |
| `calculate` | Perform calculations | `calculateGoalDifference()` |
| `validate` | Validate data | `validateMatchSchedule()` |

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
- Constants are **centralized per module**: one file per module in `src/constants/`, for example `match.constants.js`, `team.constants.js`, `user.constants.js`, plus `common.constants.js` for cross-module values. Never define a status or role inline in a component, hook or service.
- Enumerations use **numeric codes**, frozen and grouped in one object. Always compare against the constant, never a raw number or string:
```js
// Numeric codes are stored in the DB; never compare against raw numbers
const MATCH_STATUS = Object.freeze({
  SCHEDULED: 1,
  LIVE: 2,
  COMPLETED: 3,
  CANCELLED: 4,
});

if (match.status === MATCH_STATUS.COMPLETED) {
  // ...
}
```
- Numeric codes **mirror the backend** exactly (the backend constants are the source of truth). When a code changes in the backend, update the matching frontend file in the same feature.
- UI-only data lives next to the enum in the same file. That means label and Badge variant maps, for example `MATCH_STATUS_LABEL = { [MATCH_STATUS.LIVE]: "Live" }`.
- `common.constants.js` holds page-size options, date formats and polling intervals. `routes.constants.js` holds the app route paths.
- No magic strings or numbers in components (`"admin"`, `30000`, `"started"` → constants).

### 8. Predictable API responses
- All responses follow the envelope in 03. Components read only `res.data`, `res.meta`, `res.message` and `res.errors`.

### 9. Data access separated from UI logic
- Components never build URLs or call axios. They call service functions, and the services call `request()`.

### 10. Avoid unnecessary abstractions
- Do not create a component, hook or util until it is needed at least twice (the generic component list in 02 is the agreed exception).
- No wrapper-around-a-wrapper and no premature generic "factory" helpers.
- Plain React state is fine. Use Redux only for genuinely shared state.

## Async code
- Use **async/await everywhere**. Do not mix in `.then()` chains or callbacks.
- Run independent requests in parallel with `Promise.all`, and never fetch inside a loop (`map` + `await`). Ask the backend for one endpoint that returns the related data instead (avoid N+1 API calls).
- Cancel or ignore stale requests when the component unmounts or the inputs change (`AbortController`).

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
