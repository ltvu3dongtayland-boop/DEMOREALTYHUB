'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Bookmark quy can (san pham) - tach storage voi du an yeu thich.
 *
 * Cung pattern SSR-safe voi useFavorites: server snapshot rong, client
 * hydrate tu localStorage. Header dem ca 2 loai; trang /yeu-thich hien
 * tab rieng "Quỹ căn".
 */
const STORAGE_KEY = 'realtyhub:favorite-units';

export type FavoriteUnitEntry = {
  publicId: string;
  savedAt: number;
};

const listeners = new Set<() => void>();
const EMPTY: FavoriteUnitEntry[] = [];

let cachedRaw: string | null = null;
let cachedValue: FavoriteUnitEntry[] = EMPTY;

const readFromStorage = (): FavoriteUnitEntry[] => {
  if (typeof window === 'undefined') return EMPTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY;
    const now = Date.now();
    const migrated: FavoriteUnitEntry[] = [];
    for (const item of parsed) {
      if (typeof item === 'string') {
        migrated.push({ publicId: item, savedAt: now });
      } else if (
        item &&
        typeof item === 'object' &&
        typeof (item as FavoriteUnitEntry).publicId === 'string'
      ) {
        const entry = item as FavoriteUnitEntry;
        migrated.push({
          publicId: entry.publicId,
          savedAt: typeof entry.savedAt === 'number' ? entry.savedAt : now,
        });
      }
    }
    return migrated;
  } catch {
    return EMPTY;
  }
};

const readSnapshot = (): FavoriteUnitEntry[] => {
  if (typeof window === 'undefined') return EMPTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = readFromStorage();
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

const writeToStorage = (next: FavoriteUnitEntry[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
};

export const useFavoriteUnits = () => {
  const favorites = useSyncExternalStore(subscribe, readSnapshot, getServerSnapshot);
  const isHydrated = useSyncExternalStore(subscribe, () => true, () => false);

  const toggle = useCallback((publicId: string) => {
    const latest = readSnapshot();
    const exists = latest.some((entry) => entry.publicId === publicId);
    writeToStorage(
      exists
        ? latest.filter((entry) => entry.publicId !== publicId)
        : [...latest, { publicId, savedAt: Date.now() }],
    );
  }, []);

  const isFavorite = useCallback(
    (publicId: string) => favorites.some((entry) => entry.publicId === publicId),
    [favorites],
  );

  const clearAll = useCallback(() => writeToStorage([]), []);

  return { favorites, isFavorite, toggle, clearAll, isHydrated };
};
