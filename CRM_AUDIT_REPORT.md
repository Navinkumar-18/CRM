# Zuna CRM — Application Audit Report

**Date:** July 3, 2026  
**Scope:** Full-stack review of backend (Express + Supabase), frontend (React + Vite), auth, access control, tests, and configuration  
**Branch state:** Uncommitted changes across auth, RBAC, staff portal, and entity services

---

## Executive Summary

Zuna CRM is a well-structured CRM with solid security foundations (JWT + httpOnly refresh cookies, rate limiting, Helmet, Zod validation, ownership scoping). TypeScript compiles cleanly on both sides, ESLint passes, and 14 backend unit tests pass.

However, the audit found **several security gaps**, **role-model inconsistencies**, **thin test coverage**, and **UI/UX stubs** that should be addressed before production deployment.

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High     | 4 |
| Medium   | 8 |
| Low      | 7 |

---

## What Passed

- **TypeScript:** `tsc --noEmit` succeeds for backend and frontend
- **Linting:** ESLint passes on both packages
- **Unit tests:** 14/14 backend tests pass (access utilities, auth service, roles middleware)
- **Auth design:** Access tokens in memory; refresh tokens in httpOnly cookies; token rotation with reuse detection
- **API hardening:** Global rate limiting, auth-specific limiters, Helmet CSP/HSTS, CORS allowlist, 10 KB body limits
- **Ownership scoping:** Core entities (customers, leads, tasks, companies, contacts, deals) use `applyOwnershipScope` / `resolveAssignedTo`
- **Notes access control:** Parent-entity checks on create/list; author-only edits for employees
- **Error handling:** Centralized `AppError` handler with request IDs; stack traces suppressed in production

---

## Critical Issues

### 1. Custom module records — ownership bypass on create

**File:** `backend/src/services/custom.service.ts`

When creating a custom record, `owner_id` is taken directly from the request body without using `resolveAssignedTo`:

```typescript
owner_id: body.owner_id || user.id,
```

A non-privileged user can set `owner_id` to another user's UUID and create records assigned to them. Updates/deletes are scoped correctly, but create is not.

**Recommendation:** Replace with `resolveAssignedTo(body.owner_id, user)` (same pattern used in customer/lead/task services).

---

## High Severity Issues

### 2. Default seed credentials in source code

**File:** `backend/src/seed.ts`

```typescript
const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
const seedAdminEmail = process.env.SEED_ADMIN_EMAIL || 'nerupunavin450@gmail.com';
```

Hardcoded fallback credentials are a security risk if seed is run in a shared or misconfigured environment.

**Recommendation:** Require `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` via env with no defaults; document in `.env.example`.

---

### 3. Dual role values: `staff` vs `employee`

**Files:** `backend/src/schemas/user.schema.ts`, `frontend/src/pages/staff/components/StaffFormModal.tsx`, `backend/src/types/database.ts`

The backend access layer treats `employee` as the standard non-privileged role (`isPrivilegedRole`, auth defaults), but the staff creation UI defaults to and offers `staff` as a role option. Both values exist in Zod enums and TypeScript types.

This can cause confusion in RBAC checks, RLS policies (which reference JWT roles), and reporting. Users created as `staff` may behave differently than intended if any code path checks only `employee`.

**Recommendation:** Standardize on a single role (`employee`); migrate existing `staff` rows; remove `staff` from enums or map it at the API boundary.

---

### 4. Refresh token DB expiry not synced with JWT config

**File:** `backend/src/services/auth.service.ts`

Refresh token JWT expiry uses `env.jwtRefreshExpiry` (default `7d`), but the database `expires_at` is hardcoded:

```typescript
Date.now() + 7 * 24 * 60 * 60 * 1000
```

If `JWT_REFRESH_EXPIRY` is changed in env, JWT and DB expiry can diverge, causing confusing auth failures.

**Recommendation:** Derive DB expiry from the same config (parse `jwtRefreshExpiry` or store decoded JWT `exp`).

