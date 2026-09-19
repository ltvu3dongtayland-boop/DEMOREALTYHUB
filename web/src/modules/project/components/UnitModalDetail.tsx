"use client";

import { UnitModalHeader, UnitModalHeaderBottom } from "./modal";
import UnitModalGallery from "./modal/UnitModalGallery";
import UnitModalAdvisor from "./modal/UnitModalAdvisor";
import UnitModalInfo from "./modal/UnitModalInfo";
import UnitModalBottom from "./modal/UnitModalBottom";

type UnitModalDetailProps = {
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
  /** Thời gian cập nhật */
  time?: string;
  /** Loại hình (VD: "Song Lập", "Liền Kề", "Biệt Thự") */
  propertyTypeLabel: string;
  /** Hướng (VD: "Tây", "Đông", "Nam") */
  direction: string;
  /** Diện tích đất / xây dựng (m²) */
  landArea: number;
  /** Danh sách URL ảnh */
  images: string[];
  /** Alt cho ảnh lớn */
  imageAlt?: string;
  /** Thông tin advisors */
  advisors?: Array<{
    id: string | number;
    name: string;
    avatar: string;
    views: number;
    phone?: string;
  }>;
  /** Đóng modal */
  onClose: () => void;
  /** Toggle yêu thích */
  onToggleFavorite?: () => void;
  /** Mở so sánh căn */
  onCompareUnit?: () => void;
  /** Mở so sánh chính sách */
  onComparePolicy?: () => void;
  /** Chia sẻ */
  onShare?: () => void;
  /** Mở menu thêm */
  onMore?: () => void;
  /** Copy ảnh */
  onCopyImage?: () => void;
  /** Download ảnh */
  onDownloadImage?: () => void;
  /** Gọi advisor */
  onCallAdvisor?: (advisor: {
    id: string | number;
    name: string;
    avatar: string;
    views: number;
    phone?: string;
  }) => void;
  /** Nhắn tin advisor */
  onMessageAdvisor?: (advisor: {
    id: string | number;
    name: string;
    avatar: string;
    views: number;
    phone?: string;
  }) => void;
};

const UnitModalDetail = ({
  code,
  phaseName,
  price,
  isStock = false,
  isHot = false,
  isFavorite = false,
  time,
  propertyTypeLabel,
  direction,
  landArea,
  images,
  imageAlt,
  advisors,
  onClose,
  onToggleFavorite,
  onCompareUnit,
  onComparePolicy,
  onShare,
  onMore,
  onCopyImage,
  onDownloadImage,
  onCallAdvisor,
  onMessageAdvisor,
}: UnitModalDetailProps) => {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* ── Header (cố định phía trên) ─────────────────────────── */}
      <div className="shrink-0">
        <UnitModalHeader
          code={code}
          phaseName={phaseName}
          price={price}
          isStock={isStock}
          isHot={isHot}
          isFavorite={isFavorite}
          time={time}
          onClose={onClose}
          onToggleFavorite={onToggleFavorite}
        />
      </div>

      {/* ── Header Bottom (cố định phía trên) ──────────────────── */}
      <div className="shrink-0">
        <UnitModalHeaderBottom
          propertyTypeLabel={propertyTypeLabel}
          direction={direction}
          landArea={landArea}
          onCompareUnit={onCompareUnit}
          onComparePolicy={onComparePolicy}
          onShare={onShare}
          onMore={onMore}
        />
      </div>

      {/* ── Content: iPad/desktop 2 cot nhu cu, mobile xep 1 cot ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden max-md:flex-col max-md:overflow-y-auto">
        <div className="flex w-1/2 shrink-0 flex-col overflow-hidden border-r border-gray-200 max-md:w-full max-md:border-r-0">
          <div className="flex-1 overflow-hidden pt-2 pr-1 max-md:overflow-visible max-md:pr-0 max-md:pt-3">
            <UnitModalGallery
              images={images}
              alt={imageAlt}
              onCopy={onCopyImage}
              onDownload={onDownloadImage}
            />
            <div className="mt-2">
              <UnitModalAdvisor
                advisors={advisors}
                onCall={onCallAdvisor}
                onMessage={onMessageAdvisor}
              />
            </div>
          </div>
        </div>

        <div className="w-1/2 overflow-y-auto pt-2 pl-1 max-md:w-full max-md:overflow-visible max-md:pl-0 max-md:pb-3">
          <UnitModalInfo />
        </div>
      </div>

      {/* ── Footer (cố định phía dưới) ─────────────────────────── */}
      <UnitModalBottom onShare={onShare} />
    </div>
  );
};

export default UnitModalDetail;
