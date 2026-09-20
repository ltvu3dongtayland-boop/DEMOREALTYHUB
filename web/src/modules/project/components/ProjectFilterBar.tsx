'use client';

import { type FormEvent } from 'react';
import {
  FiBriefcase,
  FiLayers,
  FiMapPin,
  FiSearch,
  FiTag,
  FiX,
} from 'react-icons/fi';
import FilterSelect from '@/common/components/FilterSelect';
import RangeSliderField from '@/common/components/RangeSliderField';
import {
  PRICE_LIMIT,
  PRICE_SCALE,
  PRICE_STEP,
  STATUS_LABELS,
  formatPriceShort,
  type FilterOption,
  type ProjectFilterOptions,
} from '../models/project.model';

/**
 * Trang thai bo loc duoi dang phang, doc thang tu URL.
 *
 * Deu la kieu nguyen thuy chu khong phai union hep cua model: URL co the chua
 * bat cu chuoi nao, viec ep ve dung kieu do ProjectListPage lam khi dung
 * ProjectQuery. Component chi hien thi va bao "nguoi dung vua chon gi".
 */
export type ProjectFilterValues = {
  search: string;
  developerId: string | null;
  regionId: string | null;
  propertyType: string | null;
  status: string | null;
  segment: string | null;
  priceMin: number | null;
  priceMax: number | null;
  areaMax: number | null;
  bedrooms: number | null;
  handoverBefore: number | null;
  amenityTags: string[];
  viewpoints: string[];
  legal: string | null;
  hasDiscount: boolean;
  hasBankSupport: boolean;
  postedWithinDays: number | null;
};

/** Danh sach the / ban do - hai cach nhin cung mot ket qua loc */
export type ProjectViewMode = 'danh-sach' | 'ban-do';

/** Cac o loc duoc dua len hang chip cho bam nhanh - phan con lai nam trong bang loc */
type ChipSelectKey = 'regionId' | 'developerId' | 'segment';

const SORT_OPTIONS = [
  { value: 'mac-dinh', label: 'Mặc định' },
  { value: 'gia-tang', label: 'Giá thấp → cao' },
  { value: 'gia-giam', label: 'Giá cao → thấp' },
  { value: 'dien-tich-tang', label: 'Diện tích nhỏ → lớn' },
  { value: 'dien-tich-giam', label: 'Diện tích lớn → nhỏ' },
  { value: 'moi-nhat', label: 'Mới nhất' },
];

type ProjectFilterBarProps = {
  values: ProjectFilterValues;
  options: ProjectFilterOptions;
  isLoadingOptions: boolean;
  /** So o loc dang bat - hien tren nut Xoa tat ca */
  activeCount: number;
  /** So du an khop bo loc hien tai */
  resultCount: number;
  view: ProjectViewMode;
  onViewChange: (view: ProjectViewMode) => void;
  onClearAll: () => void;
  /** Ap tu khoa ngay lap tuc, bo qua do tre go phim */
  onSubmitSearch: () => void;
  /**
   * Nhan mot lan NHIEU o loc cung luc.
   *
   * Khong tach thanh onChange(key, value) goi lien tiep: moi lan goi deu dung
   * URL hien tai lam goc, nen hai lan goi trong cung mot su kien se de lan sau
   * ghi de lan truoc (thanh truot dat ca can duoi lan can tren mot luc).
   */
  onChange: (updates: Partial<ProjectFilterValues>) => void;
  /** Sort value va onChange cho sap xep */
  sort: string;
  onSortChange: (sort: string) => void;
};

/** Goi onChange cho dung mot o loc - phan lon truong hop la the nay */
export const setOne = <K extends keyof ProjectFilterValues>(
  onChange: (updates: Partial<ProjectFilterValues>) => void,
  key: K,
  value: ProjectFilterValues[K],
) => onChange({ [key]: value } as Partial<ProjectFilterValues>);

