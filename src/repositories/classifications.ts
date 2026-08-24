import "server-only";

import type { ClassificationSuggestion, PlaylistSummary, Track } from "@/domain/models";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

export async function saveClassificationRun(input: {
  userId: string;
  playlist: PlaylistSummary;
  provider: string;
  tracks: Track[];
  suggestions: ClassificationSuggestion[];
}) {
  const tracksById = new Map(input.tracks.map((track) => [track.id, track]));
  return db.classificationRun.create({
    data: {
      userId: input.userId,
      sourcePlaylistId: input.playlist.id,
      sourcePlaylistName: input.playlist.name,
      sourcePlaylistSnapshotId: input.playlist.snapshotId,
      provider: input.provider,
      results: {
        create: input.suggestions.flatMap((suggestion) => {
          const track = tracksById.get(suggestion.trackId);
          if (!track) return [];
          return [
            {
              trackId: track.id,
              trackUri: track.uri,
              trackName: track.name,
              artistNames: track.artists.join(", "),
              albumName: track.album,
              categoryId: suggestion.categoryId,
              score: suggestion.score,
              evidenceJson: JSON.stringify(suggestion.evidence),
              source: suggestion.source,
              status: suggestion.status,
            },
          ];
        }),
      },
    },
  });
}

export async function getClassificationRun(userId: string, runId: string) {
  const run = await db.classificationRun.findFirst({
    where: { id: runId, userId },
    include: {
      results: {
        include: { category: true },
        orderBy: [{ category: { name: "asc" } }, { score: "desc" }],
      },
    },
  });
  if (!run) throw new AppError("NOT_FOUND", "Sınıflandırma çalışması bulunamadı.");
  return run;
}

export async function getAcceptedTags(userId: string, trackIds: string[]) {
  return db.trackTag.findMany({ where: { userId, trackId: { in: trackIds } } });
}

export async function saveFeedback(
  userId: string,
  resultIds: string[],
  status: "accepted" | "rejected",
) {
  const results = await db.classificationResult.findMany({
    where: { id: { in: resultIds }, run: { userId } },
  });
  if (results.length !== new Set(resultIds).size) {
    throw new AppError("NOT_FOUND", "Sonuçlardan biri bulunamadı veya size ait değil.");
  }

  await db.$transaction(async (tx) => {
    await tx.classificationResult.updateMany({ where: { id: { in: resultIds } }, data: { status } });
    await tx.feedbackEvent.createMany({
      data: results.map((result) => ({
        userId,
        classificationResultId: result.id,
        status,
      })),
    });

    for (const result of results) {
      if (status === "accepted") {
        await tx.trackTag.upsert({
          where: {
            userId_trackId_categoryId: {
              userId,
              trackId: result.trackId,
              categoryId: result.categoryId,
            },
          },
          update: { confidence: Math.max(0.9, result.score), source: "accepted-feedback" },
          create: {
            userId,
            trackId: result.trackId,
            categoryId: result.categoryId,
            confidence: Math.max(0.9, result.score),
          },
        });
      } else {
        await tx.trackTag.deleteMany({
          where: { userId, trackId: result.trackId, categoryId: result.categoryId },
        });
      }
    }
  });
}
