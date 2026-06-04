import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(request: NextRequest) {
  // Check for the accessToken cookie
  const token = request.cookies.get('accessToken')?.value;

  const isCreateBlogPage = request.nextUrl.pathname.startsWith('/create-blog');

  if (isCreateBlogPage) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Decode the JWT to check user role
      const decoded: any = jwtDecode(token);

      if (decoded.role === 'visitor') {
        // Redirect visitor to home page since they cannot access create-blog
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // If token is invalid or cannot be decoded
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Matching Paths for the middleware
export const config = {
  matcher: ['/create-blog/:path*'],
};
