import React from "react";

interface AxiomaLogoProps {
  variant?: "dark" | "light";
  size?: "sm" | "md";
}

export function AxiomaLogo({ variant = "dark", size = "md" }: AxiomaLogoProps) {
  const boxSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const textSize = size === "sm" ? "text-base" : "text-lg";

  return (
    <div className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap">
      <div
        className={`relative flex ${boxSize} items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white p-0.5 shadow-sm shadow-black/30`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/axioma-logo.png"
          alt="Axioma-X Logo"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex items-baseline gap-0.5">
        <span
          className={`${textSize} font-extrabold tracking-tight ${
            variant === "dark" ? "text-white" : "text-slate-900"
          }`}
        >
          Axioma
        </span>
        <span className={`${textSize} font-extrabold text-blue-400`}>-X</span>
      </div>
    </div>
  );
}
