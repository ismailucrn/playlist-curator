import { AppError } from "@/lib/errors";

export function chunkSpotifyUris(uris: string[], size = 100) {
  if (size < 1 || size > 100)
    throw new AppError("VALIDATION_ERROR", "Parça grubu 1-100 olmalıdır.");
  const chunks: string[][] = [];
  for (let index = 0; index < uris.length; index += size)
    chunks.push(uris.slice(index, index + size));
  return chunks;
}
