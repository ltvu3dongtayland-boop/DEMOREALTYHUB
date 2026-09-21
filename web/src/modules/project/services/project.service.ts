/**
 * Lop truy xuat du lieu du an.
 *
 * HIEN TAI: doc tu mock trong bo nho, loc/phan trang ngay tai client.
 * KHI CO BACKEND: giu nguyen chu ky ham, thay than ham bang goi axios:
 *
 *   const res = await api.get(apiRoutes.PROJECT.GET_ALL(query));
 *   return unwrapApiData<PaginatedProjects>(res.data);
 *
 * Khong component hay hook nao duoc doc mock truc tiep - moi thu di qua day,
 * nen viec doi sang API that chi cham vao dung file nay.
 */
import {
  getAllUnitsAcrossProjects,
  getPhaseDetail,
  getProjectDetail,
  getProjectUnits,
} from '../mocks/project-detail.mock';
import {
  MOCK_DEVELOPERS,
  MOCK_PROJECTS,
  MACRO_REGIONS,
  matchesRegionFilter,
} from '../mocks/projects.mock';
import {
  FLOOR_RANGE_OPTIONS,
  matchesDirection,
  matchesFloorRange,
  type AllUnitsQuery,
  type PaginatedAllUnits,
  type PaginatedUnits,
  type PhaseDetail,
  type ProjectDetail,
  type ProjectUnit,
  type UnitQuery,
  type UnitWithProject,
} from '../models/project-detail.model';
import {
  AMENITY_TAG_LABELS,
  LEGAL_LABELS,
  PROPERTY_TYPE_SEGMENT_LABELS,
  SEGMENT_FILTER_OPTIONS,
  STATUS_LABELS,
  VIEWPOINT_LABELS,
  type FilterOption,
  type PaginatedProjects,
  type Project,
  type ProjectFilterOptions,
  type ProjectHighlightGroup,
  type ProjectQuery,
} from '../models/project.model';

/** Do tre gia lap de trang thai loading hien ra dung nhu khi goi API that */
const NETWORK_DELAY_MS = 250;

const delay = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY_MS));

/** Bo dau tieng Viet de tim kiem khong phan biet dau */
const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');

const DAY_MS = 24 * 60 * 60 * 1000;

const matchesQuery = (project: Project, query: ProjectQuery): boolean => {
  if (query.developerId && project.developerId !== query.developerId) return false;
  if (!matchesRegionFilter(project.regionId, query.regionId)) return false;
  if (query.propertyType && project.propertyType !== query.propertyType) return false;
  if (query.status && project.status !== query.status) return false;
  if (query.segment && project.segment !== query.segment) return false;

  // Gia: du an chi co gia khoi diem, nen so sanh mot diem voi ca hai dau khoang
  if (query.priceMin !== null && project.priceFrom < query.priceMin) return false;
  if (query.priceMax !== null && project.priceFrom > query.priceMax) return false;

  // Dien tich la mot nguong tren: "tu 0 den N m2". Du an dat neu co it nhat
  // mot loai san pham nho hon nguong - tuc san pham nho nhat phai vua khung.
  if (query.areaMax !== null && project.areaFrom > query.areaMax) return false;

  // 5 mang nghia "5 phong tro len"
  if (query.bedrooms !== null) {
    const enough = project.bedroomOptions.some((count) =>
      query.bedrooms === 5 ? count >= 5 : count === query.bedrooms,
    );
    if (!enough) return false;
  }

  if (query.handoverBefore !== null && project.handoverYear > query.handoverBefore) {
    return false;
  }

  if (query.legal && project.legal !== query.legal) return false;
  if (query.hasDiscount && !project.hasDiscount) return false;
  if (query.hasBankSupport && !project.hasBankSupport) return false;

  // Tien ich: phai co DU cac muc duoc chon (loc thu hep dan, dung nhu mong doi)
  if (
    query.amenityTags.length > 0 &&
    !query.amenityTags.every((amenity) => project.amenityTags.includes(amenity))
  ) {
    return false;
  }

  // Huong nhin: chi can khop MOT - nguoi tim "view bien hoac view song" khong
  // ky vong du an phai co ca hai
  if (
    query.viewpoints.length > 0 &&
    !query.viewpoints.some((viewpoint) => project.viewpoints.includes(viewpoint))
  ) {
    return false;
  }

  if (query.postedWithinDays !== null) {
    const age = Date.now() - Date.parse(project.publishedAt);
    if (age > query.postedWithinDays * DAY_MS) return false;
  }

  const keyword = normalize(query.search.trim());
  if (!keyword) return true;

  const haystack = normalize(
    `${project.name} ${project.tagline} ${project.address} ${project.developerName}`,
  );
  return haystack.includes(keyword);
};

