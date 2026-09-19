import { FiArrowUpRight, FiTrendingUp } from 'react-icons/fi';

import type { Profile } from '../mocks/profile.mock';

/**
 * Card "Dong Tot" hien thi so du + nut nap ngay.
 *
 * Design 2026: subtle gradient (10-20% saturation) voi clean icon thay vi
 * coin SVG inline. Layout 2 cot: left info, right CTA.
 */
const WalletCard = ({ wallet }: { wallet: Profile['wallet'] }) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm">
      <div className="flex items-start gap-4 p-5 sm:p-6">
        {/* Icon tile - gradient nhe, icon trang noi bat */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-warning-400 to-warning-600 text-white shadow-theme-xs">
          <FiTrendingUp aria-hidden className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-2xl font-bold text-gray-900 md:text-3xl">
              {wallet.balance.toLocaleString('vi-VN')}
            </span>
            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-500 px-4 py-2.5 text-theme-sm font-semibold text-white shadow-theme-xs transition hover:bg-brand-600"
            >
              Nạp ngay
              <FiArrowUpRight aria-hidden className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-0.5 text-theme-sm font-semibold text-gray-500">
            {wallet.title}
          </p>
          <p className="mt-0.5 text-theme-xs text-gray-500">{wallet.subtitle}</p>
        </div>
      </div>
    </section>
  );
};

export default WalletCard;
