/**
 * Du lieu mau de dung FE truoc khi co API.
 * Ten du an, chu dau tu, mo ta deu la hu cau.
 *
 * Noi dung nam trong projects.seed.json - cung file ma
 * scripts/generate-mock-images.mjs doc de sinh anh, nen anh va du lieu
 * khong bao gio lech slug.
 *
 * Khi backend san sang: xoa thu muc mocks/, khong sua file nao khac ngoai
 * services/project.service.ts.
 */
import seedData from './projects.seed.json';
import {
  AMENITY_TAG_LABELS,
  VIEWPOINT_LABELS,
  type FilterOption,
  type Project,
  type ProjectAmenityTag,
  type ProjectLegal,
  type ProjectPropertyType,
  type ProjectSegment,
  type ProjectStatus,
  type ProjectViewpoint,
} from '../models/project.model';

export const MOCK_DEVELOPERS: FilterOption[] = [
  { value: 'cdt-an-khang', label: 'Tập đoàn An Khang' },
  { value: 'cdt-bao-minh', label: 'Bảo Minh Group' },
  { value: 'cdt-dong-duong', label: 'Đông Dương Land' },
  { value: 'cdt-thai-binh-duong', label: 'Thái Bình Dương Holdings' },
  { value: 'cdt-truong-son', label: 'Trường Sơn Invest' },
  // Chu dau tu CO THAT - chi dung cho du an that Vinhomes Ocean Park (index 5)
  { value: 'cdt-vingroup', label: 'Vingroup' },
  // Chu dau tu CO THAT - Sun Group (index 6)
  { value: 'cdt-sun-group', label: 'Sun Group' },
  // Chu dau tu CO THAT - MIK Group (index 7) - Imperia Green Paradise
  { value: 'cdt-mik-group', label: 'MIK Group' },
];

// Sau khong doi thu tu 6 muc dau: projects.seed.json tro toi khu vuc bang chi
// so, dao cho la moi du an nhay sang tinh khac.
export const MOCK_REGIONS: FilterOption[] = [
  { value: 'kv-ha-noi', label: 'Hà Nội' },
  { value: 'kv-hcm', label: 'TP. Hồ Chí Minh' },
  { value: 'kv-da-nang', label: 'Đà Nẵng' },
  { value: 'kv-hung-yen', label: 'Hưng Yên' },
  { value: 'kv-quang-ninh', label: 'Quảng Ninh' },
  { value: 'kv-hai-phong', label: 'Hải Phòng' },
  { value: 'kv-long-an', label: 'Long An' },
  { value: 'kv-ba-ria-vung-tau', label: 'Bà Rịa – Vũng Tàu' },
  { value: 'kv-dong-nai', label: 'Đồng Nai' },
  { value: 'kv-khanh-hoa', label: 'Khánh Hòa' },
  { value: 'kv-kien-giang', label: 'Kiên Giang' },
  { value: 'kv-binh-duong', label: 'Bình Dương' },
  { value: 'kv-quang-ngai', label: 'Quảng Ngãi' },
];

/** Chip Khu vực trên /du-an: Bắc / Trung / Nam thay cho danh sach tinh */
export const MACRO_REGIONS: FilterOption[] = [
  { value: 'kv-bac', label: 'Bắc' },
  { value: 'kv-trung', label: 'Trung' },
  { value: 'kv-nam', label: 'Nam' },
];

const NORTH_REGION_IDS = new Set([
  'kv-ha-noi',
  'kv-hung-yen',
  'kv-quang-ninh',
  'kv-hai-phong',
]);
const CENTRAL_REGION_IDS = new Set([
  'kv-da-nang',
  'kv-khanh-hoa',
  'kv-quang-ngai',
]);
const SOUTH_REGION_IDS = new Set([
  'kv-hcm',
  'kv-long-an',
  'kv-ba-ria-vung-tau',
  'kv-dong-nai',
  'kv-kien-giang',
  'kv-binh-duong',
]);

