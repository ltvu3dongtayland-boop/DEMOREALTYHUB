'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { usePathname } from 'next/navigation';
import { FiBell, FiInbox, FiX } from 'react-icons/fi';
import { HiMail } from 'react-icons/hi';

import { Link, useRouter } from '@/i18n/navigation';

import {
  CATEGORY_TONE,
  MOCK_NOTIFICATIONS,
  type NotificationItem,
} from '@/modules/notifications/mocks/notifications.mock';

/** Icon hop thu mo — hien khi thong bao da doc. */
const OpenMailboxIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className={className}
  >
    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
    <path d="M3 7 12 2l9 5-9 5-9-5Z" />
  </svg>
);

type Variant = 'solid' | 'transparent';

type NotificationsPopoverProps = {
  /** 'solid' (nen trang) hoac 'transparent' (header trong suot o trang chu). */
  variant: Variant;
  /** Class cho icon bell - truyen tu SiteHeader de giong cac icon khac. */
  iconClass: string;
};

const TIME_ZONE = 'Asia/Bangkok';
const hourFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TIME_ZONE,
});
// `vi-VN` numeric short date dung dau gach ngang; ban thiet ke dung dd/MM nen
// ghep tay tu cac part thay vi dua vao pattern cua locale.
const dateParts = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  timeZone: TIME_ZONE,
});
const formatDayMonth = (value: Date) => {
  const parts = dateParts.formatToParts(value);
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  return `${day}/${month}`;
};

/** Nhan thoi gian ngan gon giong ban thiet ke: gio trong ngay, "Hôm qua",
 * "N ngày trước" trong tuan, con lai la dd/MM. */
const formatNotificationTime = (iso: string) => {
  const created = new Date(iso);
  const dayIndex = (value: Date) =>
    Math.floor(
      (value.getTime() - value.getTimezoneOffset() * 60_000) / 86_400_000,
    );
  const diffDays = dayIndex(new Date()) - dayIndex(created);

  if (diffDays <= 0) return hourFormatter.format(created);
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDayMonth(created);
};

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue: NotificationItem[] = MOCK_NOTIFICATIONS;

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onChange);
  }
  return () => {
    listeners.delete(onChange);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onChange);
    }
  };
};

const readSnapshot = (): NotificationItem[] => {
  if (cachedRaw === null) {
    cachedRaw = 'mock';
    cachedValue = MOCK_NOTIFICATIONS;
  }
  return cachedValue;
};

/** Server khong co localStorage - tra cung 1 mock de SSR/CSR khop nhau o lan dau. */
const getServerSnapshot = (): NotificationItem[] => MOCK_NOTIFICATIONS;

/** Hook doc danh sach thong bao + danh dau da doc (local-only cho mock). */
export const useNotifications = () => {
  const items = useSyncExternalStore(subscribe, readSnapshot, getServerSnapshot);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const itemsWithRead = useMemo(
    () => items.map((item) => (overrides[item.publicId] === undefined ? item : { ...item, isRead: overrides[item.publicId] })),
    [items, overrides],
  );

  const unreadCount = useMemo(
    () => itemsWithRead.filter((item) => !item.isRead).length,
    [itemsWithRead],
  );

  const markAsRead = useCallback((id: string) => {
    setOverrides((prev) => ({ ...prev, [id]: true }));
  }, []);

  /** Toggle trang thai doc/chua doc cua 1 notification. Neu dang doc -> danh
   * la chua doc, neu dang chua doc -> danh la da doc. Dung cho nut cham
   * tron ben trai moi row trong popover. */
  const toggleRead = useCallback((id: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      const current = next[id];
      if (current === undefined) {
        // Chua co override: lay trang thai hien tai tu mock roi dao nguoc.
        const original = items.find((it) => it.publicId === id);
        next[id] = !(original?.isRead ?? false);
      } else {
        next[id] = !current;
      }
      return next;
    });
  }, [items]);

  /** Mark all as read hoac reverse (toggle) — phu thuoc vao coUnread. */
  const toggleAllRead = useCallback(() => {
    setOverrides((prev) => {
      const next = { ...prev };
      const allRead = itemsWithRead.every((item) => item.isRead);
      if (allRead) {
        // Tat ca da doc -> danh la chua doc.
        items.forEach((item) => {
          next[item.publicId] = false;
        });
      } else {
        // Con muc chua doc -> danh tat ca la da doc.
        items.forEach((item) => {
          if (!item.isRead) next[item.publicId] = true;
        });
      }
      return next;
    });
  }, [items, itemsWithRead]);

  return { items: itemsWithRead, unreadCount, markAsRead, toggleAllRead, toggleRead };
};

