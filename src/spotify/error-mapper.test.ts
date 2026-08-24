import { describe, expect, it } from "vitest";
import { mapSpotifyError } from "@/spotify/error-mapper";

describe("Spotify error mapping", () => {
  it("429 Retry-After değerini kullanıcı dostu hataya taşır", async () => {
    const error = await mapSpotifyError(
      Response.json(
        { error: { message: "rate limited" } },
        { status: 429, headers: { "Retry-After": "7" } },
      ),
    );
    expect(error).toMatchObject({
      code: "RATE_LIMITED",
      details: { retryAfter: 7 },
    });
  });

  it("403 owner/collaborator açıklaması döndürür", async () => {
    const error = await mapSpotifyError(
      Response.json({ error: { message: "Forbidden" } }, { status: 403 }),
    );
    expect(error.code).toBe("FORBIDDEN");
    expect(error.message).toContain("sahibi veya işbirlikçisi");
  });

  it("bozuk 5xx gövdesini güvenli genel hataya çevirir", async () => {
    const error = await mapSpotifyError(new Response("oops", { status: 503 }));
    expect(error).toMatchObject({
      code: "SPOTIFY_ERROR",
      details: { status: 503 },
    });
  });
});
