/**
 * Sinh du lieu chi tiet cho MOI du an trong MOCK_PROJECTS.
 *
 * Khong viet tay 24 lan: mot bo sinh xac dinh (deterministic) chay tu `slug`,
 * nen cung mot du an luon ra cung mot ket qua giua cac lan render va giua
 * server voi client - neu khong se lech hydration.
 *
 * Anh dung lai kho anh mau da co trong public/images. Ban ve mat bang / so do
 * tang de trong `imageUrl` co y do: PlaceholderThumb se ve nen gradient co
 * nhan, ro rang la du lieu mau chu khong gia lam anh that.
 *
 * Khi backend san sang: xoa file nay, khong sua component nao.
 */
import { formatNumber } from '@/common/utils/format';
import { toSlug } from '@/common/utils/text';
import { MOCK_NEWS } from '@/modules/news/mocks/news.mock';
import type { NewsArticle } from '@/modules/news/models/news.model';
import type {
  InterestSchedule,
  LocationHighlight,
  LocationIcon,
  MasterPlanMap,
  Panorama,
  PhaseDetail,
  ProgressMilestone,
  ProjectAmenity,
  ProjectConsultant,
  ProjectDetail,
  ProjectDocument,
  ProjectPhase,
  ProjectProduct,
  ProjectUnit,
  ProjectVideo,
  SalesPolicy,
  UnitFundType,
  UnitStatus,
  UnitWithProject,
} from '../models/project-detail.model';
import { PROPERTY_TYPE_LABELS, type Project } from '../models/project.model';
import {
  VOP_DETAIL_OVERRIDE,
  VOP_MASTER_PLAN,
  VOP_PHASE_IMAGES,
  VOP_PHASE_NAMES,
  VOP_SLUG,
} from './vinhomes-ocean-park.mock';
import { MOCK_PROJECTS } from './projects.mock';
import { BLANCA_CITY_DETAIL, BLANCA_CITY_SLUG } from './blanca-city.mock';
import { IMPERIA_GREEN_PARADISE_DETAIL, IMPERIA_GREEN_PARADISE_SLUG } from './imperia-green-paradise.mock';

// ── Bo sinh so ngau nhien co hat giong ─────────────────────────────────────

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

const pickOne = <T>(rng: Rng, list: readonly T[]): T =>
  list[Math.floor(rng() * list.length)];

/** Lay `count` phan tu chay vong tu `pool`, bat dau tu `offset` */
const cycle = <T>(pool: readonly T[], offset: number, count: number): T[] =>
  Array.from({ length: count }, (_, index) => pool[(offset + index) % pool.length]);

// ── Kho anh dung lai ───────────────────────────────────────────────────────

const PROJECT_IMAGES = MOCK_PROJECTS.map((project) => project.thumbnailUrl);
const NEWS_IMAGES = Array.from(
  { length: 8 },
  (_, index) => `/images/news/news-${String(index + 1).padStart(3, '0')}.jpg`,
);

// ── Kho ten goi ────────────────────────────────────────────────────────────

const PHASE_NAMES = [
  'Vọng Nguyệt',
  'Hải Âu',
  'Bình Minh',
  'Thủy Mộc',
  'Ngọc Lan',
  'Sơn Trà',
  'Kim Ngân',
  'An Viên',
] as const;

/** Ten san pham di kem khoang dien tich - thu tu khop voi *_UNIT_TYPES ben duoi */
type ProductSize = { name: string; min: number; max: number };

const LOW_RISE_PRODUCTS: readonly ProductSize[] = [
  { name: 'Biệt thự đơn lập', min: 200, max: 320 },
  { name: 'Biệt thự song lập', min: 140, max: 200 },
  { name: 'Nhà phố liền kề', min: 60, max: 101 },
  { name: 'Shophouse', min: 70, max: 120 },
  { name: 'Dinh thự ven hồ', min: 320, max: 460 },
];

const HIGH_RISE_PRODUCTS: readonly ProductSize[] = [
  { name: 'Căn hộ 1 phòng ngủ', min: 45, max: 58 },
  { name: 'Căn hộ 2 phòng ngủ', min: 60, max: 78 },
  { name: 'Căn hộ 3 phòng ngủ', min: 85, max: 112 },
  { name: 'Duplex sân vườn', min: 130, max: 168 },
  { name: 'Penthouse', min: 180, max: 240 },
];

const LOW_RISE_UNIT_TYPES: readonly string[] = [
  'LIỀN KỀ',
  'SONG LẬP',
  'ĐƠN LẬP',
  'SHOPHOUSE',
];
const HIGH_RISE_UNIT_TYPES: readonly string[] = ['1PN', '2PN', '3PN', 'DUPLEX'];

const DIRECTIONS = [
  'ĐÔNG',
  'TÂY',
  'NAM',
  'BẮC',
  'ĐÔNG NAM',
  'ĐÔNG BẮC',
  'TÂY NAM',
  'TÂY BẮC',
] as const;

const AMENITIES = [
  'Công viên trung tâm',
  'Bể bơi ngoài trời bốn mùa',
  'Trung tâm thương mại',
  'Trường liên cấp nội khu',
  'Khu thể thao đa năng',
  'Đường dạo ven hồ',
  'Vườn thiền kiểu Nhật',
  'Phòng gym và spa',
] as const;

const PANORAMA_TITLES = [
  'Toàn cảnh từ trên cao',
  'Trục cảnh quan trung tâm',
  'Khu công viên nội khu',
  'Mặt nước trung tâm',
  'Cổng chào và trục chính',
] as const;

const HOTSPOT_LABELS = [
  'CAO TẦNG',
  'TRƯỜNG HỌC',
  'CÔNG VIÊN',
  'VĂN PHÒNG BÁN HÀNG',
  'TRỤC CHÍNH',
  'BẾN THUYỀN',
] as const;

const DOCUMENT_NAMES = [
  'Tổng mặt bằng',
  'Video giới thiệu',
  'Phối cảnh',
  'Tiện ích',
  'Layout thiết kế',
  'Slide đào tạo',
  'Chính sách bán hàng',
] as const;

const CONSULTANT_NAMES = [
  'Ngọc Kiên',
  'Hồng Nhung',
  'Thanh Tùng',
  'Mai Phương',
  'Quốc Đạt',
  'Thu Hà',
] as const;

