"use client";

import { FiHome, FiCompass, FiMaximize, FiCopy } from "react-icons/fi";

type UnitModalHeaderBottomProps = {
  /** Loại hình (VD: "Song Lập", "Liền Kề", "Biệt Thự") */
  propertyTypeLabel: string;
  /** Hướng (VD: "Tây", "Đông", "Nam") */
  direction: string;
  /** Diện tích đất / xây dựng (m²) */
  landArea: number;
  /** Mở so sánh căn */
  onCompareUnit?: () => void;
  /** Chia sẻ */
  onShare?: () => void;
  /** Mở menu thêm */
  onMore?: () => void;
};

/**
 * Footer thanh hành động nhanh của popup chi tiết căn.
 *
 * Layout theo mockup:
 * ```
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ [🏠 Song Lập] [🧭 Tây] [▭ 228 m²] │ [So sánh căn] │
 * └──────────────────────────────────────────────────────────────────────┘
 * ```
 *
 * - 3 ô đầu là thông tin tóm tắt của căn (không click, chỉ hiển thị).
 * - Ô cuối là hành động so sánh căn. "Phiếu tính giá" va "Tính lãi vay" nằm
 *   ngang dòng "Giá" trong cột thông tin, không ở hàng này.
 *
 * Sử dụng CSS Grid để đảm bảo:
 * - Các cột có width đều nhau
 * - Các ô có height đều nhau (align-items: stretch)
 */
const UnitModalHeaderBottom = ({
  propertyTypeLabel,
  direction,
  landArea,
  onCompareUnit,
  onShare,
  onMore,
}: UnitModalHeaderBottomProps) => {
  return (
    <div className="border-b border-gray-200 py-2 laptop:py-1.5">
      <div className="flex flex-wrap items-stretch gap-2 max-md:grid max-md:grid-cols-2">
        <div className="flex min-w-[120px] flex-1 items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2 max-md:min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-500 text-white">
            <FiHome className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className="text-xs font-medium text-gray-600">Loại hình</p>
            <p className="truncate text-sm font-bold uppercase text-gray-900">
              {propertyTypeLabel}
            </p>
          </div>
        </div>

        <div className="flex min-w-[120px] flex-1 items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2 max-md:min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
            <FiCompass className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className="text-xs font-medium text-gray-600">Hướng</p>
            <p className="truncate text-sm font-bold uppercase text-gray-900">
              {direction}
            </p>
          </div>
        </div>

        <div className="flex min-w-[120px] flex-1 items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2 max-md:min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-brand-500 bg-white text-brand-500">
            <FiMaximize className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className="text-xs font-medium text-gray-600">Diện tích</p>
            <p className="truncate text-sm font-bold uppercase text-gray-900">
              {landArea} m²
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCompareUnit}
          className="flex min-w-[130px] flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600 max-md:col-span-2 max-md:min-w-0 max-md:text-xs"
        >
          <FiCopy className="h-4 w-4 shrink-0" />
          <span>So sánh căn</span>
        </button>
      </div>
    </div>
  );
};

export default UnitModalHeaderBottom;
