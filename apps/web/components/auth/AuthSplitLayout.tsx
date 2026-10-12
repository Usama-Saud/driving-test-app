
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import HandUnderline from "@/components/ui/HandUnderline";
import { Apple, Google, Microsoft } from "@/components/ui/SocialIcons";

/* =========================================
   Shared Authentication Styles
========================================= */

export const authInputClass =
  "h-10 rounded-xl border-neutral-200 bg-white pl-10 text-sm! text-neutral-900 placeholder:text-neutral-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/30 sm:h-11 sm:pl-12 sm:text-base! xl:h-12 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500";

export const authLabelClass =
  "text-xs font-medium text-neutral-800 sm:text-sm dark:text-neutral-200";

export const authFieldIconClass =
  "pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-neutral-500 sm:left-4 sm:size-5 xl:size-5.5 dark:text-neutral-400";

export const authLinkClass =
  "font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400";

export const authSubmitClass =
  "mt-5 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#4a7cf3] to-[#1f4fe0] text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(37,99,235,0.7)] transition hover:brightness-110 focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 sm:mt-6 sm:h-11 sm:text-base xl:mt-7 xl:h-12 xl:gap-2.5";

/* =========================================
   Social Providers
========================================= */

const SOCIAL_PROVIDERS = [
  { name: "Google", Icon: Google },
  { name: "Apple", Icon: Apple },
  { name: "Microsoft", Icon: Microsoft },
];

/* =========================================
   Social Sign In
========================================= */

export function SocialSignIn() {
  return (
    <>
      <div className="mt-5 flex items-center gap-4 sm:mt-6 xl:mt-7">
        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />

        <span className="shrink-0 text-xs text-neutral-500 sm:text-sm dark:text-neutral-400">
          or continue with
        </span>

        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3 xl:gap-4">
        {SOCIAL_PROVIDERS.map(({ name, Icon }) => (
          <button
            key={name}
            type="button"
            disabled
            title={`Sign in with ${name} — coming soon`}
            className="flex h-10 min-w-0 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-1 text-xs font-medium text-neutral-900 sm:h-11 sm:gap-2 sm:text-sm xl:h-12 xl:gap-3 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <Icon
              aria-hidden="true"
              className="size-4 shrink-0 sm:size-5"
            />

            <span className="truncate">{name}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* =========================================
   Auth Footer
========================================= */

export function AuthFooter({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="mt-5 text-center text-sm text-neutral-500 sm:mt-6 sm:text-base xl:mt-7 dark:text-neutral-400">
      {children}
    </p>
  );
}

/* =========================================
   Authentication Split Layout
========================================= */

export default function AuthSplitLayout({
  title,
  headline,
  highlight,
  children,
}: {
  title: string;
  headline: [string, string];
  highlight: string;
  children: ReactNode;
}) {
  const [firstLine, secondLine] = headline;

  return (
    <div
      className="
        min-h-svh w-full min-w-0
        bg-white dark:bg-neutral-900
        md:grid md:grid-cols-[42fr_58fr]
        lg:grid-cols-[45fr_55fr]
        2xl:grid-cols-[50fr_50fr]
      "
    >
      {/* =====================================
          Image Panel
      ===================================== */}

      <div
        className="
          relative min-w-0
          bg-[#76bde9]
          dark:bg-[#24415c]
        "
      >
        <div
          className="
            relative h-40 w-full overflow-hidden
            sm:h-52

            md:sticky
            md:top-0
            md:h-[min(850px,85svh)]

            lg:h-svh
          "
        >
          <Image
            src="/vehicles/login-page-car.png"
            alt="Car driving along a coastal mountain road"
            fill
            priority
            quality={85}
            sizes="(min-width: 1536px) 50vw, (min-width: 1024px) 45vw, (min-width: 768px) 42vw, 100vw"
            className="
              object-cover
              object-[center_85%]
              md:object-[60%_95%]
              lg:object-[60%_75%]
              2xl:object-center
            "
          />

          {/* Gradient Overlay */}
          <div
            className="
              pointer-events-none absolute inset-x-0 top-0
              h-3/5
              bg-linear-to-b from-white/55 to-transparent
              md:hidden
            "
          />

          {/* Headline */}
          <Link
            href="/"
            aria-label="Driving Test home"
            className="
              absolute inset-x-0 top-0
              px-5 pt-5
              sm:px-8 sm:pt-8
              md:px-[7%]
              md:pt-[clamp(3rem,8vh,7rem)]
              xl:px-[9%]
              xl:pt-[clamp(5rem,12vh,10rem)]
            "
          >
            <p
              className="
                font-sora font-semibold
                leading-[1.15]
                tracking-[-0.035em]
                text-neutral-900
                text-2xl
                sm:text-3xl
                md:text-[clamp(24px,2.7vw,36px)]
                xl:text-[clamp(36px,3.5vw,56px)]
              "
            >
              {firstLine}
              <br />
              {secondLine}{" "}
              <span className="relative inline-block text-blue-600">
                {highlight}
                <HandUnderline
                  className="
                    pointer-events-none
                    absolute bottom-[-0.16em] left-0
                    h-[0.16em] w-full
                  "
                />
              </span>
            </p>
          </Link>
        </div>
      </div>

      {/* =====================================
          Form Section
      ===================================== */}

      <div
        className="
          flex min-w-0 items-start justify-center
          px-5 pt-5 pb-6
          sm:px-8 sm:pt-8 sm:pb-10
          md:px-6 md:pt-12 md:pb-10
          lg:items-center lg:px-8 lg:py-8
          2xl:px-12
        "
      >
        <div className="w-full min-w-0 max-w-[494px]">
          {/* Form Title */}
          <h1
            className="
              font-sora font-bold
              leading-[1.1]
              tracking-[-0.04em]
              text-neutral-950 dark:text-white
              text-2xl
              sm:text-3xl
              md:text-[clamp(26px,3vw,38px)]
              xl:text-[clamp(36px,3.5vw,56px)]
            "
          >
            {title}
          </h1>

          {/* Login / Registration Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