/** Khong sua mang goc: bang hang duoc cache va dung lai giua cac lan goi */
const sortUnits = (units: ProjectUnit[], sort: UnitQuery['sort']): ProjectUnit[] => {
  switch (sort) {
    case 'gia-tang':
      return [...units].sort((a, b) => a.listedPrice - b.listedPrice);
    case 'gia-giam':
      return [...units].sort((a, b) => b.listedPrice - a.listedPrice);
    case 'dien-tich-tang':
      return [...units].sort((a, b) => a.landArea - b.landArea);
    case 'dien-tich-giam':
      return [...units].sort((a, b) => b.landArea - a.landArea);
    default:
      return units;
  }
};

export const ProjectService = {
  /**
   * Tra ve toan bo du lieu cua mot du an theo publicId. Dung cho trang
   * "Yeu thich" - can day du field de render card, khong phai Pick.
   * Tra ve null neu khong tim thay (du an bi xoa khoi data sau khi user
   * da luu).
   *
   * KHI CO BACKEND: GET /projects/by-ids?ids=a,b,c (hoac POST voi body)
   */
  byIds: async (publicIds: string[]): Promise<Project[]> => {
    if (publicIds.length === 0) return [];
    const idSet = new Set(publicIds);
    const projects = MOCK_PROJECTS.filter((project) => idSet.has(project.publicId));
    return delay(projects);
  },

  /**
   * Lay quy can theo publicId - dung trang /yeu-thich tab Quỹ căn.
   * Giu thu tu ids de card dung "vua luu" (moi nhat truoc).
   *
   * KHI CO BACKEND: GET /units/by-ids?ids=a,b,c
   */
  unitsByIds: async (publicIds: string[]): Promise<UnitWithProject[]> => {
    if (publicIds.length === 0) return [];
    const idSet = new Set(publicIds);
    const found = getAllUnitsAcrossProjects().filter((unit) =>
      idSet.has(unit.publicId),
    );
    const byId = new Map(found.map((unit) => [unit.publicId, unit]));
    return delay(
      publicIds
        .map((id) => byId.get(id))
        .filter((unit): unit is UnitWithProject => Boolean(unit)),
    );
  },

  /**
   * Danh sach du an da loc + phan trang
   */
  list: async (query: ProjectQuery): Promise<PaginatedProjects> => {
    const matched = MOCK_PROJECTS.filter((project) => matchesQuery(project, query));
    const start = (query.page - 1) * query.limit;
    const projects = matched.slice(start, start + query.limit);

    return delay({
      projects,
      total: matched.length,
      page: query.page,
      limit: query.limit,
      hasMore: start + projects.length < matched.length,
    });
  },

  /** Cac lua chon cho thanh filter - sau nay la 1 endpoint /projects/filters */
  filterOptions: async (): Promise<ProjectFilterOptions> => {
    const toOptions = (labels: Record<string, string>): FilterOption[] =>
      Object.entries(labels).map(([value, label]) => ({ value, label }));

    /**
     * STATUS_LABELS van con chua khoa 'tat-ca' vi ProjectMapView va ProjectHero
     * dung no de to mau cho bieu tuong "Tat ca" trong chu thich/bang mau.
     * Day khong phai mot trang thai ban hang that, nen phai loc ra khoi danh
     * sach o loc - khong thi hang chip va bang loc deu hien "Tat ca" hai lan
     * (mot lan do FilterSelect/SegmentedControl chen them, mot lan tu day).
     */
    const realStatuses = Object.entries(STATUS_LABELS)
      .filter(([value]) => value !== 'tat-ca')
      .map(([value, label]) => ({ value, label }));

    return delay({
      developers: MOCK_DEVELOPERS,
      regions: MACRO_REGIONS,
      propertyTypes: toOptions(PROPERTY_TYPE_SEGMENT_LABELS),
      statuses: realStatuses,
      segments: toOptions(PROPERTY_TYPE_SEGMENT_LABELS),
      amenityTags: toOptions(AMENITY_TAG_LABELS),
      viewpoints: toOptions(VIEWPOINT_LABELS),
      legals: toOptions(LEGAL_LABELS),
      /** Nam ban giao co that trong du lieu, sap tang dan */
      handoverYears: [
        ...new Set(MOCK_PROJECTS.map((project) => project.handoverYear)),
      ].sort((a, b) => a - b),
    });
  },

  /** Khoi cuoi trang danh sach: cao tang / thap tang ban chay + moi nhat */
  highlights: async (): Promise<ProjectHighlightGroup[]> => {
    /**
     * Phep chieu dung chung cho ca ba nhom - de mot cho de khong xay ra canh
     * nhom nay co anh con nhom kia thi khong.
     */
    const toHighlight = ({ publicId, slug, name, thumbnailUrl }: Project) => ({
      publicId,
      slug,
      name,
      thumbnailUrl,
    });

    /** Uu tien du an hot, bo trung, lay toi da `size` phan tu */
    const pick = (list: Project[], size: number) => {
      const seen = new Set<string>();
      const picked: Project[] = [];

      for (const project of [...list].sort(
        (a, b) => Number(b.isHot) - Number(a.isHot),
      )) {
        if (seen.has(project.publicId)) continue;
        seen.add(project.publicId);
        picked.push(project);
        if (picked.length === size) break;
      }

      return picked.map(toHighlight);
    };

    const bySegment = (segment: Project['segment']) =>
      MOCK_PROJECTS.filter((project) => project.segment === segment);

    const newest = [...MOCK_PROJECTS].sort(
      (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
    );

    return delay([
      { key: 'cao-tang', title: 'Dự án cao tầng', projects: pick(bySegment('cao-tang'), 5) },
      { key: 'thap-tang', title: 'Dự án thấp tầng', projects: pick(bySegment('thap-tang'), 5) },
      {
        key: 'moi-nhat',
        title: 'Dự án mới nhất',
        projects: newest.slice(0, 5).map(toHighlight),
      },
    ]);
  },

  /**
   * Tong so can (quy can) cua moi du an - mot lan goi cho ca trang.
   *
   * Tra ve `Map<slug, count>` de card chi can `map.get(project.slug)` ma khong
   * phai loop. Bat buoc phai tra ve Map thay vi object vi key co the trung
   * nhau trong tuong lai (vi du them "versioned" slug).
   *
   * KHI CO BACKEND: GET /units/count-by-project tra ve Record<string, number>
   * nen chi can `new Map(Object.entries(record))`.
   */
  unitsCountBySlug: async (): Promise<Map<string, number>> => {
    const all = getAllUnitsAcrossProjects();
    const counts = new Map<string, number>();
    for (const unit of all) {
      counts.set(unit.projectSlug, (counts.get(unit.projectSlug) ?? 0) + 1);
    }
    return delay(counts);
  },

  /**
   * Chi tiet mot du an. Tra ve null khi khong co slug do - trang goi
   * notFound() de Next tra dung 404 thay vi trang trong.
   *
   * KHI CO BACKEND: GET /projects/:slug
   */
  detail: async (slug: string): Promise<ProjectDetail | null> =>
    delay(getProjectDetail(slug)),

  /**
   * Chi tiet mot phan khu trong du an.
   *
   * KHI CO BACKEND: GET /projects/:slug/phases/:phaseSlug
   */
  phase: async (projectSlug: string, phaseSlug: string): Promise<PhaseDetail | null> =>
    delay(getPhaseDetail(projectSlug, phaseSlug)),

  /**
   * Bang hang cua mot du an. Tach khoi `detail` vi mot du an co the co hang
   * nghin can - loc, sap xep va phan trang deu se do backend lam.
   *
   * KHI CO BACKEND: GET /projects/:slug/units?page=&limit=&sort=...
   */
  units: async (slug: string, query: UnitQuery): Promise<PaginatedUnits> => {
    const all = getProjectUnits(slug);

    // Bo loc lay tu chinh bang hang nen khong bao gio hien lua chon rong ket qua
    const facets = {
      phaseNames: [...new Set(all.map((unit) => unit.phaseName))],
      propertyTypeLabels: [...new Set(all.map((unit) => unit.propertyTypeLabel))],
      directions: [...new Set(all.map((unit) => unit.direction))],
    };

    const matched = all.filter((unit) => {
      if (query.phaseName && unit.phaseName !== query.phaseName) return false;
      if (query.propertyTypeLabel && unit.propertyTypeLabel !== query.propertyTypeLabel)
        return false;
      if (!matchesDirection(unit.direction, query.direction)) return false;
      if (query.status && unit.status !== query.status) return false;
      return true;
    });

    const sorted = sortUnits(matched, query.sort);
    const start = (query.page - 1) * query.limit;

    return delay({
      units: sorted.slice(start, start + query.limit),
      total: sorted.length,
      page: query.page,
      limit: query.limit,
      facets,
    });
  },

  /**
   * Quy can tong hop - toan bo can/san pham cua TAT CA du an, loc + phan
   * trang theo nhieu chieu (gia, dien tich, du an, phan khu, loai hinh, khu
   * vuc, chu dau tu, trang thai, huong, tu khoa).
   *
   * Nguyen tac: service la ranh gioi se thanh axios, nen moi logic loc /
   * sap xep / phan trang deu dat o day, KHONG roi vao component hay hook.
   *
   * KHI CO BACKEND: GET /units?q=&developerId=&regionId=&projectSlug=
   *                 &propertyTypeLabel=&phaseName=&direction=&status=
   *                 &priceMin=&priceMax=&areaMax=&sort=&page=&limit=
   */
  allUnits: async (query: AllUnitsQuery): Promise<PaginatedAllUnits> => {
    const all = getAllUnitsAcrossProjects();

    // Map slug -> metadata de filter nhanh va tra label cho facet.
    const projectBySlug = new Map(
      MOCK_PROJECTS.map((project) => [project.slug, project] as const),
    );

    const normalizedKeyword = normalize(query.search.trim());

    const matched = all.filter((unit) => {
      if (query.projectSlug && unit.projectSlug !== query.projectSlug) return false;

      const project = projectBySlug.get(unit.projectSlug);
      if (query.developerId && project?.developerId !== query.developerId) return false;
      if (query.regionId && project?.regionId !== query.regionId) return false;

      if (query.segment && unit.segment !== query.segment) return false;

      if (query.propertyTypeLabel && unit.propertyTypeLabel !== query.propertyTypeLabel) {
        return false;
      }
      if (query.phaseName && unit.phaseName !== query.phaseName) return false;
      if (!matchesDirection(unit.direction, query.direction)) return false;
      if (query.status && unit.status !== query.status) return false;
      if (!matchesFloorRange(unit.floor, query.floorRange)) return false;
      if (query.unitLine && unit.unitLine !== query.unitLine) return false;

      // Ma can go tay nen khop mot phan va bo dau/hoa thuong - moi gioi hay
      // nho mang may "A12" chu it khi nho du "BT-1205".
      if (query.code && !normalize(unit.code).includes(normalize(query.code))) {
        return false;
      }

      if (query.priceMin !== null && unit.listedPrice < query.priceMin) return false;
      if (query.priceMax !== null && unit.listedPrice > query.priceMax) return false;

      // Tu "dien tich dat toi da N m2" - can hop le neu dat khong vuot N.
      if (query.areaMax !== null && unit.landArea > query.areaMax) return false;

      if (!normalizedKeyword) return true;

      // Tim theo ma can, ten du an, chu dau tu, phan khu, dia chi.
      const haystack = normalize(
        `${unit.code} ${unit.projectName} ${unit.developerName} ${unit.phaseName} ${project?.address ?? ''}`,
      );
      return haystack.includes(normalizedKeyword);
    });

    // Sort rieng cho UnitWithProject (them projectIsHot lam thu tu phu).
    const sorted = [...matched];
    switch (query.sort) {
      case 'gia-tang':
        sorted.sort((a, b) => a.listedPrice - b.listedPrice);
        break;
      case 'gia-giam':
        sorted.sort((a, b) => b.listedPrice - a.listedPrice);
        break;
      case 'dien-tich-tang':
        sorted.sort((a, b) => a.landArea - b.landArea);
        break;
      case 'dien-tich-giam':
        sorted.sort((a, b) => b.landArea - a.landArea);
        break;
      default:
        // Mac dinh: can cua du an HOT truoc, sau do gia niem yet tang dan.
        sorted.sort((a, b) => {
          if (a.projectIsHot !== b.projectIsHot)
            return Number(b.projectIsHot) - Number(a.projectIsHot);
          return a.listedPrice - b.listedPrice;
        });
    }

    const start = (query.page - 1) * query.limit;

    /**
     * Facet dua tren TOAN BO can, khong phai tap da loc.
     *
     * Truoc day tinh tren tap da loc nen chon mot o la cac o khac tu bien mat,
     * bang loc nhay lien tuc va nguoi dung mat luon duong quay lai. Giu nguyen
     * danh sach thi bo loc dung yen; to hop nao khong co can thi so tren nut
     * "Xem N ket qua" tu ve 0 - da du de biet.
     */
    const facet = (exclude: 'projectSlug' | 'developerId' | 'regionId') => {
      const seen = new Set<string>();
      const result: { value: string; label: string }[] = [];
      for (const unit of all) {
        const project = projectBySlug.get(unit.projectSlug);
        if (exclude === 'projectSlug') {
          if (seen.has(unit.projectSlug)) continue;
          seen.add(unit.projectSlug);
          result.push({ value: unit.projectSlug, label: unit.projectName });
          continue;
        }
        if (exclude === 'developerId' && project) {
          const key = project.developerId;
          if (seen.has(key)) continue;
          seen.add(key);
          result.push({ value: project.developerId, label: project.developerName });
          continue;
        }
        if (exclude === 'regionId' && project) {
          const key = project.regionId;
          if (seen.has(key)) continue;
          seen.add(key);
          result.push({ value: project.regionId, label: project.regionName });
        }
      }
      return result.sort((a, b) => a.label.localeCompare(b.label, 'vi'));
    };

    return delay({
      units: sorted.slice(start, start + query.limit),
      total: sorted.length,
      page: query.page,
      limit: query.limit,
      facets: {
        projectSlugs: facet('projectSlug'),
        developerIds: facet('developerId'),
        regionIds: facet('regionId'),
        segments: SEGMENT_FILTER_OPTIONS.filter((option) =>
          all.some((unit) => unit.segment === option.value),
        ),
        propertyTypeLabels: [...new Set(all.map((unit) => unit.propertyTypeLabel))].sort(),
        phaseNames: [...new Set(all.map((unit) => unit.phaseName))].sort(),
        directions: [...new Set(all.map((unit) => unit.direction))].sort((a, b) =>
          a.localeCompare(b, 'vi'),
        ),
        statuses: [...new Set(all.map((unit) => unit.status))],
        // Chi giu khoang tang that su co can o dau - khong phu thuoc bo loc
        floorRanges: FLOOR_RANGE_OPTIONS.filter((option) =>
          all.some((unit) => matchesFloorRange(unit.floor, option.value)),
        ),
        unitLines: [
          ...new Set(
            all
              .map((unit) => unit.unitLine)
              .filter((line): line is string => Boolean(line)),
          ),
        ].sort(),
      },
    });
  },

  /**
   * San pham noi bat cho trang chu - gop can cua TAT CA du an.
   *
   * Quy tac chon (uu tien giam dan):
   *   1. Con hang ('con-hang')
   *   2. Cua du an HOT
   *   3. Da dang du an: lay round-robin qua tung du an, tranh canh 1 du an
   *      chiem het cac slot (moi du an toi da `perProjectLimit` can)
   *
   * Khong loc theo gia/dien tich/loai hinh - do la viec cua trang /du-an.
   * Section "San pham noi bat" tren trang chu chi can lay cai nhin tong quan.
   *
   * KHI CO BACKEND: GET /units/featured?limit=12
   */
  featuredUnits: async (limit = 12, perProjectLimit = 3): Promise<UnitWithProject[]> => {
    const all = getAllUnitsAcrossProjects();

    // Bo can da ban + giu cho - trang chu chi trung bay hang con ban
    const available = all.filter((unit) => unit.status === 'con-hang');

    // Nhom theo du an de chon round-robin
    const byProject = new Map<string, UnitWithProject[]>();
    for (const unit of available) {
      const list = byProject.get(unit.projectSlug) ?? [];
      list.push(unit);
      byProject.set(unit.projectSlug, list);
    }

    // Trong moi du an: can HOT len dau (can cua du an isHot), sau do gia
    // niem yet tang dan de gia re xuat hien truoc
    for (const [projectSlug, list] of byProject) {
      const projectIsHot = list[0]?.projectIsHot ?? false;
      list.sort((a, b) => {
        // projectIsHot khong doi theo unit nen lay tu bat ky element nao
        const aHot = a.projectIsHot === projectIsHot ? 0 : a.projectIsHot ? -1 : 1;
        const bHot = b.projectIsHot === projectIsHot ? 0 : b.projectIsHot ? -1 : 1;
        if (aHot !== bHot) return aHot - bHot;
        return a.listedPrice - b.listedPrice;
      });
      byProject.set(projectSlug, list);
    }

    // Thu tu project: HOT truoc, sau do theo ten de on dinh giua cac lan goi
    const projectOrder = [...byProject.keys()].sort((a, b) => {
      const aHot = byProject.get(a)?.[0]?.projectIsHot ?? false;
      const bHot = byProject.get(b)?.[0]?.projectIsHot ?? false;
      if (aHot !== bHot) return Number(bHot) - Number(aHot);
      return a.localeCompare(b);
    });

    const picked: UnitWithProject[] = [];
    let exhausted = false;

    // Moi vong lay 1 can tu moi du an (trong gioi han perProjectLimit)
    while (!exhausted && picked.length < limit) {
      exhausted = true;
      for (const slug of projectOrder) {
        if (picked.length >= limit) break;
        const list = byProject.get(slug);
        if (!list) continue;
        const taken = picked.filter((u) => u.projectSlug === slug).length;
        if (taken >= perProjectLimit) continue;
        const next = list[taken];
        if (!next) continue;
        picked.push(next);
        exhausted = false;
      }
    }

    return delay(picked);
  },
};
