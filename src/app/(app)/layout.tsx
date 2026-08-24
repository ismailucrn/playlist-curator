import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { getCurrentUser } from "@/auth/session";
import { Brand } from "@/components/brand";
import { SideNav } from "@/components/side-nav";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-white/[.07] bg-[#090d0c]/85 p-6 backdrop-blur-xl lg:flex lg:flex-col">
        <Brand />
        <SideNav />
        <div className="mt-auto rounded-2xl border border-white/[.07] bg-white/[.025] p-3.5">
          <div className="flex items-center gap-3">
            <span className="bg-violet/15 text-violet grid size-9 place-items-center rounded-xl text-xs font-bold">
              {user.displayName.slice(0, 2).toLocaleUpperCase("tr-TR")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.displayName}</p>
              <Badge
                tone={user.mode === "spotify" ? "accent" : "violet"}
                className="mt-1"
              >
                {user.mode === "spotify" ? "Spotify bağlı" : "Demo modu"}
              </Badge>
            </div>
          </div>
          <form action="/api/auth/logout" method="post" className="mt-3">
            <button
              className={buttonClass(
                "ghost",
                "min-h-9 w-full justify-start px-2 text-xs",
              )}
            >
              <LogOut className="size-4" /> Oturumu kapat
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[.07] bg-[#080b0b]/85 px-5 backdrop-blur-xl lg:hidden">
          <Brand compact />
          <SideNav mobile />
          <Badge tone={user.mode === "spotify" ? "accent" : "violet"}>
            {user.mode === "spotify" ? "Canlı" : "Demo"}
          </Badge>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
