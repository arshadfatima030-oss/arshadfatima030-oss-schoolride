export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export function Notice({ tone = "warning", children }: { tone?: "warning" | "error" | "info"; children: React.ReactNode }) {
  const styles = {
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-sky-200 bg-sky-50 text-sky-900",
  }[tone];
  return <div role={tone === "error" ? "alert" : "status"} className={`mb-6 rounded-lg border p-4 text-sm ${styles}`}>{children}</div>;
}
