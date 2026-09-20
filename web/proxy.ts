/**
 * next-intl locale routing (Next.js 16 dung proxy.ts).
 * Matcher phai gom ca `/` de rewrite trang chu vao app/[locale]/page.tsx.
 */
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
