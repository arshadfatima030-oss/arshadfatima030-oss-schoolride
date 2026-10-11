import Link from "next/link";
import { Notice, PageHeader } from "@/components/page-header";
import { todayInZone } from "@/lib/dates";
import { countRows, type CountResult } from "@/lib/queries";
import { requireSession } from "@/lib/session";

function Metric({ label, result, note }: { label: string; result: CountResult; note?: string }) {
  return (
    <div className="card">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">
        {result.error ? <span className="text-base text-red-600">Unavailable</span> : result.count}
      </p>
      {note && <p className="mt-1 text-xs text-slate-400">{note}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const ctx = await requireSession(["admin", "transport_manager", "accountant", "teacher"]);
  const school = { column: "school_id", value: ctx.schoolId! };
  const today = todayInZone();

  const [students, buses, drivers, routes, presentToday] = await Promise.all([
    countRows("students", [school]),
    countRows("buses", [{ column: "status", value: "Active" }]),
    countRows("drivers", [{ column: "status", value: "Active" }]),
    countRows("routes", [{ column: "status", value: "Active" }]),
    countRows("attendance", [
      { column: "attendance_date", value: today },
      { column: "status", value: "Present" },
    ]),
  ]);

  const unscoped = "Not yet school-scoped";

  return (
    <>
      <PageHeader title="Dashboard" description={`Live figures from your database · ${today}`} />
      <Notice>
        Buses, drivers, routes and attendance have no <code>school_id</code> column yet, so their counts are whatever
        the database policies allow you to see. They become school-scoped after the pending tenant migration.
      </Notice>
      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Total students" result={students} />
        <Metric label="Active buses" result={buses} note={unscoped} />
        <Metric label="Active drivers" result={drivers} note={unscoped} />
        <Metric label="Active routes" result={routes} note={unscoped} />
        <Metric label="Present today" result={presentToday} note={unscoped} />
      </section>
      <section aria-label="Quick actions" className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/students" className="btn-primary">Manage students</Link>
          <Link href="/attendance" className="btn-secondary">View attendance</Link>
          <Link href="/routes" className="btn-secondary">View routes</Link>
        </div>
      </section>
    </>
  );
}
