'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiCheck, FiChevronRight, FiMapPin, FiShare2 } from 'react-icons/fi';
import type { ProjectDetail } from '../../models/project-detail.model';
import {
  PROPERTY_TYPE_LABELS,
  SEGMENT_LABELS,
  STATUS_LABELS,
  type ProjectStatus,
} from '../../models/project.model';

/**
 * Mau nhan trang thai. Dang mo ban la trang thai "hanh dong duoc" nen dung mau
 * noi nhat; da ban giao la thong tin qua khu nen tram lai.
 */
const STATUS_TONES: Record<ProjectStatus, string> = {
  'tat-ca': 'bg-gray-200 text-gray-700',
  'ban-chay': 'bg-success-500 text-white',
  'da-ban-het': 'bg-gray-200 text-gray-700',
  'da-ban-giao': 'bg-gray-200 text-gray-700',
  'sap-mo-ban': 'bg-gold-400 text-navy-900',
  'moi-mo-ban': 'bg-success-500 text-white',
  'dang-mo-ban': 'bg-success-500 text-white',
};

/**
 * Dau trang chi tiet du an: kham anh truoc, khoi ten sau.
 *
 * Truoc day ten du an de len anh. Van de: chu phai co lop phu toi mo dam thi
 * moi doc duoc, ma lop phu do lam anh bi xin mau - trong khi anh phoi canh la
 * thu nguoi mua muon nhin ro nhat. Tach ra thi anh sach hoan toan, con ten du
 * an nam tren nen trang nen doc de hon han.
 */
const ProjectHero = ({ project }: { project: ProjectDetail }) => {
  const [isCopied, setIsCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;

    // Tren dien thoai mo bang chia se cua he dieu hanh; may ban thi chep link
    if (navigator.share) {
      try {
        await navigator.share({ title: project.name, url });
        return;
      } catch {
        // Nguoi dung bam huy - khong coi la loi, roi xuong nhanh chep link
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Trinh duyet chan clipboard (thuong do khong phai HTTPS) - bo qua im lang
    }
  };

  const chips = [
    { label: STATUS_LABELS[project.status], className: STATUS_TONES[project.status] },
    {
      label: SEGMENT_LABELS[project.segment],
      className: 'bg-brand-50 text-brand-700',
    },
    {
      label: PROPERTY_TYPE_LABELS[project.propertyType],
      className: 'bg-accent-50 text-accent-600',
    },
  ];

  return (
    // pb-6: dai thong so truoc day chen giua hero va thanh tab dinh, gio no da
    // chuyen vao muc Tong quan nen hero phai tu chua khoang tho cho minh.
    <header className="site-container pb-6 pt-4">
      {/* <nav aria-label="Đường dẫn" className="mb-3 min-w-0">
        <ol className="flex items-center gap-1.5 text-base text-gray-500">
          <li>
            <Link href="/du-an" className="transition hover:text-brand-600">
              Dự án
            </Link>
          </li>
          <li aria-hidden>
            <FiChevronRight className="text-gray-300" />
          </li>
          <li aria-current="page" className="truncate text-gray-700">
            {project.name}
          </li>
        </ol>
      </nav> */}

      {/* <ProjectGallery slides={project.hero} projectName={project.name} /> */}

      {/* Hang 1: nhan trang thai ben trai, nut chia se ben phai - hai thu cung
          la "phu tro" nen xep chung mot hang, thay vi de nut chia se dat le
          phai canh mot khoi chu cao vai dong. */}
      {/* <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className={`rounded-full px-3 py-1.5 text-theme-sm font-bold uppercase tracking-wide ${chip.className}`}
            >
              {chip.label}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={share}
          className="flex shrink-0 items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-base font-medium text-gray-700 shadow-card transition duration-200 hover:border-brand-400 hover:text-brand-600 active:scale-95"
        >
          {isCopied ? (
            <>
              <FiCheck aria-hidden className="text-success-500" />
              Đã chép link
            </>
          ) : (
            <>
              <FiShare2 aria-hidden />
              Chia sẻ
            </>
          )}
        </button>
      </div> */}

      {/* Hang 2: ten du an chiem tron chieu ngang, khong bi nut nao chen canh */}
      <h1 className="mt-4 text-3xl font-extrabold uppercase leading-tight tracking-tight text-navy-800 sm:text-4xl lg:text-5xl">
        {project.name}
      </h1>

      {/* <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
        {project.tagline}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-base text-gray-600">
        <span className="flex items-start gap-1.5">
          <FiMapPin aria-hidden className="mt-0.5 shrink-0 text-brand-500" />
          {project.address}
        </span>
        <span className="hidden h-4 w-px bg-gray-300 sm:block" aria-hidden />
        <span>
          Chủ đầu tư:{' '}
          <strong className="font-semibold text-navy-800">
            {project.developerName}
          </strong>
        </span>
      </div> */}
    </header>
  );
};

export default ProjectHero;
