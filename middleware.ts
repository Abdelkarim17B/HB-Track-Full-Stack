import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected
  const isProtectedPath = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/tasks") || 
    pathname.startsWith("/users") || 
    pathname.startsWith("/settings");
  
  // Check if the path is auth related
  const isAuthPath = 
    pathname === "/signin" || 
    pathname === "/register";
  
  // Get the token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key"
  });
  
  // If the path is protected and there's no token, redirect to signin
  if (isProtectedPath && !token) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  
  // If the user is authenticated and tries to access auth pages, redirect to dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};