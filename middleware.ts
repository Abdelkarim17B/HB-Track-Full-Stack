import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtectedPath = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/tasks") || 
    pathname.startsWith("/users") || 
    pathname.startsWith("/settings");
  
  const isAuthPath = 
    pathname === "/signin" || 
    pathname === "/register";
  
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key"
  });
  
  if (isProtectedPath && !token) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};