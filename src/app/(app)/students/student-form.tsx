"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import { createStudent, type StudentFormState } from "./actions";

const fields: { name: string; label: string; required?: boolean; type?: string }[] = [
  { name: "name", label: "Student name", required: true },
  { name: "student_class", label: "Class", required: true },
  { name: "section", label: "Section" },
  { name: "roll_number", label: "Roll number" },
  { name: "parent_name", label: "Parent / guardian name" },
  { name: "parent_phone", label: "Parent phone", required: true, type: "tel" },
  { name: "parent_email", label: "Parent email", type: "email" },
  { name: "home_address", label: "Home address" },
];

export function StudentForm() {
  const [state, action] = useActionState<StudentFormState, FormData>(createStudent, {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="card space-y-4">
      <h2 className="text-base font-semibold">Add student</h2>
      {state.error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state.ok && <p role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-800">Student added.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.name} className="block">
            <span className="label">
              {f.label}
              {f.required && <span className="text-red-600"> *</span>}
            </span>
            <input name={f.name} type={f.type ?? "text"} required={f.required} className="input" />
          </label>
        ))}
      </div>
      <SubmitButton className="btn-primary">Save student</SubmitButton>
    </form>
  );
}
