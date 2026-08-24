import { AppError } from "@/lib/errors";

export async function mapSpotifyError(response: Response) {
  const body = await safeJson(response);
  const spotifyMessage =
    typeof body === "object" && body && "error" in body
      ? typeof (body as { error: unknown }).error === "object"
        ? ((body as { error: { message?: string } }).error.message ?? undefined)
        : undefined
      : undefined;

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("retry-after") ?? "1");
    return new AppError(
      "RATE_LIMITED",
      "Spotify istek sınırına ulaşıldı. Biraz sonra tekrar deneyin.",
      {
        retryAfter: Number.isFinite(retryAfter) ? retryAfter : 1,
      },
    );
  }
  if (response.status === 403) {
    return new AppError(
      "FORBIDDEN",
      "Bu çalma listesine erişilemiyor. Listenin sahibi veya işbirlikçisi olduğunuzdan emin olun.",
      { spotifyMessage },
    );
  }
  if (response.status === 401) {
    return new AppError(
      "UNAUTHORIZED",
      "Spotify oturumu geçersiz. Yeniden bağlanın.",
    );
  }
  if (response.status === 404)
    return new AppError("NOT_FOUND", "Spotify kaynağı bulunamadı.");
  return new AppError(
    "SPOTIFY_ERROR",
    "Spotify şu anda isteği tamamlayamadı.",
    {
      status: response.status,
      spotifyMessage,
    },
  );
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
