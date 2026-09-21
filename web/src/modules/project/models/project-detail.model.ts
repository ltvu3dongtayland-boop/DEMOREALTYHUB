/**
 * HOP DONG trang chi tiet du an.
 *
 * Moi tab tren thiet ke tuong ung mot nhanh du lieu trong `ProjectDetail`.
 * Khi backend co module `projects`, entity + DTO phai khop y het file nay va
 * chi than ham trong services/project.service.ts phai doi.
 *
 * Quy uoc tien: MOI truong gia deu la VND dang so nguyen. Khong dinh dang o
 * day - dung cac ham trong common/utils/format.ts khi render.
 */
import type { NewsArticle } from '@/modules/news/models/news.model';
import type { Project } from './project.model';

/** Thu tu tab dung y thiet ke, cung la thu tu hien tren thanh dieu huong */
export const PROJECT_DETAIL_TABS = [
  { key: 'tong-quan', label: 'Tổng quan' },
  { key: 'vi-tri', label: 'Vị trí' },
  { key: 'phan-khu', label: 'Phân khu' },
  { key: 'mat-bang-quy-can', label: 'Vị trí quỹ căn' },
  { key: 'quy-can', label: 'Quỹ căn' },
  { key: 'anh-360', label: 'Camera 360°' },
  { key: 'phan-tich', label: 'Phân tích' },
  { key: 'chinh-sach-ban-hang', label: 'Chính sách bán hàng' },
  { key: 'dao-tao', label: 'Đào tạo' },
  { key: 'tien-do', label: 'Tiến độ' },
  { key: 'tai-lieu', label: 'Tài liệu' },
  { key: 'tin-tuc', label: 'Tin tức' },
] as const;

export type ProjectDetailTab = (typeof PROJECT_DETAIL_TABS)[number];
export type ProjectDetailTabKey = ProjectDetailTab['key'];

export const DEFAULT_TAB: ProjectDetailTabKey = 'tong-quan';

/** Doc tham so ?tab= tu URL, tra ve tab mac dinh neu gia tri la rac */
export const parseTabKey = (value: string | null): ProjectDetailTabKey =>
  PROJECT_DETAIL_TABS.some((tab) => tab.key === value)
    ? (value as ProjectDetailTabKey)
    : DEFAULT_TAB;

// ── Tab: Tong quan ─────────────────────────────────────────────────────────

/** Mot slide trong bang hero dau trang */
export type MediaSlide = {
  publicId: string;
  imageUrl: string;
  caption: string;
};

/** The so lieu noi bat: quy mo, tong von, dan so */
export type ProjectStat = {
  key: 'scale' | 'capital' | 'population';
  label: string;
  value: string;
};

/** Mot dong trong khoi "Tong quan du an" */
export type ProjectSpec = {
  label: string;
  value: string;
};

/** Mot ban ve mat bang - nguoi dung chon qua cac nut pill */
export type MasterPlanSheet = {
  key: string;
  label: string;
  imageUrl: string;
};

/** The trong bang chuyen "San pham" */
export type ProjectProduct = {
  publicId: string;
  name: string;
  areaLabel: string;
  imageUrl: string;
};

/** O anh trong bang chuyen "Tien ich" */
export type ProjectAmenity = {
  publicId: string;
  name: string;
  imageUrl: string;
};

/** Khoi chu + video dung chung cho "Gioi thieu du an" va khoi ket */
export type ProjectStorySection = {
  title: string;
  body: string;
  videoThumbnailUrl: string;
  videoUrl: string;
};

/** The chuyen vien tu van o cuoi tab Tong quan */
export type ProjectConsultant = {
  publicId: string;
  role: string;
  name: string;
  phone: string;
};

// ── Tab: Vi tri ────────────────────────────────────────────────────────────

export type LocationIcon = 'train' | 'car' | 'plane' | 'globe' | 'ship' | 'rocket';

/** Mot gach dau dong ket noi vung: "23 phut toi Ha Noi: ..." */
export type LocationHighlight = {
  publicId: string;
  icon: LocationIcon;
  title: string;
  description: string;
};

export type ProjectLocation = {
  bannerUrl: string;
  headline: string;
  intro: string;
  highlights: LocationHighlight[];
  closing: string;
  /** Toa do dung cho ban do nhung */
  latitude: number;
  longitude: number;
  mapLabel: string;
};

