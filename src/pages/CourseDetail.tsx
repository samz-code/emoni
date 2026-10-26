import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Award, BookOpen, CalendarDays, CheckCircle2, ClipboardCheck,
  Clock, FolderOpen, Gift, LifeBuoy, Loader2, Monitor, Signal, Users, Wrench,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import SEO, { SITE_URL } from "@/components/SEO";
import Breadcrumbs, { breadcrumbSchema, type Crumb } from "@/components/detail/Breadcrumbs";
import FaqAccordion, { faqSchema, type FaqItem } from "@/components/detail/FaqAccordion";
import { asList, formatUsd, resolveIcon, toNumber, truncate } from "@/lib/detail";

interface CourseRow {
  id: string;
  name: string;
  category?: string | null;
  icon?: string | null;
  description?: string | null;
  long_description?: string | null;
  banner_url?: string | null;
  gallery_urls?: unknown;
  audience?: string | null;
  level?: string | null;
  format?: string | null;
  duration?: string | null;
  start_date?: string | null;
  price?: number | string | null;
  status?: string | null;
  highlights?: unknown;
  curriculum?: unknown;
  tools?: unknown;
  requirements?: unknown;
  bonuses?: unknown;
  faqs?: unknown;
  certificate?: boolean | null;
  live_support?: boolean | null;
  project_count?: number | string | null;
}

type CourseTeaser = Pick<
  CourseRow,
  "id" | "name" | "category" | "icon" | "description" | "duration" | "price"
>;

const STATUS: Record<string, { label: string; cta: string; dot: string; availability: string }> = {
  enrolling: {
    label: "Enrolling now",
    cta: "Enroll now",
    dot: "bg-emerald-400",
    availability: "https://schema.org/InStock",
  },
  waitlist: {
    label: "Waitlist open",
    cta: "Join the waitlist",
    dot: "bg-amber-400",
    availability: "https://schema.org/PreOrder",
  },
  update: {
    label: "Opening soon",
    cta: "Notify me",
    dot: "bg-sky-400",
    availability: "https://schema.org/PreOrder",
  },
};

const toParagraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

const readModules = (value: unknown): { title: string; description: string }[] =>
  Array.isArray(value)
    ? value
        .map((m: any) => ({
          title: String(m?.title ?? "").trim(),
          description: String(m?.description ?? "").trim(),
        }))
        .filter((m) => m.title)
    : [];