// ── Du lieu theo khu vuc ───────────────────────────────────────────────────

type RegionProfile = {
  latitude: number;
  longitude: number;
  /** Don gia dat tham chieu, VND/m2 - dung lam goc de sinh gia can */
  basePricePerSqm: number;
  connections: { icon: LocationIcon; title: string; description: string }[];
};

const REGION_PROFILES: Record<string, RegionProfile> = {
  'kv-ha-noi': {
    latitude: 21.0278,
    longitude: 105.8342,
    basePricePerSqm: 122_000_000,
    connections: [
      {
        icon: 'car',
        title: '15 phút tới Hồ Gươm',
        description: 'Trục vành đai mới rút ngắn thời gian vào lõi trung tâm vào giờ cao điểm.',
      },
      {
        icon: 'train',
        title: '10 phút tới ga metro',
        description: 'Tuyến đường sắt đô thị đi qua rìa dự án, thuận tiện cho cư dân đi làm hằng ngày.',
      },
      {
        icon: 'plane',
        title: '35 phút tới sân bay Nội Bài',
        description: 'Kết nối thẳng qua cao tốc, phù hợp với nhóm cư dân di chuyển thường xuyên.',
      },
      {
        icon: 'globe',
        title: '20 phút tới khu công nghệ cao',
        description: 'Nguồn khách thuê ổn định từ các doanh nghiệp và chuyên gia làm việc trong khu.',
      },
      {
        icon: 'rocket',
        title: '5 phút tới trường quốc tế',
        description: 'Ba trường liên cấp trong bán kính 3 km, giảm áp lực đưa đón cho gia đình trẻ.',
      },
    ],
  },
  'kv-hcm': {
    latitude: 10.7769,
    longitude: 106.7009,
    basePricePerSqm: 132_000_000,
    connections: [
      {
        icon: 'car',
        title: '18 phút tới quận 1',
        description: 'Kết nối trực tiếp qua đại lộ ven sông, tránh được các nút thắt nội đô.',
      },
      {
        icon: 'train',
        title: '8 phút tới tuyến metro số 1',
        description: 'Ga gần nhất nằm ngay đầu trục chính, thuận tiện cho cư dân không dùng ô tô.',
      },
      {
        icon: 'plane',
        title: '30 phút tới sân bay Tân Sơn Nhất',
        description: 'Hai hướng tiếp cận song song giúp chủ động thời gian trong giờ cao điểm.',
      },
      {
        icon: 'ship',
        title: '25 phút tới cảng và khu logistics',
        description: 'Lợi thế rõ rệt cho nhóm khách hàng kinh doanh thương mại - xuất nhập khẩu.',
      },
      {
        icon: 'globe',
        title: '12 phút tới khu đô thị sáng tạo',
        description: 'Hưởng lợi trực tiếp từ quy hoạch trung tâm tài chính và công nghệ phía Đông.',
      },
    ],
  },
  'kv-da-nang': {
    latitude: 16.0544,
    longitude: 108.2022,
    basePricePerSqm: 92_000_000,
    connections: [
      {
        icon: 'car',
        title: '12 phút tới bãi biển Mỹ Khê',
        description: 'Trục đường ven biển chạy thẳng, đi bộ và đạp xe đều thuận tiện.',
      },
      {
        icon: 'plane',
        title: '20 phút tới sân bay quốc tế Đà Nẵng',
        description: 'Đón trọn dòng khách quốc tế, thuận lợi cho khai thác lưu trú ngắn ngày.',
      },
      {
        icon: 'globe',
        title: '30 phút tới phố cổ Hội An',
        description: 'Nằm giữa hai cực du lịch lớn nhất miền Trung, công suất phòng ổn định quanh năm.',
      },
      {
        icon: 'ship',
        title: '15 phút tới cảng Tiên Sa',
        description: 'Cửa ngõ đón khách tàu biển, bổ sung nguồn khách cho khối thương mại dịch vụ.',
      },
      {
        icon: 'rocket',
        title: '10 phút tới bán đảo Sơn Trà',
        description: 'Không gian rừng và biển liền kề, giữ được chất lượng sống khác biệt.',
      },
    ],
  },
  'kv-hung-yen': {
    latitude: 20.9305,
    longitude: 105.9605,
    basePricePerSqm: 86_000_000,
    connections: [
      {
        icon: 'car',
        title: '25 phút tới trung tâm Hà Nội',
        description: 'Cao tốc và cầu vượt sông mới đưa dự án vào vùng đi lại hằng ngày của thủ đô.',
      },
      {
        icon: 'globe',
        title: '10 phút tới khu công nghiệp',
        description: 'Nguồn cầu thuê lớn và ổn định từ chuyên gia, kỹ sư làm việc trong vùng.',
      },
      {
        icon: 'plane',
        title: '45 phút tới sân bay Nội Bài',
        description: 'Kết nối qua vành đai, không phải đi xuyên qua nội đô.',
      },
      {
        icon: 'train',
        title: '20 phút tới ga đường sắt liên vùng',
        description: 'Trục vận tải hàng hóa và hành khách đang được nâng cấp đồng bộ.',
      },
      {
        icon: 'rocket',
        title: '8 phút tới trường liên cấp',
        description: 'Hệ thống giáo dục tư thục phát triển nhanh trong bán kính 5 km.',
      },
    ],
  },
  'kv-quang-ninh': {
    latitude: 20.9101,
    longitude: 107.1839,
    basePricePerSqm: 82_000_000,
    connections: [
      {
        icon: 'train',
        title: '23 phút tới Hà Nội',
        description: 'Tuyến đường sắt cao tốc rút ngắn khoảng cách, mở rộng cơ hội làm việc liên vùng.',
      },
      {
        icon: 'car',
        title: '30 phút tới Hải Phòng',
        description: 'Liên kết nhanh với trung tâm công nghiệp và cảng biển lớn nhất miền Bắc.',
      },
      {
        icon: 'plane',
        title: '45 phút tới sân bay Vân Đồn',
        description: 'Đón dòng khách quốc tế, thúc đẩy kinh doanh lưu trú và dịch vụ cao cấp.',
      },
      {
        icon: 'globe',
        title: '2 giờ tới cửa khẩu Móng Cái',
        description: 'Chạm cửa khẩu quốc tế, mở rộng giao thương xuyên biên giới.',
      },
      {
        icon: 'ship',
        title: '25 phút tới bến du thuyền',
        description: 'Tạo thành trục du lịch - đô thị ven biển sầm uất của cả khu vực.',
      },
    ],
  },
  'kv-hai-phong': {
    latitude: 20.8449,
    longitude: 106.6881,
    basePricePerSqm: 78_000_000,
    connections: [
      {
        icon: 'ship',
        title: '15 phút tới cảng nước sâu',
        description: 'Trung tâm logistics của miền Bắc, tạo nguồn cầu ổn định cho khối thương mại.',
      },
      {
        icon: 'car',
        title: '1 giờ 30 phút tới Hà Nội',
        description: 'Cao tốc năm làn xe chạy thẳng, không qua nút giao đông đúc.',
      },
      {
        icon: 'plane',
        title: '20 phút tới sân bay Cát Bi',
        description: 'Sân bay quốc tế đang mở rộng công suất, tăng khả năng kết nối vùng.',
      },
      {
        icon: 'globe',
        title: '40 phút tới đảo Cát Bà',
        description: 'Trục du lịch biển đảo, bổ sung nguồn khách cuối tuần cho khu vực.',
      },
      {
        icon: 'rocket',
        title: '10 phút tới khu công nghiệp',
        description: 'Chuyên gia nước ngoài làm việc tại đây là nhóm khách thuê chủ lực.',
      },
    ],
  },
};

