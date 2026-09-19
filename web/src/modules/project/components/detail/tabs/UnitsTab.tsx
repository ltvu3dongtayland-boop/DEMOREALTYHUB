'use client';

import { useCallback, useMemo, useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import Pagination from '@/common/components/Pagination';
import {
  formatBillion,
  formatMillionPerSqm,
  formatNumber,
} from '@/common/utils/format';
import { useProjectDetail, useProjectUnits } from '../../../hooks/useProjects';
import {
  DEFAULT_UNIT_QUERY,
  DIRECTION_FILTER_OPTIONS,
  MAX_UNIT_SELECTION,
  UNIT_SORT_LABELS,
  UNIT_STATUS_LABELS,
  type UnitQuery,
  type UnitSort,
  type UnitStatus,
  type UnitWithProject,
} from '../../../models/project-detail.model';

const PAGE_SIZE_OPTIONS = [24, 48, 96];

const COLUMNS = [
  'Mã căn',
  'Giá niêm yết',
  'Giá TTS',
  'Đơn giá',
  'Loại hình',
  'Hướng',
  'DT đất',
  'DT xây dựng',
  'Phân khu',
  'Tình trạng',
];

const STATUS_TONES: Record<UnitStatus, string> = {
  'con-hang': 'bg-success-500',
  'giu-cho': 'bg-gold-400',
  'da-ban': 'bg-gray-400',
};

/** O chon trong thanh bo loc - rong thi coi nhu bo loc */
const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: { value: string; label: string }[];
  onChange: (value: string | null) => void;
}) => (
  <label className="block">
    <span className="mb-1 block text-theme-xs font-medium text-gray-500">{label}</span>
    <select
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value || null)}
      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-theme-sm text-gray-700 outline-none transition focus:border-brand-400 focus:shadow-focus-ring"
    >
      <option value="">Tất cả</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

type UnitsTabProps = {
  slug: string;
  /** Mo tu trang phan khu: khoa bang hang vao dung phan khu do */
  lockedPhaseName?: string;
};

