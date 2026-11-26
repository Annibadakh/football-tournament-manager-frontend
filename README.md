# Maidaan Frontend

Web app for the Maidaan football tournament platform (React 19, Vite 8, Tailwind 4, Redux Toolkit).
Project documentation lives in [`docs/`](./docs/README.md). Brand and colours: [`docs/07-brand.md`](./docs/07-brand.md).

## Setup
1. Install Node 22 (`.nvmrc`).
2. Copy `.env.example` to `.env` and set `VITE_API_URL` (for example `http://localhost:5000/api/v1`).
3. `npm install`, then `npm run dev` and open http://localhost:5173.

In development, `/dev/components` shows every generic component and `/dev/dashboard` previews the dashboard shell. Neither is included in production builds.

## Scripts
| Script | Purpose |
|---|---|
| `npm run dev` / `npm run build` / `npm run preview` | Develop / production build / preview the build |
| `npm test` | Vitest + Testing Library |
| `npm run lint` / `npm run format` | ESLint / Prettier |

## Deployment
Set `VITE_API_URL` in the hosting provider's environment settings. `public/_redirects` sends all routes to `index.html` (Netlify SPA routing).
