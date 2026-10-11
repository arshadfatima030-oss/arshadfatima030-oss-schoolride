"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

export function LoginForm({ next, message }: { next?: string; message?: string }) {
  const [state, action] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      {message && <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">{message}</p>}
      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <label className="block">
        <span className="label">Email</span>
        <input name="email" type="email" autoComplete="email" required className="input" />
      </label>
      <label className="block">
        <span className="label">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="input" />
      </label>
      <SubmitButton className="btn-primary w-full">Sign in</SubmitButton>
      <p className="text-center text-sm">
        <Link href="/forgot-password" className="link">Forgot password?</Link>
      </p>
    </form>
  );
}
