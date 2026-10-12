"use client";

import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import AuthSplitLayout, {
  AuthFooter,
  authFieldIconClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
  authSubmitClass,
} from "@/components/auth/AuthSplitLayout";
import { Input } from "@/components/ui/Input";
import InputError from "@/components/ui/InputError";
import { Label } from "@/components/ui/Label";
import PasswordInput from "@/components/ui/PasswordInput";
import Spinner from "@/components/ui/Spinner";
import { ApiError, useAuth } from "@/lib/auth-context";

function RegisterPageInner() {
  const router = useRouter();
  const { register } = useAuth();
  const searchParams = useSearchParams();
  // Same purpose as the login page's redirect param — e.g. resuming a checkout the user
  // started before we sent them here to create an account. Registration doesn't require a
  // verified email to check out (no verification middleware on the billing routes), so it's
  // safe to go straight there instead of the default /verify-email reminder.
  const redirect = searchParams.get("redirect");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function submit(e: FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      await register(name, email, password, passwordConfirmation);
      router.push(redirect || "/verify-email");
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
      title="Create an account"
      headline={["Let’s get you", "ready for the"]}
      highlight="road."
    >
      <form className="mt-5 sm:mt-7 xl:mt-10" onSubmit={submit}>
        <div className="grid gap-2 sm:gap-2.5">
          <Label htmlFor="name" className={authLabelClass}>
            Name
          </Label>
          <div className="relative">
            <UserRound aria-hidden="true" strokeWidth={1.75} className={authFieldIconClass} />
            <Input
              id="name"
              type="text"
              required
              autoFocus
              tabIndex={1}
              autoComplete="name"
              placeholder="Your full name"
              className={authInputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <InputError message={errors.name?.[0]} />
        </div>

        <div className="mt-4 grid gap-2 sm:mt-5 sm:gap-2.5">
          <Label htmlFor="email" className={authLabelClass}>
            Email address
          </Label>
          <div className="relative">
            <Mail aria-hidden="true" strokeWidth={1.75} className={authFieldIconClass} />
            <Input
              id="email"
              type="email"
              required
              tabIndex={2}
              autoComplete="email"
              placeholder="you@example.com"
              className={authInputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <InputError message={errors.email?.[0]} />
        </div>

        <div className="mt-4 grid gap-2 sm:mt-5 sm:gap-2.5">
          <Label htmlFor="password" className={authLabelClass}>
            Password
          </Label>
          <div className="relative">
            <LockKeyhole aria-hidden="true" strokeWidth={1.75} className={authFieldIconClass} />
            <PasswordInput
              id="password"
              required
              tabIndex={3}
              autoComplete="new-password"
              placeholder="Create a password"
              className={`${authInputClass} pr-12! sm:pr-14!`}
              toggleClassName="px-3 sm:px-4.5 text-neutral-600 dark:text-neutral-300"
              iconClassName="size-4 sm:size-5.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <InputError message={errors.password?.[0]} />
        </div>

        <div className="mt-4 grid gap-2 sm:mt-5 sm:gap-2.5">
          <Label htmlFor="password_confirmation" className={authLabelClass}>
            Confirm password
          </Label>
          <div className="relative">
            <LockKeyhole aria-hidden="true" strokeWidth={1.75} className={authFieldIconClass} />
            <PasswordInput
              id="password_confirmation"
              required
              tabIndex={4}
              autoComplete="new-password"
              placeholder="Confirm your password"
              className={`${authInputClass} pr-12! sm:pr-14!`}
              toggleClassName="px-3 sm:px-4.5 text-neutral-600 dark:text-neutral-300"
              iconClassName="size-4 sm:size-5.5"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </div>
          <InputError message={errors.password_confirmation?.[0]} />
        </div>

        <button type="submit" disabled={processing} className={authSubmitClass}>
          {processing && <Spinner />}
          Create account
          <ArrowRight aria-hidden="true" strokeWidth={2.25} className="size-5 sm:size-5.5" />
        </button>
      </form>

      <AuthFooter>
        Already have an account?
        <Link
          href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
          className={`ml-1.5 sm:ml-2 ${authLinkClass}`}
        >
          Log in
        </Link>
      </AuthFooter>
    </AuthSplitLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  );
}
