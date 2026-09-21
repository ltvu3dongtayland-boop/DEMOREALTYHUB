/**
 * Cac kieu du lieu nay la HOP DONG voi backend sau nay.
 * Khi lam API that, entity + DTO ben backend phai khop y het file nay,
 * va chi can doi than ham trong services/project.service.ts.
 */

/** Nhom du an - quyet dinh mau nhan tren anh card */
export type ProjectSegment = 'cao-tang' | 'thap-tang';

/** Trang thai ban hang */
export type ProjectStatus = 'tat-ca' | 'ban-chay' | 'da-ban-het' | 'da-ban-giao' | 'sap-mo-ban' | 'moi-mo-ban' | 'dang-mo-ban';

/** Loai hinh bat dong san */
export type ProjectPropertyType =
  | 'can-ho'
  | 'biet-thu'
  | 'nha-pho'
  | 'shophouse'
  | 'dat-nen';

/** Tien ich noi khu - loc dang nhieu lua chon */
export type ProjectAmenityTag =
  | 'be-boi'
  | 'cong-vien'
  | 'truong-hoc'
  | 'phong-gym'
  | 'khu-bbq'
  | 'san-the-thao'
  | 'trung-tam-thuong-mai'
  | 'ham-do-xe'
  | 'an-ninh-24-7'
  | 'khu-vui-choi';

/** Huong nhin dac trung cua du an - loc dang nhieu lua chon */
export type ProjectViewpoint =
  | 'view-bien'
  | 'view-song'
  | 'view-ho'
  | 'view-thanh-pho'
  | 'view-cong-vien'
  | 'view-nui';

/** Tinh trang phap ly */
export type ProjectLegal = 'so-lau-dai' | 'so-50-nam' | 'dang-hoan-thien';

export type Project = {
  publicId: string;
  slug: string;
  name: string;
  /** Cau mo ta ngan hien duoi ten tren card */
  tagline: string;
  /** Dia chi hien canh icon ghim */
  address: string;
  segment: ProjectSegment;
  status: ProjectStatus;
  propertyType: ProjectPropertyType;
  /** publicId cua chu dau tu */
  developerId: string;
  developerName: string;
  /** publicId cua khu vuc */
  regionId: string;
  regionName: string;
  /** URL anh bia. Rong => ProjectThumb tu sinh anh placeholder. */
  thumbnailUrl: string;
  /**
   * Bang anh cho the du an, phan tu dau trung voi `thumbnailUrl`.
   * Co tu 2 anh tro len thi the tu chuyen canh.
   */
  thumbnailUrls: string[];
  /** Link chi tiet du an (trang ngoai hoac noi bo) */
  detailUrl: string;
  isHot: boolean;
  publishedAt: string;

  // ── Cac truong phuc vu bang loc chi tiet ───────────────────────────────
  /** Gia thap nhat trong du an, don vi VND */
  priceFrom: number;
  /** Khoang dien tich san pham, m2 */
  areaFrom: number;
  areaTo: number;
  /** Cac muc so phong ngu co ban trong du an */
  bedroomOptions: number[];
  /** Quy mo toan du an, ha */
  scaleHa: number;
  /** Nam ban giao du kien */
  handoverYear: number;
  /** Toa do de ghim len ban do */
  latitude: number;
  longitude: number;
  amenityTags: ProjectAmenityTag[];
  viewpoints: ProjectViewpoint[];
  legal: ProjectLegal;
  /** Dang co chinh sach chiet khau */
  hasDiscount: boolean;
  /** Co ngan hang lien ket ho tro vay */
  hasBankSupport: boolean;
};

/** Mot lua chon trong cac o filter */
export type FilterOption = {
  value: string;
  label: string;
};

/** Tham so truy van danh sach du an */
export type ProjectQuery = {
  page: number;
  limit: number;
  search: string;
  developerId: string | null;
  regionId: string | null;
  propertyType: ProjectPropertyType | null;
  status: ProjectStatus | null;
  segment: ProjectSegment | null;
  /** Khoang gia, VND. null = khong gioi han dau do */
  priceMin: number | null;
  priceMax: number | null;
  /** Tran dien tich, m2: lay du an co san pham tu 0 den moc nay */
  areaMax: number | null;
  /** So phong ngu toi thieu; 5 mang nghia "5+" */
  bedrooms: number | null;
  /** Ban giao trong hoac truoc nam nay */
  handoverBefore: number | null;
  /** Du an phai co DU cac tien ich duoc chon */
  amenityTags: ProjectAmenityTag[];
  /** Du an chi can co MOT trong cac huong nhin duoc chon */
  viewpoints: ProjectViewpoint[];
  legal: ProjectLegal | null;
  hasDiscount: boolean;
  hasBankSupport: boolean;
  /** Chi lay du an dang trong N ngay gan day */
  postedWithinDays: number | null;
};

/**
 * Toan bo lua chon cho bang loc - mot lan goi duy nhat.
 * Danh sach lay tu du lieu that (chu dau tu, khu vuc, nam ban giao) nen bo loc
 * khong bao gio chao mot lua chon cho ra 0 ket qua.
 */
export type ProjectFilterOptions = {
  developers: FilterOption[];
  regions: FilterOption[];
  propertyTypes: FilterOption[];
  statuses: FilterOption[];
  segments: FilterOption[];
  amenityTags: FilterOption[];
  viewpoints: FilterOption[];
  legals: FilterOption[];
  handoverYears: number[];
};

