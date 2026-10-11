import Link from "next/link";
import { AuthCard } from "@/components/auth-card";

export default function UnauthorizedPage() {
  return (
    <AuthCard title="Access denied" subtitle="Your account does not have permission to view that page.">
      <div className="flex gap-3">
        <Link href="/dashboard" className="btn-secondary">Go to dashboard</Link>
        <form action="/auth/signout" method="post">
          <button className="btn-primary">Sign out</button>
        </form>
      </div>
    </AuthCard>
  );
}
