-- Rollback for 20261011000300. Restores the exact pre-migration policies, INCLUDING the
-- insecure "any authenticated user" ones (see docs/AUDIT.md). RLS stays enabled.
begin;
do $$
declare t text;
begin
  foreach t in array array['buses','drivers','routes','attendance'] loop
    execute format('drop policy if exists sr_%1$s_select on public.%1$I', t);
    execute format('drop policy if exists sr_%1$s_insert on public.%1$I', t);
    execute format('drop policy if exists sr_%1$s_update on public.%1$I', t);
    execute format('drop policy if exists sr_%1$s_delete on public.%1$I', t);
  end loop;
end $$;
drop policy if exists sr_attendance_insert_teacher on public.attendance;

create policy "Allow authenticated users to add buses"     on public.buses for insert to authenticated with check (true);
create policy "Allow authenticated users to delete buses"  on public.buses for delete to authenticated using (true);
create policy "Allow authenticated users to view buses"    on public.buses for select to authenticated using (true);
create policy "Authenticated users can add drivers"        on public.drivers for insert to authenticated with check (true);
create policy "Authenticated users can delete drivers"     on public.drivers for delete to authenticated using (true);
create policy "Authenticated users can view drivers"       on public.drivers for select to authenticated using (true);
create policy "Allow authenticated users to add routes"    on public.routes for insert to authenticated with check (true);
create policy "Allow authenticated users to delete routes" on public.routes for delete to authenticated using (true);
create policy "Allow authenticated users to view routes"   on public.routes for select to authenticated using (true);
create policy "Allow attendance delete"                    on public.attendance for delete to authenticated using (true);
create policy "Allow attendance insert"                    on public.attendance for insert to authenticated with check (true);
create policy "Allow attendance select"                    on public.attendance for select to authenticated using (true);

alter table public.buses      alter column school_id drop not null, alter column school_id drop default;
alter table public.drivers    alter column school_id drop not null, alter column school_id drop default;
alter table public.routes     alter column school_id drop not null, alter column school_id drop default;
alter table public.attendance alter column school_id drop not null, alter column school_id drop default;

drop function if exists public.current_app_role();
drop function if exists public.current_school_id();
commit;
