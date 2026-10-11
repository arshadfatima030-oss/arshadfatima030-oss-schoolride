import { DataTable } from "@/components/data-table";
import { Notice, PageHeader } from "@/components/page-header";
import { Pagination, pageRange } from "@/components/pagination";
import { listRows } from "@/lib/queries";
import { requireSession } from "@/lib/session";

type Row = { id: number; registration_number: string | null; bus_model: string | null; seating_capacity: number | null; driver_name: string | null; assigned_route: string | null; status: string | null };

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const ctx = await requireSession(["admin", "transport_manager"]);
  const { page, from, to } = pageRange((await searchParams).page);
  const { rows, total, error } = await listRows<Row>("buses", "id, registration_number, bus_model, seating_capacity, driver_name, assigned_route, status", { filters: [{ column: "school_id", value: ctx.schoolId! }], from, to, order: "registration_number", ascending: true });

  return (
    <>
      <PageHeader title="Buses" description="Fleet vehicles." />
      <Notice>
        Read-only for now. Create and edit forms for this school-scoped table are the next step.
      </Notice>
      {error && <Notice tone="error">Records could not be loaded. Please try again.</Notice>}
      <DataTable caption="Buses" rows={rows} empty="No records yet." columns={[
          { key: "reg", header: "Registration", render: (r) => r.registration_number ?? "—" },
          { key: "model", header: "Model", render: (r) => r.bus_model ?? "—" },
          { key: "cap", header: "Capacity", render: (r) => r.seating_capacity ?? "—" },
          { key: "driver", header: "Driver", render: (r) => r.driver_name ?? "—" },
          { key: "route", header: "Route", render: (r) => r.assigned_route ?? "—" },
          { key: "status", header: "Status", render: (r) => r.status ?? "—" },
        ]} />
      <Pagination page={page} total={total} basePath="/buses" />
    </>
  );
}