const FALLBACK_PROFILE = REGION_PROFILES['kv-ha-noi'];

// ── Cac manh du lieu ───────────────────────────────────────────────────────

const buildPhaseNames = (rng: Rng) => {
  const count = intBetween(rng, 2, 4);
  return cycle(PHASE_NAMES, intBetween(rng, 0, PHASE_NAMES.length - 1), count);
};

/** "Vọng Nguyệt" -> "VN" - dung lam tien to ma can */
const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();

const buildUnits = (
  project: Project,
  rng: Rng,
  phaseNames: string[],
  profile: RegionProfile,
): ProjectUnit[] => {
  const isHighRise = project.segment === 'cao-tang';
  const productSizes = isHighRise ? HIGH_RISE_PRODUCTS : LOW_RISE_PRODUCTS;
  const typeLabels = isHighRise ? HIGH_RISE_UNIT_TYPES : LOW_RISE_UNIT_TYPES;

  const total = intBetween(rng, 320, 780);
  const units: ProjectUnit[] = [];

  for (let index = 0; index < total; index += 1) {
    const phaseName = phaseNames[index % phaseNames.length];
    const typeIndex = intBetween(rng, 0, typeLabels.length - 1);
    const size = productSizes[typeIndex];

    const landArea = intBetween(rng, size.min, size.max);
    const buildArea = Number(
      (landArea * (isHighRise ? 1.06 + rng() * 0.06 : 2.2 + rng() * 1.0)).toFixed(1),
    );

    // Gia niem yet sinh tu don gia vung, sau do lech +-  theo tung can
    const listedPrice =
      Math.round((profile.basePricePerSqm * (0.85 + rng() * 0.5) * landArea) / 10_000_000) *
      10_000_000;
    const netPrice =
      Math.round((listedPrice * (0.88 + rng() * 0.07)) / 10_000_000) * 10_000_000;
    // Gia full VAT = gia niem yet + 8% VAT
    const fullVatPrice = Math.round((listedPrice * 1.08) / 10_000_000) * 10_000_000;

    // Don gia bam theo gia thanh toan som, dung cach thiet ke dang hien thi
    const unitPrice = Math.round(netPrice / landArea);

    const statusRoll = rng();
    const status: UnitStatus =
      statusRoll > 0.9 ? 'da-ban' : statusRoll > 0.78 ? 'giu-cho' : 'con-hang';

    const block = intBetween(rng, 1, 62);
    const slot = intBetween(rng, 1, 60);

    // Phan bo quy hang giong buildPlanMap: 20% doc quyen, 66% an cheo, 14% thuong.
    // Giu cung ti le de so lieu dong bo giua card va mat bang.
    const fundRoll = rng();
    const fundType: UnitFundType =
      fundRoll < 0.2 ? 'doc-quyen' : fundRoll < 0.86 ? 'an-cheo' : 'thuong';

    units.push({
      publicId: `${project.publicId}-unit-${String(index + 1).padStart(4, '0')}`,
      code: `${initialsOf(phaseName)}${block}-${String(slot).padStart(2, '0')}`,
      fundType,
      listedPrice,
      netPrice,
      fullVatPrice,
      unitPrice,
      propertyTypeLabel: typeLabels[typeIndex],
      direction: pickOne(rng, DIRECTIONS),
      landArea,
      buildArea,
      phaseName,
      status,
    });
  }

  return units;
};

const PHASE_HEADLINES = [
  'Vịnh biển thượng lưu, năng động, hiện đại bậc nhất khu vực',
  'Toạ độ thư thái, riêng tư nhất toàn khu đô thị',
  'Nơi hội tụ ánh sáng, năng lượng và chất sống thượng lưu',
  'Không gian sống cân bằng giữa mặt nước và mảng xanh',
] as const;

