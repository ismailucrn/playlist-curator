import "server-only";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { spotifyFetch } from "@/spotify/client";
import { chunkSpotifyUris } from "@/spotify/chunk";
import { createPlaylistResponseSchema } from "@/spotify/schemas";

export async function exportSpotifyPlaylist(input: {
  userId: string;
  runId: string;
  resultIds: string[];
  playlistName: string;
  clientRequestId: string;
}) {
  const results = await db.classificationResult.findMany({
    where: { id: { in: input.resultIds }, run: { id: input.runId, userId: input.userId } },
  });
  if (results.length !== new Set(input.resultIds).size) {
    throw new AppError("NOT_FOUND", "Dışa aktarılacak sonuçlardan biri bulunamadı.");
  }

  const byId = new Map(results.map((result) => [result.id, result]));
  const uris = [...new Set(input.resultIds.map((id) => byId.get(id)?.trackUri).filter(isTrackUri))];
  if (uris.length === 0) throw new AppError("VALIDATION_ERROR", "Geçerli Spotify parçası seçilmedi.");

  let exportRecord = await db.playlistExport.findUnique({
    where: { userId_clientRequestId: { userId: input.userId, clientRequestId: input.clientRequestId } },
  });
  if (exportRecord?.status === "completed") return exportRecord;
  if (!exportRecord) {
    exportRecord = await db.playlistExport.create({
      data: {
        userId: input.userId,
        runId: input.runId,
        clientRequestId: input.clientRequestId,
        playlistName: input.playlistName,
        selectedCount: uris.length,
      },
    });
  }

  try {
    let playlistId = exportRecord.spotifyPlaylistId;
    let spotifyUrl = exportRecord.spotifyUrl;
    if (!playlistId) {
      const playlist = createPlaylistResponseSchema.parse(
        await spotifyFetch<unknown>(input.userId, "/me/playlists", {
          method: "POST",
          body: JSON.stringify({
            name: input.playlistName,
            public: false,
            description: "Playlist Curator ile oluşturuldu.",
          }),
        }),
      );
      playlistId = playlist.id;
      spotifyUrl = playlist.external_urls.spotify ?? null;
      exportRecord = await db.playlistExport.update({
        where: { id: exportRecord.id },
        data: { spotifyPlaylistId: playlistId, spotifyUrl, status: "adding-items" },
      });
    }

    const remainingUris = uris.slice(exportRecord.nextOffset);
    for (const chunk of chunkSpotifyUris(remainingUris)) {
      await spotifyFetch(input.userId, `/playlists/${encodeURIComponent(playlistId)}/items`, {
        method: "POST",
        body: JSON.stringify({ uris: chunk }),
      });
      exportRecord = await db.playlistExport.update({
        where: { id: exportRecord.id },
        data: {
          addedCount: { increment: chunk.length },
          nextOffset: { increment: chunk.length },
          errorMessage: null,
          status: "adding-items",
        },
      });
    }

    return db.playlistExport.update({
      where: { id: exportRecord.id },
      data: { status: "completed", errorMessage: null },
    });
  } catch (error) {
    await db.playlistExport.update({
      where: { id: exportRecord.id },
      data: {
        status: "partial",
        errorMessage: error instanceof Error ? error.message.slice(0, 300) : "Bilinmeyen hata",
      },
    });
    throw error;
  }
}

function isTrackUri(value: string | undefined): value is string {
  return Boolean(value?.startsWith("spotify:track:"));
}
