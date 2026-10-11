"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ResetState = { error?: string };

const schema = z
  .object({ password: z.string().min(8, "Password must be at least 8 characters."), confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match.", path: ["confirm"] });

export async function updatePassword(_: ResetState, formData: FormData): Promise<ResetState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: "Could not update password. The reset link may have expired." };

  await supabase.auth.signOut();
  redirect("/login?message=Password%20updated.%20Please%20sign%20in.");
}
