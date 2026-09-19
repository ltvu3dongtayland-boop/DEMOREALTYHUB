import Image from "next/image";
import Link from "next/link";

import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiDownload,
  FiMapPin,
  FiUsers,
  FiVideo,
  FiXCircle,
} from "react-icons/fi";

import PlaceholderThumb from "@/common/components/PlaceholderThumb";

import type { Metadata } from "next";

import {
  EVENT_TYPE_FILTERS,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_TONE,
  type EventItem,
  type EventType,
} from "@/modules/events/models/event.model";
import { MOCK_EVENTS } from "@/modules/events/mocks/events.mock";

/**
 * Trang /su-kien - Lịch sự kiện BĐS (workshop, hội thảo, networking, open house, webinar).
 *
 * Layout (server component, searchParams cho filter):
 *   01 Hero (gradient navy -> purple, breadcrumb + 5 filter chips)
 *   02 Featured event (1 su kien sap dien ra gan nhat, full-width card co countdown)
 *   03 Upcoming events (grid 3 col, co CTA dang ky + Add to Calendar)
 *   04 Past events (grid 3 col, xem lai, chi hien thi khi co data)
 *   05 Submit-event CTA (to chuc su kien cua ban)
 *
 * SearchParams:
 *   - type: EventType | undefined (filter)
 *   - status: 'upcoming' | 'past' | 'all' | undefined (tab)
 *
 * Khac tin-tuc:
 *   - Khong co pagination (event it, hien thi full)
 *   - Co CTA "Dang ky tham du" + "Them vao lich" (.ics file generate inline)
 *   - Past events co nut "Xem lai" thay "Dang ky"
 */
export const metadata: Metadata = {
  title: "Sự kiện",
  description:
    "Workshop, hội thảo, webinar và networking về bất động sản — cập nhật lịch sự kiện RealtyHub mới nhất.",
};

// ============================================================================
// Route types
// ============================================================================

type PageSearchParams = {
  type?: string;
  status?: string;
};

const TYPE_ALL = "all" as const;
type TypeFilter = EventType | typeof TYPE_ALL;
type StatusFilter = "upcoming" | "past" | "all";

const parseType = (raw: string | undefined): TypeFilter => {
  if (
    raw === "workshop" ||
    raw === "seminar" ||
    raw === "networking" ||
    raw === "open-house" ||
    raw === "webinar"
  ) {
    return raw;
  }
  return TYPE_ALL;
};

const parseStatus = (raw: string | undefined): StatusFilter => {
  if (raw === "upcoming" || raw === "past") return raw;
  return "all";
};

const buildHref = (
  next: Partial<PageSearchParams>,
  current: PageSearchParams,
): string => {
  const params = new URLSearchParams();
  const merged = { ...current, ...next };
  if (merged.type && merged.type !== TYPE_ALL) params.set("type", merged.type);
  if (merged.status && merged.status !== "all")
    params.set("status", merged.status);
  const qs = params.toString();
  return qs ? `/su-kien?${qs}` : "/su-kien";
};

// ============================================================================
// Helpers
// ============================================================================

const NOW = new Date("2026-08-09T15:00:00.000+07:00");

/** Tinh status thuc te theo NOW (override status trong mock neu qua han) */
const computeStatus = (event: EventItem): EventItem["status"] => {
  const start = new Date(event.startAt).getTime();
  const end = event.endAt
    ? new Date(event.endAt).getTime()
    : start + 2 * 60 * 60 * 1000;
  const nowMs = NOW.getTime();

  if (event.capacity && event.registered >= event.capacity) return "full";
  if (nowMs < start) return "upcoming";
  if (nowMs >= start && nowMs <= end) return "ongoing";
  return "past";
};

const formatTime = (iso: string): string =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

const formatDateLong = (iso: string): string =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

const formatPrice = (event: EventItem): string =>
  event.isFree
    ? "Miễn phí"
    : new Intl.NumberFormat("vi-VN").format(event.price ?? 0) + "đ";

