# Frontend setup

The full environment guide (database, backend `.env`, seed data, superadmin, first data) is in the backend repo: `football-tournament-manager-backend/docs/06-setup-guide.md`.

## `.env`
Copy `.env.example` to `.env`:

| Variable | Example | Notes |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api/v1` | Backend URL **including** `/api/v1`. Must match the backend `PORT`. Production: `https://api.maidaanapp.live/api/v1`. Baked in at build time, so rebuild after changing it |

The frontend has no other secrets:
- Google Places goes through the backend.
- The Razorpay key id comes from the payment-order response.
- S3 uploads use presigned URLs from the backend.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```
The backend's `CORS_ORIGINS` and `APP_URL` must contain this app's origin (e.g. `http://localhost:5173`).
