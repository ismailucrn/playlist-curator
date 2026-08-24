import { describe, expect, it, vi } from "vitest";
import { requestRefreshedToken } from "@/spotify/token-refresh";

describe("Spotify token refresh", () => {
  it("PKCE refresh isteğinde client_id gönderir ve token rotation'ı map eder", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        access_token: "new-access",
        token_type: "Bearer",
        scope: "playlist-read-private",
        expires_in: 3600,
        refresh_token: "rotated-refresh",
      }),
    );
    const token = await requestRefreshedToken("old-refresh", fetcher);
    const request = fetcher.mock.calls[0][1];
    expect(String(request?.body)).toContain("grant_type=refresh_token");
    expect(token.refresh_token).toBe("rotated-refresh");
  });

  it("refresh token dönmezse yanıtı yine kabul eder", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        access_token: "new-access",
        token_type: "Bearer",
        scope: "",
        expires_in: 3600,
      }),
    );
    expect(
      (await requestRefreshedToken("refresh", fetcher)).refresh_token,
    ).toBeUndefined();
  });

  it("invalid_grant için yeniden yetkilendirme hatası üretir", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ error: "invalid_grant" }, { status: 400 }),
      );
    await expect(
      requestRefreshedToken("expired", fetcher),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      details: { reauthorize: true },
    });
  });
});
