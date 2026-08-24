import { requireCurrentUser } from "@/auth/session";
import { classificationRequestSchema } from "@/domain/validation";
import { errorResponse } from "@/lib/errors";
import { assertTrustedOrigin, readJson } from "@/lib/http";
import { runClassification } from "@/services/classification-service";
import { getPlaylistForUser } from "@/services/playlist-source";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireCurrentUser();
    const input = classificationRequestSchema.parse(await readJson(request));
    const { playlist, tracks } = await getPlaylistForUser(user, input.playlistId);
    const run = await runClassification({
      userId: user.id,
      providerId: user.activeProvider,
      playlist,
      tracks,
      categoryIds: input.categoryIds,
    });
    return Response.json({ runId: run.id, redirectTo: `/results/${run.id}` }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
