import "server-only";

import { mapSpotifyError } from "@/spotify/error-mapper";
import { getValidAccessToken } from "@/spotify/token-service";

const API_BASE = "https://api.spotify.com/v1";

export async function spotifyFetch<T>(
  userId: string,
  path: string,
  init: RequestInit = {},
  options: { fetcher?: typeof fetch; retry?: number } = {},
): Promise<T> {
  const fetcher = options.fetcher ?? fetch;
  const accessToken = await getValidAccessToken(userId, { fetcher });
  const response = await fetcher(
    path.startsWith("http") ? path : `${API_BASE}${path}`,
    {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (response.status === 401 && !options.retry) {
    await getValidAccessToken(userId, { forceRefresh: true, fetcher });
    return spotifyFetch<T>(userId, path, init, { fetcher, retry: 1 });
  }

  if (!response.ok) throw await mapSpotifyError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
