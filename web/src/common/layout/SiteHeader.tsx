'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FiChevronDown, FiMenu, FiMessageSquare, FiX } from 'react-icons/fi';
import AccountMenu from '@/common/components/AccountMenu';
import CleanModeToggle from '@/common/components/CleanModeToggle';
import FavoriteButton from '@/common/layout/FavoriteButton';
import LanguageSwitcher from '@/i18n/components/LanguageSwitcher';
import NotificationsPopover from '@/common/layout/NotificationsPopover';
import { useCleanMode } from '@/common/providers/CleanModeProvider';

/**
 * SiteHeader (locale-aware).
 *
 * Sau migration:
 *  - Toàn bộ text UI đi qua `useTranslations('navigation')` / `useTranslations('common')`.
 *  - `Link` + `usePathname` lấy từ `@/i18n/navigation` -> tự động preserve
 *    locale prefix trong URL (vd khi đang ở `/en` thì `<Link href="/du-an">`
 *    sẽ tạo ra `/en/du-an`).
 *  - Brand "Dự án" link trỏ về `/du-an` (hardcode cũ là `/gio-hang`). Hai
 *    URL này thuộc cùng chức năng nên giữ ổn định.
 *
 * Lưu ý về href: next-intl Link KHÔNG nhận locale như một prop. Khi ở
 * trang `/en`, `<Link href="/du-an">` sẽ ra `/en/du-an` tự động. Nếu cần
 * ép sang locale khác, truyền thêm prop `locale` (xem LanguageSwitcher).
 */

type NavItem = {
  /** Translation key trong namespace 'navigation.header' - phải là literal để TS check. */
  labelKey:
    | 'home'
    | 'investors'
    | 'projects'
    | 'cart'
    | 'events'
    | 'more'
    | 'news'
    | 'utility'
    | 'training'
    | 'about'
    | 'contact'
    | 'feedback'
    | 'guide';
  href: string;
  aliases?: string[];
};

const DU_AN_HREF = '/du-an';

// Navigation items for normal mode
const NAV_ITEMS_NORMAL: NavItem[] = [
  { labelKey: 'home', href: '/' },
  { labelKey: 'investors', href: '/chu-dau-tu' },
  { labelKey: 'projects', href: DU_AN_HREF, aliases: ['/du-an'] },
  { labelKey: 'cart', href: '/quy-can' },
  { labelKey: 'events', href: '/su-kien' },
];

// Navigation items for clean mode - only 4 items: Chủ đầu tư, Dự án, Quỹ căn, Tiện ích
const NAV_ITEMS_CLEAN: NavItem[] = [
  { labelKey: 'investors', href: '/chu-dau-tu' },
  { labelKey: 'projects', href: DU_AN_HREF, aliases: ['/du-an'] },
  { labelKey: 'cart', href: '/quy-can' },
  { labelKey: 'utility', href: '/tien-ich' },
];

const MORE_MENU_ITEMS: NavItem[] = [
  { labelKey: 'news', href: '/tin-tuc' },
  { labelKey: 'utility', href: '/tien-ich' },
  { labelKey: 'training', href: '/dao-tao' },
  { labelKey: 'about', href: '/gioi-thieu' },
  { labelKey: 'contact', href: '/lien-he-chung-toi' },
  // Hai muc duoi khoi dong code.
  { labelKey: 'feedback', href: '/gop-y-va-phan-hoi' },
  { labelKey: 'guide', href: '/huong-dan' },
];

const BrandMark = () => (
  <Link href="/" className="flex min-w-0 items-center" aria-label="RealtyHub">
    <Image
      src="/images/home/logo-realtyhub-mark.svg"
      alt=""
      priority
      width={32}
      height={32}
      className="h-8 w-8 md:hidden"
    />
    <Image
      src="/images/home/logo-realtyhub.svg"
      alt=""
      priority
      width={140}
      height={40}
      className="hidden h-8 w-auto md:block"
    />
  </Link>
);

