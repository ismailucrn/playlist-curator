import { ZodError } from "zod";

export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SPOTIFY_ERROR"
  | "INTERNAL_ERROR";

const statusByCode: Record<AppErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  SPOTIFY_ERROR: 502,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }

  get status() {
    return statusByCode[this.code];
  }
}

export function normalizeError(error: unknown) {
  if (error instanceof AppError) return error;
  if (error instanceof ZodError) {
    return new AppError(
      "VALIDATION_ERROR",
      "Gönderilen bilgiler geçerli değil.",
      {
        issues: error.issues.map(({ path, message }) => ({
          path: path.join("."),
          message,
        })),
      },
    );
  }
  return new AppError("INTERNAL_ERROR", "Beklenmeyen bir hata oluştu.");
}

export function errorResponse(error: unknown) {
  const normalized = normalizeError(error);
  return Response.json(
    {
      error: {
        code: normalized.code,
        message: normalized.message,
        details: normalized.details,
      },
    },
    { status: normalized.status },
  );
}
