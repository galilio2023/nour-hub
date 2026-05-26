import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'ar'] as const;

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: 'en',
  
  // No prefix for the default locale
  localePrefix: 'as-needed'
});

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 1. Run the intl middleware first to handle redirects and locale
  const response = intlMiddleware(request);

  // 2. Define protected routes (ignoring locale prefix)
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';
  const isProtectedRoute = pathWithoutLocale.startsWith('/dashboard') || 
                           pathWithoutLocale.startsWith('/studio') ||
                           pathWithoutLocale.startsWith('/gallery');

  if (isProtectedRoute) {
    // Check for session cookie (Better Auth default names)
    const sessionCookie = request.cookies.get("better-auth.session-token") || 
                          request.cookies.get("better-auth.session_token") ||
                          request.cookies.get("__Secure-better-auth.session-token") ||
                          request.cookies.get("__Secure-better-auth.session_token");
    
    if (!sessionCookie) {
      // If no session, redirect to login with the current locale
      const locale = pathname.split('/')[1];
      const validLocale = locales.includes(locale as typeof locales[number]) ? locale : 'en';
      const loginUrl = new URL(`/${validLocale}/login`, request.url);
      
      // Preserve the intended destination in a redirect param if desired
      // loginUrl.searchParams.set('callbackUrl', pathname);
      
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ar|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};