const buildPhases = (
  project: Project,
  rng: Rng,
  phaseNames: string[],
  units: ProjectUnit[],
  imageOffset: number,
): ProjectPhase[] =>
  phaseNames.map((name, index) => {
    const phaseUnits = units.filter((unit) => unit.phaseName === name);
    const prices = phaseUnits.map((unit) => unit.listedPrice);
    const areas = phaseUnits.map((unit) => unit.landArea);

    const totalArea = intBetween(rng, 18, 240);
    const headline = PHASE_HEADLINES[index % PHASE_HEADLINES.length];

    return {
      publicId: `${project.publicId}-phase-${index + 1}`,
      slug: toSlug(name),
      name,
      imageUrl: PROJECT_IMAGES[(imageOffset + index + 3) % PROJECT_IMAGES.length],
      totalUnits: phaseUnits.length,
      priceFrom: prices.length ? Math.min(...prices) : 0,
      priceTo: prices.length ? Math.max(...prices) : 0,

      headline,
      description: `Phân khu ${name} là một trong ${phaseNames.length} phân khu của ${project.name}. Khu vực này được quy hoạch với mật độ xây dựng thấp, hệ tiện ích riêng bên cạnh các tiện ích dùng chung toàn khu, hướng tới nhóm cư dân tìm kiếm sự riêng tư mà vẫn thuận tiện di chuyển tới trục chính của dự án.`,

      specs: [
        { label: 'Tên dự án', value: project.name },
        { label: 'Tổng căn', value: formatNumber(phaseUnits.length) },
        { label: 'Tiêu chuẩn bàn giao', value: 'Đang cập nhật' },
        {
          label: 'Diện tích căn',
          value: areas.length
            ? `từ ${Math.min(...areas)} đến ${Math.max(...areas)} m²`
            : 'Đang cập nhật',
        },
        { label: 'Phong cách xây dựng', value: 'Đang cập nhật' },
        {
          label: 'Hình thức sở hữu',
          value: project.segment === 'cao-tang' ? 'Sở hữu 50 năm' : 'Lâu dài',
        },
        { label: 'Tổng diện tích', value: `${totalArea} ha` },
        { label: 'Chủ đầu tư', value: project.developerName },
      ],

      masterPlanImages: Array.from({ length: 3 }, (_, sheet) => ({
        publicId: `${project.publicId}-phase-${index + 1}-plan-${sheet + 1}`,
        imageUrl: PROJECT_IMAGES[(imageOffset + index * 3 + sheet + 6) % PROJECT_IMAGES.length],
        caption:
          sheet === 0
            ? `Tổng mặt bằng phân khu ${name}`
            : `Tổng mặt bằng công viên ${name} - khu ${sheet}`,
      })),
    };
  });

/**
 * Ban do mat bang: rai pin gia len anh nen.
 *
 * Pin duoc gom thanh vai cum thay vi rai deu, vi tren mat bang that cac can
 * luon nam theo tung phan khu chu khong trai kin toan anh.
 */
const buildPlanMap = (
  project: Project,
  rng: Rng,
  units: ProjectUnit[],
  imageUrl: string,
): MasterPlanMap => {
  const clusterCount = intBetween(rng, 2, 3);
  const clusters = Array.from({ length: clusterCount }, () => ({
    x: intBetween(rng, 24, 76),
    y: intBetween(rng, 30, 70),
  }));

  const markerCount = Math.min(units.length, intBetween(rng, 36, 56));
  const clamp = (value: number) => Math.min(94, Math.max(6, value));

  const markers = Array.from({ length: markerCount }, (_, index) => {
    // Rai deu tren toan bang hang de gia tren pin khong bi don ve mot khoang
    const unit = units[Math.floor((index * units.length) / markerCount)];
    const cluster = clusters[index % clusterCount];

    const roll = rng();
    const fundType: UnitFundType =
      roll < 0.2 ? 'doc-quyen' : roll < 0.86 ? 'an-cheo' : 'thuong';

    return {
      publicId: `${project.publicId}-pin-${index + 1}`,
      code: unit.code,
      price: unit.listedPrice,
      fundType,
      phaseName: unit.phaseName,
      propertyTypeLabel: unit.propertyTypeLabel,
      landArea: unit.landArea,
      status: unit.status,
      x: clamp(cluster.x + (rng() - 0.5) * 20),
      y: clamp(cluster.y + (rng() - 0.5) * 18),
    };
  });

  return { imageUrl, width: 1600, height: 1000, markers };
};

const buildProducts = (project: Project, rng: Rng, imageOffset: number): ProjectProduct[] => {
  const pool = project.segment === 'cao-tang' ? HIGH_RISE_PRODUCTS : LOW_RISE_PRODUCTS;
  const count = intBetween(rng, 3, 5);

  return cycle(pool, intBetween(rng, 0, pool.length - 1), count).map((product, index) => ({
    publicId: `${project.publicId}-product-${index + 1}`,
    name: product.name,
    areaLabel: `Diện tích ${product.min} - ${product.max} m²`,
    imageUrl: PROJECT_IMAGES[(imageOffset + index + 7) % PROJECT_IMAGES.length],
  }));
};

const buildAmenities = (project: Project, imageOffset: number): ProjectAmenity[] =>
  cycle(AMENITIES, imageOffset, 6).map((name, index) => ({
    publicId: `${project.publicId}-amenity-${index + 1}`,
    name,
    imageUrl: PROJECT_IMAGES[(imageOffset + index + 11) % PROJECT_IMAGES.length],
  }));

const buildPanoramas = (project: Project, rng: Rng, imageOffset: number): Panorama[] =>
  cycle(PANORAMA_TITLES, intBetween(rng, 0, 4), 5).map((title, index) => ({
    publicId: `${project.publicId}-pano-${index + 1}`,
    title,
    imageUrl: PROJECT_IMAGES[(imageOffset + index + 5) % PROJECT_IMAGES.length],
    hotspots: cycle(HOTSPOT_LABELS, index, intBetween(rng, 3, 5)).map((label, spot) => ({
      publicId: `${project.publicId}-pano-${index + 1}-spot-${spot + 1}`,
      label,
      x: 14 + intBetween(rng, 0, 66),
      y: 34 + intBetween(rng, 0, 40),
    })),
  }));

const buildTrainingVideos = (project: Project, imageOffset: number): ProjectVideo[] => [
  {
    publicId: `${project.publicId}-training-1`,
    title: `Tổng quan sản phẩm và lợi thế cạnh tranh dự án ${project.name}`,
    thumbnailUrl: NEWS_IMAGES[imageOffset % NEWS_IMAGES.length],
    videoUrl: '#',
  },
  {
    publicId: `${project.publicId}-training-2`,
    title: `Kịch bản tư vấn và xử lý từ chối cho ${project.name}`,
    thumbnailUrl: NEWS_IMAGES[(imageOffset + 3) % NEWS_IMAGES.length],
    videoUrl: '#',
  },
];