/** Popover noi dung - dung chung cho ca hover-locked va hover-only. */
const PopoverPanel = ({
  items,
  transparent,
  close,
  onToggleRead,
}: {
  items: NotificationItem[];
  transparent: boolean;
  close: () => void;
  onToggleRead: (id: string) => void;
}) => {
  // Cong tac "Chưa đọc": bat thi chi hien muc chua doc, tat thi xem tat ca.
  const router = useRouter();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const visibleItems = useMemo(
    () => (unreadOnly ? items.filter((item) => !item.isRead) : items),
    [items, unreadOnly],
  );
  // Chi lay 5 muc gan nhat de vua popup. Nguon du lieu day du o trang
  // /thong-bao (link "Xem them" ben duoi).
  const preview = useMemo(() => visibleItems.slice(0, 5), [visibleItems]);

  const panelClass = transparent
    ? 'border border-white/20 bg-black/85 backdrop-blur-md text-white'
    : 'border border-gray-200 bg-white shadow-theme-lg';
  const dividerClass = transparent ? 'divide-white/10' : 'divide-gray-100';
  const mutedClass = transparent ? 'text-white/70' : 'text-gray-500';
  const titleClass = transparent ? 'text-white' : 'text-gray-900';

  return (
    <div
      role="dialog"
      aria-label="Thông báo"
      className={`absolute right-0 top-full z-50 mt-3 w-[400px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl ${panelClass}`}
    >
      {/* Header: tieu de + cong tac "Chưa đọc" (loc danh sach) + dong. */}
      <div
        className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${
          transparent ? 'border-white/10' : 'border-gray-100'
        }`}
      >
        <div className={`text-theme-xl font-bold ${titleClass}`}>Thông báo</div>

        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <span className={`text-theme-sm ${mutedClass}`}>
              {unreadOnly ? 'Chưa đọc' : 'Tất cả'}
            </span>
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={() => setUnreadOnly((on) => !on)}
              aria-label={unreadOnly ? 'Hiện tất cả thông báo' : 'Chỉ hiện thông báo chưa đọc'}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className={`relative h-6 w-11 shrink-0 rounded-full transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300 ${
                transparent ? 'bg-white/25 peer-checked:bg-white/70' : 'bg-gray-200 peer-checked:bg-brand-500'
              } after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-card after:transition-transform peer-checked:after:translate-x-5`}
            />
          </label>

          <button
            type="button"
            onClick={close}
            aria-label="Đóng thông báo"
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${
              transparent
                ? 'text-white/70 hover:bg-white/15 hover:text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <FiX aria-hidden className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* List */}
      {preview.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <span
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${
              transparent ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-400'
            }`}
          >
            <FiInbox aria-hidden className="h-6 w-6" />
          </span>
          <div className={`mt-3 text-theme-sm font-semibold ${titleClass}`}>
            {unreadOnly ? 'Không còn thông báo chưa đọc' : 'Chưa có thông báo'}
          </div>
          <div className={`mt-1 text-theme-xs ${mutedClass}`}>
            {unreadOnly
              ? 'Bạn đã đọc hết các thông báo gần đây.'
              : 'Mọi cập nhật sẽ xuất hiện ở đây.'}
          </div>
        </div>
      ) : (
        <ul className={`max-h-[60vh] divide-y overflow-y-auto ${dividerClass}`}>
          {preview.map((item) => (
            <NotificationRow
              key={item.publicId}
              item={item}
              transparent={transparent}
              onActivate={() => close()}
              onToggleRead={onToggleRead}
            />
          ))}
        </ul>
      )}

      {/* Footer */}
      <Link
        href="/thong-bao"
        onClick={() => {
          router.push('/thong-bao');
          close();
        }}
        className={`block border-t px-4 py-3.5 text-center text-theme-sm font-semibold transition ${
          transparent
            ? 'border-white/15 text-white/85 hover:bg-white/10 hover:text-white'
            : 'border-gray-100 text-brand-500 hover:bg-gray-50 hover:text-brand-600'
        }`}
      >
        Xem thêm
      </Link>
    </div>
  );
};

/** Mot dong thong bao trong popup. Click vao link se mo href va dong popup.
 * Click vao nut phong bi ben phai se toggle trang thai doc/chua doc ma khong
 * dong popup (dung de user danh la chua doc lai mot muc da doc qua). */
