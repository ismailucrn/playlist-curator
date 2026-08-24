import { NextResponse } from "next/server";
import { deleteCurrentSession, requireCurrentUser, SESSION_COOKIE } from "@/auth/session";
import { db } from "@/lib/db";
import { errorResponse } from "@/lib/errors";
import { assertTrustedOrigin } from "@/lib/http";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireCurrentUser();
    await db.$transaction([
      db.spotifyAccount.deleteMany({ where: { userId: user.id } }),
      db.user.update({ where: { id: user.id }, data: { mode: "demo" } }),
    ]);
    await deleteCurrentSession();
    const response = NextResponse.redirect(new URL("/?disconnected=1", request.url), 303);
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
