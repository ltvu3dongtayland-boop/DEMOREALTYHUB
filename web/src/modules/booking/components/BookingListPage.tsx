'use client';

import Link from 'next/link';
import { FiShoppingCart, FiX } from 'react-icons/fi';
import {
  BOOKING_STATUS_LABELS,
  useBookings,
  type BookingEntry,
  type BookingStatus,
} from '@/common/hooks/useBookings';

/**
 * Trang "Đơn hàng của tôi" - danh sách yêu cầu booking đã tạo từ popup chi
 * tiết quỹ căn.
 *
 * Dữ liệu đang nằm ở localStorage (xem useBookings). Khi backend có endpoint
 * booking thì chỉ hook đó đổi, bảng này giữ nguyên.
 */

/** Mau chu theo trang thai - do cho tu choi/huy, xanh cho da duyet */
const STATUS_TONE: Record<BookingStatus, string> = {
  'cho-xu-ly': 'text-accent-600',
  'da-duyet': 'text-success-600',
  'da-tu-choi': 'text-error-600',
  'da-huy': 'text-gray-500',
};

const formatRequestedAt = (ms: number) => {
  const date = new Date(ms);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const BookingListPage = () => {
  const { bookings, cancel, isHydrated } = useBookings();

  // Chi huy duoc yeu cau chua chot: da duyet/tu choi/huy roi thi khong con gi de huy
  const canCancel = (booking: BookingEntry) => booking.status === 'cho-xu-ly';

  return (
    <div className="site-container py-8">
      <h1 className="mb-6 text-center text-3xl font-bold uppercase tracking-wide text-gray-900">
        Đơn hàng của tôi
      </h1>

      {!isHydrated ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <FiShoppingCart className="h-6 w-6" />
          </span>
          <p className="mb-4 text-theme-sm text-gray-500">
            Bạn chưa có yêu cầu booking nào.
          </p>
          <Link
            href="/quy-can"
            className="inline-flex items-center rounded-md bg-brand-500 px-4 py-2 text-theme-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Xem quỹ căn
          </Link>
        </div>
      ) : (
        <>
          {/* Dien thoai + may tinh bang: moi yeu cau mot the.
              Bang 7 cot nhoi vao be ngang iPad thi o nao cung xuong hai ba
              dong, doc rat met - the xep doc gon hon han. */}
          <ul className="space-y-3 lg:hidden">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-md bg-error-50 px-2.5 py-1 text-theme-sm font-bold text-error-600">
                    {booking.unitCode}
                  </span>
                  <span
                    className={`text-theme-sm font-semibold ${STATUS_TONE[booking.status]}`}
                  >
                    <span aria-hidden className="mr-1.5">
                      •
                    </span>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </span>
                </div>

                <p className="mt-2 text-theme-sm font-bold uppercase text-gray-900">
                  {booking.projectName}
                </p>

                <dl className="mt-2 space-y-1 text-theme-sm">
                  {booking.rejectReason && (
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-gray-500">Lý do từ chối:</dt>
                      <dd className="min-w-0 flex-1 text-error-500">
                        {booking.rejectReason}
                      </dd>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-gray-500">Thời gian:</dt>
                    <dd className="min-w-0 flex-1 text-gray-700">
                      {formatRequestedAt(booking.requestedAt)}
                    </dd>
                  </div>
                  {booking.assignee && (
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-gray-500">Người phụ trách:</dt>
                      <dd className="min-w-0 flex-1 text-gray-700">
                        {booking.assignee}
                      </dd>
                    </div>
                  )}
                </dl>

                {canCancel(booking) && (
                  <button
                    type="button"
                    onClick={() => cancel(booking.id)}
                    className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-error-500/60 text-theme-sm font-semibold text-error-600 transition hover:bg-error-50"
                  >
                    <FiX aria-hidden className="h-4 w-4" />
                    Hủy booking
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Tu 1024px tro len moi du cho cho bang 7 cot */}
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card lg:block">
          <table className="w-full min-w-[900px] border-collapse whitespace-nowrap text-theme-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-25 text-theme-xs uppercase tracking-wide text-gray-600">
                <th className="px-4 py-3 text-left font-bold">Mã căn</th>
                <th className="px-4 py-3 text-left font-bold">Dự án</th>
                <th className="px-4 py-3 text-left font-bold">Tình trạng</th>
                <th className="px-4 py-3 text-left font-bold">Lý do từ chối</th>
                <th className="px-4 py-3 text-left font-bold">Thời gian yêu cầu</th>
                <th className="px-4 py-3 text-left font-bold">Người phụ trách</th>
                <th className="px-4 py-3 text-right font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-25"
                >
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-error-50 px-2.5 py-1 font-bold text-error-600">
                      {booking.unitCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium uppercase text-gray-800">
                    {booking.projectName}
                  </td>
                  <td className={`px-4 py-3 font-semibold ${STATUS_TONE[booking.status]}`}>
                    <span aria-hidden className="mr-1.5">
                      •
                    </span>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </td>
                  <td className="px-4 py-3 text-error-500">
                    {booking.rejectReason ?? ''}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatRequestedAt(booking.requestedAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{booking.assignee ?? ''}</td>
                  <td className="px-4 py-3 text-right">
                    {canCancel(booking) && (
                      <button
                        type="button"
                        onClick={() => cancel(booking.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-error-500/60 px-3 py-1.5 text-theme-xs font-semibold text-error-600 transition hover:bg-error-50"
                      >
                        <FiX aria-hidden className="h-3.5 w-3.5" />
                        Hủy booking
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
};

export default BookingListPage;
