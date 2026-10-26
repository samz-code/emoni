import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

export interface Course {
  id?: string;
  name: string;
  category: string;
  description: string;
  long_description?: string | null;
  banner_url?: string | null;
  gallery_urls?: string[];
  audience?: string;
  level?: string;
  format?: string;
  duration?: string;
  start_date?: string | null;
  price?: string | number;
  status?: "enrolling" | "waitlist" | "update" | string;
  highlights?: string[];
  curriculum?: { title: string; description: string }[];
  requirements?: string[];
  faqs?: { question: string; answer: string }[];
  [key: string]: any;
}

const WHATSAPP_NUMBER = "254727492545";
const MAX_HIGHLIGHTS = 5;

const initialsOf = (name: string) =>
  (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

const BannerFallback = ({ name }: { name: string }) => (
  <div
    className="absolute inset-0 flex items-center justify-center bg-forest"
    style={{
      backgroundImage:
        "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 14px)",
    }}
    aria-hidden="true"
  >
    <span className="font-display text-6xl tracking-wide text-cream/80">{initialsOf(name)}</span>
  </div>
);

const CourseCard = ({ course }: { course: Course }) => {
  const currentStatus = (course?.status as "enrolling" | "waitlist" | "update") || "enrolling";

  const ctaStyles: Record<string, string> = {
    enrolling: "bg-[#25D366] text-white hover:bg-[#1FB855]",
    waitlist: "border border-forest text-forest hover:bg-forest hover:text-cream",
    update: "border border-olive text-forest bg-olive/10 hover:bg-olive/20",
  };

  const ctaText: Record<string, string> = {
    enrolling: "Enroll now",
    waitlist: "Join waitlist",
    update: "Get update",
  };

  const statusChip: Record<string, string> = {
    waitlist: "Waitlist",
    update: "Coming soon",
  };

  const messages: Record<string, string> = {
    enrolling: `Hello Samuel, I'd like to enroll in the "${course?.name || "Course"}" course. Could you share the next steps and fees?`,
    waitlist: `Hello Samuel, please add me to the waitlist for "${course?.name || "Course"}".`,
    update: `Hello Samuel, please notify me when "${course?.name || "Course"}" is available.`,
  };

  const highlights: string[] = Array.isArray(course?.highlights)
    ? course.highlights
    : Array.isArray(course?.whatYouGet)
    ? course.whatYouGet
    : Array.isArray(course?.whatYouGet?.highlights)
    ? course.whatYouGet.highlights
    : [];
  const visibleHighlights = highlights.slice(0, MAX_HIGHLIGHTS);
  const extraCount = highlights.length - visibleHighlights.length;

  const activeCtaStyle = ctaStyles[currentStatus] || ctaStyles.enrolling;
  const activeCtaText = ctaText[currentStatus] || "Enquire";
  const activeMessage = messages[currentStatus] || messages.enrolling;
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(activeMessage)}`;

  const hasPrice = course?.price !== undefined && course?.price !== null && course?.price !== "";
  const priceLabel = hasPrice ? (Number(course.price) === 0 ? "Free" : `$${course.price}`) : null;

  const meta = [course?.duration, course?.level, course?.format].filter(Boolean) as string[];
  const detailsHref = course?.id ? `/courses/${course.id}` : null;

  const bannerInner = course?.banner_url ? (
    <img
      src={course.banner_url}
      alt=""
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
  ) : (
    <BannerFallback name={course?.name} />
  );

  return (
    <article className="group bg-snow border border-border rounded-2xl overflow-hidden w-full max-w-[736px] mx-auto h-full flex flex-col lg:min-h-[900px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {/* Banner: 736 x 420 */}
      <div className="relative aspect-[736/420] overflow-hidden bg-forest">
        {detailsHref ? (
          <Link to={detailsHref} tabIndex={-1} aria-hidden="true" className="block h-full w-full">
            {bannerInner}
          </Link>
        ) : (
          bannerInner
        )}

        <span className="absolute left-4 top-4 bg-snow/95 text-ink text-xs font-semibold rounded-full px-3 py-1 font-body">
          {course?.category || "General"}
        </span>

        {statusChip[currentStatus] && (
          <span className="absolute right-4 top-4 bg-ember text-snow text-xs font-semibold rounded-full px-3 py-1 font-body">
            {statusChip[currentStatus]}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-6 sm:p-8">
        <h3 className="font-display text-[24px] sm:text-[28px] text-ink leading-snug">{course?.name}</h3>

        {meta.length > 0 && (
          <p className="font-body text-sm text-[#6B6B6B] mt-2">{meta.join("  ·  ")}</p>
        )}

        <p className="font-body text-base text-[#4A4A4A] leading-relaxed mt-4 line-clamp-4">
          {course?.description}
        </p>

        {visibleHighlights.length > 0 && (
          <ul className="mt-5 space-y-2 flex-1 font-body text-[15px] text-ink">
            {visibleHighlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ember" aria-hidden="true" />
                <span className="line-clamp-2">{highlight}</span>
              </li>
            ))}
            {extraCount > 0 && (
              <li className="text-sm text-[#9A9A9A] pl-[18px]">+{extraCount} more included</li>
            )}
          </ul>
        )}

        {priceLabel && (
          <p className="mt-5 font-display text-3xl text-ember font-bold">{priceLabel}</p>
        )}

        {/* Actions: always one row */}
        <div className="mt-5 pt-5 border-t border-border flex items-stretch gap-3">
          {detailsHref && (
            <Link
              to={detailsHref}
              aria-label={`View details for ${course.name}`}
              className="flex-1 inline-flex min-h-12 items-center justify-center rounded-xl border border-forest px-4 font-body text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              View details
            </Link>
          )}

          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${activeCtaText} on WhatsApp`}
            className={`flex-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 font-body text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${activeCtaStyle}`}
          >
            <FaWhatsapp size={17} aria-hidden="true" />
            <span>{activeCtaText}</span>
          </a>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;