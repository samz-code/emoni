import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowRight, ArrowUpRight, CheckCircle2, Clock, Loader2,
  Star, Tag, Target, Users, Wand2, Wrench,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import SEO, { SITE_URL } from "@/components/SEO";
import ProcessStep from "@/components/ProcessStep";
import Breadcrumbs, { breadcrumbSchema, type Crumb } from "@/components/detail/Breadcrumbs";
import FaqAccordion, { faqSchema, type FaqItem } from "@/components/detail/FaqAccordion";
import { asList, resolveIcon, truncate } from "@/lib/detail";
import { applicableOffer, formatKes, isOfferActive, quotePrice, useOffers } from "@/lib/servicePricing";

interface ServiceRow {
  id: string;
  name: string;
  category?: string | null;
  icon?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  problem?: string | null;
  solution?: string | null;
  outcome?: string | null;
  deliverables?: unknown;
  tools?: unknown;
  timeline?: string | null;
  starting_from?: string | null;
  starting_price?: number | string | null;
  price_unit?: string | null;
  hero_headline?: string | null;
  hero_primary_label?: string | null;
  hero_primary_link?: string | null;
  hero_secondary_label?: string | null;
  hero_secondary_link?: string | null;
  ideal_for?: string | null;
  banner_url?: string | null;
  gallery_urls?: unknown;
  faqs?: unknown;
  pricing_packages?: unknown;
  pricing_addons?: unknown;
  page_sections?: unknown;
  trust_metrics?: unknown;
  testimonials?: unknown;
  review_rating?: number | string | null;
  review_count?: number | null;
  google_review_url?: string | null;
  portfolio_heading?: string | null;
  portfolio_intro?: string | null;
  process_heading?: string | null;
  portfolio_items?: unknown;
  service_process_steps?: unknown;
}

interface PricingPackage {
  name: string;
  description: string;
  price: number | null;
  price_label: string;
  featured: boolean;
  includes: string[];
  excludes: string[];
}

interface PricingAddon {
  name: string;
  description: string;
  price: number;
}

interface MarketingSection {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
}

interface PortfolioItem {
  name: string;
  category: string;
  image_url: string;
  live_url: string;
}

interface ServiceProcessStep extends ProcessStepRow {
  step_number: string;
}

type ServiceTeaser = Pick<ServiceRow, "id" | "name" | "category" | "icon" | "outcome">;

interface ProcessStepRow {
  id?: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  step_number?: any;
  title: string;
  description: string;
}

// "Week 1: Title. Rest of text" -> bold label + normal text
const LABEL = /^((?:week|module|step|phase|day|part|stage)\s+\d+\s*:[^.\n]*\.?)\s*([\s\S]*)$/i;
const BULLET = /^\s*(?:[-•*✓✔]\s+)/;

const splitParagraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/**
 * Renders a long description:
 * - "Week 1: Title." style openings are bolded
 * - short single-line paragraphs without a full stop become sub-headings
 * - paragraphs where every line starts with -, • or * become tick lists
 */
function RichParagraphs({ text }: { text: string }) {
  return (
    <>
      {splitParagraphs(text).map((paragraph, index) => {
        const lines = paragraph.split("\n").map((l) => l.trim()).filter(Boolean);

        if (lines.length > 0 && lines.every((l) => BULLET.test(l))) {
          return (
            <ul key={index} className="space-y-2">
              {lines.map((line, i) => (
                <li key={i} className="flex gap-3 font-body text-base leading-relaxed text-ink/85">
                  <CheckCircle2 size={18} aria-hidden="true" className="mt-1 shrink-0 text-ember" />
                  <span className="min-w-0 break-words">{line.replace(BULLET, "")}</span>
                </li>
              ))}
            </ul>
          );
        }

        const match = paragraph.match(LABEL);
        if (match) {
          return (
            <p
              key={index}
              className="whitespace-pre-line break-words font-body text-base leading-relaxed text-ink/85"
            >
              <strong className="font-semibold text-ink">{match[1]}</strong>
              {match[2] ? ` ${match[2]}` : ""}
            </p>
          );
        }

        if (lines.length === 1 && paragraph.length <= 70 && !/[.!?]$/.test(paragraph)) {
          return (
            <h3 key={index} className="pt-2 font-display text-xl text-ink">
              {paragraph}
            </h3>
          );
        }

        return (
          <p
            key={index}
            className="whitespace-pre-line break-words font-body text-base leading-relaxed text-ink/85"
          >
            {paragraph}
          </p>
        );
      })}
    </>
  );
}