/** So ngay con lai (lam tron xuong) */
const daysUntil = (iso: string): number => {
  const diff = new Date(iso).getTime() - NOW.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/** Gen file .ics de user download "Add to Calendar" */
const generateIcs = (event: EventItem): string => {
  const fmt = (isoStr: string) =>
    new Date(isoStr)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RealtyHub//Events//VI",
    "BEGIN:VEVENT",
    `UID:${event.publicId}@realtyhub.vn`,
    `DTSTAMP:${fmt(NOW.toISOString())}`,
    `DTSTART:${fmt(event.startAt)}`,
    event.endAt ? `DTEND:${fmt(event.endAt)}` : `DTEND:${fmt(event.startAt)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.excerpt.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location.isOnline ? event.location.name : `${event.location.name}, ${event.location.address ?? ""}`}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
};

/** Data URI cho <a download="event.ics" href={...}> */
const toIcsDataUri = (event: EventItem): string => {
  const ics = generateIcs(event);
  // base64 an toan cho UTF-8
  const b64 =
    typeof window === "undefined"
      ? Buffer.from(ics, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(ics)));
  return `data:text/calendar;charset=utf-8;base64,${b64}`;
};

// ============================================================================
// Page
// ============================================================================

const SuKienPage = async ({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) => {
  const params = await searchParams;
  const type = parseType(params.type);
  const status = parseStatus(params.status);

  // Compute status + filter
  const withStatus = MOCK_EVENTS.map((e) => ({
    ...e,
    status: computeStatus(e),
  }));
  const filteredByType =
    type === TYPE_ALL ? withStatus : withStatus.filter((e) => e.type === type);

  const upcomingEvents = filteredByType
    .filter(
      (e) =>
        e.status === "upcoming" ||
        e.status === "ongoing" ||
        e.status === "full",
    )
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );

  const pastEvents = filteredByType
    .filter((e) => e.status === "past")
    .sort(
      (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
    );

  // Featured = upcoming event som nhat, co speakers (uu tien)
  const featured =
    upcomingEvents.find((e) => e.speakers && e.speakers.length > 0) ??
    upcomingEvents[0];

  // Counts
  const countByType = (t: TypeFilter): number =>
    t === TYPE_ALL
      ? withStatus.filter((e) => e.status !== "past").length
      : withStatus.filter((e) => e.type === t && e.status !== "past").length;

  return (
    <main className="bg-white">
      {/* ============ 01 HERO ============ */}
      {/* <section className="relative isolate overflow-hidden bg-gray-900 py-16 text-white md:py-20">
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image
            src="/images/heroes/su-kien.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/92 via-brand-950/88 to-purple-950/92" />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="site-container relative">
          <div className="mx-auto max-w-3xl text-center">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center justify-center gap-2 text-theme-xs text-white/60">
                <li>
                  <Link href="/" className="transition hover:text-white">
                    Trang chủ
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-white/90">Sự kiện</li>
              </ol>
            </nav>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-theme-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              Lịch sự kiện RealtyHub
            </span>

            <h1 className="mt-6 font-serif text-4xl font-light leading-tight md:text-5xl lg:text-6xl">
              Gặp gỡ, học hỏi,
              <br />
              <span className="font-bold text-purple-400">cùng phát triển</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
              Workshop, hội thảo, open house và networking — tất cả được tổ chức
              bởi đội ngũ RealtyHub và các đối tác trong ngành.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-6">
              <StatItem
                value={String(MOCK_EVENTS.length)}
                label="Tổng sự kiện"
              />
              <StatItem
                value={String(
                  MOCK_EVENTS.filter((e) => computeStatus(e) !== "past").length,
                )}
                label="Sắp diễn ra"
                accent="text-purple-300"
              />
              <StatItem
                value={String(
                  MOCK_EVENTS.reduce((sum, e) => sum + e.registered, 0),
                )}
                label="Lượt đăng ký"
              />
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <FilterChip
                href={buildHref({ type: TYPE_ALL, status: "all" }, params)}
                label="Tất cả"
                isActive={type === TYPE_ALL}
                count={countByType(TYPE_ALL)}
              />
              {EVENT_TYPE_FILTERS.map((t) => (
                <FilterChip
                  key={t}
                  href={buildHref({ type: t, status: "all" }, params)}
                  label={EVENT_TYPE_LABELS[t]}
                  isActive={type === t}
                  count={countByType(t)}
                />
              ))}
            </div>
          </div>
        </div>
      </section> */}

      <div className="site-container pt-8">
        <h1 className="mb-6 text-center text-3xl font-bold uppercase tracking-wide text-gray-900">
          Danh sách Sự kiện
        </h1>
      </div>

      {/* ============ 02 FEATURED EVENT ============ */}
      {featured && status !== "past" && (
        <section className="site-container">
          <FeaturedEventCard event={featured} />
        </section>
      )}

      {/* ============ 03 UPCOMING EVENTS ============ */}
      {(status === "all" || status === "upcoming") &&
        upcomingEvents.length > 0 && (
          <EventsSection
            title="Sắp diễn ra"
            subtitle={`${upcomingEvents.length} sự kiện sắp tới`}
            events={upcomingEvents}
            mode="upcoming"
          />
        )}

      {/* ============ 04 PAST EVENTS ============ */}
      {(status === "all" || status === "past") && pastEvents.length > 0 && (
        <EventsSection
          title="Đã diễn ra"
          subtitle="Xem lại tư liệu và tài liệu của các sự kiện đã qua"
          events={pastEvents}
          mode="past"
          variant="muted"
        />
      )}

      {/* ============ 05 SUBMIT EVENT CTA ============ */}
      <SubmitEventCTA />
    </main>
  );
};

// ============================================================================
// StatItem - 1 so lieu trong hero
// ============================================================================

const StatItem = ({
  value,
  label,
  accent = "text-white",
}: {
  value: string;
  label: string;
  accent?: string;
}) => (
  <div className="text-center">
    <div
      className={`font-serif text-3xl font-bold leading-none md:text-4xl ${accent}`}
    >
      {value}
    </div>
    <div className="mt-2 text-theme-xs uppercase tracking-[0.15em] text-white/70">
      {label}
    </div>
  </div>
);

// ============================================================================
// FilterChip
// ============================================================================

const FilterChip = ({
  href,
  label,
  isActive,
  count,
}: {
  href: string;
  label: string;
  isActive: boolean;
  count: number;
}) => (
  <Link
    href={href}
    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-theme-sm font-semibold transition ${
      isActive
        ? "border-purple-400 bg-purple-500 text-white shadow-theme-sm"
        : "border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/10"
    }`}
  >
    {label}
    <span
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-theme-xs font-bold ${
        isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/70"
      }`}
    >
      {count}
    </span>
  </Link>
);

// ============================================================================
// FeaturedEventCard - bai noi bat, full-width, co countdown
// ============================================================================

const FeaturedEventCard = ({ event }: { event: EventItem }) => {
  const tone = EVENT_TYPE_TONE[event.type];
  const days = daysUntil(event.startAt);
  const seatsLeft = event.capacity ? event.capacity - event.registered : null;
  const isFull = event.status === "full";

  return (
    <article className="group grid overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-theme-md transition hover:shadow-theme-lg md:grid-cols-2">
      {/* Thumbnail */}
      <Link
        href={`/su-kien/${event.slug}`}
        className="relative block aspect-[16/9] overflow-hidden md:aspect-auto"
        aria-label={event.title}
      >
        <PlaceholderThumb
          seed={event.slug}
          src={event.coverImage}
          label={event.title}
          alt={event.title}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {/* Countdown overlay */}
        {days > 0 && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-theme-md backdrop-blur-sm">
            <FiClock aria-hidden className="h-4 w-4 text-purple-600" />
            <span className="text-theme-xs font-bold uppercase tracking-[0.15em] text-purple-700">
              Còn {days} ngày
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col gap-6 p-6 md:p-10">
        {/* Type + status */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-theme-xs font-bold uppercase tracking-[0.15em] ${tone.chip}`}
          >
            {EVENT_TYPE_LABELS[event.type]}
          </span>
          {event.status === "ongoing" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-theme-xs font-bold uppercase tracking-[0.15em] text-rose-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
              Đang diễn ra
            </span>
          )}
        </div>

        <h3 className="font-serif text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
          <Link
            href={`/su-kien/${event.slug}`}
            className="transition hover:text-purple-600"
          >
            {event.title}
          </Link>
        </h3>

        <p className="text-base leading-relaxed text-gray-600 md:text-lg">
          {event.excerpt}
        </p>

        {/* Meta */}
        <ul className="space-y-2.5 border-y border-gray-100 py-5 text-theme-sm text-gray-700">
          <li className="flex items-start gap-2.5">
            <FiCalendar
              aria-hidden
              className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
            />
            <span className="font-semibold">
              {formatDateLong(event.startAt)}
              {event.endAt &&
                ` · ${formatTime(event.startAt)} - ${formatTime(event.endAt)}`}
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            {event.location.isOnline ? (
              <FiVideo
                aria-hidden
                className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
              />
            ) : (
              <FiMapPin
                aria-hidden
                className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
              />
            )}
            <span>
              {event.location.name}
              {event.location.address && ` · ${event.location.address}`}
            </span>
          </li>
          {event.capacity && (
            <li className="flex items-center gap-2.5">
              <FiUsers aria-hidden className="h-4 w-4 shrink-0 text-gray-400" />
              <span>
                <span className="font-semibold">
                  {event.registered}/{event.capacity}
                </span>{" "}
                đã đăng ký
                {seatsLeft !== null && seatsLeft > 0 && (
                  <span className="ml-1 text-gray-500">
                    · còn {seatsLeft} chỗ
                  </span>
                )}
              </span>
            </li>
          )}
        </ul>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          {isFull ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2.5 text-theme-sm font-semibold text-gray-500">
              <FiXCircle aria-hidden className="h-4 w-4" />
              Đã đầy
            </span>
          ) : (
            <Link
              href={`/su-kien/${event.slug}`}
              className="group/btn inline-flex items-center gap-2 rounded-full bg-purple-500 px-5 py-2.5 text-theme-sm font-semibold text-white shadow-theme-sm transition hover:bg-purple-600"
            >
              Đăng ký tham dự
              <FiArrowRight
                aria-hidden
                className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
              />
            </Link>
          )}
          <a
            href={toIcsDataUri(event)}
            download={`${event.slug}.ics`}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-theme-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            <FiDownload aria-hidden className="h-4 w-4" />
            Thêm vào lịch
          </a>
          <span
            className={`ml-auto font-serif text-lg font-bold md:text-xl ${tone.accent}`}
          >
            {formatPrice(event)}
          </span>
        </div>
      </div>
    </article>
  );
};

