-- Rollback for 20261011000400. Fails (by design) if any profile already uses a new role;
-- reassign those profiles first.
begin;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (
  role = any (array['super_admin','admin','parent']::text[])
);
commit;
