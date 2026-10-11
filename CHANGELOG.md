# Changelog

## Unreleased
- New Next.js 15 + TypeScript + Tailwind app wired to the existing Supabase project.
- Supabase SSR auth: sign in/out, password reset, session refresh middleware, protected routes.
- Role model (`src/lib/roles.ts`) and role-based navigation; server-side role checks.
- Dashboard with live, documented metrics.
- Students list + create; read-only buses, drivers, routes, attendance.
- Tenant-isolation migrations with rollback scripts (not applied).
- `scripts/tenant-isolation-check.mjs` and Vitest unit tests.
- Phase 0 audit (`docs/AUDIT.md`) and checklist (`docs/CHECKLIST.md`).
