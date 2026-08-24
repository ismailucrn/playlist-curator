import { describe, expect, it } from "vitest";
import { mapSpotifyPlaylist, mapSpotifyPlaylistItem } from "@/spotify/mappers";

describe("Spotify response mappers", () => {
  it("güncel items[].item track yanıtını domain modeline çevirir", () => {
    const mapped = mapSpotifyPlaylistItem({
      type: "track",
      id: "abc123",
      uri: "spotify:track:abc123",
      name: "Test Track",
      artists: [{ name: "Artist One" }, { name: "Artist Two" }],
      album: {
        name: "Album",
        images: [{ url: "https://i.scdn.co/image/test" }],
      },
      duration_ms: 123000,
      external_urls: { spotify: "https://open.spotify.com/track/abc123" },
      is_playable: true,
      is_local: false,
    });
    expect(mapped).toMatchObject({
      id: "abc123",
      artists: ["Artist One", "Artist Two"],
    });
  });

  it("null, episode, local ve kimliksiz öğeleri güvenle atlar", () => {
    expect(mapSpotifyPlaylistItem(null)).toBeNull();
    expect(
      mapSpotifyPlaylistItem({ type: "episode", id: "episode" }),
    ).toBeNull();
    expect(
      mapSpotifyPlaylistItem({
        type: "track",
        id: "local",
        uri: "spotify:track:local",
        name: "Local",
        artists: [],
        album: { name: "Local", images: [] },
        duration_ms: 1,
        is_local: true,
      }),
    ).toBeNull();
  });

  it("playlist toplamını deprecated tracks yerine items alanından okur", () => {
    const playlist = mapSpotifyPlaylist({
      id: "playlist",
      name: "Owned",
      images: [],
      items: { total: 42 },
      owner: { display_name: null },
      collaborative: false,
      external_urls: {},
    });
    expect(playlist.itemCount).toBe(42);
  });
});
