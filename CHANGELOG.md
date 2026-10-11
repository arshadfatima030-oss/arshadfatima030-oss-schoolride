# Changelog

## Unreleased
- New Next.js 15 + TypeScript + Tailwind app wired to the existing Supabase project.
- Supabase SSR auth: sign in/out, password reset, session refresh middleware, protected routes.
- Role model (`src/lib/roles.ts`) and role-based navigation; server-side role checks.
- Dashboard with live, documented metrics.
- Students list + create; read-only buses, drivers, routes, attendance.
- Tenant-isolation migrations with rollback scripts; applied to the live project after policy review, backup and dry run. Drops the 12 legacy "any authenticated user" policies.
- Dashboard and operational lists filter by the user's school.
- Create/edit/delete for buses, drivers, routes and attendance (`src/lib/resources.ts`, `saveRecord`/`deleteRecord`); attendance is picked by student (sets `student_id`) and blocks same-day duplicates.
- Migration `000400_staff_roles` (widens `profiles_role_check`; not yet applied).
- `scripts/tenant-isolation-check.mjs` (publishable key only; 29 checks) and Vitest unit tests.
- Phase 0 audit (`docs/AUDIT.md`) and checklist (`docs/CHECKLIST.md`).
