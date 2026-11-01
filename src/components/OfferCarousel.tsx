import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Pause, Play, Tag } from "lucide-react";
import { formatPrice, isOfferActive, type Offer } from "@/lib/servicePricing";

function offerDestination(offer: Offer) {
  const customLink = offer.cta_link.trim();
  if (/^https?:\/\//i.test(customLink) || /^mailto:/i.test(customLink) || /^tel:/i.test(customLink)) {
    return customLink;
  }
  if (customLink.startsWith("/") && !customLink.startsWith("//")) return customLink;
  if (customLink.startsWith("#")) return customLink;
  if (offer.target_type === "service" && offer.target_id) return `/what-i-do/${offer.target_id}`;
  if (offer.target_type === "course" && offer.target_id) return `/courses/${offer.target_id}`;
  return offer.target_type === "courses" ? "/courses" : "/what-i-do";
}

function OfferLink({ offer, children }: { offer: Offer; children: React.ReactNode }) {
  const href = offerDestination(offer);
  if (/^https?:\/\//i.test(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-olive px-5 py-3 font-body text-sm font-bold text-ink transition-colors hover:bg-white">{children}</a>;
  }
  if (/^(mailto:|tel:)/i.test(href)) {
    return <a href={href} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-olive px-5 py-3 font-body text-sm font-bold text-ink transition-colors hover:bg-white">{children}</a>;
  }
  return <Link to={href} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-olive px-5 py-3 font-body text-sm font-bold text-ink transition-colors hover:bg-white">{children}</Link>;
}

export default function OfferCarousel({ offers }: { offers: Offer[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = useMemo(
    () => offers.filter((offer) => offer.show_on_home && offer.banner_image_url && isOfferActive(offer)),
    [offers],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (!slides.length) return null;
  const currentIndex = activeIndex % slides.length;
  const current = slides[currentIndex];
  const discountLabel = current.discount_type === "percentage"
    ? `${current.discount_value}% off`
    : `${formatPrice(current.discount_value, current.currency)} off`;

  const move = (offset: number) => {
    setActiveIndex((index) => (index + offset + slides.length) % slides.length);
  };

  return (
    <section
      aria-label="Special offers"
      aria-roledescription="carousel"
      className="relative isolate overflow-hidden bg-forest text-white"
    >
      {slides.map((slide, index) => (
        <img
          key={slide.id}
          src={slide.banner_image_url || ""}
          alt={slide.banner_alt}
          aria-hidden={index !== currentIndex}
          loading={index === 0 ? "eager" : "lazy"}
          className={`-z-20 transition-opacity duration-700 ${slide.banner_format === "flyer"
            ? "absolute inset-y-0 right-0 h-full w-auto max-w-[45%] object-contain"
            : "absolute inset-0 h-full min-h-[330px] w-full object-cover sm:min-h-[380px]"} ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div aria-hidden="true" className={`absolute inset-0 -z-10 ${current.banner_format === "flyer"
        ? "bg-gradient-to-r from-black/95 via-black/80 to-black/35"
        : "bg-gradient-to-r from-black/85 via-black/60 to-black/20"}`} />
      <div className="mx-auto flex min-h-[330px] max-w-6xl items-center px-4 py-10 sm:min-h-[380px] sm:px-6 lg:px-8">
        <div key={current.id} className={`animate-in fade-in duration-500 ${current.banner_format === "flyer" ? "max-w-[65%] sm:max-w-[58%]" : "max-w-2xl"}`}>
          <span className="inline-flex items-center gap-2 rounded-full bg-ember px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wider text-white">
            <Tag size={14} aria-hidden="true" /> {discountLabel}
          </span>
          <h2 className="mt-4 font-display text-3xl leading-tight sm:text-5xl">{current.title}</h2>
          {current.description && (
            <p className="mt-3 max-w-xl whitespace-pre-line font-body text-base leading-relaxed text-white/85 sm:text-lg">
              {current.description}
            </p>
          )}
          <div className="mt-6">
            <OfferLink offer={current}>
              {current.cta_text || "View offer"} <ArrowRight size={16} aria-hidden="true" />
            </OfferLink>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 sm:bottom-6 sm:right-6">
          <button type="button" aria-label="Previous offer" onClick={() => move(-1)} className="rounded-full bg-black/55 p-2 text-white hover:bg-black/80">
            <ArrowLeft size={17} aria-hidden="true" />
          </button>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show offer ${index + 1}: ${slide.title}`}
              aria-current={index === currentIndex}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all ${index === currentIndex ? "w-7 bg-white" : "w-2.5 bg-white/60 hover:bg-white"}`}
            />
          ))}
          <button
            type="button"
            aria-label={paused ? "Resume offer carousel" : "Pause offer carousel"}
            onClick={() => setPaused((value) => !value)}
            className="rounded-full bg-black/55 p-2 text-white hover:bg-black/80"
          >
            {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
          </button>
          <button type="button" aria-label="Next offer" onClick={() => move(1)} className="rounded-full bg-black/55 p-2 text-white hover:bg-black/80">
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
