'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { localeLabels, locales } from '@/i18n/config';

/**
 * Language switcher (dropdown).
 *
 * Việc render dưới dạng pill-group (VI | EN) không scale: chỉ cần 4 locale
 * trở lên là chiếm hết không gian header. Dropdown giữ UI gọn cho dù có
 * 2 hay 20 ngôn ngữ - thêm locale mới chỉ cần thêm vào `i18n/config.ts`.
 *
 * Rules:
 *  - Luôn preserve pathname + dynamic params + search params hiện tại.
 *  - Locale hiện tại hiển thị label đầy đủ (vd "Tiếng Việt") trong trigger,
 *    các locale khác hiển thị trong dropdown với cờ/label tương ứng.
 *  - Mở bằng click; đóng bằng click-outside / Esc / chọn xong.
 *
 * Implementation note:
 *  - `usePathname` từ `@/i18n/navigation` đã strip locale prefix.
 *  - `useRouter.replace({pathname, params, query}, {locale})` yêu cầu
 *    forward `params` để resolve đúng nếu dùng `pathnames` config.
 *  - `useSearchParams` từ `next/navigation` để map query string sang URL mới.
 *
 * Doc: https://next-intl.dev/docs/routing/navigation#userouter
 */
type LanguageSwitcherProps = {
  /** className tuỳ chỉnh, vd để đặt vào header kích thước w-9 */
  className?: string;
  /** Icon color class từ parent - thường là iconColor */
  iconClass?: string;
};

export default function LanguageSwitcher({
  className = '',
  iconClass = '',
}: LanguageSwitcherProps) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = Object.fromEntries(
    // Chỉ giữ entry có value thật (searchParams có thể trả về null cho key
    // không tồn tại - loại bỏ để router.replace không tạo ?undefined).
    Array.from(searchParams.entries()).filter(([, v]) => v !== null),
  );

  const cancelTimers = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const close = useCallback(() => {
    cancelTimers();
    setIsOpen(false);
  }, [cancelTimers]);

  const switchTo = (next: Locale) => {
    if (next === currentLocale) {
      close();
      return;
    }
    close();
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- pathname + params luôn match ở runtime
        // (cùng route hiện tại). next-intl cần forward `params` để resolve
        // nếu bật `pathnames`. Safe ở đây vì không có pathnames cá nhân hoá.
        { pathname, params, query },
        { locale: next },
      );
    });
  };

  // Hover delay ngắn để user kịp di chuyển chuột từ trigger xuống panel.
  const onMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (!isOpen && !openTimerRef.current) {
      openTimerRef.current = setTimeout(() => {
        openTimerRef.current = null;
        setIsOpen(true);
      }, 100);
    }
  };
  const onMouseLeave = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (isOpen && !closeTimerRef.current) {
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        setIsOpen(false);
      }, 200);
    }
  };
  const onToggleClick = () => {
    cancelTimers();
    setIsOpen((open) => !open);
  };

  // Đóng khi click ra ngoài / Esc / chuyển trang.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close]);

  useEffect(() => cancelTimers, [cancelTimers]);

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Language switcher"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative flex items-center ${className}`}
    >
      <button
        type="button"
        onClick={onToggleClick}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Đổi ngôn ngữ, hiện tại: ${localeLabels[currentLocale as Locale]}`}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${iconClass} ${
          isOpen ? 'bg-gray-100' : ''
        } ${isPending ? 'opacity-60' : ''}`}
      >
        <span aria-hidden className="text-theme-sm font-bold uppercase">
          {currentLocale}
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Chọn ngôn ngữ"
          className="absolute right-0 top-full z-50 mt-3 min-w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-theme-lg"
        >
          {locales.map((locale) => {
            const isActive = currentLocale === locale;
            return (
              <button
                key={locale}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => switchTo(locale)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-theme-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
                }`}
              >
                <span>{localeLabels[locale]}</span>
                {isActive && (
                  <span aria-hidden className="text-brand-500">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}