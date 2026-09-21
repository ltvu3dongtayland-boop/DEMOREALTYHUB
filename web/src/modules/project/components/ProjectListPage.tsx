'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Pagination from '@/common/components/Pagination';
import ProjectCard from './ProjectCard';
import ProjectFilterBar, {
  type ProjectFilterValues,
  type ProjectViewMode,
} from './ProjectFilterBar';
import ProjectMapView from './ProjectMapView';
import { useFavorites } from '../hooks/useFavorites';
import {
  useProjectFilterOptions,
  useProjectHighlights,
  useProjectList,
} from '../hooks/useProjects';
import {
  type ProjectAmenityTag,
  type ProjectFilterOptions,
  type ProjectLegal,
  type ProjectPropertyType,
  type ProjectQuery,
  type ProjectSegment,
  type ProjectStatus,
  type ProjectViewpoint,
} from '../models/project.model';

/**
 * URL la nguon su that duy nhat cua bo loc: refresh khong mat filter,
 * copy link gui nguoi khac ra dung ket qua, nut Back cua trinh duyet chay dung.
 *
 * Ten tham so viet tat tieng Viet cho link ngan va van doc duoc.
 */
const PARAM = {
  search: 'q',
  developer: 'cdt',
  region: 'kv',
  propertyType: 'lh',
  status: 'tt',
  segment: 'pk',
  priceMin: 'gia-tu',
  priceMax: 'gia-den',
  areaMax: 'dt',
  bedrooms: 'pn',
  handoverBefore: 'bg',
  amenityTags: 'ti',
  viewpoints: 'vw',
  legal: 'pl',
  hasDiscount: 'ck',
  hasBankSupport: 'nh',
  postedWithinDays: 'dang',
  sort: 'sapxep',
  page: 'trang',
  limit: 'sl',
} as const;

/** Moi khoa loc tren ProjectFilterValues ung voi dung mot tham so URL */
const PARAM_OF: Record<keyof ProjectFilterValues, string> = {
  search: PARAM.search,
  developerId: PARAM.developer,
  regionId: PARAM.region,
  propertyType: PARAM.propertyType,
  status: PARAM.status,
  segment: PARAM.segment,
  priceMin: PARAM.priceMin,
  priceMax: PARAM.priceMax,
  areaMax: PARAM.areaMax,
  bedrooms: PARAM.bedrooms,
  handoverBefore: PARAM.handoverBefore,
  amenityTags: PARAM.amenityTags,
  viewpoints: PARAM.viewpoints,
  legal: PARAM.legal,
  hasDiscount: PARAM.hasDiscount,
  hasBankSupport: PARAM.hasBankSupport,
  postedWithinDays: PARAM.postedWithinDays,
};

const ALLOWED_LIMITS = [12, 24, 48];
const DEFAULT_LIMIT = 12;

const EMPTY_OPTIONS: ProjectFilterOptions = {
  developers: [],
  regions: [],
  propertyTypes: [],
  statuses: [],
  segments: [],
  amenityTags: [],
  viewpoints: [],
  legals: [],
  handoverYears: [],
};

const toParam = (value: ProjectFilterValues[keyof ProjectFilterValues]) => {
  if (value === null || value === '' || value === false) return null;
  if (value === true) return '1';
  if (Array.isArray(value)) return value.length > 0 ? value.join(',') : null;
  return String(value);
};

const GRID_CLASS = 'grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 project-grid-clean';

/**
 * Khung xuong mot the du an.
 *
 * Kich thuoc phai khop ProjectCard TUNG LOP MOT (ti le anh 16/10, dem p-2 /
 * md:p-4, hai loi tat cao 54px): the that cao hon khung xuong bao nhieu thi
 * luc Suspense nha ra ca trang nhay bay nhieu.
 */
const CardSkeleton = () => (
  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
    <div className="aspect-[16/10] w-full animate-pulse bg-gray-100" />
    <div className="p-2 md:p-4">
      <div className="grid grid-cols-2 gap-1">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-[54px] animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  </div>
);

/**
 * Khung xuong CA TRANG, dung cho <Suspense> o route /du-an.
 *
 * De o day chu khong viet rieng trong route: hai ben phai cao bang nhau, ma
 * chi file nay biet trang that duoc dung nhu the nao. Truoc day route tu ve
 * mot luoi khac (1-2-3 cot, the cao 384px) nen luc doi sang noi dung that
 * chieu cao trang doi dot ngot - man hinh giat mot cai xuong roi len lai.
 */
