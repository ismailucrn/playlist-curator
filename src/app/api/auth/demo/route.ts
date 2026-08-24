import { NextResponse } from "next/server";
import {
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/auth/session";
import { DEMO_USER_ID } from "@/data/demo";
import { env } from "@/lib/env";
import { errorResponse } from "@/lib/errors";
import { assertTrustedOrigin } from "@/lib/http";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    if (!env.DEMO_MODE)
      return Response.json({ error: "Demo modu kapalı." }, { status: 404 });
    const session = await createSession(DEMO_USER_ID);
    const response = NextResponse.redirect(
      new URL("/dashboard", request.url),
      303,
    );
    response.cookies.set(
      SESSION_COOKIE,
      session.token,
      sessionCookieOptions(session.expiresAt),
    );
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
