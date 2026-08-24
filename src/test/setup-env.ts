Object.assign(process.env, {
  NODE_ENV: "test",
  DATABASE_URL: process.env.DATABASE_URL ?? "file:./test.db",
  APP_URL: process.env.APP_URL ?? "http://127.0.0.1:3000",
  DEMO_MODE: process.env.DEMO_MODE ?? "true",
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ?? "",
  SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI ?? "",
  TOKEN_ENCRYPTION_KEY: process.env.TOKEN_ENCRYPTION_KEY ?? "",
  SESSION_SECRET:
    process.env.SESSION_SECRET ??
    "test-session-secret-with-at-least-32-characters",
});
