import type { PlaylistSummary, Track } from "@/domain/models";
import { spotifyTrackSchema } from "@/spotify/schemas";

export function mapSpotifyPlaylist(
  playlist: {
    id: string;
    name: string;
    description?: string | null;
    images: { url: string }[];
    items: { total: number };
    owner: { display_name?: string | null };
    collaborative: boolean;
    snapshot_id?: string | null;
    external_urls?: { spotify?: string };
  },
): PlaylistSummary {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description ?? "",
    imageUrl: playlist.images[0]?.url ?? null,
    itemCount: playlist.items.total,
    ownerName: playlist.owner.display_name ?? "Spotify kullanıcısı",
    collaborative: playlist.collaborative,
    snapshotId: playlist.snapshot_id ?? null,
    spotifyUrl: playlist.external_urls?.spotify ?? null,
    source: "spotify",
  };
}

export function mapSpotifyPlaylistItem(item: unknown): Track | null {
  const parsed = spotifyTrackSchema.safeParse(item);
  if (!parsed.success || !parsed.data.id || parsed.data.is_local) return null;
  const track = parsed.data;
  return {
    id: track.id!,
    uri: track.uri,
    name: track.name,
    artists: track.artists.map(({ name }) => name),
    album: track.album.name,
    durationMs: track.duration_ms,
    spotifyUrl: track.external_urls.spotify ?? null,
    imageUrl: track.album.images[0]?.url ?? null,
    isPlayable: track.is_playable ?? true,
    isLocal: false,
  };
}
