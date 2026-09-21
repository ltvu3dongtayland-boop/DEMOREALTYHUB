"use client";

import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiFileText,
  FiHome,
  FiInfo,
  FiX,
} from "react-icons/fi";
import { formatBillion } from "@/common/utils/format";

/**
 * Bang "Tao yeu cau booking can" - bung ra khi bam BOOKING LOCK trong popup
 * chi tiet quy can.
 *
 * Chi XAC NHAN, khong hoi them gi: moi gioi bam lock la de giu cho ngay, thong
 * tin khach lay sau. Bang chi lap lai nhung gi can doi chieu truoc khi bam (ma
 * can, trang thai, gia) va cho biet ai se xu ly yeu cau.
 *
 * Chua co API booking nen `onConfirm` chi bao len tren; khi backend co, doi
 * mot cho do thanh mot lan goi service.
 */
type BookingAdvisor = {
  name: string;
};

type UnitBookingLockModalProps = {
  /** Ma can - VD 'S6.0502.13' */
  code: string;
  /** Ten du an - hien o man hinh bao da nhan yeu cau */
  projectName: string;
  /** Con hang / giu cho / da ban */
  statusLabel: string;
  isAvailable: boolean;
  direction: string;
  propertyTypeLabel: string;
  landArea: number;
  /** Gia CHUA bao gom VAT + KPBT, don vi VND */
  price: number;
  /** Nguoi phu trach - chi hien o man hinh bao da nhan yeu cau */
  advisor?: BookingAdvisor;
  onClose: () => void;
  onConfirm?: () => void;
};

const UnitBookingLockModal = ({
  code,
  projectName,
  statusLabel,
  isAvailable,
  direction,
  propertyTypeLabel,
  landArea,
  price,
  advisor,
  onClose,
  onConfirm,
}: UnitBookingLockModalProps) => {
  /**
   * Da bam xac nhan chua.
   *
   * Sau khi bam, bang doi han sang man hinh bao da nhan yeu cau thay vi dong
   * ngay: nguoi dung can thay minh vua dat cho can nao va ai se xu ly, neu
   * khong ho se bam lai lan nua vi tuong chua an.
   */
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Bat o pha capture de dong bang nay TRUOC popup chi tiet dang mo duoi
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  const confirm = () => {
    setIsSubmitted(true);
    onConfirm?.();
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 max-md:items-end max-md:p-0"
      role="dialog"
      aria-modal="true"
      aria-label="Tạo yêu cầu booking căn"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl max-md:rounded-b-none">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
        >
          <FiX className="h-4 w-4" />
        </button>

        {isSubmitted ? (
          <div className="flex flex-col items-center gap-3 px-2 pt-4 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-500 text-white">
              <FiCheck className="h-9 w-9" strokeWidth={3} />
            </span>

            <h2 className="text-xl font-bold text-gray-900">
              Yêu cầu booking thành công
            </h2>

            <dl className="w-full space-y-1.5 text-left text-theme-sm">
              <div className="flex gap-2">
                <dt className="font-bold text-gray-900">Mã căn:</dt>
                <dd className="min-w-0 flex-1 text-gray-700">{code}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-bold text-gray-900">Dự án:</dt>
                <dd className="min-w-0 flex-1 uppercase text-gray-700">
                  {projectName}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-bold text-gray-900">Trạng thái:</dt>
                <dd className="min-w-0 flex-1 text-gray-700">Đang chờ xử lý</dd>
              </div>
              {advisor && (
                <div className="flex gap-2">
                  <dt className="font-bold text-gray-900">Người phụ trách:</dt>
                  <dd className="min-w-0 flex-1 text-gray-700">
                    {advisor.name}
                  </dd>
                </div>
              )}
            </dl>

            <p className="text-theme-xs leading-relaxed text-gray-500">
              Yêu cầu booking sẽ được xử lý trong vòng 1h. Bạn có thể theo dõi
              trạng thái trong &ldquo;Danh sách booking&rdquo;.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-1 h-11 rounded-full bg-success-500 px-8 text-theme-sm font-bold text-white transition hover:bg-success-600 active:scale-[0.99]"
            >
              Chúc bạn may mắn!
            </button>
          </div>
        ) : (
          <>
            {/* ── Dau bang ───────────────────────────────────────────── */}
            <div className="flex flex-col items-center gap-2 pt-2 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-accent-500 text-accent-500">
                <FiCalendar className="h-7 w-7" />
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                Tạo yêu cầu booking căn
              </h2>
              <p className="text-theme-xs text-gray-500">
                Xác nhận thông tin để đặt chỗ căn hộ
              </p>
            </div>

            {/* ── The tom tat can ──────────────────────────────────────── */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <FiHome
                  aria-hidden
                  className="mt-1 h-5 w-5 shrink-0 text-gray-400"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-gray-900">{code}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-theme-xs font-semibold ${
                        isAvailable
                          ? "bg-success-50 text-success-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <FiCheckCircle aria-hidden className="h-3.5 w-3.5" />
                      {statusLabel}
                    </span>
                    <span className="rounded-lg bg-brand-50 px-2 py-1 text-theme-xs font-bold uppercase text-brand-600">
                      {direction}
                    </span>
                    <span className="text-theme-xs font-semibold uppercase text-gray-700">
                      {propertyTypeLabel}
                    </span>
                    <span className="rounded-lg bg-purple-50 px-2 py-1 text-theme-xs font-semibold text-purple-700">
                      {landArea} m²
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-3 border-t border-gray-100 pt-3">
                <FiFileText
                  aria-hidden
                  className="mt-1 h-5 w-5 shrink-0 text-gray-400"
                />
                <div>
                  <p className="text-theme-xs text-gray-500">
                    Giá chưa bao gồm VAT + KPBT:
                  </p>
                  <p className="text-2xl font-bold text-error-600">
                    {formatBillion(price)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-3 border-t border-gray-100 pt-3">
                <FiInfo
                  aria-hidden
                  className="mt-1 h-5 w-5 shrink-0 text-gray-400"
                />
                <div>
                  <p className="text-theme-xs text-gray-500">Lưu ý</p>
                  <p className="text-theme-sm font-bold text-gray-900">
                    Yêu cầu booking sẽ được xử lý trong vòng 1h
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={confirm}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-theme-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-600 active:scale-[0.99]"
            >
              <FiCalendar aria-hidden className="h-4 w-4" />
              Xác nhận booking
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UnitBookingLockModal;
