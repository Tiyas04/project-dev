import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Check for the presence of auth cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  
  const isAuthenticated = !!accessToken || !!refreshToken;
  
  const pathname = request.nextUrl.pathname;
  
  // If the user is authenticated and trying to access the landing or auth page
  if (isAuthenticated && (pathname === '/' || pathname === '/auth')) {
    // Redirect them instantly to the dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match the root path and the auth path
  matcher: ['/', '/auth']
};
