import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function buttonClass(
  variant: ButtonVariant = "primary",
  className?: string,
) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-45",
    variant === "primary" &&
      "bg-accent text-[#07110b] shadow-[0_10px_32px_rgba(94,228,154,.16)] hover:bg-white",
    variant === "secondary" &&
      "border border-white/10 bg-white/[.055] text-white hover:bg-white/10",
    variant === "ghost" && "text-muted hover:bg-white/[.05] hover:text-white",
    variant === "danger" &&
      "border border-red-400/20 bg-red-400/10 text-red-200 hover:bg-red-400/20",
    className,
  );
}

export function Button({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClass("primary", className)} {...props}>
      {children}
    </button>
  );
}
