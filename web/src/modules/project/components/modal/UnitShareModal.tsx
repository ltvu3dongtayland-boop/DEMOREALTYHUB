'use client';

import { useEffect, useState } from 'react';
import { FiCheck, FiCopy, FiShare2, FiX } from 'react-icons/fi';
import { formatBillion } from '@/common/utils/format';

/**
 * Bang chia se mot can - bung ra khi bam "Chia se" trong popup chi tiet.
 *
 * Hien SAN anh va doan chu se gui di, thay vi im lang copy vao clipboard:
 * moi gioi gui cho khach nen phai doc lai duoc minh sap gui gi, va sua them
 * neu can truoc khi copy.
 */
type UnitShareModalProps = {
  code: string;
  projectName: string;
  phaseName: string;
  propertyTypeLabel: string;
  direction: string;
  landArea: number;
  price: number;
  /** Anh dai dien - lay anh dau tien cua can */
  image?: string;
  onClose: () => void;
};

const UnitShareModal = ({
  code,
  projectName,
  phaseName,
  propertyTypeLabel,
  direction,
  landArea,
  price,
  image,
  onClose,
}: UnitShareModalProps) => {
  const [isCopied, setIsCopied] = useState(false);

  /**
   * Dia chi trang hien tai. Doc ngay luc khoi tao state duoc vi component nay
   * chi mount khi nguoi dung bam "Chia se" - luc do da o trinh duyet, khong
   * con lo `window` chua ton tai nhu khi render tren may chu.
   */
  const [shareUrl] = useState(() => window.location.href);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Pha capture de dong bang nay truoc, khong dong luon popup chi tiet
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [onClose]);

  const shareText = [
    `🏡 ${projectName} - căn ${code}`,
    `• Phân khu: ${phaseName}`,
    `• Loại hình: ${propertyTypeLabel} · Hướng ${direction}`,
    `• Diện tích: ${landArea} m²`,
    `• Giá: ${formatBillion(price)} (đã gồm VAT & KPBT)`,
    shareUrl,
  ].join('\n');

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Trinh duyet chan clipboard (thuong la khi khong chay HTTPS): doan chu
      // van dang hien ra ngay tren man hinh nen nguoi dung boi va copy tay duoc.
      setIsCopied(false);
    }
  };

  /** Chia se bang hop thoai san co cua may - chi dien thoai moi thuong co */
  const shareNative = async () => {
    if (!navigator.share) return copyText();
    try {
      await navigator.share({ title: `${projectName} - ${code}`, text: shareText });
    } catch {
      // Nguoi dung bam huy - khong phai loi, khong bao gi ca
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 max-md:items-end max-md:p-0"
      role="dialog"
      aria-modal="true"
      aria-label="Chia sẻ căn"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl max-md:rounded-b-none">
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <FiShare2 className="h-4 w-4" />
          </span>
          <h2 className="flex-1 text-base font-bold text-gray-900">Chia sẻ căn</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          {/* Anh kem theo - de nguoi gui thay truoc cai khach se nhan */}
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={`Căn ${code}`}
              className="aspect-[16/10] w-full rounded-xl object-cover"
            />
          )}

          <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-25 p-3 font-sans text-theme-sm leading-relaxed text-gray-700">
            {shareText}
          </pre>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyText}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-brand-200 text-theme-sm font-semibold text-brand-600 transition hover:bg-brand-50"
            >
              {isCopied ? (
                <FiCheck aria-hidden className="h-4 w-4" />
              ) : (
                <FiCopy aria-hidden className="h-4 w-4" />
              )}
              {isCopied ? 'Đã sao chép' : 'Sao chép nội dung'}
            </button>
            <button
              type="button"
              onClick={shareNative}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 text-theme-sm font-semibold text-white transition hover:bg-brand-600"
            >
              <FiShare2 aria-hidden className="h-4 w-4" />
              Chia sẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitShareModal;
