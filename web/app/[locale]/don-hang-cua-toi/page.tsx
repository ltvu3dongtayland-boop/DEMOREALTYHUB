import type { Metadata } from 'next';
import BookingListPage from '@/modules/booking/components/BookingListPage';

export const metadata: Metadata = {
  title: 'Đơn hàng của tôi',
  description:
    'Danh sách yêu cầu booking căn bạn đã tạo trên RealtyHub: tình trạng xử lý, người phụ trách và thao tác hủy booking.',
};

export default function DonHangCuaToiRoutePage() {
  return <BookingListPage />;
}
