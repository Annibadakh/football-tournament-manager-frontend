# Brand

| Item | Value |
|---|---|
| Name | **Maidaan** (मैदान: "ground") |
| Domain | `maidaanapp.live` (planned) |
| Owner email | `maidaan.app@gmail.com` (account ownership and admin only, never for sending app emails) |
| App emails (planned) | `no-reply@`, `support@`, `hello@` on the app domain, sent via a transactional email provider |
| Instagram | `@maidaan.baller` |
| YouTube | `@maidaan.baller` |
| Logos | Finalized: dark lockup, light lockup, app icon. Files in `docs/brand/`, app copies in `src/assets/brand/` |
| Font | Baloo 2 (Latin + Devanagari) |

## Logo files
| File | Use |
|---|---|
| `maidaan-logo-dark.png` | Lockup on dark backgrounds (dark mode header, YouTube banner) |
| `maidaan-logo-light.png` | Lockup on light backgrounds (website header, emails, documents) |
| `maidaan-icon.png` (1024px) / `maidaan-icon.svg` | App icon, favicon, PWA icons, social profile pictures |

> The exported lockup PNGs show slightly shifted colours (`#008B43`, `#FB8726`) from colour-profile conversion. The **icon master values below are the source of truth**.
> To do: export the lockups as SVG from the design source to get sharp scaling and exact colours.

## Application colours (final)
Defined from the logo. Tailwind tokens live in `src/index.css` under `@theme`, giving `bg-brand-600`, `text-accent-700`, `border-ink-200`, `bg-live`, and so on.
Preview: `docs/brand/maidaan-palette.png`.

| Scale | Base | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **brand** (pitch green) | 600 | `#E8F5EE` | `#C7E7D4` | `#9DD4B4` | `#6BBE8F` | `#3DA56C` | `#1A8F50` | **`#0F7B3F`** | `#0C6533` | `#0A5029` | `#083E21` | `#052615` |
| **accent** (ball orange) | 500 | `#FEF3E8` | `#FDE2C6` | `#FAC795` | `#F7A95E` | `#F49A3F` | **`#F28C28`** | `#D9741A` | `#B45C13` | `#8C4711` | `#6B3710` | `#3D1E08` |
| **ink** (green-tinted neutral) | 950 | `#F5F7F6` | `#E9EDEB` | `#D3DAD6` | `#B3BDB8` | `#8A968F` | `#66736C` | `#4C5852` | `#38433D` | `#24302A` | `#16231C` | **`#0B1F17`** |

| State | Hex | Use |
|---|---|---|
| success | `#0F7B3F` | Success toasts and states (same as brand-600) |
| warning | `#B45309` | Warnings, yellow-card notices (text/icon). Badge background `#FEF3C7` |
| danger | `#DC2626` | Errors, delete actions, red cards |
| info | `#2563EB` | Informational messages |
| live | `#D42A3A` | **Only** for LIVE badges and live indicators |

### Usage rules
| Element | Light mode | Dark mode |
|---|---|---|
| Page background | `ink-50` | `ink-950` |
| Card / surface | white + `ink-200` border | `ink-900` + `ink-800` border |
| Body text / muted text | `ink-950` / `ink-500` | `ink-100` / `ink-300` |
| Primary button | `bg-brand-600 text-white`, hover `brand-700` | same |
| Accent button ("Watch live", key CTA) | `bg-accent-500 text-ink-950`, hover `accent-400` | same |
| Outline button | `border-brand-600 text-brand-700` | `border-brand-400 text-brand-300` |
| Links | `brand-600` | `brand-400` |
| Verified chip | `bg-brand-50 text-brand-700` | `bg-brand-900 text-brand-200` |
| Guest chip | `bg-ink-100 text-ink-600` | `bg-ink-800 text-ink-200` |
| Captain chip | `bg-accent-50 text-accent-700` | `bg-accent-900 text-accent-200` |
| Focus ring | `ring-brand-500` | `ring-brand-400` |

**Contrast rules (WCAG AA, checked)**
- Never put **white text on orange** (2.45) or **orange text on white** (2.45). Orange buttons use `ink-950` text (7.0). Orange text on light backgrounds uses `accent-700` (4.7).
- White on `brand-600` = 5.35 ✅, `ink-500` muted text on white = 4.96 ✅, white on `live` = 5.0 ✅.
- Use orange **sparingly**: one accent CTA per screen, highlights, and the "aa" in the wordmark. Green is the main colour.