const hasText = (text: string) => text.trim().length > 0;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const readText = (value: unknown) => (typeof value === "string" ? value : "");
const readOptionalPrice = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const readFaqs = (value: unknown): FaqItem[] =>
  Array.isArray(value)
    ? (value
        .map((f: any) => ({
          question: String(f?.question ?? "").trim(),
          answer: String(f?.answer ?? "").trim(),
        }))
        .filter((f) => f.question && f.answer) as FaqItem[])
    : [];

const safePageLink = (value: string | null | undefined, fallback: string) => {
  const link = (value || "").trim();
  if (/^https?:\/\//i.test(link) || /^(mailto:|tel:)/i.test(link)) return link;
  if ((link.startsWith("/") && !link.startsWith("//")) || link.startsWith("#")) return link;
  return fallback;
};

function ServiceAction({ to, className, children }: { to: string; className: string; children: React.ReactNode }) {
  if (/^https?:\/\//i.test(to)) {
    return <a href={to} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
  }
  if (/^(mailto:|tel:)/i.test(to)) {
    return <a href={to} className={className}>{children}</a>;
  }
  return <Link to={to} className={className}>{children}</Link>;
}

const readPortfolioItems = (value: unknown): PortfolioItem[] =>
  Array.isArray(value)
    ? value.filter(isRecord).map((item) => ({
        name: readText(item.name).trim(),
        category: readText(item.category).trim(),
        image_url: readText(item.image_url).trim(),
        live_url: readText(item.live_url).trim(),
      })).filter((item) => item.name)
    : [];

const readServiceSteps = (value: unknown): ServiceProcessStep[] =>
  Array.isArray(value)
    ? value.filter(isRecord).map((step) => ({
        step_number: readText(step.step_number).trim(),
        title: readText(step.title).trim(),
        description: readText(step.description).trim(),
      })).filter((step) => step.title)
    : [];

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
  const [selectedAddonIndexes, setSelectedAddonIndexes] = useState<number[]>([]);

  const {
    data: service,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["service-detail", id],
    enabled: Boolean(id),
    staleTime: 60_000,
    retry: 1,
    queryFn: async (): Promise<ServiceRow | null> => {
      const { data, error: fetchError } = await supabase
        .from("services")
        .select("*")
        .eq("id", id as string)
        .eq("published", true)
        .maybeSingle();
      if (fetchError) throw fetchError;
      return (data as ServiceRow | null) ?? null;
    },
  });

  const { data: offers = [], error: offerError } = useOffers();

  useEffect(() => {
    if (offerError) console.error("Could not load service offers:", offerError);
  }, [offerError]);

  const { data: categoryLabel } = useQuery({
    queryKey: ["service-category", service?.category],
    enabled: Boolean(service?.category),
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<string | null> => {
      const { data, error: fetchError } = await supabase
        .from("service_categories")
        .select("label")
        .eq("id", service?.category as string)
        .maybeSingle();
      if (fetchError) throw fetchError;
      return (data?.label as string | undefined) ?? null;
    },
  });

  const { data: steps = [] } = useQuery({
    queryKey: ["service-process-steps"],
    enabled: Boolean(service),
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<ProcessStepRow[]> => {
      const { data, error: fetchError } = await supabase
        .from("process_steps")
        .select("*")
        .order("sort_order", { ascending: true });
      if (fetchError) throw fetchError;
      return (data ?? []) as ProcessStepRow[];
    },
  });

  const { data: related = [] } = useQuery({
    queryKey: ["service-related", id, service?.category],
    enabled: Boolean(service),
    staleTime: 60_000,
    queryFn: async (): Promise<ServiceTeaser[]> => {
      const { data, error: fetchError } = await supabase
        .from("services")
        .select("id,name,category,icon,outcome")
        .eq("published", true)
        .neq("id", id as string)
        .order("sort_order", { ascending: true })
        .limit(12);
      if (fetchError) throw fetchError;
      const rows = (data ?? []) as ServiceTeaser[];
      const same = rows.filter((row) => row.category === service?.category);
      const others = rows.filter((row) => row.category !== service?.category);
      return [...same, ...others].slice(0, 3);
    },
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-paper py-32">
        <Loader2 size={36} className="mb-4 animate-spin text-ember" aria-hidden="true" />
        <p className="font-body text-sm text-ink/60">Loading service…</p>
      </main>
    );
  }

  if (error || !service) {
    return (
      <>
        <SEO
          title="Service not found | Samuel A. Emoni"
          description="This service could not be found."
          noindex
        />
        <main className="min-h-[70vh] bg-paper px-4 py-24 text-center">
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Service not found</h1>
          <p className="mx-auto mt-3 max-w-md font-body text-ink/65">
            {error
              ? "The service could not be loaded. Please try again later."
              : "This service is unavailable or has not been published yet."}
          </p>
          <Link
            to="/what-i-do"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-forest px-5 font-body text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-cream"
          >
            See all services
          </Link>
        </main>
      </>
    );
  }

  // ---- Derived content (all editable from the admin panel) ----
  const Icon = resolveIcon(service.icon);
  const deliverables = asList(service.deliverables);
  const tools = asList(service.tools);
  const gallery = asList(service.gallery_urls);
  const customFaqs = readFaqs(service.faqs);
  const shortDescription = (service.short_description || "").trim();
  const longDescription = (service.long_description || "").trim();
  const problem = (service.problem || "").trim();
  const solution = (service.solution || "").trim();
  const outcome = (service.outcome || "").trim();
  const idealFor = (service.ideal_for || "").trim();
  const timeline = (service.timeline || "").trim();
  const startingFrom = (service.starting_from || "").trim();
  const startingPrice = service.starting_price === null || service.starting_price === undefined
    ? null
    : Number(service.starting_price);
  const path = `/what-i-do/${service.id}`;
  const url = `${SITE_URL}${path}`;
  const contactHref = `/contact?service=${encodeURIComponent(service.id)}`;
  const priceUnit = (service.price_unit || "").trim();
  const heroHeadline = (service.hero_headline || "").trim();
  const primaryLabel = (service.hero_primary_label || "").trim() || "Start this project";
  const primaryLink = safePageLink(service.hero_primary_link, contactHref);
  const secondaryLabel = (service.hero_secondary_label || "").trim() || "See my work";
  const secondaryLink = safePageLink(service.hero_secondary_link, "/projects");
  const portfolioItems = readPortfolioItems(service.portfolio_items);
  const portfolioHeading = (service.portfolio_heading || "").trim() || "Selected work";
  const portfolioIntro = (service.portfolio_intro || "").trim();
  const processHeading = (service.process_heading || "").trim() || "How we will work together";
  const reviewRating = Number(service.review_rating);
  const googleReviewUrl = safePageLink(service.google_review_url, "");
  const customSteps = readServiceSteps(service.service_process_steps);
  const processSteps = customSteps.length > 0 ? customSteps : steps;
  const banner = (service.banner_url || "").trim();
  const label = categoryLabel || service.category || "";
  const heroText = shortDescription || problem;
  const appliedOffer = applicableOffer(offers, { type: "service", id: service.id, currency: "KES" });
  const offerActive = isOfferActive(appliedOffer);
  const trustMetrics = Array.isArray(service.trust_metrics)
    ? service.trust_metrics.filter(isRecord).map((item) => ({
        value: readText(item.value).trim(),
        label: readText(item.label).trim(),
      })).filter((item) => item.value && item.label)
    : [];
  const testimonials = Array.isArray(service.testimonials)
    ? service.testimonials.filter(isRecord).map((item) => ({
        quote: readText(item.quote).trim(),
        author: readText(item.author).trim(),
      })).filter((item) => item.quote && item.author)
    : [];
  const reviewCount = Number(service.review_count) || testimonials.length;
  const pageSections: MarketingSection[] = Array.isArray(service.page_sections)
    ? service.page_sections.filter(isRecord).filter((section) => section.title).map((section) => ({
        eyebrow: readText(section.eyebrow),
        title: readText(section.title),
        description: readText(section.description),
        items: asList(section.items),
      }))
    : [];
  const pricingPackages: PricingPackage[] = Array.isArray(service.pricing_packages)
    ? service.pricing_packages.filter(isRecord).filter((item) => item.name).map((item) => ({
        name: readText(item.name),
        description: readText(item.description),
        price: readOptionalPrice(item.price),
        price_label: readText(item.price_label),
        featured: item.featured === true,
        includes: asList(item.includes),
        excludes: asList(item.excludes),
      }))
    : [];
  const pricingAddons: PricingAddon[] = Array.isArray(service.pricing_addons)
    ? service.pricing_addons.filter(isRecord).map((item) => ({
        name: readText(item.name),
        description: readText(item.description),
        price: readOptionalPrice(item.price),
      })).filter((item): item is PricingAddon => Boolean(item.name) && item.price !== null)
    : [];
  const selectedPackage = pricingPackages[selectedPackageIndex] || pricingPackages[0];
  const selectedAddonTotal = selectedAddonIndexes.reduce(
    (total, index) => total + (pricingAddons[index]?.price || 0),
    0,
  );
  const baseEstimate = selectedPackage?.price;
  const estimate = baseEstimate === null || baseEstimate === undefined
    ? null
    : quotePrice(baseEstimate + selectedAddonTotal, appliedOffer);
  const startQuote = startingPrice !== null && Number.isFinite(startingPrice)
    ? quotePrice(startingPrice, appliedOffer)
    : null;

  const crumbs: Crumb[] = [
    { label: "Home", to: "/" },
    { label: "Services", to: "/what-i-do" },
    { label: service.name },
  ];

  const generatedFaqs: FaqItem[] = [
    problem && {
      question: `What problem does ${service.name} solve?`,
      answer: problem,
    },
    solution && {
      question: `How does ${service.name} work?`,
      answer: solution,
    },
    deliverables.length > 0 && {
      question: `What will I receive with ${service.name}?`,
      answer: `You receive:\n${deliverables.map((item) => `• ${item}`).join("\n")}`,
    },
    timeline && {
      question: `How long does ${service.name} take?`,
      answer: `A typical ${service.name} project takes ${timeline}.`,
    },
    startingFrom && {
      question: `How much does ${service.name} cost?`,
      answer: `${service.name} starts from ${startQuote ? formatKes(startQuote.discounted) : startingFrom}. Send a message for a quote based on your exact needs.`,
    },
    idealFor && {
      question: `Who is ${service.name} best suited for?`,
      answer: idealFor,
    },
    {
      question: `Do you offer ${service.name} outside Nairobi?`,
      answer:
        "Yes. Emoni Digital Solutions is based in Nairobi, Kenya, and works with clients across Kenya and the rest of Africa, remotely or in person.",
    },
  ].filter(Boolean) as FaqItem[];

  const customQuestions = new Set(customFaqs.map((f) => f.question.toLowerCase()));
  const faqs: FaqItem[] = [
    ...customFaqs,
    ...generatedFaqs.filter((f) => !customQuestions.has(f.question.toLowerCase())),
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: service.name,
    description:
      truncate(shortDescription || longDescription || solution || problem || outcome, 300) || service.name,
    serviceType: label || service.name,
    url,
    image: banner || undefined,
    provider: {
      "@type": "ProfessionalService",
      name: "Emoni Digital Solutions",
      url: SITE_URL,
    },
    areaServed: [
      { "@type": "Country", name: "Kenya" },
      { "@type": "Continent", name: "Africa" },
    ],
    audience: idealFor ? { "@type": "Audience", audienceType: idealFor } : undefined,
    termsOfService: `${SITE_URL}/terms`,
  };

  return (
    <>
      <SEO
        title={`${service.name} Services in Kenya | Samuel A. Emoni`}
        description={
          truncate(shortDescription || solution || problem || outcome, 155) ||
          `${service.name} by Samuel A. Emoni, serving businesses across Kenya and Africa.`
        }
        canonical={path}
        keywords={[service.name, label, "Kenya", "Nairobi", "Africa"].filter(Boolean).join(", ")}
        schema={[serviceSchema, breadcrumbSchema(crumbs, path), ...(faqs.length ? [faqSchema(faqs)] : [])]}
      />

      <main className="bg-paper">
        {/* ============ HERO ============ */}
        <section className="patterned-surface relative overflow-hidden bg-forest text-cream">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-ember/20 blur-3xl"
          />
          <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pb-20 lg:px-8">
            <Breadcrumbs items={crumbs} dark />

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center lg:gap-14"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ember text-cream">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  {label && (
                    <span className="rounded bg-cream/10 px-2.5 py-1 font-body text-xs font-semibold uppercase tracking-wider text-cream">
                      {label}
                    </span>
                  )}
                </div>

                <h1 className="mt-5 break-words font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                  {heroHeadline || service.name}
                </h1>

                {heroText && (
                  <p className="mt-6 max-w-2xl whitespace-pre-line break-words font-body text-base leading-relaxed text-cream/80 sm:text-lg">
                    {truncate(heroText, 220)}
                  </p>
                )}

                {(timeline || startingFrom || startQuote) && (
                  <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 font-body text-sm">
                    {timeline && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} aria-hidden="true" className="text-olive" />
                        <dt className="sr-only">Typical timeline</dt>
                        <dd className="font-semibold">{timeline}</dd>
                      </div>
                    )}
                    {(startQuote || startingFrom) && (
                      <div className="flex items-center gap-2">
                        <Tag size={16} aria-hidden="true" className="text-olive" />
                        <dt className="sr-only">Starting from</dt>
                        <dd className="font-semibold">
                          From{" "}
                          {startQuote ? (
                            <>
                              {startQuote.savings > 0 && (
                                <span className="mr-2 text-cream/55 line-through">{formatKes(startQuote.original)}</span>
                              )}
                              {formatKes(startQuote.discounted)}
                              {priceUnit ? ` ${priceUnit}` : ""}
                            </>
                          ) : startingFrom}
                        </dd>
                      </div>
                    )}
                  </dl>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <ServiceAction
                    to={primaryLink}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-olive px-6 py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                  >
                    {primaryLabel} <ArrowUpRight size={16} aria-hidden="true" />
                  </ServiceAction>
                  <ServiceAction
                    to={secondaryLink}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-cream/40 px-6 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-cream/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                  >
                    {secondaryLabel}
                  </ServiceAction>
                </div>
              </div>

              {outcome && (
                <aside
                  aria-label="Expected outcome"
                  className="rounded-2xl border border-cream/15 bg-cream/5 p-6 backdrop-blur-sm sm:p-8"
                >
                  <p className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.16em] text-olive">
                    <Target size={16} aria-hidden="true" /> The outcome
                  </p>
                  <p className="mt-4 break-words font-display text-2xl leading-snug sm:text-3xl">{outcome}</p>
                </aside>
              )}
            </motion.div>
          </div>
        </section>

        {trustMetrics.length > 0 && (
          <section aria-label="Service highlights" className="border-b border-border bg-snow">
            <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-border px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
              {trustMetrics.map((metric, index) => (
                <div key={`${metric.value}-${index}`} className="py-5 text-center sm:px-5 sm:py-7">
                  <p className="font-display text-2xl text-forest">{metric.value}</p>
                  <p className="mt-1 font-body text-sm text-ink/65">{metric.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {offerActive && appliedOffer && (
          <aside aria-label="Current service offer" className="bg-ember text-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <div>
                <p className="font-display text-lg">{appliedOffer.title}</p>
                {appliedOffer.description && <p className="mt-1 font-body text-sm text-white/85">{appliedOffer.description}</p>}
              </div>
              <p className="shrink-0 rounded-full bg-white/15 px-4 py-2 font-body text-sm font-bold">
                {appliedOffer.discount_type === "percentage"
                  ? `${appliedOffer.discount_value}% off`
                  : `${formatKes(Number(appliedOffer.discount_value))} off`}
              </p>
            </div>
          </aside>
        )}

        {/* ============ BODY ============ */}
        <div className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          {banner && (
            <img
              src={banner}
              alt={service.name}
              loading="lazy"
              className="aspect-[16/9] w-full rounded-2xl border border-border object-cover"
            />
          )}

          {hasText(longDescription) && (
            <section aria-labelledby="service-about">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">About this service</p>
              <h2 id="service-about" className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                What is involved
              </h2>
              <div className="mt-6 max-w-3xl space-y-5">
                <RichParagraphs text={longDescription} />
              </div>
            </section>
          )}

          {pageSections.map((section, index) => (
            <section key={`${section.title}-${index}`} aria-labelledby={`service-section-${index}`}>
              {section.eyebrow && (
                <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">{section.eyebrow}</p>
              )}
              <h2 id={`service-section-${index}`} className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                {section.title}
              </h2>
              {section.description && (
                <p className="mt-4 max-w-3xl whitespace-pre-line font-body text-base leading-relaxed text-ink/75">
                  {section.description}
                </p>
              )}
              {section.items.length > 0 && (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={`${item}-${itemIndex}`} className="flex gap-3 rounded-xl border border-border bg-snow p-4 font-body text-sm text-ink/85 sm:text-base">
                      <CheckCircle2 size={19} aria-hidden="true" className="mt-0.5 shrink-0 text-ember" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {(problem || solution) && (
            <section aria-labelledby="service-story" className="grid gap-6 md:grid-cols-2">
              <h2 id="service-story" className="sr-only">
                The problem and how it is solved
              </h2>
              {problem && (
                <article className="rounded-2xl border border-border bg-snow p-6 sm:p-8">
                  <p className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">
                    <AlertTriangle size={16} aria-hidden="true" /> The problem
                  </p>
                  <p className="mt-4 whitespace-pre-line break-words font-body text-base leading-relaxed text-ink/85">
                    {problem}
                  </p>
                </article>
              )}
              {solution && (
                <article className="rounded-2xl border border-border bg-snow p-6 sm:p-8">
                  <p className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.16em] text-forest">
                    <Wand2 size={16} aria-hidden="true" /> How it is solved
                  </p>
                  <p className="mt-4 whitespace-pre-line break-words font-body text-base leading-relaxed text-ink/85">
                    {solution}
                  </p>
                </article>
              )}
            </section>
          )}

          {deliverables.length > 0 && (
            <section aria-labelledby="service-deliverables">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">What you get</p>
              <h2 id="service-deliverables" className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                Deliverables
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {deliverables.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="flex gap-3 rounded-xl border border-border bg-snow p-4 font-body text-sm text-ink/85 sm:text-base"
                  >
                    <CheckCircle2 size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-ember" />
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tools.length > 0 && (
            <section aria-labelledby="service-tools" className="rounded-2xl border border-border bg-snow p-6 sm:p-8">
              <h2 id="service-tools" className="flex items-center gap-2 font-display text-xl text-ink">
                <Wrench size={20} aria-hidden="true" className="text-ember" /> Tools &amp; technologies
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {tools.map((tool, index) => (
                  <li
                    key={`${tool}-${index}`}
                    className="rounded-full border border-border bg-paper px-3.5 py-1.5 font-body text-sm text-ink"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {idealFor && (
            <section
              aria-labelledby="service-ideal"
              className="flex flex-col gap-4 rounded-2xl border-2 border-ink p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8"
            >
              <h2 id="service-ideal" className="flex shrink-0 items-center gap-2 font-display text-xl text-ink">
                <Users size={22} aria-hidden="true" className="text-ember" /> Ideal for
              </h2>
              <p className="break-words font-body text-base font-semibold leading-relaxed text-ink">{idealFor}</p>
            </section>
          )}

          {pricingPackages.length > 0 && (
            <section aria-labelledby="service-pricing">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">Packages &amp; pricing</p>
              <h2 id="service-pricing" className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                Choose a starting point
              </h2>
              <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-ink/65">
                We confirm the exact scope and price in writing before work begins.
                {offerActive ? " The current offer is reflected in the prices below." : ""}
              </p>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {pricingPackages.map((item, index) => {
                  const quote = item.price === null ? null : quotePrice(item.price, appliedOffer);
                  return (
                    <article key={`${item.name}-${index}`} className={`relative flex flex-col rounded-2xl border bg-snow p-6 ${item.featured ? "border-ember ring-1 ring-ember" : "border-border"}`}>
                      {item.featured && <span className="absolute -top-3 left-5 rounded-full bg-ember px-3 py-1 font-body text-xs font-bold text-white">Popular</span>}
                      <h3 className="font-display text-xl text-ink">{item.name}</h3>
                      {item.description && <p className="mt-2 min-h-10 font-body text-sm leading-relaxed text-ink/65">{item.description}</p>}
                      <div className="mt-5">
                        {quote ? (
                          <>
                            {quote.savings > 0 && <p className="font-body text-sm text-ink/45 line-through">{formatKes(quote.original)}</p>}
                            <p className="font-display text-3xl text-ink">{formatKes(quote.discounted)}</p>
                            {item.price_label && <p className="mt-1 font-body text-sm text-ink/55">{item.price_label}</p>}
                          </>
                        ) : (
                          <p className="font-display text-2xl text-ink">{item.price_label || "Quotation based"}</p>
                        )}
                      </div>
                      {item.includes.length > 0 && (
                        <div className="mt-5">
                          <p className="font-body text-xs font-bold uppercase tracking-wider text-ink/60">Includes</p>
                          <ul className="mt-2 space-y-2">
                            {item.includes.map((feature, featureIndex) => (
                              <li key={`${feature}-${featureIndex}`} className="flex gap-2 font-body text-sm text-ink/80">
                                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-ember" aria-hidden="true" />{feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {item.excludes.length > 0 && (
                        <div className="mt-4">
                          <p className="font-body text-xs font-bold uppercase tracking-wider text-ink/60">Not included</p>
                          <ul className="mt-2 space-y-2">
                            {item.excludes.map((feature, featureIndex) => (
                              <li key={`${feature}-${featureIndex}`} className="font-body text-sm text-ink/60">{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <Link to={contactHref} className="mt-auto inline-flex min-h-11 items-center justify-center rounded-xl bg-forest px-4 py-2.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-ember">
                        Request this package
                      </Link>
                    </article>
                  );
                })}
              </div>

              {pricingAddons.length > 0 && (
                <div className="mt-10 rounded-2xl border border-border bg-snow p-5 sm:p-8">
                  <h3 className="font-display text-xl text-ink sm:text-2xl">Price estimator</h3>
                  <p className="mt-2 font-body text-sm text-ink/65">Choose a package and add any extras to see an indicative estimate.</p>
                  <div className="mt-6">
                    <p className="font-body text-sm font-bold text-ink">1. Choose a starting point</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {pricingPackages.map((item, index) => (
                        <button
                          key={`estimate-${item.name}-${index}`}
                          type="button"
                          aria-pressed={selectedPackageIndex === index}
                          onClick={() => setSelectedPackageIndex(index)}
                          className={`rounded-xl border p-4 text-left transition-colors ${selectedPackageIndex === index ? "border-forest bg-forest/5 ring-1 ring-forest" : "border-border hover:border-forest/50"}`}
                        >
                          <span className="block font-body text-sm font-semibold text-ink">{item.name}</span>
                          <span className="mt-1 block font-body text-sm text-ink/65">{item.price === null ? "Quotation based" : formatKes(quotePrice(item.price, appliedOffer).discounted)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="font-body text-sm font-bold text-ink">2. Add optional extras</p>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                      {pricingAddons.map((addon, index) => {
                        const checked = selectedAddonIndexes.includes(index);
                        const addonQuote = quotePrice(addon.price, appliedOffer);
                        return (
                          <li key={`${addon.name}-${index}`}>
                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => setSelectedAddonIndexes((current) => checked ? current.filter((value) => value !== index) : [...current, index])}
                                className="mt-1 h-4 w-4 accent-forest"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block font-body text-sm font-semibold text-ink">{addon.name}</span>
                                {addon.description && <span className="mt-1 block font-body text-xs text-ink/60">{addon.description}</span>}
                              </span>
                              <span className="shrink-0 font-body text-sm font-semibold text-ink">
                                {addonQuote.savings > 0 && <span className="mr-1 text-xs text-ink/45 line-through">{formatKes(addon.price)}</span>}
                                {formatKes(addonQuote.discounted)}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink/55">Indicative estimate</p>
                      {estimate ? (
                        <>
                          {estimate.savings > 0 && <p className="mt-1 font-body text-sm text-ink/45 line-through">{formatKes(estimate.original)}</p>}
                          <p className="font-display text-2xl text-ink">{formatKes(estimate.discounted)}</p>
                        </>
                      ) : (
                        <p className="mt-1 font-display text-xl text-ink">Quotation required</p>
                      )}
                      <p className="mt-1 max-w-lg font-body text-xs leading-relaxed text-ink/55">
                        Estimate only. Final pricing depends on agreed scope, content and timelines.
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/254727492545?text=${encodeURIComponent(`Hi, please quote my ${service.name} project${estimate ? ` (indicative estimate ${formatKes(estimate.discounted)})` : ""}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 font-body text-sm font-bold text-white hover:bg-[#1FB855]"
                    >
                      Send this estimate <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              )}
            </section>
          )}

          {(testimonials.length > 0 || reviewCount > 0) && (
            <section aria-labelledby="service-testimonials">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">Google reviews</p>
              <h2 id="service-testimonials" className="mt-2 font-display text-2xl text-ink sm:text-3xl">What clients say about working with us</h2>
              {Number.isFinite(reviewRating) && reviewRating > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="font-display text-3xl text-ink">{reviewRating.toFixed(1)}</span>
                  <span className="flex items-center gap-0.5" aria-label={`${reviewRating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} size={17} aria-hidden="true" className={index < Math.round(reviewRating) ? "fill-amber-400 text-amber-500" : "text-ink/20"} />
                    ))}
                  </span>
                  <span className="font-body text-sm text-ink/60">{reviewCount} reviews on Google</span>
                </div>
              )}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {testimonials.map((item, index) => (
                  <figure key={`${item.author}-${index}`} className="rounded-2xl border border-border bg-snow p-6">
                    <blockquote className="font-body text-base leading-relaxed text-ink/80">“{item.quote}”</blockquote>
                    <figcaption className="mt-4 font-body text-sm font-semibold text-ink">{item.author}</figcaption>
                  </figure>
                ))}
              </div>
              {googleReviewUrl && (
                <ServiceAction
                  to={googleReviewUrl}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-forest px-5 font-body text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-cream"
                >
                  Worked with us? Leave a Google review
                </ServiceAction>
              )}
            </section>
          )}

          {(portfolioItems.length > 0 || gallery.length > 0) && (
            <section aria-labelledby="service-gallery">
              <h2 id="service-gallery" className="font-display text-2xl text-ink sm:text-3xl">{portfolioHeading}</h2>
              {portfolioIntro && <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-ink/65">{portfolioIntro}</p>}
              {portfolioItems.length > 0 ? (
                <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {portfolioItems.map((item, index) => {
                    const content = (
                      <article className="h-full overflow-hidden rounded-xl border border-border bg-snow transition-shadow hover:shadow-md">
                        {item.image_url ? (
                          <img src={item.image_url} alt={`${item.name} website`} loading="lazy" className="aspect-[16/10] w-full object-cover" />
                        ) : (
                          <div aria-hidden="true" className="flex aspect-[16/10] items-center justify-center bg-forest text-cream">
                            <span className="font-display text-5xl">{item.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-display text-lg text-ink">{item.name}</h3>
                          {item.category && <p className="mt-1 font-body text-sm text-ink/60">{item.category}</p>}
                        </div>
                      </article>
                    );
                    const liveUrl = safePageLink(item.live_url, "");
                    return (
                      <li key={`${item.name}-${index}`}>
                        {/^https?:\/\//i.test(liveUrl)
                          ? <a href={liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${item.name} website`}>{content}</a>
                          : content}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {gallery.map((src, index) => (
                    <li key={`${src}-${index}`} className="overflow-hidden rounded-xl border border-border bg-snow">
                      <img src={src} alt={`${service.name} example ${index + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        {/* ============ PROCESS ============ */}
        {processSteps.length > 0 && (
          <section aria-labelledby="service-process" className="patterned-surface bg-forest py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <h2 id="service-process" className="font-display text-3xl leading-tight text-cream sm:text-5xl">
                {processHeading}
              </h2>
              <p className="mt-4 max-w-xl font-body text-base text-cream/70 sm:text-lg">
                A structured approach to every engagement, from first call to final delivery.
              </p>
              <div className="mt-12 grid grid-cols-1 gap-x-16 md:grid-cols-2">
                {processSteps.map((step, index) => (
                  <ProcessStep
                    key={step.id ?? step.step_number ?? index}
                    number={step.step_number}
                    title={step.title}
                    description={step.description}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <FaqAccordion items={faqs} />

          {related.length > 0 && (
            <section aria-labelledby="service-related">
              <h2 id="service-related" className="font-display text-2xl text-ink sm:text-3xl">
                Related services
              </h2>
              <ul className="mt-6 grid gap-5 md:grid-cols-3">
                {related.map((item) => {
                  const RelatedIcon = resolveIcon(item.icon);
                  return (
                    <li key={item.id}>
                      <Link
                        to={`/what-i-do/${item.id}`}
                        className="group flex h-full flex-col rounded-2xl border border-border bg-snow p-6 transition-colors hover:border-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest text-cream">
                          <RelatedIcon size={20} aria-hidden="true" />
                        </span>
                        <h3 className="mt-4 font-display text-lg text-ink transition-colors group-hover:text-ember">
                          {item.name}
                        </h3>
                        {item.outcome && (
                          <p className="mt-2 line-clamp-2 font-body text-sm text-ink/65">{item.outcome}</p>
                        )}
                        <span className="mt-auto flex items-center gap-1.5 pt-5 font-body text-sm font-semibold text-forest">
                          Learn more
                          <ArrowRight
                            size={16}
                            aria-hidden="true"
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Final CTA */}
          <section
            aria-labelledby="service-cta"
            className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-forest px-6 py-10 text-cream sm:flex-row sm:items-center sm:px-10 sm:py-12"
          >
            <div className="max-w-2xl">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-cream/70">
                Let&rsquo;s work together
              </p>
              <h2 id="service-cta" className="mt-2 font-display text-2xl leading-tight sm:text-3xl">
                Need {service.name}?
              </h2>
              <p className="mt-3 font-body text-sm leading-relaxed text-cream/80">
                Tell me what you want to achieve and I will recommend the right approach, timeline and budget.
              </p>
            </div>
            <Link
              to={contactHref}
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-olive px-6 py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-cream hover:text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              Start a project <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </section>
        </div>
      </main>
    </>
  );
};

export default ServiceDetail;