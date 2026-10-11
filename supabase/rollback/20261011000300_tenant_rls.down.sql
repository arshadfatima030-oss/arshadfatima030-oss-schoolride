-- Rollback for 20261011000300. Removes only objects created by that migration.
-- RLS stays ENABLED (disabling it would expose data); pre-existing policies are untouched.
begin;
do $$
declare t text;
begin
  foreach t in array array['students','buses','drivers','routes','attendance'] loop
    execute format('drop policy if exists sr_%1$s_select on public.%1$I', t);
    execute format('drop policy if exists sr_%1$s_insert on public.%1$I', t);
    execute format('drop policy if exists sr_%1$s_update on public.%1$I', t);
    execute format('drop policy if exists sr_%1$s_delete on public.%1$I', t);
  end loop;
end $$;
drop policy if exists sr_attendance_insert_teacher on public.attendance;
drop policy if exists sr_profiles_select on public.profiles;
drop policy if exists sr_schools_update on public.schools;
drop policy if exists sr_schools_select on public.schools;

alter table public.buses      alter column school_id drop not null, alter column school_id drop default;
alter table public.drivers    alter column school_id drop not null, alter column school_id drop default;
alter table public.routes     alter column school_id drop not null, alter column school_id drop default;
alter table public.attendance alter column school_id drop not null, alter column school_id drop default;

drop function if exists public.current_app_role();
drop function if exists public.current_school_id();
commit;
