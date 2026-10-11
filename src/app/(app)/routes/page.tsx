import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { DeleteButton } from "@/components/delete-button";
import { Notice, PageHeader } from "@/components/page-header";
import { Pagination, pageRange } from "@/components/pagination";
import { RecordForm } from "@/components/record-form";
import { getRow, listRows } from "@/lib/queries";
import { canCreate, canEdit } from "@/lib/resources";
import { requireSession } from "@/lib/session";

type Row = { id: number; route_name: string; starting_point: string; destination: string; pickup_points: string | null; status: string };
const COLUMNS = "id, route_name, starting_point, destination, pickup_points, status";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; edit?: string }> }) {
  const ctx = await requireSession(["admin", "transport_manager"]);
  const sp = await searchParams;
  const { page, from, to } = pageRange(sp.page);
  const editable = canEdit("routes", ctx.role);
  const editId = Number(sp.edit);
  const [{ rows, total, error }, editing] = await Promise.all([
    listRows<Row>("routes", COLUMNS, { filters: [{ column: "school_id", value: ctx.schoolId! }], from, to, order: "route_name", ascending: true }),
    editable && Number.isSafeInteger(editId) && editId > 0 ? getRow<Row>("routes", COLUMNS, editId, ctx.schoolId!) : null,
  ]);

  return (
    <>
      <PageHeader title="Routes" description="Transport routes and pickup points." />
      {error && <Notice tone="error">Records could not be loaded. Please try again.</Notice>}
      <DataTable caption="Routes" rows={rows} empty="No records yet." columns={[
          { key: "name", header: "Route", render: (r: Row) => r.route_name },
          { key: "from", header: "From", render: (r: Row) => r.starting_point },
          { key: "to", header: "To", render: (r: Row) => r.destination },
          { key: "stops", header: "Pickup points", render: (r: Row) => r.pickup_points || "—" },
          { key: "status", header: "Status", render: (r: Row) => r.status },
          ...(editable
            ? [{
                key: "actions",
                header: "Actions",
                render: (r: Row) => (
                  <div className="flex items-center gap-3">
                    <Link href={`/routes?edit=${r.id}`} className="text-sm font-medium text-indigo-700 hover:underline">Edit</Link>
                    {ctx.role === "admin" && <DeleteButton resource="routes" id={r.id} label="record" />}
                  </div>
                ),
              }]
            : []),
        ]} />
      <Pagination page={page} total={total} basePath="/routes" />
      <div className="mt-8">
        {editing ? (
          <RecordForm key={editing.id} resource="routes" id={editing.id} initial={editing} />
        ) : canCreate("routes", ctx.role) ? (
          <RecordForm resource="routes" initial={{ status: "Active" }} />
        ) : null}
      </div>
    </>
  );
}
