# Zuna CRM

Zuna CRM is a full-stack customer relationship management platform built as a monorepo with a React frontend and an Express + TypeScript backend. It supports authentication, role-based access, customer and lead tracking, task management, sales workflows, and staff-focused dashboards.

## Highlights

- Role-based CRM experience for admins, managers, and staff
- Customer, lead, company, contact, deal, task, note, and activity management
- JWT-based authentication with refresh flow, email verification, and password reset
- Dashboard metrics and recent activity views
- Supabase-backed data layer with SQL migrations and seed support
- Tested backend routes/services and frontend component test setup

## Tech Stack

**Frontend**
- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand

**Backend**
- Node.js
- Express
- TypeScript
- Supabase
- Zod
- Jest

## Repository Structure

```text
.
├── backend/     # Express API, migrations, tests, Docker setup
├── frontend/    # React application built with Vite
├── package.json # Root workspace scripts
└── README.md
```

## Core Features

- Authentication: login, token refresh, logout, forgot password, reset password, email verification
- CRM entities: customers, leads, companies, contacts, deals, notes, tasks, activities
- Team workflows: staff management, role-based route protection, personal staff portal pages
- Operational safety: rate limiting, request tracing, structured logging, CORS controls, health checks

## Getting Started

### Prerequisites

- Node.js 22+
- npm
- A Supabase project

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

Backend:

```bash
cp backend/.env.example backend/.env
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

Update the values in both files before starting the app.

### 3. Apply database migrations

Run the SQL files in `backend/supabase/migrations/` in order:

1. `001_init.sql`
2. `002_auth_tokens.sql`
3. `003_production_schema.sql`
4. `004_rls_policies.sql`
5. `005_mvp_schema.sql`

### 4. Seed the database

```bash
cd backend
npm run seed
```

### 5. Start the development servers

From the repo root:

```bash
npm run dev
```

This starts:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

## Environment Variables

### Backend

The backend requires values such as:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `NODE_ENV`
- `PORT`

Optional email settings are also supported for verification and password reset flows.

### Frontend

- `VITE_API_URL` defaults to `http://localhost:3001/api`

## Available Scripts

### Root

- `npm run dev` - run frontend and backend together
- `npm run dev:backend` - run only the backend
- `npm run dev:frontend` - run only the frontend
- `npm run install:all` - install dependencies in all workspaces

### Backend

- `npm run start:dev`
- `npm run build`
- `npm run seed`
- `npm test`
- `npm run lint`

### Frontend

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm test`
- `npm run lint`

## API and App Modules

The backend exposes routes for:

- `/api/auth`
- `/api/users`
- `/api/customers`
- `/api/leads`
- `/api/tasks`
- `/api/activities`
- `/api/dashboard`
- `/api/companies`
- `/api/contacts`
- `/api/deals`
- `/api/notes`
- `/api/custom`

Health endpoints:

- `/health/live`
- `/health/ready`

## Docker

A production-oriented backend Docker setup is included in [`backend/docker-compose.yml`](/home/nerupu-navin/crm/backend/docker-compose.yml:1).

```bash
cd backend
docker compose up --build
```

## Additional Notes

- The frontend contains separate admin and staff experiences.
- The backend validates environment variables at startup and enforces stronger JWT secret requirements.
- More detailed service-level setup is available in [`backend/README.md`](/home/nerupu-navin/crm/backend/README.md:1) and [`frontend/README.md`](/home/nerupu-navin/crm/frontend/README.md:1).
