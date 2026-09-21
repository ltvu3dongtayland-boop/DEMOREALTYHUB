'use client';

import { Link } from '@/i18n/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useTranslations } from 'next-intl';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useFavorites } from '@/common/hooks/useFavorites';
import ProjectCard from '@/modules/project/components/ProjectCard';
import type { Project } from '@/modules/project/models/project.model';

type FeaturedProjectsProps = {
  projects: Project[];
};

const FeaturedProjects = ({ projects: initialProjects }: FeaturedProjectsProps) => {
  const { favorites } = useFavorites();

  /**
   * Translation hook cho namespace `home.featured`. Key con `projects`
   * chứa title + label "Xem tất cả". Tách namespace theo feature
   * để không gom hết vào `common`.
   */
  const t = useTranslations('home.featured.projects');

  // Du an da tim len dau, giong /gio-hang. Sort cua JS on dinh nen cac du an
  // cung nhom giu nguyen thu tu goc.
  const projects = useMemo(() => {
    if (favorites.length === 0) return initialProjects;
    const favorite = new Set(favorites.map((entry) => entry.publicId));
    return [...initialProjects].sort(
      (a, b) => Number(favorite.has(b.publicId)) - Number(favorite.has(a.publicId)),
    );
  }, [initialProjects, favorites]);

  // `loop: true` khi < projects.length se khong hoat dong -> check.
  const canLoop = projects.length > 3;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: canLoop,
    slidesToScroll: 1,
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onReInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('reInit', onReInit);
    emblaApi.on('select', onSelect);

    emblaApi.reInit();
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onReInit);
    };
  }, [emblaApi, onSelect]);

  // Auto-play: tu dong scroll moi 3 giay, dung khi user tuong tac
  useEffect(() => {
    if (!emblaApi || !isAutoPlaying) return;

    const autoScroll = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);

    const stopAutoPlay = () => setIsAutoPlaying(false);
    emblaApi.on('pointerDown', stopAutoPlay);

    return () => {
      clearInterval(autoScroll);
      emblaApi.off('pointerDown', stopAutoPlay);
    };
  }, [emblaApi, isAutoPlaying]);

  return (
    <section className="bg-gray-50 py-8 md:py-12">
      <div className="site-container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 md:text-2xl">
              {t('title')}
            </h2>
          </div>
          <Link
            href="/du-an"
            className="inline-flex items-center gap-1 text-theme-sm font-medium text-brand-600 transition hover:text-brand-700"
          >
            {t('viewAll')}
            <FiChevronRight aria-hidden />
          </Link>
        </div>

        {/* ── Mobile carousel (<sm) ─────────────────────────────────────── */}
        <div className="sm:hidden">
          <div className="relative">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex gap-4">
                {projects.map((project) => (
                  <div
                    key={project.publicId}
                    className="flex-[0_0_88%] min-w-0"
                  >
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                emblaApi?.scrollPrev();
                setIsAutoPlaying(false);
              }}
              disabled={!canLoop && selectedIndex === 0}
              aria-label={t('title')}
              className="absolute left-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-card transition hover:bg-brand-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-700"
            >
              <FiChevronLeft aria-hidden className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                emblaApi?.scrollNext();
                setIsAutoPlaying(false);
              }}
              disabled={!canLoop && selectedIndex === scrollSnaps.length - 1}
              aria-label={t('title')}
              className="absolute right-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-card transition hover:bg-brand-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-700"
            >
              <FiChevronRight aria-hidden className="h-5 w-5" />
            </button>
          </div>

          {scrollSnaps.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {scrollSnaps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    emblaApi?.scrollTo(idx);
                    setIsAutoPlaying(false);
                  }}
                  aria-label={`${idx + 1}`}
                  aria-current={idx === selectedIndex ? 'true' : undefined}
                  className={`h-2 rounded-full transition-all ${
                    idx === selectedIndex
                      ? 'w-6 bg-brand-500'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Desktop grid (sm+) ─────────────────────────────────────────── */}
        <div className="hidden grid-cols-1 gap-5 sm:grid sm:grid-cols-2 lg:grid lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.publicId} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
