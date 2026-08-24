import "server-only";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

export async function createDemoExport(input: {
  userId: string;
  runId: string;
  resultIds: string[];
  playlistName: string;
  clientRequestId: string;
}) {
  const existing = await db.playlistExport.findUnique({
    where: {
      userId_clientRequestId: {
        userId: input.userId,
        clientRequestId: input.clientRequestId,
      },
    },
  });
  if (existing) return existing;

  const count = await db.classificationResult.count({
    where: {
      id: { in: input.resultIds },
      run: { id: input.runId, userId: input.userId },
    },
  });
  if (count !== new Set(input.resultIds).size) {
    throw new AppError(
      "NOT_FOUND",
      "Dışa aktarılacak sonuçlardan biri bulunamadı.",
    );
  }

  return db.playlistExport.create({
    data: {
      userId: input.userId,
      runId: input.runId,
      clientRequestId: input.clientRequestId,
      playlistName: input.playlistName,
      selectedCount: count,
      addedCount: count,
      nextOffset: count,
      status: "demo-completed",
    },
  });
}
