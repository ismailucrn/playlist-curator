import { describe, expect, it } from "vitest";
import {
  assertSpotifyRequestAllowed,
  SpotifyRequestPolicyError,
} from "@/spotify/request-policy";

describe("Spotify request safety policy", () => {
  it.each([
    ["/me", "GET"],
    ["/me/playlists?limit=50", "GET"],
    ["https://api.spotify.com/v1/playlists/list-id/items?limit=50", "GET"],
    ["/me/playlists", "POST"],
    ["/playlists/list-id/items", "POST"],
  ])("izin verilen isteği geçirir: %s %s", (path, method) => {
    expect(() => assertSpotifyRequestAllowed(path, method)).not.toThrow();
  });

  it.each(["DELETE", "PUT", "PATCH"])(
    "%s metodunu ağ isteğinden önce engeller",
    (method) => {
      expect(() =>
        assertSpotifyRequestAllowed("/playlists/list-id/items", method),
      ).toThrow(SpotifyRequestPolicyError);
    },
  );

  it("playlist unfollow/silme isteğini engeller", () => {
    expect(() =>
      assertSpotifyRequestAllowed("/playlists/list-id/followers", "DELETE"),
    ).toThrow(SpotifyRequestPolicyError);
  });

  it("allowlist dışındaki POST isteklerini engeller", () => {
    expect(() =>
      assertSpotifyRequestAllowed("/playlists/list-id", "POST"),
    ).toThrow(SpotifyRequestPolicyError);
  });

  it("Spotify dışındaki origin'e istek göndermez", () => {
    expect(() =>
      assertSpotifyRequestAllowed("https://example.com/v1/me", "GET"),
    ).toThrow(SpotifyRequestPolicyError);
  });
});
