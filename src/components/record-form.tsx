"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import { saveRecord, type RecordFormState } from "@/app/(app)/_records/actions";
import { RESOURCES, type Option, type ResourceKey } from "@/lib/resources";

type Values = Record<string, string | number | null | undefined>;

export function RecordForm({
  resource,
  id = null,
  initial = {},
  options = {},
}: {
  resource: ResourceKey;
  id?: number | null;
  initial?: Values;
  options?: Record<string, Option[]>;
}) {
  const config = RESOURCES[resource];
  const [state, action] = useActionState<RecordFormState, FormData>(saveRecord.bind(null, resource, id), {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && id === null) formRef.current?.reset();
  }, [state, id]);

  const title = `${id === null ? "Add" : "Edit"} ${config.label}`;
  return (
    <form ref={formRef} action={action} className="card space-y-4" aria-label={title}>
      <h2 className="text-base font-semibold">{title}</h2>
      {state.error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state.ok && <p role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-800">Saved.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {config.fields.map((f) => {
          const choices = options[f.name] ?? ("options" in f ? f.options : undefined);
          const value = initial[f.name] ?? "";
          return (
            <label key={f.name} className="block">
              <span className="label">
                {f.label}
                {"required" in f && f.required && <span className="text-red-600"> *</span>}
              </span>
              {choices ? (
                <select name={f.name} required={"required" in f && f.required} defaultValue={String(value)} className="input">
                  <option value="" disabled>Select…</option>
                  {choices.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  name={f.name}
                  type={"type" in f ? f.type : "text"}
                  required={"required" in f && f.required}
                  defaultValue={String(value)}
                  className="input"
                />
              )}
            </label>
          );
        })}
      </div>
      <div className="flex gap-3">
        <SubmitButton className="btn-primary">Save {config.label}</SubmitButton>
        {id !== null && <Link href={config.path} className="btn-secondary">Cancel</Link>}
      </div>
    </form>
  );
}
