import { NextRequest, NextResponse } from "next/server";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/auth/session";
import { db } from "@/lib/db";
import { env, spotifyConfigured } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { encryptToken, unsealTransient } from "@/spotify/crypto";
import { exchangeAuthorizationCode } from "@/spotify/oauth";
import { spotifyProfileSchema } from "@/spotify/schemas";
import { OAUTH_COOKIE } from "@/app/api/auth/spotify/start/route";

interface OAuthAttemptCookie {
  verifier: string;
  state: string;
  expiresAt: number;
}

export async function GET(request: NextRequest) {
  try {
    if (!spotifyConfigured) throw new AppError("VALIDATION_ERROR", "Spotify yapılandırılmamış.");
    const spotifyError = request.nextUrl.searchParams.get("error");
    if (spotifyError) throw new AppError("UNAUTHORIZED", "Spotify erişim izni verilmedi.");

    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const sealed = request.cookies.get(OAUTH_COOKIE)?.value;
    if (!code || !state || !sealed) throw new AppError("UNAUTHORIZED", "OAuth yanıtı eksik.");

    const attempt = unsealTransient<OAuthAttemptCookie>(sealed);
    if (attempt.state !== state || attempt.expiresAt < Date.now()) {
      throw new AppError("UNAUTHORIZED", "OAuth state doğrulaması başarısız veya süresi dolmuş.");
    }

    const tokens = await exchangeAuthorizationCode(code, attempt.verifier);
    if (!tokens.refresh_token) throw new AppError("UNAUTHORIZED", "Spotify refresh token döndürmedi.");
    const profileResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!profileResponse.ok) throw new AppError("UNAUTHORIZED", "Spotify profili alınamadı.");
    const profile = spotifyProfileSchema.parse(await profileResponse.json());
    const accessTokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    const encryptedAccessToken = encryptToken(tokens.access_token);
    const encryptedRefreshToken = encryptToken(tokens.refresh_token);

    const existing = await db.spotifyAccount.findUnique({ where: { spotifyAccountId: profile.account_id } });
    const user = existing
      ? await db.user.update({
          where: { id: existing.userId },
          data: {
            mode: "spotify",
            displayName: profile.display_name ?? "Spotify kullanıcısı",
            spotifyAccount: {
              update: {
                spotifyUserId: profile.id,
                encryptedAccessToken,
                encryptedRefreshToken,
                accessTokenExpiresAt,
                authorizedAt: new Date(),
                scopes: tokens.scope,
              },
            },
          },
        })
      : await db.user.create({
          data: {
            mode: "spotify",
            displayName: profile.display_name ?? "Spotify kullanıcısı",
            spotifyAccount: {
              create: {
                spotifyAccountId: profile.account_id,
                spotifyUserId: profile.id,
                encryptedAccessToken,
                encryptedRefreshToken,
                accessTokenExpiresAt,
                scopes: tokens.scope,
              },
            },
          },
        });

    const session = await createSession(user.id);
    const response = NextResponse.redirect(new URL("/dashboard?connected=1", env.APP_URL), 303);
    response.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.expiresAt));
    response.cookies.set(OAUTH_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/api/auth/spotify" });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Spotify bağlantısı tamamlanamadı.";
    const url = new URL("/", env.APP_URL);
    url.searchParams.set("error", "spotify-callback");
    url.searchParams.set("message", message.slice(0, 160));
    const response = NextResponse.redirect(url, 303);
    response.cookies.set(OAUTH_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/api/auth/spotify" });
    return response;
  }
}
