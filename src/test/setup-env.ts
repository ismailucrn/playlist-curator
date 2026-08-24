process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "file:./test.db";
process.env.APP_URL ??= "http://127.0.0.1:3000";
process.env.DEMO_MODE ??= "true";
process.env.SPOTIFY_CLIENT_ID ??= "";
process.env.SPOTIFY_REDIRECT_URI ??= "";
process.env.TOKEN_ENCRYPTION_KEY ??= "";
process.env.SESSION_SECRET ??= "test-session-secret-with-at-least-32-characters";
