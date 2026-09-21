"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiMapPin, FiHome, FiMaximize, FiCompass, FiLayers, FiHeart } from "react-icons/fi";
import ThumbCarousel from "@/common/components/ThumbCarousel";
import { useFavoriteUnits } from "@/common/hooks/useFavoriteUnits";
import { formatBillion } from "@/common/utils/format";
import type { UnitWithProject } from "@/modules/project/models/project-detail.model";

type UnitCardProps = {
  unit: UnitWithProject;
  /**
   * Khi truyen: click vao card se goi callback nay thay vi navigate sang trang
   * du an. Dung tren trang Quy can (/quy-can) de mo popup chi tiet can. Neu
   * khong truyen, card giu hanh vi mac dinh (click -> sang /du-an/[slug]).
   */
  onUnitClick?: (unit: UnitWithProject) => void;
};

const UnitCard = ({ unit, onUnitClick }: UnitCardProps) => {
  const detailHref = `/du-an/${unit.projectSlug}?tab=quy-can`;
  const isInteractive = Boolean(onUnitClick);
  const { isFavorite, toggle } = useFavoriteUnits();
  const saved = isFavorite(unit.publicId);

  // Ro chuot len the thi dung chuyen anh, de con kip nhin tam dang xem
  const [isHovered, setIsHovered] = useState(false);

  // Chi hien thi badge HOT cho quy doc quyen
  const isHot = unit.fundType === 'doc-quyen';

  /**
   * Click vao card: neu co onUnitClick thi mo popup chi tiet can; neu khong
   * thi giu nguyen hanh vi mac dinh (Link navigate sang trang du an).
   *
   * Nut trai tim (favorite) phai stopPropagation de click chi toggle yeu
   * thich ma khong nhay trang / khong mo modal.
   */
  const handleCardClick = () => {
    if (onUnitClick) onUnitClick(unit);
  };

  // Khi card o che do "click de mo modal" thi khong the inline <Link> nua,
  // vi <a> long <a> khong hop le HTML. Click se do role cua article xu ly.
  const Wrapper = isInteractive ? 'div' : Link;
  const wrapperProps = isInteractive
    ? { role: 'button' as const, tabIndex: 0, onClick: handleCardClick }
    : { href: detailHref, 'aria-label': `Xem căn ${unit.code}` };

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isInteractive ? handleCardClick : undefined}
      onKeyDown={
        isInteractive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleCardClick();
              }
            }
          : undefined
      }
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:border-brand-400 ${
        isInteractive ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500' : ''
      }`}
    >
        {/* ── Anh bia ────────────────────────────────────────────────── */}
        <Wrapper
          {...(wrapperProps as any)}
          className="relative block aspect-[16/10] w-full overflow-hidden"
        >
          <ThumbCarousel
            seed={unit.publicId}
            images={unit.thumbnailUrls}
            alt={`Phối cảnh dự án ${unit.projectName}`}
            paused={isHovered}
            className="h-full w-full transition duration-500 group-hover:scale-105"
          />

          {/* Lop phu toi dan tu duoi len de ten du an luon doc duoc tren moi tam */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent"
          />
          {/* Ten du an overlay - nguoi xem quy can nhieu du an can biet can nay
              thuoc du an nao ngay khi nhin card. */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-3 text-center text-base font-bold uppercase leading-tight tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {unit.projectName}
          </span>

          {/* Tag HOT (goc tren trai) - danh dau quy doc quyen.
              Dung chung anh /images/hot.png voi popup chi tiet can, de mot can
              doc quyen nhin o card hay o popup deu la cung mot nhan. */}
          {isHot && (
            <span
              aria-label="Căn độc quyền"
              title="Căn độc quyền"
              className="absolute left-2 top-2 z-10 inline-flex animate-hot-pulse items-center"
            >
              <Image
                src="/images/hot.png"
                alt="HOT"
                width={60}
                height={20}
                className="h-6 w-auto"
              />
            </span>
          )}

          {/* Icon trai tim (goc tren phai) */}
          <button
            type="button"
            aria-label={saved ? "Bỏ yêu thích quỹ căn" : "Yêu thích quỹ căn"}
            aria-pressed={saved}
            className={`absolute right-2 top-2 z-10 rounded-full p-2 shadow-sm transition hover:scale-110 ${
              saved ? "bg-error-50 text-error-500" : "bg-white/90 text-error-500 hover:bg-white"
            }`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggle(unit.publicId);
            }}
          >
            <FiHeart className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
          </button>
        </Wrapper>

        {/* ── Noi dung ────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col p-4">
          {/* Ma can + gia */}
          <div className="mb-2 flex flex-row items-center justify-between gap-3">
            {isInteractive ? (
              <span className="block flex-1 truncate">
                <p className="text-sm font-medium text-gray-600 truncate">
                  <span className="font-semibold text-gray-900">{unit.code}</span>
                </p>
              </span>
            ) : (
              <Link
                href={`/du-an/${unit.projectSlug}`}
                className="group/link block flex-1 truncate"
              >
                <p className="text-sm font-medium text-gray-600 truncate">
                  <span className="font-semibold text-gray-900">{unit.code}</span>
                </p>
              </Link>
            )}
            <p className="text-sm font-medium text-gray-600 flex-shrink-0 whitespace-nowrap">{formatBillion(unit.netPrice)}</p>
          </div>

          {/* Divider */}
          <hr className="my-3 border-gray-200" />

          {/* Danh sach thong tin */}
          <dl className="space-y-2.5 text-sm">
            {/* Dien tich */}
            <div className="flex items-start gap-2">
              <FiMaximize aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <dt className="inline font-medium text-gray-600">Diện tích đất: </dt>
                <dd className="inline font-semibold text-gray-900">{unit.landArea} m²</dd>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FiHome aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <dt className="inline font-medium text-gray-600">Diện tích xây dựng: </dt>
                <dd className="inline font-semibold text-gray-900">{unit.buildArea} m²</dd>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FiCompass aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <dt className="inline font-medium text-gray-600">Hướng: </dt>
                <dd className="inline font-semibold text-gray-900">{unit.direction}</dd>
              </div>
            </div>

            {/* Phan khu */}
            <div className="flex items-start gap-2">
              <FiMapPin aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <dt className="inline font-medium text-gray-600">Phân khu: </dt>
                <dd className="inline font-semibold text-gray-900">{unit.phaseName}</dd>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FiLayers aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <dt className="inline font-medium text-gray-600">Loại hình: </dt>
                <dd className="inline font-semibold text-gray-900">Liền Kề</dd>
              </div>
            </div>
          </dl>
        </div>
    </article>
  );
};

export default UnitCard;