// ── Tab: Phan khu ──────────────────────────────────────────────────────────

export type ProjectPhase = {
  publicId: string;
  slug: string;
  name: string;
  imageUrl: string;
  totalUnits: number;
  priceFrom: number;
  priceTo: number;

  // Cac truong duoi day chi dung o trang chi tiet phan khu, the phan khu tren
  // tab "Phan khu" khong doc toi.
  /** Cau tieu de lon phia tren doan mo ta */
  headline: string;
  description: string;
  /** Bang "Thong tin chung" */
  specs: ProjectSpec[];
  /** Cac ban ve mat bang lon xep doc duoi phan mo ta */
  masterPlanImages: MediaSlide[];
};

/** Muc trong thanh chuyen nhanh giua cac phan khu */
export type PhaseSummary = {
  publicId: string;
  slug: string;
  name: string;
};

/** Thu tu tab tren trang chi tiet phan khu - it hon trang du an */
export const PHASE_DETAIL_TABS = [
  { key: 'tong-quan', label: 'Tổng quan' },
  { key: 'vi-tri', label: 'Vị trí' },
  { key: 'mat-bang-quy-can', label: 'Vị trí quỹ căn' },
  { key: 'quy-can', label: 'Quỹ căn' },
  { key: 'chinh-sach-ban-hang', label: 'Chính sách bán hàng' },
] as const;

export type PhaseDetailTabKey = (typeof PHASE_DETAIL_TABS)[number]['key'];

export const DEFAULT_PHASE_TAB: PhaseDetailTabKey = 'tong-quan';

export const parsePhaseTabKey = (value: string | null): PhaseDetailTabKey =>
  PHASE_DETAIL_TABS.some((tab) => tab.key === value)
    ? (value as PhaseDetailTabKey)
    : DEFAULT_PHASE_TAB;

/**
 * Du lieu mot trang chi tiet phan khu.
 *
 * Vi tri, chinh sach ban hang dung chung voi du an cha nen duoc chep vao day
 * thay vi bat trang goi them mot lan nua. `planMap` da loc san chi con pin cua
 * phan khu nay. Bang hang van di qua `ProjectService.units` voi `phaseName`.
 */
export type PhaseDetail = {
  phase: ProjectPhase;
  projectSlug: string;
  projectName: string;
  siblings: PhaseSummary[];
  location: ProjectLocation;
  planMap: MasterPlanMap;
  salesPolicy: SalesPolicy;
};

// ── Tab: Mat bang quy can ──────────────────────────────────────────────────

/** Nhom quy hang - quyet dinh mau pin tren ban do mat bang */
export type UnitFundType = 'doc-quyen' | 'an-cheo' | 'thuong';

export const UNIT_FUND_LABELS: Record<UnitFundType, string> = {
  'doc-quyen': 'HOT',
  'an-cheo': 'Chung',
  thuong: 'Ẩn',
};

/** Mot pin gia gan tren anh mat bang */
export type PlanMarker = {
  publicId: string;
  code: string;
  price: number;
  fundType: UnitFundType;
  phaseName: string;
  propertyTypeLabel: string;
  landArea: number;
  status: UnitStatus;
  /** Vi tri tren anh, don vi % tinh tu goc tren-trai */
  x: number;
  y: number;
};

/**
 * Ban do mat bang = mot anh nen + cac pin gia.
 *
 * `width`/`height` la he toa do quy uoc cho Leaflet (CRS.Simple), khong phai
 * pixel that cua anh - chi ti le giua chung mo phong khung anh la du.
 */
export type MasterPlanMap = {
  imageUrl: string;
  width: number;
  height: number;
  markers: PlanMarker[];
};

// ── Tab: Quy can ───────────────────────────────────────────────────────────

export type UnitStatus = 'con-hang' | 'giu-cho' | 'da-ban';

export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  'con-hang': 'Còn hàng',
  'giu-cho': 'Giữ chỗ',
  'da-ban': 'Đã bán',
};

