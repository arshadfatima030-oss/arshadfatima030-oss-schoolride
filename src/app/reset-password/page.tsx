"use client";

import { useActionState } from "react";
import { AuthCard } from "@/components/auth-card";
import { SubmitButton } from "@/components/submit-button";
import { updatePassword, type ResetState } from "./actions";

export default function ResetPasswordPage() {
  const [state, action] = useActionState<ResetState, FormData>(updatePassword, {});
  return (
    <AuthCard title="Choose a new password">
      <form action={action} className="space-y-4">
        {state.error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
        <label className="block">
          <span className="label">New password</span>
          <input name="password" type="password" autoComplete="new-password" minLength={8} required className="input" />
        </label>
        <label className="block">
          <span className="label">Confirm password</span>
          <input name="confirm" type="password" autoComplete="new-password" minLength={8} required className="input" />
        </label>
        <SubmitButton className="btn-primary w-full">Update password</SubmitButton>
      </form>
    </AuthCard>
  );
}