---

### 5. Integration tests are placeholders

**Files:** `backend/tests/integration/auth.routes.test.ts`, `backend/tests/integration/customers.routes.test.ts`

Both integration test files contain only `expect(true).toBe(true)` placeholders. Critical flows (login, refresh, ownership scoping, RBAC) are not exercised end-to-end.

**Recommendation:** Add supertest integration tests against a test Supabase instance or use CI with Docker Compose (`backend/docker-compose.yml`).

---

## Medium Severity Issues

### 6. Public registration route still exposed

**Files:** `backend/src/routes/auth.routes.ts`, `backend/src/services/auth.service.ts`, `frontend/src/pages/auth/Register.tsx`

`registerUser` throws `ForbiddenError` (registration disabled), but:

- The POST `/api/auth/register` route remains active with rate limiting
- `Register.tsx` still implements a full registration form (App redirects `/register` → `/login`, but the page/component exists)
- `auth.controller.ts` destructures `{ user, message }` from `registerUser`, which never returns (dead/incorrect code path)

**Recommendation:** Remove or return `410 Gone` on the register route; delete unused `Register.tsx` or show a static "contact admin" page.

---

### 7. Email change without re-verification

**File:** `backend/src/services/auth.service.ts` — `updateMe`

Users can change their email via profile update without triggering verification or invalidating sessions beyond normal flow. A compromised session could redirect account recovery to an attacker-controlled email.

**Recommendation:** Require password confirmation for email changes; set `is_verified: false` and send verification to the new address.

---

### 8. `/auth/refresh` has no dedicated rate limiter

**File:** `backend/src/routes/auth.routes.ts`

Login and password reset have strict limiters; refresh relies only on the global API limiter (200 req/min). Refresh token brute-force or abuse is less likely but still worth tightening.

**Recommendation:** Add a per-IP refresh limiter (e.g., 30/min) with `skipSuccessfulRequests: false`.

---

### 9. Access token stored only in memory — fragile page reload UX

**File:** `frontend/src/utils/token.ts`

Access tokens are held in a module-level variable (not persisted). On full page reload, persisted Zustand state shows `isAuthenticated: true` but the token is empty until the refresh cookie flow completes. This works when the refresh cookie is valid but causes a loading spinner and can flash logout if the cookie expired.

**Recommendation:** Document expected behavior; consider silent refresh on app bootstrap before rendering protected routes.

---

### 10. RLS policies omit `manager` role

**File:** `backend/supabase/migrations/004_rls_policies.sql`

Policies only grant full access to `admin` JWT role. Managers fall through to "own records" policies. The backend uses the service role (bypasses RLS), so this is defense-in-depth only — but inconsistent with application RBAC where managers see all records.

**Recommendation:** Add `manager` policies mirroring admin, or document that RLS is not authoritative for this app.

---

### 11. Admin verify-user returns success even when email not found

**File:** `backend/src/controllers/auth.controller.ts` — `adminVerifyUser`

Supabase `update` with no matching rows still returns success. Admin may believe a user was verified when the email does not exist.

**Recommendation:** Check `count` or fetch user first; return `404` if not found.

---

### 12. No CI/CD pipeline

No `.github/workflows` or equivalent CI configuration was found. Tests and lint are not enforced on push/PR.

**Recommendation:** Add CI running `npm test`, `npm run lint`, and `tsc --noEmit` for both packages.

---

### 13. Password policy mismatch (admin-created users vs self-service reset)

**Files:** `backend/src/schemas/user.schema.ts`, `frontend/src/pages/auth/ResetPassword.tsx`

Admin user creation requires a **special character** in passwords. The frontend reset-password form only requires upper, lower, and number (8+ chars). Users resetting passwords can set weaker passwords than admins can assign.

**Recommendation:** Align frontend reset validation with backend `resetPasswordSchema` / `passwordSchema`.

---

## Low Severity Issues

### 14. Non-functional header search bar

