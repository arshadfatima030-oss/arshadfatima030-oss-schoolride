-- Phase 2 / step 3: enforce school ownership and tenant-scoped RLS.
-- Prerequisite: step 2 verification queries all return 0 for school_id IS NULL.
-- PREREQUISITE: drop pre-existing permissive policies on buses/drivers/routes/attendance
-- (audit found any authenticated user can read/insert/delete them). Policies are OR-ed,
-- drops ONLY the policies it creates, so pre-existing permissive policies must be reviewed
-- and removed separately, because permissive policies are OR-ed together.
begin;

-- Helpers. SECURITY DEFINER so they can read profiles regardless of profiles RLS;
-- empty search_path and schema-qualified names prevent search_path hijacking.
create or replace function public.current_school_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select p.school_id from public.profiles p where p.user_id = auth.uid()
$$;

create or replace function public.current_app_role()
returns text language sql stable security definer set search_path = '' as $$
  select p.role from public.profiles p where p.user_id = auth.uid()
$$;

revoke all on function public.current_school_id() from public, anon;
revoke all on function public.current_app_role()  from public, anon;
grant execute on function public.current_school_id() to authenticated;
grant execute on function public.current_app_role()  to authenticated;

-- Ownership is now mandatory and defaults to the caller's school.
alter table public.buses      alter column school_id set default public.current_school_id(), alter column school_id set not null;
alter table public.drivers    alter column school_id set default public.current_school_id(), alter column school_id set not null;
alter table public.routes     alter column school_id set default public.current_school_id(), alter column school_id set not null;
alter table public.attendance alter column school_id set default public.current_school_id(), alter column school_id set not null;

alter table public.schools    enable row level security;
alter table public.profiles   enable row level security;
alter table public.students   enable row level security;
alter table public.buses      enable row level security;
alter table public.drivers    enable row level security;
alter table public.routes     enable row level security;
alter table public.attendance enable row level security;

-- schools: members read their own school; admins update it. No client inserts/deletes.
drop policy if exists sr_schools_select on public.schools;
create policy sr_schools_select on public.schools for select to authenticated
  using (id = public.current_school_id());
drop policy if exists sr_schools_update on public.schools;
create policy sr_schools_update on public.schools for update to authenticated
  using (id = public.current_school_id() and public.current_app_role() = 'admin')
  with check (id = public.current_school_id());

-- profiles: users read their own profile; admins read profiles in their school.
-- No client-side insert/update/delete, so nobody can change their own role or school.
drop policy if exists sr_profiles_select on public.profiles;
create policy sr_profiles_select on public.profiles for select to authenticated
  using (user_id = auth.uid()
         or (school_id = public.current_school_id() and public.current_app_role() = 'admin'));

-- School-owned operational tables.
do $$
declare
  t text;
begin
  foreach t in array array['students','buses','drivers','routes','attendance'] loop
    execute format('drop policy if exists sr_%1$s_select on public.%1$I', t);
    execute format($p$create policy sr_%1$s_select on public.%1$I for select to authenticated
      using (school_id = public.current_school_id())$p$, t);

    execute format('drop policy if exists sr_%1$s_insert on public.%1$I', t);
    execute format($p$create policy sr_%1$s_insert on public.%1$I for insert to authenticated
      with check (school_id = public.current_school_id()
                  and public.current_app_role() in ('admin','transport_manager'))$p$, t);

    execute format('drop policy if exists sr_%1$s_update on public.%1$I', t);
    execute format($p$create policy sr_%1$s_update on public.%1$I for update to authenticated
      using (school_id = public.current_school_id()
             and public.current_app_role() in ('admin','transport_manager'))
      with check (school_id = public.current_school_id())$p$, t);

    execute format('drop policy if exists sr_%1$s_delete on public.%1$I', t);
    execute format($p$create policy sr_%1$s_delete on public.%1$I for delete to authenticated
      using (school_id = public.current_school_id() and public.current_app_role() = 'admin')$p$, t);
  end loop;
end $$;

-- Teachers may record attendance for their school.
drop policy if exists sr_attendance_insert_teacher on public.attendance;
create policy sr_attendance_insert_teacher on public.attendance for insert to authenticated
  with check (school_id = public.current_school_id() and public.current_app_role() = 'teacher');

commit;
