-- Phase 2 / step 3: enforce school ownership and tenant-scoped RLS on operational tables.
-- Prerequisite: step 2 verification queries all return 0 for school_id IS NULL.
-- Policy review (2026-10-11) found permissive "any authenticated user" SELECT/INSERT/DELETE
-- policies on buses/drivers/routes/attendance. Permissive policies are OR-ed, so they are
-- dropped here; otherwise the new tenant policies would not close the hole.
-- schools/profiles/students policies were reviewed, are already tenant-scoped, and are untouched.
begin;

-- SECURITY DEFINER so they can read profiles regardless of profiles RLS;
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

drop policy if exists "Allow authenticated users to add buses"     on public.buses;
drop policy if exists "Allow authenticated users to delete buses"  on public.buses;
drop policy if exists "Allow authenticated users to view buses"    on public.buses;
drop policy if exists "Authenticated users can add drivers"        on public.drivers;
drop policy if exists "Authenticated users can delete drivers"     on public.drivers;
drop policy if exists "Authenticated users can view drivers"       on public.drivers;
drop policy if exists "Allow authenticated users to add routes"    on public.routes;
drop policy if exists "Allow authenticated users to delete routes" on public.routes;
drop policy if exists "Allow authenticated users to view routes"   on public.routes;
drop policy if exists "Allow attendance delete"                    on public.attendance;
drop policy if exists "Allow attendance insert"                    on public.attendance;
drop policy if exists "Allow attendance select"                    on public.attendance;

alter table public.buses      alter column school_id set default public.current_school_id(), alter column school_id set not null;
alter table public.drivers    alter column school_id set default public.current_school_id(), alter column school_id set not null;
alter table public.routes     alter column school_id set default public.current_school_id(), alter column school_id set not null;
alter table public.attendance alter column school_id set default public.current_school_id(), alter column school_id set not null;

alter table public.buses      enable row level security;
alter table public.drivers    enable row level security;
alter table public.routes     enable row level security;
alter table public.attendance enable row level security;

-- Staff of the same school only. Parents/drivers get nothing here until their portals
-- add narrower policies (e.g. parents: own children's attendance only).
do $$
declare
  t text;
begin
  foreach t in array array['buses','drivers','routes','attendance'] loop
    execute format('drop policy if exists sr_%1$s_select on public.%1$I', t);
    execute format($p$create policy sr_%1$s_select on public.%1$I for select to authenticated
      using (school_id = public.current_school_id()
             and public.current_app_role() in ('admin','transport_manager','accountant','teacher'))$p$, t);

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

drop policy if exists sr_attendance_insert_teacher on public.attendance;
create policy sr_attendance_insert_teacher on public.attendance for insert to authenticated
  with check (school_id = public.current_school_id() and public.current_app_role() = 'teacher');

commit;
