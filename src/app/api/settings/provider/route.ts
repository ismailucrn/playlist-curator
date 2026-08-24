import { requireCurrentUser } from "@/auth/session";
import { providerIdSchema } from "@/domain/validation";
import { db } from "@/lib/db";
import { errorResponse } from "@/lib/errors";
import { assertTrustedOrigin, readJson } from "@/lib/http";

export async function PATCH(request: Request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireCurrentUser();
    const body = (await readJson(request)) as { provider?: unknown };
    const provider = providerIdSchema.parse(body.provider);
    await db.user.update({
      where: { id: user.id },
      data: { activeProvider: provider },
    });
    return Response.json({ provider });
  } catch (error) {
    return errorResponse(error);
  }
}
