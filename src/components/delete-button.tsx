"use client";

import { deleteRecord } from "@/app/(app)/_records/actions";
import type { ResourceKey } from "@/lib/resources";

export function DeleteButton({ resource, id, label }: { resource: ResourceKey; id: number; label: string }) {
  return (
    <form
      action={deleteRecord.bind(null, resource, id)}
      onSubmit={(e) => {
        if (!confirm(`Delete this ${label}? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <button type="submit" className="text-sm font-medium text-red-700 hover:underline">Delete</button>
    </form>
  );
}
