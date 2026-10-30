import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = ['bn', 'en'] as const;
const DEFAULT_LOCALE = 'en';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Ignore internal Next.js assets, API routes, and public files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/favicon.ico') ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if pathname starts with a supported locale
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    // Current route already has valid locale (e.g. /bn/... or /en/...)
    // Persist user's selected locale in cookie
    const currentLocale = pathname.split('/')[1];
    const response = NextResponse.next();
    response.cookies.set('bhabachyaka_locale', currentLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
    return response;
  }

  // If path doesn't have locale prefix (e.g. /packages, /counters, /about, /super-admin, /)
  // Read saved locale from cookie or use DEFAULT_LOCALE ('en')
  const savedLocaleCookie = request.cookies.get('bhabachyaka_locale')?.value;
  const locale = (savedLocaleCookie === 'bn' ? 'bn' : DEFAULT_LOCALE);

  const targetPath = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
  const targetUrl = new URL(`${targetPath}${search}`, request.url);

  const response = NextResponse.redirect(targetUrl);
  response.cookies.set('bhabachyaka_locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  return response;
}

export const config = {
  matcher: [
    // Match all request paths except _next/static, _next/image, favicon.ico
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
