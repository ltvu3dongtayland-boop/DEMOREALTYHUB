'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FiArrowRight,
  FiCheck,
  FiCopy,
  FiHeart,
  FiTrash2,
} from 'react-icons/fi';

import {
  formatRelativeSaved,
  useFavorites,
  type FavoriteEntry,
} from '@/common/hooks/useFavorites';
import { useFavoriteUnits } from '@/common/hooks/useFavoriteUnits';
import type {
  Project,
  ProjectSegment,
} from '@/modules/project/models/project.model';
import {
  matchesDirection,
  type UnitWithProject,
} from '@/modules/project/models/project-detail.model';
import ProjectCard from './ProjectCard';
import UnitCard from './UnitCard';
import UnitModal from './UnitModal';

/**
 * Trang /yeu-thich - grid cac du an user da bookmark, co filter + sort.
 *
 * Tinh nang:
 *   - Filter theo phan khuc (chips: Tat ca / Cao tang / Thap tang)
 *   - Sort: Vua luu (mac dinh) / Ten A-Z / Phan khuc
 *   - Action bar: "Xoa tat ca" + "Chia se" (copy link public)
 *   - Hien thi savedAt relative ("vua luu", "2 gio truoc") nho stamp thoi gian
 *   - Empty state co CTA + goi y 3 du an noi bat tu /gio-hang
 *
 * Data flow:
 *   1. useFavorites() tra danh sach FavoriteEntry (publicId + savedAt) tu localStorage.
 *   2. Component goi ProjectService.byIds() de lay full Project.
 *   3. Filter + sort chay o client (chi <100 items nen re-render re).
 *   4. Click heart -> useFavorites.toggle -> favorites thay doi -> effect re-run ->
 *      query lai, grid update, item bien mat neu bi xoa.
 *
 * SSR-safe: favorites ban dau = [] (server) -> skeleton grid hien thi.
 * Sau mount favorites hydrate, effect chay query, isLoading flip, swap data.
 */
const GRID_CLASS = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';

const SEGMENT_FILTER_LABELS: Record<ProjectSegment, string> = {
  'cao-tang': 'Cao tầng',
  'thap-tang': 'Thấp tầng',
};

type FavoriteTab = 'projects' | 'units';
type SegmentFilter = 'all' | ProjectSegment;
type SortKey = 'saved-desc' | 'name-asc' | 'segment';
type UnitTypeFilter = 'all' | string;
type UnitDirectionFilter = 'all' | 'dong-tu-trach' | 'tay-tu-trach';
type UnitSortKey =
  | 'saved-desc'
  | 'price-asc'
  | 'price-desc'
  | 'area-desc'
  | 'code-asc';

const SORT_LABELS: Record<SortKey, string> = {
  'saved-desc': 'Vừa lưu',
  'name-asc': 'Tên A → Z',
  'segment': 'Phân khúc',
};

const UNIT_SORT_LABELS: Record<UnitSortKey, string> = {
  'saved-desc': 'Vừa lưu',
  'price-asc': 'Giá thấp → cao',
  'price-desc': 'Giá cao → thấp',
  'area-desc': 'Diện tích lớn → nhỏ',
  'code-asc': 'Mã căn A → Z',
};

const UNIT_DIRECTION_CHIPS: { value: UnitDirectionFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả hướng' },
  { value: 'dong-tu-trach', label: 'Đông tứ trạch' },
  { value: 'tay-tu-trach', label: 'Tây tứ trạch' },
];

const chipClass = (active: boolean) =>
  `rounded-full px-4 py-1.5 text-theme-xs font-semibold uppercase tracking-wide transition ${
    active
      ? 'bg-brand-500 text-white shadow-theme-xs'
      : 'border border-gray-200 bg-white text-gray-600 hover:border-brand-400 hover:text-brand-600'
  }`;

