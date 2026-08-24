import { AppError } from "@/lib/errors";
import { env } from "@/lib/env";

export function assertTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin && env.NODE_ENV !== "production") return;
  if (origin !== new URL(env.APP_URL).origin) {
    throw new AppError("FORBIDDEN", "İstek kaynağı doğrulanamadı.");
  }
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new AppError(
      "VALIDATION_ERROR",
      "Geçerli bir JSON gövdesi gönderilmelidir.",
    );
  }
}
