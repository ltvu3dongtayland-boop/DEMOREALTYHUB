import { ProjectListSkeleton } from '@/modules/project/components/ProjectListPage';

/**
 * Man hinh cho cua route /du-an.
 *
 * Khong co file nay thi khi bam sang trang nay, khung noi dung rong mot nhip
 * truoc khi segment tai xong - main co lai, footer troi len giua man hinh roi
 * bi danh sach day xuong. Co loading.tsx, Next nha ngay khung xuong nay ra,
 * cao bang trang that, nen footer nam yen duoi day tu dau den cuoi.
 *
 * Dung chung ProjectListSkeleton voi <Suspense> trong page.tsx - mot dinh
 * nghia duy nhat, khong the lech chieu cao.
 */
export default function Loading() {
  return <ProjectListSkeleton />;
}
