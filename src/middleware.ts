// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/auth")) {
    const isDevMode = process.env.NODE_ENV === "development";

    // authjs의 기본 세션토큰 주소
    const hasSession = isDevMode
      ? req.cookies.has("authjs.session-token")
      : req.cookies.has("__Secure-authjs.session-token");

    console.log(req.cookies.get("authjs.session-token"));
    console.log(req.cookies.get("__Secure-authjs.session-token"));
    if (hasSession) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
