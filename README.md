# Community App

A simple society/community management application with authentication, notices, issues tracking, staff management, and maintenance records.

## Features
- Authentication with email/password (JWT based)
- Roles: TENANT, OWNER, SECRETARY, STAFF
- Notices board (public list, secretary can post)
- Issues tracking (create/list, workers take/resolve, secretary admin)
- Staff directory (list, add, toggle duty — secretary only)
- Maintenance records (create/list — secretary only)

## Tech Stack
- Frontend: React 18, Vite, MUI, TailwindCSS, Axios, React Router
- Backend: Node.js, Express, CORS, JSON Web Tokens
- Database: PostgreSQL via Prisma ORM (migrations + client)
- Deployment: Vercel (frontend), Render (backend)

## Monorepo Structure
```
.
├─ frontend/           # Vite React app
│  ├─ src/
│  ├─ vite.config.js   # dev proxy to backend in local
│  └─ vercel.json      # rewrite for SPA routing on Vercel
└─ backend/            # Express API + Prisma
   ├─ src/
   ├─ prisma/
   │  ├─ schema.prisma
   │  ├─ migrations/   # tracked migrations
   │  └─ seed.js       # optional seed data
   └─ package.json
```

## Local Development

### Prerequisites
- Node.js (LTS recommended)
- A PostgreSQL database (local or cloud). You can also use a Docker Postgres.

### Environment variables

Create `backend/.env` (see `backend/.env.example`). Minimum required:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require"
JWT_SECRET="change_me"
```

Optionally for seeding:
```
SEED_USER_PASSWORD="password"
```

Frontend (optional for production builds on Vercel):
```
VITE_API_BASE_URL=https://community-app-kuzg.onrender.com
```

### Start backend
```
cd backend
npm install
npx prisma generate
# First time: create schema (choose one)
# npx prisma migrate dev --name init   # with migrations history
# or
# npx prisma db push                   # quick bootstrap without history
npm run dev                            # starts on http://localhost:4000
```

### Start frontend
```
cd frontend
npm install
npm run dev                            # http://localhost:5173
```

Vite dev proxy forwards `/api/*` to `http://localhost:4000` (configure in `frontend/vite.config.js`).

## Seeding the Database
Seed script wipes tables and inserts sample users (SECRETARY/OWNER/TENANT).
```
cd backend
npx prisma db seed
```
Password used is taken from `SEED_USER_PASSWORD` or `DEFAULT_USER_PASSWORD` (fallback: `password`).

## Deployment

### Frontend (Vercel)
- Project Root: `frontend`
- Install: `npm install`
- Build: `npm run build`
- Output: `dist`
- Rewrites: `frontend/vercel.json` contains `/(.*) -> /` to fix SPA refresh 404s
- Env: `VITE_API_BASE_URL=https://community-app-kuzg.onrender.com`

### Backend (Render Web Service)
- Root Directory: `backend`
- Environment vars:
  - `DATABASE_URL` = Render Postgres connection string
    - Prefer Internal connection string for the web service
  - `JWT_SECRET` = strong random value
- Build Command: `npm ci && npx prisma generate`
- Start Command: `npx prisma migrate deploy && node src/server.js`

If first-time schema fails to apply via `migrate deploy`, you can bootstrap once with `npx prisma db push` and then revert to `migrate deploy` for subsequent deploys.

## API Quick Test (Postman/curl)
Base URL (prod): `https://community-app-kuzg.onrender.com`

- Health: `GET /api/health`
- Register: `POST /api/auth/register`
  ```json
  { "email": "owner@example.com", "name": "Owner", "password": "password123", "role": "OWNER", "block": "B", "flatNo": "202" }
  ```
- Login: `POST /api/auth/login`
  ```json
  { "email": "owner@example.com", "password": "password123" }
  ```
- Protected routes require `Authorization: Bearer <token>`

## Roadmap / Future Features
- Google OAuth login flow
- File uploads for issue images and user photos
- Notifications (email/push) for new notices and issue updates
- Payments integration for maintenance dues
- Admin dashboard with analytics
- RBAC hardening and audit logs

## License
MIT (or your preferred license)
