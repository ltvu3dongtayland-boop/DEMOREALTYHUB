'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiCheck, FiShare2 } from 'react-icons/fi';

type ProjectDetailHeaderProps = {
  name: string;
};

const ProjectDetailHeader = ({ name }: ProjectDetailHeaderProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;

    // Tren dien thoai mo bang chia se cua he dieu hanh; may ban thi chep link
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
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

  return (
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
            <li aria-current="page" className="truncate text-gray-400">
              Chi tiết dự án
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
        <h1 className="text-lg font-bold uppercase leading-snug tracking-wide text-navy-700 sm:text-xl">
          {name}
        </h1>
        <p className="mt-2 text-theme-sm text-gray-600">
          Theo dõi thông tin chi tiết về bảng giá, quỹ căn, mặt bằng, tiến độ và chính
          sách bán hàng dự án {name}.
        </p>
      </div>
    </div>
  );
};

export default ProjectDetailHeader;
