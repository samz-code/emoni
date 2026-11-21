import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import SEO from "@/components/SEO";
import { MarketFlags } from "@/components/Flag";
import { useServiceMenu } from "@/lib/serviceMenu";
import { useMarket, useMarketList } from "@/lib/markets";
import { SITE, breadcrumbSchema } from "@/lib/seoData";

const CONTAINER = "mx-auto w-full max-w-[1120px] px-5 sm:px-8 lg:px-10";
const H2 = "font-display text-2xl sm:text-3xl lg:text-[34px] leading-tight tracking-tight";
const BODY = "font-body text-base leading-relaxed text-[#4A4A4A]";
const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember";

const TIME_NOTE: Record<string, string> = {
  "united-states": "7–11 hrs ahead of US time",
  canada: "7–11 hrs ahead of Canadian time",
  "united-kingdom": "2–3 hrs ahead of UK time",
  australia: "5–8 hrs behind Australian time",
  "united-arab-emirates": "1 hr behind UAE time",
  "expanding-to-kenya": "Based in Nairobi",
  "east-africa": "Same time zone as you",
};

// Optional second clock in the hero card. Markets without an entry just show Nairobi.
const ZONES: Record<string, { tz: string; city: string }> = {
  "united-states": { tz: "America/New_York", city: "New York" },
  canada: { tz: "America/Toronto", city: "Toronto" },
  "united-kingdom": { tz: "Europe/London", city: "London" },
  australia: { tz: "Australia/Sydney", city: "Sydney" },
  "united-arab-emirates": { tz: "Asia/Dubai", city: "Dubai" },
};

const STEPS = [
  { title: "Free call", text: "We talk through what you need." },
  { title: "Fixed quote", text: "Written scope and price before we start." },
  { title: "Build", text: "Weekly updates and a live preview link." },
  { title: "Launch", text: "You get the code, accounts and a handover guide." },
];

// Database headings that are stored in ALL CAPS get title-cased for display.
const tidy = (s: string) =>
  /[A-Z]/.test(s) && s === s.toUpperCase()
    ? s.toLowerCase().replace(/(^|\s)([a-z])/g, (_, sp, c) => sp + c.toUpperCase())
    : s;

const Time = ({ tz, now }: { tz: string; now: Date }) => {
  let main = "--:--:--";
  let period = "";
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    main = `${get("hour")}:${get("minute")}:${get("second")}`;
    period = get("dayPeriod").toUpperCase();
  } catch {
    /* keep placeholder */
  }
  return (
    <p className="font-display text-3xl tabular-nums">
      {main} <span className="font-body text-base font-semibold text-cream/70">{period}</span>
    </p>
  );
};

const useNow = (ms = 1000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
};

