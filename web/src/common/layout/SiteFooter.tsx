import Link from 'next/link';
import Image from 'next/image';
import { HiOutlineUserGroup } from 'react-icons/hi2';
import { FaFacebookF, FaTiktok, FaYoutube } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import AppStoreBadges from '@/common/components/AppStoreBadges';
import FooterHeading from '@/common/layout/FooterHeading';
import FooterLinkList from '@/common/layout/FooterLinkList';


const POPULAR_SEARCHES = [
  'Căn hộ dưới 3 tỷ',
  'Căn hộ 2PN',
  'Căn hộ 3PN',
  'Dự án mới mở bán',
  'Nhà phố',
  'Shophouse',
  'Biệt thự',
  'Đất nền',
  'Hỗ trợ vay ngân hàng',
  'Pháp lý dự án',
  'Tiến độ dự án',
  'So sánh dự án',
  'Căn hộ cho thuê',
  'Chung cư giá rẻ',
  'Bảng giá dự án',
  'Chính sách bán hàng',
  'Chiết khấu',
];

const ABOUT_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Giới thiệu', href: '/gioi-thieu' },
  { label: 'Chính sách bảo mật', href: '/chinh-sach-bao-mat' },
  { label: 'Điều khoản sử dụng', href: '/dieu-khoan-su-dung' },
  { label: 'Liên hệ chúng tôi', href: '/lien-he-chung-toi' },
];

/** Thanh dieu huong nganh tren cung footer - to nen dam hon de tach khoi cac
    cot ben duoi, hien thi nhanh cac lien ket chinh dang quan tam. */
// QUICK_LINKS da duoc go bo khoi footer (thang 09/2026) - khong can link
// nhanh dang thanh ngang vi Header da cung cap cac muc nay roi.

const BROKER_LINKS = [
  { label: 'Trở thành môi giới', href: '/tro-thanh-moi-gioi' },
  { label: 'Quỹ căn', href: '/quy-can' },
  { label: 'Đào tạo', href: '/dao-tao' },
  { label: 'Hướng dẫn sử dụng', href: '/huong-dan' },
  { label: 'Sự kiện', href: '/su-kien' },
  { label: 'Tin tức', href: '/tin-tuc' },
];

/** Nam sau nut "Xem thêm" cua cot "Danh cho moi gioi" - deu la route da co */
const BROKER_MORE_LINKS = [
  { label: 'So sánh chính sách', href: '/so-sanh-chinh-sach' },
  { label: 'Góp ý & phản hồi', href: '/gop-y-va-phan-hoi' },
];

const OTHER_LINKS = [
  { label: 'Yêu thích', href: '/yeu-thich' },
  { label: 'Tài khoản', href: '/tai-khoan' },
  { label: 'Thông báo', href: '/thong-bao' },
  { label: 'Tin nhắn', href: '/tin-nhan' },
  { label: 'So sánh dự án', href: '/so-sanh' },
  { label: 'Tiện ích', href: '/tien-ich' },
];

/** Nam sau nut "Xem thêm" cua cot "Thong tin khac" - deu la route da co */
const OTHER_MORE_LINKS = [
  { label: 'Tính năng', href: '/tinh-nang' },
  { label: 'Lịch âm', href: '/lich-am' },
];

/**
 * Link mang xa hoi that cua RealtyHub - lay tu fanpage/zalo chinh thuc.
 * Cap nhat khi co thay doi fanpage/zalo.
 */
const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    stat: 'Facebook',
    href: 'https://www.facebook.com/realtyhub.com.vn',
    color: '#1877F2',
    icon: <FaFacebookF aria-hidden />,
  },
  {
    label: 'YouTube',
    stat: 'YouTube',
    href: 'https://www.youtube.com/@realtyhubvietnam',
    color: '#FF0000',
    icon: <FaYoutube aria-hidden />,
  },
  {
    label: 'TikTok',
    stat: 'TikTok',
    href: 'https://www.tiktok.com/@realtyhubvietnam',
    color: '#111827',
    icon: <FaTiktok aria-hidden />,
  },
  { label: 'Zalo', stat: 'Zalo', href: 'https://zalo.me/0939653777', color: '#0068FF', icon: <SiZalo aria-hidden /> },
];

/** Website cung tap doan - logo lay tu trang chinh chu cua tung don vi. */
const GROUP_SITES = [
  {
    name: 'Đông Tây Land',
    note: 'A member of Dong Tay Group',
    href: 'https://dongtayland.vn',
    logo: '/images/home/logo-dong-tay-land.png',
    width: 131,
    height: 60,
  },
  {
    name: 'Le Palmier Hồ Tràm',
    note: 'Hotels & Resorts',
    href: 'https://lepalmier.vn',
    logo: '/images/home/logo-le-palmier.png',
    width: 114,
    height: 90,
  },
];

