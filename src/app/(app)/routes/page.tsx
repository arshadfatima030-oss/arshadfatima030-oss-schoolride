import { DataTable } from "@/components/data-table";
import { Notice, PageHeader } from "@/components/page-header";
import { Pagination, pageRange } from "@/components/pagination";
import { listRows } from "@/lib/queries";
import { requireSession } from "@/lib/session";

type Row = { id: number; route_name: string; starting_point: string; destination: string; pickup_points: string | null; status: string };

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const ctx = await requireSession(["admin", "transport_manager"]);
  const { page, from, to } = pageRange((await searchParams).page);
  const { rows, total, error } = await listRows<Row>("routes", "id, route_name, starting_point, destination, pickup_points, status", { filters: [{ column: "school_id", value: ctx.schoolId! }], from, to, order: "route_name", ascending: true });

  return (
    <>
      <PageHeader title="Routes" description="Transport routes and pickup points." />
      <Notice>
        Read-only for now. Create and edit forms for this school-scoped table are the next step.
      </Notice>
      {error && <Notice tone="error">Records could not be loaded. Please try again.</Notice>}
      <DataTable caption="Routes" rows={rows} empty="No records yet." columns={[
          { key: "name", header: "Route", render: (r) => r.route_name },
          { key: "from", header: "From", render: (r) => r.starting_point },
          { key: "to", header: "To", render: (r) => r.destination },
          { key: "stops", header: "Pickup points", render: (r) => r.pickup_points || "—" },
          { key: "status", header: "Status", render: (r) => r.status },
        ]} />
      <Pagination page={page} total={total} basePath="/routes" />
    </>
  );
}
