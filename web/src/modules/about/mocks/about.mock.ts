import type { ComponentType } from 'react';

import {
  HiOutlineAcademicCap,
  HiOutlineArrowsRightLeft,
  HiOutlineBuildingOffice2,
  HiOutlineCalculator,
  HiOutlineDocumentCheck,
  
  HiOutlineIdentification,
  HiOutlineLockClosed,
  HiOutlineNewspaper,
  
  HiOutlineTag,
  HiOutlineUserGroup,
} from 'react-icons/hi2';

type Icon = ComponentType<{ 'aria-hidden'?: boolean; className?: string }>;

export type AboutFact = { label: string; value: string };
export type AboutCommitment = { icon: Icon; title: string; description: string };
export type AboutStat = { value: string; label: string; note: string };
export type AboutStep = { title: string; description: string };
export type AboutModule = {
  icon: Icon;
  title: string;
  description: string;
  image: string;
  href: string;
};
export type AboutOffice = { city: string; address: string };
export type AboutAward = { title: string; period: string };
export type AboutFaq = { question: string; answer: string };

export type AboutContent = {
  hero: {
    eyebrow: string;
    headline: string;
    lead: string;
    promises: string[];
    facts: AboutFact[];
    heroImage: string;
  };
  commitments: { title: string; subtitle: string; image: string; items: AboutCommitment[] };
  stats: { title: string; updatedAt: string; image: string; items: AboutStat[] };
  curation: { title: string; subtitle: string; image: string; steps: AboutStep[] };
  modules: { title: string; subtitle: string; items: AboutModule[] };
  company: {
    title: string;
    subtitle: string;
    legalName: string;
    license: string;
    since: string;
    representative: string;
    headquarters: string;
    phones: string[];
    email: string;
    offices: AboutOffice[];
    awards: AboutAward[];
    certifications: { label: string; image: string; href: string }[];
  };
  faq: { title: string; subtitle: string; items: AboutFaq[] };
  cta: {
    title: string;
    body: string;
    buyerLabel: string;
    buyerHref: string;
    agentNote: string;
  };
};

const PROBLEM_IMAGE = '/images/projects/vinhomes-ocean-park-gia-lam/hero-1-hoang-hon-ho-trung-tam.jpg';
const PROJECT_IMG = '/images/projects/vinhomes-ocean-park-gia-lam';

