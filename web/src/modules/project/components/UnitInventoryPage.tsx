'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  FiBriefcase,
  FiCompass,
  FiHome,
  FiMapPin,
  FiSearch,
  FiTag,
  FiX,
} from 'react-icons/fi';
import FilterSelect from '@/common/components/FilterSelect';
import Pagination from '@/common/components/Pagination';
import UnitCard from './UnitCard';
import UnitModal from './UnitModal';
import { useAllUnits } from '../hooks/useProjects';
import {
  DIRECTION_FILTER_OPTIONS,
  type AllUnitsQuery,
  type UnitWithProject,
  UNIT_STATUS_LABELS,
  type UnitSort,
} from '../models/project-detail.model';

/**
 * Trang /quy-can - tong hop toan bo can/san pham cua tat ca du an.
 *
 * URL la nguon su that duy nhat cua bo loc (giong /du-an):
 * - Copy link gui nguoi khac ra dung ket qua.
 * - Refresh khong mat filter.
 * - Nut Back cua trinh duyet chay dung.
 *
 * Ten tham so URL viet tat tieng Viet cho gon va doc duoc:
 *   q (search) · duan (projectSlug) · kv (regionId) · cdt (developerId)
 *   pk (phaseName) · lh (propertyTypeLabel) · huong (direction)
 *   tt (status) · gia-tu/gia-den · dt (areaMax) · sapxep · trang · sl
 */

const PARAM = {
  search: 'q',
  projectSlug: 'duan',
  regionId: 'kv',
  developerId: 'cdt',
  propertyTypeLabel: 'lh',
  phaseName: 'pk',
  direction: 'huong',
  status: 'tt',
  priceMin: 'gia-tu',
  priceMax: 'gia-den',
  areaMax: 'dt',
  sort: 'sapxep',
  page: 'trang',
  limit: 'sl',
} as const;

const ALLOWED_LIMITS = [12, 24, 48];
const DEFAULT_LIMIT = 24;

const SORT_OPTIONS = [
  { value: 'mac-dinh', label: 'Mặc định' },
  { value: 'gia-tang', label: 'Giá thấp → cao' },
  { value: 'gia-giam', label: 'Giá cao → thấp' },
  { value: 'dien-tich-tang', label: 'Diện tích nhỏ → lớn' },
  { value: 'dien-tich-giam', label: 'Diện tích lớn → nhỏ' },
];

/**
 * UnitSort chi chap nhan cac gia tri lien ke - URL co the chua bat cu chuoi
 * nao, service khong khop duoc thi khong co ket qua (tuong duong khong loc).
 */
const parseSort = (value: string | null): UnitSort => {
  if (value === 'gia-tang' || value === 'gia-giam' ||
      value === 'dien-tich-tang' || value === 'dien-tich-giam') {
    return value;
  }
  return 'mac-dinh';
};

/** Doi mot gia tri bo loc thanh doan text tren URL.
    null khi "khong loc gi" -> applyParams se xoa han tham so. */
const toParam = (value: string | number | null): string | null => {
  if (value === null || value === '') return null;
  return String(value);
};

/**
 * GRID_CLASS phai khop PageFallback o route page, neu khong Suspense nha
 * skeleton ra se bi nhay mot nhip. Desktop 4 cot, tablet 2, mobile 1.
 */
const GRID_CLASS = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

const CardSkeleton = () => (
  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
    <div className="aspect-16/9 w-full animate-pulse bg-gray-100" />
    <div className="space-y-3 p-5">
      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
      <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
    </div>
  </div>
);

const UnitInventoryPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── Doc trang thai tu URL ─────────────────────────────────────────────
  const readNumber = (key: string): number | null => {
    const raw = searchParams.get(key);
    if (raw === null) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const urlSearch = searchParams.get(PARAM.search) ?? '';
  const projectSlug = searchParams.get(PARAM.projectSlug);
  const regionId = searchParams.get(PARAM.regionId);
  const developerId = searchParams.get(PARAM.developerId);
  const propertyTypeLabel = searchParams.get(PARAM.propertyTypeLabel);
  const phaseName = searchParams.get(PARAM.phaseName);
  const direction = searchParams.get(PARAM.direction);
  const status = searchParams.get(PARAM.status);
  const priceMin = readNumber(PARAM.priceMin);
  const priceMax = readNumber(PARAM.priceMax);
  const areaMax = readNumber(PARAM.areaMax);
  const sort = parseSort(searchParams.get(PARAM.sort));

  const rawPage = Number(searchParams.get(PARAM.page));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawLimit = Number(searchParams.get(PARAM.limit));
  const limit = ALLOWED_LIMITS.includes(rawLimit) ? rawLimit : DEFAULT_LIMIT;

  // ── O tim kiem: go den dau hien den do, 300ms sau moi ghi vao URL ─────
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [lastUrlSearch, setLastUrlSearch] = useState(urlSearch);

  if (lastUrlSearch !== urlSearch) {
    setLastUrlSearch(urlSearch);
    if (searchInput !== urlSearch) setSearchInput(urlSearch);
  }

  const applyParams = useCallback(
    (updates: Record<string, string | null>, keepPage = false) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      }

      // Doi bo loc phai ve trang 1, tranh mac ket o trang trong.
      if (!keepPage) next.delete(PARAM.page);

      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (searchInput === urlSearch) return;
    const timer = setTimeout(
      () => applyParams({ [PARAM.search]: searchInput || null }),
      300,
    );
    return () => clearTimeout(timer);
  }, [searchInput, urlSearch, applyParams]);

  const submitSearch = useCallback(
    () => applyParams({ [PARAM.search]: searchInput || null }),
    [applyParams, searchInput],
  );

  // ── Truy van ───────────────────────────────────────────────────────────
  const query: AllUnitsQuery = useMemo(
    () => ({
      page,
      limit,
      sort,
      search: urlSearch,
      projectSlug,
      developerId,
      regionId,
      propertyTypeLabel,
      phaseName,
      direction,
      status: status as AllUnitsQuery['status'],
      priceMin,
      priceMax,
      areaMax,
    }),
    [
      page,
      limit,
      sort,
      urlSearch,
      projectSlug,
      developerId,
      regionId,
      propertyTypeLabel,
      phaseName,
      direction,
      status,
      priceMin,
      priceMax,
      areaMax,
    ],
  );

  const listQuery = useAllUnits(query);
  const facets = listQuery.data?.facets;

  // ── Dem o loc dang bat ─────────────────────────────────────────────────
  // Dem theo O LOC (khong theo so tham so URL) de trung voi nhan thuc nguoi
  // dung: khoang gia gom hai tham so nhung voi ho chi la mot bo loc.
  const activeCount =
    [
      urlSearch,
      projectSlug,
      developerId,
      regionId,
      propertyTypeLabel,
      phaseName,
      direction,
      status,
    ].filter((value) => value !== null && value !== '').length +
    [priceMin !== null, priceMax !== null, areaMax !== null].filter(Boolean).length;

  const clearAllFilters = useCallback(() => {
    setSearchInput('');
    router.replace(pathname, { scroll: false });
  }, [pathname, router, setSearchInput]);

  // ── Modal chi tiet can ─────────────────────────────────────────────
  // Click card -> mo popup thong tin can (khong navigate sang trang du an).
  // UnitCard da la UnitWithProject nen truyen thang vao modal duoc luon.
  const [selectedUnit, setSelectedUnit] = useState<UnitWithProject | null>(null);
  const handleUnitClick = useCallback((unit: UnitWithProject) => {
    setSelectedUnit(unit);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────
  const total = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasActiveFilter = activeCount > 0;
  const isFirstLoad = listQuery.isLoading;
  const isRefreshing = listQuery.isFetching && !isFirstLoad;
  const units = listQuery.data?.units ?? [];
  const queryKey = JSON.stringify(query);

  const animatedGrid = useMemo(() => units, [queryKey, units]);

  return (
    <div className="site-container py-8">
      {/* ── Tieu de ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-center text-3xl font-bold uppercase tracking-wide text-gray-900">
          Danh sách Quỹ căn
        </h1>
      </div>

      {/* ── Hang 1: tim kiem + sap xep ─────────────────────────────────── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch();
          }}
          role="search"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-gray-200 bg-white py-2 pl-5 pr-2 shadow-card transition focus-within:border-brand-300 focus-within:shadow-panel lg:max-w-2xl"
        >
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm theo mã căn, tên dự án, chủ đầu tư, phân khu..."
            aria-label="Tìm kiếm quỹ căn"
            className="h-9 min-w-0 flex-1 bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-400"
          />
          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-brand-50 hover:text-brand-600"
          >
            <FiSearch aria-hidden className="text-lg" />
          </button>
        </form>

        <div className="flex items-center gap-2 lg:ml-auto">
          <span className="text-theme-sm font-semibold uppercase tracking-wide text-gray-500">
            Sắp xếp
          </span>
          <FilterSelect
            variant="chip"
            label="Sắp xếp"
            icon={<FiTag />}
            value={sort}
            options={SORT_OPTIONS}
            isLoading={false}
            onChange={(next) => {
              applyParams({
                [PARAM.sort]: next === 'mac-dinh' ? null : (next as string),
              });
            }}
          />
        </div>
      </div>

      {/* ── Hang 2: chip loc ────────────────────────────────────────────── */}
      <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <FilterSelect
          key={`pj-${queryKey}`}
          variant="chip"
          label="Dự án"
          icon={<FiHome />}
          value={projectSlug}
          options={facets?.projectSlugs ?? []}
          isLoading={isFirstLoad}
          onChange={(next) => applyParams({ [PARAM.projectSlug]: next })}
        />
        <FilterSelect
          key={`kv-${queryKey}`}
          variant="chip"
          label="Khu vực"
          icon={<FiMapPin />}
          value={regionId}
          options={facets?.regionIds ?? []}
          isLoading={isFirstLoad}
          onChange={(next) => applyParams({ [PARAM.regionId]: next })}
        />
        <FilterSelect
          key={`pk-${queryKey}`}
          variant="chip"
          label="Phân khu"
          icon={<FiHome />}
          value={phaseName}
          options={(facets?.phaseNames ?? []).map((value) => ({ value, label: value }))}
          isLoading={isFirstLoad}
          onChange={(next) => applyParams({ [PARAM.phaseName]: next })}
        />
        <FilterSelect
          key={`lh-${queryKey}`}
          variant="chip"
          label="Loại hình"
          icon={<FiHome />}
          value={propertyTypeLabel}
          options={(facets?.propertyTypeLabels ?? []).map((value) => ({
            value,
            label: value,
          }))}
          isLoading={isFirstLoad}
          onChange={(next) => applyParams({ [PARAM.propertyTypeLabel]: next })}
        />
        <FilterSelect
          key={`cdt-${queryKey}`}
          variant="chip"
          label="Chủ đầu tư"
          icon={<FiBriefcase />}
          value={developerId}
          options={facets?.developerIds ?? []}
          isLoading={isFirstLoad}
          onChange={(next) => applyParams({ [PARAM.developerId]: next })}
        />
        <FilterSelect
          key={`tt-${queryKey}`}
          variant="chip"
          label="Trạng thái"
          icon={<FiTag />}
          value={status}
          options={(facets?.statuses ?? []).map((value) => ({
            value,
            label: UNIT_STATUS_LABELS[value],
          }))}
          isLoading={isFirstLoad}
          onChange={(next) => applyParams({ [PARAM.status]: next })}
        />
        <FilterSelect
          variant="chip"
          label="Hướng"
          icon={<FiCompass />}
          value={direction}
          options={DIRECTION_FILTER_OPTIONS}
          isLoading={isFirstLoad}
          onChange={(next) => applyParams({ [PARAM.direction]: next })}
        />

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="shrink-0 whitespace-nowrap px-2 text-theme-sm font-medium text-gray-500 underline underline-offset-2 transition hover:text-error-600"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* ── Hang 3: khoang gia + dien tich (bang number) ───────────────── */}
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-25 px-4 py-3">
        <span className="text-theme-xs font-semibold uppercase tracking-wide text-gray-500">
          Khoảng giá (tỷ VND)
        </span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="Từ"
          defaultValue={priceMin !== null ? priceMin / 1_000_000_000 : ''}
          onBlur={(event) => {
            const billion = Number(event.target.value);
            const vnd = Number.isFinite(billion) && billion > 0 ? billion * 1_000_000_000 : null;
            applyParams({ [PARAM.priceMin]: toParam(vnd) });
          }}
          className="h-9 w-24 rounded-md border border-gray-200 bg-white px-2 text-theme-sm text-gray-800 outline-none focus:border-brand-400"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="Đến"
          defaultValue={priceMax !== null ? priceMax / 1_000_000_000 : ''}
          onBlur={(event) => {
            const billion = Number(event.target.value);
            const vnd = Number.isFinite(billion) && billion > 0 ? billion * 1_000_000_000 : null;
            applyParams({ [PARAM.priceMax]: toParam(vnd) });
          }}
          className="h-9 w-24 rounded-md border border-gray-200 bg-white px-2 text-theme-sm text-gray-800 outline-none focus:border-brand-400"
        />

        <span className="ml-2 text-theme-xs font-semibold uppercase tracking-wide text-gray-500">
          DT đất ≤
        </span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="m²"
          defaultValue={areaMax ?? ''}
          onBlur={(event) => {
            const value = Number(event.target.value);
            applyParams({
              [PARAM.areaMax]: Number.isFinite(value) && value > 0 ? String(value) : null,
            });
          }}
          className="h-9 w-24 rounded-md border border-gray-200 bg-white px-2 text-theme-sm text-gray-800 outline-none focus:border-brand-400"
        />

        {hasActiveFilter && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="ml-auto flex items-center gap-1 text-theme-sm font-medium text-gray-500 underline underline-offset-2 transition hover:text-error-600"
          >
            <FiX aria-hidden className="text-base" />
            Xóa hết
          </button>
        )}
      </div>

      {/* ── So luong can tim thay ──────────────────────────────────────── */}
      <div className="mt-4 mb-4 flex min-h-5 items-center justify-between text-theme-sm text-gray-500">
        {isFirstLoad ? (
          <span className="h-4 w-32 animate-pulse rounded bg-gray-100" />
        ) : (
          <span aria-live="polite">
            {hasActiveFilter ? 'Tìm thấy ' : 'Có '}
            <strong className="text-gray-800">{total}</strong> căn trên toàn hệ thống
          </span>
        )}
        {isRefreshing && <span className="text-gray-400">Đang cập nhật...</span>}
      </div>

      {/* ── Grid can ───────────────────────────────────────────────────── */}
      {listQuery.isError ? (
        <div className="rounded-xl border border-error-500/30 bg-error-50 p-8 text-center">
          <p className="mb-4 text-theme-sm text-error-600">
            Không tải được quỹ căn.
          </p>
          <button
            type="button"
            onClick={() => listQuery.refetch()}
            className="rounded-md bg-brand-500 px-4 py-2 text-theme-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Thử lại
          </button>
        </div>
      ) : isFirstLoad ? (
        <div className={GRID_CLASS}>
          {Array.from({ length: 8 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : animatedGrid.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="mb-4 text-theme-sm text-gray-500">
            {hasActiveFilter
              ? 'Không tìm thấy căn nào phù hợp với bộ lọc.'
              : 'Chưa có căn nào trên hệ thống.'}
          </p>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="rounded-md border border-gray-300 px-4 py-2 text-theme-sm font-medium text-gray-700 transition hover:border-brand-400 hover:text-brand-600"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div
          className={`${GRID_CLASS} transition-opacity duration-200 ${
            isRefreshing ? 'opacity-70' : 'opacity-100'
          }`}
        >
          {animatedGrid.map((unit) => (
            <UnitCard key={unit.publicId} unit={unit} onUnitClick={handleUnitClick} />
          ))}
        </div>
      )}

      {/* ── Phan trang ─────────────────────────────────────────────────── */}
      {total > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={(nextPage) =>
              applyParams({ [PARAM.page]: nextPage > 1 ? String(nextPage) : null }, true)
            }
            onLimitChange={(nextLimit) =>
              applyParams({
                [PARAM.limit]: nextLimit === DEFAULT_LIMIT ? null : String(nextLimit),
              })
            }
          />
        </div>
      )}

      {/* ── Modal chi tiet can ─────────────────────────────────────────── */}
      <UnitModal unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
    </div>
  );
};

export default UnitInventoryPage;
