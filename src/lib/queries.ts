import "server-only";
import { createClient } from "@/lib/supabase/server";

export type CountResult = { count: number | null; error: boolean };

type Filter = { column: string; value: string };

export async function countRows(table: string, filters: Filter[] = []): Promise<CountResult> {
  const supabase = await createClient();
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  for (const f of filters) query = query.eq(f.column, f.value);
  const { count, error } = await query;
  if (error) console.error(`count ${table} failed`, error.message);
  return { count: error ? null : (count ?? 0), error: Boolean(error) };
}

export async function listRows<T>(
  table: string,
  columns: string,
  opts: { from: number; to: number; order: string; ascending?: boolean; filters?: Filter[] },
): Promise<{ rows: T[]; total: number; error: boolean }> {
  const supabase = await createClient();
  let query = supabase.from(table).select(columns, { count: "exact" });
  for (const f of opts.filters ?? []) query = query.eq(f.column, f.value);
  const { data, count, error } = await query
    .order(opts.order, { ascending: opts.ascending ?? true })
    .range(opts.from, opts.to);
  if (error) console.error(`list ${table} failed`, error.message);
  return { rows: (data ?? []) as T[], total: count ?? 0, error: Boolean(error) };
}

export async function getRow<T>(table: string, columns: string, id: number, schoolId: string): Promise<T | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).select(columns).eq("id", id).eq("school_id", schoolId).maybeSingle();
  if (error) console.error(`get ${table} failed`, error.message);
  return (data as T | null) ?? null;
}
