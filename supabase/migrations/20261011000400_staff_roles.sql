-- Phase 2 / step 4: allow the staff roles from the spec. Widens a CHECK constraint only;
-- existing rows (super_admin/admin/parent) remain valid. No data changes.
begin;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (
  role = any (array['super_admin','admin','transport_manager','accountant','teacher','driver','parent']::text[])
);
commit;
