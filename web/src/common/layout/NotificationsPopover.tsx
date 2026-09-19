'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { usePathname } from 'next/navigation';
import { FiBell, FiInbox, FiX } from 'react-icons/fi';
import { HiMail } from 'react-icons/hi';

import { Link, useRouter } from '@/i18n/navigation';

import OpenMailboxIcon from '@/common/components/OpenMailboxIcon';
import { formatNotificationTime } from '@/common/utils/format';

import {
  MOCK_NOTIFICATIONS,
  type NotificationItem,
} from '@/modules/notifications/mocks/notifications.mock';

type NotificationsPopoverProps = {
  /** Class cho icon bell - truyen tu SiteHeader de giong cac icon khac. */
  iconClass: string;
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

/** Panel luon nen trang + chu toi, ke ca khi header trang chu dang
 * `text-white`. `isolate` + mau chu tuong minh de khong ke thua mau tu header. */
const PopoverPanel = ({
  items,
  close,
  onToggleRead,
}: {
  items: NotificationItem[];
  close: () => void;
  onToggleRead: (id: string) => void;
}) => {
  const router = useRouter();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const visibleItems = useMemo(
    () => (unreadOnly ? items.filter((item) => !item.isRead) : items),
    [items, unreadOnly],
  );
  const preview = useMemo(() => visibleItems.slice(0, 5), [visibleItems]);

  return (
    <div
      role="dialog"
      aria-label="Thông báo"
      className="isolate absolute right-0 top-full z-50 mt-3 w-[380px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-theme-lg max-md:fixed max-md:left-3 max-md:right-3 max-md:top-14 max-md:z-[60] max-md:w-auto max-md:max-w-none"
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="text-theme-lg font-bold text-gray-900">Thông báo</div>

        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <span className="text-theme-sm text-gray-500">
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
              className="relative h-6 w-11 shrink-0 rounded-full bg-gray-200 transition peer-checked:bg-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-card after:transition-transform peer-checked:after:translate-x-5"
            />
          </label>

          <button
            type="button"
            onClick={close}
            aria-label="Đóng thông báo"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <FiX aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>

      {preview.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <FiInbox aria-hidden className="h-6 w-6" />
          </span>
          <div className="mt-3 text-theme-sm font-semibold text-gray-900">
            {unreadOnly ? 'Không còn thông báo chưa đọc' : 'Chưa có thông báo'}
          </div>
          <div className="mt-1 text-theme-xs text-gray-500">
            {unreadOnly
              ? 'Bạn đã đọc hết các thông báo gần đây.'
              : 'Mọi cập nhật sẽ xuất hiện ở đây.'}
          </div>
        </div>
      ) : (
        <ul className="max-h-[min(60vh,420px)] overflow-y-auto">
          {preview.map((item) => (
            <NotificationRow
              key={item.publicId}
              item={item}
              onActivate={() => close()}
              onToggleRead={onToggleRead}
            />
          ))}
        </ul>
      )}

      <Link
        href="/thong-bao"
        onClick={() => {
          router.push('/thong-bao');
          close();
        }}
        className="block border-t border-gray-100 px-4 py-3 text-center text-theme-sm font-semibold text-brand-500 transition hover:bg-gray-50 hover:text-brand-600"
      >
        Xem tất cả
      </Link>
    </div>
  );
};

/** Mot dong: nguon in dam + cau "đã gửi cho bạn một thông báo" chay lien,
 * tieu de ben duoi, thoi gian mau brand neu chua doc, nut phong bi ben phai. */
const NotificationRow = ({
  item,
  onActivate,
  onToggleRead,
}: {
  item: NotificationItem;
  onActivate: () => void;
  onToggleRead: (id: string) => void;
}) => {
  const MailIcon = item.isRead ? OpenMailboxIcon : HiMail;

  return (
    <li
      className={`relative border-b border-gray-100 last:border-b-0 ${
        item.isRead ? 'bg-white hover:bg-gray-50' : 'bg-brand-25 hover:bg-brand-50'
      }`}
    >
      <Link
        href={item.href}
        onClick={onActivate}
        className="block py-3 pl-4 pr-12"
      >
        <p
          className={`text-theme-sm leading-snug ${
            item.isRead ? 'text-gray-600' : 'text-gray-800'
          }`}
        >
          <span className={`font-bold ${item.isRead ? 'text-gray-800' : 'text-gray-900'}`}>
            {item.source}
          </span>{' '}
          đã gửi cho bạn một thông báo
        </p>
        <p
          className={`mt-0.5 line-clamp-1 text-theme-sm leading-snug ${
            item.isRead ? 'text-gray-500' : 'text-gray-700'
          }`}
        >
          {item.title}
        </p>
        <time
          dateTime={item.createdAt}
          suppressHydrationWarning
          className={`mt-1 block text-theme-xs ${
            item.isRead ? 'text-gray-400' : 'font-semibold text-brand-500'
          }`}
        >
          {formatNotificationTime(item.createdAt)}
        </time>
      </Link>

      <button
        type="button"
        onClick={() => onToggleRead(item.publicId)}
        aria-label={item.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
        aria-pressed={!item.isRead}
        className={`absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
          item.isRead
            ? 'text-gray-300 hover:bg-gray-100 hover:text-gray-500'
            : 'text-brand-500 hover:bg-brand-100'
        }`}
      >
        <MailIcon aria-hidden className="h-[18px] w-[18px]" />
      </button>
    </li>
  );
};

/** Chuot that (desktop) moi dung hover. Dien thoai/iPad tao mouseenter/leave
 * gia khi tap — neu van listen se mo roi dong ngay, nut chuong "khong an". */
const canHoverOpen = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const NotificationsPopover = ({ iconClass }: NotificationsPopoverProps) => {
  const pathname = usePathname();
  const { items, unreadCount, toggleRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const openedByClick = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Timer de mo/dong co delay - tranh popup nhap nhay khi user chi luot
  // chuot ngang icon, va cho user kip di chuyen tu icon xuong panel qua
  // khoang gap giua button va dropdown.
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    openedByClick.current = false;
    setIsOpen(false);
  }, [cancelTimers]);

  const onMouseEnter = () => {
    if (!canHoverOpen() || openedByClick.current) return;
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
    if (!canHoverOpen() || openedByClick.current) return;
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
    setIsOpen((open) => {
      const next = !open;
      openedByClick.current = next;
      return next;
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
    openedByClick.current = false;
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
      className="relative flex items-center"
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
        <FiBell aria-hidden className="h-5 w-5" />
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
        <PopoverPanel items={items} close={close} onToggleRead={toggleRead} />
      )}
    </div>
  );
};

export default NotificationsPopover;