'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Danh sach booking cua nguoi dung hien tai.
 *
 * Chua co API booking nen luu trong localStorage, cung pattern SSR-safe voi
 * useFavoriteUnits: server tra danh sach rong, client hydrate tu localStorage,
 * moi tab deu nghe su kien 'storage' nen mo hai tab van thay nhu nhau.
 *
 * KHI CO BACKEND: doi ba ham doc/ghi ben duoi thanh goi service; cac component
 * chi dung `useBookings()` nen khong phai sua.
 */
const STORAGE_KEY = 'realtyhub:bookings';

/** Vong doi mot yeu cau booking */
export type BookingStatus = 'cho-xu-ly' | 'da-duyet' | 'da-tu-choi' | 'da-huy';

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  'cho-xu-ly': 'Đang chờ xử lý',
  'da-duyet': 'Đã duyệt',
  'da-tu-choi': 'Đã từ chối',
  'da-huy': 'Đã hủy',
};

export type BookingEntry = {
  /** Khoa rieng cua yeu cau - mot can co the booking lai sau khi bi tu choi */
  id: string;
  /** publicId cua can, de doi chieu khi can */
  unitId: string;
  unitCode: string;
  projectName: string;
  status: BookingStatus;
  /** Ly do tu choi - chi co khi status la 'da-tu-choi' */
  rejectReason?: string;
  /** Nguoi phu trach xu ly yeu cau */
  assignee?: string;
  /** Moc thoi gian tao yeu cau (ms) */
  requestedAt: number;
};

const listeners = new Set<() => void>();
const EMPTY: BookingEntry[] = [];

let cachedRaw: string | null = null;
let cachedValue: BookingEntry[] = EMPTY;

const parse = (raw: string | null): BookingEntry[] => {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY;
    // Bo qua ban ghi hong thay vi vut ca danh sach - du lieu nay nguoi dung
    // tu tao, mat het vi mot dong loi la qua dat.
    return parsed.filter(
      (item): item is BookingEntry =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as BookingEntry).id === 'string' &&
        typeof (item as BookingEntry).unitCode === 'string',
    );
  } catch {
    return EMPTY;
  }
};

const readSnapshot = (): BookingEntry[] => {
  if (typeof window === 'undefined') return EMPTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = parse(raw);
  return cachedValue;
};

const getServerSnapshot = () => EMPTY;

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
};

const write = (next: BookingEntry[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
};

export const useBookings = () => {
  const bookings = useSyncExternalStore(subscribe, readSnapshot, getServerSnapshot);
  const isHydrated = useSyncExternalStore(subscribe, () => true, () => false);

  /** Yeu cau moi nhat len dau - nguoi dung vua bam xong la thay ngay */
  const create = useCallback(
    (booking: Omit<BookingEntry, 'id' | 'status' | 'requestedAt'>) => {
      const entry: BookingEntry = {
        ...booking,
        id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        status: 'cho-xu-ly',
        requestedAt: Date.now(),
      };
      write([entry, ...readSnapshot()]);
      return entry;
    },
    [],
  );

  /** Huy mot yeu cau - giu lai ban ghi de con doi chieu lich su */
  const cancel = useCallback((id: string) => {
    write(
      readSnapshot().map((entry) =>
        entry.id === id ? { ...entry, status: 'da-huy' as BookingStatus } : entry,
      ),
    );
  }, []);

  /** Xoa han mot yeu cau khoi danh sach */
  const remove = useCallback((id: string) => {
    write(readSnapshot().filter((entry) => entry.id !== id));
  }, []);

  return { bookings, create, cancel, remove, isHydrated };
};
