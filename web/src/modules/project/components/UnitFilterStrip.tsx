'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { FiChevronDown, FiFilter, FiX } from 'react-icons/fi';
import DeveloperLogo from '@/modules/developer/components/DeveloperLogo';
import { useInvestorList } from '@/modules/developer/hooks/useInvestors';
import { InvestorService } from '@/modules/developer/services/investor.service';
import {
  DEFAULT_INVESTOR_QUERY,
  type InvestorQuery,
  type InvestorSummary,
} from '@/modules/developer/models/investor.model';
import RangeSliderField from '@/common/components/RangeSliderField';
import {
  DIRECTION_FILTER_OPTIONS,
  FLOOR_RANGE_OPTIONS,
  UNIT_STATUS_LABELS,
  type PaginatedAllUnits,
} from '../models/project-detail.model';
import { AREA_LIMIT, AREA_STEP, PRICE_SCALE } from '../models/project.model';

/**
 * Hang logo chu dau tu + bang "Tat ca bo loc" cua trang /quy-can.
 *
 * Hang ngang chi de bam nhanh vai chu dau tu lon; nut "Loc" so ra mot bang
 * chua TAT CA o loc (truoc day la mot hang chip rieng ben duoi). Gop lai mot
 * cho vi cac o loc cua quy can lien quan nhau - chon du an xong thuong chon
 * tiep phan khu, roi tang, roi truc - bat nguoi dung bam mo 9 menu rieng le
 * la bat ho lam viec cua may.
 *
 * Bo loc van song tren URL: component nay chi bao "vua chon gi", trang cha
 * ghi len URL va truy van lai.
 */

/** Toan bo o loc bang nay dieu khien - deu la chuoi vi doc thang tu URL */
export type UnitFilterValues = {
  developerId: string | null;
  segment: string | null;
  projectSlug: string | null;
  phaseName: string | null;
  propertyTypeLabel: string | null;
  floorRange: string | null;
  direction: string | null;
  code: string | null;
  unitLine: string | null;
  status: string | null;
  /** Khoang gia tinh bang VND (khong phai ty) - o nhap doi don vi khi hien */
  priceMin: number | null;
  priceMax: number | null;
  /** Dien tich dat toi da, m2 */
  areaMax: number | null;
};

/**
 * Lay het 25 chu dau tu, nhieu du an xep truoc ('du-an-giam' da tie-break theo
 * ten nen thu tu on dinh). Hang so o ngoai component de queryKey khong doi moi
 * lan render.
 */
const INVESTOR_QUERY: InvestorQuery = {
  ...DEFAULT_INVESTOR_QUERY,
  limit: 25,
  sort: 'du-an-giam',
};

/**
 * Hang logo KHONG cuon ngang, nen so o hien duoc phu thuoc be ngang man hinh:
 * moi vi tri mot lop hien/an. Tu vi tri thu 8 tro di chi con trong bang loc.
 */
const SLOT_VISIBILITY = [
  'flex',
  'flex',
  'flex',
  // Dien thoai 4 logo, iPad (tu 768px) 6, tu 1024px tro len 7
  'flex',
  'hidden md:flex',
  'hidden md:flex',
  'hidden lg:flex',
];

type UnitFilterStripProps = {
  values: UnitFilterValues;
  /** Lua chon co that, tinh tu tap can dang khop - thieu thi bang loc rong */
  facets?: PaginatedAllUnits['facets'];
  isLoading: boolean;
  /** So can khop bo loc - hien tren nut dong bang */
  resultCount: number;
  /** So o loc dang bat - hien canh chu "Loc" */
  activeCount: number;
  onChange: (updates: Partial<UnitFilterValues>) => void;
  onClearAll: () => void;
};

