import { NextResponse } from "next/server";
import { env, spotifyConfigured } from "@/lib/env";
import { buildSpotifyAuthorizeUrl, createPkceAttempt } from "@/spotify/oauth";
import { sealTransient } from "@/spotify/crypto";

export const OAUTH_COOKIE = "spotify_oauth_attempt";

export async function GET(request: Request) {
  if (!spotifyConfigured) {
    return NextResponse.redirect(new URL("/?error=spotify-not-configured", request.url));
  }

  const attempt = createPkceAttempt();
  const response = NextResponse.redirect(buildSpotifyAuthorizeUrl(attempt));
  response.cookies.set(
    OAUTH_COOKIE,
    sealTransient({
      verifier: attempt.verifier,
      state: attempt.state,
      expiresAt: attempt.expiresAt,
    }),
    {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/api/auth/spotify",
    },
  );
  return response;
}
