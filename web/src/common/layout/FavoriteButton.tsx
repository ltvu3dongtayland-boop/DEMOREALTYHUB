'use client';

import Link from 'next/link';
import { FiHeart } from 'react-icons/fi';

import { useFavorites } from '@/common/hooks/useFavorites';
import { useFavoriteUnits } from '@/common/hooks/useFavoriteUnits';

type FavoriteButtonProps = {
  /** Color classes cho icon khi header o trang thai transparent / solid. */
  iconClass: string;
  /**
   * Extra classes cho wrapper <Link>. Dung de cac layout khac (Header,
   * Drawer) co the an nut trong Clean Mode ma khong phai sua component.
   */
  wrapperClassName?: string;
};

const FavoriteButton = ({ iconClass, wrapperClassName }: FavoriteButtonProps) => {
  const { favorites: projects, isHydrated: projectsHydrated } = useFavorites();
  const { favorites: units, isHydrated: unitsHydrated } = useFavoriteUnits();
  const isHydrated = projectsHydrated && unitsHydrated;
  const count = projects.length + units.length;

  const showBadge = isHydrated && count > 0;
  const badgeText = count > 99 ? '99+' : String(count);

  return (
    <Link
      href="/yeu-thich"
      aria-label={
        showBadge
          ? `Yêu thích - ${count} mục đã lưu`
          : 'Yêu thích'
      }
      data-clean-hide="utility-link"
      className={`relative flex h-9 w-9 items-center justify-center rounded-full transition ${iconClass} ${wrapperClassName ?? ''}`.trim()}
    >
      <FiHeart aria-hidden className="h-5 w-5" />
      {showBadge && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
        >
          {badgeText}
        </span>
      )}
    </Link>
  );
};

export default FavoriteButton;
