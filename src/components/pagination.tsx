import Link from "next/link";

export const PAGE_SIZE = 25;

export function pageRange(pageParam: string | undefined) {
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  return { page, from, to: from + PAGE_SIZE - 1 };
}

export function Pagination({ page, total, basePath }: { page: number; total: number; basePath: string }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm text-slate-600">
      <span>Page {page} of {pages} · {total} records</span>
      <div className="flex gap-2">
        {page > 1 && <Link className="btn-secondary" href={`${basePath}?page=${page - 1}`}>Previous</Link>}
        {page < pages && <Link className="btn-secondary" href={`${basePath}?page=${page + 1}`}>Next</Link>}
      </div>
    </nav>
  );
}
