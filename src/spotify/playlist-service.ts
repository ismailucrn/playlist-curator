import "server-only";

import { mapSpotifyPlaylist, mapSpotifyPlaylistItem } from "@/spotify/mappers";
import { spotifyFetch } from "@/spotify/client";
import {
  playlistDetailsSchema,
  playlistItemsPageSchema,
  playlistPageSchema,
  spotifyProfileSchema,
} from "@/spotify/schemas";

export async function getSpotifyProfile(userId: string) {
  return spotifyProfileSchema.parse(await spotifyFetch<unknown>(userId, "/me"));
}

export async function listSpotifyPlaylists(userId: string) {
  const profile = await getSpotifyProfile(userId);
  const playlists: ReturnType<typeof playlistPageSchema.parse>["items"] = [];
  let next: string | null = "/me/playlists?limit=50&offset=0";
  let pageCount = 0;

  while (next && pageCount < 2_000) {
    const page = playlistPageSchema.parse(await spotifyFetch<unknown>(userId, next));
    playlists.push(...page.items);
    next = page.next;
    pageCount += 1;
  }

  return playlists
    .filter((playlist) => playlist.owner.id === profile.id || playlist.collaborative)
    .map(mapSpotifyPlaylist);
}

export async function getSpotifyPlaylist(userId: string, playlistId: string) {
  const encodedId = encodeURIComponent(playlistId);
  const details = playlistDetailsSchema.parse(
    await spotifyFetch<unknown>(userId, `/playlists/${encodedId}`),
  );
  const tracks = [];
  let next: string | null = `/playlists/${encodedId}/items?limit=50&offset=0`;
  let pageCount = 0;

  while (next && pageCount < 2_000) {
    const page = playlistItemsPageSchema.parse(await spotifyFetch<unknown>(userId, next));
    for (const entry of page.items) {
      const mapped = mapSpotifyPlaylistItem(entry.item);
      if (mapped) tracks.push(mapped);
    }
    next = page.next;
    pageCount += 1;
  }

  return { playlist: mapSpotifyPlaylist(details), tracks };
}
