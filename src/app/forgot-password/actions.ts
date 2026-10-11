"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ForgotState = { error?: string; sent?: boolean };

export async function requestReset(_: ForgotState, formData: FormData): Promise<ForgotState> {
  const parsed = z.string().trim().email().safeParse(formData.get("email"));
  if (!parsed.success) return { error: "Enter a valid email address." };

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${site}/auth/callback?next=/reset-password`,
  });
  // Same response whether or not the account exists, to avoid account enumeration.
  return { sent: true };
}
