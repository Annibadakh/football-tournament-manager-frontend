# Generic Components

Shared, reusable UI building blocks live in `src/components/ui/` (layout pieces in `src/components/layout/`).
**Status:** all P1 components are built (Phase 0). Try them at `/dev/components` (dev builds only), and the dashboard shell at `/dev/dashboard`.
Form controls share `FieldWrapper` (label + bordered box + error/helper text). The table pairs `DataTable` with the `useServerTable()` hook.
Every screen composes these instead of re-styling raw HTML elements.

**Rules for all components**
- Styling uses Tailwind only, with theme tokens (`bg-primary`, `text-secondary`, …). No inline style objects except for dynamic values.
- Icons come from lucide-react only.
- Every component accepts `className` (merged last) and forwards other native props (`...rest`).
- Form controls share one contract. They take `name`, `label`, `value`, `onChange(name, value)`, `error`, `required`, `disabled` and `helperText`, so they plug straight into the shared form `handleChange` and the zod error map.
- Accessibility: every control has a `label`/`htmlFor` pair, `aria-invalid` plus `aria-describedby` when there is an error, keyboard support for Modal/Select/Tabs, and focus rings.
- Each component lives in its own file and has a default export.

> Reference: the Dnyanganga Education frontend (`src/Dashboard/Generic/`): Button, TextField, SelectField, CustomSelect,
> CustomMultiSelect, DateField, DataTable, Pagination, ImagePreview, ImageViewerModal. We follow those patterns and clean them up.

**Priority:** P1 = build first, as the foundation for all forms and lists. P2 = build when the first feature needs it. P3 = build as development goes.

## Actions
| Component | Priority | Key props / behaviour |
|---|---|---|
| **Button** | P1 | `variant` (`primary, secondary, success, danger, warning, outline, ghost`), `size` (`sm, md, lg`), `type="button"` by default, `loading` (spinner overlay, keeps the button's width, disables it), `disabled`, `fullWidth`, `startIcon`, `endIcon` |
| **IconButton** | P2 | Icon-only button for table row actions. Required `aria-label`, plus `variant`, `size`, `loading` and a tooltip `title` |

## Form controls
| Component | Priority | Key props / behaviour |
|---|---|---|
| **FormInput** | P1 | Label and input combined into one design unit, with an error message below. Props: `type`, `placeholder`, `startIcon`, `endIcon`, plus a password show/hide toggle when `type="password"` |
| **Textarea** | P2 | Same contract as FormInput, plus `rows` and an optional `maxLength` counter |
| **Select** | P1 | Single select. Props: `options=[{ label, value }]`, `placeholder`, `searchable` (filters options client-side), `clearable`, `loading`. Custom dropdown, keyboard navigable |
| **MultiSelect** | P3 | Same as Select, but the value is an array and selected items show as chips |
| **SearchInput** | P1 | Search icon, clear (X) button and a **debounced** `onSearch(value)` (default 400 ms). It drives the server-side search in DataTable |
| **Checkbox / Switch** | P2 | Boolean control (`checked`, `onChange(name, bool)`). Switch is used for toggles such as team approval |
| **RadioGroup** | P3 | `options` plus single value, for example the tournament type |
| **DateInput / TimeInput** | P2 | Native date and time inputs. The value is an ISO string, and date-fns formats it for display. Props: `min`, `max` |
| **FileUpload / ImageUpload** | P2 | Pick or drag an image, preview it, validate type and size on the client, show upload progress. Returns a `File` (the backend processes it with sharp) |
| **FormSection / FormGrid** | P2 | Layout helpers: a titled section, and a responsive 1–3 column grid for forms |

## Data display
| Component | Priority | Key props / behaviour |
|---|---|---|
| **DataTable** | P1 | Wraps TanStack Table in **server-side** mode (`manualPagination`, `manualSorting`, `manualFiltering`). Props: `columns`, `data`, `total`, `state`, `onStateChange` (page, pageSize, sorting, search), `loading` (skeleton rows), `emptyState`, `toolbar` slot (SearchInput plus filters), and row actions. Sticky header, horizontal scroll on mobile |
| **Pagination** | P1 | Used by DataTable. Shows page numbers, prev/next, a page-size select and "Showing x–y of total" |
| **Card** | P1 | Container with optional `header`, `title`, `actions` and `footer`. Used for tournament, team, match and stats cards |
| **StatCard** | P3 | Dashboard KPI tile: icon, label, value (formatted with `Intl.NumberFormat`) and an optional trend |
| **Badge** | P1 | `variant` (`success, danger, warning, info, neutral, live`) and `size`. Used for match status (`live` variant pulses), approval status and stage. Includes a `statusToVariant` map helper |
| **Avatar** | P2 | Shows the image, or initials when there is none. Sizes: team logo, player photo |
| **Tabs** | P2 | Controlled tabs (`items`, `value`, `onChange`) for match details, team page and similar screens |
| **EmptyState** | P1 | Icon, title, description and an optional action button |
| **ScoreBoard** | P3 | Domain component: team logos and names, score, status badge and match clock. Shared by the live page and the scorer dashboard |

## Feedback & overlays
| Component | Priority | Key props / behaviour |
|---|---|---|
| **Loader** | P1 | `Spinner` (inline, `size`), `PageLoader` (full area) and `Skeleton` (block or line placeholders) |
| **Modal** | P1 | `open`, `onClose`, `title`, `size` (`sm, md, lg, full`), `footer`. Rendered through a portal, closes on Esc or overlay click (configurable), traps focus and locks body scroll |
| **ConfirmDialog** | P1 | Built on Modal: `title`, `message`, `confirmText`, `variant="danger"`, `loading`, `onConfirm`. Replaces `window.confirm` |
| **Toaster** | P1 | sonner `<Toaster />` mounted once in `App`. The API wrapper triggers toasts (see 03) |
| **Tooltip** | P3 | Hover or focus hint for icon buttons |
| **ErrorBoundary** | P2 | Catches render errors and shows a fallback with a "Reload" button |

## Layout & navigation
| Component | Priority | Key props / behaviour |
|---|---|---|
| **PublicLayout** | P1 | Header, `<Outlet />` and Footer for the public pages |
| **DashboardLayout** | P1 | Header, collapsible Sidebar (links filtered by role) and `<Outlet />` |
| **PageHeader** | P1 | Page title, optional breadcrumb or subtitle, and an actions slot (for example an "Add Team" button) |
| **RoleRoute** | P1 | Route guard: `allowedRoles`. Redirects to `/login` when there is no session and to an unauthorized page when the role is wrong |

More components will be added as features need them. Update this file when one is added or its API changes.
