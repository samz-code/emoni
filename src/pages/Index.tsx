import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Lightbulb, Layers, Monitor, Palette, CreditCard, Workflow, Plug, Wrench,
  Building2, Landmark, Stethoscope, GraduationCap, ShoppingBag, Plane,
  ArrowRight, CheckCircle2, Banknote, Signal, Cog, Heart, Store, Sprout, User,
} from "lucide-react";
import TrustedBy from "@/components/TrustedBy";
import {
  toStringArray,
  useHomeCarousel,
  useHomeHero,
  useHomeInsights,
  useHomePairs,
  useHomePartners,
  useHomeProcess,
  useHomeReasons,
  useHomeSectors,
  useHomeServices,
  useHomeSettings,
  type HeroPair,
} from "@/lib/homeContent";

/* ─── Icon maps ─────────────────────────────────────────────── */
const serviceIcons: Record<string, typeof Lightbulb> = {
  Lightbulb, Layers, Monitor, Palette, CreditCard, Workflow, Plug, Wrench,
};

const sectorIconMap: Record<string, typeof Landmark> = {
  Landmark, Building2, ShoppingBag, Plane, GraduationCap, Stethoscope,
  Banknote, Signal, Cog, Heart, Store, Sprout,
};

/* ─── Helpers ───────────────────────────────────────────────── */
const isExternal = (href: string) => /^(https?:|mailto:|tel:)/i.test(href);

const normalizeLink = (href: string) => {
  const value = href.trim();
  if (!value || isExternal(value) || value.startsWith("/") || value.startsWith("#")) return value;
  return `/${value}`;
};

function Skel({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-[4px] ${dark ? "bg-cream/10" : "bg-olive/15"} ${className}`}
    />
  );
}

/* ─── Lightweight Static Grid Backdrop ──────────────────────── */
function BoxGridBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] ${className}`}
    />
  );
}

/* ─── Problem / Solution cycler ────────────────────────────── */
function useProblemSolution(pairs: HeroPair[], holdMs = 2600) {
  const [tick, setTick] = useState(0);
  const count = pairs.length;

  useEffect(() => {
    if (count < 1) return;
    const id = window.setInterval(() => setTick((t) => t + 1), holdMs);
    return () => window.clearInterval(id);
  }, [count, holdMs]);

  if (count === 0) return { pair: null as HeroPair | null, phase: "problem" as "problem" | "solution" };

  const phase: "problem" | "solution" = tick % 2 === 0 ? "problem" : "solution";
  return { pair: pairs[Math.floor(tick / 2) % count], phase };
}

/* ─── Link (internal via router, external via <a>) ─────────── */
function CtaLink({
  to,
  children,
  className,
}: {
  to?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  if (!to) return null;
  const href = normalizeLink(to);
  return (
    <div className="w-full sm:w-auto">
      {isExternal(href) ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className={className}
        >
          {children}
        </a>
      ) : (
        <Link to={href} className={className}>
          {children}
        </Link>
      )}
    </div>
  );
}

/* ─── Eyebrow ──────────────────────────────────────────────── */
function Eyebrow({
  children,
  tone = "olive",
}: {
  children: React.ReactNode;
  tone?: "olive" | "cream";
}) {
  const cls =
    tone === "cream"
      ? "border-cream/30 text-cream/80"
      : "border-olive text-olive dark:border-olive/60 dark:text-olive";
  return (
    <span
      className={`inline-block border ${cls} text-[10px] sm:text-xs uppercase tracking-widest px-2.5 py-1 rounded-[4px] font-body`}
    >
      {children}
    </span>
  );
}

