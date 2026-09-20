'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import Pagination from '@/common/components/Pagination';
import { formatNumber } from '@/common/utils/format';
import InvestorFilterBar from './InvestorFilterBar';
import {
  type InvestorFilterValues,
  type InvestorQuery,
  type InvestorSort,
} from '../models/investor.model';
import { useInvestorList } from '../hooks/useInvestors';
import type { InvestorSummary } from '../models/investor.model';

type InvestorListPageProps = {
  initialInvestors?: InvestorSummary[];
};

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

/**
 * URL param prefix — kept short but readable. Same convention as ProjectListPage.
 */
const PARAM = {
  search: 'q',
  region: 'kv',
  minProjects: 'mn',
  hasOpening: 'dm',
  hasAvailable: 'cl',
  sort: 'sx',
  page: 'trang',
  limit: 'sl',
} as const;

/** Map InvestorFilterValues key -> URL param name */
const PARAM_OF: Record<keyof InvestorFilterValues, string> = {
  search: PARAM.search,
  regionId: PARAM.region,
  minProjectCount: PARAM.minProjects,
  hasOpening: PARAM.hasOpening,
  hasAvailableUnits: PARAM.hasAvailable,
};

const ALLOWED_LIMITS = [12, 24, 48];
const DEFAULT_LIMIT = 12;

/** Null / empty string / false → delete the param */
const toParam = (
  value: InvestorFilterValues[keyof InvestorFilterValues],
): string | null => {
  if (value === null || value === '' || value === false) return null;
  if (value === true) return '1';
  return String(value);
};

