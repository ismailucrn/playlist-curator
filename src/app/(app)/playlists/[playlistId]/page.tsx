import Link from "next/link";
import { ArrowLeft, ExternalLink, ListMusic, Users } from "lucide-react";
import { requireCurrentUser } from "@/auth/session";
import { PlaylistCover } from "@/components/playlist-cover";
import { PlaylistDetailClient } from "@/components/playlist-detail-client";
import { Badge } from "@/components/ui/badge";
import { listCategories } from "@/repositories/categories";
import { getPlaylistForUser } from "@/services/playlist-source";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ playlistId: string }>;
}) {
  const user = await requireCurrentUser();
  const { playlistId } = await params;
  const [{ playlist, tracks }, categories] = await Promise.all([
    getPlaylistForUser(user, playlistId),
    listCategories(user.id),
  ]);
  return (
    <div className="fade-up">
      <Link
        href="/dashboard"
        className="text-muted inline-flex items-center gap-2 text-sm transition hover:text-white"
      >
        <ArrowLeft className="size-4" /> Tüm listeler
      </Link>
      <header className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end">
        <PlaylistCover
          name={playlist.name}
          imageUrl={playlist.imageUrl}
          className="size-36 shrink-0 rounded-3xl sm:size-44"
        />
        <div className="min-w-0 pb-1">
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">
              <ListMusic className="mr-1 size-3" /> {tracks.length} uygun parça
            </Badge>
            {playlist.collaborative ? (
              <Badge tone="violet">
                <Users className="mr-1 size-3" /> İşbirlikçi
              </Badge>
            ) : null}
          </div>
          <h1 className="mt-4 truncate text-3xl font-semibold tracking-[-.045em] sm:text-5xl">
            {playlist.name}
          </h1>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
            {playlist.description || "Bu liste için açıklama bulunmuyor."}
          </p>
          {playlist.spotifyUrl ? (
            <a
              href={playlist.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent mt-3 inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
            >
              Spotify&apos;da aç <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>
      </header>
      <div className="mt-10">
        <PlaylistDetailClient
          playlist={playlist}
          tracks={tracks}
          initialCategories={categories}
        />
      </div>
    </div>
  );
}