const buildProgress = (
  project: Project,
  rng: Rng,
  imageOffset: number,
): ProgressMilestone[] => {
  const base = new Date(project.publishedAt);

  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(base);
    date.setDate(date.getDate() - index * 21);

    return {
      publicId: `${project.publicId}-progress-${index + 1}`,
      label:
        index === 0
          ? `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`
          : date.toISOString(),
      date: date.toISOString(),
      videoThumbnailUrl: PROJECT_IMAGES[(imageOffset + index + 2) % PROJECT_IMAGES.length],
      videoUrl: '#',
      images: cycle(PROJECT_IMAGES, imageOffset + index * 3, intBetween(rng, 3, 4)),
    };
  });
};

const buildDocuments = (project: Project): ProjectDocument[] =>
  DOCUMENT_NAMES.map((name, index) => ({
    publicId: `${project.publicId}-doc-${index + 1}`,
    order: index + 1,
    name,
    url: '#',
  }));

const buildConsultants = (project: Project, rng: Rng): ProjectConsultant[] => {
  const names = cycle(CONSULTANT_NAMES, intBetween(rng, 0, 5), 2);

  return names.map((name, index) => ({
    publicId: `${project.publicId}-consultant-${index + 1}`,
    role: index === 0 ? 'Chuyên viên tư vấn' : 'Quản lý kinh doanh',
    name,
    // So dien thoai hu cau - khong tro toi thue bao that
    phone: `09${intBetween(rng, 10, 89)} ${intBetween(rng, 100, 999)} ${intBetween(rng, 100, 999)}`,
  }));
};

const buildSalesPolicy = (project: Project, rng: Rng): SalesPolicy => {
  const early = intBetween(rng, 7, 10);
  const late = early - 1.5;
  const capRate = intBetween(rng, 5, 7);
  const guaranteeRate = intBetween(rng, 8, 10);

  const schedule = (title: string, offset: number): InterestSchedule => ({
    publicId: `${project.publicId}-interest-${offset}`,
    title,
    terms: ['18 tháng', '24 tháng', '30 tháng', '36 tháng', '60 tháng'],
    rows: [
      {
        publicId: `${project.publicId}-interest-${offset}-70`,
        label: 'Vay 70%',
        note: '',
        values: [0, 4.5, 9, 14, 25].map((value) => `${(value + offset).toFixed(1)}%`),
      },
      {
        publicId: `${project.publicId}-interest-${offset}-80`,
        label: 'Vay 80%',
        note: 'Áp dụng với khách hàng đủ điều kiện vay 80% theo phê duyệt của ngân hàng',
        values: [0, 5, 11, 16.5, 30].map((value) => `${(value + offset).toFixed(1)}%`),
      },
    ],
  });

  return {
    headline: `Chính sách bán hàng và tiến độ thanh toán dự án ${project.name}`,
    discountTitle: 'Khách hàng thanh toán sớm',
    discounts: [
      {
        publicId: `${project.publicId}-discount-1`,
        label: 'Trước 20/07/2026',
        percent: `${early}%`,
      },
      {
        publicId: `${project.publicId}-discount-2`,
        label: 'Sau 20/07/2026',
        percent: `${late.toFixed(1).replace('.', ',')}%`,
      },
    ],
    perks: [
      {
        publicId: `${project.publicId}-perk-1`,
        title: 'Chính sách hỗ trợ lãi suất trần không quá',
        value: `${capRate}`,
        unit: '%/năm',
        note: '',
      },
      {
        publicId: `${project.publicId}-perk-2`,
        title: 'Đảm bảo lãi suất',
        value: `${guaranteeRate}`,
        unit: '%/năm',
        note: 'trong 02 năm',
      },
      {
        publicId: `${project.publicId}-perk-3`,
        title: 'Miễn phí quản lý',
        value: '03',
        unit: 'năm',
        note: '',
      },
      {
        publicId: `${project.publicId}-perk-4`,
        title: 'Gói quà tặng chăm sóc sức khoẻ trị giá',
        value: '100',
        unit: 'triệu',
        note: '',
      },
    ],
    interestSchedules: [
      schedule('Chính sách hỗ trợ lãi suất trước 20/07/2026', 0),
      schedule('Chính sách hỗ trợ lãi suất sau 20/07/2026', 3.5),
    ],
    loyalty: {
      title: 'Chương trình khách hàng thân thiết',
      note: '50% chiết khấu được trừ vào giá bán và 50% được tích điểm thưởng',
      tiers: [
        { publicId: `${project.publicId}-tier-1`, name: 'Hạng Vàng', percent: '0.5%' },
        { publicId: `${project.publicId}-tier-2`, name: 'Hạng Bạch Kim', percent: '0.7%' },
        { publicId: `${project.publicId}-tier-3`, name: 'Hạng Kim Cương', percent: '0.9%' },
      ],
    },
    payment: {
      title: 'Tiến độ thanh toán chuẩn',
      plans: [
        {
          publicId: `${project.publicId}-plan-1`,
          name: 'Tiến độ hàng thô',
          steps: [
            {
              publicId: `${project.publicId}-plan-1-step-1`,
              label: 'Thanh toán giãn',
              note: 'trong 09 tháng',
              value: '75%',
            },
            {
              publicId: `${project.publicId}-plan-1-step-2`,
              label: 'Thanh toán theo tiến độ',
              note: 'trong 09 tháng',
              value: '25%',
            },
          ],
        },
        {
          publicId: `${project.publicId}-plan-2`,
          name: 'Tiến độ hàng giãn xây',
          steps: [
            {
              publicId: `${project.publicId}-plan-2-step-1`,
              label: 'Thanh toán trong 09 tháng',
              note: 'không bao gồm chi phí xây dựng',
              value: '100% giá trị căn',
            },
            {
              publicId: `${project.publicId}-plan-2-step-2`,
              label: 'Tiền xây thanh toán sau',
              note: '',
              value: '2 năm',
            },
          ],
        },
      ],
    },
  };
};

const buildNews = (imageOffset: number): NewsArticle[] =>
  cycle(MOCK_NEWS, imageOffset, 4);

const buildLocationHighlights = (
  project: Project,
  profile: RegionProfile,
): LocationHighlight[] =>
  profile.connections.map((connection, index) => ({
    publicId: `${project.publicId}-connection-${index + 1}`,
    ...connection,
  }));

// ── Ghep mot du an hoan chinh ──────────────────────────────────────────────

