-- Rollback for 20261011000100. Drops only the columns/indexes added by that migration.
-- WARNING: run only before step 2 backfill has been relied on; backfilled ownership is lost.
begin;
drop index if exists public.attendance_student_id_idx;
drop index if exists public.attendance_school_id_idx;
drop index if exists public.routes_school_id_idx;
drop index if exists public.drivers_school_id_idx;
drop index if exists public.buses_school_id_idx;
-- students_school_id_idx / profiles_school_id_idx are kept: harmless and may pre-exist.
alter table public.attendance drop column if exists student_id;
alter table public.attendance drop column if exists school_id;
alter table public.routes     drop column if exists school_id;
alter table public.drivers    drop column if exists school_id;
alter table public.buses      drop column if exists school_id;
commit;
