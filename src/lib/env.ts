import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.url()]);

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.string().min(1).default("file:./dev.db"),
    APP_URL: z.url().default("http://127.0.0.1:3000"),
    DEMO_MODE: z
      .enum(["true", "false"])
      .default("true")
      .transform((value) => value === "true"),
    SPOTIFY_CLIENT_ID: z.string().default(""),
    SPOTIFY_REDIRECT_URI: optionalUrl.default(""),
    TOKEN_ENCRYPTION_KEY: z.string().default(""),
    SESSION_SECRET: z.string().min(32),
  })
  .superRefine((value, ctx) => {
    if (!value.SPOTIFY_CLIENT_ID) return;

    if (!value.SPOTIFY_REDIRECT_URI) {
      ctx.addIssue({
        code: "custom",
        path: ["SPOTIFY_REDIRECT_URI"],
        message: "Spotify yapılandırıldığında redirect URI zorunludur.",
      });
    }

    try {
      const key = Buffer.from(value.TOKEN_ENCRYPTION_KEY, "base64");
      if (key.length !== 32) throw new Error("invalid length");
    } catch {
      ctx.addIssue({
        code: "custom",
        path: ["TOKEN_ENCRYPTION_KEY"],
        message: "32 byte base64 token şifreleme anahtarı gereklidir.",
      });
    }
  });

export const env = envSchema.parse(process.env);

export const spotifyConfigured = Boolean(
  env.SPOTIFY_CLIENT_ID && env.SPOTIFY_REDIRECT_URI && env.TOKEN_ENCRYPTION_KEY,
);
