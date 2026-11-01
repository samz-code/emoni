import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isOfferActive, type Offer } from "@/lib/servicePricing";

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

function OfferArtworkLink({
  offer,
  children,
  className = "group absolute inset-0 block overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#007979]/40",
}: {
  offer: Offer;
  children: ReactNode;
  className?: string;
}) {
  const href = offerDestination(offer);
  const label = `${offer.title}. ${offer.cta_text || "View offer"}`;

  if (/^https?:\/\//i.test(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={className}>{children}</a>;
  }
  if (/^(mailto:|tel:)/i.test(href)) {
    return <a href={href} aria-label={label} className={className}>{children}</a>;
  }
  return <Link to={href} aria-label={label} className={className}>{children}</Link>;
}

export default function OfferCarousel({ offers }: { offers: Offer[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = useMemo(
    () => offers.filter((offer) => offer.show_on_home && offer.banner_image_url && isOfferActive(offer)),
    [offers],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;
  const currentIndex = activeIndex % slides.length;
  const current = slides[currentIndex];

  const move = (offset: number) => {
    setActiveIndex((index) => (index + offset + slides.length) % slides.length);
  };

  return (
    <section
      aria-label="Special offers"
      aria-roledescription="carousel"
      className="bg-[#F1F1F1] px-3 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9"
    >
      <div className={`relative mx-auto ${current.banner_format === "flyer" ? "max-w-md" : "max-w-[1232px]"}`}>
        <div className={`relative overflow-hidden rounded-xl bg-[#17151B] shadow-sm ${
          current.banner_format === "flyer"
            ? "aspect-[4/5] max-h-[min(72vh,720px)]"
            : "aspect-[2/1] sm:aspect-[16/5]"
        }`}>
          <OfferArtworkLink key={current.id} offer={current}>
            <img
              src={current.banner_image_url || ""}
              alt={current.banner_alt || current.title}
              loading="eager"
              className="h-full w-full object-cover"
            />
          </OfferArtworkLink>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous offer"
              onClick={() => move(-1)}
              className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#333]/20 bg-white text-[#25232A] shadow-sm transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007979] sm:h-10 sm:w-10"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <div className="absolute bottom-3 left-1/2 z-10 flex max-w-[calc(100%-5rem)] -translate-x-1/2 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-white/55 px-1.5 py-1 sm:bottom-4 sm:gap-1.5 sm:px-2" role="group" aria-label="Choose offer">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show offer ${index + 1}: ${slide.title}`}
                  aria-current={index === currentIndex}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 shrink-0 rounded-full border border-[#34323A]/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007979] ${
                    index === currentIndex ? "w-6 bg-[#34323A]" : "w-2 bg-transparent hover:bg-[#34323A]/50"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next offer"
              onClick={() => move(1)}
              className="absolute right-0 top-1/2 z-10 flex h-9 w-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#333]/20 bg-white text-[#25232A] shadow-sm transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007979] sm:h-10 sm:w-10"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
