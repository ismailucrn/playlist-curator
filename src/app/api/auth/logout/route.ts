import { NextResponse } from "next/server";
import { deleteCurrentSession, SESSION_COOKIE } from "@/auth/session";
import { errorResponse } from "@/lib/errors";
import { assertTrustedOrigin } from "@/lib/http";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    await deleteCurrentSession();
    const response = NextResponse.redirect(new URL("/", request.url), 303);
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
