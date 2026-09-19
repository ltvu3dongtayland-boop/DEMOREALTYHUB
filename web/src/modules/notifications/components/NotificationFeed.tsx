'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';
import { FiBellOff, FiCheck, FiFilter, FiInbox, FiSearch } from 'react-icons/fi';
import { HiMail } from 'react-icons/hi';

import OpenMailboxIcon from '@/common/components/OpenMailboxIcon';
import { formatNotificationTime } from '@/common/utils/format';

import {
  MOCK_NOTIFICATIONS,
  type NotificationItem,
} from '@/modules/notifications/mocks/notifications.mock';

/**
 * Feed trang thong bao - client component.
 *
 * Dinh dang moi dong giong popover chuong tren header (NotificationsPopover)
 * de hai cho nhin nhu nhau: khong icon loai, chi nguon + tieu de + thoi gian,
 * nut phong bi ben phai de dao trang thai doc.
 *
 * Chuc nang:
 *   - Filter theo trang thai doc (tat ca / chua doc / da doc)
 *   - Search theo title/source (don gian, client-side)
 *   - Mark 1 notification as read khi click
 *   - "Đánh dấu tất cả đã đọc" button
 *
 * Khi co backend:
 *   - Thay MOCK_NOTIFICATIONS bang useQuery('notifications', () => fetch('/notifications'))
 *   - PATCH /notifications/:id/read (single)
 *   - POST /notifications/read-all (bulk)
 *   - DELETE /notifications/:id (bulk)
 *   - Optimistic update: cap nhat state truoc, rollback neu API fail
 */

// ============================================================================
// Helpers
// ============================================================================

type Group = { id: string; label: string; items: NotificationItem[] };

const TODAY_LABEL = 'Hôm nay';
const YESTERDAY_LABEL = 'Hôm qua';
const THIS_WEEK_LABEL = 'Tuần này';
const EARLIER_LABEL = 'Trước đó';

const groupByDate = (items: NotificationItem[]): Group[] => {
  const today = new Date('2026-08-09T00:00:00.000Z').getTime();
  const yesterday = today - 24 * 60 * 60 * 1000;
  const weekStart = today - 6 * 24 * 60 * 60 * 1000;

  const todayItems: NotificationItem[] = [];
  const yesterdayItems: NotificationItem[] = [];
  const weekItems: NotificationItem[] = [];
  const earlierItems: NotificationItem[] = [];

  items.forEach((item) => {
    const t = new Date(item.createdAt).getTime();
    if (t >= today) todayItems.push(item);
    else if (t >= yesterday) yesterdayItems.push(item);
    else if (t >= weekStart) weekItems.push(item);
    else earlierItems.push(item);
  });

  const groups: Group[] = [];
  if (todayItems.length) groups.push({ id: 'today', label: TODAY_LABEL, items: todayItems });
  if (yesterdayItems.length)
    groups.push({ id: 'yesterday', label: YESTERDAY_LABEL, items: yesterdayItems });
  if (weekItems.length)
    groups.push({ id: 'week', label: THIS_WEEK_LABEL, items: weekItems });
  if (earlierItems.length)
    groups.push({ id: 'earlier', label: EARLIER_LABEL, items: earlierItems });

  return groups;
};

type ReadFilter = 'all' | 'unread' | 'read';

const READ_FILTERS: Array<{ id: ReadFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unread', label: 'Chưa đọc' },
  { id: 'read', label: 'Đã đọc' },
];

// ============================================================================
// Component
// ============================================================================

