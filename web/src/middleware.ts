import { NextRequest, NextResponse } from 'next/server';

// Cookie name
const REFRESH_TOKEN_COOKIE = '_x_c_rt';

// Routes that require authentication
const protectedRoutes = ['/settings', '/chats', '/chats/:chatId', '/files'];
// Auth routes that should redirect to home if user is already logged in
const authRoutes = ['/auth', '/forgot-password'];
// API routes that don't require checking
const apiRoutes = ['/api/'];

// Tenant configuration
type TenantConfig = {
  domain: string;
  name: string;
  landingPage: string;
};

const TENANTS: TenantConfig[] = [
  {
    domain: 'intellicharts',
    name: 'IntelliCharts',
    landingPage: 'intellicharts',
  },
  {
    domain: 'agenticrows',
    name: 'AgenticRows',
    landingPage: 'agenticrows',
  },
];

// Extract subdomain from request (based on Vercel platforms approach)
const extractSubdomain = (request: NextRequest): string | null => {
  const url = request.url;
  const host = request.headers.get('host') || '';
  
  // Remove port if present
  const hostname = host.split(':')[0];
  
  console.log('Middleware Debug:', { url, host, hostname });
  
  // Local development environment
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      console.log('Found subdomain via URL match:', fullUrlMatch[1]);
      return fullUrlMatch[1];
    }
    
    // Fallback to host header approach
    if (hostname.includes('.localhost')) {
      const subdomain = hostname.split('.')[0];
      console.log('Found subdomain via host header:', subdomain);
      return subdomain;
    }
    
    console.log('No subdomain found for localhost');
    return null;
  }
  
  // Production environment
  // Check for subdomains like subdomain.intellicharts.com or subdomain.agenticrows.com
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    // Has subdomain
    console.log('Found production subdomain:', parts[0]);
    return parts[0];
  }
  
  console.log('No subdomain found');
  return null;
};

// Get tenant from subdomain
const getTenantFromSubdomain = (subdomain: string | null): TenantConfig => {
  if (!subdomain) {
    return TENANTS[0]; // Default to IntelliCharts
  }
  
  const tenant = TENANTS.find((t) => t.domain === subdomain);
  return tenant || TENANTS[0];
};

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
  
  // Extract subdomain
  const subdomain = extractSubdomain(request);
  
  // Get tenant configuration
  const tenant = getTenantFromSubdomain(subdomain);
  
  console.log('Tenant detected:', tenant.domain);

  // Skip middleware for specific routes
  if (apiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Skip rewriting for Next.js internal routes and already tenant-specific routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/[tenant]') || pathname.includes('favicon')) {
    return NextResponse.next();
  }

  // If we have a subdomain, rewrite to tenant-specific route
  if (subdomain && subdomain !== 'localhost') {
    const newPath = `/${subdomain}${pathname}`;
    console.log('Rewriting', pathname, 'to', newPath);
    
    const rewriteUrl = new URL(newPath, request.url);
    const response = NextResponse.rewrite(rewriteUrl);
    response.headers.set('x-tenant', tenant.domain);
    response.headers.set('x-tenant-name', tenant.name);
    return response;
  }

  // For non-subdomain requests, add tenant headers and continue
  const response = NextResponse.next();
  response.headers.set('x-tenant', tenant.domain);
  response.headers.set('x-tenant-name', tenant.name);

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

  return response;
}

export const config = {
  // Match all paths except static files and API routes that handle their own auth
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