export const MOCK_ABOUT_CONTENT: AboutContent = {
  hero: {
    eyebrow: 'Về RealtyHub',
    headline: 'Mua nhà không nên là một canh bạc thông tin',
    lead: 'RealtyHub công khai giá niêm yết, tình trạng pháp lý và mặt bằng của từng dự án — trước khi bạn phải gọi cho ai. Nền tảng do Công ty Cổ phần Đông Tây Land vận hành.',
    promises: ['Giá niêm yết công khai', 'Pháp lý ghi rõ từng dự án', 'Môi giới đều định danh'],
    facts: [
      { label: 'Pháp nhân vận hành', value: 'CTCP Đông Tây Land' },
      { label: 'Giấy phép ĐKKD', value: '0312312011' },
      { label: 'Hoạt động từ', value: '05/06/2013' },
      { label: 'Văn phòng', value: '5 tỉnh thành' },
    ],
    heroImage: '/images/about/hero.jpg',
  },


  commitments: {
    title: 'Năm cam kết chúng tôi tự ràng buộc',
    subtitle: 'Đây là những điều bạn có thể kiểm chứng, không phải khẩu hiệu.',
    image: PROBLEM_IMAGE,
    items: [
      {
        icon: HiOutlineTag,
        title: 'Tra cứu miễn phí, không tường phí',
        description:
          'Toàn bộ giá, mặt bằng, pháp lý và tiến độ đều xem được mà không cần đăng ký tài khoản.',
      },
      {
        icon: HiOutlineLockClosed,
        title: 'Không bán dữ liệu của bạn',
        description:
          'Thông tin bạn để lại chỉ chuyển tới chuyên viên phụ trách dự án đó. Không chia sẻ cho bên thứ ba.',
      },
      {
        icon: HiOutlineDocumentCheck,
        title: 'Sai thì sửa, và nói rõ đã sửa',
        description:
          'Phát hiện thông tin sai, báo cho chúng tôi — sửa trong 24 giờ làm việc và ghi chú ngày cập nhật.',
      },
      {
        icon: HiOutlineIdentification,
        title: 'Không tin đăng ảo',
        description:
          'Dự án chỉ lên sàn khi có hồ sơ từ chủ đầu tư hoặc đơn vị phân phối chính thức.',
      },
      {
        icon: HiOutlineUserGroup,
        title: 'Không ép mua',
        description:
          'Bạn để lại thông tin để được tư vấn, không phải để bị gọi mỗi ngày. Muốn dừng, nhắn một câu là dừng.',
      },
    ],
  },

  stats: {
    title: 'Nền tảng đang ở đâu',
    updatedAt: 'Số liệu cập nhật ngày 01/08/2026',
    image: '/images/heroes/tin-tuc.jpg',
    items: [
      { value: '1.200', label: 'Dự án trên nền tảng', note: 'Từ 40+ chủ đầu tư' },
      { value: '50.000+', label: 'Người dùng tra cứu', note: 'Trong 12 tháng gần nhất' },
      { value: '300', label: 'Chuyên viên định danh', note: 'Đều có hồ sơ công khai' },
      { value: '6', label: 'Năm vận hành', note: 'Từ 2019 đến nay' },
    ],
  },

  curation: {
    title: 'Một dự án lên sàn như thế nào',
    subtitle: 'Chúng tôi công khai quy trình để bạn biết dữ liệu mình đọc từ đâu ra.',
    image: `${PROJECT_IMG}/mat-bang-phan-lo-tong-the.jpg`,
    steps: [
      {
        title: 'Nhận hồ sơ gốc',
        description:
          'Chỉ nhận từ chủ đầu tư hoặc đơn vị phân phối được uỷ quyền. Không lấy tin từ nguồn trôi nổi.',
      },
      {
        title: 'Đối chiếu pháp lý',
        description:
          'Kiểm tra chấp thuận chủ trương, giấy phép xây dựng và tình trạng sổ trước khi đăng.',
      },
      {
        title: 'Dựng bảng giá và mặt bằng',
        description:
          'Số hoá mặt bằng phân lô, bảng hàng và chính sách bán hàng theo đúng bản chủ đầu tư công bố.',
      },
      {
        title: 'Cập nhật định kỳ',
        description:
          'Giá và tình trạng căn được rà lại hằng tuần. Mỗi trang đều ghi ngày cập nhật gần nhất.',
      },
    ],
  },

  modules: {
    title: 'Bạn dùng được gì trên RealtyHub',
    subtitle: 'Sáu công cụ, dùng chung một nguồn dữ liệu.',
    items: [
      {
        icon: HiOutlineBuildingOffice2,
        title: 'Giỏ hàng dự án',
        description:
          'Dự án đang mở bán kèm bảng giá, mặt bằng, tiến độ và pháp lý — cập nhật từ chủ đầu tư.',
        image: `${PROJECT_IMG}/hero-3-phoi-canh-tong-the.jpg`,
        href: '/du-an',
      },
      {
        icon: HiOutlineArrowsRightLeft,
        title: 'So sánh dự án',
        description:
          'Đặt các dự án cạnh nhau theo giá, diện tích, vị trí và chính sách để thấy rõ khác biệt.',
        image: `${PROJECT_IMG}/mat-bang-tong-the-du-an.jpg`,
        href: '/so-sanh',
      },
      {
        icon: HiOutlineCalculator,
        title: 'Tính khoản vay',
        description:
          'Ước tính khoản vay, lịch trả nợ và dòng tiền trước khi quyết định xuống tiền.',
        image: '/images/guide/guide-13.jpg',
        href: '/tien-ich',
      },
      {
        icon: HiOutlineUserGroup,
        title: 'CRM cho môi giới',
        description: 'Quản lý khách hàng, lịch hẹn và tiến độ giao dịch cùng chỗ với giỏ hàng.',
        image: '/images/guide/guide-08.jpg',
        href: '/crm',
      },
      {
        icon: HiOutlineAcademicCap,
        title: 'Đào tạo nghề',
        description:
          'Khoá học nền tảng và chuyên sâu cho môi giới mới, có chứng nhận sau khi hoàn thành.',
        image: '/images/guide/guide-02.jpg',
        href: '/dao-tao',
      },
      {
        icon: HiOutlineNewspaper,
        title: 'Tin tức thị trường',
        description: 'Phân tích, nhận định và cập nhật chính sách để bạn nắm nhịp thị trường.',
        image: `${PROJECT_IMG}/tien-ich-vincom-mega-mall.jpg`,
        href: '/tin-tuc',
      },
    ],
  },

  company: {
    title: 'Ai đứng sau RealtyHub',
    subtitle: 'Thông tin pháp nhân công khai — bạn có thể tra cứu độc lập.',
    legalName: 'Công ty Cổ phần Đông Tây Land',
    license: '0312312011',
    since: '05/06/2013',
    representative: 'Ông Nguyễn Thái Bình — Chủ tịch Hội đồng Quản trị',
    headquarters: '192 Trần Não, Phường An Khánh, Thành phố Hồ Chí Minh',
    phones: ['0977 48 7777', '093 112 9988'],
    email: 'info@realtyhub.com.vn',
    offices: [
      { city: 'Hà Nội', address: 'Tầng 4, DRC Tower, 54A Nguyễn Chí Thanh, Đống Đa' },
      { city: 'Đà Nẵng', address: 'Tầng 8, 218 Bạch Đằng, Hải Châu' },
      { city: 'Nha Trang', address: 'Tầng 7, VCN Tower, 2 Tôn Thất Thuyết, Khánh Hoà' },
      { city: 'Cần Thơ', address: 'Tầng 6, TTTM Sense City, Hưng Lợi, Ninh Kiều' },
      { city: 'Phú Quốc', address: 'Số 10, Đường Bãi Trường, Dương Tơ, Kiên Giang' },
    ],
    awards: [
      { title: 'Top 10 sàn giao dịch bất động sản xuất sắc Việt Nam', period: '2022 – 2023' },
      { title: 'Sàn giao dịch BĐS tiêu biểu khu vực miền Nam', period: '2021 – 2023' },
      { title: 'Đơn vị phân phối xuất sắc Vinhomes', period: '2023' },
      { title: 'Top thương hiệu uy tín ngành BĐS Việt Nam', period: '2023' },
      { title: 'Dot Property Awards — Best Developer Partner', period: '2024' },
    ],
    certifications: [
      {
        label: 'Đã thông báo Bộ Công Thương',
        image: '/images/home/Bo_Cong_Thuong.jpg',
        href: '#',
      },
      { label: 'DMCA Protected', image: '/images/home/DMCA.jpg', href: '#' },
    ],
  },

  faq: {
    title: 'Những câu hỏi thẳng',
    subtitle: 'Chúng tôi trả lời cả những câu không có lợi cho mình.',
    items: [
      {
        question: 'Dữ liệu giá lấy từ đâu?',
        answer:
          'Từ bảng giá chủ đầu tư hoặc đơn vị phân phối công bố tại thời điểm cập nhật. Giá bất động sản thay đổi theo đợt mở bán, nên mỗi trang dự án đều ghi ngày cập nhật gần nhất. Con số trên nền tảng là để bạn ước lượng, hợp đồng mới là căn cứ cuối cùng.',
      },
      {
        question: 'RealtyHub có thu phí người mua không?',
        answer:
          'Không. Tra cứu, so sánh và tư vấn đều miễn phí với người mua. Nền tảng có doanh thu từ phí dịch vụ với chủ đầu tư và đơn vị phân phối.',
      },
      {
        question: 'Vậy thông tin có bị thiên vị theo bên trả tiền không?',
        answer:
          'Đây là câu hỏi đúng cần đặt ra. Chúng tôi tách bạch: dự án trả phí có thể được ưu tiên hiển thị, nhưng giá, pháp lý và tiến độ thì không được sửa. Vị trí hiển thị có thể mua; số liệu thì không.',
      },
      {
        question: 'Thông tin cá nhân của tôi đi đâu?',
        answer:
          'Chỉ chuyển tới chuyên viên phụ trách dự án bạn quan tâm. Không bán, không trao đổi với bên thứ ba. Bạn yêu cầu xoá thì chúng tôi xoá.',
      },
      {
        question: 'Nếu thông tin trên nền tảng sai thì sao?',
        answer:
          'Bạn báo qua nút "Báo cáo" trên trang dự án hoặc gửi email. Chúng tôi kiểm tra và sửa trong 24 giờ làm việc, đồng thời ghi lại ngày sửa để bạn đối chiếu.',
      },
      {
        question: 'RealtyHub có bán bất động sản không?',
        answer:
          'Nền tảng không phải chủ đầu tư. Chúng tôi tổng hợp thông tin và kết nối bạn với đơn vị phân phối chính thức. Giao dịch và hợp đồng vẫn ký trực tiếp với chủ đầu tư.',
      },
    ],
  },

  cta: {
    title: 'Bắt đầu từ việc xem giá thật',
    body: 'Không cần đăng ký, không cần để lại số điện thoại. Xem trước rồi hãy quyết định có cần tư vấn hay không.',
    buyerLabel: 'Xem giỏ hàng dự án',
    buyerHref: '/du-an',
    agentNote: 'Bạn là môi giới muốn hợp tác? Để lại thông tin bên dưới.',
  },
};


