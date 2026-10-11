"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { normalizePkPhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";

const optional = z.string().trim().max(200).optional().transform((v) => (v ? v : null));

const studentSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  student_class: z.string().trim().min(1, "Class is required.").max(40),
  section: optional,
  roll_number: optional,
  parent_name: optional,
  parent_phone: z.string().trim().min(1, "Parent phone is required."),
  parent_email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.string().email("Parent email is invalid.").nullable()),
  home_address: optional,
});

export type StudentFormState = { error?: string; ok?: boolean };

export async function createStudent(_: StudentFormState, formData: FormData): Promise<StudentFormState> {
  const ctx = await requireSession(["admin", "transport_manager"]);
  const parsed = studentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const phone = normalizePkPhone(parsed.data.parent_phone);
  if (!phone) return { error: "Parent phone must be a valid Pakistani number, e.g. 0300 1234567." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .insert({ ...parsed.data, parent_phone: phone, school_id: ctx.schoolId });
  if (error) {
    console.error("create student failed", error.message);
    return { error: "Could not save the student. You may not have permission." };
  }

  revalidatePath("/students");
  revalidatePath("/dashboard");
  return { ok: true };
}
