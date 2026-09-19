import type { Metadata } from 'next';
import { Suspense } from 'react';
import FavoriteList from '@/modules/project/components/FavoriteList';

export const metadata: Metadata = {
  title: 'Yêu thích',
  description:
    'Danh sách dự án và quỹ căn bạn đã lưu để theo dõi và so sánh.',
};

/**
 * Trang /yeu-thich - hien thi cac du an user da bookmark.
 *
 * Luu o localStorage nen phai o client (server khong biet user da luu
 * du an nao). Component FavoriteList:
 *   - luc chua hydrate: hien trang thai loading (skeleton giong card)
 *   - luc da hydrate + favorites rong: empty state co CTA quay lai /gio-hang
 *   - co data: grid ProjectCard (click heart se bo luu -> grid tu update)
 *
 * Phai boc Suspense de useSearchParams ben trong khong chan prerender.
 */
const FavoritePageFallback = () => (
  <div className="site-container py-10">
    <div className="mx-auto mb-6 h-7 w-56 animate-pulse rounded bg-gray-200" />
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-96 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  </div>
);

const YeuThichPage = () => (
  <main className="site-container py-8">
    <Suspense fallback={<FavoritePageFallback />}>
      <FavoriteList />
    </Suspense>
  </main>
);

export default YeuThichPage;