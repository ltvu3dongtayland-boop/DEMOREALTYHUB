import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { hasLocale } from 'next-intl';

import './globals.css';
import SiteHeader from '@/common/layout/SiteHeader';
import SiteFooter from '@/common/layout/SiteFooter';
import MobileBottomTabs from '@/common/layout/MobileBottomTabs';
import BackToTop from '@/common/components/BackToTop';
import ChatWidget from '@/modules/chat/components/ChatWidget';
import HideOnPaths from '@/common/layout/HideOnPaths';
import QueryProvider from '@/common/providers/QueryProvider';
import { CleanModeProvider } from '@/common/providers/CleanModeProvider';
import { StickyContact } from '@/common/components/Zalo';
import { routing } from '@/i18n/routing';

/**
 * Locale-aware root layout.
 *
 * Trước đây layout này hard-code toàn bộ text tiếng Việt và `<html lang="vi">`.
 * Sau migration, mọi text user-facing đi qua `t('...')` để render theo locale,
 * metadata SEO cũng được dịch, và `lang` của `<html>` khớp với locale hiện tại.
 *
 * Next 16 cần `params` là Promise — bắt buộc `await`. Tương thích với
 * dynamic API đã được Next 16 stable hoá.
 *
 * Phase 11 (Type Safety): `getTranslations('metadata')` được type-check
 * nhờ `global.d.ts` khai báo Messages shape.
 */
const FULLSCREEN_PATHS = ['/tin-nhan'];

const openSans = Open_Sans({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-open-sans',
});

/**
 * generateMetadata - đã tách khỏi `metadata` const vì cần locale để dịch.
 *
 * URL locale segment được Next pass vào qua `params.locale`. Với vi -> '/',
 * với en -> '/en'. Site name + title hiển thị theo locale.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: 'metadata' });

  const title = t('site.title');
  const description = t('site.description');
  const ogTitle = t('openGraph.title');
  const ogDescription = t('openGraph.description');
  const ogImageAlt = t('openGraph.imageAlt');

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: {
      default: title,
      template: '%s | RealtyHub',
    },
    description,
    alternates: {
      // Quan trọng cho SEO: locale 'vi' phải map về URL KHÔNG có prefix,
      // 'en' map về '/en'. `localePrefix: 'as-needed'` ở routing.ts đảm bảo
      // điều này. Không generate /vi/... cho vi.
      languages: {
        vi: '/',
        en: '/en',
      },
    },
    openGraph: {
      type: 'website',
      siteName: t('site.shortTitle'),
      // OpenGraph locale theo BCP-47 region tag
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      url: '/',
      title: ogTitle,
      description: ogDescription,
      images: [
        {
          url: '/images/og-cover.jpg',
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: ['/images/og-cover.jpg'],
    },
    icons: {
      icon: [
        { url: '/icon.png', type: 'image/png' },
        { url: '/icon.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon.png', sizes: '16x16', type: 'image/png' },
      ],
      shortcut: '/icon.png',
      apple: '/apple-icon.png',
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Bảo vệ route: locale không hợp lệ -> 404 thay vì render với default.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Bật static rendering cho sub-tree này — yêu cầu của next-intl khi dùng
  // `next-intl` ở cả Server + Client Component.
  setRequestLocale(locale);

  // Load messages cho toàn bộ sub-tree. Client Component sẽ dùng hook
  // `useTranslations` và NextIntlClientProvider sẽ cung cấp.
  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={openSans.variable}
      data-scroll-behavior="smooth"
      data-view-mode="normal"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <CleanModeProvider>
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <HideOnPaths paths={FULLSCREEN_PATHS}>
                <SiteFooter />
              </HideOnPaths>
              <MobileBottomTabs />
              <StickyContact />
              <HideOnPaths paths={FULLSCREEN_PATHS}>
                <ChatWidget />
              </HideOnPaths>
              <BackToTop />
            </CleanModeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