const zoneOfRegion = (regionId: string): string | null => {
  if (NORTH_REGION_IDS.has(regionId)) return 'kv-bac';
  if (CENTRAL_REGION_IDS.has(regionId)) return 'kv-trung';
  if (SOUTH_REGION_IDS.has(regionId)) return 'kv-nam';
  return null;
};

/** Loc du an theo chip Bắc/Trung/Nam, van chap nhan regionId tinh cu neu co tren URL */
export const matchesRegionFilter = (
  projectRegionId: string,
  queryRegionId: string | null,
): boolean => {
  if (!queryRegionId) return true;
  if (projectRegionId === queryRegionId) return true;
  return zoneOfRegion(projectRegionId) === queryRegionId;
};

type Seed = {
  slug: string;
  name: string;
  tagline: string;
  address: string;
  segment: ProjectSegment;
  status: ProjectStatus;
  propertyType: ProjectPropertyType;
  developerIndex: number;
  regionIndex: number;
  isHot: boolean;
};

const SEEDS = seedData as Seed[];

// ── Sinh cac truong phuc vu bang loc ───────────────────────────────────────
// projects.seed.json chi mo ta phan "bien tap" cua du an. Gia, dien tich,
// tien ich... duoc suy ra tu slug bang bo sinh co hat giong: cung mot slug
// luon cho cung mot ket qua, nen server va client render giong nhau va so
// lieu khong nhay moi lan tai lai.

