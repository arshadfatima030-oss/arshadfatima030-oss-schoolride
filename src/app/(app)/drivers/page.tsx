import { DataTable } from "@/components/data-table";
import { Notice, PageHeader } from "@/components/page-header";
import { Pagination, pageRange } from "@/components/pagination";
import { listRows } from "@/lib/queries";
import { requireSession } from "@/lib/session";

type Row = { id: number; driver_name: string; phone: string; license_number: string; assigned_bus: string | null; status: string };

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const ctx = await requireSession(["admin", "transport_manager"]);
  const { page, from, to } = pageRange((await searchParams).page);
  const { rows, total, error } = await listRows<Row>("drivers", "id, driver_name, phone, license_number, assigned_bus, status", { filters: [{ column: "school_id", value: ctx.schoolId! }], from, to, order: "driver_name", ascending: true });

  return (
    <>
      <PageHeader title="Drivers" description="Drivers and licence details." />
      <Notice>
        Read-only for now. Create and edit forms for this school-scoped table are the next step.
      </Notice>
      {error && <Notice tone="error">Records could not be loaded. Please try again.</Notice>}
      <DataTable caption="Drivers" rows={rows} empty="No records yet." columns={[
          { key: "name", header: "Name", render: (r) => r.driver_name },
          { key: "phone", header: "Phone", render: (r) => r.phone },
          { key: "licence", header: "Licence no.", render: (r) => r.license_number },
          { key: "bus", header: "Assigned bus", render: (r) => r.assigned_bus || "—" },
          { key: "status", header: "Status", render: (r) => r.status },
        ]} />
      <Pagination page={page} total={total} basePath="/drivers" />
    </>
  );
}
