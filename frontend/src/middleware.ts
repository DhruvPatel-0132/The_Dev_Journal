import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Route Groups ──────────────────────────────────────────────────────────
// Routes only unauthenticated users can visit (logged-in users are redirected home)
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
  '/select-role',
];

// Routes that require a CREATOR account
const CREATOR_ROUTES = ['/dashboard', '/create-blog', '/edit-blog'];

// Routes that require any authenticated user
const PROTECTED_ROUTES = ['/blog', '/profile'];

// ─── Helpers ───────────────────────────────────────────────────────────────
async function tryRefreshToken(
  request: NextRequest
): Promise<{ accessToken: string; response: NextResponse } | null> {
  const refreshToken = request.cookies.get('refreshToken')?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.token) return null;

    const response = NextResponse.next();
    const setCookieHeaders = res.headers.getSetCookie();
    for (const cookie of setCookieHeaders) {
      response.headers.append('Set-Cookie', cookie);
    }

    return { accessToken: data.token, response };
  } catch {
    return null;
  }
}

function decodeToken(token: string): { valid: boolean; role?: string } {
  try {
    const decoded: any = jwtDecode(token);
    const now = Date.now() / 1000;
    if (decoded.exp && decoded.exp < now) return { valid: false };
    return { valid: true, role: decoded.role };
  } catch {
    return { valid: false };
  }
}

// ─── Middleware ────────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isCreatorRoute = CREATOR_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

  // Nothing to guard
  if (!isAuthRoute && !isCreatorRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  // Resolve token (with refresh fallback)
  let token = request.cookies.get('accessToken')?.value;
  let refreshedResponse: NextResponse | null = null;

  if (!token || !decodeToken(token).valid) {
    const refreshResult = await tryRefreshToken(request);
    if (refreshResult) {
      token = refreshResult.accessToken;
      refreshedResponse = refreshResult.response;
    } else {
      token = undefined;
    }
  }

  const { valid, role } = token ? decodeToken(token) : { valid: false, role: undefined };
  const isLoggedIn = valid;

  // ── Auth routes: redirect logged-in users to home ──────────────────────
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // ── Creator routes: must be logged-in AND a creator ───────────────────
  if (isCreatorRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== 'creator') {
      // Visitor trying to reach creator space → send home
      return NextResponse.redirect(new URL('/', request.url));
    }
    return refreshedResponse || NextResponse.next();
  }

  // ── Protected routes: must be logged in (any role) ────────────────────
  if (isProtectedRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return refreshedResponse || NextResponse.next();
  }

  return NextResponse.next();
}

// Matching Paths for the middleware
export const config = {
  matcher: [
    // Auth pages
    '/login/:path*',
    '/register/:path*',
    '/forgot-password/:path*',
    '/reset-password/:path*',
    '/verify-otp/:path*',
    '/select-role/:path*',
    // Creator-only pages
    '/dashboard/:path*',
    '/create-blog/:path*',
    '/edit-blog/:path*',
    // General protected pages
    '/blog/:path*',
    '/profile/:path*',
  ],
};
