import "server-only";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { decryptToken, encryptToken } from "@/spotify/crypto";
import { requestRefreshedToken } from "@/spotify/token-refresh";

export async function getValidAccessToken(
  userId: string,
  options: { forceRefresh?: boolean; fetcher?: typeof fetch } = {},
) {
  const account = await db.spotifyAccount.findUnique({ where: { userId } });
  if (!account)
    throw new AppError("UNAUTHORIZED", "Spotify hesabı bağlı değil.");

  if (
    !options.forceRefresh &&
    account.accessTokenExpiresAt.getTime() > Date.now() + 60_000
  ) {
    return decryptToken(account.encryptedAccessToken);
  }

  try {
    const tokens = await requestRefreshedToken(
      decryptToken(account.encryptedRefreshToken),
      options.fetcher,
    );
    await db.spotifyAccount.update({
      where: { id: account.id },
      data: {
        encryptedAccessToken: encryptToken(tokens.access_token),
        encryptedRefreshToken: tokens.refresh_token
          ? encryptToken(tokens.refresh_token)
          : account.encryptedRefreshToken,
        accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        scopes: tokens.scope || account.scopes,
      },
    });
    return tokens.access_token;
  } catch (error) {
    if (error instanceof AppError && error.details?.reauthorize) {
      await db.$transaction([
        db.spotifyAccount.delete({ where: { id: account.id } }),
        db.user.update({ where: { id: userId }, data: { mode: "demo" } }),
      ]);
    }
    throw error;
  }
}
