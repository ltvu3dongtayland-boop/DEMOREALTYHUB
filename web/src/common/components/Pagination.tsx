'use client';

import { useMemo } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';

const DEFAULT_PAGE_SIZE_OPTIONS = [12, 24, 48];

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  /** Nhan cho trinh doc man hinh - moi bang tren trang can mot nhan rieng */
  label?: string;
  pageSizeOptions?: number[];
};

/** Sinh day trang co dau "..." khi qua nhieu trang */
const buildPages = (currentPage: number, totalPages: number): (number | 'gap')[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: (number | 'gap')[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push('gap');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push('gap');

  pages.push(totalPages);
  return pages;
};

const navButtonClass =
  'flex h-9 w-9 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 transition hover:border-brand-400 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-gray-600';

const Pagination = ({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  label = 'Phân trang danh sách dự án',
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: PaginationProps) => {
  const pages = useMemo(
    () => buildPages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  return (
    <nav
      aria-label={label}
      className="flex flex-col items-center gap-2.5 py-6 md:flex-row md:flex-wrap md:justify-center md:gap-2"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          aria-label="Về trang đầu"
          className={navButtonClass}
        >
          <FiChevronsLeft aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Trang trước"
          className={navButtonClass}
        >
          <FiChevronLeft aria-hidden />
        </button>

        {pages.map((page, index) =>
          page === 'gap' ? (
            <span key={`gap-${index}`} className="px-1 text-theme-sm text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded border px-2 text-theme-sm font-medium transition ${
                page === currentPage
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-brand-400 hover:text-brand-600'
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Trang sau"
          className={navButtonClass}
        >
          <FiChevronRight aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Tới trang cuối"
          className={navButtonClass}
        >
          <FiChevronsRight aria-hidden />
        </button>
      </div>

      <label className="flex items-center gap-2 text-theme-sm text-gray-500 md:ml-2">
        <span className="sr-only">Số dòng mỗi trang</span>
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="h-9 rounded border border-gray-300 bg-white px-2 text-theme-sm text-gray-700 outline-none transition focus:border-brand-400 focus:shadow-focus-ring"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span>/ tổng {total}</span>
      </label>
    </nav>
  );
};

export default Pagination;
