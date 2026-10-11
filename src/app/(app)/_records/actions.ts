"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RESOURCES, canCreate, canEdit, isResourceKey, type ResourceKey } from "@/lib/resources";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";

export type RecordFormState = { error?: string; ok?: boolean };

// Server actions are public endpoints: every argument is re-validated here.
export async function saveRecord(
  resource: ResourceKey,
  id: number | null,
  _: RecordFormState,
  formData: FormData,
): Promise<RecordFormState> {
  if (!isResourceKey(resource) || (id !== null && !Number.isSafeInteger(id))) return { error: "Invalid request." };
  const ctx = await requireSession();
  const allowed = id === null ? canCreate(resource, ctx.role) : canEdit(resource, ctx.role);
  if (!allowed || !ctx.schoolId) return { error: "You do not have permission to do this." };

  const config = RESOURCES[resource];
  const parsed = config.schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  let values: Record<string, unknown> = parsed.data;

  if (resource === "attendance") {
    const data = parsed.data as { student_id: number; attendance_date: string };
    const { data: student } = await supabase
      .from("students")
      .select("name")
      .eq("id", data.student_id)
      .eq("school_id", ctx.schoolId)
      .maybeSingle();
    if (!student) return { error: "Choose a student from your school." };

    let dup = supabase
      .from("attendance")
      .select("id")
      .eq("school_id", ctx.schoolId)
      .eq("student_id", data.student_id)
      .eq("attendance_date", data.attendance_date);
    if (id !== null) dup = dup.neq("id", id);
    const { data: existing } = await dup.limit(1);
    if (existing?.length) return { error: "Attendance for this student on this date is already recorded." };

    values = { ...values, student_name: student.name };
  }

  const query =
    id === null
      ? supabase.from(resource).insert({ ...values, school_id: ctx.schoolId }).select("id")
      : supabase.from(resource).update(values).eq("id", id).eq("school_id", ctx.schoolId).select("id");
  const { data, error } = await query;
  if (error || !data?.length) {
    if (error) console.error(`save ${resource} failed`, error.message);
    return { error: `Could not save the ${config.label}. You may not have permission.` };
  }

  revalidatePath(config.path);
  revalidatePath("/dashboard");
  if (id !== null) redirect(config.path);
  return { ok: true };
}

export async function deleteRecord(resource: ResourceKey, id: number): Promise<void> {
  if (!isResourceKey(resource) || !Number.isSafeInteger(id)) return;
  const ctx = await requireSession(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from(resource).delete().eq("id", id).eq("school_id", ctx.schoolId!);
  if (error) console.error(`delete ${resource} failed`, error.message);
  revalidatePath(RESOURCES[resource].path);
  revalidatePath("/dashboard");
  redirect(RESOURCES[resource].path);
}
