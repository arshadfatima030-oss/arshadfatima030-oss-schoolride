# SchoolRide — Phase 0 Audit & Baseline

Date: 2026-10-11. Supabase project ref: `oiudmchbgdsdwcqwatxp`.

## Starting point
- **No existing application code** (owner confirmed). This repository is a new Next.js 15 / React 19 / TypeScript / Tailwind 4 app.
- **Existing Supabase database** with live data, inspected read-only via the REST API (publishable key, secret key, and signed-in test users).

## Database inventory (observed)

| Table | Rows | PK | school_id | Notes |
|---|---|---|---|---|
| schools | 1 (+1 test) | uuid | — | `name`, `created_at` |
| profiles | 1 (+2 test) | user_id uuid | FK → schools, nullable | `role` text (only `admin` seen), `email` |
| students | 2 | bigint | FK → schools, NOT NULL, default `my_school_id()` | parent fields inline; `bus_route`, `pickup_point` free text |
| buses | 1 | bigint | **missing** | `driver_name`, `assigned_route` free text |
| drivers | 1 | bigint | **missing** | `assigned_bus` free text |
| routes | 1 | bigint | **missing** | `pickup_points` single text field |
| attendance | 1 | bigint | **missing** | linked by `student_name` text, not student id |

RPC functions exposed: `my_role()`, `my_school_id()` (return the caller's role / school; return null for anon).
Not yet inspected (needs `SUPABASE_DB_URL`): exact RLS policies, triggers, function bodies and security mode, grants, check/unique constraints, indexes.

## Tenant-isolation test results (before migration)
Run with `scripts/tenant-isolation-check.mjs`, signed in as an admin of a second test school ("Devin Test School B") against Demo School data:

| Check | Result |
|---|---|
| B cannot read A students / school / profiles | PASS |
| B cannot update or delete A students | PASS |
| B cannot insert a student into A by spoofing `school_id` | PASS |
| B cannot change own role or move itself to A | PASS |
| B cannot read A buses / drivers / routes / attendance | **FAIL** (all rows visible) |
| B cannot delete A buses / drivers / routes / attendance | **FAIL** (deletes succeed) |
| B cannot insert into buses / drivers / routes / attendance | **FAIL** (inserts succeed, no owner) |
| B cannot update A buses / drivers / routes / attendance | PASS |

Write probes used only throwaway rows created for the test; all were removed afterwards and real row counts verified unchanged.

### After migration (applied 2026-10-11)
Policy review (DB access) found 12 permissive `to authenticated using (true)` SELECT/INSERT/DELETE policies on
`buses`, `drivers`, `routes`, `attendance`; no triggers; `my_role()`/`my_school_id()` are SECURITY DEFINER with
`search_path=public`. `students`/`schools`/`profiles` policies were already tenant-scoped and left untouched.

Steps: `pg_dump` (public schema + data) backup → dry run of all three migrations in one rolled-back transaction →
apply in order. The backfill excluded the "Devin Test School B" fixture (created after all legacy rows), so legacy
rows went to Demo School; the one attendance row was linked to its student by unique name match.

Re-run of `scripts/tenant-isolation-check.mjs` (now uses only the publishable key; A creates/removes its own probe
rows): **29/29 PASS** — B cannot read, update, delete or spoof-insert A's students, buses, drivers, routes or
attendance; A can still read its own rows; B cannot change its role or school. Real row counts unchanged.

## Prioritized risks
1. ~~**Critical:** any authenticated user can read, insert and delete buses, drivers, routes and attendance across schools.~~ Fixed by the tenant migrations.
2. ~~**High:** those tables have no `school_id`.~~ Fixed (`school_id NOT NULL`, defaults to caller's school).
3. **High:** relationships are free text (attendance by student name; bus↔driver↔route by name), so renames break links and duplicates are undetectable.
4. **Medium:** `profiles_role_check` only allows `super_admin`, `admin`, `parent`, so transport manager / accountant / teacher / driver roles cannot be assigned yet; no membership table for multi-school staff.
5. **Medium:** the secret key and DB password were shared in chat — rotate/reset both.
6. **Low:** students store parent details inline; a guardian model is needed for the parent portal.

## Repair plan
1. ~~Apply the tenant migrations and re-run the isolation check.~~ Done (29/29).
2. Then enable create/edit for buses, drivers, routes, attendance in the app.
3. Replace free-text links with FKs (route stops, bus/driver assignments, attendance.student_id).
4. Continue with spec phases 3+ (bulk import, trips, QR, fees, parent portal, GPS, subscriptions).
