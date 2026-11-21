import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { ArrowRight, Check, Clock, FileSignature } from "lucide-react";
import { quotePrice, type Offer } from "@/lib/servicePricing";

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
  starting_price?: number | string | null;
  price_unit?: string | null;
  ideal_for: string;
  banner_url?: string | null;
  gallery_urls?: string[];
  faqs?: { question: string; answer: string }[];
  published: boolean;
  sort_order?: number;
  [key: string]: any;
}

const WHATSAPP_NUMBER = "254727492545";
const MAX_DELIVERABLES = 4;

const buildWhatsAppLink = (serviceName: string) => {
  const message = `Hi Samuel, I'd like to book the ${serviceName} service.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const kes = (n: number) =>
  `KSh ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(n)}`;

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

/** Luggage-tag shaped price badge. Always visible in the white space beside the title. */
const PriceTag = ({
  original,
  price,
  text,
  unit,
  hasOffer,
}: {
  original?: number | null;
  price?: number | null;
  text?: string | null;
  unit?: string | null;
  hasOffer: boolean;
}) => (
  <div
    className="relative shrink-0 origin-left transition-transform duration-300 group-hover:-rotate-2 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
    aria-label={price !== null && price !== undefined ? `From ${kes(price)}` : text || "Custom quote"}
  >
    <div className="bg-ember py-2 pl-7 pr-4 text-white shadow-sm [clip-path:polygon(16px_0,100%_0,100%_100%,16px_100%,0_50%)]">
      <span className="block font-body text-[10px] font-bold uppercase leading-none tracking-[0.18em] text-white/85">
        {price !== null && price !== undefined ? "From" : "Pricing"}
      </span>
      {hasOffer && original ? (
        <span className="mt-1 block font-body text-[11px] leading-none text-white/75 line-through">
          {kes(original)}
        </span>
      ) : null}
      <span className="mt-1 block whitespace-nowrap font-display text-xl leading-none">
        {price !== null && price !== undefined ? kes(price) : text || "Custom quote"}
      </span>
      {unit && price !== null && price !== undefined ? (
        <span className="mt-1 block font-body text-[10px] leading-none text-white/85">{unit}</span>
      ) : null}
    </div>
    {/* tag hole */}
    <span className="absolute left-[7px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-snow" aria-hidden="true" />
  </div>
);

const ServiceCard = ({ service, offer }: { service: Service; offer?: Offer | null }) => {
  const deliverablesList = Array.isArray(service.deliverables) ? service.deliverables : [];
  const visibleDeliverables = deliverablesList.slice(0, MAX_DELIVERABLES);
  const extraCount = deliverablesList.length - visibleDeliverables.length;
  const summary = service.short_description || service.solution || service.problem;

  const startingPrice =
    service.starting_price === null || service.starting_price === undefined || service.starting_price === ""
      ? null
      : Number(service.starting_price);
  const priceQuote =
    startingPrice !== null && Number.isFinite(startingPrice) ? quotePrice(startingPrice, offer) : null;
  const hasOffer = !!priceQuote && priceQuote.savings > 0;

  return (
    <article
      id={service.id}
      className="group bg-snow border border-border rounded-2xl overflow-hidden scroll-mt-24 w-full max-w-[736px] mx-auto h-full flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* Banner: 736 x 420 */}
      <Link
        to={`/what-i-do/${service.id}`}
        aria-label={`View details for ${service.name}`}
        className="relative block aspect-[736/420] overflow-hidden bg-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ember"
      >
        {service.banner_url ? (
          <img
            src={service.banner_url}
            alt={`${service.name} service in Nairobi, Kenya`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <BannerFallback name={service.name} />
        )}
        {service.category && (
          <span className="absolute left-4 top-4 rounded-full bg-snow/95 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-widest text-ink">
            {service.category}
          </span>
        )}
        {hasOffer && (
          <span className="absolute right-4 top-4 rounded-full bg-ember px-3 py-1 font-body text-[11px] font-bold uppercase tracking-widest text-white">
            Offer
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        {/* Title + price tag in the white space */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-[24px] sm:text-[28px] text-ink leading-snug">{service.name}</h3>
          <PriceTag
            original={priceQuote?.original ?? null}
            price={priceQuote ? priceQuote.discounted : null}
            text={service.starting_from}
            unit={service.price_unit}
            hasOffer={hasOffer}
          />
        </div>

        {service.timeline && (
          <p className="mt-2 inline-flex items-center gap-1.5 font-body text-sm text-[#6B6B6B]">
            <Clock size={14} aria-hidden="true" /> {service.timeline}
          </p>
        )}

        {summary && (
          <p className="mt-3 line-clamp-3 font-body text-base leading-relaxed text-[#4A4A4A]">{summary}</p>
        )}

        {visibleDeliverables.length > 0 && (
          <ul className="mt-5 flex-1 space-y-2">
            {visibleDeliverables.map((d, index) => (
              <li key={index} className="flex items-start gap-3 font-body text-[15px] text-ink">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest"
                  aria-hidden="true"
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="line-clamp-1">{d}</span>
              </li>
            ))}
            {extraCount > 0 && (
              <li className="pl-8 font-body text-sm text-[#9A9A9A]">+{extraCount} more included</li>
            )}
          </ul>
        )}

        {/* Outcome: one calm line, not an overlay */}
        {service.outcome && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-cream/60 px-4 py-3">
            <ArrowRight size={16} className="mt-0.5 shrink-0 text-ember" aria-hidden="true" />
            <p className="line-clamp-2 font-body text-sm leading-snug text-ink">
              <span className="font-bold">You get: </span>
              {service.outcome}
            </p>
          </div>
        )}
      </div>

      {/* Ticket perforation */}
      <div className="relative h-0 border-t-2 border-dashed border-border" aria-hidden="true">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full border border-border bg-paper" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full border border-border bg-paper" />
      </div>

      {/* Actions */}
      <div className="p-6 pt-5 sm:px-8 sm:pb-7">
        <div className="flex items-stretch gap-3">
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

        <Link
          to="/contract"
          aria-label={`Sign the service agreement for ${service.name}`}
          className="mt-4 inline-flex items-center gap-2 font-body text-sm font-semibold text-forest underline-offset-4 hover:text-ember hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          <FileSignature size={16} aria-hidden="true" />
          Ready to start? Sign the service agreement
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};

export default ServiceCard;