/**
 * Nhan san `phases` (da suy ra tu bang hang) thay vi tu sinh, de gia hien tren
 * the phan khu luon la gia co that trong bang hang.
 */
const buildProjectDetail = (
  project: Project,
  rng: Rng,
  profile: RegionProfile,
  phases: ProjectPhase[],
  units: ProjectUnit[],
  imageOffset: number,
): ProjectDetail => {
  const masterPlanImageUrl = PROJECT_IMAGES[(imageOffset + 4) % PROJECT_IMAGES.length];
  const scaleHa = intBetween(rng, 12, 620);
  const capital = intBetween(rng, 4, 32);
  const population = intBetween(rng, 8, 96) * 1000;

  return {
    ...project,
    description: `${project.name} là khu đô thị được quy hoạch đồng bộ tại ${project.regionName}, hướng tới nhóm cư dân tìm kiếm không gian sống cân bằng giữa tiện ích đô thị và mảng xanh. Toàn bộ dự án được chia thành ${phases.length} phân khu, mỗi phân khu có hệ tiện ích riêng bên cạnh các tiện ích dùng chung của toàn khu.`,

    hero: cycle(PROJECT_IMAGES, imageOffset, 5).map((imageUrl, index) => ({
      publicId: `${project.publicId}-hero-${index + 1}`,
      imageUrl,
      caption: index === 0 ? project.tagline : `Phối cảnh ${project.name} - góc ${index + 1}`,
    })),

    stats: [
      { key: 'scale', label: 'Quy mô dự án', value: `${scaleHa} ha` },
      { key: 'capital', label: 'Tổng vốn đầu tư', value: `${capital} nghìn tỷ` },
      {
        key: 'population',
        label: 'Quy mô dân số',
        value: `${population.toLocaleString('vi-VN')} người`,
      },
    ],

    specs: [
      { label: 'Tên dự án', value: project.name },
      { label: 'Vị trí', value: project.address },
      { label: 'Quy mô dự án', value: `${scaleHa} ha` },
      { label: 'Tổng vốn đầu tư', value: `${capital} nghìn tỷ đồng` },
      { label: 'Quy mô dân số', value: `Khoảng ${population.toLocaleString('vi-VN')} người` },
      {
        label: 'Loại hình sản phẩm',
        value: PROPERTY_TYPE_LABELS[project.propertyType],
      },
      { label: 'Chủ đầu tư', value: project.developerName },
      {
        label: 'Hình thức sở hữu',
        value: project.segment === 'cao-tang' ? 'Sở hữu 50 năm' : 'Lâu dài',
      },
    ],

    overviewImageUrl: PROJECT_IMAGES[(imageOffset + 1) % PROJECT_IMAGES.length],

    masterPlan: [
      { key: 'tong-quan', label: 'Tổng quan', imageUrl: masterPlanImageUrl },
      ...phases.map((phase) => ({
        key: phase.slug,
        label: `PK ${phase.name}`,
        imageUrl: phase.imageUrl,
      })),
    ],

    products: buildProducts(project, rng, imageOffset),

    intro: {
      title: 'Giới thiệu dự án',
      body: `${project.name} nằm tại ${project.address}, được phát triển bởi ${project.developerName}. Dự án hướng tới một khu đô thị hoàn chỉnh với hệ thống trường học, thương mại và công viên nội khu, nơi cư dân có thể đáp ứng phần lớn nhu cầu hằng ngày trong bán kính đi bộ.`,
      videoThumbnailUrl: PROJECT_IMAGES[(imageOffset + 6) % PROJECT_IMAGES.length],
      videoUrl: '#',
    },

    amenities: buildAmenities(project, imageOffset),

    closing: {
      title: 'Chuẩn sống cân bằng giữa tiện ích đô thị và không gian xanh',
      body: `Mật độ xây dựng thấp, phần lớn diện tích dành cho cảnh quan và mặt nước. Cách bố trí này giữ được sự riêng tư cho từng căn mà vẫn bảo đảm khoảng cách đi bộ ngắn tới các tiện ích chính của ${project.name}.`,
      videoThumbnailUrl: PROJECT_IMAGES[(imageOffset + 9) % PROJECT_IMAGES.length],
      videoUrl: '#',
    },

    consultants: buildConsultants(project, rng),

    location: {
      bannerUrl: PROJECT_IMAGES[(imageOffset + 8) % PROJECT_IMAGES.length],
      headline: 'Vị trí kết nối đa cực - tâm điểm giao thương mới',
      intro: `Sở hữu tọa độ thuận lợi tại ${project.regionName}, ${project.name} không chỉ là nơi an cư mà còn nằm trên trục kết nối chính của cả khu vực.`,
      highlights: buildLocationHighlights(project, profile),
      closing:
        'Bao quanh là hệ tiện ích vùng đã vận hành ổn định, tạo nên dòng khách và dòng tiền đều đặn quanh năm.',
      latitude: profile.latitude,
      longitude: profile.longitude,
      mapLabel: project.address,
    },

    phases,
    planMap: buildPlanMap(project, rng, units, masterPlanImageUrl),
    panoramas: buildPanoramas(project, rng, imageOffset),
    trainingVideos: buildTrainingVideos(project, imageOffset),
    salesPolicy: buildSalesPolicy(project, rng),
    progress: buildProgress(project, rng, imageOffset),
    documents: buildDocuments(project),
    news: buildNews(imageOffset),
  };
};

// ── Units cho Blanca City (tu demo.json) ───────────────────────────────────

const BLANCA_CITY_UNIT_TYPES = [
  { label: 'Studio', area: 35.8, bedrooms: 0 },
  { label: '1PN+1', area: 49.3, bedrooms: 1 },
  { label: '2PN', area: 68.8, bedrooms: 2 },
  { label: '2PN+1', area: 79.2, bedrooms: 2 },
  { label: '3PN', area: 93.1, bedrooms: 3 },
];

// Du 8 huong de bo loc Dong/Tay Tu Trach luon co ket qua o moi du an
const BLANCA_CITY_DIRECTIONS = [
  'ĐÔNG',
  'ĐÔNG NAM',
  'NAM',
  'BẮC',
  'TÂY',
  'TÂY NAM',
  'TÂY BẮC',
  'ĐÔNG BẮC',
];