// ── Banner: full-bleed band with a faint pattern behind the content ──
const Banner = ({
  tone,
  labelledBy,
  invertPattern = false,
  children,
}: {
  tone: string;
  labelledBy: string;
  invertPattern?: boolean;
  children: React.ReactNode;
}) => (
  <section className={`relative overflow-hidden py-14 lg:py-20 ${tone}`} aria-labelledby={labelledBy}>
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 bg-[url('/pattern.webp')] bg-repeat opacity-5 ${
        invertPattern ? "invert" : ""
      }`}
    />
    <div className={`relative ${CONTAINER}`}>{children}</div>
  </section>
);

const MarketLanding = () => {
  const { market: slug } = useParams();
  const { market, loading } = useMarket(slug);
  const allMarkets = useMarketList();
  const serviceMenu = useServiceMenu();
  const now = useNow();

  if (loading) return <div className="min-h-screen bg-paper" aria-busy="true" />;
  if (!market) return <Navigate to="/what-i-do" replace />;

  const path = `/markets/${market.slug}`;
  const whatsapp = `https://wa.me/254727492545?text=${encodeURIComponent(market.whatsappMessage)}`;

  const popularHrefs = market.popularServices.map((id) => `/what-i-do#${id}`);
  const ordered = [
    ...serviceMenu.filter((s) => popularHrefs.includes(s.href)),
    ...serviceMenu.filter((s) => !popularHrefs.includes(s.href)),
  ];

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: market.h1,
      description: market.description,
      url: `${SITE.url}${path}`,
      areaServed: { "@type": "Country", name: market.country },
      provider: { "@id": `${SITE.url}/#business` },
    },
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Markets", path: "/what-i-do" },
      { name: market.country, path },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: market.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  const whyHeading =
    market.country === "Kenya"
      ? "Why companies launching here work with me"
      : `Why businesses in ${market.country} work with me`;

  const zone = ZONES[market.slug];
  const timeNote = TIME_NOTE[market.slug] ?? "Nairobi, EAT (UTC+3)";
  const waBtn = `inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#25D366] px-6 font-body text-[15px] font-bold text-ink transition-colors hover:bg-[#3BE07A] ${FOCUS}`;

  return (
    <>
      <SEO
        title={market.title}
        description={market.description}
        canonical={path}
        keywords={[market.primaryKeyword, ...market.secondaryKeywords].join(", ")}
        schema={schema}
      />

      <main className="pb-24 lg:pb-0">
        {/* ── Hero: text left, "working with me" panel right (always filled) ── */}
        <section className="bg-paper pt-28 pb-14 lg:pt-36 lg:pb-20">
          <div className={`${CONTAINER} grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14`}>
            <div>
              <MarketFlags codes={market.flags} size={40} />
              <h1 className="mt-6 max-w-xl font-display text-3xl font-semibold leading-[1.12] tracking-tight text-ink sm:text-4xl lg:text-[44px]">
                {tidy(market.h1)}
              </h1>
              <p className={`mt-5 max-w-lg ${BODY} sm:text-[17px]`}>{market.intro}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={waBtn}>
                  <FaWhatsapp size={18} aria-hidden="true" /> Book a free call
                </a>
                <Link
                  to="/contact"
                  className={`inline-flex min-h-12 items-center gap-2 rounded-lg border border-ink/30 px-6 font-body text-[15px] font-semibold text-ink transition-colors hover:border-forest hover:bg-forest hover:text-cream ${FOCUS}`}
                >
                  Send a project brief <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <aside className="self-start rounded-2xl bg-forest p-6 text-cream sm:p-7" aria-label="Working with me">
              <div className="space-y-4 border-b border-cream/20 pb-5">
                {zone && (
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-body text-sm text-cream/70">{zone.city}</p>
                    <Time tz={zone.tz} now={now} />
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-body text-sm text-cream/70">Nairobi</p>
                  <Time tz="Africa/Nairobi" now={now} />
                </div>
              </div>
              <dl className="mt-5 space-y-4 font-body text-[15px]">
                <div className="flex justify-between gap-6">
                  <dt className="text-cream/70">Time</dt>
                  <dd className="text-right">{timeNote}</dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="text-cream/70">Pricing</dt>
                  <dd className="text-right">{market.currency} or KSh</dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="text-cream/70">Payment</dt>
                  <dd className="text-right">By milestone</dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="text-cream/70">First step</dt>
                  <dd className="text-right">Free call</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        {/* ── Challenges: interactive explorer ── */}
        <section className="border-t border-ink/10 bg-paper py-14 lg:py-20" aria-labelledby="challenges-heading">
          <div className={CONTAINER}>
            <h2 id="challenges-heading" className={`${H2} max-w-2xl normal-case text-ink`}>
              {market.challengesHeading}
            </h2>
            <ol className="mt-10 grid gap-x-12 gap-y-9 md:grid-cols-2">
              {market.challenges.map((c, i) => (
                <li
                  key={c.heading}
                  className="flex gap-4 border-t border-ink/15 pt-6 md:[&:last-child:nth-child(odd)]:col-span-2"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest font-body text-sm font-bold text-cream">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold normal-case text-ink">{c.heading}</h3>
                    <p className={`mt-2 max-w-lg text-base ${BODY}`}>{c.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Cost of waiting ── */}
        <Banner tone="bg-[#C8A96A] text-ink" labelledBy="cost-heading">
          <h2 id="cost-heading" className={`${H2} font-semibold normal-case text-forest`}>
            What waiting costs you
          </h2>
          <p className="mt-6 w-full font-display text-xl leading-snug sm:text-2xl lg:text-[28px]">
            {market.costOfWaiting}
          </p>
        </Banner>

        {/* ── Why me ── */}
        <Banner tone="bg-forest text-cream" labelledBy="why-heading">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <h2 id="why-heading" className={`${H2} normal-case lg:sticky lg:top-28 lg:self-start`}>
              {whyHeading}
            </h2>
            <ul className="divide-y divide-cream/20 border-y border-cream/20">
              {market.whyWorkWithMe.map((item) => (
                <li key={item.heading} className="flex gap-4 py-7">
                  <Check size={22} className="mt-0.5 shrink-0 text-[#C8A96A]" aria-hidden="true" />
                  <div>
                    <h3 className="font-display text-xl font-semibold normal-case">{item.heading}</h3>
                    <p className="mt-2 max-w-xl font-body text-[17px] leading-relaxed text-cream/85">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Banner>

        {/* ── What you get ── */}
        <section className="bg-paper py-14 lg:py-20" aria-labelledby="deliverables-heading">
          <div className={CONTAINER}>
            <h2 id="deliverables-heading" className={`${H2} text-ink`}>
              What you get
            </h2>
            <ul className="mt-10 grid gap-x-12 gap-y-7 md:grid-cols-2">
              {market.deliverables.map((d) => (
                <li key={d.heading} className="flex gap-3">
                  <Check size={20} className="mt-0.5 shrink-0 text-forest" aria-hidden="true" />
                  <div>
                    <h3 className="font-display text-base font-semibold text-ink">{d.heading}</h3>
                    <p className={`mt-1 max-w-md text-[15px] ${BODY}`}>{d.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="border-t border-ink/10 bg-paper py-14 lg:py-20" aria-labelledby="process-heading">
          <div className={CONTAINER}>
            <h2 id="process-heading" className={`${H2} text-ink`}>
              {market.workingModel.heading}
            </h2>
            <p className={`mt-4 max-w-2xl ${BODY}`}>{market.workingModel.text}</p>
            <ol className="relative mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <span className="absolute left-0 right-0 top-[13px] hidden h-px bg-ink/20 lg:block" aria-hidden="true" />
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative">
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-ink font-body text-xs font-bold text-cream">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold text-ink">{s.title}</h3>
                  <p className={`mt-1 max-w-[15rem] text-[15px] ${BODY}`}>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── FAQ ── */}
        <Banner tone="bg-[#EBE0C4] text-ink" labelledBy="faq-heading">
          <h2 id="faq-heading" className={`${H2} max-w-2xl normal-case`}>
            Common questions
          </h2>
          <ol className="mt-10 grid items-start gap-x-12 md:grid-cols-2">
            {market.faqs.map((f, i) => (
              <li key={f.q} className="border-t border-ink/20 md:[&:last-child:nth-child(odd)]:col-span-2">
                <details className="group py-5">
                  <summary
                    className={`flex cursor-pointer list-none items-start gap-4 font-display text-base font-semibold normal-case text-ink sm:text-lg [&::-webkit-details-marker]:hidden ${FOCUS}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest font-body text-sm font-bold text-cream">
                      {i + 1}
                    </span>
                    <span className="flex-1 pt-1.5 leading-snug">{f.q}</span>
                    <Plus
                      size={18}
                      className="mt-2.5 shrink-0 text-forest transition-transform group-open:rotate-45 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="mt-3 max-w-lg pl-[52px] font-body text-base leading-relaxed text-[#3F3F3F]">{f.a}</p>
                </details>
              </li>
            ))}
          </ol>
        </Banner>

        {/* ── Services ── */}
        {ordered.length > 0 && (
          <section className="border-t border-ink/10 bg-paper py-12" aria-labelledby="services-heading">
            <div className={CONTAINER}>
              <h2 id="services-heading" className="font-display text-lg font-semibold text-ink">
                Services available to you
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {ordered.map((s) => (
                  <li key={s.href}>
                    <Link
                      to={s.href}
                      className={`inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-4 py-1.5 font-body text-sm text-ink transition-colors hover:border-forest hover:bg-forest hover:text-cream ${FOCUS}`}
                    >
                      {s.label.charAt(0) + s.label.slice(1).toLowerCase()}
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── Final CTA ── */}
        <Banner tone="bg-forest text-cream" labelledBy="cta-heading">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 id="cta-heading" className="font-display text-2xl font-semibold normal-case tracking-tight sm:text-3xl">
                Tell me what you are trying to build
              </h2>
              <p className="mt-3 max-w-lg font-body text-base text-cream/80">
                A free call is enough to tell you what it would take, what it would cost and whether I am the right fit.
              </p>
            </div>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`${waBtn} shrink-0 self-start`}>
              <FaWhatsapp size={18} aria-hidden="true" /> Book a free call
            </a>
          </div>
        </Banner>

        {/* ── Other regions ── */}
        <section className="bg-paper py-10" aria-label="Other regions">
          <div className={CONTAINER}>
            <p className="mb-3 font-body text-sm text-[#6B6B6B]">Also serving</p>
            <ul className="flex flex-wrap gap-x-7 gap-y-3">
              {allMarkets
                .filter((m) => m.slug !== market.slug)
                .map((m) => (
                  <li key={m.slug}>
                    <Link
                      to={`/markets/${m.slug}`}
                      className={`inline-flex items-center gap-2.5 font-body text-[15px] text-ink underline-offset-4 hover:text-forest hover:underline ${FOCUS}`}
                    >
                      <MarketFlags codes={m.flags} size={28} />
                      {m.country}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      </main>

      {/* Sticky call-to-action bar (mobile only) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] font-body text-sm font-bold text-ink ${FOCUS}`}
        >
          <FaWhatsapp size={18} aria-hidden="true" /> Book a free call
        </a>
      </div>
    </>
  );
};

export default MarketLanding;