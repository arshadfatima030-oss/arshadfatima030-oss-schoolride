import { DataTable } from "@/components/data-table";
import { Notice, PageHeader } from "@/components/page-header";
import { Pagination, pageRange } from "@/components/pagination";
import { listRows } from "@/lib/queries";
import { requireSession } from "@/lib/session";
import { StudentForm } from "./student-form";

type Student = {
  id: number;
  name: string;
  student_class: string;
  section: string | null;
  roll_number: string | null;
  parent_name: string | null;
  parent_phone: string;
  bus_route: string | null;
};

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const ctx = await requireSession(["admin", "transport_manager", "teacher"]);
  const { page, from, to } = pageRange((await searchParams).page);
  const { rows, total, error } = await listRows<Student>(
    "students",
    "id, name, student_class, section, roll_number, parent_name, parent_phone, bus_route",
    { from, to, order: "name", filters: [{ column: "school_id", value: ctx.schoolId! }] },
  );
  const canEdit = ctx.role === "admin" || ctx.role === "transport_manager";

  return (
    <>
      <PageHeader title="Students" description="Students enrolled at your school." />
      {error && <Notice tone="error">Students could not be loaded. Please try again.</Notice>}
      <DataTable
        caption="Students"
        rows={rows}
        empty="No students yet."
        columns={[
          { key: "name", header: "Name", render: (s) => s.name },
          { key: "class", header: "Class", render: (s) => [s.student_class, s.section].filter(Boolean).join(" - ") },
          { key: "roll", header: "Roll no.", render: (s) => s.roll_number ?? "—" },
          { key: "parent", header: "Parent", render: (s) => s.parent_name ?? "—" },
          { key: "phone", header: "Parent phone", render: (s) => s.parent_phone },
          { key: "route", header: "Route", render: (s) => s.bus_route ?? "—" },
        ]}
      />
      <Pagination page={page} total={total} basePath="/students" />
      {canEdit && (
        <div className="mt-8">
          <StudentForm />
        </div>
      )}
    </>
  );
}
