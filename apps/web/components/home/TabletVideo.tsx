"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

const POSTER = "/bestapp/quiz-tablet-poster.png";
const LABEL = "A DriveLane practice question shown on a tablet";

const subscribe = () => () => {};
const canPlayAlphaVideo = () =>
  !/^((?!chrome|chromium|crios|fxios|edg|android).)*safari/i.test(navigator.userAgent);

export default function TabletVideo({ className }: { className?: string }) {
  const canPlayAlpha = useSyncExternalStore(subscribe, canPlayAlphaVideo, () => false);

  if (!canPlayAlpha) {
    return (
      <Image
        src={POSTER}
        alt={LABEL}
        width={1544}
        height={1128}
        sizes="(min-width: 860px) 810px, 100vw"
        className={className}
      />
    );
  }

  return (
    <video
      src="/bestapp/quiz-tablet-transparent.webm"
      poster={POSTER}
      width={1544}
      height={1128}
      autoPlay
      muted
      loop
      playsInline
      aria-label={LABEL}
      className={className}
    />
  );
}
