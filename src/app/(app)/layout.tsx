import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { ROLE_LABELS, navFor } from "@/lib/roles";
import { getSessionContext } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");

  if (!ctx.role || !ctx.schoolId) {
    return (
      <main className="mx-auto max-w-lg p-10">
        <div className="card">
          <h1 className="text-lg font-semibold">Account not set up</h1>
          <p className="mt-2 text-sm text-slate-600">
            You are signed in as {ctx.email}, but your account is not linked to a school with a recognised role
            {ctx.rawRole ? ` (current role: "${ctx.rawRole}")` : ""}. Ask your school administrator to finish setting up your account.
          </p>
          <form action="/auth/signout" method="post" className="mt-4">
            <button className="btn-secondary">Sign out</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen md:flex">
      <Sidebar items={navFor(ctx.role).map(({ href, label }) => ({ href, label }))} />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{ctx.schoolName ?? "Your school"}</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[ctx.role]}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{ctx.email}</span>
            <form action="/auth/signout" method="post">
              <button className="btn-secondary">Sign out</button>
            </form>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