const InvestorListPage = ({ initialInvestors }: InvestorListPageProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── Read state from URL ────────────────────────────────────────────────
  const readNumber = (key: string): number | null => {
    const raw = searchParams.get(key);
    if (raw === null) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const urlSearch = searchParams.get(PARAM.search) ?? '';
  const regionId = searchParams.get(PARAM.region);
  const minProjectCount = readNumber(PARAM.minProjects);
  const hasOpening = searchParams.get(PARAM.hasOpening) === '1';
  const hasAvailableUnits = searchParams.get(PARAM.hasAvailable) === '1';
  const sort = (searchParams.get(PARAM.sort) ?? 'mac-dinh') as InvestorSort;

  const rawPage = Number(searchParams.get(PARAM.page));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawLimit = Number(searchParams.get(PARAM.limit));
  const limit = ALLOWED_LIMITS.includes(rawLimit) ? rawLimit : DEFAULT_LIMIT;

  // ── Search input with 300ms debounce ────────────────────────────────
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [lastUrlSearch, setLastUrlSearch] = useState(urlSearch);

  // Sync back when URL changes externally (Back button, shared link).
  if (lastUrlSearch !== urlSearch) {
    setLastUrlSearch(urlSearch);
    if (searchInput !== urlSearch) setSearchInput(urlSearch);
  }

  // ── Apply URL params ─────────────────────────────────────────────────
  const applyParams = useCallback(
    (updates: Record<string, string | null>, keepPage = false) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      }

      if (!keepPage) next.delete(PARAM.page);

      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  // Debounce search input: write to URL after 300ms of no typing.
  useEffect(() => {
    if (searchInput === urlSearch) return;
    const timer = setTimeout(
      () => applyParams({ [PARAM.search]: searchInput || null }),
      300,
    );
    return () => clearTimeout(timer);
  }, [searchInput, urlSearch, applyParams]);

  // Enter / submit button: write immediately, skip the 300ms delay.
  const submitSearch = useCallback(
    () => applyParams({ [PARAM.search]: searchInput || null }),
    [applyParams, searchInput],
  );

  // ── Build query for TanStack Query ─────────────────────────────────
  const query: InvestorQuery = useMemo(
    () => ({
      page,
      limit,
      search: urlSearch,
      regionId,
      minProjectCount,
      hasOpening,
      hasAvailableUnits,
      sort,
    }),
    [page, limit, urlSearch, regionId, minProjectCount, hasOpening, hasAvailableUnits, sort],
  );

  const listQuery = useInvestorList(query);

  // ── Filter bar values ────────────────────────────────────────────────
  const filterValues: InvestorFilterValues = {
    search: searchInput,
    regionId,
    minProjectCount,
    hasOpening,
    hasAvailableUnits,
  };

  const handleFilterChange = useCallback(
    (updates: Partial<InvestorFilterValues>) => {
      const params: Record<string, string | null> = {};

      for (const [key, value] of Object.entries(updates)) {
        // Search has its own debounce — don't write to URL here.
        if (key === 'search') {
          setSearchInput(typeof value === 'string' ? value : '');
          continue;
        }

        params[PARAM_OF[key as keyof InvestorFilterValues]] = toParam(
          value as InvestorFilterValues[keyof InvestorFilterValues],
        );
      }

      if (Object.keys(params).length > 0) applyParams(params);
    },
    [applyParams, setSearchInput],
  );

  // ── Active filter count ──────────────────────────────────────────────
  const activeCount =
    [
      urlSearch,
      regionId,
      minProjectCount,
      hasOpening,
      hasAvailableUnits,
    ].filter((v) => v !== null && v !== '' && v !== false && v !== 0).length;

  const clearAllFilters = useCallback(() => {
    setSearchInput('');
    router.replace(pathname, { scroll: false });
  }, [pathname, router, setSearchInput]);

  // ── Derived render state ────────────────────────────────────────────
  // Start from SSR initial data; fall back when navigating between tabs.
  const investors = listQuery.data?.investors ?? initialInvestors ?? [];
  const total = listQuery.data?.total ?? investors.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasActiveFilter = activeCount > 0;

  const isFirstLoad = listQuery.isLoading;
  const isRefreshing = listQuery.isFetching && !isFirstLoad;

  return (
    <div className="site-container py-8">
      {/* ── Tieu de ──────────────────────────────────────────────────── */}
      <header className="mb-8">
        <h1 className="text-center text-3xl font-bold uppercase tracking-wide text-gray-900 md:text-4xl">
          Danh sách Chủ đầu tư
        </h1>
      </header>

      {/* ── Bo loc ──────────────────────────────────────────────────── */}
      <div className="mb-4">
        <InvestorFilterBar
          values={filterValues}
          onSubmitSearch={submitSearch}
          onChange={handleFilterChange}
          sort={sort}
          onSortChange={(nextSort) =>
            applyParams({
              [PARAM.sort]: nextSort === 'mac-dinh' ? null : nextSort,
            })
          }
        />
      </div>

      {/* ── Luoi chu dau tu ─────────────────────────────────────────── */}
      {listQuery.isError ? (
        <div className="rounded-xl border border-error-500/30 bg-error-50 p-8 text-center">
          <p className="mb-4 text-theme-sm text-error-600">
            Không tải được danh sách chủ đầu tư.
          </p>
          <button
            type="button"
            onClick={() => listQuery.refetch()}
            className="rounded-md bg-brand-500 px-4 py-2 text-theme-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Thử lại
          </button>
        </div>
      ) : isFirstLoad && !initialInvestors ? (
        <div className={GRID_CLASS}>
          {Array.from({ length: 8 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : investors.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="mb-4 text-theme-sm text-gray-500">
            {hasActiveFilter
              ? 'Không tìm thấy chủ đầu tư phù hợp với bộ lọc.'
              : 'Chưa có chủ đầu tư nào.'}
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
          {investors.map((investor) => (
            <InvestorCard
              key={investor.slug}
              slug={investor.slug}
              name={investor.name}
              logo={investor.logo}
              projectCount={investor.projectCount}
              availableUnitCount={investor.availableUnitCount}
            />
          ))}
        </div>
      )}

      {/* ── Phan trang ─────────────────────────────────────────────── */}
      {total > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={(nextPage) =>
            applyParams(
              { [PARAM.page]: nextPage > 1 ? String(nextPage) : null },
              true,
            )
          }
          onLimitChange={(nextLimit) =>
            applyParams({
              [PARAM.limit]:
                nextLimit === DEFAULT_LIMIT ? null : String(nextLimit),
            })
          }
        />
      )}
    </div>
  );
};

/** Card danh sach: logo + ten + 2 stats. Click -> /chu-dau-tu/[slug]. */
type InvestorCardProps = {
  slug: string;
  name: string;
  logo: string;
  projectCount: number;
  availableUnitCount: number;
};

const InvestorCard = ({
  slug,
  name,
  logo,
  projectCount,
  availableUnitCount,
}: InvestorCardProps) => {
  const detailHref = `/chu-dau-tu/${slug}`;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card transition hover:border-brand-200 hover:shadow-card-hover">
      <Link
        href={detailHref}
        aria-label={`Xem chi tiết chủ đầu tư ${name}`}
        className="group relative block aspect-16/9 w-full overflow-hidden bg-gray-50"
      >
        <div className="flex h-full items-center justify-center px-6 py-4">
          <img
            src={logo}
            alt={name}
            loading="lazy"
            width={256}
            height={160}
            className="max-h-full w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link
          href={detailHref}
          className="line-clamp-2 text-base font-bold uppercase tracking-wide text-gray-900 transition hover:text-brand-600"
        >
          {name}
        </Link>

        <dl className="grid grid-cols-2 gap-2 rounded-lg border border-gray-100 bg-gray-25 p-3 text-center">
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Dự án
            </dt>
            <dd className="mt-0.5 text-theme-sm font-bold text-gray-900">
              {projectCount}
            </dd>
          </div>
          <div className="border-l border-gray-100">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Còn hàng
            </dt>
            <dd className="mt-0.5 text-theme-sm font-bold text-brand-600">
              {formatNumber(availableUnitCount)}
              <span className="ml-0.5 text-[10px] font-medium text-gray-400">căn</span>
            </dd>
          </div>
        </dl>

        <div className="mt-auto pt-1">
          <Link
            href={detailHref}
            aria-label={`Xem chi tiết chủ đầu tư ${name}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand-500 px-4 py-2.5 text-theme-sm font-semibold text-white transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Xem chi tiết
            <FiArrowRight aria-hidden className="text-base" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default InvestorListPage;