export type ProjectUnit = {
  publicId: string;
  code: string;
  /**
   * Loai quy hang cua can: quy doc quyen (HOT) / an cheo / thuong.
   * Duoc sinh deterministic trong mock va di cung tung can - day la co so de
   * the "Sản phẩm nổi bật" gan nhan HOT len cac can doc quyen.
   */
  fundType: UnitFundType;
  /** Gia niem yet */
  listedPrice: number;
  /** Gia thanh toan som */
  netPrice: number;
  /** Gia full VAT (bao gom thue VAT) */
  fullVatPrice?: number;
  /** Don gia tren m2 dat */
  unitPrice: number;
  propertyTypeLabel: string;
  direction: string;
  landArea: number;
  buildArea: number;
  phaseName: string;
  status: UnitStatus;

  /**
   * Truc can - cot can trong mot toa/day (VD: '01', '07').
   *
   * Moi gioi hay hoi "con truc 05 khong?" vi cac can cung truc co cung view va
   * cung mat bang, nen day la mot o loc rieng chu khong phai suy ra tu ma can.
   */
  unitLine?: string;

  // Thông tin bổ sung cho popup chi tiết
  /** Tầng (VD: 12, 15-20) */
  floor?: string;
  /** Số phòng ngủ */
  bedrooms?: number;
  /** Số toilet */
  toilets?: number;
  /** Số tầng (cho biệt thự/nhà phố) */
  floors?: number;
  /** Thông tin vay ngân hàng: lãi suất ưu đãi */
  loanRate?: string;
  /** Thông tin vay ngân hàng: thời hạn vay */
  loanTerm?: string;
  /** Chính sách bán hàng: chiết khấu */
  discount?: string;
  /** Chính sách bán hàng: quà tặng */
  gift?: string;
  /** Ngày bàn giao dự kiến (ISO hoặc Q1/2025) */
  handoverDate?: string;
  /** Tình trạng bàn giao */
  handoverStatus?: string;
};

export type UnitSort =
  | 'mac-dinh'
  | 'gia-tang'
  | 'gia-giam'
  | 'dien-tich-tang'
  | 'dien-tich-giam';

export const UNIT_SORT_LABELS: Record<UnitSort, string> = {
  'mac-dinh': 'Mặc định',
  'gia-tang': 'Giá thấp đến cao',
  'gia-giam': 'Giá cao đến thấp',
  'dien-tich-tang': 'Diện tích nhỏ đến lớn',
  'dien-tich-giam': 'Diện tích lớn đến nhỏ',
};

const COMPASS_DIRECTIONS = [
  'BẮC',
  'ĐÔNG',
  'ĐÔNG BẮC',
  'ĐÔNG NAM',
  'NAM',
  'TÂY',
  'TÂY BẮC',
  'TÂY NAM',
] as const;

/** Nhom huong phong thuy. Value dung slug de URL on dinh, khong bi lech khi doc lai. */
export const DIRECTION_GROUPS = {
  'dong-tu-trach': ['ĐÔNG', 'ĐÔNG NAM', 'NAM', 'BẮC'],
  'tay-tu-trach': ['TÂY', 'TÂY NAM', 'TÂY BẮC', 'ĐÔNG BẮC'],
  'ĐÔNG TỨ TRẠCH': ['ĐÔNG', 'ĐÔNG NAM', 'NAM', 'BẮC'],
  'TÂY TỨ TRẠCH': ['TÂY', 'TÂY NAM', 'TÂY BẮC', 'ĐÔNG BẮC'],
} as const;

export const DIRECTION_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'dong-tu-trach', label: 'ĐÔNG TỨ TRẠCH' },
  { value: 'tay-tu-trach', label: 'TÂY TỨ TRẠCH' },
  ...COMPASS_DIRECTIONS.map((name) => ({ value: name, label: name })),
];

const normalizeDirection = (value: string) => value.trim().toLocaleUpperCase('vi');

/** Khop huong don le hoac nhom Dong/Tay Tu Trach. */
export const matchesDirection = (unitDirection: string, selected: string | null) => {
  if (!selected) return true;
  const unit = normalizeDirection(unitDirection);
  if (unit === normalizeDirection(selected)) return true;
  const members = DIRECTION_GROUPS[selected as keyof typeof DIRECTION_GROUPS];
  if (!members) return false;
  return (members as readonly string[]).includes(unit);
};

export type UnitQuery = {
  page: number;
  limit: number;
  sort: UnitSort;
  phaseName: string | null;
  propertyTypeLabel: string | null;
  direction: string | null;
  status: UnitStatus | null;
};