/** Thong tin dang ky doanh nghiep - lay tu giay phep, khong duoc tu doi. */
const COMPANY = {
  name: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ XHUB',
  license: '0312312011',
  firstRegistered: '09/2026',
  address: '192 Trần Não, Khu Phố 2, Phường An Khánh, Thành phố Hồ Chí Minh, Việt Nam',
  phone: '08.73087777',
  phoneHref: 'tel:+842873087777',
  email: 'info@realtyhub.com.vn',
  representative: 'Ông Nguyễn Thái Bình – Chủ Tịch Hội Đồng Quản Trị',
};

const SiteFooter = () => (
  <footer className="border-t border-gray-200 bg-white" data-clean-hide="footer">
    {/* ── Tu khoa tim nhieu ─────────────────────────────────────────────
        Dong khung thanh mot the rieng dat tren cung, tach han khoi cac cot
        lien ket ben duoi: day la dieu huong tim kiem, khong phai chan trang.

        Trong Clean Mode: an "tu khoa tim nhieu" - chi con giu cac cot lien
        ket toi thieu (chinh sach, lien he, ...). Marketing tag la phu,
        khong can thiet cho presentation. */}
    <div className="site-container pt-10">
      <section
        aria-labelledby="footer-popular"
        className="rounded-2xl border border-gray-200 bg-gray-25 px-5 py-5 md:px-7 md:py-6"
      >
        <h2
          id="footer-popular"
          className="mb-4 flex items-center gap-2.5 text-theme-sm font-bold uppercase tracking-wide text-navy-800"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-lg text-brand-500">
            <HiOutlineUserGroup aria-hidden />
          </span>
          Mọi người cùng tìm kiếm
        </h2>

        <ul className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((keyword) => (
            <li key={keyword}>
              <Link
                href={`/du-an?q=${encodeURIComponent(keyword)}`}
                className="inline-flex rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-theme-sm text-gray-600 transition hover:border-brand-300 hover:bg-brand-25 hover:text-brand-600"
              >
                {keyword}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>

    {/* ── Cac cot lien ket ──────────────────────────────────────────────
        Luoi 12 cot: 3 cho thuong hieu (du rong cho doan mo ta), 2 cho moi cot
        lien ket, 3 cho khoi tap doan. Moi cot PHAI tu khai bao span - thieu
        la roi ve 1/12 va nhan bi vo tung chu mot. */}
    <div className="site-container grid grid-cols-1 gap-x-8 gap-y-10 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12">
      <div className="sm:col-span-2 md:col-span-3 lg:col-span-3">
        {/* iPad: logo + mo ta ben trai, nut tai app ben phai cung hang.
            Mobile va desktop (cot thuong hieu hep) van xep doc. */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-10 lg:flex-col lg:gap-0">
          <div className="min-w-0 md:max-w-md">
            <Link href="/" aria-label="Trang chủ" className="mb-5 inline-block">
              <Image
                src="/images/home/logo-realtyhub.svg"
                alt="RealtyHub"
                width={180}
                height={46}
                className="h-11 w-auto"
              />
            </Link>

            <p className="max-w-sm text-theme-sm leading-relaxed text-gray-600 lg:mb-7">
              Nền tảng công nghệ dành riêng cho môi giới bất động sản, cung cấp
              thông tin dự án và công cụ hỗ trợ kinh doanh hiệu quả.
            </p>
          </div>

          <div className="mt-7 shrink-0 md:mt-0 lg:mt-0">
            <p className="mb-3 text-theme-sm font-bold uppercase tracking-wide text-navy-800">
              Tải ứng dụng
            </p>
            {/* Nen chan trang la mau trang nen huy hieu phai dung ban vien sang;
                ban den goc chi hop khi nen dam. */}
            <AppStoreBadges variant="light" />
          </div>
        </div>
      </div>

      {/* iPad: 3 cot link chia deu ca chieu ngang. Desktop: contents de
          tung cot vao luoi 12 nhu cu. */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:col-span-2 sm:grid-cols-2 md:col-span-3 md:grid-cols-3 lg:contents">
        <FooterLinkList title="Về Realty Hub" links={ABOUT_LINKS} className="lg:col-span-2" />
        <FooterLinkList
          title="Dành cho môi giới"
          links={BROKER_LINKS}
          moreLinks={BROKER_MORE_LINKS}
          className="lg:col-span-2"
        />
        <FooterLinkList
          title="Thông tin khác"
          links={OTHER_LINKS}
          moreLinks={OTHER_MORE_LINKS}
          className="lg:col-span-2"
        />
      </div>

      <div className="sm:col-span-2 md:col-span-3 lg:col-span-3">
        <FooterHeading>Website cùng tập đoàn</FooterHeading>
        {/* The logo: ghim chieu cao anh de hai logo khac ti le van thang hang,
            ten don vi chi con o `alt` va tooltip - de ca chu lan logo la doc
            hai lan cung mot thong tin. */}
        <ul className="mb-7 grid gap-3 sm:grid-cols-2">
          {GROUP_SITES.map((site) => (
            <li key={site.name}>
              <a
                href={site.href}
                target="_blank"
                rel="noreferrer noopener"
                title={`${site.name} - ${site.note}`}
                className="flex h-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-4 transition hover:border-brand-300 hover:shadow-card"
              >
                <Image
                  src={site.logo}
                  alt={site.name}
                  width={site.width}
                  height={site.height}
                  className="h-12 w-auto"
                />
              </a>
            </li>
          ))}
        </ul>

        {/* Ke ngang tach khoi doi tac voi khoi mang xa hoi, giong ban thiet ke */}
        <div className="mb-5 border-t border-gray-200" />

        {/* Icon vuong bo goc mang mau nhan dien cua tung nen tang, chu dat ben
            canh. Mau truyen qua bien CSS `--tone` chu khong ghep thang vao ten
            class: Tailwind quet class luc build nen `bg-${color}` ghep dong se
            khong bao gio duoc sinh ra CSS. */}
        <ul className="mb-6 grid grid-cols-4 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5">
          {SOCIAL_LINKS.map((social) => (
            <li key={social.label} className="sm:flex-1">
              <a
                href={social.href}
                aria-label={social.label}
                title={social.label}
                style={{ '--tone': social.color } as React.CSSProperties}
                className="group flex flex-col items-center gap-1.5 text-theme-sm text-gray-600 transition hover:text-(--tone) sm:flex-row sm:justify-start sm:gap-2"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-(--tone) text-sm text-white transition group-hover:scale-110 sm:h-6 sm:w-6 sm:text-xs">
                  {social.icon}
                </span>
                {social.stat}
              </a>
            </li>
          ))}
        </ul>

        <ul className="flex flex-wrap items-center gap-3">
          <li>
            <a
              href="#"
              aria-label="Đã thông báo Bộ Công Thương"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center rounded-md transition hover:opacity-80"
            >
              {/* Ghim chieu cao (h-13 = 52px), be ngang tu chay theo ti le:
                  hai huy hieu co ti le rat lech nhau (2.92 va 2.00) nen chi
                  co ghim chieu cao moi cho ra mot hang thang deu. */}
              <Image
                src="/images/home/Bo_Cong_Thuong.jpg"
                alt="Đã thông báo Bộ Công Thương"
                width={767}
                height={263}
                className="h-13 w-auto"
              />
            </a>
          </li>
          <li>
            <a
              href="#"
              aria-label="DMCA Protected"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center rounded-md transition hover:opacity-80"
            >
              <Image
                src="/images/home/DMCA.jpg"
                alt="DMCA Protected"
                width={200}
                height={90}
                className="h-12 w-auto"
              />
            </a>
          </li>
        </ul>
      </div>
    </div>

    {/* ── Thong tin dang ky doanh nghiep ───────────────────────────────
        Chay thanh doan van xuoi nhu ban thiet ke, khong ke bang: day la thong
        tin bat buoc theo luat, doc lien mach de hon la nhoi vao o. */}
    {/* `MobileBottomTabs` phu len day trang cho toi breakpoint lg - chua cho
        no bang margin, neu khong dong lien he cuoi cung bi thanh tab cat mat. */}
    <div className="mb-16 border-t border-gray-200 bg-gray-25 lg:mb-0">
      <div className="site-container space-y-1.5 py-6 text-theme-xs leading-relaxed text-gray-500">
        <p>
          © 2026.{' '}
          <span className="font-semibold uppercase text-gray-700">{COMPANY.name}.</span>{' '}
          GPĐKKD: {COMPANY.license}, thành lập vào tháng {COMPANY.firstRegistered}.
        </p>
        <p>Địa chỉ: {COMPANY.address}.</p>
        <p className="flex flex-wrap items-center gap-x-4">
          <span className="whitespace-nowrap">
            Điện thoại:{' '}
            <a href={COMPANY.phoneHref} className="transition hover:text-brand-600">
              {COMPANY.phone}
            </a>
          </span>
          <span className="whitespace-nowrap">
            Email:{' '}
            <a href={`mailto:${COMPANY.email}`} className="transition hover:text-brand-600">
              {COMPANY.email}
            </a>
          </span>
        </p>
        <p>
          Người đại diện theo pháp luật: {COMPANY.representative}.{' '}
          <Link
            href="/dieu-khoan-su-dung"
            className="font-semibold text-brand-600 transition hover:text-brand-700"
          >
            Xem chính sách sử dụng
          </Link>
        </p>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
