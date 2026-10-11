import { DataTable } from "@/components/data-table";
import { Notice, PageHeader } from "@/components/page-header";
import { Pagination, pageRange } from "@/components/pagination";
import { listRows } from "@/lib/queries";
import { requireSession } from "@/lib/session";

type Row = { id: number; attendance_date: string; student_name: string; status: string };

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const ctx = await requireSession(["admin", "transport_manager", "teacher"]);
  const { page, from, to } = pageRange((await searchParams).page);
  const { rows, total, error } = await listRows<Row>("attendance", "id, attendance_date, student_name, status", { filters: [{ column: "school_id", value: ctx.schoolId! }], from, to, order: "attendance_date", ascending: false });

  return (
    <>
      <PageHeader title="Attendance" description="Recorded attendance, newest first." />
      <Notice>
        Read-only for now. Create and edit forms for this school-scoped table are the next step.
      </Notice>
      {error && <Notice tone="error">Records could not be loaded. Please try again.</Notice>}
      <DataTable caption="Attendance" rows={rows} empty="No records yet." columns={[
          { key: "date", header: "Date", render: (r) => r.attendance_date },
          { key: "student", header: "Student", render: (r) => r.student_name },
          { key: "status", header: "Status", render: (r) => r.status },
        ]} />
      <Pagination page={page} total={total} basePath="/attendance" />
    </>
  );
}