// ============================================================================
// EventsSection - section header + grid
// ============================================================================

type EventsSectionProps = {
  title: string;
  subtitle: string;
  events: EventItem[];
  mode: "upcoming" | "past";
  variant?: "default" | "muted";
};

const EventsSection = ({
  title,
  subtitle,
  events,
  mode,
  variant = "default",
}: EventsSectionProps) => {
  const isMuted = variant === "muted";

  return (
    <section
      className={`site-container py-12 md:py-16 ${isMuted ? "border-t border-gray-200 bg-gray-50/60" : ""}`}
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-theme-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.publicId} event={event} mode={mode} />
        ))}
      </div>
    </section>
  );
};

// ============================================================================
// EventCard - 1 su kien trong grid
// ============================================================================

type EventCardProps = {
  event: EventItem;
  mode: "upcoming" | "past";
};

const EventCard = ({ event, mode }: EventCardProps) => {
  const tone = EVENT_TYPE_TONE[event.type];
  const seatsLeft = event.capacity ? event.capacity - event.registered : null;
  const isFull = event.status === "full";
  const isOngoing = event.status === "ongoing";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-theme-xs transition hover:-translate-y-1 hover:shadow-theme-md">
      {/* Thumbnail */}
      <Link
        href={`/su-kien/${event.slug}`}
        className="relative block aspect-[16/9] overflow-hidden"
        aria-label={event.title}
      >
        <PlaceholderThumb
          seed={event.slug}
          src={event.coverImage}
          label={event.title}
          alt={event.title}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {/* Date badge (top-left) */}
        <div className="absolute left-3 top-3 flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-white px-2 py-2 text-center shadow-theme-md">
          <span className="font-serif text-xl font-bold leading-none text-gray-900">
            {new Date(event.startAt).getDate()}
          </span>
          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">
            Th{new Date(event.startAt).getMonth() + 1}
          </span>
        </div>

        {/* Type chip (top-right) */}
        <span
          className={`absolute right-3 top-3 inline-flex rounded-full px-2.5 py-1 text-theme-xs font-bold uppercase tracking-[0.15em] ${tone.chip}`}
        >
          {EVENT_TYPE_LABELS[event.type]}
        </span>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Ongoing indicator */}
        {isOngoing && (
          <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-theme-xs font-bold uppercase tracking-[0.15em] text-rose-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
            Đang diễn ra
          </div>
        )}

        <h3 className="font-serif text-lg font-bold leading-tight text-gray-900 md:text-xl">
          <Link
            href={`/su-kien/${event.slug}`}
            className="transition hover:text-purple-600"
          >
            {event.title}
          </Link>
        </h3>
        <p className="mt-2.5 line-clamp-2 text-theme-sm leading-relaxed text-gray-600">
          {event.excerpt}
        </p>

        {/* Meta */}
        <ul className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-theme-xs text-gray-500">
          <li className="flex items-center gap-1.5">
            <FiClock aria-hidden className="h-3.5 w-3.5" />
            {formatTime(event.startAt)}
            {event.endAt && ` - ${formatTime(event.endAt)}`}
          </li>
          <li className="flex items-center gap-1.5">
            {event.location.isOnline ? (
              <FiVideo aria-hidden className="h-3.5 w-3.5" />
            ) : (
              <FiMapPin aria-hidden className="h-3.5 w-3.5" />
            )}
            <span className="truncate">{event.location.name}</span>
          </li>
        </ul>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className={`font-serif text-lg font-bold ${tone.accent}`}>
            {formatPrice(event)}
          </span>

          {mode === "upcoming" ? (
            isFull ? (
              <span className="inline-flex items-center gap-1 text-theme-sm font-semibold text-gray-400">
                <FiXCircle aria-hidden className="h-4 w-4" />
                Đã đầy
              </span>
            ) : seatsLeft !== null && seatsLeft <= 10 ? (
              <Link
                href={`/su-kien/${event.slug}`}
                className="inline-flex items-center gap-1 text-theme-sm font-semibold text-rose-600 hover:underline"
              >
                Còn {seatsLeft} chỗ
                <FiArrowRight aria-hidden className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                href={`/su-kien/${event.slug}`}
                className="inline-flex items-center gap-1 text-theme-sm font-semibold text-purple-600 hover:underline"
              >
                Đăng ký
                <FiArrowRight aria-hidden className="h-3.5 w-3.5" />
              </Link>
            )
          ) : (
            <Link
              href={`/su-kien/${event.slug}`}
              className="inline-flex items-center gap-1 text-theme-sm font-semibold text-gray-600 hover:underline"
            >
              Xem lại
              <FiArrowRight aria-hidden className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

// ============================================================================
// SubmitEventCTA - to chuc su kien
// ============================================================================

const SubmitEventCTA = () => (
  <section className="bg-gradient-to-br from-gray-900 via-brand-950 to-purple-950 py-16 text-white md:py-20">
    <div className="site-container">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-theme-xs font-semibold uppercase tracking-[0.2em] text-white">
          Đối tác tổ chức
        </span>
        <h2 className="mt-5 font-serif text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
          Bạn muốn tổ chức sự kiện BĐS?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
          RealtyHub hỗ trợ truyền thông, đăng ký, nhắc lịch và báo cáo sau sự
          kiện — miễn phí cho workshop và networking cộng đồng.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/lien-he"
            className="group inline-flex items-center gap-2 rounded-full bg-purple-500 px-6 py-3 text-theme-sm font-semibold text-white shadow-theme-sm transition hover:bg-purple-600"
          >
            Đăng ký tổ chức
            <FiArrowRight
              aria-hidden
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/dao-tao"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-theme-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Xem khóa học
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default SuKienPage;