export type MemberCompany = { name: string; note?: string; address: string };

export const MEMBER_COMPANIES: MemberCompany[] = [
  {
    name: 'Công ty Cổ phần Đông Tây Land',
    note: 'Trụ sở chính',
    address: '192 Trần Não, Khu phố 2, Phường An Khánh, TP. Hồ Chí Minh',
  },
  {
    name: 'Công ty Cổ phần Bất động sản Đông Tây Property',
    address: '1/21 Đông Tây 1, Khu nhà ở 4,8 ha, TP. Hồ Chí Minh',
  },
  {
    name: 'Công ty Cổ phần Đông Tây Land Phú Mỹ Hưng',
    address:
      '1431 Nguyễn Văn Linh, Khu phố Mỹ Toàn 2-H4, Phường Tân Hưng, TP. Hồ Chí Minh',
  },
  {
    name: 'Công ty Cổ phần Đông Tây Miền Bắc',
    address: '17C2, KĐT Nam Trung Yên, Phường Yên Hòa, Hà Nội',
  },
  {
    name: 'Công ty Cổ phần Đông Tây Global',
    address: '192 Trần Não, Khu phố 2, Phường An Khánh, TP. Hồ Chí Minh',
  },
  {
    name: 'Công ty Cổ phần Đông Tây Hospitality',
    address: '192 Trần Não, Khu phố 2, Phường An Khánh, TP. Hồ Chí Minh',
  },
  {
    name: 'Công ty TNHH Đầu tư Thương mại Du lịch Kim Sa',
    address: 'Ấp Hồ Tràm, Xã Hồ Tràm, TP. Hồ Chí Minh',
  },
  {
    name: 'Công ty Cổ phần Du lịch Long An (LATOURCO)',
    address: 'Số 162 Hùng Vương, Phường Long An, Tỉnh Tây Ninh',
  },
  {
    name: 'Công ty Cổ phần Đông Tây Holding',
    address: '192 Trần Não, Khu phố 2, Phường An Khánh, TP. Hồ Chí Minh',
  },
  { name: 'Công ty Cổ phần Đầu tư Cần Giuộc', address: '' },
  { name: 'Công ty Cổ phần Đầu tư Cần Đước', address: '' },
];
