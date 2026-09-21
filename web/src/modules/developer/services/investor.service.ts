/**
 * Lop truy xuat du lieu cho 25 "Chu dau tu" chinh thuc (Investor).
 *
 * Day la SINGLE SOURCE OF TRUTH cho:
 *   - Section "CAC CHU DAU TU" tren trang chu (Doitac.tsx)
 *   - Trang /chu-dau-tu (list + detail)
 *
 * Hien tai:
 *   - Doc tu INVESTORS (25 records, khong duplicate)
 *   - Dem so du an va so can con hang tu MOCK_PROJECTS / getProjectUnits()
 *     (cung nguon voi /du-an, /quy-can) de so lieu luon khop
 *
 * Mapping 6 mock developerId (tu MOCK_DEVELOPERS) sang 25 Investor moi:
 *   - Vingroup (mock)  <->  Vinhomes (real - Vingroup la cong ty me)
 *   - An Khang          <->  Azure (mapping noi bo cho so lieu)
 *   - Bao Minh          <->  BIM Group
 *   - Dong Duong        <->  Dat Xanh Group
 *   - Thai Binh Duong   <->  Sun Group
 *   - Truong Son        <->  Ecopark
 *   - (cac investor khac chua co du an trong mock - projectCount = 0)
 *
 * Khi backend co module `investors` that, chi can sua mapping ben duoi va
 * thay than ham bang axios goi - cac component/hook/route khong can doi.
 */
import {
  getAllUnitsAcrossProjects,
  getProjectUnits,
} from '@/modules/project/mocks/project-detail.mock';
import { MOCK_PROJECTS, MOCK_REGIONS } from '@/modules/project/mocks/projects.mock';
import { INVESTORS, findInvestorBySlug } from '../mocks/investors.mock';
import type {
  Investor,
  InvestorFilterOptions,
  InvestorQuery,
  InvestorSort,
  InvestorSummary,
  PaginatedInvestors,
} from '../models/investor.model';
import type { Project } from '@/modules/project/models/project.model';
import { normalizeVi } from '@/common/utils/text';

/** Do tre gia lap de UX giong API that */
const NETWORK_DELAY_MS = 200;

const delay = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY_MS));

/**
 * Anh xa developerId (6 mock) -> ten Investor de match voi 25 Investor moi.
 * Day la mapping noi bo cho giai doan mock - khi backend co, mapping se
 * duoc thay the boi developerId that (hoac 1 publicId rieng) trong project.
 */
const DEVELOPER_ID_TO_INVESTOR_NAME: Record<string, string> = {
  'cdt-vingroup': 'Vinhomes',
  'cdt-an-khang': 'Azure',
  'cdt-bao-minh': 'BIM Group',
  'cdt-dong-duong': 'Đất Xanh Group',
  'cdt-thai-binh-duong': 'Sun Group',
  'cdt-truong-son': 'Ecopark',
};

/**
 * Nghich dao cua bang tren: slug Investor -> developerId (mock).
 *
 * Cac trang /du-an va /quy-can loc theo `developerId`, con hang logo chu dau
 * tu lai lay tu INVESTORS (25 muc, co logo that) - day la cau noi giua hai
 * ben. Investor chua co du an nao trong mock thi khong co developerId.
 */
const INVESTOR_SLUG_TO_DEVELOPER_ID = new Map<string, string>(
  Object.entries(DEVELOPER_ID_TO_INVESTOR_NAME).flatMap(([developerId, name]) => {
    const investor = INVESTORS.find(
      (entry) => entry.name.toLowerCase() === name.toLowerCase(),
    );
    return investor ? [[investor.slug, developerId] as [string, string]] : [];
  }),
);

/** Tim Investor theo developerId cu (mock). */
const findInvestorByDeveloperId = (developerId: string): Investor | undefined => {
  const mappedName = DEVELOPER_ID_TO_INVESTOR_NAME[developerId];
  if (!mappedName) return undefined;
  return INVESTORS.find(
    (entry) => entry.name.toLowerCase() === mappedName.toLowerCase(),
  );
};

