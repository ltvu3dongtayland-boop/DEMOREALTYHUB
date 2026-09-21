'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FiCheck, FiShare2 } from 'react-icons/fi';
import { usePhaseDetail } from '../../hooks/useProjects';
import {
  DEFAULT_PHASE_TAB,
  parsePhaseTabKey,
  type PhaseDetail,
  type PhaseDetailTabKey,
} from '../../models/project-detail.model';
import FloorPlanTab from '../detail/tabs/FloorPlanTab';
import LocationTab from '../detail/tabs/LocationTab';
import SalesPolicyTab from '../detail/tabs/SalesPolicyTab';
import UnitsTab from '../detail/tabs/UnitsTab';
import PhaseTabNav from './PhaseTabNav';
import PhaseOverviewTab from './tabs/PhaseOverviewTab';

const TAB_PARAM = 'tab';

type PhaseDetailPageProps = {
  projectSlug: string;
  phaseSlug: string;
  /** Route da doc san tren server - dung lam initialData de HTML co noi dung */
  initialPhase?: PhaseDetail;
};

const PhaseDetailPage = ({
  projectSlug,
  phaseSlug,
  initialPhase,
}: PhaseDetailPageProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const currentTab = parsePhaseTabKey(searchParams.get(TAB_PARAM));
  const phaseQuery = usePhaseDetail(projectSlug, phaseSlug, initialPhase);

  const changeTab = useCallback(
    (tab: PhaseDetailTabKey) => {
      const next = new URLSearchParams(searchParams.toString());
      if (tab === DEFAULT_PHASE_TAB) next.delete(TAB_PARAM);
      else next.set(TAB_PARAM, tab);

      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });

      tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [pathname, router, searchParams],
  );

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // Nguoi dung bam huy - roi xuong nhanh chep link
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Trinh duyet chan clipboard (thuong do khong phai HTTPS)
    }
  };

  const data = phaseQuery.data;

  if (phaseQuery.isLoading) {
    return (
      <div className="site-container py-8">
        <div className="mb-6 h-24 animate-pulse rounded-lg bg-gray-100" />
        <div className="mb-6 h-11 animate-pulse rounded bg-gray-100" />
        <div className="h-96 w-full animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="site-container py-16 text-center">
        <p className="mb-4 text-theme-sm text-gray-500">Không tìm thấy phân khu này.</p>
        <Link
          href={`/gio-hang/${projectSlug}`}
          className="rounded-md border border-gray-300 px-4 py-2 text-theme-sm font-medium text-gray-700 transition hover:border-brand-400 hover:text-brand-600"
        >
          Về trang dự án
        </Link>
      </div>
    );
  }

  const { phase } = data;

  return (
    <div className="pb-14">
      <div className="site-container pt-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <nav aria-label="Đường dẫn" className="min-w-0">
            <ol className="flex items-center gap-2 text-theme-sm text-gray-500">
              <li>
                <Link href="/du-an" className="transition hover:text-brand-600">
                  Trang chủ
                </Link>
              </li>
              <li aria-hidden className="text-gray-300">
                /
              </li>
              <li>
                <Link
                  href={`/gio-hang/${data.projectSlug}`}
                  className="transition hover:text-brand-600"
                >
                  Chi tiết dự án
                </Link>
              </li>
              <li aria-hidden className="text-gray-300">
                /
              </li>
              <li aria-current="page" className="truncate text-gray-400">
                Phân khu
              </li>
            </ol>
          </nav>

          <button
            type="button"
            onClick={share}
            className="flex shrink-0 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-gray-700 transition hover:border-brand-400 hover:text-brand-600"
          >
            {isCopied ? (
              <>
                <FiCheck aria-hidden className="text-success-500" />
                Đã chép link
              </>
            ) : (
              <>
                Chia sẻ
                <FiShare2 aria-hidden />
              </>
            )}
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-25 px-5 py-4 shadow-card sm:px-6 sm:py-5">
          <h1 className="text-lg font-bold leading-snug text-navy-700 sm:text-xl">
            Phân khu <span className="uppercase">{phase.name}</span>
          </h1>
          <p className="mt-2 text-theme-sm text-gray-600">
            Cập nhật thông tin chi tiết và theo dõi bảng hàng quỹ căn phân khu{' '}
            <span className="uppercase">{phase.name}</span>.
          </p>
        </div>

        {/* Chuyen nhanh sang phan khu khac ma khong phai quay lai trang du an */}
        <div className="mt-5">
          <p className="mb-2.5 border-l-4 border-gold-400 pl-2.5 text-theme-sm font-semibold text-gray-800">
            Danh sách phân khu:
          </p>

          <ul className="flex flex-wrap items-center gap-2">
            {data.siblings.map((sibling) => {
              const isActive = sibling.slug === phase.slug;

              return (
                <li key={sibling.publicId}>
                  <Link
                    href={`/gio-hang/${data.projectSlug}/phan-khu/${sibling.slug}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={`block rounded border px-3.5 py-2 text-theme-xs font-bold uppercase tracking-wide transition ${
                      isActive
                        ? 'border-gray-400 bg-gray-200 text-gray-900'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-brand-400 hover:text-brand-600'
                    }`}
                  >
                    {sibling.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div ref={tabsRef} className="mt-6 scroll-mt-16">
        <PhaseTabNav current={currentTab} onChange={changeTab} />
      </div>

      <div className="site-container pt-8">
        {currentTab === 'tong-quan' && <PhaseOverviewTab phase={phase} />}
        {currentTab === 'vi-tri' && (
          <LocationTab
            location={data.location}
            name={phase.name}
            seed={phase.publicId}
          />
        )}
        {currentTab === 'mat-bang-quy-can' && (
          <FloorPlanTab planMap={data.planMap} lockedPhaseName={phase.name} />
        )}
        {currentTab === 'quy-can' && (
          <UnitsTab slug={data.projectSlug} lockedPhaseName={phase.name} />
        )}
        {currentTab === 'chinh-sach-ban-hang' && (
          <SalesPolicyTab
            salesPolicy={data.salesPolicy}
            projectName={data.projectName}
          />
        )}
      </div>
    </div>
  );
};

export default PhaseDetailPage;