**File:** `frontend/src/components/layout/AppLayout.tsx`

The global search input has no handler, state, or API integration.

---

### 15. Notification bell shows fake unread indicator

**File:** `frontend/src/components/layout/AppLayout.tsx`

Bell icon always displays a red dot; no notifications backend exists.

---

### 16. Widespread use of `alert()` for errors

**Files:** `MyLeads.tsx`, `MyTasks.tsx`, `Tasks.tsx`, `Customers.tsx`, etc.

Native browser `alert()` is used for API errors instead of toast/modal components used elsewhere. Poor UX on mobile and inconsistent with the rest of the UI.

---

### 17. SMTP not required at startup

**File:** `backend/src/services/email.service.ts`

`verifyTransporter()` logs a warning on failure but does not block startup. Password reset and verification emails will fail silently in dev/staging without SMTP configured.

---

### 18. In-memory auth user cache is process-local

**File:** `backend/src/middleware/auth.ts`

30-second user cache is noted as process-local. Multi-instance deployments may serve stale role data for up to 30 seconds after role changes (partially mitigated by `invalidateUserCache` on user updates).

---

### 19. Duplicate navigation icon

**File:** `frontend/src/components/layout/AppLayout.tsx`

Both "Custom Modules" and "Settings" (profile) use the `Settings` lucide icon — minor UX confusion.

---

### 20. Frontend test coverage minimal

Only `App.test.tsx` (1 test) exists. Staff portal, auth flows, and CRUD pages are untested.

---

## Security Posture Summary

| Area | Status | Notes |
|------|--------|-------|
| Authentication | Good | JWT + refresh rotation, timing-safe login |
| Authorization (API) | Good | Ownership scoping on core entities |
| Authorization (custom modules) | **Needs fix** | Create record ownership bypass |
| CORS / Headers | Good | Allowlist + Helmet |
| Rate limiting | Good | Auth endpoints protected; refresh could be tighter |
| Secrets management | OK | Env validation at startup; seed defaults weak |
| Data exposure | Good | Password hashes not returned in API responses |
| RLS (Supabase) | Partial | Bypassed by service role; policies incomplete |

---

## Architecture Overview

```
┌─────────────┐     Bearer JWT (memory)      ┌──────────────┐
│   React     │ ───────────────────────────► │ Express API  │
│   Frontend  │     httpOnly refresh cookie  │  (Node.js)   │
└─────────────┘ ◄─────────────────────────── └──────┬───────┘
                                                     │ service role
                                                     ▼
                                              ┌──────────────┐
                                              │   Supabase   │
                                              │  (Postgres)  │
                                              └──────────────┘
```

**Roles:**

| Role | Admin dashboard | Staff portal | User management | Delete entities |
|------|-----------------|--------------|-----------------|-----------------|
| admin | Yes | N/A | Yes | Yes |
| manager | Yes | N/A | No | Yes (most entities) |
| employee / staff | No | Yes | No | No (own records only) |

---

## Recommended Priority Fix Order

1. **Fix custom record `owner_id` bypass** (Critical)
2. **Remove hardcoded seed credentials** (High)
3. **Unify `staff` / `employee` roles** (High)
4. **Sync refresh token DB expiry with JWT config** (High)
5. **Add real integration tests + CI** (High)
6. **Align password policies; disable dead register route** (Medium)
7. **Email change re-verification** (Medium)
8. **Replace `alert()` with toast UI; wire search/notifications or remove stubs** (Low)

---

## Test Results (Audit Run)

| Check | Result |
|-------|--------|
| Backend `npm test` | 5 suites, 14 tests passed |
| Backend `tsc --noEmit` | Pass |
| Frontend `tsc --noEmit` | Pass |
| Frontend `npm test` | 1 test passed |
| Backend ESLint | Pass |
| Frontend ESLint | Pass |

---

*Report generated from static analysis and automated checks. Runtime testing against a live Supabase instance was not performed in this audit.*
