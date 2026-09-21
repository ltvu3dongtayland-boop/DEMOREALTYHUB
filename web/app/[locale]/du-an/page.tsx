import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ProjectListPage, {
  ProjectListSkeleton,
} from '@/modules/project/components/ProjectListPage';

/**
 * Trang /du-an - danh sách dự án.
 *
 * Sau migration: metadata title/description lấy từ namespace `projects.metadata`
 * qua `getTranslations`. Sub-tree dùng `setRequestLocale` để enable static
 * rendering với locale-aware messages.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects.metadata' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ProjectsRoutePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // ProjectListPage doc bo loc qua useSearchParams nen bat buoc phai nam
  // trong Suspense, neu khong Next se bao loi khi prerender trang tinh.
  return (
    <Suspense fallback={<ProjectListSkeleton />}>
      <ProjectListPage />
    </Suspense>
  );
}
