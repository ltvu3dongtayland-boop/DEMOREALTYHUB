'use client';

/**
 * Logo chu dau tu dung o hang loc - DUNG CHUNG anh voi trang /chu-dau-tu.
 *
 * Anh lay tu `Investor.logo` (investors.mock.ts, 25 chu dau tu chinh thuc),
 * dung cach ve nhu card o /chu-dau-tu: <img> object-contain, khong cat anh -
 * logo moi hang mot ty le khac nhau, cat la hong ngay.
 *
 * Khong dung next/image: logo nho, so luong it, va Next se phai proxy anh
 * ngoai realtyhub.com.vn cho mot thu 28px - khong dang.
 */
type DeveloperLogoProps = {
  /** Ten chu dau tu - dung lam alt */
  name: string;
  /** URL logo (absolute tu realtyhub.com.vn hoac duong dan local) */
  logo: string;
  /** sm cho hang chip, md cho o trong bang loc */
  size?: 'sm' | 'md';
};

const DeveloperLogo = ({ name, logo, size = 'sm' }: DeveloperLogoProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={logo}
    alt={name}
    loading="lazy"
    width={160}
    height={64}
    // Man hinh cang hep, o chua logo cang nho - logo phai thu theo, neu khong
    // no cham sat hai mep o va hang logo trong nhu bi nhoi chu
    className={`w-auto max-w-full object-contain ${
      size === 'sm' ? 'max-h-4 sm:max-h-6 md:max-h-7' : 'max-h-6 sm:max-h-9 md:max-h-10'
    }`}
  />
);

export default DeveloperLogo;
