import { requireCurrentUser } from "@/auth/session";
import { feedbackRequestSchema } from "@/domain/validation";
import { errorResponse } from "@/lib/errors";
import { assertTrustedOrigin, readJson } from "@/lib/http";
import { saveFeedback } from "@/repositories/classifications";

export async function PATCH(request: Request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireCurrentUser();
    const input = feedbackRequestSchema.parse(await readJson(request));
    await saveFeedback(user.id, input.resultIds, input.status);
    return Response.json({ updated: input.resultIds.length, status: input.status });
  } catch (error) {
    return errorResponse(error);
  }
}
