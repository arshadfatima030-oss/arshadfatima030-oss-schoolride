-- Phase 2 / step 2: backfill school ownership.
-- Only valid while the database contains exactly one real school, in which case every legacy
-- row can only belong to it. Aborts otherwise — do not guess. The excluded id is the
-- "Devin Test School B" fixture, created 2026-10-11 after all legacy rows existed.
begin;

do $$
declare
  n_schools int;
  the_school uuid;
begin
  select count(*) into n_schools from public.schools
  where id <> '54f1f68f-e1fc-42e0-a8a6-149df4203f7e';
  if n_schools <> 1 then
    raise exception 'Expected exactly 1 real school, found %. Backfill ownership manually.', n_schools;
  end if;
  select id into the_school from public.schools
  where id <> '54f1f68f-e1fc-42e0-a8a6-149df4203f7e';

  update public.buses      set school_id = the_school where school_id is null;
  update public.drivers    set school_id = the_school where school_id is null;
  update public.routes     set school_id = the_school where school_id is null;
  update public.attendance set school_id = the_school where school_id is null;
end $$;

-- Link attendance to students only where the name matches exactly one student in the same school.
update public.attendance a
set student_id = s.id
from public.students s
where a.student_id is null
  and s.school_id = a.school_id
  and lower(trim(s.name)) = lower(trim(a.student_name))
  and (select count(*) from public.students s2
       where s2.school_id = a.school_id and lower(trim(s2.name)) = lower(trim(a.student_name))) = 1;

commit;

-- Verification (run after; all should return 0 except the last, which lists unmatched attendance):
-- select count(*) from public.buses      where school_id is null;
-- select count(*) from public.drivers    where school_id is null;
-- select count(*) from public.routes     where school_id is null;
-- select count(*) from public.attendance where school_id is null;
-- select id, student_name, attendance_date from public.attendance where student_id is null;
