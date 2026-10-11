import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { DeleteButton } from "@/components/delete-button";
import { Notice, PageHeader } from "@/components/page-header";
import { Pagination, pageRange } from "@/components/pagination";
import { RecordForm } from "@/components/record-form";
import { getRow, listRows } from "@/lib/queries";
import { canCreate, canEdit } from "@/lib/resources";
import { requireSession } from "@/lib/session";
import { todayInZone } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

type Row = { id: number; attendance_date: string; student_name: string; student_id: number | null; status: string };
const COLUMNS = "id, attendance_date, student_name, student_id, status";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; edit?: string }> }) {
  const ctx = await requireSession(["admin", "transport_manager", "teacher"]);
  const sp = await searchParams;
  const { page, from, to } = pageRange(sp.page);
  const editable = canEdit("attendance", ctx.role);
  const editId = Number(sp.edit);
  const [{ rows, total, error }, editing] = await Promise.all([
    listRows<Row>("attendance", COLUMNS, { filters: [{ column: "school_id", value: ctx.schoolId! }], from, to, order: "attendance_date", ascending: false }),
    editable && Number.isSafeInteger(editId) && editId > 0 ? getRow<Row>("attendance", COLUMNS, editId, ctx.schoolId!) : null,
  ]);
  const supabase = await createClient();
  const { data: students } = await supabase.from("students").select("id, name, student_class").eq("school_id", ctx.schoolId!).order("name");
  const formOptions = { student_id: (students ?? []).map((s) => ({ value: String(s.id), label: `${s.name} (${s.student_class})` })) };

  return (
    <>
      <PageHeader title="Attendance" description="Recorded attendance, newest first." />
      {error && <Notice tone="error">Records could not be loaded. Please try again.</Notice>}
      <DataTable caption="Attendance" rows={rows} empty="No records yet." columns={[
          { key: "date", header: "Date", render: (r: Row) => r.attendance_date },
          { key: "student", header: "Student", render: (r: Row) => r.student_name },
          { key: "status", header: "Status", render: (r: Row) => r.status },
          ...(editable
            ? [{
                key: "actions",
                header: "Actions",
                render: (r: Row) => (
                  <div className="flex items-center gap-3">
                    <Link href={`/attendance?edit=${r.id}`} className="text-sm font-medium text-indigo-700 hover:underline">Edit</Link>
                    {ctx.role === "admin" && <DeleteButton resource="attendance" id={r.id} label="record" />}
                  </div>
                ),
              }]
            : []),
        ]} />
      <Pagination page={page} total={total} basePath="/attendance" />
      <div className="mt-8">
        {editing ? (
          <RecordForm key={editing.id} resource="attendance" id={editing.id} initial={editing} options={formOptions} />
        ) : canCreate("attendance", ctx.role) ? (
          <RecordForm resource="attendance" initial={{ attendance_date: todayInZone(), status: "Present" }} options={formOptions} />
        ) : null}
      </div>
    </>
  );
}
