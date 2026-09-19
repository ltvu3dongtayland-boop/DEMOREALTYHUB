'use client';

import { Link } from '@/i18n/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useTranslations } from 'next-intl';
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiVideo,
  FiChevronRight,
  FiChevronLeft,
} from 'react-icons/fi';
import PlaceholderThumb from '@/common/components/PlaceholderThumb';
import { formatNumber } from '@/common/utils/format';
import {
  type EventItem,
  EVENT_TYPE_LABELS,
  EVENT_STATUS_LABELS,
} from '@/modules/events/models/event.model';
import { MOCK_EVENTS } from '@/modules/events/mocks/events.mock';

type FeaturedEventsProps = {
  /** Su kien de hien thi (mac dinh lay tu mock). */
  events?: EventItem[];
  /** Gioi han so luong su kien hien thi. Mac dinh: 6 */
  limit?: number;
};

const TIMEZONE = 'Asia/Ho_Chi_Minh';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TIMEZONE,
});

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TIMEZONE,
});

/**
 * Format ngay: "15.08.2026"
 */
const formatDate = (iso: string) => {
  const parts = dateFormatter.formatToParts(new Date(iso));
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  return `${pick('day')}.${pick('month')}.${pick('year')}`;
};

/**
 * Format gio: "14:00"
 */
const formatTime = (iso: string) => {
  const parts = timeFormatter.formatToParts(new Date(iso));
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '';
  return `${hour}:${minute}`;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

/** Lay upcoming + ongoing events, sort theo startAt. */
const useFeaturedEvents = (events: EventItem[], limit: number) => {
  return useMemo(() => {
    const now = new Date();
    const upcomingAndOngoing = events.filter(
      (e) =>
        (e.status === 'upcoming' || e.status === 'ongoing') &&
        Boolean(e.coverImage || e.thumbnailUrl),
    );
    const sorted = [...upcomingAndOngoing].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );
    return sorted.slice(0, limit);
  }, [events, limit]);
};