const ProjectFilterBar = ({
  values,
  options,
  isLoadingOptions,
  activeCount,
  resultCount,
  view,
  onViewChange,
  onClearAll,
  onSubmitSearch,
  onChange,
  sort,
  onSortChange,
}: ProjectFilterBarProps) => {
  const chipSelects: {
    key: ChipSelectKey;
    label: string;
    icon: React.ReactNode;
    options: FilterOption[];
  }[] = [
    {
      key: 'segment',
      label: 'Loại dự án',
      icon: <FiLayers />,
      options: options.segments,
    },
    { key: 'regionId', label: 'Khu vực', icon: <FiMapPin />, options: options.regions },
    {
      key: 'developerId',
      label: 'Chủ đầu tư',
      icon: <FiBriefcase />,
      options: options.developers,
    },
  ];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmitSearch();
  };

  const hasActiveFilter = activeCount > 0;

  return (
    <div>
      {/* ── Hang 1: tim kiem + sap xep ─────────────────────────────────── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <form
          onSubmit={submit}
          role="search"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-gray-200 bg-white py-2 pl-5 pr-2 shadow-card transition focus-within:border-brand-300 focus-within:shadow-panel lg:max-w-2xl"
        >
          <input
            type="search"
            value={values.search}
            onChange={(event) => setOne(onChange, 'search', event.target.value)}
            placeholder="Tìm theo tên dự án, khu vực, chủ đầu tư..."
            aria-label="Tìm kiếm dự án"
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
            onChange={(next) => onSortChange(next ?? 'mac-dinh')}
          />
        </div>
      </div>

      {/* ── Hang 2: chip loc ────────────────────────────────────────────── */}
      <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {chipSelects.map((config) => (
          <FilterSelect
            key={config.key}
            variant="chip"
            label={config.label}
            icon={config.icon}
            value={values[config.key]}
            options={config.options}
            isLoading={isLoadingOptions}
            onChange={(next) => setOne(onChange, config.key, next)}
          />
        ))}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="shrink-0 whitespace-nowrap px-2 text-theme-sm font-medium text-gray-500 underline underline-offset-2 transition hover:text-error-600"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* ── Hang 4: dien tich + phong ngu ─────────────────────────────── */}
      {/* <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-25 px-4 py-3">
        <span className="text-theme-xs font-semibold uppercase tracking-wide text-gray-500">
          Diện tích ≤
        </span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="m²"
          value={values.areaMax ?? ''}
          onChange={(event) => {
            const value = Number(event.target.value);
            setOne(onChange, 'areaMax', Number.isFinite(value) && value > 0 ? value : null);
          }}
          onBlur={(event) => {
            const value = Number(event.target.value);
            setOne(onChange, 'areaMax', Number.isFinite(value) && value > 0 ? value : null);
          }}
          className="h-9 w-24 rounded-md border border-gray-200 bg-white px-2 text-theme-sm text-gray-800 outline-none focus:border-brand-400"
        />

        <span className="ml-2 text-theme-xs font-semibold uppercase tracking-wide text-gray-500">
          Số phòng ngủ ≥
        </span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="Phòng"
          value={values.bedrooms ?? ''}
          onChange={(event) => {
            const value = Number(event.target.value);
            setOne(onChange, 'bedrooms', Number.isInteger(value) && value > 0 ? value : null);
          }}
          onBlur={(event) => {
            const value = Number(event.target.value);
            setOne(onChange, 'bedrooms', Number.isInteger(value) && value > 0 ? value : null);
          }}
          className="h-9 w-24 rounded-md border border-gray-200 bg-white px-2 text-theme-sm text-gray-800 outline-none focus:border-brand-400"
        />

        {hasActiveFilter && (
          <button
            type="button"
            onClick={onClearAll}
            className="ml-auto flex items-center gap-1 text-theme-sm font-medium text-gray-500 underline underline-offset-2 transition hover:text-error-600"
          >
            <FiX aria-hidden className="text-base" />
            Xóa hết
          </button>
        )}
      </div> */}
    </div>
  );
};

export default ProjectFilterBar;
