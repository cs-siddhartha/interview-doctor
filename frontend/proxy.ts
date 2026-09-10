import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  verifyAppSessionToken,
} from "@/lib/auth-token";

export function proxy(request: NextRequest) {
  const isAuthorized = verifyAppSessionToken(
    request.cookies.get(AUTH_COOKIE_NAME)?.value,
  );
  const isLogin = request.nextUrl.pathname === "/login";

  if (!isAuthorized && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuthorized && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
