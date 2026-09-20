'use client';

import { type FormEvent } from 'react';
import { FiSearch, FiTag } from 'react-icons/fi';
import FilterSelect from '@/common/components/FilterSelect';
import {
  INVESTOR_SORT_LABELS,
  type InvestorFilterValues,
  type InvestorSort,
} from '../models/investor.model';

const SORT_OPTIONS = Object.entries(INVESTOR_SORT_LABELS).map(
  ([value, label]) => ({ value, label } as { value: InvestorSort; label: string }),
);

type InvestorFilterBarProps = {
  values: InvestorFilterValues;
  /** Ap tu khoa ngay lap tuc, bo qua do tre go phim */
  onSubmitSearch: () => void;
  /**
   * Nhan mot lan nhieu cap nhat cung luc.
   *
   * Khong tach thanh onChange(key, value) goi lien tiep: moi lan goi deu dung
   * URL hien tai lam goc, nen hai lan goi trong cung mot su kien se de lan
   * sau ghi de lan truoc.
   */
  onChange: (updates: Partial<InvestorFilterValues>) => void;
  /** Sort value va onChange cho sap xep */
  sort: InvestorSort;
  onSortChange: (sort: InvestorSort) => void;
};

/** Goi onChange cho dung mot o loc - phan lon truong hop la the nay */
export const setOne = <K extends keyof InvestorFilterValues>(
  onChange: (updates: Partial<InvestorFilterValues>) => void,
  key: K,
  value: InvestorFilterValues[K],
) => onChange({ [key]: value } as Partial<InvestorFilterValues>);

const InvestorFilterBar = ({
  values,
  onSubmitSearch,
  onChange,
  sort,
  onSortChange,
}: InvestorFilterBarProps) => {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmitSearch();
  };

  return (
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
          placeholder="Tìm theo tên chủ đầu tư..."
          aria-label="Tìm kiếm chủ đầu tư"
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
          onChange={(next) =>
            onSortChange((next as InvestorSort) ?? 'mac-dinh')
          }
        />
      </div>
    </div>
  );
};

export default InvestorFilterBar;