const UnitFilterStrip = ({
  values,
  facets,
  isLoading,
  resultCount,
  activeCount,
  onChange,
  onClearAll,
}: UnitFilterStripProps) => {
  const { data, isLoading: isLoadingInvestors } = useInvestorList(INVESTOR_QUERY);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /**
   * Gan them developerId cho tung Investor. Chu dau tu chua co du an nao trong
   * he thong thi khong co developerId - van hien logo (day la 25 CDT chinh
   * thuc) nhung khong bam loc duoc, vi loc ra se rong.
   */
  const investors = useMemo(
    () =>
      (data?.investors ?? []).map((investor) => ({
        investor,
        developerId: InvestorService.developerIdBySlug(investor.slug),
      })),
    [data],
  );

  /**
   * Thu tu hang logo KHONG BAO GIO doi khi bam chon: logo vua bam phai nam yen
   * duoi con tro. Chi dai them mot o khi chon tu trong bang loc mot chu dau tu
   * khong nam san tren hang.
   */
  const stripInvestors = useMemo(() => {
    const head = investors.slice(0, SLOT_VISIBILITY.length);
    const { developerId } = values;
    if (!developerId || head.some((entry) => entry.developerId === developerId)) {
      return head;
    }

    const selected = investors.find((entry) => entry.developerId === developerId);
    return selected ? [...head, selected] : head;
  }, [investors, values]);

  /**
   * Mo bang thi keo trang cho hang loc len sat dau man hinh.
   *
   * Bang so xuong duoi hang logo, ma nguoi dung thuong bam nut Loc khi da cuon
   * lung chung - khong keo thi nua bang nam duoi mep man hinh, phai cuon tay
   * moi thao tac duoc. 88px chua cho thanh dieu huong dinh o tren.
   */
  useEffect(() => {
    if (!isPanelOpen) return;

    const top = wrapperRef.current?.getBoundingClientRect().top ?? 0;
    window.scrollBy({ top: top - 88, behavior: 'smooth' });
  }, [isPanelOpen]);

  // Bam ra ngoai / bam Escape thi dong bang - bang dang che mat ket qua
  useEffect(() => {
    if (!isPanelOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsPanelOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPanelOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isPanelOpen]);

  const toggleDeveloper = (developerId: string) =>
    onChange({
      developerId: values.developerId === developerId ? null : developerId,
    });

  if (isLoadingInvestors) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="h-11 w-20 shrink-0 animate-pulse rounded-xl bg-gray-100 sm:w-24" />
        {SLOT_VISIBILITY.map((visibility, index) => (
          <div
            key={index}
            className={`h-11 flex-1 animate-pulse rounded-xl bg-gray-100 ${visibility}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* ── Nut mo bang tat ca bo loc ──────────────────────────────── */}
        <button
          type="button"
          onClick={() => setIsPanelOpen((open) => !open)}
          aria-expanded={isPanelOpen}
          aria-haspopup="dialog"
          className={`relative z-30 flex h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-theme-sm font-semibold transition sm:gap-2 sm:px-4 ${
            isPanelOpen
              ? 'border-brand-500 bg-brand-50 text-brand-700'
              : 'border-gray-200 bg-white text-gray-700 shadow-card hover:border-brand-300 hover:text-brand-600'
          }`}
        >
          <FiFilter aria-hidden className="text-base text-brand-500" />
          Lọc
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>

        {/* ── Hang logo chu dau tu ───────────────────────────────────── */}
        {stripInvestors.map(({ investor, developerId }, index) => {
          const isSelected = developerId !== null && developerId === values.developerId;

          return (
            <button
              key={investor.slug}
              type="button"
              disabled={developerId === null}
              onClick={() => developerId && toggleDeveloper(developerId)}
              aria-pressed={isSelected}
              aria-label={`Lọc theo chủ đầu tư ${investor.name}`}
              title={
                developerId === null
                  ? `${investor.name} · chưa có dự án trên hệ thống`
                  : `${investor.name} · ${investor.projectCount} dự án`
              }
              className={`${SLOT_VISIBILITY[index] ?? 'flex'} h-11 min-w-0 max-w-[168px] flex-1 items-center justify-center overflow-hidden rounded-xl border px-1.5 transition sm:px-4 ${
                isSelected
                  ? 'border-brand-500 bg-white shadow-card ring-1 ring-brand-500/25'
                  : 'border-transparent bg-gray-100 hover:bg-gray-200/80'
              } ${developerId === null ? 'cursor-not-allowed opacity-45 hover:bg-gray-100' : ''}`}
            >
              <DeveloperLogo name={investor.name} logo={investor.logo} />
            </button>
          );
        })}
      </div>

      {/* Lop mo che phan con lai cua trang: mat tu nhin vao bang loc, va bam
          vao day la dong bang (su kien pointerdown roi ngoai wrapper) */}
      {isPanelOpen && (
        <div
          aria-hidden
          // Lop mo nam TRONG wrapper nen phep kiem tra "bam ra ngoai" khong
          // bat duoc no - phai tu dong bang o day.
          onMouseDown={() => setIsPanelOpen(false)}
          onTouchStart={() => setIsPanelOpen(false)}
          className="fixed inset-0 z-20 bg-gray-900/35 backdrop-blur-[1px]"
        />
      )}

      {isPanelOpen && (
        <FilterPanel
          investors={investors}
          values={values}
          facets={facets}
          isLoading={isLoading}
          resultCount={resultCount}
          activeCount={activeCount}
          onChange={onChange}
          onClearAll={onClearAll}
          onClose={() => setIsPanelOpen(false)}
        />
      )}
    </div>
  );
};

// ── Bang loc ───────────────────────────────────────────────────────────────

/** Mot nhom o loc trong bang: tieu de + cac lua chon */
const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="border-t border-gray-100 px-3 py-3 first:border-t-0 sm:px-5 sm:py-4">
    <h3 className="mb-2 text-theme-sm font-bold text-gray-900 sm:mb-3 sm:text-base">{title}</h3>
    {children}
  </section>
);

/**
 * Tu bao nhieu muc tro len moi thu gon con hai hang.
 *
 * Duoi nguong nay - Loai hinh, Khoang tang, Phan khu, Truc can - danh sach chi
 * dai hon hai hang mot chut, cat di khong tiet kiem duoc bao nhieu ma lai bat
 * nguoi dung bam them mot lan. Chi Du an (~37) va Chu dau tu (25) can nut.
 */
const COLLAPSE_MIN_OPTIONS = 20;

/** Hai hang the chu: the cao 42px, khoang cach 10px */
const TWO_ROWS_CHIPS_PX = 94;

/**
 * Cat noi dung con hai hang dau, phan con lai nam sau nut "Xem them".
 *
 * Do chieu cao that bang scrollHeight chu khong dem so muc: be ngang moi the
 * phu thuoc do dai chu ben trong, nen dem muc khong the biet duoc khi nao tran
 * sang hang thu ba. Nhom nao vua trong hai hang thi khong hien nut.
 */
const CollapsibleRows = ({
  collapsedHeight,
  /** Mo san khi nhom nay dang co o loc duoc bat - xem ben duoi */
  defaultExpanded = false,
  /** Doi gia tri nay thi do lai chieu cao (so muc trong nhom) */
  measureKey,
  children,
}: {
  collapsedHeight: number;
  defaultExpanded?: boolean;
  measureKey: number;
  children: ReactNode;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = listRef.current;
    if (!element) return;

    const measure = () =>
      setIsOverflowing(element.scrollHeight > collapsedHeight + 1);

    measure();

    // Doi be ngang bang (xoay may, keo cua so) thi so hang doi theo
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
    // Theo so muc chu khong theo mang: cha tao mang moi moi lan render, phu
    // thuoc vao no la dung/huy ResizeObserver mot cach vo ich.
  }, [collapsedHeight, measureKey]);

  return (
    <>
      <div
        ref={listRef}
        className="overflow-hidden"
        style={isExpanded ? undefined : { maxHeight: collapsedHeight }}
      >
        {children}
      </div>

      {isOverflowing && (
        <button
          type="button"
          onClick={() => setIsExpanded((open) => !open)}
          aria-expanded={isExpanded}
          className="mt-2 flex items-center gap-1 text-theme-sm font-semibold text-brand-600 transition hover:text-brand-700"
        >
          {isExpanded ? 'Thu gọn' : 'Xem thêm'}
          <FiChevronDown
            aria-hidden
            className={`text-base transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </>
  );
};

/**
 * Mot nhom lua chon chon-mot.
 *
 * Bam lai dung muc dang chon thi bo chon - nhanh hon bat nguoi dung di tim nut
 * "Tat ca", va giong het cach hang logo phia tren hoat dong.
 */
const ChoiceRow = ({
  options,
  value,
  onSelect,
  emptyLabel = 'Chưa có lựa chọn nào',
}: {
  options: { value: string; label: string }[];
  value: string | null;
  onSelect: (next: string | null) => void;
  emptyLabel?: string;
}) => {
  if (options.length === 0) {
    return <p className="text-theme-sm text-gray-400">{emptyLabel}</p>;
  }

  const chips = (
    <div className="flex flex-wrap gap-2.5">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(isSelected ? null : option.value)}
              className={`rounded-lg border px-3 py-2 text-theme-sm font-medium transition sm:px-4 sm:py-2.5 ${
                isSelected
                  ? 'border-brand-500 bg-brand-25 text-brand-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-gray-25'
              }`}
            >
              {option.label}
            </button>
          );
        })}
    </div>
  );

  // Nhom ngan thi khong thu gon: nut "Xem them" cho vai muc chi lam nguoi dung
  // phai bam them mot lan, trong khi cat di duoc dung mot hang.
  if (options.length <= COLLAPSE_MIN_OPTIONS) return chips;

  return (
    <CollapsibleRows
      collapsedHeight={TWO_ROWS_CHIPS_PX}
      measureKey={options.length}
      // Dang loc theo muc nao do thi mo san: muc dang chon co the nam o hang
      // duoi, thu lai la nguoi dung khong thay minh dang loc gi.
      defaultExpanded={value !== null}
    >
      {chips}
    </CollapsibleRows>
  );
};

