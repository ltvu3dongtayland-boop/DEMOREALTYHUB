/**
 * Dinh dang so cho phia hien thi.
 *
 * Quy uoc cua du an: API luon tra VND dang so nguyen, khong bao gio tra chuoi
 * da dinh dang - moi viec lam dep so deu nam o day.
 */

const numberFormatter = new Intl.NumberFormat('vi-VN');

/** 15139 -> "15.139" */
export const formatNumber = (value: number) => numberFormatter.format(value);

/** 6_710_000_000 -> "6.71 ty". Thiet ke dung dau cham thap phan nen giu toFixed. */
export const formatBillion = (vnd: number) => `${(vnd / 1_000_000_000).toFixed(2)} tỷ`;

/**
 * Gia gon cho pin tren ban do mat bang: 5_360_000_000 -> "5.36",
 * 12_100_000_000 -> "12.1". Giu 3 chu so co nghia de pin khong bi dai.
 */
export const formatBillionShort = (vnd: number) => {
  const value = vnd / 1_000_000_000;
  return value >= 10 ? value.toFixed(1) : value.toFixed(2);
};

/** 104_900_000 -> "104.90 trieu/m²" */
export const formatMillionPerSqm = (vnd: number) =>
  `${(vnd / 1_000_000).toFixed(2)} triệu/m²`;

/** Khoang gia cua mot phan khu: "4.93 ty - 46.36 ty" */
export const formatPriceRange = (from: number, to: number) =>
  `${formatBillion(from)} - ${formatBillion(to)}`;

/** ISO -> "23 thang 4, 2026" giong thiet ke */
export const formatArticleDate = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso));

/** ISO -> "22/06/2026" cho moc tien do */
export const formatShortDate = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso));

// ── Thoi gian thong bao ────────────────────────────────────────────────────

const NOTIFICATION_TIME_ZONE = 'Asia/Bangkok';
const hourFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: NOTIFICATION_TIME_ZONE,
});
// `vi-VN` numeric short date dung dau gach ngang; ban thiet ke dung dd/MM nen
// ghep tay tu cac part thay vi dua vao pattern cua locale.
const dayMonthParts = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  timeZone: NOTIFICATION_TIME_ZONE,
});

const formatDayMonth = (value: Date) => {
  const parts = dayMonthParts.formatToParts(value);
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  return `${day}/${month}`;
};

/** Nhan thoi gian ngan gon cho thong bao: gio trong ngay, "Hôm qua",
 * "N ngày trước" trong tuan, con lai la dd/MM. Dung chung cho popover
 * chuong va trang /thong-bao de hai noi hien giong nhau. */
export const formatNotificationTime = (iso: string) => {
  const created = new Date(iso);
  const dayIndex = (value: Date) =>
    Math.floor((value.getTime() - value.getTimezoneOffset() * 60_000) / 86_400_000);
  const diffDays = dayIndex(new Date()) - dayIndex(created);

  if (diffDays <= 0) return hourFormatter.format(created);
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDayMonth(created);
};
