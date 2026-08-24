import Link from "next/link";
import { ArrowUpRight, ListMusic, Sparkles, Users } from "lucide-react";
import { requireCurrentUser } from "@/auth/session";
import { PlaylistCover } from "@/components/playlist-cover";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClass } from "@/components/ui/button";
import { listPlaylistsForUser } from "@/services/playlist-source";

export const metadata = { title: "Listeler" };

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const playlists = await listPlaylistsForUser(user);
  const totalTracks = playlists.reduce(
    (sum, playlist) => sum + playlist.itemCount,
    0,
  );
  return (
    <div className="fade-up">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <Badge tone="accent">
            {user.mode === "demo"
              ? "Demo koleksiyonu"
              : "Spotify koleksiyonunuz"}
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
            Merhaba, {user.displayName.split(" ")[0]}.
          </h1>
          <p className="text-muted mt-2 max-w-2xl text-sm leading-6">
            Sahibi veya işbirlikçisi olduğunuz bir listeyi seçin ve kategorilere
            ayırmaya başlayın.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-2xl border border-white/[.07] bg-white/[.025] px-4 py-3">
            <p className="text-xl font-semibold">{playlists.length}</p>
            <p className="text-muted text-[11px]">liste</p>
          </div>
          <div className="rounded-2xl border border-white/[.07] bg-white/[.025] px-4 py-3">
            <p className="text-xl font-semibold">{totalTracks}</p>
            <p className="text-muted text-[11px]">parça</p>
          </div>
        </div>
      </div>

      {playlists.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Uygun çalma listesi bulunamadı"
            description="Spotify, yalnızca sahibi veya işbirlikçisi olduğunuz listelerin öğelerine erişim veriyor."
            action={
              <Link href="/settings" className={buttonClass("secondary")}>
                Bağlantıyı kontrol et
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {playlists.map((playlist, index) => (
            <Link
              key={playlist.id}
              href={`/playlists/${playlist.id}`}
              className="group glass-panel hover:border-accent/20 overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1"
            >
              <div className="relative m-3 mb-0 overflow-hidden rounded-2xl">
                <PlaylistCover
                  name={playlist.name}
                  imageUrl={playlist.imageUrl}
                  className="aspect-[16/10] w-full transition duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 to-transparent" />
                <span className="group-hover:bg-accent absolute top-3 right-3 grid size-9 place-items-center rounded-xl border border-white/10 bg-black/30 text-white backdrop-blur-md transition group-hover:text-[#07110b]">
                  <ArrowUpRight className="size-4" />
                </span>
                <span className="absolute bottom-3 left-3 text-xs font-medium text-white/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold tracking-[-.02em]">
                      {playlist.name}
                    </h2>
                    <p className="text-muted mt-1 line-clamp-2 min-h-10 text-sm leading-5">
                      {playlist.description || "Açıklama eklenmemiş."}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Badge>
                    <ListMusic className="mr-1 size-3" /> {playlist.itemCount}{" "}
                    parça
                  </Badge>
                  {playlist.collaborative ? (
                    <Badge tone="violet">
                      <Users className="mr-1 size-3" /> İşbirlikçi
                    </Badge>
                  ) : (
                    <Badge tone="accent">
                      <Sparkles className="mr-1 size-3" /> Sahip
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {user.mode === "spotify" ? (
        <p className="text-muted mt-7 text-center text-xs">
          Kapaklar ve metadata Spotify&apos;dan gelir; her liste Spotify&apos;a
          geri bağlantıyla gösterilir.
        </p>
      ) : null}
    </div>
  );
}
