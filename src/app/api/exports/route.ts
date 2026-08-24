import { requireCurrentUser } from "@/auth/session";
import { exportPlaylistSchema } from "@/domain/validation";
import { errorResponse } from "@/lib/errors";
import { assertTrustedOrigin, readJson } from "@/lib/http";
import { createDemoExport } from "@/services/demo-export";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireCurrentUser();
    const input = exportPlaylistSchema.parse(await readJson(request));
    const exportResult =
      user.mode === "demo"
        ? await createDemoExport({ userId: user.id, ...input })
        : await (await import("@/spotify/export-service")).exportSpotifyPlaylist({
            userId: user.id,
            ...input,
          });
    return Response.json({ export: exportResult }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
