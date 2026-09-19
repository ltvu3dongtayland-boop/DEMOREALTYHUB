/**
 * Routing config cho next-intl.
 *
 * Tương thích với next-intl 4.x và Next.js 16 App Router. Dùng bởi:
 *  - `createNavigation()` trong `./navigation.ts`
 *  - `middleware.ts` (locale rewrite; tránh `proxy.ts` trên Next 16.2 Windows)
 *  - File `request.ts` để load messages
 *
 * Doc chính thức:
 *  https://next-intl.dev/docs/routing
 */
import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales, localePrefix } from './config';

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix,
  localeDetection: true,
});
