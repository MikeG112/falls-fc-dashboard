import { auth } from './app/auth';
import { NextRequest, NextResponse } from 'next/server';

function pathIsProtected(path: string) {
  const protectedRoutes = ['/clubs'];

  return protectedRoutes.some((prefix) => path.startsWith(prefix));
}

export default async function middleware(req: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = req.nextUrl.pathname;

  // If it's the root path, just render it
  if (path === '/') {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session && pathIsProtected(path)) {
    return NextResponse.redirect(new URL('/login', req.url));
  } else if (session && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/clubs', req.url));
  }
  return NextResponse.next();
}
