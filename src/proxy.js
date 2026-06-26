import { NextResponse } from "next/server";

// Optimistic session check — reads the better-auth cookie directly (no DB hit)
// This is the recommended approach for Next.js proxy / middleware
const PROTECTED_PREFIXES = ["/dashboard", "/profile"];

// better-auth stores the session token in this cookie by default
const SESSION_COOKIE = process.env.NODE_ENV === "production"
  ? "__Secure-better-auth.session_token"
  : "better-auth.session_token";

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) return NextResponse.next();

  // Optimistic check: if the cookie is missing, the user is definitely not logged in
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)"],
};