/**
 * Moc cuoi thanh gia cua QUY CAN - 150 ty.
 *
 * Khong dung PRICE_LIMIT (30 ty) cua bo loc du an: do la gia KHOI DIEM cua ca
 * du an, con day la gia tung can, biet thu lon vuot 30 ty la binh thuong.
 */
const UNIT_PRICE_LIMIT = 150_000_000_000;
const UNIT_PRICE_STEP = 500_000_000;

/** VND -> "2.5 tỷ". Khac formatPriceShort o cho 0 ra "0 tỷ" chu khong "0 triệu" */
const formatBillion = (vnd: number) => `${Number((vnd / 1e9).toFixed(1))} tỷ`;

/**
 * Cac o loc dang bat, kem nhan doc duoc - dung cho hang "Da chon" dau bang.
 *
 * Nhan phai tra ve dung thu nguoi dung thay luc bam: gia tri tren URL la
 * 'cdt-vingroup' hay 'cao-tang', bay len hang nay ma de nguyen thi khong ai
 * hieu. Cai nao khong tra cuu duoc nhan thi dung chinh gia tri.
 */
const describeActiveFilters = (
  values: UnitFilterValues,
  facets: PaginatedAllUnits['facets'] | undefined,
  investors: { investor: InvestorSummary; developerId: string | null }[],
): { key: keyof UnitFilterValues; label: string }[] => {
  const labelFrom = (
    options: { value: string; label: string }[] | undefined,
    value: string,
  ) => options?.find((option) => option.value === value)?.label ?? value;

  const entries: { key: keyof UnitFilterValues; label: string }[] = [];

  if (values.developerId) {
    const matched = investors.find(
      (entry) => entry.developerId === values.developerId,
    );
    entries.push({
      key: 'developerId',
      label: matched?.investor.name ?? values.developerId,
    });
  }
  if (values.segment) {
    entries.push({
      key: 'segment',
      label: labelFrom(facets?.segments, values.segment),
    });
  }
  if (values.projectSlug) {
    entries.push({
      key: 'projectSlug',
      label: labelFrom(facets?.projectSlugs, values.projectSlug),
    });
  }
  if (values.phaseName) entries.push({ key: 'phaseName', label: values.phaseName });
  if (values.propertyTypeLabel) {
    entries.push({ key: 'propertyTypeLabel', label: values.propertyTypeLabel });
  }
  if (values.floorRange) {
    entries.push({
      key: 'floorRange',
      label: labelFrom(FLOOR_RANGE_OPTIONS, values.floorRange),
    });
  }
  if (values.direction) {
    entries.push({
      key: 'direction',
      label: labelFrom(DIRECTION_FILTER_OPTIONS, values.direction),
    });
  }
  if (values.code) entries.push({ key: 'code', label: `Mã ${values.code}` });
  if (values.unitLine) {
    entries.push({ key: 'unitLine', label: `Trục ${values.unitLine}` });
  }
  if (values.status) {
    entries.push({
      key: 'status',
      label:
        UNIT_STATUS_LABELS[values.status as keyof typeof UNIT_STATUS_LABELS] ??
        values.status,
    });
  }
  if (values.priceMin !== null) {
    entries.push({ key: 'priceMin', label: `Giá từ ${formatBillion(values.priceMin)}` });
  }
  if (values.priceMax !== null) {
    entries.push({ key: 'priceMax', label: `Giá đến ${formatBillion(values.priceMax)}` });
  }
  if (values.areaMax !== null) {
    entries.push({ key: 'areaMax', label: `DT ≤ ${values.areaMax} m²` });
  }

  return entries;
};

