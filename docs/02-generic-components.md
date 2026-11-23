# Generic Components (Planning)

Shared, reusable UI building blocks live in `src/components/ui/` (final folder structure still to be decided).
Every screen should compose these instead of re-styling raw HTML elements.
Styling uses Tailwind only, and icons come from lucide-react.

> The reference implementation is the Dnyanganga Education frontend (`src/Dashboard/Generic/`).
> We follow its patterns and clean them up.

## Agreed so far

### Button
- Props: `variant` (`primary | secondary | success | danger | warning | outline | ghost`), `size` (`sm | md | lg`),
  `type` (default `"button"`), `loading`, `disabled`, `fullWidth`, `startIcon`, `endIcon`, `className`, `onClick`, `children`.
- When `loading` is set, a spinner overlays the label, the button keeps its width, and the button is disabled.
- Forwards any other native button props (`...rest`).

### FormInput (Label + Input combined)
- Renders a label and input as one design unit, plus an error message slot under it.
- Props: `id`/`name`, `label`, `type`, `value`, `onChange(name, value)` (fits the shared form `handleChange`), `placeholder`,
  `error` (string from the zod error map), `required` (shows `*`), `disabled`, `startIcon`, `helperText`, `className`.
- Shows a red border plus the error text when `error` is set. The `aria-invalid` and `aria-describedby` attributes are wired up.

## To be decided (next discussion)
- Select / multi-select, textarea, checkbox/switch, date and time input (date-fns), file and image upload with preview
- Modal / confirm dialog, Card, Badge (match status), Loader / Skeleton, EmptyState
- DataTable (TanStack, server-side) and Pagination
- Layouts: public layout, dashboard layout (header + sidebar), role-based route guard
