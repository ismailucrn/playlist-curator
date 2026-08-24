import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";

function encrypt(value: string, key: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

function decrypt(value: string, key: Buffer) {
  try {
    const [iv, tag, encrypted] = value.split(".").map((part) => Buffer.from(part, "base64url"));
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    throw new AppError("UNAUTHORIZED", "Saklanan yetkilendirme bilgisi doğrulanamadı.");
  }
}

function tokenKey() {
  const key = Buffer.from(env.TOKEN_ENCRYPTION_KEY, "base64");
  if (key.length !== 32) throw new AppError("INTERNAL_ERROR", "Token şifreleme anahtarı geçersiz.");
  return key;
}

function transientKey() {
  return createHash("sha256").update(env.SESSION_SECRET).digest();
}

export function encryptToken(value: string) {
  return encrypt(value, tokenKey());
}

export function decryptToken(value: string) {
  return decrypt(value, tokenKey());
}

export function sealTransient(value: unknown) {
  return encrypt(JSON.stringify(value), transientKey());
}

export function unsealTransient<T>(value: string): T {
  return JSON.parse(decrypt(value, transientKey())) as T;
}
