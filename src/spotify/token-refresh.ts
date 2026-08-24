import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { tokenResponseSchema } from "@/spotify/schemas";

export async function requestRefreshedToken(
  refreshToken: string,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: env.SPOTIFY_CLIENT_ID,
    }),
  });
  const body = await safeJson(response);
  if (!response.ok) {
    const reason = typeof body === "object" && body ? (body as { error?: string }).error : undefined;
    throw new AppError(
      reason === "invalid_grant" ? "UNAUTHORIZED" : "SPOTIFY_ERROR",
      reason === "invalid_grant"
        ? "Spotify bağlantısının süresi doldu. Lütfen yeniden bağlanın."
        : "Spotify erişim anahtarı yenilenemedi.",
      { reason, reauthorize: reason === "invalid_grant" },
    );
  }
  return tokenResponseSchema.parse(body);
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