export const ProjectListSkeleton = () => (
  <div className="site-container py-8">
    <div className="mx-auto mb-6 h-9 w-72 animate-pulse rounded bg-gray-200" />

    {/* Hang tim kiem + sap xep */}
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
      <div className="h-[54px] flex-1 animate-pulse rounded-full bg-gray-100 lg:max-w-2xl" />
      <div className="h-9 w-40 animate-pulse rounded-full bg-gray-100 lg:ml-auto" />
    </div>

    {/* Hang chip loc */}
    <div className="mt-3 flex gap-2 pb-1">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-9 w-32 animate-pulse rounded-full bg-gray-100" />
      ))}
    </div>

    {/* Dong "Co N du an" */}
    <div className="mb-4 mt-4 h-5 w-32 animate-pulse rounded bg-gray-100" />

    <div className={GRID_CLASS}>
      {Array.from({ length: 9 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  </div>
);

const ProjectListPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // `projects.title` chứa H1 của trang. Các label filter/sort/empty được
  // truyền vào ProjectFilterBar qua prop `t` (xem dưới).
  const t = useTranslations('projects');

  // ── Doc trang thai tu URL ────────────────────────────────────────────────
  // URL do nguoi dung sua duoc, nen moi gia tri deu phai qua mot buoc lam sach:
  // so hong tra ve null, danh sach rong tra ve mang rong.
  const readNumber = (key: string): number | null => {
    const raw = searchParams.get(key);
    if (raw === null) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const readList = (key: string): string[] => {
    const raw = searchParams.get(key);
    return raw ? raw.split(',').filter(Boolean) : [];
  };

  const urlSearch = searchParams.get(PARAM.search) ?? '';
  const developerId = searchParams.get(PARAM.developer);
  const regionId = searchParams.get(PARAM.region);
  const propertyType = searchParams.get(PARAM.propertyType);
  const status = searchParams.get(PARAM.status);
  const segment = searchParams.get(PARAM.segment);
  const legal = searchParams.get(PARAM.legal);
  const priceMin = readNumber(PARAM.priceMin);
  const priceMax = readNumber(PARAM.priceMax);
  const areaMax = readNumber(PARAM.areaMax);
  const bedrooms = readNumber(PARAM.bedrooms);
  const handoverBefore = readNumber(PARAM.handoverBefore);
  const postedWithinDays = readNumber(PARAM.postedWithinDays);
  const amenityTags = readList(PARAM.amenityTags);
  const viewpoints = readList(PARAM.viewpoints);
  const hasDiscount = searchParams.get(PARAM.hasDiscount) === '1';
  const hasBankSupport = searchParams.get(PARAM.hasBankSupport) === '1';
  const sort = searchParams.get(PARAM.sort) ?? 'mac-dinh';

  const rawPage = Number(searchParams.get(PARAM.page));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawLimit = Number(searchParams.get(PARAM.limit));
  const limit = ALLOWED_LIMITS.includes(rawLimit) ? rawLimit : DEFAULT_LIMIT;

  // Cach xem khong phai bo loc nen khong day len URL - doi tab xong tai lai
  // trang thi ve mac dinh la danh sach, dung nhu mong doi.
  const [view, setView] = useState<ProjectViewMode>('danh-sach');

  // ── O tim kiem: go den dau hien den do, 300ms sau moi ghi vao URL ────────
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [lastUrlSearch, setLastUrlSearch] = useState(urlSearch);

  // Dong bo nguoc khi URL doi tu ben ngoai (nut Back, dan link moi).
  // Day la cach React khuyen dung de "chinh state khi prop doi": so sanh voi
  // gia tri truoc do luu trong state va set ngay trong than render, re hon
  // useEffect vi khong ton them mot vong commit.
  /**
   * Tu khoa ma CHINH trang nay vua ghi len URL (state chu khong phai ref:
   * gia tri nay duoc DOC ngay trong than render o ngay duoi).
   *
   * Khong co no thi moi lan ghi xong, URL doi va khoi dong bo ben duoi tuong
   * la "URL doi tu ben ngoai" nen keo o nhap ve theo URL. Trong 300ms cho ghi
   * nguoi dung da go them vai chu, va nhung chu do bi xoa mat.
   */
  const [pushedSearch, setPushedSearch] = useState(urlSearch);

  // Dong bo nguoc CHI khi URL doi tu ben ngoai: nut Back, dan mot link moi.
  if (lastUrlSearch !== urlSearch) {
    setLastUrlSearch(urlSearch);
    if (urlSearch !== pushedSearch && searchInput !== urlSearch) {
      setSearchInput(urlSearch);
    }
  }

  const applyParams = useCallback(
    (updates: Record<string, string | null>, keepPage = false) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      }

      // Doi bo loc thi phai ve trang 1, neu khong nguoi dung ket o trang trong
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
    const timer = setTimeout(() => {
      setPushedSearch(searchInput);
      applyParams({ [PARAM.search]: searchInput || null });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, urlSearch, applyParams]);

  // Bam nut Tim kiem / go Enter: ap ngay, khong doi het 300ms. Sau khi URL doi
  // thi effect tren thay searchInput === urlSearch nen khong ap lai lan nua.
  const submitSearch = useCallback(() => {
    setPushedSearch(searchInput);
    applyParams({ [PARAM.search]: searchInput || null });
  }, [applyParams, searchInput]);

  // ── Truy van ─────────────────────────────────────────────────────────────
  // Cac phep ep kieu o day la ranh gioi giua "chuoi bat ky tren URL" va union
  // hep cua model. Gia tri la vo nghia thi service khong khop du an nao, tuong
  // duong khong loc - nen khong can kiem tra tung gia tri mot.
  const amenityTagsKey = amenityTags.join(',');
  const viewpointsKey = viewpoints.join(',');

  const query: ProjectQuery = useMemo(
    () => ({
      page,
      limit,
      search: urlSearch,
      developerId,
      regionId,
      propertyType: propertyType as ProjectPropertyType | null,
      status: status as ProjectStatus | null,
      segment: segment as ProjectSegment | null,
      priceMin,
      priceMax,
      areaMax,
      bedrooms,
      handoverBefore,
      amenityTags: (amenityTagsKey ? amenityTagsKey.split(',') : []) as ProjectAmenityTag[],
      viewpoints: (viewpointsKey ? viewpointsKey.split(',') : []) as ProjectViewpoint[],
      legal: legal as ProjectLegal | null,
      hasDiscount,
      hasBankSupport,
      postedWithinDays,
    }),
    // amenityTags/viewpoints la mang moi o moi lan render nen phai phu thuoc vao
    // chuoi da noi, neu khong useMemo khong bao gio giu duoc ket qua cu
    [
      page,
      limit,
      urlSearch,
      developerId,
      regionId,
      propertyType,
      status,
      segment,
      priceMin,
      priceMax,
      areaMax,
      bedrooms,
      handoverBefore,
      amenityTagsKey,
      viewpointsKey,
      legal,
      hasDiscount,
      hasBankSupport,
      postedWithinDays,
    ],
  );

  const listQuery = useProjectList(query);
  const optionsQuery = useProjectFilterOptions();
  const highlightsQuery = useProjectHighlights();
  const { favorites } = useFavorites();

  const options = optionsQuery.data ?? EMPTY_OPTIONS;

  const filterValues: ProjectFilterValues = {
    search: searchInput,
    developerId,
    regionId,
    propertyType,
    status,
    segment,
    priceMin,
    priceMax,
    areaMax,
    bedrooms,
    handoverBefore,
    amenityTags,
    viewpoints,
    legal,
    hasDiscount,
    hasBankSupport,
    postedWithinDays,
  };

  const handleFilterChange = useCallback(
    (updates: Partial<ProjectFilterValues>) => {
      const params: Record<string, string | null> = {};

      for (const [key, value] of Object.entries(updates)) {
        // O tim kiem co do tre go phim rieng, khong ghi thang len URL
        if (key === 'search') {
          setSearchInput(typeof value === 'string' ? value : '');
          continue;
        }

        params[PARAM_OF[key as keyof ProjectFilterValues]] = toParam(
          value as ProjectFilterValues[keyof ProjectFilterValues],
        );
      }

      // Ghi mot lan cho ca nhom, neu khong lan sau se dung URL cu lam goc
      if (Object.keys(params).length > 0) applyParams(params);
    },
    [applyParams, setSearchInput],
  );

  // ── So o loc dang bat ────────────────────────────────────────────────────
  // Dem theo tung o loc chu khong theo so tham so URL: khoang gia gom hai
  // tham so nhung voi nguoi dung do van la mot bo loc.
  const activeCount =
    [
      urlSearch,
      developerId,
      regionId,
      propertyType,
      status,
      segment,
      legal,
      bedrooms,
      handoverBefore,
      postedWithinDays,
    ].filter((value) => value !== null && value !== '').length +
    [
      priceMin !== null || priceMax !== null,
      areaMax !== null,
      amenityTags.length > 0,
      viewpoints.length > 0,
      hasDiscount,
      hasBankSupport,
    ].filter(Boolean).length;

  const clearAllFilters = useCallback(() => {
    setSearchInput('');
    router.replace(pathname, { scroll: false });
  }, [pathname, router, setSearchInput]);

  /**
   * Du an da tim duoc day len dau.
   *
   * Sap xep o day chu khong o ProjectService: danh sach tim nam trong
   * localStorage cua tung may, service la ranh gioi se thay bang API that nen
   * khong duoc biet gi ve no. Doi lai, phep sap chi chay TRONG trang dang xem -
   * tim mot du an o trang 2 thi no len dau trang 2, khong nhay ve trang 1.
   */
  const projects = useMemo(() => {
    const list = listQuery.data?.projects ?? [];
    if (favorites.length === 0) return list;

    // favorites la mang { publicId, savedAt } nen phai rut publicId ra truoc
    const favorite = new Set(favorites.map((entry) => entry.publicId));
    // sort cua JS on dinh nen cac du an cung nhom giu nguyen thu tu goc
    return [...list].sort(
      (a, b) => Number(favorite.has(b.publicId)) - Number(favorite.has(a.publicId)),
    );
  }, [listQuery.data, favorites]);

  const total = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasActiveFilter = activeCount > 0;

  // Chi hien khung xuong o lan tai dau; doi trang/loc thi giu ket qua cu
  // va lam mo di, tranh giat layout.
  const isFirstLoad = listQuery.isLoading;
  const isRefreshing = listQuery.isFetching && !isFirstLoad;

  const isMapView = view === 'ban-do';

  /**
   * Che do ban do bo site-container: ban do phai cham duoc mep phai man hinh
   * nhu trang mau, ma site-container thi khoa be ngang o 1280px va co dem hai
   * ben. Phan tieu de/bo loc tu mang dem cua rieng no.
   */
  const shellClass = isMapView ? 'w-full pt-6' : 'site-container py-8';
  const headClass = isMapView ? 'px-4 sm:px-6 lg:px-8' : '';

  return (
    <div className={shellClass}>
      <div className={headClass}>
        {/* Che do ban do tren dien thoai: giau tieu de de nhuong cho cho ban do */}
        <h1
          className={`mb-6 text-center text-3xl font-bold uppercase tracking-wide text-gray-900 ${
            isMapView ? 'hidden lg:block' : ''
          }`}
        >
          {t('title')}
        </h1>

        <div className="mb-4">
        <ProjectFilterBar
          values={filterValues}
          options={options}
          isLoadingOptions={optionsQuery.isLoading}
          activeCount={activeCount}
          resultCount={total}
          view={view}
          onViewChange={setView}
          onClearAll={clearAllFilters}
          onSubmitSearch={submitSearch}
          onChange={handleFilterChange}
          sort={sort}
          onSortChange={(nextSort) =>
            applyParams({ [PARAM.sort]: nextSort === 'mac-dinh' ? null : nextSort })
          }
        />
      </div>

        <div
          className={`mb-4 flex min-h-5 items-center justify-between text-theme-sm text-gray-500 ${
            isMapView ? 'hidden lg:flex' : ''
          }`}
        >
          {isFirstLoad ? (
            <span className="h-4 w-32 animate-pulse rounded bg-gray-100" />
          ) : (
            <span aria-live="polite">
              {hasActiveFilter ? 'Tìm thấy ' : 'Có '}
              <strong className="text-gray-800">{total}</strong> dự án
            </span>
          )}
          {isRefreshing && <span className="text-gray-400">Đang cập nhật...</span>}
        </div>
      </div>

      {isMapView ? (
        <ProjectMapView projects={projects} isLoading={isFirstLoad} />
      ) : listQuery.isError ? (
        <div className="rounded-xl border border-error-500/30 bg-error-50 p-8 text-center">
          <p className="mb-4 text-theme-sm text-error-600">
            Không tải được danh sách dự án.
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
          {Array.from({ length: 9 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="mb-4 text-theme-sm text-gray-500">
            {hasActiveFilter
              ? 'Không tìm thấy dự án phù hợp với bộ lọc.'
              : 'Chưa có dự án nào.'}
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
          {projects.map((project) => (
            <ProjectCard key={project.publicId} project={project} />
          ))}
        </div>
      )}

      {view === 'danh-sach' && total > 0 && (
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
      )}

      {/* Ban do da choan het chieu cao man hinh nen hai khoi nay khong con cho */}
      {/* {!isMapView && (
        <>
          <ProjectHighlightPanel
            groups={highlightsQuery.data ?? []}
            isLoading={highlightsQuery.isLoading}
          />

          <NewsSection />
        </>
      )} */}
    </div>
  );
};

export default ProjectListPage;
