/**
 * Routing config cho next-intl.
 *
 * Tương thích với next-intl 4.x và Next.js 16 App Router. Dùng bởi:
 *  - `createNavigation()` trong `./navigation.ts`
 *  - `proxy.ts` (locale rewrite trên Next 16)
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
  // Site tiếng Việt là mặc định. Tự dò Accept-Language/cookie sẽ đẩy
  // trình duyệt English sang /en, mà Next 16.2 + Turbopack trên Windows
  // đang 404 mọi route có prefix /en.
  localeDetection: false,
});