/** Tinh so lieu tong hop cho 1 Investor. */
const summarize = (investor: Investor): InvestorSummary => {
  const projects = MOCK_PROJECTS.filter((project) => {
    const matched = findInvestorByDeveloperId(project.developerId);
    return matched?.slug === investor.slug;
  });
  const projectSlugs = projects.map((p) => p.slug);

  let availableUnitCount = 0;
  for (const project of projects) {
    const units = getProjectUnits(project.slug);
    availableUnitCount += units.filter((u) => u.status === 'con-hang').length;
  }

  return {
    ...investor,
    projectCount: projects.length,
    openingProjectCount: projects.filter((p) => p.status === 'dang-mo-ban').length,
    availableUnitCount,
    projectSlugs,
  };
};

/**
 * Kiem tra 1 InvestorSummary co khop InvestorQuery hay khong.
 *
 * Cac chu dau tu "khong co du an" (projectCount = 0) van duoc hien thi khi
 * khong co filter nao - vi day la danh sach 25 CDT chinh thuc. Nhung khi
 * nguoi dung bat mot filter (tim kiem, khu vuc, so du an toi thieu, dang mo
 * ban, can con hang) thi cac investor trong bi loai ngay, vi chung khong
 * khop tieu chi nao.
 */
const matchesQuery = (summary: InvestorSummary, query: InvestorQuery): boolean => {
  if (query.regionId) {
    // Chi lay cac du an cua investor nam trong khu vuc dang loc. Neu khong
    // co du an nao -> investor bi loai.
    const projects = MOCK_PROJECTS.filter((project) => {
      const matched = findInvestorByDeveloperId(project.developerId);
      return matched?.slug === summary.slug;
    });
    const hasProjectInRegion = projects.some((p) => p.regionId === query.regionId);
    if (!hasProjectInRegion) return false;
  }

  if (query.minProjectCount !== null && summary.projectCount < query.minProjectCount) {
    return false;
  }
  if (query.hasOpening && summary.openingProjectCount === 0) return false;
  if (query.hasAvailableUnits && summary.availableUnitCount === 0) return false;

  const keyword = normalizeVi(query.search.trim());
  if (keyword) {
    const haystack = normalizeVi(summary.name);
    if (!haystack.includes(keyword)) return false;
  }

  return true;
};

/** Sap xep theo InvestorSort. Mac dinh giu thu tu goc cua INVESTORS. */
const sortInvestors = (
  list: InvestorSummary[],
  sort: InvestorSort,
): InvestorSummary[] => {
  switch (sort) {
    case 'ten-az':
      return [...list].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    case 'du-an-giam':
      return [...list].sort(
        (a, b) =>
          b.projectCount - a.projectCount || a.name.localeCompare(b.name, 'vi'),
      );
    case 'can-con-hang-giam':
      return [...list].sort(
        (a, b) =>
          b.availableUnitCount - a.availableUnitCount ||
          a.name.localeCompare(b.name, 'vi'),
      );
    default:
      return list;
  }
};

/**
 * Loc `regionId` cac khu vuc co it nhat 1 du an thuoc 1 Investor bat ky -
 * day la danh sach that, khong bao gom khu vuc chi co du an "khong co chu
 * dau tu chinh thuc". Dung cho FilterSelect o `Khu vuc`.
 */
const deriveRegions = (): { value: string; label: string }[] => {
  const labelsByValue = new Map<string, string>(
    MOCK_REGIONS.map((entry) => [entry.value, entry.label]),
  );
  const used = new Set<string>();
  for (const project of MOCK_PROJECTS) {
    if (labelsByValue.has(project.regionId)) used.add(project.regionId);
  }
  // Giu thu tu goc cua MOCK_REGIONS de chip khong nhay khi refetch.
  return MOCK_REGIONS.filter((entry) => used.has(entry.value)).map((entry) => ({
    value: entry.value,
    label: entry.label,
  }));
};