const FilterPanel = ({
  investors,
  values,
  facets,
  isLoading,
  resultCount,
  activeCount,
  onChange,
  onClearAll,
  onClose,
}: {
  investors: { investor: InvestorSummary; developerId: string | null }[];
  values: UnitFilterValues;
  facets?: PaginatedAllUnits['facets'];
  isLoading: boolean;
  resultCount: number;
  activeCount: number;
  onChange: (updates: Partial<UnitFilterValues>) => void;
  onClearAll: () => void;
  onClose: () => void;
}) => {
  /**
   * O "Ma can" go tay nen giu state rieng va cho go xong 300ms moi ghi len URL
   * - neu khong moi phim la mot lan truy van, va con tro se nhay lung tung khi
   * trang cha render lai.
   */
  const [codeInput, setCodeInput] = useState(values.code ?? '');

  const activeFilters = describeActiveFilters(values, facets, investors);

  useEffect(() => {
    const current = values.code ?? '';
    if (codeInput === current) return;
    const timer = setTimeout(() => onChange({ code: codeInput || null }), 300);
    return () => clearTimeout(timer);
  }, [codeInput, values.code, onChange]);

  return (
    <div
      role="dialog"
      aria-label="Tất cả bộ lọc"
      className="fixed inset-0 z-40 flex w-full flex-col overflow-hidden border-gray-200 bg-white shadow-panel sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:z-30 sm:mt-2.5 sm:max-h-[80vh] sm:max-w-[940px] sm:rounded-2xl sm:border"
    >
      {/* Mui ten tro ve nut Loc, cho thay bang nay tu dau bung ra */}
      <span
        aria-hidden
        className="absolute -top-1.5 left-8 hidden h-3 w-3 rotate-45 border-l border-t border-gray-200 bg-white sm:block"
      />

      {/* ── Dau bang ──────────────────────────────────────────────── */}
      {/* Duong ke duoi tieu de: tach phan dau bang khoi vung cuon, de khi cuon
          danh sach dai thi tieu de van ra tieu de */}
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4">
        <span className="hidden flex-1 sm:block" />
        <h2 className="flex-1 whitespace-nowrap text-left text-base font-bold text-gray-900 sm:text-center sm:text-lg">
          Tất cả bộ lọc
        </h2>
        <div className="flex flex-1 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-theme-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
          >
            <FiX aria-hidden className="text-base" />
            Đóng
          </button>
        </div>
      </div>

      {/* ── Than bang ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Da chon: doc mot cai la biet dang loc gi, va go tung cai ra duoc
            ma khong phai di tim lai no nam o nhom nao */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-3 py-3 sm:gap-2.5 sm:px-5 sm:py-4">
            <span className="text-theme-sm font-bold text-gray-900 sm:text-base">Đã chọn:</span>
            {activeFilters.map((entry) => (
              <button
                key={entry.key}
                type="button"
                onClick={() => onChange({ [entry.key]: null })}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3.5 py-2 text-theme-sm font-medium text-gray-700 transition hover:bg-gray-200"
              >
                {entry.label}
                <FiX aria-hidden className="text-base text-gray-500" />
                <span className="sr-only">Bỏ lọc {entry.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={onClearAll}
              className="px-1 text-theme-sm font-semibold text-brand-600 transition hover:text-brand-700"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        <Section title="Chủ đầu tư">
          {/* Hien het 25 logo, khong thu gon: day la o loc duoc dung nhieu
              nhat, giau di sau mot nut bam chi lam cham tay nguoi dung.
              So cot khop so logo tren hang NGOAI (4 / 6 / 7) de o trong bang
              rong bang o ngoai - logo an theo be rong o, lech cot la lech co */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-6 lg:grid-cols-7">
            {investors.map(({ investor, developerId }) => {
              const isSelected =
                developerId !== null && developerId === values.developerId;

              return (
                <button
                  key={investor.slug}
                  type="button"
                  disabled={developerId === null}
                  onClick={() =>
                    developerId &&
                    onChange({ developerId: isSelected ? null : developerId })
                  }
                  aria-pressed={isSelected}
                  aria-label={`Lọc theo chủ đầu tư ${investor.name}`}
                  title={
                    developerId === null
                      ? `${investor.name} · chưa có dự án trên hệ thống`
                      : `${investor.name} · ${investor.projectCount} dự án`
                  }
                  className={`flex h-11 items-center justify-center overflow-hidden rounded-xl border px-2.5 transition sm:px-4 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-25 shadow-card'
                      : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-gray-25'
                  } ${
                    developerId === null
                      ? 'cursor-not-allowed opacity-45 hover:border-gray-200 hover:bg-white'
                      : ''
                  }`}
                >
                  {/* size mac dinh (sm) - logo trong bang phai bang logo tren
                      hang ngoai, neu khong cung mot thuong hieu lai to nho
                      khac nhau o hai cho canh nhau */}
                  <DeveloperLogo name={investor.name} logo={investor.logo} />
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Loại dự án">
          <ChoiceRow
            options={facets?.segments ?? []}
            value={values.segment}
            onSelect={(next) => onChange({ segment: next })}
          />
        </Section>

        <Section title="Dự án">
          <ChoiceRow
            options={facets?.projectSlugs ?? []}
            value={values.projectSlug}
            onSelect={(next) => onChange({ projectSlug: next })}
          />
        </Section>

        <Section title="Phân khu / Tòa">
          <ChoiceRow
            options={(facets?.phaseNames ?? []).map((name) => ({
              value: name,
              label: name,
            }))}
            value={values.phaseName}
            onSelect={(next) => onChange({ phaseName: next })}
          />
        </Section>

        <Section title="Loại hình">
          <ChoiceRow
            options={(facets?.propertyTypeLabels ?? []).map((label) => ({
              value: label,
              label,
            }))}
            value={values.propertyTypeLabel}
            onSelect={(next) => onChange({ propertyTypeLabel: next })}
          />
        </Section>

        <Section title="Khoảng tầng">
          <ChoiceRow
            options={facets?.floorRanges ?? []}
            value={values.floorRange}
            onSelect={(next) => onChange({ floorRange: next })}
            emptyLabel="Các căn đang khớp không ghi tầng"
          />
        </Section>

        <Section title="Hướng">
          <ChoiceRow
            options={DIRECTION_FILTER_OPTIONS}
            value={values.direction}
            onSelect={(next) => onChange({ direction: next })}
          />
        </Section>

        <Section title="Mã căn">
          {/* Ma can nhieu hang nghin gia tri nen khong the bay ra thanh nut -
              o go chu la cach duy nhat dung duoc */}
          <input
            type="search"
            value={codeInput}
            onChange={(event) => setCodeInput(event.target.value)}
            placeholder="Nhập mã căn, ví dụ: BT-1205"
            aria-label="Lọc theo mã căn"
            className="h-11 w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3.5 text-theme-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-400"
          />
        </Section>

        <Section title="Trục căn">
          <ChoiceRow
            options={(facets?.unitLines ?? []).map((line) => ({
              value: line,
              label: `Trục ${line}`,
            }))}
            value={values.unitLine}
            onSelect={(next) => onChange({ unitLine: next })}
          />
        </Section>

        <Section title="Trạng thái">
          <ChoiceRow
            options={(facets?.statuses ?? []).map((status) => ({
              value: status,
              label: UNIT_STATUS_LABELS[status],
            }))}
            value={values.status}
            onSelect={(next) => onChange({ status: next })}
          />
        </Section>

        {/* Dien tich + gia: hai thanh truot canh nhau, moi cai mot tieu de
            rieng - keo de thay khoang hon la go hai o so */}
        <section className="grid grid-cols-1 gap-5 border-t border-gray-100 px-3 py-3 sm:grid-cols-2 sm:gap-6 sm:px-5 sm:py-4">
          <div>
            <h3 className="mb-2 text-theme-sm font-bold text-gray-900 sm:mb-3 sm:text-base">
              Diện tích khoảng
            </h3>
            <RangeSliderField
              label="Diện tích đất"
              variant="compact"
              limit={AREA_LIMIT}
              step={AREA_STEP}
              unit="m²"
              // Du lieu chi co nguong TREN (areaMax), nen dau duoi luon la 0
              min={null}
              max={values.areaMax}
              onChange={(_, max) => onChange({ areaMax: max })}
              format={(value) => `${value} m²`}
            />
          </div>

          <div>
            <h3 className="mb-2 text-theme-sm font-bold text-gray-900 sm:mb-3 sm:text-base">Giá</h3>
            <RangeSliderField
              label="Giá"
              variant="compact"
              limit={UNIT_PRICE_LIMIT}
              step={UNIT_PRICE_STEP}
              scale={PRICE_SCALE}
              unit="tỷ"
              min={values.priceMin}
              max={values.priceMax}
              onChange={(min, max) => onChange({ priceMin: min, priceMax: max })}
              format={formatBillion}
            />
          </div>
        </section>
      </div>

      {/* ── Chan bang ─────────────────────────────────────────────── */}
      {/* Bo loc ap ngay khi bam, nen nut nay chi dong bang lai - nhung van
          phai co: no la cho hien so ket qua va la loi thoat quen thuoc. */}
      <div className="flex shrink-0 items-center justify-center gap-2.5 border-t border-gray-100 bg-white px-3 py-2.5 sm:gap-4 sm:px-5 sm:py-3.5">
        <button
          type="button"
          onClick={onClearAll}
          disabled={activeCount === 0}
          className="h-11 flex-1 rounded-lg border border-error-500/60 text-theme-sm font-semibold text-error-600 transition hover:bg-error-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent sm:max-w-[260px]"
        >
          Bỏ chọn
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-11 flex-1 rounded-lg bg-brand-500 text-theme-sm font-semibold text-white transition hover:bg-brand-600 sm:max-w-[260px]"
        >
          {isLoading ? 'Đang đếm...' : `Xem ${resultCount} kết quả`}
        </button>
      </div>
    </div>
  );
};

export default UnitFilterStrip;
