import { NextRequest, NextResponse } from 'next/server';

// Cookie name
const REFRESH_TOKEN_COOKIE = '_x_c_rt';

// Routes that require authentication
const protectedRoutes = ['/settings', '/chats', '/chats/:chatId', '/files'];
// Auth routes that should redirect to home if user is already logged in
const authRoutes = ['/auth', '/forgot-password'];
// API routes that don't require checking
const apiRoutes = ['/api/'];

// Check if route requires authentication
const isProtectedRoute = (path: string) => {
  return protectedRoutes.some((route) => path.startsWith(route));
};

// Check if route is an auth route (should redirect when logged in)
const isAuthRoute = (path: string) => {
  return authRoutes.some((route) => path.startsWith(route));
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE);

  // Skip middleware for specific routes
  if (apiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if the user is trying to access auth routes while already logged in
  if (isAuthRoute(pathname) && refreshToken) {
    // If user is logged in and trying to access auth routes, redirect to new chat
    return NextResponse.redirect(new URL('/new', request.url));
  }

  // For protected routes, check if refresh token exists
  if (isProtectedRoute(pathname) && !refreshToken) {
    // If no refresh token, redirect to login with the return URL
    const redirect = encodeURIComponent(request.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/auth?mode=login&redirect=${redirect}`, request.url));
  }

  // For all other cases, let the request continue
  return NextResponse.next();
}

export const config = {
  // Match all paths except static files and API routes that handle their own auth
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