const SiteHeader = () => {
  // next-intl Navigation-aware hook: pathname vẫn là absolute path KHÔNG có
  // locale prefix (vd '/du-an' cho cả `/du-an` và `/en/du-an`). So sánh
  // active state vẫn như cũ, không cần thay đổi gì.
  const pathname = usePathname();
  const tHeader = useTranslations('navigation.header');
  const tCommon = useTranslations('common');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Get clean mode state
  const { isCleanMode } = useCleanMode();

  // Choose nav items based on clean mode
  const navItems = isCleanMode ? NAV_ITEMS_CLEAN : NAV_ITEMS_NORMAL;

  const moreRef = useRef<HTMLLIElement>(null);
  const isMoreClickLocked = useRef(false);
  const moreOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moreCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelMoreTimers = useCallback(() => {
    if (moreOpenTimerRef.current) {
      clearTimeout(moreOpenTimerRef.current);
      moreOpenTimerRef.current = null;
    }
    if (moreCloseTimerRef.current) {
      clearTimeout(moreCloseTimerRef.current);
      moreCloseTimerRef.current = null;
    }
  }, []);

  const closeMore = useCallback(() => {
    cancelMoreTimers();
    setIsMoreOpen(false);
    isMoreClickLocked.current = false;
  }, [cancelMoreTimers]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isNavItemActive = (item: { href: string; aliases?: string[] }) => {
    if (isActive(item.href)) return true;
    return item.aliases?.some((alias) => isActive(alias)) ?? false;
  };

  const isMoreActive = MORE_MENU_ITEMS.some((c) => isActive(c.href));

  useEffect(() => {
    if (pathname !== '/') return undefined;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 24);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  const onMoreToggleClick = () => {
    cancelMoreTimers();
    setIsMoreOpen((open) => {
      isMoreClickLocked.current = !open;
      return !open;
    });
  };
  const onMoreMouseEnter = () => {
    if (moreCloseTimerRef.current) {
      clearTimeout(moreCloseTimerRef.current);
      moreCloseTimerRef.current = null;
    }
    if (!isMoreOpen && !moreOpenTimerRef.current) {
      moreOpenTimerRef.current = setTimeout(() => {
        moreOpenTimerRef.current = null;
        setIsMoreOpen(true);
      }, 100);
    }
  };
  const onMoreMouseLeave = () => {
    if (moreOpenTimerRef.current) {
      clearTimeout(moreOpenTimerRef.current);
      moreOpenTimerRef.current = null;
    }

    if (isMoreClickLocked.current) {
      setIsMoreOpen(false);
      isMoreClickLocked.current = false;
      return;
    }

    if (isMoreOpen && !moreCloseTimerRef.current) {
      moreCloseTimerRef.current = setTimeout(() => {
        moreCloseTimerRef.current = null;
        setIsMoreOpen(false);
      }, 200);
    }
  };

  useEffect(() => {
    if (!isMoreOpen) return undefined;
    const onClick = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) closeMore();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMore();
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isMoreOpen, closeMore]);

  useEffect(() => {
    isMoreClickLocked.current = false;
    cancelMoreTimers();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMoreOpen(false);
  }, [pathname, cancelMoreTimers]);

  useEffect(() => cancelMoreTimers, [cancelMoreTimers]);

  useEffect(() => {
    if (!isMobileOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileOpen]);

  const variant: 'solid' | 'transparent' =
    pathname === '/' && !isScrolled ? 'transparent' : 'solid';
  const isTransparent = variant === 'transparent';
  const headerColor = isTransparent
    ? 'bg-transparent border-transparent'
    : 'bg-white border-gray-200';
  const navColor = isTransparent
    ? {
        active: 'text-white underline decoration-white decoration-2 underline-offset-8',
        idle: 'text-white/85 hover:text-white',
      }
    : {
        active: 'text-navy-700 underline decoration-brand-500 decoration-2 underline-offset-8',
        idle: 'text-gray-600 hover:text-brand-600',
      };
  const iconColor = isTransparent
    ? 'text-white/90 hover:bg-white/15 hover:text-white'
    : 'text-gray-500 hover:bg-gray-100 hover:text-brand-600';
  const moreBtnActive = isMoreActive ? navColor.active : navColor.idle;
  const dropdownPanelClass = isTransparent
    ? 'border border-white/20 bg-black/80 backdrop-blur-md'
    : 'border border-gray-200 bg-white shadow-theme-lg';
  const dropdownItemClass = isTransparent
    ? 'text-white/85 hover:bg-white/10 hover:text-white'
    : 'text-gray-700 hover:bg-brand-50 hover:text-brand-600';
  const dropdownItemActiveClass = isTransparent
    ? 'bg-white/10 text-white'
    : 'bg-brand-50 text-brand-600';

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors ${headerColor}`}>
      <div className="site-container relative flex h-14 items-center justify-between gap-2 md:h-16 md:gap-4">
        {/* iPad: hamburger + logo di chung mot cum ben trai.
         * Desktop (xl): `contents` bung cum ra, layout header giong ban cu
         * (logo | spacer | nav | icon) — khong doi giao dien desktop. */}
        <div className="flex min-w-0 items-center gap-2 xl:contents">
          <button
            type="button"
            onClick={() => setIsMobileOpen((open) => !open)}
            aria-label={isMobileOpen ? tCommon('actions.close') : tCommon('actions.viewMore')}
            aria-expanded={isMobileOpen}
            className={`order-first flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition xl:hidden ${iconColor}`}
          >
            {isMobileOpen ? <FiX aria-hidden className="h-5 w-5" /> : <FiMenu aria-hidden className="h-5 w-5" />}
          </button>

          <div data-clean-hide="brand-logo" className="min-w-0 shrink">
            <BrandMark />
          </div>
        </div>

        <nav aria-label={tHeader('home')} className="hidden xl:block" />

        <nav aria-label={tHeader('home')} className="hidden xl:block">
          <ul className="flex items-center gap-5">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isNavItemActive(item) ? 'page' : undefined}
                  className={`whitespace-nowrap text-theme-sm font-semibold uppercase tracking-wide transition ${
                    isNavItemActive(item) ? navColor.active : navColor.idle
                  }`}
                >
                  {tHeader(item.labelKey)}
                </Link>
              </li>
            ))}

            {/* Hide "More" menu in clean mode */}
            {!isCleanMode && (
              <li
                className="relative"
                ref={moreRef}
                onMouseEnter={onMoreMouseEnter}
                onMouseLeave={onMoreMouseLeave}
                data-clean-hide="secondary-nav"
              >
                <button
                  type="button"
                  onClick={onMoreToggleClick}
                  aria-haspopup="menu"
                  aria-expanded={isMoreOpen}
                  aria-current={isMoreActive ? 'page' : undefined}
                  className={`inline-flex items-center gap-1 whitespace-nowrap text-theme-sm font-semibold uppercase tracking-wide transition ${moreBtnActive}`}
                >
                  {tHeader('more')}
                  <FiChevronDown
                    aria-hidden
                    className={`h-4 w-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isMoreOpen && (
                  <div
                    role="menu"
                    aria-label={tHeader('more')}
                    className={`absolute right-0 top-full z-50 mt-3 min-w-56 overflow-hidden rounded-xl py-2 ${dropdownPanelClass}`}
                  >
                    {MORE_MENU_ITEMS.map((child) => {
                      const active = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          role="menuitem"
                          aria-current={active ? 'page' : undefined}
                          onClick={() => setIsMoreOpen(false)}
                          className={`block px-4 py-2.5 text-theme-sm font-medium transition ${
                            active ? dropdownItemActiveClass : dropdownItemClass
                          }`}
                        >
                          {tHeader(child.labelKey)}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </li>
            )}
          </ul>
        </nav>

        {/* Dien thoai va may tinh bang: cac icon co huy hieu dem (tim, chuong)
            nam sat nhau qua nen huy hieu lan sang icon ben canh - noi khoang
            cach ra. Desktop con thanh nav day du nen van gap-1 nhu cu. */}
        <div className="relative z-10 flex shrink-0 items-center gap-2 md:gap-2.5 xl:gap-1">
          {/*
            LanguageSwitcher doc useSearchParams de giu nguyen query khi doi
            ngon ngu. Header nam trong layout nen neu khong boc Suspense, MOI
            trang tinh deu bi Next tu choi prerender ("useSearchParams() should
            be wrapped in a suspense boundary") va `next build` dung lai o trang
            dau tien - dung loi vua gap tren CI.

            Fallback la mot o trong dung bang nut that (36x36) de header khong
            giat mot nhip luc client nha ra.
          */}
          <Suspense fallback={<span className="h-9 w-9 shrink-0" aria-hidden />}>
            <LanguageSwitcher iconClass={iconColor} />
          </Suspense>

          <Link
            href="/tin-nhan"
            aria-label={tHeader('messages')}
            data-clean-hide="utility-link"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${iconColor}`}
          >
            <FiMessageSquare aria-hidden className="h-5 w-5" />
          </Link>

          <FavoriteButton iconClass={iconColor} />

          <div data-clean-hide="utility-link" className="contents">
            <NotificationsPopover iconClass={iconColor} />
          </div>

          {/* Present mode chi co y nghia tren man hinh desktop (nav day du).
              Tu tablet tro xuong header da rat gon nen an han cho do roi. */}
          <span className="hidden xl:flex">
            <CleanModeToggle size="regular" className={iconColor} />
          </span>

          <div data-clean-hide="account" className="contents">
            <AccountMenu />
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            aria-hidden
            onClick={() => setIsMobileOpen(false)}
            className="absolute inset-0 bg-gray-900/50"
          />

          <nav
            aria-label={tHeader('home')}
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-panel"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
              <span onClick={() => setIsMobileOpen(false)} data-clean-hide="brand-logo">
                <BrandMark />
              </span>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                aria-label={tCommon('actions.close')}
                className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100"
              >
                <FiX aria-hidden className="text-xl" />
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <li key={item.href} className="border-b border-gray-100">
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    aria-current={isNavItemActive(item) ? 'page' : undefined}
                    className={`block px-5 py-4 text-base font-medium capitalize transition hover:bg-gray-50 ${
                      isNavItemActive(item) ? 'text-brand-600' : 'text-gray-800'
                    }`}
                  >
                    {tHeader(item.labelKey)}
                  </Link>
                </li>
              ))}

              {/* Hide "More" menu in clean mode on mobile */}
              {!isCleanMode && (
                <li className="border-b border-gray-100" data-clean-hide="secondary-nav">
                  <details open={isMoreActive} className="group">
                    <summary
                      className={`flex cursor-pointer list-none items-center justify-between px-5 py-4 text-base font-medium capitalize transition hover:bg-gray-50 ${
                        isMoreActive ? 'text-brand-600' : 'text-gray-800'
                      }`}
                    >
                      {tHeader('more')}
                      <FiChevronDown
                        aria-hidden
                        className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <ul className="bg-gray-50 pb-1">
                      {MORE_MENU_ITEMS.map((child) => {
                        const active = isActive(child.href);
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setIsMobileOpen(false)}
                              aria-current={active ? 'page' : undefined}
                              className={`block py-3 pl-9 pr-5 text-theme-sm transition hover:text-brand-600 ${
                                active ? 'font-semibold text-brand-600' : 'text-gray-600'
                              }`}
                            >
                              {tHeader(child.labelKey)}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
