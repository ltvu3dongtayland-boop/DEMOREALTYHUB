import Image from 'next/image';
import { FiPhone } from 'react-icons/fi';

interface Advisor {
  id: string | number;
  name: string;
  avatar: string;
  views: number;
  phone?: string;
  role?: string;
}

interface UnitModalAdvisorProps {
  advisors?: Advisor[];
  onCall?: (advisor: Advisor) => void;
  onMessage?: (advisor: Advisor) => void;
}

const DEFAULT_ADVISORS: Advisor[] = [
  {
    id: 1,
    name: 'Lân Thị Ngọc Anh',
    // role: 'Giám đốc dự án',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    views: 0,
    phone: '0901234567',
  },
  {
    id: 2,
    name: 'Nguyễn Văn Tuấn',
    // role: 'Chuyên viên kinh doanh',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
    views: 0,
    phone: '0908765432',
  },
  {
    id: 3,
    name: 'Trần Minh Hoàng',
    // role: 'Tư vấn khách hàng',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    views: 0,
    phone: '0909998888',
  },
];

const UnitModalAdvisor = ({
  advisors = DEFAULT_ADVISORS,
  onCall,
  onMessage
}: UnitModalAdvisorProps) => {
  // Giới hạn tối đa 3 advisors
  const displayAdvisors = advisors.slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 max-md:flex max-md:overflow-x-auto max-md:pb-1">
      {displayAdvisors.map((advisor) => (
        <div
          key={advisor.id}
          className="flex items-center gap-3 rounded-2xl border border-blue-100/80 bg-gradient-to-b from-blue-50/40 to-slate-50/80 p-3 shadow-2xs transition-shadow hover:shadow-xs max-md:min-w-[210px]"
        >
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex flex-col items-center gap-1 max-md:items-start">
              <h4 className="text-xs font-bold text-slate-900" title={advisor.name}>
                {advisor.name}
              </h4>
              {advisor.role && (
                <span className="text-[10px] font-medium text-blue-600">
                  {advisor.role}
                </span>
              )}
              <div className="flex items-center gap-2">
                <img
                  src={advisor.avatar}
                  alt={advisor.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => onCall ? onCall(advisor) : window.open(`tel:${advisor.phone}`)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs transition-all hover:bg-emerald-600 active:scale-95"
                  title="Gọi điện"
                >
                  <FiPhone className="h-4 w-4 fill-white" />
                </button>
                <button
                  type="button"
                  onClick={() => onMessage && onMessage(advisor)}
                  className="flex h-12 w-12 items-center justify-center rounded-lg transition-all active:scale-95"
                  title="Nhắn tin"
                >
                  <Image src="/images/logo-zalo.webp" alt="Zalo" width={32} height={32} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UnitModalAdvisor;