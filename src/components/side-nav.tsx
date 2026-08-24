"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Listeler", icon: LayoutGrid },
  { href: "/settings", label: "Ayarlar", icon: Settings2 },
];

export function SideNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className={cn(mobile ? "flex items-center gap-1" : "mt-10 space-y-1")}>
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href ||
          pathname.startsWith(`${href}/`) ||
          (href === "/dashboard" && pathname.startsWith("/playlists"));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-accent/10 text-accent"
                : "text-muted hover:bg-white/[.04] hover:text-white",
              mobile && "px-3",
            )}
          >
            <Icon className="size-[18px]" />
            {!mobile ? label : <span className="sr-only">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