export const InvestorService = {
  /**
   * Danh sach 25 Investor + so lieu tong hop, da loc/sap xep/phan trang
   * theo `query`.
   *
   * KHI CO BACKEND: GET /investors?search=&regionId=&minProjectCount=
   *                 &hasOpening=&hasAvailableUnits=&sort=&page=&limit=
   */
  list: async (query: InvestorQuery): Promise<PaginatedInvestors> => {
    const summarized = INVESTORS.map(summarize);
    const matched = summarized.filter((entry) => matchesQuery(entry, query));
    const sorted = sortInvestors(matched, query.sort);
    const start = (query.page - 1) * query.limit;
    const investors = sorted.slice(start, start + query.limit);

    return delay({
      investors,
      total: matched.length,
      page: query.page,
      limit: query.limit,
    });
  },

  /**
   * Cac lua chon cho bang loc - hien tai quy ra tu mock (cac khu vuc co
   * it nhat 1 du an thuoc 1 Investor). KHI CO BACKEND: GET /investors/filters
   * se tra ve cung mot hinh dang va service se goi axios thay vi quy ra
   * tu mock.
   */
  filterOptions: async (): Promise<InvestorFilterOptions> =>
    delay({
      regions: deriveRegions(),
      // 1+/3+/5+ duoc dinh nghia trong model (gia tri co dinh)
      minProjectCounts: [
        { value: '1', label: 'Có dự án' },
        { value: '3', label: 'Từ 3 dự án' },
        { value: '5', label: 'Từ 5 dự án' },
      ],
    }),

  /**
   * `developerId` tuong ung mot Investor - de hang logo chu dau tu bam vao la
   * loc duoc danh sach du an/quy can. Tra null khi Investor chua co du an nao
   * trong he thong (bam vao cung khong ra ket qua nao).
   *
   * KHI CO BACKEND: project se mang thang `investorId`, ham nay bo di.
   */
  developerIdBySlug: (slug: string): string | null =>
    INVESTOR_SLUG_TO_DEVELOPER_ID.get(slug) ?? null,

  /** Lookup Investor theo slug - dung cho /chu-dau-tu/[slug].
   *  Tra ve null neu khong co slug do - route goi notFound(). */
  detail: async (slug: string): Promise<Investor | null> => {
    const investor = findInvestorBySlug(slug);
    return delay(investor ?? null);
  },

  /** Lay cac Project thuoc Investor (qua mapping noi bo).
   *  KHI CO BACKEND: GET /investors/:slug/projects */
  projects: async (slug: string): Promise<typeof MOCK_PROJECTS> => {
    const investor = findInvestorBySlug(slug);
    if (!investor) return delay([]);
    const projects = MOCK_PROJECTS.filter((project) => {
      const matched = findInvestorByDeveloperId(project.developerId);
      return matched?.slug === investor.slug;
    });
    return delay(projects);
  },

  /** So can con hang cua 1 Investor - dung cho quick stat. */
  availableUnitCount: (slug: string): number => {
    const investor = findInvestorBySlug(slug);
    if (!investor) return 0;
    return getAllUnitsAcrossProjects().filter((unit) => {
      const project = MOCK_PROJECTS.find((p) => p.slug === unit.projectSlug);
      if (!project) return false;
      const matched = findInvestorByDeveloperId(project.developerId);
      return matched?.slug === investor.slug && unit.status === 'con-hang';
    }).length;
  },

  /** Lay project list theo slug - SYNC, doc truc tiep tu mock.
   *  Tranh them 1 query async cho trang detail (SSR da co initial data).
   *  Khi backend that, doi thanh async voi useQuery de cache. */
  projectsSync: (slug: string): Project[] => {
    const investor = findInvestorBySlug(slug);
    if (!investor) return [];
    return MOCK_PROJECTS.filter((project) => {
      const matched = findInvestorByDeveloperId(project.developerId);
      return matched?.slug === investor.slug;
    });
  },
};
