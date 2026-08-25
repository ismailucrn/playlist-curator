const SPOTIFY_API_ORIGIN = "https://api.spotify.com";

export type SpotifyRequestMethod = "GET" | "POST";

const allowedWritePaths = [
  /^\/v1\/me\/playlists$/,
  /^\/v1\/playlists\/[^/]+\/items$/,
];

/**
 * Spotify write access is deliberately narrower than the granted OAuth scope.
 * Only creating a new playlist and adding items to that new playlist are
 * permitted. In particular, DELETE/PUT/PATCH and arbitrary POST requests are
 * rejected before an access token is loaded or a network request is made.
 */
export function assertSpotifyRequestAllowed(
  path: string,
  method: string = "GET",
): asserts method is SpotifyRequestMethod {
  const normalizedMethod = method.toUpperCase();
  if (normalizedMethod !== "GET" && normalizedMethod !== "POST") {
    throw new SpotifyRequestPolicyError(normalizedMethod, path);
  }

  let url: URL;
  try {
    url = new URL(
      path.startsWith("http")
        ? path
        : `${SPOTIFY_API_ORIGIN}/v1${path.startsWith("/") ? path : `/${path}`}`,
    );
  } catch {
    throw new SpotifyRequestPolicyError(normalizedMethod, path);
  }

  if (url.origin !== SPOTIFY_API_ORIGIN || !url.pathname.startsWith("/v1/")) {
    throw new SpotifyRequestPolicyError(normalizedMethod, path);
  }

  if (normalizedMethod === "POST") {
    const allowed = allowedWritePaths.some((pattern) =>
      pattern.test(url.pathname),
    );
    if (!allowed) {
      throw new SpotifyRequestPolicyError(normalizedMethod, path);
    }
  }
}

export class SpotifyRequestPolicyError extends Error {
  constructor(method: string, path: string) {
    super(`Spotify request blocked by safety policy: ${method} ${path}`);
    this.name = "SpotifyRequestPolicyError";
  }
}
