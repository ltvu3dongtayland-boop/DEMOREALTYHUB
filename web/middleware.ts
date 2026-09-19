/**
 * next-intl locale routing.
 *
 * Next.js 16.2 + Turbopack tren Windows dang 404 moi trang (tru `/`) khi dung
 * `proxy.ts`. Giu `middleware.ts` de rewrite `/du-an` -> locale `vi` binh thuong.
 */
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
