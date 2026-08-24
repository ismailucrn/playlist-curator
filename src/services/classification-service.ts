import "server-only";

import { getClassificationProvider } from "@/classification/registry";
import type { ClassificationProviderId, PlaylistSummary, Track } from "@/domain/models";
import { providerIdSchema, scoreSchema } from "@/domain/validation";
import { AppError } from "@/lib/errors";
import { listCategories } from "@/repositories/categories";
import { getAcceptedTags, saveClassificationRun } from "@/repositories/classifications";

export async function runClassification(input: {
  userId: string;
  providerId: string;
  playlist: PlaylistSummary;
  tracks: Track[];
  categoryIds: string[];
}) {
  const providerId = providerIdSchema.parse(input.providerId) as ClassificationProviderId;
  const categories = (await listCategories(input.userId)).filter((category) =>
    input.categoryIds.includes(category.id),
  );
  if (categories.length !== new Set(input.categoryIds).size) {
    throw new AppError("NOT_FOUND", "Seçilen kategorilerden biri bulunamadı.");
  }
  if (input.tracks.length === 0) {
    throw new AppError("VALIDATION_ERROR", "Sınıflandırılabilecek şarkı bulunamadı.");
  }

  const tags = await getAcceptedTags(
    input.userId,
    input.tracks.map(({ id }) => id),
  );
  const provider = getClassificationProvider(providerId);
  const suggestions = await provider.classifyTracks(input.tracks, categories, {
    acceptedTags: tags,
  });
  suggestions.forEach((suggestion) => scoreSchema.parse(suggestion.score));

  return saveClassificationRun({
    userId: input.userId,
    playlist: input.playlist,
    tracks: input.tracks,
    provider: provider.id,
    suggestions,
  });
}