export const DEFAULT_UNIT_QUERY: UnitQuery = {
  page: 1,
  limit: 24,
  sort: 'mac-dinh',
  phaseName: null,
  propertyTypeLabel: null,
  direction: null,
  status: null,
};

export type PaginatedUnits = {
  units: ProjectUnit[];
  total: number;
  page: number;
  limit: number;
  /** Cac gia tri co that trong bang hang - do bo loc len tu day, khong hard-code */
  facets: {
    phaseNames: string[];
    propertyTypeLabels: string[];
    directions: string[];
  };
};

/** So can toi da duoc chon mot luc de mang sang trang so sanh */
export const MAX_UNIT_SELECTION = 5;

/**
 * Truy van quy can tong hop (tat ca du an).
 *
 * Tuong tu `UnitQuery` nhung khong co `phaseName` (moi du an co phan khu rieng,
 * khong gop chung duoc) va them cac bo loc ngang hang du an: projectSlug,
 * developerId, regionId. Trang /quy-can dung query nay.
 */
/**
 * Khoang tang - gom tang le thanh vai nhom cho de bam.
 *
 * `floor` cua can la chuoi ('12', co the la '15-20' voi nha pho nhieu tang),
 * nen viec khop do matchesFloorRange lam, khong so sanh so truc tiep.
 */
export const FLOOR_RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: '1-5', label: 'Tầng 1 - 5' },
  { value: '6-10', label: 'Tầng 6 - 10' },
  { value: '11-15', label: 'Tầng 11 - 15' },
  { value: '16-20', label: 'Tầng 16 - 20' },
  { value: '21-30', label: 'Tầng 21 - 30' },
  { value: '31+', label: 'Tầng 31 trở lên' },
];

/** So tang dau tien doc duoc trong chuoi `floor` - '15-20' lay 15. */
const firstFloorNumber = (floor: string | undefined): number | null => {
  if (!floor) return null;
  const matchedNumber = floor.match(/\d+/);
  return matchedNumber ? Number(matchedNumber[0]) : null;
};

/** Can co nam trong khoang tang dang chon khong. Can khong ghi tang thi bi loai. */
export const matchesFloorRange = (
  floor: string | undefined,
  selected: string | null,
): boolean => {
  if (!selected) return true;
  const value = firstFloorNumber(floor);
  if (value === null) return false;

  if (selected.endsWith('+')) return value >= Number(selected.slice(0, -1));

  const [from, to] = selected.split('-').map(Number);
  return value >= from && value <= to;
};

export type AllUnitsQuery = {
  page: number;
  limit: number;
  sort: UnitSort;
  search: string;
  projectSlug: string | null;
  developerId: string | null;
  regionId: string | null;
  /** Loai du an cua du an chua can: 'cao-tang' | 'thap-tang' */
  segment: string | null;
  propertyTypeLabel: string | null;
  phaseName: string | null;
  direction: string | null;
  status: UnitStatus | null;
  /** Mot gia tri trong FLOOR_RANGE_OPTIONS */
  floorRange: string | null;
  /** Ma can - khop mot phan, khong phan biet hoa thuong */
  code: string | null;
  /** Truc can - khop chinh xac */
  unitLine: string | null;
  /** Loc theo khoang gia (VND) */
  priceMin: number | null;
  priceMax: number | null;
  /** Loc theo dien tich dat toi da (m2) */
  areaMax: number | null;
};

export const DEFAULT_ALL_UNITS_QUERY: AllUnitsQuery = {
  page: 1,
  limit: 24,
  sort: 'mac-dinh',
  search: '',
  projectSlug: null,
  developerId: null,
  regionId: null,
  segment: null,
  propertyTypeLabel: null,
  phaseName: null,
  direction: null,
  status: null,
  floorRange: null,
  code: null,
  unitLine: null,
  priceMin: null,
  priceMax: null,
  areaMax: null,
};

export type PaginatedAllUnits = {
  units: UnitWithProject[];
  total: number;
  page: number;
  limit: number;
  /** Facet dua tren TOAN BO can (khong chi trang hien tai) de bo loc co lua
      chon on dinh giua cac lan chuyen trang. */
  facets: {
    projectSlugs: { value: string; label: string }[];
    developerIds: { value: string; label: string }[];
    regionIds: { value: string; label: string }[];
    segments: { value: string; label: string }[];
    propertyTypeLabels: string[];
    phaseNames: string[];
    directions: string[];
    statuses: UnitStatus[];
    /** Chi cac khoang tang thuc su co can - tranh bam vao o rong */
    floorRanges: { value: string; label: string }[];
    unitLines: string[];
  };
};

