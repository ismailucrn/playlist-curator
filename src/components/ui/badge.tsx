import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "violet" | "danger";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        tone === "neutral" && "text-muted border-white/10 bg-white/[.045]",
        tone === "accent" && "border-accent/20 bg-accent/10 text-accent",
        tone === "violet" && "border-violet/20 bg-violet/10 text-violet",
        tone === "danger" && "border-red-300/20 bg-red-400/10 text-red-200",
        className,
      )}
    >
      {children}
    </span>
  );
}
