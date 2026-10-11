export type Column<T> = { key: string; header: string; render: (row: T) => React.ReactNode };

export function DataTable<T extends { id: number | string }>({
  columns,
  rows,
  empty,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  empty: string;
  caption: string;
}) {
  if (rows.length === 0) {
    return <div className="card text-center text-sm text-slate-500">{empty}</div>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-slate-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              {columns.map((c) => (
                <td key={c.key} className="whitespace-nowrap px-4 py-3 text-slate-700">{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
