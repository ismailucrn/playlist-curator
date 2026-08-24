import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { tokenResponseSchema } from "@/spotify/schemas";

export const SPOTIFY_SCOPES = [
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
] as const;

export const SPOTIFY_OAUTH_COOKIE = "spotify_oauth_attempt";

export function createPkceAttempt() {
  const verifier = randomBytes(64).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return {
    verifier,
    challenge,
    state: randomBytes(24).toString("base64url"),
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
}

export function buildSpotifyAuthorizeUrl(
  attempt: ReturnType<typeof createPkceAttempt>,
) {
  const url = new URL("https://accounts.spotify.com/authorize");
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: env.SPOTIFY_CLIENT_ID,
    redirect_uri: env.SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES.join(" "),
    state: attempt.state,
    code_challenge_method: "S256",
    code_challenge: attempt.challenge,
  }).toString();
  return url;
}

export async function exchangeAuthorizationCode(
  code: string,
  verifier: string,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.SPOTIFY_REDIRECT_URI,
      client_id: env.SPOTIFY_CLIENT_ID,
      code_verifier: verifier,
    }),
  });
  const body = await safeJson(response);
  if (!response.ok) {
    throw new AppError(
      "UNAUTHORIZED",
      "Spotify yetkilendirmesi tamamlanamadı.",
      {
        reason:
          typeof body === "object" && body
            ? (body as { error?: string }).error
            : undefined,
      },
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
