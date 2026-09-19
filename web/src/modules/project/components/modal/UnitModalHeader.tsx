"use client";

import {
  FiClock,
  FiLayers,
  FiMapPin,
  FiHeart,
} from "react-icons/fi";
import { formatBillion } from "@/common/utils/format";
import Image from "next/image";

type UnitModalHeaderProps = {
  /** Mã căn - hiển thị lớn ở đầu header */
  code: string;
  /** Tên phân khu */
  phaseName: string;
  /** Giá niêm yết / giá bán */
  price: number;
  /** Trạng thái còn hàng */
  isStock?: boolean;
  /** Căn độc quyền / HOT */
  isHot?: boolean;
  /** Đã yêu thích */
  isFavorite?: boolean;
  /** Thời gian cập nhật (VD: "2 giờ trước", "Hôm nay") */
  time?: string;
  /** Đóng modal */
  onClose: () => void;
  /** Toggle yêu thích */
  onToggleFavorite?: () => void;
};

/**
 * Header của popup chi tiết căn hộ.
 *
 * Chứa các thông tin cốt lõi: mã căn, phân khu, giá, badge trạng thái,
 * nút đóng và yêu thích — layout theo mockup:
 *
 * ```
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ [HOT] [CÒN HÀNG]     Căn A-12.03     [♡] [✕]                    │
 * │ Phân Khu Alpha          4.2 tỷ                               │
 * └─────────────────────────────────────────────────────────────────┘
 * ```
 */
const UnitModalHeader = ({
  code,
  phaseName,
  price,
  isStock = false,
  isHot = false,
  isFavorite = false,
  time,
  onClose,
  onToggleFavorite,
}: UnitModalHeaderProps) => {
  const actionBtn =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all";

  const actionButtons = (
    <div className="flex h-9 shrink-0 items-center gap-2">
      {onToggleFavorite && (
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
          title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
          className={`${actionBtn} ${
            isFavorite
              ? "border-error-500 bg-error-50 text-error-500 hover:bg-error-100"
              : "border-gray-200 bg-white text-gray-400 hover:border-error-300 hover:text-error-500"
          }`}
        >
          <FiHeart
            className={`h-4 w-4 ${isFavorite ? "animate-heart-pop fill-current" : ""}`}
          />
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className={`${actionBtn} border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700`}
      >
        ✕
      </button>
    </div>
  );

  return (
    <div className="border-b border-gray-200 bg-white pb-4 max-md:pb-3 laptop:pb-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {isHot && (
              <span className="inline-flex animate-hot-pulse items-center gap-1 rounded-md py-0.5 pr-2 pl-1 text-xs font-bold uppercase tracking-wider text-white">
                <Image src="/images/hot.png" alt="HOT" width={60} height={20} className="max-md:h-4 max-md:w-auto" />
              </span>
            )}

            {isStock && (
              <span className="inline-flex items-center gap-1 rounded-md bg-jade-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                <FiLayers className="h-3 w-3" />
                Còn hàng
              </span>
            )}

            {time && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <FiClock className="h-3.5 w-3.5 shrink-0" />
                <span>{time}</span>
              </div>
            )}
          </div>
          {actionButtons}
        </div>

        <div className="flex items-start justify-between gap-3 max-md:gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 className="text-3xl font-bold text-gray-900 max-md:text-xl max-md:leading-tight">
              {code}
            </h2>
            <div className="flex items-center gap-1.5">
              <FiMapPin className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="truncate text-sm font-medium text-gray-600">
                {phaseName}
              </span>
            </div>
          </div>

          <div className="flex max-w-[50%] shrink-0 flex-col items-end text-right">
            <p className="text-3xl font-semibold text-brand-600 max-md:text-xl">
              {formatBillion(price)}
            </p>
            <span className="mt-1 text-xs font-medium text-gray-600 max-md:mt-0.5 max-md:text-[11px] max-md:leading-snug max-md:text-gray-500">
              (Giá FULL đã bao gồm VAT và KPBT)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitModalHeader;