const readFaqs = (value: unknown): FaqItem[] =>
  Array.isArray(value)
    ? (value
        .map((f: any) => ({
          question: String(f?.question ?? "").trim(),
          answer: String(f?.answer ?? "").trim(),
        }))
        .filter((f) => f.question && f.answer) as FaqItem[])
    : [];

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course-detail", id],
    enabled: Boolean(id),
    staleTime: 60_000,
    retry: 1,
    queryFn: async (): Promise<CourseRow | null> => {
      const { data, error: fetchError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id as string)
        .eq("published", true)
        .maybeSingle();
      if (fetchError) throw fetchError;
      return (data as CourseRow | null) ?? null;
    },
  });

  const { data: related = [] } = useQuery({
    queryKey: ["course-related", id, course?.category],
    enabled: Boolean(course),
    staleTime: 60_000,
    queryFn: async (): Promise<CourseTeaser[]> => {
      const { data, error: fetchError } = await supabase
        .from("courses")
        .select("id,name,category,icon,description,duration,price")
        .eq("published", true)
        .neq("id", id as string)
        .order("sort_order", { ascending: true })
        .limit(12);
      if (fetchError) throw fetchError;
      const rows = (data ?? []) as CourseTeaser[];
      const same = rows.filter((row) => row.category === course?.category);
      const others = rows.filter((row) => row.category !== course?.category);
      return [...same, ...others].slice(0, 3);
    },
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-paper py-32">
        <Loader2 size={36} className="mb-4 animate-spin text-ember" aria-hidden="true" />
        <p className="font-body text-sm text-ink/60">Loading course…</p>
      </main>
    );
  }

  if (error || !course) {
    return (
      <>
        <SEO
          title="Course not found | Samuel A. Emoni"
          description="This course could not be found."
          noindex
        />
        <main className="min-h-[70vh] bg-paper px-4 py-24 text-center">
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Course not found</h1>
          <p className="mx-auto mt-3 max-w-md font-body text-ink/65">
            {error
              ? "The course could not be loaded. Please try again later."
              : "This course is unavailable or has not been published yet."}
          </p>
          <Link
            to="/courses"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-forest px-5 font-body text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-cream"
          >
            Browse all courses
          </Link>
        </main>
      </>
    );
  }

  // ---- Derived content (all editable from the admin panel) ----
  const status = STATUS[course.status || "enrolling"] ?? STATUS.enrolling;
  const Icon = resolveIcon(course.icon);
  const highlights = asList(course.highlights);
  const tools = asList(course.tools);
  const requirements = asList(course.requirements);
  const bonuses = asList(course.bonuses);
  const gallery = asList(course.gallery_urls);
  const modules = readModules(course.curriculum);
  const customFaqs = readFaqs(course.faqs);
  const priceNumber = toNumber(course.price);
  const priceLabel = formatUsd(course.price);
  const projectCount = toNumber(course.project_count);
  const description = (course.description || "").trim();
  const longDescription = (course.long_description || "").trim();
  const longParagraphs = toParagraphs(longDescription);
  const banner = (course.banner_url || "").trim();
  const path = `/courses/${course.id}`;
  const url = `${SITE_URL}${path}`;
  const contactHref = `/contact?course=${encodeURIComponent(course.id)}`;

  const facts = [
    course.duration && { icon: Clock, label: "Duration", value: course.duration },
    course.level && { icon: Signal, label: "Level", value: course.level },
    course.format && { icon: Monitor, label: "Format", value: course.format },
    course.start_date && { icon: CalendarDays, label: "Next start", value: course.start_date },
    course.audience && { icon: Users, label: "Who it's for", value: course.audience },
    projectCount > 0 && {
      icon: FolderOpen,
      label: "Practice",
      value: `${projectCount} hands-on project${projectCount === 1 ? "" : "s"}`,
    },
    course.certificate && { icon: Award, label: "Credential", value: "Certificate of completion" },
    course.live_support && { icon: LifeBuoy, label: "Support", value: "Live support & cohort sessions" },
  ].filter(Boolean) as { icon: typeof Clock; label: string; value: string }[];

  const crumbs: Crumb[] = [
    { label: "Home", to: "/" },
    { label: "Courses", to: "/courses" },
    { label: course.name },
  ];

  const generatedFaqs: FaqItem[] = [
    (description || longDescription) && {
      question: `What will I learn in ${course.name}?`,
      answer: highlights.length
        ? `${description || truncate(longDescription, 300)}\n\nYou get: ${highlights.join("; ")}.`
        : description || truncate(longDescription, 300),
    },
    course.duration && {
      question: `How long is ${course.name}?`,
      answer: `${course.name} runs for ${course.duration}.`,
    },
    course.audience && {
      question: `Who is ${course.name} for?`,
      answer: course.audience,
    },
    requirements.length > 0 && {
      question: `What do I need to take ${course.name}?`,
      answer: `You need:\n${requirements.map((r) => `• ${r}`).join("\n")}`,
    },
    {
      question: `How much does ${course.name} cost?`,
      answer: priceNumber > 0
        ? `${course.name} costs ${priceLabel} (USD). Contact Samuel Emoni to confirm current intake dates and payment options.`
        : "Pricing is shared on request. Contact Samuel Emoni for current rates and intake dates.",
    },
    tools.length > 0 && {
      question: `Which tools are used in ${course.name}?`,
      answer: `You will work with ${tools.join(", ")}.`,
    },
    {
      question: `Do I get a certificate or live support?`,
      answer: [
        course.certificate
          ? "Yes, you receive a certificate on completion."
          : "A certificate is not included with this course.",
        course.live_support
          ? "Live support and cohort sessions are included."
          : "Live sessions are not included; learning is self-directed with course materials.",
      ].join(" "),
    },
  ].filter(Boolean) as FaqItem[];

  // Custom FAQs from the admin come first; skip generated ones with the same question.
  const customQuestions = new Set(customFaqs.map((f) => f.question.toLowerCase()));
  const faqs: FaqItem[] = [
    ...customFaqs,
    ...generatedFaqs.filter((f) => !customQuestions.has(f.question.toLowerCase())),
  ];

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${url}#course`,
    name: course.name,
    description: truncate(longDescription || description, 300) || course.name,
    url,
    image: banner || undefined,
    inLanguage: "en",
    educationalLevel: course.level || course.audience || undefined,
    teaches: highlights.length ? highlights : undefined,
    provider: {
      "@type": "Organization",
      name: "Emoni Digital Solutions",
      url: SITE_URL,
    },
    instructor: { "@type": "Person", name: "Samuel A. Emoni", url: SITE_URL },
    offers:
      priceNumber > 0
        ? {
            "@type": "Offer",
            price: priceNumber,
            priceCurrency: "USD",
            availability: status.availability,
            url,
            category: "Paid",
          }
        : undefined,
  };

  return (
    <>
      <SEO
        title={`${course.name} | Course by Samuel A. Emoni`}
        description={
          truncate(description || longDescription, 155) ||
          `Learn ${course.name} with practical, project-based training from Samuel A. Emoni.`
        }
        canonical={path}
        type="website"
        keywords={[course.name, course.category, "course Kenya", "online course Africa"]
          .filter(Boolean)
          .join(", ")}
        schema={[courseSchema, breadcrumbSchema(crumbs, path), ...(faqs.length ? [faqSchema(faqs)] : [])]}
      />

      <main className="bg-paper">
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden bg-forest text-cream">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-ember/20 blur-3xl"
          />
          <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pb-20 lg:px-8">
            <Breadcrumbs items={crumbs} dark />

            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-14">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="min-w-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {course.category && (
                    <span className="rounded bg-ember px-2.5 py-1 font-body text-xs font-semibold text-cream">
                      {course.category}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded bg-cream/10 px-2.5 py-1 font-body text-xs text-cream">
                    <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden="true" />
                    {status.label}
                  </span>
                </div>

                <h1 className="mt-5 break-words font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                  {course.name}
                </h1>

                {description && (
                  <p className="mt-6 max-w-2xl whitespace-pre-line break-words font-body text-base leading-relaxed text-cream/80 sm:text-lg">
                    {description}
                  </p>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={contactHref}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-olive px-6 py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                  >
                    {status.cta} <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-cream/40 px-6 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-cream/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                  >
                    Ask a question
                  </Link>
                </div>
              </motion.div>

              {/* At a glance */}
              <motion.aside
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                aria-label="Course summary"
                className="rounded-2xl border border-cream/15 bg-cream/5 p-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ember text-cream">
                    <Icon size={26} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-body text-xs uppercase tracking-widest text-cream/60">Course fee</p>
                    <p className="font-display text-3xl leading-tight">
                      {priceLabel ?? "On request"}
                    </p>
                  </div>
                </div>

                {facts.length > 0 && (
                  <dl className="mt-6 space-y-4 border-t border-cream/15 pt-6">
                    {facts.map(({ icon: FactIcon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <FactIcon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-olive" />
                        <div className="min-w-0">
                          <dt className="font-body text-xs uppercase tracking-wider text-cream/55">{label}</dt>
                          <dd className="mt-0.5 break-words font-body text-sm font-semibold">{value}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                )}
              </motion.aside>
            </div>
          </div>
        </section>

        {/* ============ BODY ============ */}
        <div className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          {banner && (
            <img
              src={banner}
              alt={course.name}
              loading="lazy"
              className="aspect-[16/9] w-full rounded-2xl border border-border object-cover"
            />
          )}

          {longParagraphs.length > 0 && (
            <section aria-labelledby="course-about">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">About this course</p>
              <h2 id="course-about" className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                What the course covers
              </h2>
              <div className="mt-6 max-w-3xl space-y-5">
                {longParagraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="whitespace-pre-line break-words font-body text-base leading-relaxed text-ink/85"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          {highlights.length > 0 && (
            <section aria-labelledby="course-highlights">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">What you get</p>
              <h2 id="course-highlights" className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                Everything included in this course
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {highlights.map((item, index) => (
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

          {modules.length > 0 && (
            <section aria-labelledby="course-curriculum">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">Curriculum</p>
              <h2 id="course-curriculum" className="mt-2 flex items-center gap-3 font-display text-2xl text-ink sm:text-3xl">
                <BookOpen size={26} aria-hidden="true" className="text-ember" />
                {modules.length} module{modules.length === 1 ? "" : "s"}, step by step
              </h2>
              <ol className="mt-6 space-y-4">
                {modules.map((module, index) => (
                  <li
                    key={`${module.title}-${index}`}
                    className="flex gap-4 rounded-2xl border border-border bg-snow p-5 sm:p-6"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest font-display text-lg text-cream">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="break-words font-display text-lg text-ink sm:text-xl">{module.title}</h3>
                      {module.description && (
                        <p className="mt-2 whitespace-pre-line break-words font-body text-sm leading-relaxed text-ink/75 sm:text-base">
                          {module.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {(tools.length > 0 || course.audience) && (
            <div className="grid gap-6 md:grid-cols-2">
              {tools.length > 0 && (
                <section aria-labelledby="course-tools" className="rounded-2xl border border-border bg-snow p-6 sm:p-8">
                  <h2 id="course-tools" className="flex items-center gap-2 font-display text-xl text-ink">
                    <Wrench size={20} aria-hidden="true" className="text-ember" /> Tools you will use
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

              {course.audience && (
                <section aria-labelledby="course-audience" className="rounded-2xl border border-border bg-snow p-6 sm:p-8">
                  <h2 id="course-audience" className="flex items-center gap-2 font-display text-xl text-ink">
                    <Users size={20} aria-hidden="true" className="text-ember" /> Who it is for
                  </h2>
                  <p className="mt-5 break-words font-body text-base leading-relaxed text-ink/80">
                    {course.audience}
                  </p>
                </section>
              )}
            </div>
          )}

          {requirements.length > 0 && (
            <section aria-labelledby="course-requirements" className="rounded-2xl border border-border bg-snow p-6 sm:p-8">
              <h2 id="course-requirements" className="flex items-center gap-2 font-display text-xl text-ink">
                <ClipboardCheck size={20} aria-hidden="true" className="text-ember" /> Requirements
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {requirements.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="flex gap-3 font-body text-sm text-ink/85 sm:text-base"
                  >
                    <CheckCircle2 size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-forest" />
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {gallery.length > 0 && (
            <section aria-labelledby="course-gallery">
              <h2 id="course-gallery" className="font-display text-2xl text-ink sm:text-3xl">
                Course gallery
              </h2>
              <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {gallery.map((src, index) => (
                  <li key={`${src}-${index}`} className="overflow-hidden rounded-xl border border-border bg-snow">
                    <img
                      src={src}
                      alt={`${course.name} preview ${index + 1}`}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {bonuses.length > 0 && (
            <section aria-labelledby="course-bonuses" className="rounded-2xl bg-forest p-6 text-cream sm:p-10">
              <h2 id="course-bonuses" className="flex items-center gap-3 font-display text-2xl sm:text-3xl">
                <Gift size={26} aria-hidden="true" className="text-olive" /> Bonuses included
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {bonuses.map((bonus, index) => (
                  <li
                    key={`${bonus}-${index}`}
                    className="flex gap-3 rounded-xl border border-cream/15 bg-cream/5 p-4 font-body text-sm sm:text-base"
                  >
                    <CheckCircle2 size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-olive" />
                    <span className="min-w-0 break-words">{bonus}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <FaqAccordion items={faqs} />

          {related.length > 0 && (
            <section aria-labelledby="course-related">
              <h2 id="course-related" className="font-display text-2xl text-ink sm:text-3xl">
                More courses you may like
              </h2>
              <ul className="mt-6 grid gap-5 md:grid-cols-3">
                {related.map((item) => {
                  const RelatedIcon = resolveIcon(item.icon);
                  const relatedPrice = formatUsd(item.price);
                  return (
                    <li key={item.id}>
                      <Link
                        to={`/courses/${item.id}`}
                        className="group flex h-full flex-col rounded-2xl border border-border bg-snow p-6 transition-colors hover:border-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest text-cream">
                          <RelatedIcon size={20} aria-hidden="true" />
                        </span>
                        {item.category && (
                          <span className="mt-4 font-body text-xs font-semibold uppercase tracking-wider text-ember">
                            {item.category}
                          </span>
                        )}
                        <h3 className="mt-1 font-display text-lg text-ink transition-colors group-hover:text-ember">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="mt-2 line-clamp-3 font-body text-sm text-ink/65">{item.description}</p>
                        )}
                        <span className="mt-auto flex items-center justify-between pt-5 font-body text-sm">
                          <span className="text-ink/55">
                            {[item.duration, relatedPrice].filter(Boolean).join(" · ")}
                          </span>
                          <ArrowRight
                            size={16}
                            aria-hidden="true"
                            className="text-forest transition-transform group-hover:translate-x-1"
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
            aria-labelledby="course-cta"
            className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-forest px-6 py-10 text-cream sm:flex-row sm:items-center sm:px-10 sm:py-12"
          >
            <div className="max-w-2xl">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-cream/70">
                Ready when you are
              </p>
              <h2 id="course-cta" className="mt-2 font-display text-2xl leading-tight sm:text-3xl">
                Start learning {course.name}
              </h2>
              <p className="mt-3 font-body text-sm leading-relaxed text-cream/80">
                Questions about intake dates, payment or fit? Send a message and I will reply personally.
              </p>
            </div>
            <Link
              to={contactHref}
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-olive px-6 py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-cream hover:text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              {status.cta} <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </section>
        </div>
      </main>
    </>
  );
};

export default CourseDetail;