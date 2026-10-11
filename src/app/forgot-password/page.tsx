"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthCard } from "@/components/auth-card";
import { SubmitButton } from "@/components/submit-button";
import { requestReset, type ForgotState } from "./actions";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState<ForgotState, FormData>(requestReset, {});
  return (
    <AuthCard title="Reset your password" subtitle="We'll email you a reset link.">
      {state.sent ? (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          If an account exists for that email, a reset link has been sent.
        </p>
      ) : (
        <form action={action} className="space-y-4">
          {state.error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
          <label className="block">
            <span className="label">Email</span>
            <input name="email" type="email" autoComplete="email" required className="input" />
          </label>
          <SubmitButton className="btn-primary w-full">Send reset link</SubmitButton>
        </form>
      )}
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="link">Back to sign in</Link>
      </p>
    </AuthCard>
  );
}
