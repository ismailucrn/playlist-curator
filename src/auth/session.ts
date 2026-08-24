import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";

export const SESSION_COOKIE = "playlist_curator_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_AGE_SECONDS * 1000);
  await db.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt },
  });
  return { token, expiresAt };
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { include: { spotifyAccount: true } } },
  });

  if (!session || session.expiresAt <= new Date()) return null;
  return session.user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user)
    throw new AppError("UNAUTHORIZED", "Devam etmek için oturum açmalısınız.");
  return user;
}

export async function deleteCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token)
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}
