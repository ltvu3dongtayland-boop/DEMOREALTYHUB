'use client';

import { useEffect, useState } from 'react';
import { FiArrowUp } from 'react-icons/fi';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!isVisible) return null;

  return (
    // Stack các nút ở góc phải dưới, từ thấp lên cao:
    //   - bottom-6: BackToTop (z-30, thấp nhất)
    //   - bottom-24: Zalo (z-35, giữa)
    //   - bottom-44: ChatWidget (z-40, cao nhất)
    // Tất cả đều 56x56px.
    // Dưới lg còn `MobileBottomTabs` (cao 56px) chiếm đáy màn hình nên cả
    // chồng nút phải đẩy lên thêm 56px, nếu không nút sẽ che mất tab.
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Lên đầu trang"
      data-clean-hide="floating-widget"
      className="fixed bottom-20 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-card-hover transition hover:bg-brand-600 lg:bottom-6"
    >
      <FiArrowUp aria-hidden />
    </button>
  );
};

export default BackToTop;
