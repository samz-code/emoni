import { useState } from "react";
import type { Partner } from "@/lib/homeContent";

interface TrustedByProps {
  eyebrow?: string | null;
  heading?: string | null;
  partners: Partner[];
  loading?: boolean;
}

/* Marquee CSS lives here so the component works without touching tailwind.config */
const MARQUEE_CSS = `
@keyframes trusted-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.trusted-track { animation: trusted-marquee 50s linear infinite; }
.trusted-track:hover { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .trusted-track { animation: none; flex-wrap: wrap; justify-content: center; width: auto; }
  .trusted-dup { display: none; }
}
`;

function PartnerCard({ partner }: { partner: Partner }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(partner.logo_url) && !failed;

  const card = (
    <div className="flex items-center justify-center w-[160px] h-[80px] border border-olive/40 rounded-[4px] bg-white/60 dark:bg-white/5 px-4 py-3 hover:border-olive transition-colors duration-200">
      {showImage ? (
        <img
          src={partner.logo_url as string}
          alt={`${partner.name} logo`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <span className="text-forest dark:text-olive font-display text-xs text-center leading-tight">
          {partner.name}
        </span>
      )}
    </div>
  );

  if (partner.website_url) {
    return (
      <a
        href={partner.website_url}
        target="_blank"
        rel="noopener noreferrer"
        title={partner.name}
        className="shrink-0"
      >
        {card}
      </a>
    );
  }
  return (
    <div title={partner.name} className="shrink-0">
      {card}
    </div>
  );
}

export default function TrustedBy({ eyebrow, heading, partners, loading = false }: TrustedByProps) {
  // Nothing to show → render nothing (no empty band on the homepage)
  if (!loading && partners.length === 0) return null;

  const marquee = partners.length > 6;

  return (
    <section
      aria-label={heading || eyebrow || "Trusted by"}
      className="bg-snow dark:bg-[#141410] py-16 border-y border-[#E0DAD0] dark:border-olive/15 overflow-hidden"
    >
      {(eyebrow || heading) && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
          {eyebrow ? (
            <p className="font-body text-[11px] uppercase tracking-widest text-ember mb-2">{eyebrow}</p>
          ) : null}
          {heading ? (
            <h2 className="font-display text-[28px] md:text-[34px] text-ink dark:text-cream">{heading}</h2>
          ) : null}
        </div>
      )}

      {loading && partners.length === 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-8 px-4" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[160px] h-[80px] rounded-[4px] bg-olive/15 animate-pulse" />
          ))}
        </div>
      ) : marquee ? (
        <div
          className="relative w-full"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <style>{MARQUEE_CSS}</style>
          <div className="trusted-track flex w-max items-center">
            <div className="flex shrink-0 items-center gap-8 pr-8">
              {partners.map((p) => (
                <PartnerCard key={p.id ?? p.name} partner={p} />
              ))}
            </div>
            <div className="trusted-dup flex shrink-0 items-center gap-8 pr-8" aria-hidden>
              {partners.map((p) => (
                <PartnerCard key={`dup-${p.id ?? p.name}`} partner={p} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-8">
          {partners.map((p) => (
            <PartnerCard key={p.id ?? p.name} partner={p} />
          ))}
        </div>
      )}
    </section>
  );
}