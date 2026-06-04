import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function tryRefreshToken(request: NextRequest): Promise<{ accessToken: string; response: NextResponse } | null> {
  const refreshToken = request.cookies.get('refreshToken')?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refreshToken=${refreshToken}`,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.token) return null;

    // Build a NextResponse that forwards the Set-Cookie headers from the backend
    const response = NextResponse.next();

    // Forward all Set-Cookie headers from the backend refresh response
    const setCookieHeaders = res.headers.getSetCookie();
    for (const cookie of setCookieHeaders) {
      response.headers.append('Set-Cookie', cookie);
    }

    return { accessToken: data.token, response };
  } catch {
    return null;
  }
}

function isTokenValid(token: string): { valid: boolean; role?: string } {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Token is expired
    if (decoded.exp && decoded.exp < currentTime) {
      return { valid: false };
    }

    return { valid: true, role: decoded.role };
  } catch {
    return { valid: false };
  }
}

export async function middleware(request: NextRequest) {
  const isCreateBlogPage = request.nextUrl.pathname.startsWith('/create-blog');
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
  const isBlogPage = request.nextUrl.pathname.startsWith('/blog');

  // Only protect these routes
  if (!isCreateBlogPage && !isDashboardPage && !isBlogPage) {
    return NextResponse.next();
  }

  let token = request.cookies.get('accessToken')?.value;
  let customResponse: NextResponse | null = null;

  // If no token or token is expired, try to refresh
  if (!token || !isTokenValid(token).valid) {
    const refreshResult = await tryRefreshToken(request);
    if (refreshResult) {
      token = refreshResult.accessToken;
      customResponse = refreshResult.response;
    } else {
      // No refresh token or refresh failed — redirect to login
      // But only for create-blog (dashboard and blog can show login prompt client-side)
      if (isCreateBlogPage) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.next();
    }
  }

  const { valid, role } = isTokenValid(token);

  if (!valid) {
    if (isCreateBlogPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Block visitors from create-blog
  if (isCreateBlogPage && role === 'visitor') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If we refreshed the token, return the response with updated cookies
  return customResponse || NextResponse.next();
}

// Matching Paths for the middleware
export const config = {
  matcher: ['/create-blog/:path*', '/dashboard/:path*', '/blog/:path*'],
};