/** mulberry32 - nho, du deu, va quan trong nhat la lap lai duoc */
const createRng = (seed: string) => {
  let hash = 1779033703 ^ seed.length;
  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  let state = hash >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

type Rng = () => number;

const intBetween = (rng: Rng, min: number, max: number) =>
  min + Math.floor(rng() * (max - min + 1));

const pickOne = <T,>(rng: Rng, list: readonly T[]): T =>
  list[Math.floor(rng() * list.length)];

/** Chon ngau nhien `count` phan tu khac nhau, giu nguyen thu tu goc cua pool */
const pickSome = <T,>(rng: Rng, pool: readonly T[], count: number): T[] => {
  const indexes = pool.map((_, index) => index);
  for (let i = indexes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  return indexes
    .slice(0, count)
    .sort((a, b) => a - b)
    .map((index) => pool[index]);
};

const AMENITY_TAG_KEYS = Object.keys(AMENITY_TAG_LABELS) as ProjectAmenityTag[];
const VIEWPOINT_KEYS = Object.keys(VIEWPOINT_LABELS) as ProjectViewpoint[];

/**
 * Moi loai hinh co mot mat bang gia va dien tich rieng - can ho khong the
 * cung khung voi biet thu, neu khong bo loc gia se vo nghia.
 * [giaMin, giaMax] tinh theo VND, [dtMin, dtMax] theo m2.
 */
const PROFILE: Record<
  ProjectPropertyType,
  { price: [number, number]; area: [number, number]; bedrooms: number[] }
> = {
  'can-ho': { price: [1_200_000_000, 6_500_000_000], area: [45, 120], bedrooms: [1, 2, 3] },
  'biet-thu': { price: [8_000_000_000, 28_000_000_000], area: [180, 450], bedrooms: [3, 4, 5] },
  'nha-pho': { price: [5_000_000_000, 14_000_000_000], area: [90, 200], bedrooms: [3, 4] },
  shophouse: { price: [7_000_000_000, 20_000_000_000], area: [100, 250], bedrooms: [2, 3, 4] },
  'dat-nen': { price: [1_800_000_000, 9_000_000_000], area: [80, 300], bedrooms: [] },
};

const LEGAL_BY_STATUS: Record<ProjectStatus, ProjectLegal[]> = {
  'dang-mo-ban': ['so-lau-dai', 'so-50-nam'],
  'sap-mo-ban': ['dang-hoan-thien', 'so-lau-dai'],
  'da-ban-giao': ['so-lau-dai'],
  'moi-mo-ban': ['so-50-nam', 'dang-hoan-thien'],
  'da-ban-het': ['so-lau-dai'],
  'ban-chay': ['so-lau-dai', 'so-50-nam'],
  'tat-ca': ['so-lau-dai', 'so-50-nam', 'dang-hoan-thien'],
};

/**
 * Tam khu vuc that, de ghim ban do roi dung cho tinh/thanh.
 * Toa do tung du an = tam khu vuc + mot do lech nho suy tu slug, nen cac ghim
 * khong chong len nhau ma van nam trong dia ban.
 */
const REGION_CENTER: Record<string, [number, number]> = {
  'kv-ha-noi': [21.0278, 105.8342],
  'kv-hcm': [10.7769, 106.7009],
  'kv-da-nang': [16.0544, 108.2022],
  'kv-hung-yen': [20.6464, 106.0511],
  'kv-quang-ninh': [20.9599, 107.0448],
  'kv-hai-phong': [20.8449, 106.6881],
  'kv-long-an': [10.6086, 106.4231],
  'kv-ba-ria-vung-tau': [10.4114, 107.1362],
  'kv-dong-nai': [10.7546, 106.8967],
  'kv-khanh-hoa': [12.2388, 109.1967],
  'kv-kien-giang': [10.2270, 103.9670],
  'kv-binh-duong': [11.0686, 106.7261],
  'kv-quang-ngai': [15.1214, 108.8044],
};

/** Do lech toi da quanh tam khu vuc, do - khoang 9 km */
const REGION_SPREAD = 0.08;

/** Nam ban giao bam theo trang thai ban hang cho hop ly */
const HANDOVER_BY_STATUS: Record<ProjectStatus, [number, number]> = {
  'dang-mo-ban': [2027, 2029],
  'sap-mo-ban': [2029, 2031],
  'da-ban-giao': [2023, 2026],
  'moi-mo-ban': [2026, 2028],
  'da-ban-het': [2020, 2023],
  'ban-chay': [2025, 2027],
  'tat-ca': [2020, 2031],
};

/**
 * Bang anh cho the du an.
 *
 * Anh mock chi co MOT tam moi du an (public/images/projects/<slug>.jpg), nen
 * bang anh duoc ghep tu chinh anh cua cac du an ke ben trong CUNG phan khuc:
 * cao tang muon anh cao tang, thap tang muon anh thap tang. Cach nay khong
 * them file nao vao repo ma van du anh de chuyen canh.
 *
 * Khi backend co module upload, thay ham nay bang danh sach anh that cua du an.
 */
const GALLERY_SIZE = 3;

const SLUGS_BY_SEGMENT: Record<ProjectSegment, string[]> = {
  'cao-tang': SEEDS.filter((seed) => seed.segment === 'cao-tang').map((s) => s.slug),
  'thap-tang': SEEDS.filter((seed) => seed.segment === 'thap-tang').map((s) => s.slug),
};

const galleryFor = (seed: Seed): string[] => {
  const pool = SLUGS_BY_SEGMENT[seed.segment];
  const start = Math.max(0, pool.indexOf(seed.slug));
  return Array.from({ length: Math.min(GALLERY_SIZE, pool.length) }, (_, index) =>
    `/images/projects/${pool[(start + index) % pool.length]}.jpg`,
  );
};

/** Ngay dang gia lap - lui dan tu 07/08/2026 de thu tu "moi nhat" on dinh */
const publishedAtFor = (index: number) => {
  const base = new Date('2026-08-07T09:00:00.000Z');
  base.setDate(base.getDate() - index * 3);
  return base.toISOString();
};

/**
 * Ghi de bang SO LIEU THAT cho du an that duy nhat trong danh sach.
 *
 * Cac du an con lai deu hu cau nen so lieu sinh ngau nhien la du. Rieng
 * Vinhomes Ocean Park dung de demo "du lieu that hien ra sao", nen moi con so
 * o day deu tra tu nguon cong khai - xem vinhomes-ocean-park.mock.ts.
 */
const REAL_PROJECT_FACTS: Record<string, Partial<Project>> = {
  'vinhomes-ocean-park-gia-lam': {
    scaleHa: 420,
    latitude: 20.9942646,
    longitude: 105.948475,
    // Can ho Sapphire 35-85 m2 (nguon: vinhomes.vn)
    areaFrom: 35,
    areaTo: 85,
    bedroomOptions: [1, 2, 3],
    handoverYear: 2024,
    legal: 'so-50-nam',
    amenityTags: [
      'be-boi',
      'cong-vien',
      'truong-hoc',
      'phong-gym',
      'khu-bbq',
      'san-the-thao',
      'trung-tam-thuong-mai',
      'ham-do-xe',
      'an-ninh-24-7',
      'khu-vui-choi',
    ],
    viewpoints: ['view-ho', 'view-cong-vien', 'view-thanh-pho'],
    thumbnailUrl: '/images/projects/vinhomes-ocean-park-gia-lam/hero-1-hoang-hon-ho-trung-tam.jpg',
    thumbnailUrls: [
      '/images/projects/vinhomes-ocean-park-gia-lam/hero-1-hoang-hon-ho-trung-tam.jpg',
      '/images/projects/vinhomes-ocean-park-gia-lam/hero-2-bien-ho-nuoc-man.jpg',
      '/images/projects/vinhomes-ocean-park-gia-lam/hero-3-phoi-canh-tong-the.jpg',
    ],
  },
};

export const MOCK_PROJECTS: Project[] = SEEDS.map((seed, index) => {
  const developer = MOCK_DEVELOPERS[seed.developerIndex];
  const region = MOCK_REGIONS[seed.regionIndex];

  // Hat giong khac hat giong cua project-detail.mock de hai ben khong sinh ra
  // cung mot chuoi so - o day chi can on dinh, khong can khop voi trang chi tiet.
  const rng = createRng(`${seed.slug}-facets`);
  const profile = PROFILE[seed.propertyType];

  const priceFrom = Math.round(intBetween(rng, profile.price[0], profile.price[1]) / 1e8) * 1e8;
  const [centerLat, centerLng] = REGION_CENTER[region.value] ?? REGION_CENTER['kv-ha-noi'];
  const areaFrom = intBetween(rng, profile.area[0], Math.round(profile.area[1] * 0.6));
  const areaTo = intBetween(rng, Math.round(profile.area[1] * 0.7), profile.area[1]);

  return {
    publicId: `prj-${String(index + 1).padStart(3, '0')}`,
    slug: seed.slug,
    name: seed.name,
    tagline: seed.tagline,
    address: seed.address,
    segment: seed.segment,
    status: seed.status,
    propertyType: seed.propertyType,
    developerId: developer.value,
    developerName: developer.label,
    regionId: region.value,
    regionName: region.label,
    thumbnailUrl: `/images/projects/${seed.slug}.jpg`,
    thumbnailUrls: galleryFor(seed),
    detailUrl: `/gio-hang/${seed.slug}`,
    isHot: seed.isHot,
    publishedAt: publishedAtFor(index),

    priceFrom,
    areaFrom,
    areaTo,
    bedroomOptions: profile.bedrooms,
    latitude: centerLat + (rng() - 0.5) * 2 * REGION_SPREAD,
    longitude: centerLng + (rng() - 0.5) * 2 * REGION_SPREAD,
    scaleHa: intBetween(rng, 3, 120),
    handoverYear: intBetween(rng, ...HANDOVER_BY_STATUS[seed.status]),
    amenityTags: pickSome(rng, AMENITY_TAG_KEYS, intBetween(rng, 3, 7)),
    viewpoints: pickSome(rng, VIEWPOINT_KEYS, intBetween(rng, 1, 3)),
    legal: pickOne(rng, LEGAL_BY_STATUS[seed.status]),
    hasDiscount: rng() < 0.45,
    hasBankSupport: rng() < 0.7,

    // Du an that thi so lieu that de len tren; du an hu cau khong bi anh huong
    ...REAL_PROJECT_FACTS[seed.slug],
  };
});