const NotificationRow = ({
  item,
  transparent,
  onActivate,
  onToggleRead,
}: {
  item: NotificationItem;
  transparent: boolean;
  onActivate: () => void;
  onToggleRead: (id: string) => void;
}) => {
  // Dong chua doc duoc to nen xanh nhat de noi bat khoi cac dong da doc.
  const rowBg = item.isRead
    ? transparent
      ? 'hover:bg-white/10'
      : 'bg-white hover:bg-gray-50'
    : transparent
      ? 'bg-white/10 hover:bg-white/15'
      : 'bg-brand-25 hover:bg-brand-50';
  const avatarClass = transparent ? 'bg-white/15 text-lg' : `${CATEGORY_TONE[item.category]} text-lg`;
  const bodyClass = transparent ? 'text-white/80' : 'text-gray-700';
  const nameClass = transparent ? 'text-white' : 'text-gray-900';
  const timeClass = item.isRead
    ? transparent
      ? 'text-white/50'
      : 'text-gray-400'
    : transparent
      ? 'text-white'
      : 'text-brand-500';
  // Chua doc: phong bi dam tren nen xanh. Da doc: vong tron trang vien xam
  // + icon hop thu mo (SVG mau).
  const mailClass = item.isRead
    ? transparent
      ? 'border border-white/35 bg-white/10 text-white/70'
      : 'border border-gray-200 bg-white text-gray-400'
    : transparent
      ? 'border border-transparent bg-white/25 text-white'
      : 'border border-transparent bg-brand-50 text-brand-500';
  const MailIcon = item.isRead ? OpenMailboxIcon : HiMail;

  return (
    <li className="relative">
      <Link
        href={item.href}
        onClick={onActivate}
        className={`flex items-center gap-3 py-3 pl-4 pr-16 transition ${rowBg}`}
      >
        {/* Icon loai thong bao: chat / tui tien / can cau / bao */}
        <span
          aria-hidden
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${avatarClass}`}
        >
          {item.icon}
        </span>

        {/* Noi dung */}
        <div className="min-w-0 flex-1">
          <p className={`line-clamp-2 text-theme-sm leading-snug ${bodyClass}`}>
            <span className={`font-bold ${nameClass}`}>{item.source}</span>{' '}
            đã gửi cho bạn một thông báo
          </p>
          <p className={`mt-0.5 line-clamp-1 text-theme-sm leading-snug ${bodyClass}`}>
            {item.title}
          </p>
          {/* Nhan thoi gian phu thuoc vao "hom nay" nen server va client co the
           * render lech nhau vai giay - bo qua canh bao hydrate cho rieng no. */}
          <time
            dateTime={item.createdAt}
            suppressHydrationWarning
            className={`mt-1 block text-theme-xs ${timeClass}`}
          >
            {formatNotificationTime(item.createdAt)}
          </time>
        </div>
      </Link>

      {/* Nut phong bi: doi trang thai doc/chua doc ma khong dieu huong. Dat
       * ngoai Link de click khong bi Link nuot mat. */}
      <button
        type="button"
        onClick={() => onToggleRead(item.publicId)}
        aria-label={item.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
        aria-pressed={!item.isRead}
        className={`absolute right-4 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition hover:brightness-95 ${mailClass}`}
      >
        <MailIcon aria-hidden className="h-[18px] w-[18px]" />
      </button>
    </li>
  );
};

const NotificationsPopover = ({ variant, iconClass }: NotificationsPopoverProps) => {
  const pathname = usePathname();
  const { items, unreadCount, toggleRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const isClickLocked = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Timer de mo/dong co delay - tranh popup nhap nhay khi user chi luot
  // chuot ngang icon, va cho user kip di chuyen tu icon xuong panel qua
  // khoang gap giua button va dropdown.
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transparent = variant === 'transparent';

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
    isClickLocked.current = false;
  }, [cancelTimers]);

  // Hover: sau 100ms moi mo - dam bao user that su muon xem, khong phai
  // luot chuot ngang. Neu user bo di truoc khi timer chay thi huy.
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
  // Mouse leave: sau 200ms moi dong - du thoi gian di chuyen chuot tu icon
  // xuong panel (qua khoang gap `mt-3` giua button va dropdown). Khi da
  // khoa (user da click) thi dong ngay, khong can doi.
  const onMouseLeave = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (isClickLocked.current) {
      setIsOpen(false);
      isClickLocked.current = false;
      return;
    }
    if (isOpen && !closeTimerRef.current) {
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        setIsOpen(false);
      }, 200);
    }
  };

  // Click vao nut chuong de mo/khoa. Click khi dang mo -> mo khoa + dong.
  const onToggleClick = () => {
    cancelTimers();
    setIsOpen((open) => {
      isClickLocked.current = !open;
      return !open;
    });
  };

  // Dong popup khi click ra ngoai, nhan Esc hoac chuyen trang (pathname).
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

  // Dong popup + reset lock khi user chuyen trang (pathname thay doi). Set
  // state trong effect la can thiet cho UX "popup dong theo route" - pattern
  // nay cung xuat hien o userStore.ts (line 85) va FavoriteList.tsx trong
  // cung codebase.
  useEffect(() => {
    isClickLocked.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  // Cleanup timers khi unmount de tranh setState tren component da bi thao.
  useEffect(() => cancelTimers, [cancelTimers]);

  // Badge "99+" neu qua nhieu. An badge khi chua co unread de giu gon icon.
  const badgeText = unreadCount > 99 ? '99+' : String(unreadCount);
  const showBadge = unreadCount > 0;

  return (
    <div
      ref={containerRef}
      className="relative hidden items-center xl:flex"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        type="button"
        onClick={onToggleClick}
        aria-label={
          showBadge ? `Thông báo - ${unreadCount} mục chưa đọc` : 'Thông báo'
        }
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full transition ${iconClass}`}
      >
        <FiBell aria-hidden className="text-xl" />
        {showBadge && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
          >
            {badgeText}
          </span>
        )}
      </button>

      {isOpen && (
        <PopoverPanel
          items={items}
          transparent={transparent}
          close={close}
          onToggleRead={toggleRead}
        />
      )}
    </div>
  );
};

export default NotificationsPopover;