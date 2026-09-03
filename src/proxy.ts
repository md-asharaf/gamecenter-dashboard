import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isLoginPage = request.nextUrl.pathname === "/login";
  const clearSession = request.nextUrl.searchParams.get("clear_session") === "true";

  if (clearSession) {
    const url = new URL(request.url);
    url.searchParams.delete("clear_session");
    const response = NextResponse.redirect(url);
    response.cookies.delete("admin_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  if (!token && !refreshToken && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