const FavoriteList = () => {
  const { favorites, isHydrated, clearAll } = useFavorites();
  const {
    favorites: unitFavorites,
    isHydrated: unitsHydrated,
    clearAll: clearAllUnits,
  } = useFavoriteUnits();
  const [tab, setTab] = useState<FavoriteTab>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<UnitWithProject[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithProject | null>(null);
  const [savedAtMap, setSavedAtMap] = useState<Map<string, number>>(
    () => new Map(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isUnitsLoading, setIsUnitsLoading] = useState(false);

  // UI state (filter + sort + share modal)
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('saved-desc');
  const [unitTypeFilter, setUnitTypeFilter] = useState<UnitTypeFilter>('all');
  const [unitDirectionFilter, setUnitDirectionFilter] =
    useState<UnitDirectionFilter>('all');
  const [unitSortKey, setUnitSortKey] = useState<UnitSortKey>('saved-desc');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Query lai mock data moi khi danh sach id thay doi.
  useEffect(() => {
    if (!isHydrated) return;

    // Cap nhat savedAtMap de hien "vua luu ... phut truoc" trong card.
    // Lay tu favorites thay vi query rieng de dong bo voi state hook.
    // Set state trong effect la can thiet cho "favorites vua doi -> map
    // phai cap nhat de sort theo savedAt chinh xac".
    const map = new Map<string, number>();
    favorites.forEach((entry) => map.set(entry.publicId, entry.savedAt));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedAtMap(map);

    if (favorites.length === 0) {
      // Empty list khong can query -> clear ngay.
      setProjects([]);
      return;
    }

    let cancelled = false;
    // isLoading flip true khi bat dau query moi; can thiet de hien skeleton.
    setIsLoading(true);

    // Lazy import de tranh include mock data vao bundle khi user chua vao
    // trang nay - nho hon ~100kb (mock + service).
    import('../services/project.service').then(({ ProjectService }) => {
      ProjectService.byIds(favorites.map((entry) => entry.publicId)).then(
        (list) => {
          if (cancelled) return;
          setProjects(list);
          setIsLoading(false);
        },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [favorites, isHydrated]);

  useEffect(() => {
    if (!unitsHydrated) return;
    if (unitFavorites.length === 0) {
      setUnits([]);
      return;
    }

    let cancelled = false;
    setIsUnitsLoading(true);

    import('../services/project.service').then(({ ProjectService }) => {
      ProjectService.unitsByIds(unitFavorites.map((entry) => entry.publicId)).then(
        (list) => {
          if (cancelled) return;
          setUnits(list);
          setIsUnitsLoading(false);
        },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [unitFavorites, unitsHydrated]);

  // Filter + sort client-side. Re-compute khi projects / filter / sortKey doi.
  // Luon sort TRUOC roi filter moi dung, hoac nguoc lai deu OK vi <100 items.
  const visibleProjects = useMemo(() => {
    const filtered =
      segmentFilter === 'all'
        ? projects
        : projects.filter((project) => project.segment === segmentFilter);

    const sorted = [...filtered];
    switch (sortKey) {
      case 'saved-desc':
        sorted.sort(
          (a, b) =>
            (savedAtMap.get(b.publicId) ?? 0) -
            (savedAtMap.get(a.publicId) ?? 0),
        );
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        break;
      case 'segment':
        sorted.sort((a, b) => a.segment.localeCompare(b.segment, 'vi'));
        break;
      default:
        break;
    }
    return sorted;
  }, [projects, segmentFilter, sortKey, savedAtMap]);

  // Dem so luong moi phan khuc (hien thi label "Cao tang (3)" tren chip).
  const segmentCounts = useMemo(() => {
    const counts: Record<SegmentFilter, number> = {
      all: projects.length,
      'cao-tang': 0,
      'thap-tang': 0,
    };
    projects.forEach((project) => {
      counts[project.segment] += 1;
    });
    return counts;
  }, [projects]);

  // "Vua luu" cho ca trang - moi nhat trong danh sach.
  const mostRecentSavedAt = useMemo(() => {
    if (favorites.length === 0) return null;
    return favorites.reduce(
      (max, entry) => Math.max(max, entry.savedAt),
      0,
    );
  }, [favorites]);

  const mostRecentUnitSavedAt = useMemo(() => {
    if (unitFavorites.length === 0) return null;
    return unitFavorites.reduce((max, entry) => Math.max(max, entry.savedAt), 0);
  }, [unitFavorites]);

  const unitSavedAtMap = useMemo(() => {
    const map = new Map<string, number>();
    unitFavorites.forEach((entry) => map.set(entry.publicId, entry.savedAt));
    return map;
  }, [unitFavorites]);

  const unitTypeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    units.forEach((unit) => {
      const key = unit.propertyTypeLabel || 'Khác';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], 'vi'));
  }, [units]);

  const visibleUnits = useMemo(() => {
    const filtered = units.filter((unit) => {
      if (
        unitTypeFilter !== 'all' &&
        (unit.propertyTypeLabel || 'Khác') !== unitTypeFilter
      ) {
        return false;
      }
      if (
        unitDirectionFilter !== 'all' &&
        !matchesDirection(unit.direction, unitDirectionFilter)
      ) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered];
    switch (unitSortKey) {
      case 'saved-desc':
        sorted.sort(
          (a, b) =>
            (unitSavedAtMap.get(b.publicId) ?? 0) -
            (unitSavedAtMap.get(a.publicId) ?? 0),
        );
        break;
      case 'price-asc':
        sorted.sort((a, b) => (a.listedPrice ?? 0) - (b.listedPrice ?? 0));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.listedPrice ?? 0) - (a.listedPrice ?? 0));
        break;
      case 'area-desc':
        sorted.sort((a, b) => (b.landArea ?? 0) - (a.landArea ?? 0));
        break;
      case 'code-asc':
        sorted.sort((a, b) => a.code.localeCompare(b.code, 'vi'));
        break;
      default:
        break;
    }
    return sorted;
  }, [
    units,
    unitTypeFilter,
    unitDirectionFilter,
    unitSortKey,
    unitSavedAtMap,
  ]);

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      window.prompt('Sao chép liên kết:', window.location.href);
    }
  };

  const handleClearAll = () => {
    if (tab === 'units') {
      clearAllUnits();
      setUnitTypeFilter('all');
      setUnitDirectionFilter('all');
      setUnitSortKey('saved-desc');
    } else {
      clearAll();
    }
    setShowClearConfirm(false);
  };

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-900 md:text-3xl">
          Yêu thích
        </h1>
        <p className="mt-1 text-theme-sm text-gray-500">
          Dự án và quỹ căn bạn đã lưu để theo dõi, so sánh.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Loại yêu thích"
        className="mb-6 grid grid-cols-2 gap-1 rounded-2xl border border-gray-200 bg-gray-50 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'projects'}
          onClick={() => {
            setTab('projects');
            setShowClearConfirm(false);
          }}
          className={`rounded-xl px-3 py-2.5 text-theme-sm font-semibold transition ${
            tab === 'projects'
              ? 'bg-white text-brand-600 shadow-theme-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Dự án
          {isHydrated && (
            <span className="ml-1.5 text-theme-xs font-bold text-gray-400">
              {favorites.length}
            </span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'units'}
          onClick={() => {
            setTab('units');
            setShowClearConfirm(false);
          }}
          className={`rounded-xl px-3 py-2.5 text-theme-sm font-semibold transition ${
            tab === 'units'
              ? 'bg-white text-brand-600 shadow-theme-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Quỹ căn
          {unitsHydrated && (
            <span className="ml-1.5 text-theme-xs font-bold text-gray-400">
              {unitFavorites.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'projects' && (
        <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        {mostRecentSavedAt ? (
          <p className="text-theme-xs text-gray-400">
            Lưu gần nhất: {formatRelativeSaved(mostRecentSavedAt)}
          </p>
        ) : (
          <span />
        )}
        {isHydrated && favorites.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-theme-xs font-semibold uppercase tracking-wide text-brand-700">
            <FiHeart aria-hidden className="h-3.5 w-3.5" />
            {favorites.length} dự án
          </span>
        )}
      </div>

      {/* Toolbar: filter + sort + actions. Chi hien khi co du lieu. */}
      {isHydrated && !isLoading && projects.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs lg:flex-row lg:items-center lg:justify-between">
          {/* Filter chips theo phan khuc */}
          <div
            role="tablist"
            aria-label="Lọc theo phân khúc"
            className="flex flex-wrap items-center gap-2"
          >
            {(
              [
                { value: 'all', label: 'Tất cả' },
                {
                  value: 'cao-tang',
                  label: `${SEGMENT_FILTER_LABELS['cao-tang']} (${segmentCounts['cao-tang']})`,
                },
                {
                  value: 'thap-tang',
                  label: `${SEGMENT_FILTER_LABELS['thap-tang']} (${segmentCounts['thap-tang']})`,
                },
              ] as { value: SegmentFilter; label: string }[]
            ).map((chip) => {
              const active = segmentFilter === chip.value;
              return (
                <button
                  key={chip.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSegmentFilter(chip.value)}
                  className={`rounded-full px-4 py-1.5 text-theme-xs font-semibold uppercase tracking-wide transition ${
                    active
                      ? 'bg-brand-500 text-white shadow-theme-xs'
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-brand-400 hover:text-brand-600'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Right: sort + actions */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-theme-xs text-gray-500">
              <span>Sắp xếp</span>
              <select
                value={sortKey}
                onChange={(event) =>
                  setSortKey(event.target.value as SortKey)
                }
                className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-theme-sm font-medium text-gray-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleCopyShare}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-theme-xs font-semibold text-gray-700 transition hover:border-brand-400 hover:text-brand-600"
            >
              {shareCopied ? (
                <>
                  <FiCheck aria-hidden className="h-3.5 w-3.5 text-success-600" />
                  Đã sao chép
                </>
              ) : (
                <>
                  <FiCopy aria-hidden className="h-3.5 w-3.5" />
                  Chia sẻ
                </>
              )}
            </button>

            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-error-200 bg-error-50 px-3 py-1.5 text-theme-xs font-semibold text-error-700 transition hover:bg-error-100"
              >
                <FiTrash2 aria-hidden className="h-3.5 w-3.5" />
                Xóa tất cả
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-md border border-error-300 bg-error-50 px-3 py-1.5">
                <span className="text-theme-xs font-semibold text-error-700">
                  Xóa tất cả?
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="rounded bg-error-600 px-2 py-0.5 text-theme-xs font-bold uppercase text-white hover:bg-error-700"
                >
                  Có
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded bg-white px-2 py-0.5 text-theme-xs font-bold uppercase text-gray-600 hover:bg-gray-100"
                >
                  Không
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skeleton luc chua hydrate hoac dang query */}
      {(!isHydrated || isLoading) && (
        <div className={GRID_CLASS}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-xl bg-gray-100"
              aria-hidden
            />
          ))}
        </div>
      )}

      {/* Empty state - chi hien khi da hydrate va khong co favorites */}
      {isHydrated && !isLoading && favorites.length === 0 && (
        <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-500 shadow-theme-xs">
            <FiHeart aria-hidden className="h-6 w-6" />
          </span>
          <h2 className="text-lg font-semibold text-gray-900">
            Chưa có dự án yêu thích
          </h2>
          <p className="mt-1.5 text-theme-sm text-gray-500">
            Bấm vào biểu tượng trái tim trên bất kỳ dự án nào để lưu vào đây.
          </p>
          <Link
            href="/du-an"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-theme-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Khám phá dự án
            <FiArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Co du lieu nhung filter khong match - empty state nho */}
      {isHydrated &&
        !isLoading &&
        favorites.length > 0 &&
        visibleProjects.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-theme-sm text-gray-500">
            Không có dự án thuộc phân khúc &ldquo;
            {SEGMENT_FILTER_LABELS[segmentFilter as ProjectSegment] ??
              segmentFilter}
            &rdquo;.
            <button
              type="button"
              onClick={() => setSegmentFilter('all')}
              className="ml-2 font-semibold text-brand-600 hover:text-brand-700"
            >
              Xem tất cả
            </button>
          </div>
        )}

      {/* Grid ProjectCard - click heart se tu xoa khoi list */}
      {isHydrated && !isLoading && visibleProjects.length > 0 && (
        <div className={GRID_CLASS}>
          {visibleProjects.map((project) => (
            <ProjectCard key={project.publicId} project={project} />
          ))}
        </div>
      )}
        </>
      )}

      {tab === 'units' && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            {mostRecentUnitSavedAt ? (
              <p className="text-theme-xs text-gray-400">
                Lưu gần nhất: {formatRelativeSaved(mostRecentUnitSavedAt)}
              </p>
            ) : (
              <span />
            )}
            {unitsHydrated && unitFavorites.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-theme-xs font-semibold uppercase tracking-wide text-brand-700">
                <FiHeart aria-hidden className="h-3.5 w-3.5" />
                {unitFavorites.length} quỹ căn
              </span>
            )}
          </div>

          {unitsHydrated && !isUnitsLoading && units.length > 0 && (
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div
                  role="tablist"
                  aria-label="Lọc theo loại hình"
                  className="flex flex-wrap items-center gap-2"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={unitTypeFilter === 'all'}
                    onClick={() => setUnitTypeFilter('all')}
                    className={chipClass(unitTypeFilter === 'all')}
                  >
                    Tất cả ({units.length})
                  </button>
                  {unitTypeCounts.map(([label, count]) => {
                    const active = unitTypeFilter === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setUnitTypeFilter(label)}
                        className={chipClass(active)}
                      >
                        {label} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 text-theme-xs text-gray-500">
                    <span>Sắp xếp</span>
                    <select
                      value={unitSortKey}
                      onChange={(event) =>
                        setUnitSortKey(event.target.value as UnitSortKey)
                      }
                      className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-theme-sm font-medium text-gray-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    >
                      {(Object.keys(UNIT_SORT_LABELS) as UnitSortKey[]).map(
                        (key) => (
                          <option key={key} value={key}>
                            {UNIT_SORT_LABELS[key]}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={handleCopyShare}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-theme-xs font-semibold text-gray-700 transition hover:border-brand-400 hover:text-brand-600"
                  >
                    {shareCopied ? (
                      <>
                        <FiCheck aria-hidden className="h-3.5 w-3.5 text-success-600" />
                        Đã sao chép
                      </>
                    ) : (
                      <>
                        <FiCopy aria-hidden className="h-3.5 w-3.5" />
                        Chia sẻ
                      </>
                    )}
                  </button>

                  {!showClearConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(true)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-error-200 bg-error-50 px-3 py-1.5 text-theme-xs font-semibold text-error-700 transition hover:bg-error-100"
                    >
                      <FiTrash2 aria-hidden className="h-3.5 w-3.5" />
                      Xóa tất cả
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-error-300 bg-error-50 px-3 py-1.5">
                      <span className="text-theme-xs font-semibold text-error-700">
                        Xóa tất cả?
                      </span>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="rounded bg-error-600 px-2 py-0.5 text-theme-xs font-bold uppercase text-white hover:bg-error-700"
                      >
                        Có
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                        className="rounded bg-white px-2 py-0.5 text-theme-xs font-bold uppercase text-gray-600 hover:bg-gray-100"
                      >
                        Không
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div
                role="tablist"
                aria-label="Lọc theo hướng phong thủy"
                className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3"
              >
                {UNIT_DIRECTION_CHIPS.map((chip) => {
                  const active = unitDirectionFilter === chip.value;
                  return (
                    <button
                      key={chip.value}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setUnitDirectionFilter(chip.value)}
                      className={chipClass(active)}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(!unitsHydrated || isUnitsLoading) && (
            <div className={GRID_CLASS}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-xl bg-gray-100"
                  aria-hidden
                />
              ))}
            </div>
          )}

          {unitsHydrated && !isUnitsLoading && unitFavorites.length === 0 && (
            <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
              <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-500 shadow-theme-xs">
                <FiHeart aria-hidden className="h-6 w-6" />
              </span>
              <h2 className="text-lg font-semibold text-gray-900">
                Chưa có quỹ căn yêu thích
              </h2>
              <p className="mt-1.5 text-theme-sm text-gray-500">
                Bấm trái tim trên thẻ căn ở trang Quỹ căn để lưu vào đây.
              </p>
              <Link
                href="/quy-can"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-theme-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Xem quỹ căn
                <FiArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          )}

          {unitsHydrated &&
            !isUnitsLoading &&
            units.length > 0 &&
            visibleUnits.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-theme-sm text-gray-500">
                Không có quỹ căn khớp bộ lọc hiện tại.
                <button
                  type="button"
                  onClick={() => {
                    setUnitTypeFilter('all');
                    setUnitDirectionFilter('all');
                  }}
                  className="ml-2 font-semibold text-brand-600 hover:text-brand-700"
                >
                  Xem tất cả
                </button>
              </div>
            )}

          {unitsHydrated && !isUnitsLoading && visibleUnits.length > 0 && (
            <div className={GRID_CLASS}>
              {visibleUnits.map((unit) => (
                <UnitCard
                  key={unit.publicId}
                  unit={unit}
                  onUnitClick={setSelectedUnit}
                />
              ))}
            </div>
          )}
        </>
      )}

      <UnitModal unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
    </>
  );
};

// Re-export type de cac noi khac co the su dung neu can.
export type { FavoriteEntry };

export default FavoriteList;