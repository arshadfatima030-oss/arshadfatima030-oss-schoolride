import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { getSessionContext } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; message?: string }>;
}) {
  if (await getSessionContext()) redirect("/dashboard");
  const { next, message } = await searchParams;
  return (
    <AuthCard title="Sign in to SchoolRide" subtitle="Accounts are created by your school administrator.">
      <LoginForm next={next} message={message} />
    </AuthCard>
  );
}
