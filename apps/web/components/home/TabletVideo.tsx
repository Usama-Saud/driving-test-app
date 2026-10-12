"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

export default function TabletVideo({ className }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  return (
    <video
      key={dark ? "dark" : "light"}
      src={dark ? "/bestapp/quiz-tablet-dark.mp4" : "/bestapp/quiz-tablet-light.mp4"}
      poster="/bestapp/quiz-tablet-poster.png"
      width={1536}
      height={1120}
      autoPlay
      muted
      loop
      playsInline
      aria-label="A DriveLane practice question shown on a tablet"
      className={className}
    />
  );
}
