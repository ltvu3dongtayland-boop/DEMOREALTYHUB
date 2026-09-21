"use client";

import { useEffect, useState } from "react";
import { FiCopy, FiDownload, FiChevronLeft, FiChevronRight } from "react-icons/fi";

type UnitModalGalleryProps = {
  /** Danh sách URL ảnh. Có 1 ảnh -> chi hiển thị, có nhiều -> có dot + prev/next */
  images: string[];
  /** Alt cho ảnh lớn */
  alt?: string;
  /** Callback copy */
  onCopy?: () => void;
  /** Callback download */
  onDownload?: () => void;
};

/**
 * Gallery ảnh của popup chi tiết căn.
 *
 * Layout theo mockup:
 * ```
 * ┌────────────────────────────────────────┐
 * │ [📋] [⬇]  ← top-right                    │
 * │                                          │
 * │            <ảnh lớn 4:5>                 │
 * │                                          │
 * │  < • • • • • • • > 3/5  ← bottom-center  │
 * └────────────────────────────────────────┘
 * ```
 */
/** Bao lau doi mot anh khi chay tu dong */
const AUTOPLAY_MS = 4000;

const UnitModalGallery = ({
  images,
  alt = "Hình ảnh căn",
  onCopy,
  onDownload,
}: UnitModalGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  // Ro chuot vao anh la dung chay - nguoi dung dang xem tam do
  const [isPaused, setIsPaused] = useState(false);

  /**
   * Tu chay vong tron.
   *
   * activeIndex nam trong danh sach phu thuoc nen moi lan doi anh (tu dong hay
   * do nguoi dung bam) dong ho deu duoc dat lai - bam xong khong bi nhay tiep
   * mot phat nua ngay sau do.
   */
  useEffect(() => {
    if (images.length < 2 || isPaused) return;

    const timer = setTimeout(
      () => setActiveIndex((prev) => (prev + 1) % images.length),
      AUTOPLAY_MS,
    );
    return () => clearTimeout(timer);
  }, [activeIndex, images.length, isPaused]);

  // Không có ảnh: hiển thị placeholder gradient
  if (!images.length) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-linear-to-br from-gray-100 to-gray-200">
        <div className="flex h-full items-center justify-center text-gray-400">
          Đang cập nhật hình ảnh
        </div>
      </div>
    );
  }

  const total = images.length;
  const current = images[activeIndex];
  const canNavigate = total > 1;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  // Moi khuon kho deu mot ti le dung 4/5 chiem tron be ngang cot: anh phoi
  // canh von la anh dung, ep ngang di la cat mat phan tren duoi. Man hinh thap
  // khong lam anh be lai - cot ben trai cuon duoc, nguoi dung keo xuong.
  // Rieng dien thoai gioi han 58vh de anh khong an het mot man hinh.
  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100 max-md:max-h-[58vh]"
    >
      {/* ── Ảnh lớn ─────────────────────────────────────────── */}
      <img
        src={current}
        alt={alt}
        className="h-full w-full object-cover transition-opacity duration-300"
        loading="lazy"
      />

      {/* ── Nút top-right: copy + download ───────────────────── */}
      <div className="absolute right-3 top-3 flex gap-2">
        <button
          type="button"
          onClick={onCopy}
          aria-label="Sao chép"
          title="Sao chép"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-brand-500"
        >
          <FiCopy className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDownload}
          aria-label="Tải xuống"
          title="Tải xuống"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-brand-500"
        >
          <FiDownload className="h-4 w-4" />
        </button>
      </div>

      {/* ── Nút prev/next + dots (bottom-center) ─────────────── */}
      {canNavigate && (
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-3">
          {/* Prev */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Ảnh trước"
            title="Ảnh trước"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-brand-500"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>

          {/* Dots */}
          <div className="flex max-w-[60%] items-center gap-1.5 overflow-hidden rounded-full border border-white/30 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur">
            {Array.from({ length: total }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Chuyển tới ảnh ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-5 bg-brand-500"
                    : "w-1.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Counter */}
          <span className="rounded-full border border-white/30 bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur">
            {activeIndex + 1}/{total}
          </span>

          {/* Next */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Ảnh tiếp"
            title="Ảnh tiếp"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-brand-500"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UnitModalGallery;
