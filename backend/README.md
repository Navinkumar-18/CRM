# Zuna CRM Backend

Express + TypeScript API with Supabase (PostgreSQL), custom JWT auth, role-based access control, and structured logging.

## Prerequisites

- Node.js 22+
- Supabase project (or local Postgres with the schema applied)

## Quick Start

```bash
# 1. Install dependencies
npm ci

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Run database migrations
# Run each migration file from supabase/migrations/ in your Supabase SQL editor
# or use the Supabase CLI:
# supabase db push

# 4. Seed the database
npm run seed

# 5. Start development server
npm run start:dev
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build (`dist/src/index.js`) |
| `npm run start:dev` | Run with hot-reload via nodemon + ts-node |
| `npm run seed` | Seed the database with sample data |
| `npm test` | Run Jest test suite |
| `npm run lint` | Lint source files with ESLint |

## Environment Variables

See `.env.example` for all required variables. The app will refuse to start if:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `NODE_ENV`, or `PORT` are missing
- `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` are shorter than 32 characters

## API Endpoints

| Group | Endpoints | Auth |
|-------|-----------|------|
| Auth | `POST /api/auth/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password/:token`, `/verify-email/:token` | Mixed |
| Auth | `GET /api/auth/me` | Bearer token |
| Customers | `GET/POST /api/customers`, `PUT/DELETE /api/customers/:id` | Bearer token |
| Leads | `GET/POST /api/leads`, `PUT/DELETE /api/leads/:id` | Bearer token |
| Tasks | `GET/POST /api/tasks`, `PUT/DELETE /api/tasks/:id` | Bearer token |
| Dashboard | `GET /api/dashboard/metrics`, `/recent`, `/conversion` | Bearer token |
| Users | `GET/POST/PUT/DELETE /api/users` | Admin only |
| Health | `GET /health/live`, `/health/ready` | None |

## Database Migrations

Migrations are in `supabase/migrations/` and should be applied in order:

1. `001_init.sql` – Core tables (users, customers, leads, tasks, activities)
2. `002_auth_tokens.sql` – Refresh token revocation table
3. `003_production_schema.sql` – `updated_at` triggers
4. `004_rls_policies.sql` – Row-level security policies (defense-in-depth)
5. `005_mvp_schema.sql` – Complete MVP schema with staff profiles and advanced metrics

## Project Structure

```
src/
├── config/        # Env validation, Supabase client, DB connection
├── controllers/   # Thin HTTP handlers (call services)
├── middleware/     # Auth, RBAC, validation, error handling, rate limiting
├── repositories/  # Data-access layer (Supabase query wrappers)
├── routes/        # Express route definitions
├── schemas/       # Zod validation schemas
├── services/      # Business logic (auth, customer, lead, task, activity)
├── types/         # Shared TypeScript interfaces
├── utils/         # AppError, transform, access, search, validation
└── index.ts       # App entry point
```

## Docker

```bash
docker compose up --build
```
