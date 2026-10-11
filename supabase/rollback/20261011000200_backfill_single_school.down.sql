-- Rollback for 20261011000200: clears the backfilled values (columns remain).
begin;
update public.attendance set student_id = null, school_id = null;
update public.routes     set school_id = null;
update public.drivers    set school_id = null;
update public.buses      set school_id = null;
commit;