const NotificationFeed = () => {
  const [items, setItems] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<ReadFilter>('all');
  const [search, setSearch] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);

  // Filter + group
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      if (activeFilter === 'unread' && item.isRead) return false;
      if (activeFilter === 'read' && !item.isRead) return false;
      if (!term) return true;
      return (
        item.title.toLowerCase().includes(term) ||
        item.source.toLowerCase().includes(term) ||
        item.excerpt.toLowerCase().includes(term)
      );
    });
  }, [items, activeFilter, search]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const unreadCount = useMemo(() => items.filter((i) => !i.isRead).length, [items]);

  const filterCounts = useMemo<Record<ReadFilter, number>>(
    () => ({
      all: items.length,
      unread: items.filter((i) => !i.isRead).length,
      read: items.filter((i) => i.isRead).length,
    }),
    [items],
  );

  const markAsRead = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.publicId === id ? { ...i, isRead: true } : i))
    );
  };

  /** Nut phong bi ben phai moi dong: dao trang thai doc/chua doc, giong
   * hanh vi cua popover chuong tren header. */
  const toggleRead = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.publicId === id ? { ...i, isRead: !i.isRead } : i))
    );
  };

  const markAllAsRead = async () => {
    setBulkBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
    setBulkBusy(false);
  };

  // Empty state
  if (items.length === 0) {
    return <EmptyState icon={FiBellOff} title="Chưa có thông báo" message="Mọi cập nhật sẽ xuất hiện ở đây." />;
  }

  if (filtered.length === 0) {
    return <EmptyState icon={FiInbox} title="Không có kết quả" message="Thử bỏ bộ lọc hoặc từ khoá khác." />;
  }

  return (
    <div className="space-y-6">
      {/* ============ Filter bar ============ */}
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-theme-xs md:p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2">
            <FiSearch aria-hidden className="h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Tìm theo tiêu đề, nguồn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-theme-sm text-gray-900 placeholder-gray-400 outline-none"
            />
          </div>

          {/* Mark all read */}
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={bulkBusy || unreadCount === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-theme-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiCheck aria-hidden className="h-4 w-4" />
            <span className="hidden md:inline">Đánh dấu tất cả đã đọc</span>
            <span className="md:hidden">Đọc tất cả</span>
          </button>
        </div>

        {/* Read-state chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          <FiFilter aria-hidden className="h-4 w-4 text-gray-400" />
          {READ_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-theme-xs font-semibold transition ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-500 text-white shadow-theme-xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200 hover:bg-indigo-50/50'
                }`}
              >
                {filter.label}
                <span
                  className={`ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {filterCounts[filter.id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============ Feed groups ============ */}
      <div className="space-y-8">
        {grouped.map((group) => (
          <section key={group.id}>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-theme-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                {group.label}
              </h2>
              <span className="text-theme-xs text-gray-400">
                {group.items.length} thông báo
              </span>
              <span aria-hidden className="h-px flex-1 bg-gray-200" />
            </div>

            <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-theme-xs">
              {group.items.map((item) => (
                <NotificationRow
                  key={item.publicId}
                  item={item}
                  onMarkRead={() => markAsRead(item.publicId)}
                  onToggleRead={() => toggleRead(item.publicId)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

const EmptyState = ({
  icon: Icon,
  title,
  message,
}: {
  icon: React.ComponentType<{ 'aria-hidden'?: boolean; className?: string }>;
  title: string;
  message: string;
}) => (
  <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/40 p-12 text-center">
    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-400 shadow-theme-xs">
      <Icon aria-hidden className="h-8 w-8" />
    </span>
    <h3 className="mt-4 font-serif text-lg font-bold text-gray-900">{title}</h3>
    <p className="mt-1 text-theme-sm text-gray-600">{message}</p>
  </div>
);

/** Mot dong thong bao — cung bo cuc voi popover chuong: nguon in dam + cau
 * "đã gửi cho bạn một thông báo", tieu de, thoi gian, nut phong bi. */
const NotificationRow = ({
  item,
  onMarkRead,
  onToggleRead,
}: {
  item: NotificationItem;
  onMarkRead: () => void;
  onToggleRead: () => void;
}) => {
  const handleClick = () => {
    if (!item.isRead) onMarkRead();
  };
  const MailIcon = item.isRead ? OpenMailboxIcon : HiMail;

  return (
    <li
      className={`relative border-b border-gray-100 last:border-b-0 ${
        item.isRead ? 'bg-white hover:bg-gray-50' : 'bg-brand-25 hover:bg-brand-50'
      }`}
    >
      <Link href={item.href} onClick={handleClick} className="block py-3.5 pl-4 pr-14">
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
        onClick={onToggleRead}
        aria-label={item.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
        aria-pressed={!item.isRead}
        className={`absolute right-3 top-3.5 inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
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

export default NotificationFeed;