import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { DeleteButton } from "@/components/delete-button";
import { Notice, PageHeader } from "@/components/page-header";
import { Pagination, pageRange } from "@/components/pagination";
import { RecordForm } from "@/components/record-form";
import { getRow, listRows } from "@/lib/queries";
import { canCreate, canEdit } from "@/lib/resources";
import { requireSession } from "@/lib/session";

type Row = { id: number; driver_name: string; phone: string; license_number: string; assigned_bus: string | null; status: string };
const COLUMNS = "id, driver_name, phone, license_number, assigned_bus, status";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; edit?: string }> }) {
  const ctx = await requireSession(["admin", "transport_manager"]);
  const sp = await searchParams;
  const { page, from, to } = pageRange(sp.page);
  const editable = canEdit("drivers", ctx.role);
  const editId = Number(sp.edit);
  const [{ rows, total, error }, editing] = await Promise.all([
    listRows<Row>("drivers", COLUMNS, { filters: [{ column: "school_id", value: ctx.schoolId! }], from, to, order: "driver_name", ascending: true }),
    editable && Number.isSafeInteger(editId) && editId > 0 ? getRow<Row>("drivers", COLUMNS, editId, ctx.schoolId!) : null,
  ]);

  return (
    <>
      <PageHeader title="Drivers" description="Drivers on your transport team." />
      {error && <Notice tone="error">Records could not be loaded. Please try again.</Notice>}
      <DataTable caption="Drivers" rows={rows} empty="No records yet." columns={[
          { key: "name", header: "Name", render: (r: Row) => r.driver_name },
          { key: "phone", header: "Phone", render: (r: Row) => r.phone },
          { key: "licence", header: "Licence", render: (r: Row) => r.license_number },
          { key: "bus", header: "Bus", render: (r: Row) => r.assigned_bus || "—" },
          { key: "status", header: "Status", render: (r: Row) => r.status },
          ...(editable
            ? [{
                key: "actions",
                header: "Actions",
                render: (r: Row) => (
                  <div className="flex items-center gap-3">
                    <Link href={`/drivers?edit=${r.id}`} className="text-sm font-medium text-indigo-700 hover:underline">Edit</Link>
                    {ctx.role === "admin" && <DeleteButton resource="drivers" id={r.id} label="record" />}
                  </div>
                ),
              }]
            : []),
        ]} />
      <Pagination page={page} total={total} basePath="/drivers" />
      <div className="mt-8">
        {editing ? (
          <RecordForm key={editing.id} resource="drivers" id={editing.id} initial={editing} />
        ) : canCreate("drivers", ctx.role) ? (
          <RecordForm resource="drivers" initial={{ status: "Active" }} />
        ) : null}
      </div>
    </>
  );
}
