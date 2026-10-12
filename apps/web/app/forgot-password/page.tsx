"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  AuthField,
  AuthFooter,
  AuthInput,
  authLinkClass,
  AuthSubmitButton,
} from "@/components/auth/AuthFormParts";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    setStatus(null);

    try {
      const res = await api.post<{ message: string }>("/forgot-password", { email });
      setStatus(res.message);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <AuthSplitLayout
      title="Forgot password?"
      headline={["Let’s get you", "back on the"]}
      highlight="road."
    >
      <p className="mt-2 text-[13px] text-neutral-500 sm:mt-3 sm:text-sm xl:text-base dark:text-neutral-400">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      {status && (
        <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 sm:mt-6 dark:bg-green-500/10 dark:text-green-400">
          {status}
        </div>
      )}

      <form className="mt-4 sm:mt-7 xl:mt-10" onSubmit={submit}>
        <AuthField id="email" label="Email address" icon={Mail} error={errors.email?.[0]}>
          <AuthInput
            id="email"
            type="email"
            required
            autoFocus
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </AuthField>

        <AuthSubmitButton processing={processing}>Email password reset link</AuthSubmitButton>
      </form>

      <AuthFooter>
        Remembered it?{" "}
        <Link href="/login" className={authLinkClass}>
          Back to log in
        </Link>
      </AuthFooter>
    </AuthSplitLayout>
  );
}
