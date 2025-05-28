import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;

  const protectedPaths = ['/myaccount', '/myorders'];

  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
    matcher: ['/myaccount/:path*', '/myorders/:path*'],
  };