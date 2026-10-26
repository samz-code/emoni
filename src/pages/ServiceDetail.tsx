import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowRight, ArrowUpRight, CheckCircle2, Loader2,
  Target, Users, Wand2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import SEO, { SITE_URL } from "@/components/SEO";
import ProcessStep from "@/components/ProcessStep";
import Breadcrumbs, { breadcrumbSchema, type Crumb } from "@/components/detail/Breadcrumbs";
import FaqAccordion, { faqSchema, type FaqItem } from "@/components/detail/FaqAccordion";
import { asList, resolveIcon, truncate } from "@/lib/detail";

interface ServiceRow {
  id: string;
  name: string;
  category?: string | null;
  icon?: string | null;
  problem?: string | null;
  solution?: string | null;
  outcome?: string | null;
  deliverables?: unknown;
  ideal_for?: string | null;
}

type ServiceTeaser = Pick<ServiceRow, "id" | "name" | "category" | "icon" | "outcome">;

interface ProcessStepRow {
  id?: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  step_number?: any;
  title: string;
  description: string;
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();

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
  const problem = (service.problem || "").trim();
  const solution = (service.solution || "").trim();
  const outcome = (service.outcome || "").trim();
  const idealFor = (service.ideal_for || "").trim();
  const path = `/what-i-do/${service.id}`;
  const url = `${SITE_URL}${path}`;
  const contactHref = `/contact?service=${encodeURIComponent(service.id)}`;
  const label = categoryLabel || service.category || "";

  const crumbs: Crumb[] = [
    { label: "Home", to: "/" },
    { label: "What I Do", to: "/what-i-do" },
    { label: service.name },
  ];

  const faqs: FaqItem[] = [
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

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: service.name,
    description: truncate(solution || problem || outcome, 300) || service.name,
    serviceType: label || service.name,
    url,
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
          truncate(solution || problem || outcome, 155) ||
          `${service.name} by Samuel A. Emoni, serving businesses across Kenya and Africa.`
        }
        canonical={path}
        keywords={[service.name, label, "Kenya", "Nairobi", "Africa"].filter(Boolean).join(", ")}
        schema={[serviceSchema, breadcrumbSchema(crumbs, path), ...(faqs.length ? [faqSchema(faqs)] : [])]}
      />

      <main className="bg-paper">
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden bg-forest text-cream">
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
                  {service.name}
                </h1>

                {problem && (
                  <p className="mt-6 max-w-2xl whitespace-pre-line break-words font-body text-base leading-relaxed text-cream/80 sm:text-lg">
                    {truncate(problem, 220)}
                  </p>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={contactHref}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-olive px-6 py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                  >
                    Start this project <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                  <Link
                    to="/projects"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-cream/40 px-6 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-cream/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                  >
                    See my work
                  </Link>
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

        {/* ============ BODY ============ */}
        <div className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
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
        </div>

        {/* ============ PROCESS ============ */}
        {steps.length > 0 && (
          <section aria-labelledby="service-process" className="bg-forest py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <h2 id="service-process" className="font-display text-3xl leading-tight text-cream sm:text-5xl">
                How we will work together
              </h2>
              <p className="mt-4 max-w-xl font-body text-base text-cream/70 sm:text-lg">
                A structured approach to every engagement, from first call to final delivery.
              </p>
              <div className="mt-12 grid grid-cols-1 gap-x-16 md:grid-cols-2">
                {steps.map((step, index) => (
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