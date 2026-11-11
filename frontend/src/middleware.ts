import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE } from "@/lib/auth-token";

const AUTH_ROUTES = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(AUTH_COOKIE)?.value);
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!hasToken && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
