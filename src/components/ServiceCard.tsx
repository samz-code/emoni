import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

export interface Service {
  id: string;
  category: string;
  name: string;
  short_description?: string | null;
  problem: string;
  solution: string;
  long_description?: string | null;
  outcome: string;
  deliverables: string[];
  tools?: string[];
  timeline?: string | null;
  starting_from?: string | null;
  ideal_for: string;
  banner_url?: string | null;
  gallery_urls?: string[];
  faqs?: { question: string; answer: string }[];
  published: boolean;
  sort_order?: number;
  [key: string]: any;
}

const WHATSAPP_NUMBER = "254727492545";
const MAX_DELIVERABLES = 5;

const buildWhatsAppLink = (serviceName: string) => {
  const message = `Hi Samuel, I'd like to book the ${serviceName} service.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const initialsOf = (name: string) =>
  name
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

const ServiceCard = ({ service }: { service: Service }) => {
  const deliverablesList = Array.isArray(service.deliverables) ? service.deliverables : [];
  const visibleDeliverables = deliverablesList.slice(0, MAX_DELIVERABLES);
  const extraCount = deliverablesList.length - visibleDeliverables.length;
  const summary = service.short_description || service.solution || service.problem;

  return (
    <article
      id={service.id}
      className="group bg-snow border border-border rounded-2xl overflow-hidden scroll-mt-24 w-full max-w-[736px] mx-auto h-full flex flex-col lg:min-h-[900px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* Banner: 736 x 420 */}
      <Link
        to={`/what-i-do/${service.id}`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[736/420] overflow-hidden bg-forest"
      >
        {service.banner_url ? (
          <img
            src={service.banner_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <BannerFallback name={service.name} />
        )}
        {service.outcome && (
          <span className="absolute left-4 bottom-4 max-w-[calc(100%-2rem)] bg-snow/95 text-ink text-xs font-semibold rounded-full px-3 py-1 font-body leading-tight">
            {service.outcome}
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-6 sm:p-8">
        <h3 className="font-display text-[24px] sm:text-[28px] text-ink leading-snug">{service.name}</h3>

        {summary && (
          <p className="font-body text-base text-[#4A4A4A] leading-relaxed mt-3 line-clamp-4">
            {summary}
          </p>
        )}

        {visibleDeliverables.length > 0 && (
          <ul className="mt-5 space-y-2 flex-1">
            {visibleDeliverables.map((d, index) => (
              <li key={index} className="flex items-start gap-3 font-body text-[15px] text-ink">
                <span className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ember" aria-hidden="true" />
                <span className="line-clamp-2">{d}</span>
              </li>
            ))}
            {extraCount > 0 && (
              <li className="font-body text-sm text-[#9A9A9A] pl-[18px]">+{extraCount} more included</li>
            )}
          </ul>
        )}

        {(service.timeline || service.starting_from) && (
          <p className="mt-5 font-body text-sm text-[#6B6B6B]">
            {[service.timeline, service.starting_from && `From ${service.starting_from}`]
              .filter(Boolean)
              .join("  ·  ")}
          </p>
        )}

        {/* Actions: always one row */}
        <div className="mt-5 pt-5 border-t border-border flex items-stretch gap-3">
          <Link
            to={`/what-i-do/${service.id}`}
            aria-label={`View details for ${service.name}`}
            className="flex-1 inline-flex min-h-12 items-center justify-center rounded-xl border border-forest px-4 font-body text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            View details
          </Link>

          <a
            href={buildWhatsAppLink(service.name)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Book ${service.name} on WhatsApp`}
            className="flex-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 font-body text-sm font-bold text-white transition-colors hover:bg-[#1FB855] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1FB855]"
          >
            <FaWhatsapp size={17} aria-hidden="true" />
            <span>Book now</span>
          </a>
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;