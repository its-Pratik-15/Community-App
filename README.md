# Community App

## Stack
- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express + Nodemon
- Database: PostgreSQL with Prisma ORM
- Auth: JWT and OAuth 2.0 (Google)

## Setup

### Prerequisites
- Node.js LTS
- PostgreSQL running and a database created

### Backend
```
cd backend
npm install
npx prisma generate
npm run dev
```

Create `backend/.env` from `backend/.env.example` and set `DATABASE_URL`, `JWT_SECRET`, OAuth keys.

### Frontend
```
cd frontend
npm install
npm run dev
```

Open the dev server URL from the terminal.