const FeaturedEvents = ({ events, limit = 6 }: FeaturedEventsProps) => {
  const allEvents = events ?? MOCK_EVENTS;
  const featuredEvents = useFeaturedEvents(allEvents, limit);

  // `home.featured.events.*` chứa title + label "Xem tất cả" của section
  // này. Đặt ở component để không đẩy logic lên page cha.
  const t = useTranslations('home.featured.events');

  // `loop: true` khi > slidesPerView de khong bi gap.
  const canLoop = featuredEvents.length > 3;

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

  // Auto-play: tu dong scroll moi 4 giay, dung khi user tuong tac.
  useEffect(() => {
    if (!emblaApi || !isAutoPlaying) return;

    const autoScroll = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    const stopAutoPlay = () => setIsAutoPlaying(false);
    emblaApi.on('pointerDown', stopAutoPlay);

    return () => {
      clearInterval(autoScroll);
      emblaApi.off('pointerDown', stopAutoPlay);
    };
  }, [emblaApi, isAutoPlaying]);

  if (featuredEvents.length === 0) return null;

  return (
    <section className="bg-gray-50 py-8 md:py-12">
      <div className="site-container">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 md:text-2xl">
              {t('title')}
            </h2>
          </div>
          <Link
            href="/su-kien"
            className="inline-flex items-center gap-1 text-theme-sm font-medium text-brand-600 transition hover:text-brand-700"
          >
            {t('viewAll')}
            <FiChevronRight aria-hidden />
          </Link>
        </div>

        {/* ── Mobile carousel (<sm) ─────────────────────────────────── */}
        <div className="sm:hidden">
          <div className="relative">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex gap-4">
                {featuredEvents.map((event, index) => (
                  <div
                    key={event.publicId}
                    className="flex-[0_0_88%] min-w-0"
                  >
                    <EventCard
                      event={event}
                      ctaLabel={index === featuredEvents.length - 1 ? 'Đăng ký' : 'Xem chi tiết'}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Prev button */}
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

            {/* Next button */}
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

          {/* Dot indicator */}
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

        {/* ── Desktop grid (sm+) ─────────────────────────────────────── */}
        <div className="hidden grid-cols-1 gap-5 sm:grid sm:grid-cols-2 lg:grid lg:grid-cols-3">
          {featuredEvents.map((event, index) => (
            <EventCard
              key={event.publicId}
              event={event}
              ctaLabel={index === featuredEvents.length - 1 ? 'Đăng ký' : 'Xem chi tiết'}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/** Card su kien: cover + info + action. */
const EventCard = ({
  event,
  ctaLabel = 'Xem chi tiết',
}: {
  event: EventItem;
  ctaLabel?: 'Xem chi tiết' | 'Đăng ký';
}) => {
  const href = `/su-kien/${event.slug}`;
  const isOnline = event.location.isOnline;
  const tone = EVENT_TYPE_LABELS[event.type] ?? event.type;

  // Capacity badge
  const capacityPercent = event.capacity
    ? Math.round((event.registered / event.capacity) * 100)
    : null;
  const isFull = event.capacity && event.registered >= event.capacity;
  const isAlmostFull = capacityPercent !== null && capacityPercent >= 80 && !isFull;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card transition hover:border-brand-200 hover:shadow-card-hover">
      {/* ── Cover image ─────────────────────────────────────────── */}
      <Link href={href} className="relative block aspect-video w-full overflow-hidden bg-gray-100">
        {event.coverImage || event.thumbnailUrl ? (
          <PlaceholderThumb
            seed={event.publicId}
            src={event.coverImage || event.thumbnailUrl}
            alt={`Ảnh bìa sự kiện ${event.title}`}
            className="transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-linear-to-br from-brand-500 to-brand-700">
            <FiCalendar aria-hidden className="h-12 w-12 text-white/50" />
          </div>
        )}

        {/* Type badge */}
        <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-3 py-1 text-theme-xs font-semibold text-white">
          {tone}
        </span>

        {/* Status badge */}
        {event.status === 'ongoing' && (
          <span className="absolute right-3 top-3 rounded-full bg-green-500 px-3 py-1 text-theme-xs font-semibold text-white">
            {EVENT_STATUS_LABELS[event.status]}
          </span>
        )}
      </Link>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Title */}
        <Link href={href}>
          <h3 className="line-clamp-2 h-12 text-base font-bold leading-snug text-gray-900 transition group-hover:text-brand-600">
            {event.title}
          </h3>
        </Link>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-theme-sm text-gray-600">
          <FiCalendar aria-hidden className="h-4 w-4 shrink-0 text-brand-500" />
          <span>
            {formatDate(event.startAt)}
            {event.endAt && ` · ${formatTime(event.startAt)}`}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-theme-sm text-gray-600">
          {isOnline ? (
            <FiVideo aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
          ) : (
            <FiMapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
          )}
          <span className="line-clamp-1">
            {event.location.name}
            {!isOnline && event.location.address && ` – ${event.location.address}`}
          </span>
        </div>

        {/* Capacity + Price */}
        <div className="flex items-center justify-between">
          {/* Capacity */}
          <div className="flex items-center gap-1.5 text-theme-sm text-gray-600">
            <FiUsers aria-hidden className="h-4 w-4 text-gray-400" />
            <span>
              {formatNumber(event.registered)}
              {event.capacity && `/${formatNumber(event.capacity)}`}
              {' đã đăng ký'}
            </span>
          </div>

          {/* Price */}
          <span className="text-theme-sm font-semibold text-brand-600">
            {event.isFree ? 'Miễn phí' : (event.price ? formatPrice(event.price) : 'Liên hệ')}
          </span>
        </div>

        {/* Capacity progress bar */}
        {event.capacity && capacityPercent !== null && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${
                isFull
                  ? 'bg-red-500'
                  : isAlmostFull
                    ? 'bg-orange-500'
                    : 'bg-brand-500'
              }`}
              style={{ width: `${Math.min(capacityPercent, 100)}%` }}
            />
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          <Link
            href={href}
            aria-label={`${ctaLabel} ${event.title}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2.5 text-theme-sm font-semibold text-white transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            {ctaLabel}
            {ctaLabel === 'Xem chi tiết' && (
              <FiChevronRight aria-hidden className="text-base" />
            )}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default FeaturedEvents;
