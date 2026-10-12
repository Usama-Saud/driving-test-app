"use client";

import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
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
  SocialSignIn,
} from "@/components/auth/AuthSplitLayout";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import InputError from "@/components/ui/InputError";
import { Label } from "@/components/ui/Label";
import PasswordInput from "@/components/ui/PasswordInput";
import Spinner from "@/components/ui/Spinner";
import { ApiError, useAuth } from "@/lib/auth-context";
import { isValidState, stateToSlug } from "@/lib/usStates";

function LoginPageInner() {
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  // Where to land after a successful login — e.g. back at /pricing to resume a checkout the
  // user started before we sent them here to authenticate. Falls back to the dashboard.
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function submit(e: FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      await login(email, password);
      if (redirect) {
        router.push(redirect);
        return;
      }
      const storedState = localStorage.getItem("selectedState");
      router.push(
        storedState && isValidState(storedState)
          ? `/${stateToSlug(storedState)}`
          : "/dashboard",
      );
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setProcessing(false);
    }
  }

  const registerHref = redirect
    ? `/register?redirect=${encodeURIComponent(redirect)}`
    : "/register";

  return (
    <AuthSplitLayout
      title="Welcome back!"
      headline={["Let’s get you", "back on the"]}
      highlight="road."
    >
      <form className="mt-5 sm:mt-7 xl:mt-10" onSubmit={submit}>
        <div className="grid gap-2 sm:gap-2.5">
          <Label htmlFor="email" className={authLabelClass}>
            Email address
          </Label>
          <div className="relative">
            <Mail aria-hidden="true" strokeWidth={1.75} className={authFieldIconClass} />
            <Input
              id="email"
              type="email"
              required
              autoFocus
              tabIndex={1}
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
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="password" className={authLabelClass}>
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline sm:text-base dark:text-blue-400"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole aria-hidden="true" strokeWidth={1.75} className={authFieldIconClass} />
            <PasswordInput
              id="password"
              required
              tabIndex={2}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={`${authInputClass} pr-12! sm:pr-14!`}
              toggleClassName="px-3 sm:px-4.5 text-neutral-600 dark:text-neutral-300"
              iconClassName="size-4 sm:size-5.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <InputError message={errors.password?.[0]} />
        </div>

        <Label
          htmlFor="remember"
          className={`mt-4 sm:mt-5 w-fit cursor-pointer gap-3.5 ${authLabelClass}`}
        >
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={setRemember}
            className="size-5 rounded-md sm:size-5.5 border-neutral-300 bg-white focus-visible:border-blue-500 focus-visible:ring-blue-500/30 data-checked:border-blue-600 data-checked:bg-blue-600 data-checked:text-white dark:border-neutral-600 dark:bg-neutral-800 dark:data-checked:bg-blue-600 [&_svg]:size-4! [&_svg]:stroke-3"
          />
          Remember me
        </Label>

        <button
          type="submit"
          disabled={processing}
          className={authSubmitClass}
        >
          {processing && <Spinner />}
          Log in
          <ArrowRight aria-hidden="true" strokeWidth={2.25} className="size-5 sm:size-5.5" />
        </button>
      </form>

      <SocialSignIn />

      <AuthFooter>
        Don&apos;t have an account?
        <Link
          href={registerHref}
          className={`ml-1.5 sm:ml-2 ${authLinkClass}`}
        >
          Create an account
        </Link>
      </AuthFooter>
    </AuthSplitLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