const buildBlancaCityUnits = (): ProjectUnit[] => {
  const units: ProjectUnit[] = [];
  let unitIndex = 0;

  // Generate 500 units
  for (let floor = 5; floor <= 34; floor++) {
    for (let slot = 1; slot <= 16; slot++) {
      if (unitIndex >= 500) break;

      const typeIndex = unitIndex % BLANCA_CITY_UNIT_TYPES.length;
      const type = BLANCA_CITY_UNIT_TYPES[typeIndex];

      // Generate price based on area (approximate, ~50-60 triệu/m2)
      const basePricePerSqm = 50_000_000 + Math.random() * 10_000_000;
      const listedPrice = Math.round((type.area * basePricePerSqm) / 1_000_000) * 1_000_000;
      const netPrice = Math.round(listedPrice * 0.95 / 1_000_000) * 1_000_000;
      const fullVatPrice = Math.round(listedPrice * 1.08 / 1_000_000) * 1_000_000;
      const unitPrice = Math.round(netPrice / type.area);

      // Random status: 70% con-hang, 15% giu-cho, 15% da-ban
      const statusRoll = Math.random();
      const status: UnitStatus =
        statusRoll > 0.85 ? 'da-ban' : statusRoll > 0.70 ? 'giu-cho' : 'con-hang';

      // Fund type distribution
      const fundRoll = Math.random();
      const fundType: UnitFundType =
        fundRoll < 0.2 ? 'doc-quyen' : fundRoll < 0.86 ? 'an-cheo' : 'thuong';

      const code = `BT-${String(floor).padStart(2, '0')}${String(slot).padStart(2, '0')}`;

      units.push({
        publicId: `bc-unit-${String(unitIndex + 1).padStart(4, '0')}`,
        code,
        fundType,
        listedPrice,
        netPrice,
        fullVatPrice,
        unitPrice,
        propertyTypeLabel: type.label,
        direction: BLANCA_CITY_DIRECTIONS[unitIndex % BLANCA_CITY_DIRECTIONS.length],
        landArea: type.area,
        buildArea: type.area,
        phaseName: 'Beacon Tower',
        status,
        floor: String(floor),
        bedrooms: type.bedrooms,
        toilets: type.bedrooms + 1,
        floors: 1,
        loanRate: '6%/năm',
        loanTerm: '24 tháng',
        discount: 'Chiết khấu 2% khi thanh toán sớm',
        gift: 'Voucher nội thất 50 triệu',
        handoverDate: 'Quý 4/2026',
        handoverStatus: 'Đang xây dựng',
      });

      unitIndex++;
    }
    if (unitIndex >= 500) break;
  }

  return units;
};

// ── Units cho Imperia Green Paradise (tu imprea.json) ──────────────────────

const IMPERIA_UNIT_TYPES = [
  { label: 'Studio', area: 33, bedrooms: 0 },
  { label: '1PN+1', area: 48, bedrooms: 1 },
  { label: '2PN+1WC', area: 58, bedrooms: 2 },
  { label: '2PN+2WC', area: 74, bedrooms: 2 },
  { label: '3PN', area: 85, bedrooms: 3 },
  { label: 'Duplex', area: 135, bedrooms: 3 },
  { label: 'Penthouse', area: 156, bedrooms: 4 },
];

const IMPERIA_DIRECTIONS = [
  'ĐÔNG',
  'ĐÔNG NAM',
  'NAM',
  'BẮC',
  'TÂY',
  'TÂY NAM',
  'TÂY BẮC',
  'ĐÔNG BẮC',
];

const buildImperiaUnits = (): ProjectUnit[] => {
  const units: ProjectUnit[] = [];
  let unitIndex = 0;

  // Generate 600 units cho Imperia Green Paradise (paradise tower)
  for (let floor = 6; floor <= 40; floor++) {
    for (let slot = 1; slot <= 16; slot++) {
      if (unitIndex >= 600) break;

      const typeIndex = unitIndex % IMPERIA_UNIT_TYPES.length;
      const type = IMPERIA_UNIT_TYPES[typeIndex];

      // Generate price based on area (Imperia: ~65-75 triệu/m2 vì cao cấp)
      const basePricePerSqm = 65_000_000 + Math.random() * 10_000_000;
      const listedPrice = Math.round((type.area * basePricePerSqm) / 1_000_000) * 1_000_000;
      const netPrice = Math.round(listedPrice * 0.95 / 1_000_000) * 1_000_000;
      const fullVatPrice = Math.round(listedPrice * 1.08 / 1_000_000) * 1_000_000;
      const unitPrice = Math.round(netPrice / type.area);

      // Random status: 80% con-hang (sắp mở bán), 12% giu-cho, 8% da-ban
      const statusRoll = Math.random();
      const status: UnitStatus =
        statusRoll > 0.92 ? 'da-ban' : statusRoll > 0.80 ? 'giu-cho' : 'con-hang';

      // Fund type distribution
      const fundRoll = Math.random();
      const fundType: UnitFundType =
        fundRoll < 0.2 ? 'doc-quyen' : fundRoll < 0.86 ? 'an-cheo' : 'thuong';

      const code = `PT-${String(floor).padStart(2, '0')}${String(slot).padStart(2, '0')}`;

      units.push({
        publicId: `igp-unit-${String(unitIndex + 1).padStart(4, '0')}`,
        code,
        fundType,
        listedPrice,
        netPrice,
        fullVatPrice,
        unitPrice,
        propertyTypeLabel: type.label,
        direction: IMPERIA_DIRECTIONS[unitIndex % IMPERIA_DIRECTIONS.length],
        landArea: type.area,
        buildArea: type.area,
        phaseName: 'The Paradise Tower',
        status,
        floor: String(floor),
        bedrooms: type.bedrooms,
        toilets: type.bedrooms + 1,
        floors: type.label === 'Duplex' ? 2 : 1,
        loanRate: '0% (24 tháng đầu)',
        loanTerm: '24 tháng',
        discount: 'Chiết khấu 5% khi thanh toán sớm',
        gift: 'Gói nội thất cao cấp 200 triệu',
        handoverDate: 'Quý 4/2028',
        handoverStatus: 'Đang xây dựng',
      });

      unitIndex++;
    }
    if (unitIndex >= 600) break;
  }

  return units;
};

