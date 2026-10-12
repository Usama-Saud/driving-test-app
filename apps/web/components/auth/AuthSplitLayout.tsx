import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import HandUnderline from "@/components/ui/HandUnderline";

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
    <div className="flex min-h-svh flex-col bg-white lg:landscape:grid lg:landscape:grid-cols-[45fr_55fr] 2xl:grid-cols-2 dark:bg-neutral-900">
      <div className="relative max-h-64 min-h-24 flex-1 overflow-hidden sm:max-h-80 md:max-h-[26rem] lg:landscape:sticky lg:landscape:top-0 lg:landscape:h-svh lg:landscape:max-h-none">
        <Image
          src="/vehicles/login-page-car.png"
          alt="Car driving along a coastal mountain road"
          fill
          priority
          quality={85}
          sizes="(min-width: 1536px) 50vw, (min-width: 1024px) 45vw, 100vw"
          className="object-cover object-[49%_92%]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-3/4 bg-linear-to-b from-white/85 via-white/45 to-transparent max-lg:[@media(max-height:720px)]:hidden lg:landscape:hidden" />
        <Link
          href="/"
          aria-label="Driving Test home"
          className="absolute inset-x-0 top-0 max-lg:[@media(max-height:720px)]:hidden px-5 pt-5 sm:px-8 sm:pt-7 md:px-12 md:pt-10 lg:landscape:px-[8%] lg:landscape:pt-[clamp(3rem,10vh,7rem)] xl:px-[9%] xl:pt-[clamp(5rem,14vh,10rem)]"
        >
          <p className="font-sora text-2xl leading-[1.15] font-semibold tracking-[-0.035em] text-neutral-900 sm:text-3xl md:text-4xl lg:landscape:text-[clamp(30px,3.2vw,40px)] xl:text-[clamp(40px,3.8vw,60px)]">
            {firstLine}
            <br />
            {secondLine}{" "}
            <span className="relative inline-block text-blue-600">
              {highlight}
              <HandUnderline className="pointer-events-none absolute bottom-[-0.16em] left-0 h-[0.16em] w-full" />
            </span>
          </p>
        </Link>
      </div>

      <div className="flex shrink-0 justify-center px-5 pt-5 pb-6 sm:px-10 sm:pt-10 sm:pb-12 md:pt-12 md:pb-14 lg:landscape:items-center lg:landscape:px-10 lg:landscape:py-10 2xl:px-12">
        <div className="w-full max-w-[494px]">
          <h1 className="font-sora text-[26px] leading-[1.1] font-bold tracking-[-0.04em] text-neutral-950 sm:text-[34px] md:text-[38px] lg:landscape:text-[clamp(32px,3.2vw,40px)] xl:text-[clamp(40px,3.6vw,56px)] dark:text-white">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
}
