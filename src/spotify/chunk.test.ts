import { describe, expect, it } from "vitest";
import { chunkSpotifyUris } from "@/spotify/chunk";

describe("Spotify playlist item chunking", () => {
  it.each([
    [0, []],
    [1, [1]],
    [100, [100]],
    [101, [100, 1]],
    [250, [100, 100, 50]],
  ])("%i öğeyi 100'lük gruplara böler", (count, expected) => {
    const uris = Array.from(
      { length: count },
      (_, index) => `spotify:track:${index}`,
    );
    expect(chunkSpotifyUris(uris).map((chunk) => chunk.length)).toEqual(
      expected,
    );
  });
});
