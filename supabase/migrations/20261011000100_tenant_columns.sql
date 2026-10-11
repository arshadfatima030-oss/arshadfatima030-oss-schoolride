-- Phase 2 / step 1: add nullable school_id columns to legacy tables.
-- Non-destructive: no data is changed. Safe to run on a populated database.
begin;

alter table public.buses      add column if not exists school_id uuid references public.schools(id);
alter table public.drivers    add column if not exists school_id uuid references public.schools(id);
alter table public.routes     add column if not exists school_id uuid references public.schools(id);
alter table public.attendance add column if not exists school_id uuid references public.schools(id);
alter table public.attendance add column if not exists student_id bigint references public.students(id);

create index if not exists buses_school_id_idx      on public.buses (school_id);
create index if not exists drivers_school_id_idx    on public.drivers (school_id);
create index if not exists routes_school_id_idx     on public.routes (school_id);
create index if not exists attendance_school_id_idx on public.attendance (school_id, attendance_date);
create index if not exists attendance_student_id_idx on public.attendance (student_id, attendance_date);
create index if not exists students_school_id_idx   on public.students (school_id);
create index if not exists profiles_school_id_idx   on public.profiles (school_id);

commit;
