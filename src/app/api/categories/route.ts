import { requireCurrentUser } from "@/auth/session";
import { errorResponse } from "@/lib/errors";
import { assertTrustedOrigin, readJson } from "@/lib/http";
import { createCategory, listCategories } from "@/repositories/categories";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    return Response.json({ categories: await listCategories(user.id) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireCurrentUser();
    const category = await createCategory(user.id, await readJson(request));
    return Response.json({ category }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