const UnitsTab = ({ slug, lockedPhaseName }: UnitsTabProps) => {
  const [query, setQuery] = useState<UnitQuery>(() => ({
    ...DEFAULT_UNIT_QUERY,
    phaseName: lockedPhaseName ?? null,
  }));
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithProject | null>(null);

  const unitsQuery = useProjectUnits(slug, query);
  const projectQuery = useProjectDetail(slug);

  const units = unitsQuery.data?.units ?? [];
  const total = unitsQuery.data?.total ?? 0;
  const facets = unitsQuery.data?.facets;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const project = projectQuery.data;

  /** Doi bo loc thi phai ve trang 1, neu khong nguoi dung ket o trang trong */
  const patchQuery = useCallback(
    (patch: Partial<UnitQuery>, keepPage = false) =>
      setQuery((current) => ({ ...current, ...patch, ...(keepPage ? {} : { page: 1 }) })),
    [],
  );

  const toggleSelected = useCallback((publicId: string) => {
    setSelected((current) =>
      current.includes(publicId)
        ? current.filter((id) => id !== publicId)
        : current.length >= MAX_UNIT_SELECTION
          ? current
          : [...current, publicId],
    );
  }, []);

  // Phan khu bi khoa thi khong tinh la "bo loc dang bat" - nguoi dung khong bat no
  const activeFilterCount = useMemo(
    () =>
      [
        lockedPhaseName ? null : query.phaseName,
        query.propertyTypeLabel,
        query.direction,
        query.status,
      ].filter(Boolean).length,
    [query, lockedPhaseName],
  );

  const isAtSelectionLimit = selected.length >= MAX_UNIT_SELECTION;

  // Helper: build UnitWithProject từ ProjectUnit + project info
  const buildUnitWithProject = useCallback(
    (unit: typeof units[0]): UnitWithProject | null => {
      if (!project) return null;
      return {
        ...unit,
        projectSlug: slug,
        projectName: project.name,
        developerName: project.developerName,
        segment: project.segment,
        propertyType: project.propertyType,
        projectIsHot: project.isHot,
        // ProjectCard/UnitCard muon dung carousel nen can mang anh cua du an
        thumbnailUrls: project.thumbnailUrls,
      };
    },
    [project, slug],
  );

  const handleUnitClick = useCallback(
    (unit: typeof units[0]) => {
      const unitWithProject = buildUnitWithProject(unit);
      if (unitWithProject) {
        setSelectedUnit(unitWithProject);
      }
    },
    [buildUnitWithProject],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900">Bảng hàng</h2>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-theme-sm text-gray-500">
            Sắp xếp:
            <select
              value={query.sort}
              onChange={(event) => patchQuery({ sort: event.target.value as UnitSort })}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-theme-sm text-gray-700 outline-none transition focus:border-brand-400 focus:shadow-focus-ring"
            >
              {Object.entries(UNIT_SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setIsFilterOpen((open) => !open)}
            aria-expanded={isFilterOpen}
            className={`flex h-10 items-center gap-2 rounded-md border px-4 text-theme-sm font-medium transition ${
              isFilterOpen || activeFilterCount > 0
                ? 'border-brand-400 bg-brand-50 text-brand-600'
                : 'border-gray-300 bg-white text-gray-700 hover:border-brand-400'
            }`}
          >
            <FiFilter aria-hidden />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {isFilterOpen && facets && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-25 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {!lockedPhaseName && (
              <FilterSelect
                label="Phân khu"
                value={query.phaseName}
                options={facets.phaseNames.map((name) => ({ value: name, label: name }))}
                onChange={(value) => patchQuery({ phaseName: value })}
              />
            )}
            <FilterSelect
              label="Loại hình"
              value={query.propertyTypeLabel}
              options={facets.propertyTypeLabels.map((name) => ({ value: name, label: name }))}
              onChange={(value) => patchQuery({ propertyTypeLabel: value })}
            />
            <FilterSelect
              label="Hướng"
              value={query.direction}
              options={DIRECTION_FILTER_OPTIONS}
              onChange={(value) => patchQuery({ direction: value })}
            />
            <FilterSelect
              label="Tình trạng"
              value={query.status}
              options={Object.entries(UNIT_STATUS_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              onChange={(value) => patchQuery({ status: value as UnitStatus | null })}
            />
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() =>
                patchQuery({
                  phaseName: lockedPhaseName ?? null,
                  propertyTypeLabel: null,
                  direction: null,
                  status: null,
                })
              }
              className="mt-4 inline-flex items-center gap-1.5 text-theme-sm font-medium text-gray-600 transition hover:text-brand-600"
            >
              <FiX aria-hidden />
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-270 border-collapse text-left">
            <caption className="sr-only">
              Bảng hàng chi tiết từng căn, có thể chọn tối đa {MAX_UNIT_SELECTION} căn để so
              sánh
            </caption>
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th scope="col" className="w-10 px-3 py-3">
                  <span className="sr-only">Chọn căn</span>
                </th>
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="whitespace-nowrap px-3 py-3 text-theme-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {unitsQuery.isLoading &&
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td colSpan={COLUMNS.length + 1} className="px-3 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))}

              {!unitsQuery.isLoading &&
                units.map((unit) => {
                  const isSelected = selected.includes(unit.publicId);

                  return (
                    <tr
                      key={unit.publicId}
                      className={`border-b border-gray-100 transition last:border-0 ${
                        isSelected ? 'bg-brand-25' : 'hover:bg-gray-25'
                      }`}
                    >
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={!isSelected && isAtSelectionLimit}
                          onChange={() => toggleSelected(unit.publicId)}
                          aria-label={`Chọn căn ${unit.code} để so sánh`}
                          className="h-4 w-4 rounded-full border-gray-300 accent-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => handleUnitClick(unit)}
                          className="rounded bg-error-50 px-2 py-1 text-theme-xs font-bold text-error-600 transition hover:bg-error-100 hover:text-error-700 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-1"
                        >
                          {unit.code}
                        </button>
                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5 text-theme-sm font-bold text-gray-900">
                        {formatBillion(unit.listedPrice)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-theme-sm text-gray-600">
                        {formatBillion(unit.netPrice)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-theme-sm text-gray-600">
                        {formatMillionPerSqm(unit.unitPrice)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-theme-sm text-gray-600">
                        {unit.propertyTypeLabel}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-theme-sm text-gray-600">
                        {unit.direction}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-theme-sm text-gray-600">
                        {unit.landArea} <span className="text-theme-xs text-gray-400">m²</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-theme-sm text-gray-600">
                        {unit.buildArea} <span className="text-theme-xs text-gray-400">m²</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-theme-sm uppercase text-gray-600">
                        {unit.phaseName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <span className="flex items-center gap-1.5 text-theme-sm text-gray-600">
                          <span
                            aria-hidden
                            className={`h-2 w-2 rounded-full ${STATUS_TONES[unit.status]}`}
                          />
                          {UNIT_STATUS_LABELS[unit.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}

              {!unitsQuery.isLoading && units.length === 0 && (
                <tr>
                  <td
                    colSpan={COLUMNS.length + 1}
                    className="px-3 py-12 text-center text-theme-sm text-gray-500"
                  >
                    Không có căn nào khớp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4">
          <div className="flex items-center gap-3 py-3 text-theme-sm text-gray-500">
            <span aria-live="polite">
              Đã chọn: <strong className="text-gray-800">{selected.length}</strong>/
              {MAX_UNIT_SELECTION}
            </span>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => setSelected([])}
                className="font-medium text-brand-600 transition hover:text-brand-700"
              >
                Bỏ chọn
              </button>
            )}
          </div>

          <Pagination
            currentPage={query.page}
            totalPages={totalPages}
            total={total}
            limit={query.limit}
            label="Phân trang bảng hàng"
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={(page) => patchQuery({ page }, true)}
            onLimitChange={(limit) => patchQuery({ limit })}
          />
        </div>
      </div>

      <p className="mt-3 text-theme-xs text-gray-400">
        Tổng {formatNumber(total)} căn khớp điều kiện hiện tại.
      </p>
    </div>
  );
};

export default UnitsTab;
