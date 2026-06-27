import { NextResponse } from "next/server";



const PROTECTED_PREFIXES = ["/dashboard", "/profile"];


const SESSION_COOKIE = process.env.NODE_ENV === "production"
  ? "__Secure-better-auth.session_token"
  : "better-auth.session_token";

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );


  if (!isProtected) return   NextResponse.next();

  
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return   NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)"],
};
