import { FiShare2, FiCalendar } from 'react-icons/fi';

interface UnitModalBottomProps {
  onShare?: () => void;
  onBookingLock?: () => void;
}

const UnitModalBottom = ({
  onShare,
  onBookingLock,
}: UnitModalBottomProps) => {
  return (
    <div className="border-t border-slate-100 bg-white py-2">
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onShare}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-white px-5 py-2 text-xs font-medium text-blue-600 transition-all hover:bg-blue-50/50 active:scale-95 max-md:flex-1 max-md:px-4 max-md:py-2.5"
        >
          <FiShare2 className="h-3.5 w-3.5 text-blue-600" />
          <span>Chia sẻ</span>
        </button>

        <button
          type="button"
          onClick={onBookingLock}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-6 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.98] max-md:flex-[1.4] max-md:px-4 max-md:py-2.5"
        >
          <FiCalendar className="h-3.5 w-3.5 text-white" />
          <span>BOOKING LOCK</span>
        </button>
      </div>
    </div>
  );
};

export default UnitModalBottom;