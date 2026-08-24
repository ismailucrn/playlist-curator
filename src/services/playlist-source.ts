import "server-only";

import type { PlaylistSummary, Track } from "@/domain/models";
import { getDemoPlaylist, getDemoTracks, demoPlaylists } from "@/data/demo";
import { AppError } from "@/lib/errors";

export interface PlaylistSourceResult {
  playlist: PlaylistSummary;
  tracks: Track[];
}

export async function listPlaylistsForUser(user: { mode: string; id: string }) {
  if (user.mode === "demo") return demoPlaylists;

  const { listSpotifyPlaylists } = await import("@/spotify/playlist-service");
  return listSpotifyPlaylists(user.id);
}

export async function getPlaylistForUser(
  user: { mode: string; id: string },
  playlistId: string,
): Promise<PlaylistSourceResult> {
  if (user.mode === "demo") {
    const playlist = getDemoPlaylist(playlistId);
    if (!playlist) throw new AppError("NOT_FOUND", "Demo çalma listesi bulunamadı.");
    return { playlist, tracks: getDemoTracks(playlistId) };
  }

  const { getSpotifyPlaylist } = await import("@/spotify/playlist-service");
  return getSpotifyPlaylist(user.id, playlistId);
}
