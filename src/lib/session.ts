import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRole, type Role } from "@/lib/roles";

export type SessionContext = {
  userId: string;
  email: string | null;
  role: Role | null;
  rawRole: string | null;
  schoolId: string | null;
  schoolName: string | null;
};

export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id, schools(name)")
    .eq("user_id", user.id)
    .maybeSingle();

  const school = profile?.schools as { name: string } | { name: string }[] | null | undefined;
  const schoolName = Array.isArray(school) ? (school[0]?.name ?? null) : (school?.name ?? null);

  return {
    userId: user.id,
    email: user.email ?? null,
    role: isRole(profile?.role) ? profile.role : null,
    rawRole: profile?.role ?? null,
    schoolId: profile?.school_id ?? null,
    schoolName,
  };
});

export async function requireSession(allowed?: Role[]): Promise<SessionContext> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (allowed && (!ctx.role || !allowed.includes(ctx.role))) redirect("/unauthorized");
  return ctx;
}
