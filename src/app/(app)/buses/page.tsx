import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { DeleteButton } from "@/components/delete-button";
import { Notice, PageHeader } from "@/components/page-header";
import { Pagination, pageRange } from "@/components/pagination";
import { RecordForm } from "@/components/record-form";
import { getRow, listRows } from "@/lib/queries";
import { canCreate, canEdit } from "@/lib/resources";
import { requireSession } from "@/lib/session";

type Row = { id: number; registration_number: string | null; bus_model: string | null; seating_capacity: number | null; driver_name: string | null; assigned_route: string | null; status: string | null };
const COLUMNS = "id, registration_number, bus_model, seating_capacity, driver_name, assigned_route, status";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; edit?: string }> }) {
  const ctx = await requireSession(["admin", "transport_manager"]);
  const sp = await searchParams;
  const { page, from, to } = pageRange(sp.page);
  const editable = canEdit("buses", ctx.role);
  const editId = Number(sp.edit);
  const [{ rows, total, error }, editing] = await Promise.all([
    listRows<Row>("buses", COLUMNS, { filters: [{ column: "school_id", value: ctx.schoolId! }], from, to, order: "registration_number", ascending: true }),
    editable && Number.isSafeInteger(editId) && editId > 0 ? getRow<Row>("buses", COLUMNS, editId, ctx.schoolId!) : null,
  ]);

  return (
    <>
      <PageHeader title="Buses" description="Fleet vehicles." />
      {error && <Notice tone="error">Records could not be loaded. Please try again.</Notice>}
      <DataTable caption="Buses" rows={rows} empty="No records yet." columns={[
          { key: "reg", header: "Registration", render: (r: Row) => r.registration_number ?? "—" },
          { key: "model", header: "Model", render: (r: Row) => r.bus_model ?? "—" },
          { key: "cap", header: "Capacity", render: (r: Row) => r.seating_capacity ?? "—" },
          { key: "driver", header: "Driver", render: (r: Row) => r.driver_name ?? "—" },
          { key: "route", header: "Route", render: (r: Row) => r.assigned_route ?? "—" },
          { key: "status", header: "Status", render: (r: Row) => r.status ?? "—" },
          ...(editable
            ? [{
                key: "actions",
                header: "Actions",
                render: (r: Row) => (
                  <div className="flex items-center gap-3">
                    <Link href={`/buses?edit=${r.id}`} className="text-sm font-medium text-indigo-700 hover:underline">Edit</Link>
                    {ctx.role === "admin" && <DeleteButton resource="buses" id={r.id} label="record" />}
                  </div>
                ),
              }]
            : []),
        ]} />
      <Pagination page={page} total={total} basePath="/buses" />
      <div className="mt-8">
        {editing ? (
          <RecordForm key={editing.id} resource="buses" id={editing.id} initial={editing} />
        ) : canCreate("buses", ctx.role) ? (
          <RecordForm resource="buses" initial={{ status: "Active" }} />
        ) : null}
      </div>
    </>
  );
}