/**
 * Can + metadata du an di kem.
 *
 * Dung cho cac cho can hien can cua nhieu du an tren cung mot trang (vi du
 * trang chu): card se can ten du an, chu dau tu, segment... ma khong can
 * service phai join them mot lan nua.
 *
 * `thumbnailUrls` lay luon tu du an de card can co the dung carousel anh
 * (giong ProjectCard) ma khong can service phai query them.
 */
export type UnitWithProject = ProjectUnit & {
  projectSlug: string;
  projectName: string;
  developerName: string;
  segment: Project['segment'];
  propertyType: Project['propertyType'];
  projectIsHot: boolean;
  thumbnailUrls: string[];
};

// ── Tab: Anh 360 ───────────────────────────────────────────────────────────

export type PanoramaHotspot = {
  publicId: string;
  label: string;
  /** Vi tri tuong doi trong khung anh, don vi % */
  x: number;
  y: number;
};

export type Panorama = {
  publicId: string;
  title: string;
  imageUrl: string;
  hotspots: PanoramaHotspot[];
};

// ── Tab: Dao tao ───────────────────────────────────────────────────────────

export type ProjectVideo = {
  publicId: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
};

// ── Tab: Chinh sach ban hang ───────────────────────────────────────────────

/** Muc chiet khau theo moc thoi gian thanh toan som */
export type PolicyDiscount = {
  publicId: string;
  label: string;
  percent: string;
};

/** O quyen loi: HTLS tran, dam bao lai suat, mien phi quan ly... */
export type PolicyPerk = {
  publicId: string;
  title: string;
  value: string;
  unit: string;
  note: string;
};

/** Bang ho tro lai suat: cot la ky han, dong la ty le vay */
export type InterestSchedule = {
  publicId: string;
  title: string;
  terms: string[];
  rows: {
    publicId: string;
    label: string;
    note: string;
    values: string[];
  }[];
};

export type LoyaltyTier = {
  publicId: string;
  name: string;
  percent: string;
};

export type PaymentPlan = {
  publicId: string;
  name: string;
  steps: { publicId: string; label: string; note: string; value: string }[];
};

export type SalesPolicy = {
  headline: string;
  discountTitle: string;
  discounts: PolicyDiscount[];
  perks: PolicyPerk[];
  interestSchedules: InterestSchedule[];
  loyalty: { title: string; note: string; tiers: LoyaltyTier[] };
  payment: { title: string; plans: PaymentPlan[] };
};

// ── Tab: Tien do ───────────────────────────────────────────────────────────

export type ProgressMilestone = {
  publicId: string;
  label: string;
  /** ISO. Moc dau tien co the la moc thang nen `label` moi la thu hien ra */
  date: string;
  videoThumbnailUrl: string;
  videoUrl: string;
  images: string[];
};

// ── Tab: Tai lieu ──────────────────────────────────────────────────────────

export type ProjectDocument = {
  publicId: string;
  order: number;
  name: string;
  url: string;
};

// ── Ghep tat ca ────────────────────────────────────────────────────────────

/**
 * Toan bo du lieu mot trang chi tiet.
 *
 * `quy-can` KHONG nam trong day: bang hang co the len hang nghin dong nen di
 * qua endpoint phan trang rieng (`ProjectService.units`).
 */
export type ProjectDetail = Project & {
  description: string;
  hero: MediaSlide[];
  stats: ProjectStat[];
  specs: ProjectSpec[];
  overviewImageUrl: string;
  masterPlan: MasterPlanSheet[];
  products: ProjectProduct[];
  intro: ProjectStorySection;
  amenities: ProjectAmenity[];
  closing: ProjectStorySection;
  consultants: ProjectConsultant[];
  location: ProjectLocation;
  phases: ProjectPhase[];
  planMap: MasterPlanMap;
  panoramas: Panorama[];
  trainingVideos: ProjectVideo[];
  salesPolicy: SalesPolicy;
  progress: ProgressMilestone[];
  documents: ProjectDocument[];
  news: NewsArticle[];
};