// ── Cache: mot du an chi dung mot lan trong bo nho ─────────────────────────

const detailCache = new Map<string, ProjectDetail>();
const unitCache = new Map<string, ProjectUnit[]>();

/**
 * Dung mot chuoi rng duy nhat cho ca bang hang lan phan con lai, nen thu tu
 * goi trong ham nay la mot phan cua "hat giong" - doi thu tu se doi du lieu.
 */
const ensureBuilt = (slug: string): ProjectDetail | null => {
  // Check for real project data first (Blanca City)
  if (slug === BLANCA_CITY_SLUG) {
    const bcProject = BLANCA_CITY_DETAIL;
    // Generate units for Blanca City
    const bcUnits = buildBlancaCityUnits();
    unitCache.set(slug, bcUnits);
    detailCache.set(slug, bcProject);
    return bcProject;
  }

  // Check for real project data (Imperia Green Paradise)
  if (slug === IMPERIA_GREEN_PARADISE_SLUG) {
    const igpProject = IMPERIA_GREEN_PARADISE_DETAIL;
    const igpUnits = buildImperiaUnits();
    unitCache.set(slug, igpUnits);
    detailCache.set(slug, igpProject);
    return igpProject;
  }

  const cached = detailCache.get(slug);
  if (cached) return cached;

  const project = MOCK_PROJECTS.find((item) => item.slug === slug);
  if (!project) return null;

  const rng = createRng(project.slug);
  const profile = REGION_PROFILES[project.regionId] ?? FALLBACK_PROFILE;
  const imageOffset = MOCK_PROJECTS.findIndex((item) => item.slug === slug);

  // Du an that dung dung ten 4 phan khu cua no; du an hu cau van sinh ngau nhien
  const isReal = slug === VOP_SLUG;
  const phaseNames = isReal ? [...VOP_PHASE_NAMES] : buildPhaseNames(rng);

  const units = buildUnits(project, rng, phaseNames, profile);
  const phases = buildPhases(project, rng, phaseNames, units, imageOffset);

  const generated = buildProjectDetail(project, rng, profile, phases, units, imageOffset);

  /**
   * Voi du an that, so lieu tra tu nguon cong khai de len tren ban sinh.
   * Nhung truong KHONG co trong ban ghi de (bang hang, chinh sach ban hang,
   * anh 360, tai lieu, tien do, pin gia tren mat bang) van la du lieu minh hoa -
   * xem GHI-CHU-DU-LIEU.md.
   */
  const detail = isReal
    ? {
        ...generated,
        ...VOP_DETAIL_OVERRIDE,
        phases: generated.phases.map((phase, index) => ({
          ...phase,
          imageUrl: VOP_PHASE_IMAGES[index] ?? phase.imageUrl,
          // To dau tien cua VOP_MASTER_PLAN la mat bang tong the, nen phan khu
          // thu index nam o vi tri index + 1.
          masterPlanImages: [
            {
              publicId: `${phase.publicId}-plan-phan-khu`,
              imageUrl: VOP_MASTER_PLAN[index + 1]?.imageUrl ?? VOP_MASTER_PLAN[0].imageUrl,
              caption: `Mặt bằng phân khu ${phase.name} trong tổng thể dự án`,
            },
            {
              publicId: `${phase.publicId}-plan-tong-the`,
              imageUrl: VOP_MASTER_PLAN[0].imageUrl,
              caption: 'Mặt bằng tổng thể Vinhomes Ocean Park',
            },
          ],
        })),
      }
    : generated;

  unitCache.set(slug, units);
  detailCache.set(slug, detail);
  return detail;
};

export const getProjectDetail = (slug: string): ProjectDetail | null => ensureBuilt(slug);

/**
 * Ghep du lieu trang chi tiet phan khu tu du an cha.
 *
 * Vi tri va chinh sach ban hang dung chung voi du an; `planMap` duoc loc chi
 * con pin cua phan khu nay.
 */
export const getPhaseDetail = (
  projectSlug: string,
  phaseSlug: string,
): PhaseDetail | null => {
  const project = ensureBuilt(projectSlug);
  if (!project) return null;

  const phase = project.phases.find((item) => item.slug === phaseSlug);
  if (!phase) return null;

  return {
    phase,
    projectSlug: project.slug,
    projectName: project.name,
    siblings: project.phases.map(({ publicId, slug, name }) => ({
      publicId,
      slug,
      name,
    })),
    location: project.location,
    planMap: {
      ...project.planMap,
      markers: project.planMap.markers.filter(
        (marker) => marker.phaseName === phase.name,
      ),
    },
    salesPolicy: project.salesPolicy,
  };
};

export const getProjectUnits = (slug: string): ProjectUnit[] => {
  ensureBuilt(slug);
  return unitCache.get(slug) ?? [];
};

/**
 * Bang hang gop cua TAT CA du an.
 *
 * Moi can kem theo metadata du an (slug, name, developerName, isHot, segment)
 * de card co the hien ten du an + chu dau tu + nhan HOT ma khong can service
 * phai join them mot lan nua.
 *
 * Dung cho section "San pham noi bat" tren trang chu - luon lay can tu nhieu
 * du an khac nhau de tranh trang thai chi co can cua 1-2 du an.
 */
export const getAllUnitsAcrossProjects = (): UnitWithProject[] => {
  const result: UnitWithProject[] = [];
  for (const project of MOCK_PROJECTS) {
    // Du an chua tung duoc truy cap se chua co trong unitCache - phai build
    // truoc (cung co che voi getProjectUnits).
    const units = unitCache.has(project.slug)
      ? unitCache.get(project.slug)
      : (ensureBuilt(project.slug), unitCache.get(project.slug));
    if (!units) continue;
    for (const unit of units) {
      result.push({
        ...unit,
        projectSlug: project.slug,
        projectName: project.name,
        developerName: project.developerName,
        segment: project.segment,
        propertyType: project.propertyType,
        projectIsHot: project.isHot,
        // Mang anh cua du an - card can dung carousel nen khong query them.
        thumbnailUrls: project.thumbnailUrls,
      });
    }
  }
  return result;
};
