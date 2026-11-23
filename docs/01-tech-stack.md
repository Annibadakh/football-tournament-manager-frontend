# Tech Stack & Library Rules (Frontend)

Status: packages installed on `version-2` (2026-11-23). The new libraries are **installed only**. They are not wired into the code yet.

## Core versions

| Package | Old | New | Notes |
|---|---|---|---|
| react / react-dom | 18.3.1 | 19.3.x | React 19 |
| react-router-dom | 7.2.0 | 7.18.x | |
| vite | 6.0.5 | 8.3.x | Rolldown-based bundler |
| @vitejs/plugin-react | 4.3.4 | 6.3.x | |
| tailwindcss | 3.4.17 | 4.3.x | Uses `@tailwindcss/vite` (see below) |
| axios | 1.8.1 | 1.21.x | |
| jspdf / jspdf-autotable | 3.0.1 / 5.0.2 | 4.2.x / 5.0.x | Points-table PDF export |
| lucide-react | 0.487 | 1.78.x | |
| eslint / @eslint/js | 9.17 | **9.39.x** | Kept on v9: `eslint-plugin-react` does not support ESLint 10 yet |
| eslint-plugin-react-hooks | 5.0 | 7.1.x | Adds new React Compiler rules (`immutability`, `set-state-in-effect`) |
| eslint-plugin-react-refresh / globals | 0.4 / 15 | 0.5.x / 17.x | |

Removed: `dotenv` (Vite loads `.env` itself), `autoprefixer`, `postcss` (Tailwind 4 handles prefixing).

### Tailwind 4 migration (done)
- `tailwind.config.js` and `postcss.config.js` were deleted. The theme now lives in `src/index.css` under `@theme`.
  Custom names are unchanged: `bg-primary`, `text-secondary`, `shadow-custom`, `font-custom`, etc.
- Class names were auto-migrated with `@tailwindcss/upgrade` (for example `shadow` → `shadow-sm`, `rounded` → `rounded-sm`, `flex-shrink-0` → `shrink-0`).
- A compatibility block in `index.css` keeps the v3 default border color.
- To add a theme token, add `--color-<name>` / `--font-<name>` inside `@theme`. Do not create a JS config.

### Known lint debt (pre-existing code)
`npm run lint` reports about 48 issues in the existing code: unused vars, missing prop-types, and the new react-hooks 7 rules.
The v2 refactor fixes these as files are rewritten. New code must lint clean.

## New libraries and how we use them

| Concern | Library | Rule |
|---|---|---|
| Validation | **zod** (v4) | One schema per form/entity in `*.schema.js`, next to the feature. Frontend schemas are **separate** from the backend's (each repo owns its own), and they exist for user experience and instant feedback. The backend re-validates everything. Validate on submit with `schema.safeParse(values)` and map `error.issues` to a `{ field: message }` object. Do not hand-write validation `if` chains. |
| Forms | **React state (no React Hook Form)** | Use `useState` for the form values object, one generic `handleChange(name, value)`, an `errors` state, a `submitting` state, and an `onSubmit` that validates with zod and then calls the API. Do not add React Hook Form / Formik. |
| Icons | **lucide-react** | The only icon library. Import named icons: `import { Trophy } from "lucide-react"`. No react-icons or inline SVG icon packs. |
| Dates & times | **date-fns** (v4) | All parsing, formatting and arithmetic (`format`, `parseISO`, `differenceInMinutes`, `isBefore`…). No moment or dayjs, and no manual string slicing of dates. Keep format strings in one shared `utils/date.js`. |
| Numbers | **Built-in JS** | Use `Intl.NumberFormat` (for example `new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })`), `Number()`, `toFixed`, `Math.*`. No number library. Put shared formatters in `utils/number.js`. |
| State | **React Context + Redux Toolkit** (`@reduxjs/toolkit`, `react-redux`) | **Context** holds small, rarely-changing app-wide values (theme, auth session provider). **Redux Toolkit** holds shared, frequently-updated or cross-page state (tournaments, live match state, user/session data used in many places). Use `createSlice` and typed-style selectors. Do not use raw `createStore`. Local UI state stays in `useState`. |
| Toasts | **sonner** | Mount one `<Toaster />` at the app root. Call `toast.success / error / info / promise`. Toasts are triggered by the API wrapper (see 03), so most components never call `toast` directly. Replaces all `alert()` calls. |
| Data tables | **@tanstack/react-table** (v9) | Headless. It is wrapped once in a generic `DataTable` component. **Server-side operations**: `manualPagination`, `manualSorting` and `manualFiltering` are all `true`. The table state (page, pageSize, sort, search) is sent to the API, and the API returns rows plus `meta.total`. See 03 for the query and response shape. |
| HTTP | **axios** | Only through the shared client and wrapper (see 03). Do not import axios directly in components. |
| Router | **react-router-dom** | Unchanged. |
| PDF | **jspdf + jspdf-autotable** | Unchanged. |