/* ─── Section header (eyebrow + heading + subheading) ─────── */
function SectionHead({
  eyebrow,
  heading,
  subheading,
  loading,
  center = false,
}: {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  loading: boolean;
  center?: boolean;
}) {
  if (loading) {
    return (
      <div className={center ? "flex flex-col items-center gap-3" : "flex flex-col gap-3"}>
        <Skel className="h-6 w-28" />
        <Skel className="h-10 w-72 max-w-full" />
        <Skel className="h-5 w-96 max-w-full" />
      </div>
    );
  }
  return (
    <div>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      {heading ? (
        <h2
          className={`font-display text-[28px] sm:text-[36px] md:text-[42px] text-ink dark:text-cream mt-3 sm:mt-4 leading-tight ${
            center ? "" : "max-w-xl"
          }`}
        >
          {heading}
        </h2>
      ) : null}
      {subheading ? (
        <p
          className={`font-body text-base sm:text-lg text-[#4A4A4A] dark:text-cream/70 mt-2 sm:mt-3 ${
            center ? "" : "max-w-xl"
          }`}
        >
          {subheading}
        </p>
      ) : null}
    </div>
  );
}

/* ─── Hero image: profile photo + carousel crossfade ───────── */
function HeroImage({
  slides,
  loading,
}: {
  slides: { url: string; alt: string }[];
  loading: boolean;
}) {
  const [active, setActive] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count < 2) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % count), 4500);
    return () => window.clearInterval(id);
  }, [count]);

  const current = count ? active % count : 0;

  return (
    <div className="relative h-64 sm:h-80 md:h-96 w-full bg-olive/10">
      {count === 0 ? (
        loading ? (
          <Skel className="absolute inset-0 !rounded-none" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <User size={56} className="text-olive/40" />
          </div>
        )
      ) : (
        slides.map((slide, i) => (
          <img
            key={slide.url}
            src={slide.url}
            alt={slide.alt}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))
      )}

      {count > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.url}
              type="button"
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const Index = () => {
  const heroQ = useHomeHero();
  const settingsQ = useHomeSettings();
  const pairsQ = useHomePairs();
  const carouselQ = useHomeCarousel();
  const partnersQ = useHomePartners("home");
  const servicesQ = useHomeServices();
  const processQ = useHomeProcess();
  const sectorsQ = useHomeSectors();
  const reasonsQ = useHomeReasons();
  const insightsQ = useHomeInsights();

  const hero = heroQ.data ?? null;
  const s = settingsQ.data ?? null;
  const pairs = pairsQ.data ?? [];
  const services = servicesQ.data ?? [];
  const processSteps = processQ.data ?? [];
  const sectors = sectorsQ.data ?? [];
  const reasons = reasonsQ.data ?? [];
  const insights = insightsQ.data ?? [];

  const heroLoading = heroQ.isPending;
  const settingsLoading = settingsQ.isPending;

  const { pair, phase } = useProblemSolution(pairs);
  const focusAreas = toStringArray(s?.focus_areas);

  const slides = useMemo(() => {
    const list: { url: string; alt: string }[] = [];
    if (s?.profile_image_url) list.push({ url: s.profile_image_url, alt: s.profile_title || "Profile" });
    (carouselQ.data ?? []).forEach((img) => {
      if (img.url && !list.some((x) => x.url === img.url)) {
        list.push({ url: img.url, alt: img.alt_text || "Featured work" });
      }
    });
    return list;
  }, [s?.profile_image_url, s?.profile_title, carouselQ.data]);

  const headingText = pair ? (phase === "problem" ? pair.problem : pair.solution) : hero?.heading ?? "";
  const headingLoading = heroLoading || (pairsQ.isPending && !hero);

  return (
    <main className="bg-paper text-ink dark:bg-[#0F0F0C] dark:text-cream transition-colors duration-300 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative bg-paper dark:bg-[#0F0F0C] overflow-hidden">
        <BoxGridBackdrop className="opacity-35" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-20 md:pb-28">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 md:mb-14">
            {heroLoading ? (
              <Skel className="h-6 w-56" />
            ) : hero?.badge ? (
              <Eyebrow>{hero.badge}</Eyebrow>
            ) : (
              <span />
            )}

            {s?.availability_text ? (
              <span className="inline-flex items-center gap-2 font-body text-xs text-[#4A4A4A] dark:text-cream/70">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {s.availability_text}
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="min-h-[100px] sm:min-h-[140px] md:min-h-[160px] flex flex-col justify-center">
                {headingLoading ? (
                  <div className="space-y-3">
                    <Skel className="h-3 w-24" />
                    <Skel className="h-12 sm:h-16 w-full max-w-2xl" />
                  </div>
                ) : (
                  <>
                    {pair && (
                      <p
                        className={`font-body text-[10px] sm:text-[11px] uppercase tracking-[0.2em] mb-2 sm:mb-3 transition-colors duration-300 ${
                          phase === "problem" ? "text-ember" : "text-forest dark:text-olive"
                        }`}
                      >
                        {phase === "problem" ? "The Problem" : "The Solution"}
                      </p>
                    )}
                    <h1
                      className={`font-display text-[32px] sm:text-[48px] md:text-[60px] leading-[1.08] sm:leading-[1.05] tracking-tight max-w-2xl transition-colors duration-300 ${
                        pair && phase === "solution"
                          ? "text-forest dark:text-olive"
                          : "text-ink dark:text-cream"
                      }`}
                    >
                      {headingText}
                    </h1>
                  </>
                )}
              </div>

              {heroLoading ? (
                <div className="mt-6 sm:mt-8 space-y-2 max-w-xl">
                  <Skel className="h-4 w-full" />
                  <Skel className="h-4 w-full" />
                  <Skel className="h-4 w-2/3" />
                </div>
              ) : hero?.subheading ? (
                <p className="font-body text-base sm:text-lg md:text-xl text-[#4A4A4A] dark:text-cream/70 max-w-xl mt-6 sm:mt-8 leading-relaxed">
                  {hero.subheading}
                </p>
              ) : null}

              {hero && (hero.primary_cta_text || hero.secondary_cta_text) && (
                <div className="flex flex-col sm:flex-row gap-3 mt-8 sm:mt-10">
                  {hero.primary_cta_text && (
                    <CtaLink
                      to={hero.primary_cta_link}
                      className="w-full sm:w-auto text-center bg-forest text-cream px-7 py-3.5 text-sm font-body rounded-[4px] hover:opacity-90 transition-opacity inline-block"
                    >
                      {hero.primary_cta_text}
                    </CtaLink>
                  )}
                  {hero.secondary_cta_text && (
                    <CtaLink
                      to={hero.secondary_cta_link}
                      className="w-full sm:w-auto text-center border border-forest/80 text-forest dark:border-olive dark:text-olive px-7 py-3.5 text-sm font-body rounded-[4px] hover:bg-forest hover:text-cream dark:hover:bg-olive dark:hover:text-ink transition-colors inline-block"
                    >
                      {hero.secondary_cta_text}
                    </CtaLink>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 max-w-md mx-auto lg:max-w-none w-full">
              <div className="bg-snow dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[6px] overflow-hidden shadow-lg sm:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-transform duration-300">
                <HeroImage slides={slides} loading={settingsLoading || carouselQ.isPending} />

                <div className="p-5 sm:p-6 relative bg-snow dark:bg-[#1A1A16]">
                  {settingsLoading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Skel className="h-6 w-40" />
                      <Skel className="h-4 w-56" />
                      <Skel className="h-10 w-full mt-4" />
                    </div>
                  ) : (
                    <>
                      {s?.profile_title ? (
                        <h2 className="font-display text-lg sm:text-xl text-ink dark:text-cream text-center">
                          {s.profile_title}
                        </h2>
                      ) : null}
                      {s?.profile_subtitle ? (
                        <p className="font-body text-xs sm:text-[13px] text-olive text-center mt-0.5">
                          {s.profile_subtitle}
                        </p>
                      ) : null}

                      {focusAreas.length > 0 && (
                        <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-[#E0DAD0] dark:border-olive/20">
                          <p className="font-body text-[10px] uppercase tracking-widest text-[#9A9A9A] mb-2.5 text-center">
                            Focus areas
                          </p>
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {focusAreas.map((cap) => (
                              <span
                                key={cap}
                                className="border border-olive/60 text-forest dark:text-olive text-[10px] sm:text-[11px] rounded-[3px] px-2 py-0.5 font-body"
                              >
                                {cap}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {s?.profile_cta_text ? (
                        <CtaLink
                          to={s.profile_cta_link}
                          className="block mt-4 sm:mt-5 bg-ember text-snow text-sm text-center rounded-[4px] py-3 font-body font-medium hover:opacity-90 transition-opacity w-full"
                        >
                          {s.profile_cta_text}
                        </CtaLink>
                      ) : null}
                    </>
                  )}
                </div>
              </div>

              {s?.profile_footer_note ? (
                <p className="font-body text-[11px] sm:text-[12px] text-[#9A9A9A] text-center mt-3 sm:mt-4 leading-relaxed">
                  {s.profile_footer_note}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY — managed in Admin → Manage Content → Partners */}
      <TrustedBy
        eyebrow={s?.trusted_eyebrow}
        heading={s?.trusted_heading}
        partners={partnersQ.data ?? []}
        loading={partnersQ.isPending}
      />

      {/* BANNER */}
      {settingsLoading ? (
        <section className="bg-forest py-8 sm:py-10 border-y border-olive/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skel dark className="h-8 w-full max-w-xl" />
          </div>
        </section>
      ) : s?.banner_text ? (
        <section className="bg-forest py-8 sm:py-10 border-y border-olive/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <p className="font-display text-cream text-lg sm:text-xl md:text-2xl max-w-xl leading-snug">
                {s.banner_text}
              </p>
              {s.banner_cta_text ? (
                <CtaLink
                  to={s.banner_cta_link}
                  className="w-full sm:w-auto text-center shrink-0 inline-flex items-center justify-center gap-2 border border-cream/40 text-cream px-5 py-2.5 text-sm font-body rounded-[4px] hover:bg-cream hover:text-forest transition-colors"
                >
                  {s.banner_cta_text} <ArrowRight size={14} />
                </CtaLink>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* SERVICES */}
      {(servicesQ.isPending || services.length > 0) && (
        <section
          className="bg-paper dark:bg-[#0F0F0C] py-16 sm:py-24 border-t border-[#E0DAD0] dark:border-olive/15"
          aria-labelledby="services-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6">
              <SectionHead
                loading={settingsLoading}
                eyebrow={s?.services_eyebrow}
                heading={s?.services_heading}
                subheading={s?.services_subheading}
              />
              <Link
                to="/what-i-do"
                className="font-body text-sm text-ember font-medium inline-flex items-center gap-2 hover:underline shrink-0 mt-2 md:mt-0"
              >
                View all services <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
              {servicesQ.isPending
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-snow dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-5 h-44 animate-pulse"
                    />
                  ))
                : services.slice(0, 3).map((service, idx) => {
                    const Icon = (service.icon && serviceIcons[service.icon]) || Lightbulb;
                    return (
                      <div
                        key={service.id ?? service.title ?? service.name ?? idx}
                        className="hover:-translate-y-1 transition-transform duration-200"
                      >
                        <Link
                          to={`/what-i-do#${service.id ?? ""}`}
                          className="group bg-snow dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-5 hover:border-ember transition-colors duration-200 block h-full flex-col justify-between"
                        >
                          <div>
                            <Icon
                              size={22}
                              className="text-olive group-hover:text-ember transition-colors duration-200"
                            />
                            <h3 className="font-display text-[17px] sm:text-[18px] text-ink dark:text-cream group-hover:text-ember mt-3 leading-snug transition-colors duration-200">
                              {service.title || service.name}
                            </h3>
                            <p className="font-body text-[13px] text-[#4A4A4A] dark:text-cream/60 mt-2 leading-relaxed line-clamp-3">
                              {service.description || service.problem || service.summary}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 mt-4 text-[12px] font-body text-ember opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                            View service <ArrowRight size={11} />
                          </span>
                        </Link>
                      </div>
                    );
                  })}
            </div>
          </div>
        </section>
      )}

      {/* PROCESS STEPS */}
      {(processQ.isPending || processSteps.length > 0) && (
        <section className="bg-forest py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-5">
                {settingsLoading ? (
                  <div className="space-y-3">
                    <Skel dark className="h-6 w-28" />
                    <Skel dark className="h-10 w-72 max-w-full" />
                    <Skel dark className="h-4 w-full" />
                    <Skel dark className="h-4 w-full" />
                  </div>
                ) : (
                  <>
                    {s?.process_eyebrow ? <Eyebrow tone="cream">{s.process_eyebrow}</Eyebrow> : null}
                    {s?.process_heading ? (
                      <h2 className="font-display text-[28px] sm:text-[36px] md:text-[42px] text-cream mt-3 sm:mt-4 leading-tight">
                        {s.process_heading}
                      </h2>
                    ) : null}
                    {s?.process_description1 ? (
                      <p className="font-body text-sm sm:text-base text-cream/70 mt-3 sm:mt-4 leading-relaxed">
                        {s.process_description1}
                      </p>
                    ) : null}
                    {s?.process_description2 ? (
                      <p className="font-body text-sm sm:text-base text-cream/70 mt-3 sm:mt-4 leading-relaxed">
                        {s.process_description2}
                      </p>
                    ) : null}
                    {s?.process_cta_text ? (
                      <CtaLink
                        to="/what-i-do"
                        className="w-full sm:w-auto text-center justify-center inline-flex items-center gap-2 mt-6 sm:mt-8 border border-ember text-ember px-5 py-3 text-sm font-body rounded-[4px] hover:bg-ember hover:text-snow transition-colors"
                      >
                        {s.process_cta_text} <ArrowRight size={14} />
                      </CtaLink>
                    ) : null}
                  </>
                )}
              </div>

              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-olive/20 border border-olive/20 rounded-[4px] overflow-hidden">
                  {processQ.isPending
                    ? Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="bg-forest p-5 sm:p-6 animate-pulse h-32" />
                      ))
                    : processSteps.map((step, idx) => (
                        <div
                          key={step.id ?? idx}
                          className="bg-forest p-5 sm:p-6 hover:bg-white/5 transition-colors duration-200"
                        >
                          <p className="font-display text-[28px] sm:text-[36px] text-olive/50 leading-none">
                            {step.step_number || `0${idx + 1}`}
                          </p>
                          <h3 className="font-display text-[18px] sm:text-[20px] text-cream mt-2">
                            {step.title}
                          </h3>
                          <p className="font-body text-[13px] text-cream/60 mt-2 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTORS */}
      {(sectorsQ.isPending || sectors.length > 0) && (
        <section className="bg-snow dark:bg-[#141410] py-16 sm:py-24 border-t border-[#E0DAD0] dark:border-olive/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <SectionHead
                center
                loading={settingsLoading}
                eyebrow={s?.sectors_eyebrow}
                heading={s?.sectors_heading}
                subheading={s?.sectors_subheading}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-8 sm:mt-12">
              {sectorsQ.isPending
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-paper dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-5 h-28 animate-pulse"
                    />
                  ))
                : sectors.map((sec, idx) => {
                    const Icon = sectorIconMap[sec.icon] || Landmark;
                    return (
                      <div
                        key={sec.id ?? `${sec.label}-${idx}`}
                        className="hover:-translate-y-1 transition-transform duration-200"
                      >
                        <div className="group bg-paper dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-4 sm:p-6 text-center hover:border-olive transition-colors duration-200">
                          <Icon
                            size={24}
                            className="text-forest dark:text-olive mx-auto sm:w-[26px] sm:h-[26px] group-hover:scale-110 transition-transform duration-200"
                          />
                          <p className="font-body text-[12px] sm:text-[13px] text-ink dark:text-cream mt-2 sm:mt-3 font-medium">
                            {sec.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </section>
      )}

      {/* WHY WORK WITH ME */}
      {(reasonsQ.isPending || reasons.length > 0) && (
        <section className="bg-paper dark:bg-[#0F0F0C] py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-5">
                <SectionHead
                  loading={settingsLoading}
                  eyebrow={s?.reasons_eyebrow}
                  heading={s?.reasons_heading}
                  subheading={s?.reasons_subheading}
                />
              </div>
              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                {reasonsQ.isPending
                  ? Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="bg-snow dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-5 h-24 animate-pulse"
                      />
                    ))
                  : reasons.map((item, idx) => (
                      <div
                        key={item.id ?? idx}
                        className="bg-snow dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-4 sm:p-5 flex gap-3.5 sm:gap-4 hover:translate-x-1 transition-transform duration-200"
                      >
                        <CheckCircle2
                          size={18}
                          className="text-ember shrink-0 mt-0.5 sm:w-[20px] sm:h-[20px]"
                        />
                        <div>
                          <h3 className="font-display text-[17px] sm:text-[20px] text-ink dark:text-cream leading-snug">
                            {item.t}
                          </h3>
                          <p className="font-body text-[13px] sm:text-[14px] text-[#4A4A4A] dark:text-cream/60 mt-1.5 leading-relaxed">
                            {item.d}
                          </p>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* INSIGHTS */}
      {(insightsQ.isPending || insights.length > 0) && (
        <section className="bg-snow dark:bg-[#141410] py-16 sm:py-24 border-t border-[#E0DAD0] dark:border-olive/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6">
              <SectionHead
                loading={settingsLoading}
                eyebrow={s?.insights_eyebrow}
                heading={s?.insights_heading}
                subheading={s?.insights_subheading}
              />
              <Link
                to="/insights"
                className="font-body text-sm text-ember font-medium inline-flex items-center gap-2 hover:underline shrink-0 mt-2 md:mt-0"
              >
                All insights <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
              {insightsQ.isPending
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-paper dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-5 h-52 animate-pulse"
                    />
                  ))
                : insights.slice(0, 3).map((post, idx) => (
                    <div
                      key={post.slug ?? post.id ?? idx}
                      className="h-full hover:-translate-y-1 transition-transform duration-200"
                    >
                      <Link
                        to={`/insights/${post.slug || post.id}`}
                        className="bg-paper dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-5 hover:border-olive transition-colors duration-200 block h-full flex-col justify-between"
                      >
                        <div>
                          <span className="inline-block bg-forest text-cream text-xs rounded-[4px] px-2 py-0.5 font-body">
                            {post.category || "General"}
                          </span>
                          <h3 className="font-display text-[18px] sm:text-[20px] text-ink dark:text-cream mt-3 leading-snug">
                            {post.title}
                          </h3>
                          <p className="font-body text-[13px] text-[#4A4A4A] dark:text-cream/60 mt-2 leading-relaxed line-clamp-3">
                            {post.excerpt || post.description || post.summary}
                          </p>
                        </div>
                        <p className="font-body text-[11px] sm:text-[12px] text-[#9A9A9A] mt-4">
                          {post.created_at
                            ? new Date(post.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : ""}{" "}
                          {post.read_time ? `· ${post.read_time}` : ""}
                        </p>
                      </Link>
                    </div>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {settingsLoading ? (
        <section className="relative bg-[#F7F4ED] dark:bg-[#0F0F0C] py-16 sm:py-20 md:py-28 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4">
            <Skel className="h-12 w-full max-w-xl" />
            <Skel className="h-5 w-full max-w-lg" />
          </div>
        </section>
      ) : s?.cta_heading ? (
        <section className="relative bg-[#F7F4ED] dark:bg-[#0F0F0C] py-16 sm:py-20 md:py-28 overflow-hidden">
          <BoxGridBackdrop className="opacity-40" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-[30px] sm:text-[42px] md:text-[54px] text-forest dark:text-olive leading-tight">
              {s.cta_heading}
            </h2>
            {s.cta_subtext ? (
              <p className="font-body text-base sm:text-lg text-black/70 dark:text-cream/70 mt-4 sm:mt-5 max-w-2xl mx-auto">
                {s.cta_subtext}
              </p>
            ) : null}
            {s.cta_button_text ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 sm:mt-10">
                <CtaLink
                  to={s.cta_button_link}
                  className="w-full sm:w-auto text-center bg-ember text-snow px-8 py-3.5 text-sm font-body font-bold rounded-[4px] hover:opacity-90 transition-opacity inline-block"
                >
                  {s.cta_button_text}
                </CtaLink>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
};

export default Index;