/** Dang tra ve chuan cua danh sach - giong PaginatedBlogs ben backend */
export type PaginatedProjects = {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

/**
 * Du lieu khoi "Du an ban chay" duoi trang danh sach.
 *
 * Chi lay dung nhung truong khoi nay ve len: du an dung dau moi nhom hien
 * duoi dang the anh lon nen can `thumbnailUrl`. Day van la mot phep chieu
 * gon - dung tra ca ban ghi Project ve cho mot danh sach 5 dong.
 */
export type ProjectHighlightGroup = {
  key: string;
  title: string;
  projects: Pick<Project, 'publicId' | 'slug' | 'name' | 'thumbnailUrl'>[];
};

export const SEGMENT_LABELS: Record<ProjectSegment, string> = {
  'cao-tang': 'Dự án cao tầng',
  'thap-tang': 'Dự án thấp tầng',
};

/** SEGMENT_LABELS duoi dang danh sach lua chon - dung cho o loc "Loai du an" */
export const SEGMENT_FILTER_OPTIONS: FilterOption[] = (
  Object.keys(SEGMENT_LABELS) as ProjectSegment[]
).map((value) => ({ value, label: SEGMENT_LABELS[value] }));

/**
 * Ban rut gon cho nhan tren anh card.
 *
 * Tach rieng khoi SEGMENT_LABELS vi cung mot khai niem nhung hai chu canh: nhan
 * dan len anh can cang ngan cang tot, con tieu de khoi "Du an ban chay" va o loc
 * "Phan khuc" van phai doc thanh cau hoan chinh.
 */
export const SEGMENT_BADGE_LABELS: Record<ProjectSegment, string> = {
  'cao-tang': 'Cao tầng',
  'thap-tang': 'Thấp tầng',
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  'tat-ca': 'Tất cả',
  'ban-chay': 'Bán chạy',
  'da-ban-het': 'Đã bán hết',
  'da-ban-giao': 'Đã bàn giao',
  'sap-mo-ban': 'Sắp mở bán',
  'moi-mo-ban': 'Mới mở bán',
  'dang-mo-ban': 'Đang mở bán',
};

export const PROPERTY_TYPE_LABELS: Record<ProjectPropertyType, string> = {
  'can-ho': 'Căn hộ',
  'biet-thu': 'Biệt thự',
  'nha-pho': 'Nhà phố',
  shophouse: 'Shophouse',
  'dat-nen': 'Đất nền',
};

/** Loại hình rút gọn cho filter - chỉ Cao tầng / Thấp tầng */
export const PROPERTY_TYPE_SEGMENT_LABELS: Record<string, string> = {
  'cao-tang': 'Cao tầng',
  'thap-tang': 'Thấp tầng',
};

export const AMENITY_TAG_LABELS: Record<ProjectAmenityTag, string> = {
  'be-boi': 'Bể bơi',
  'cong-vien': 'Công viên nội khu',
  'truong-hoc': 'Trường học',
  'phong-gym': 'Phòng gym',
  'khu-bbq': 'Khu BBQ',
  'san-the-thao': 'Sân thể thao',
  'trung-tam-thuong-mai': 'Trung tâm thương mại',
  'ham-do-xe': 'Hầm để xe',
  'an-ninh-24-7': 'An ninh 24/7',
  'khu-vui-choi': 'Khu vui chơi trẻ em',
};

export const VIEWPOINT_LABELS: Record<ProjectViewpoint, string> = {
  'view-bien': 'View biển',
  'view-song': 'View sông',
  'view-ho': 'View hồ',
  'view-thanh-pho': 'View thành phố',
  'view-cong-vien': 'View công viên',
  'view-nui': 'View núi',
};

export const LEGAL_LABELS: Record<ProjectLegal, string> = {
  'so-lau-dai': 'Sổ hồng lâu dài',
  'so-50-nam': 'Sở hữu 50 năm',
  'dang-hoan-thien': 'Đang hoàn thiện pháp lý',
};

/**
 * Duong ray gia chay tu 0 den moc nay (VND); keo het co nghia la khong dat tran.
 * Chay lien tuc theo buoc 100 trieu chu khong theo mot day moc dinh san, de con
 * so nguoi dung go vao o nhap luon the hien dung duoc tren duong ray.
 */
export const PRICE_LIMIT = 30_000_000_000;
export const PRICE_STEP = 100_000_000;

/** Gia luu bang VND nhung nguoi dung go theo ty */
export const PRICE_SCALE = 1_000_000_000;

/** Duong ray dien tich chay tu 0 den moc nay; keo het co nghia la khong dat tran */
export const AREA_LIMIT = 500;

/** Buoc nhay khi keo thanh dien tich, m2 */
export const AREA_STEP = 10;

/** So phong ngu tren thanh chon nhanh; 5 hien thi la "5+" */
export const BEDROOM_STEPS = [1, 2, 3, 4, 5] as const;

/** Lua chon cho o "Thoi gian dang" */
export const POSTED_WITHIN_OPTIONS: { value: number; label: string }[] = [
  { value: 7, label: '7 ngày qua' },
  { value: 30, label: '30 ngày qua' },
  { value: 90, label: '90 ngày qua' },
];

/** Doi so tien VND thanh chuoi ngan gon: 1.5 ty, 850 trieu */
export const formatPriceShort = (value: number): string => {
  if (value >= 1_000_000_000) {
    const billions = value / 1_000_000_000;
    return `${Number.isInteger(billions) ? billions : billions.toFixed(1)} tỷ`;
  }
  return `${Math.round(value / 1_000_000)} triệu`;
};

export const DEFAULT_PROJECT_QUERY: ProjectQuery = {
  page: 1,
  limit: 12,
  search: '',
  developerId: null,
  regionId: null,
  propertyType: null,
  status: null,
  segment: null,
  priceMin: null,
  priceMax: null,
  areaMax: null,
  bedrooms: null,
  handoverBefore: null,
  amenityTags: [],
  viewpoints: [],
  legal: null,
  hasDiscount: false,
  hasBankSupport: false,
  postedWithinDays: null,
};
