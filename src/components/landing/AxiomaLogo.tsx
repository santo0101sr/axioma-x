import React from "react";

interface AxiomaLogoProps {
  variant?: "auto" | "dark" | "light";
  size?: "sm" | "md";
}

export function AxiomaLogo({ variant = "auto", size = "md" }: AxiomaLogoProps) {
  const boxSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const textSize = size === "sm" ? "text-base" : "text-lg";
  const textColor =
    variant === "dark"
      ? "text-white"
      : variant === "light"
      ? "text-slate-900"
      : "text-slate-900 dark:text-white";
  const accentColor =
    variant === "light" ? "text-blue-600" : "text-blue-600 dark:text-blue-400";

  return (
    <div className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap">
      <div
        className={`relative flex ${boxSize} items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm shadow-slate-900/10 dark:border-white/15 dark:shadow-black/30`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/axioma-logo.png"
          alt="Axioma-X Logo"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className={`${textSize} font-extrabold tracking-tight ${textColor}`}>
          Axioma
        </span>
        <span className={`${textSize} font-extrabold ${accentColor}`}>-X</span>
      </div>
    </div>
  );
}
