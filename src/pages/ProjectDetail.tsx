import { Fragment, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ImageOff,
  Images,
  Layers,
  Link2,
  Maximize2,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import SEO, { SITE_URL } from "@/components/SEO";
import ProjectCard from "@/components/ProjectCard";

type ProjectKind = "web" | "design";

type CaseStudy = {
  title: string;
  category: string;
  description: string;
  fullDescription: string;
  categories: string[];
  image: string | null;
  images: string[];
  liveUrl: string | null;
};

type DescriptionBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; label?: string; text: string }
  | { type: "list"; items: string[] };

const isProjectKind = (kind: string | undefined): kind is ProjectKind =>
  kind === "web" || kind === "design";

const safeExternalUrl = (value: string | null) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
};

const URL_PATTERN = /(https?:\/\/[^\s<>"]+)/g;
const OWN_HOSTS = ["emonisamuel.co.ke", "www.emonisamuel.co.ke"];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember";

const linkClass = `break-words font-semibold text-forest underline decoration-ember/60 underline-offset-2 transition-colors hover:text-ember ${focusRing}`;

/** Turns any http(s) URLs inside plain text into clickable links. */
const renderLinkedText = (text: string): ReactNode[] =>
  text.split(URL_PATTERN).map((part, index) => {
    if (index % 2 === 0) return <Fragment key={index}>{part}</Fragment>;

    // Keep trailing punctuation like "." or ")" outside the link
    const match = part.match(/^(.*?)([.,;:!?)]*)$/);
    const rawUrl = match ? match[1] : part;
    const trailing = match ? match[2] : "";
    const href = safeExternalUrl(rawUrl);
    if (!href) return <Fragment key={index}>{part}</Fragment>;

    const url = new URL(href);
    const isOwnSite = OWN_HOSTS.includes(url.hostname);

    return (
      <Fragment key={index}>
        {isOwnSite ? (
          // Internal link: client-side navigation, same tab
          <Link to={`${url.pathname}${url.search}${url.hash}`} className={linkClass}>
            {rawUrl}
          </Link>
        ) : (
          <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {rawUrl}
          </a>
        )}
        {trailing}
      </Fragment>
    );
  });

/** "Home: https://..." → bold "Home:" label + clickable link */
const renderListItem = (item: string): ReactNode => {
  const match = item.match(/^([^:/]{1,40}):\s+(https?:\/\/.+)$/);
  if (!match) return renderLinkedText(item);
  return (
    <>
      <strong className="font-bold text-ink">{match[1]}:</strong> {renderLinkedText(match[2])}
    </>
  );
};

const BULLET = /^[-*•]\s+/;

/**
 * Turns the plain-text full description into structured blocks:
 *  - a short single line with no ending punctuation becomes a heading
 *  - a short title line followed by content becomes heading + content
 *  - "Label. Sentence..." becomes a paragraph with a bold label
 *  - lines starting with "-", "*" or "•" become a bullet list
 */
const parseDescription = (text: string): DescriptionBlock[] => {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap((block): DescriptionBlock[] => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);

      const toBody = (body: string[]): DescriptionBlock =>
        body.every((line) => BULLET.test(line))
          ? { type: "list", items: body.map((line) => line.replace(BULLET, "")) }
          : { type: "paragraph", text: body.join("\n") };

      // Pure bullet list
      if (lines.length > 0 && lines.every((line) => BULLET.test(line))) {
        return [toBody(lines)];
      }

      // Single short line → heading
      if (lines.length === 1 && block.length <= 60 && !/[.!?:,;]$/.test(block)) {
        return [{ type: "heading", text: block }];
      }

      // Short title line followed by content (e.g. "Explore the Website" + bullets)
      const [first, ...rest] = lines;
      if (
        rest.length > 0 &&
        first.length <= 60 &&
        !/[.!:,;]$/.test(first) &&
        !/https?:\/\//.test(first)
      ) {
        return [{ type: "heading", text: first }, toBody(rest)];
      }

      const labelMatch = block.match(/^([A-Z][A-Za-z0-9&,'’/ -]{1,58})\.\s+([\s\S]+)$/);
      if (labelMatch && labelMatch[1].trim().split(/\s+/).length <= 7) {
        return [{ type: "paragraph", label: labelMatch[1].trim(), text: labelMatch[2].trim() }];
      }

      return [{ type: "paragraph", text: block }];
    });
};

const fetchCaseStudy = async (kind: ProjectKind, id: string): Promise<CaseStudy> => {
  const table = kind === "web" ? "projects" : "graphic_designs";
  const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("This project could not be found.");

  const record = data as Record<string, unknown>;
  const image = typeof record.image === "string" ? record.image : null;
  const images = Array.isArray(record.images)
    ? record.images.filter((item): item is string => typeof item === "string" && Boolean(item))
    : [];

  return {
    title: String(record.name || record.title || "Untitled project"),
    category: String(record.sector || record.category || "Project"),
    description: typeof record.description === "string" ? record.description : "",
    fullDescription: typeof record.full_description === "string" ? record.full_description : "",
    categories: Array.isArray(record.categories)
      ? record.categories.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      : [],
    image,
    images: Array.from(new Set([...(image ? [image] : []), ...images])),
    liveUrl: typeof record.live_url === "string" ? record.live_url : null,
  };
};

/** Related projects: same sector first, then fill with the latest. Mapped to the ProjectCard shape. */
const fetchRelated = async (kind: ProjectKind, id: string, sector: string) => {
  const table = kind === "web" ? "projects" : "graphic_designs";
  const sectorColumn = kind === "web" ? "sector" : "category";
  const columns =
    kind === "web"
      ? "id,name,description,sector,categories,image,live_url,created_at"
      : "id,title,category,description,categories,image,created_at";

  const { data: sameSector, error } = await supabase
    .from(table)
    .select(columns)
    .neq("id", id)
    .eq(sectorColumn, sector)
    .order("created_at", { ascending: false })
    .limit(3);
  if (error) throw error;

  let rows: any[] = sameSector || [];
  if (rows.length < 3) {
    const { data: latest, error: latestError } = await supabase
      .from(table)
      .select(columns)
      .neq("id", id)
      .order("created_at", { ascending: false })
      .limit(6);
    if (latestError) throw latestError;
    const seen = new Set(rows.map((row) => row.id));
    rows = [...rows, ...(latest || []).filter((row: any) => !seen.has(row.id))].slice(0, 3);
  }

  return rows.map((row: any) =>
    kind === "web"
      ? {
          id: row.id,
          name: row.name,
          description: row.description || "",
          sector: row.sector,
          categories: Array.isArray(row.categories) ? row.categories : [],
          image: row.image,
          liveUrl: row.live_url,
          landscapePreview: true,
          detailUrl: `/projects/web/${row.id}`,
        }
      : {
          id: row.id,
          name: row.title,
          description: row.description || row.category,
          sector: row.category,
          categories: Array.isArray(row.categories) ? row.categories : [],
          image: row.image,
          images: [],
          squarePreview: /logo/i.test(row.category || ""),
          detailUrl: `/projects/design/${row.id}`,
        },
  );
};

/** Fades and lifts content in as it scrolls into view. */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 px-4 py-3 sm:px-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ember/10 text-ember">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/50">
          {label}
        </span>
        <span className="block truncate font-body text-sm font-semibold text-ink">{value}</span>
      </span>
    </div>
  );
}

export default function ProjectDetail() {
  const { kind, id } = useParams();
  const projectKind = isProjectKind(kind) ? kind : null;

  const [lightbox, setLightbox] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project-case-study", kind, id],
    queryFn: () => {
      if (!projectKind || !id) throw new Error("This project link is not valid.");
      return fetchCaseStudy(projectKind, id);
    },
    enabled: Boolean(projectKind && id),
    staleTime: 60_000,
    retry: 1,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["project-related", kind, id, project?.category],
    queryFn: () => fetchRelated(projectKind as ProjectKind, id as string, project?.category || ""),
    enabled: Boolean(projectKind && id && project),
    staleTime: 60_000,
    retry: 1,
  });

  const imageCount = project?.images.length ?? 0;
  const lightboxOpen = lightbox !== null;

  // Lightbox: keyboard navigation + scroll lock.
  useEffect(() => {
    if (!lightboxOpen || imageCount === 0) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowRight") setLightbox((i) => (i === null ? i : (i + 1) % imageCount));
      if (event.key === "ArrowLeft") setLightbox((i) => (i === null ? i : (i - 1 + imageCount) % imageCount));
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, imageCount]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (copyError) {
      console.warn("Copy link failed:", copyError instanceof Error ? copyError.message : copyError);
    }
  };

  if (!projectKind || !id) {
    return (
      <main className="min-h-[60vh] bg-paper px-4 py-20 text-center">
        <p className="font-body text-ink">This project link is not valid.</p>
        <Link to="/projects" className="mt-4 inline-flex min-h-11 items-center text-forest underline">Back to projects</Link>
      </main>
    );
  }

  const pageTitle = project ? `${project.title} | Samuel A. Emoni` : "Project Details | Samuel A. Emoni";
  const pageDescription = project?.description || project?.fullDescription.slice(0, 155) || "Project case study and portfolio gallery.";
  const liveUrl = safeExternalUrl(project?.liveUrl ?? null);
  const liveHost = liveUrl ? new URL(liveUrl).hostname.replace(/^www\./, "") : null;
  const projectSchema = project
    ? {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        description: pageDescription,
        genre: project.category,
        url: `${SITE_URL}/projects/${projectKind}/${id}`,
        image: project.images.slice(0, 6),
        author: { "@type": "Person", name: "Samuel A. Emoni", url: SITE_URL },
      }
    : undefined;
  const blocks = parseDescription(project?.fullDescription || project?.description || "");
  const allCategories = project
    ? Array.from(new Set([project.category, ...project.categories].filter(Boolean)))
    : [];
  const categoryLink = (category: string) =>
    `/projects?tab=${projectKind === "web" ? "projects" : "design"}&category=${encodeURIComponent(category)}`;

  // Same frame logic as ProjectCard: web = 16:9 cover, logos = square contained, other design = portrait cover.
  const isLogo = projectKind === "design" && /logo/i.test(project?.category || "");
  const galleryFrame =
    projectKind === "web" ? "aspect-video" : isLogo ? "aspect-square" : "aspect-[736/900]";

  // Laptop/desktop (lg+) only: smaller gallery tiles via more columns.
  const galleryColumns =
    projectKind === "web" ? "lg:grid-cols-3" : "lg:grid-cols-4";

  const readMinutes = Math.max(
    1,
    Math.round((project?.fullDescription || project?.description || "").split(/\s+/).filter(Boolean).length / 200),
  );

  const heroImage = project?.images[0] ?? null;
  let headingCounter = 0;

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical={`/projects/${projectKind}/${id}`}
        image={project?.image ?? undefined}
        type="article"
        noindex={Boolean(error)}
        schema={projectSchema}
      />

      {/* Scroll progress */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-ember"
        style={{ scaleX: progress }}
      />

      <main className="relative min-h-screen overflow-x-clip bg-paper py-10 sm:py-14">
        {/* Decorative background glows */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-ember/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-[38rem] h-96 w-96 rounded-full bg-olive/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/projects"
            className={`group inline-flex min-h-11 items-center gap-2 rounded-xl border border-forest bg-forest px-5 py-2 font-body text-sm font-semibold text-cream transition-colors hover:bg-olive hover:text-ink ${focusRing}`}
          >
            <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" /> Back to projects
          </Link>

          {isLoading ? (
            <div className="py-24 text-center" role="status">
              <div className="mx-auto h-1 w-40 overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full w-1/3 rounded-full bg-ember"
                  animate={{ x: ["-100%", "300%"] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <p className="mt-4 font-body text-sm text-ink/60">Loading project details…</p>
            </div>
          ) : error || !project ? (
            <section className="py-24 text-center" role="alert">
              <h1 className="font-display text-3xl text-ink">Project details unavailable</h1>
              <p className="mt-3 font-body text-sm text-ink/65">
                {error instanceof Error ? error.message : "This project could not be loaded."}
              </p>
              <Link to="/projects" className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-forest px-4 text-sm text-forest">
                Return to portfolio
              </Link>
            </section>
          ) : (
            <article className="mt-8">
              {/* HERO */}
              <header>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-4xl"
                >
                  <p className="inline-flex items-center gap-2 rounded-full border border-ember/30 bg-ember/10 px-3 py-1 font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">
                    <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />
                    {project.category}
                  </p>
                  <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink sm:text-6xl">{project.title}</h1>
                  {project.description && (
                    <p className="mt-5 max-w-3xl font-body text-lg leading-relaxed text-ink/80 sm:text-xl">
                      {project.description}
                    </p>
                  )}

                  {/* Categories + live link on small screens (sidebar holds them on desktop) */}
                  <div className="lg:hidden">
                    {allCategories.length > 0 && (
                      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Project categories">
                        {allCategories.map((category) => (
                          <li key={category}>
                            <Link
                              to={categoryLink(category)}
                              className={`inline-flex min-h-10 items-center rounded-full border border-border bg-snow px-3.5 py-2 font-body text-xs font-medium text-ink transition-colors hover:border-ember hover:text-ember ${focusRing}`}
                            >
                              {category}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    {liveUrl && (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest px-4 py-2 font-body text-sm font-semibold text-cream hover:bg-forest/90 ${focusRing}`}
                      >
                        Visit live project <ArrowUpRight size={15} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </motion.div>

                {/* Hero media */}
                {heroImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 32, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="mt-10"
                  >
                    {projectKind === "web" ? (
                      // Browser-window mockup (capped + centered on laptop/desktop)
                      <div className="overflow-hidden rounded-2xl border border-border bg-snow shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] lg:mx-auto lg:max-w-3xl">
                        <div className="flex items-center gap-3 border-b border-border bg-paper px-4 py-3">
                          <span className="flex gap-1.5" aria-hidden="true">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                          </span>
                          <span className="min-w-0 flex-1 truncate rounded-full border border-border bg-snow px-4 py-1 text-center font-body text-xs text-ink/55">
                            {liveHost || "project preview"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLightbox(0)}
                          aria-label="Open project preview full size"
                          className={`group relative block aspect-video w-full overflow-hidden bg-[#eee9df] ${focusRing}`}
                        >
                          <img
                            src={heroImage}
                            alt={`${project.title} preview`}
                            loading="eager"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 font-body text-xs font-medium text-cream opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                            <Maximize2 size={13} aria-hidden="true" /> View full size
                          </span>
                        </button>
                      </div>
                    ) : (
                      // Framed design piece with offset accent block
                      <div className="relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-sm">
                        <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-ember/20 sm:translate-x-5 sm:translate-y-5" />
                        <div aria-hidden="true" className="absolute inset-0 -translate-x-2 -translate-y-2 rounded-2xl border border-forest/20" />
                        <button
                          type="button"
                          onClick={() => setLightbox(0)}
                          aria-label="Open design full size"
                          className={`group relative block w-full overflow-hidden rounded-2xl border border-border bg-[#eee9df] shadow-xl ${galleryFrame} ${focusRing}`}
                        >
                          <img
                            src={heroImage}
                            alt={`${project.title} design`}
                            loading="eager"
                            decoding="async"
                            className={`absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-[1.03] ${
                              isLogo ? "object-contain p-8" : "object-cover object-top"
                            }`}
                          />
                          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 font-body text-xs font-medium text-cream opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                            <Maximize2 size={13} aria-hidden="true" /> View full size
                          </span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Quick facts */}
                <motion.dl
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-10 grid grid-cols-2 divide-border rounded-2xl border border-border bg-snow sm:grid-cols-4 sm:divide-x [&>div:nth-child(-n+2)]:border-b [&>div:nth-child(-n+2)]:border-border sm:[&>div:nth-child(-n+2)]:border-b-0 [&>div:nth-child(odd)]:border-r [&>div:nth-child(odd)]:border-border sm:[&>div:nth-child(odd)]:border-r-0"
                >
                  <Fact icon={<Layers size={16} aria-hidden="true" />} label="Type" value={projectKind === "web" ? "Web project" : "Graphic design"} />
                  <Fact icon={<ArrowUpRight size={16} aria-hidden="true" />} label="Sector" value={project.category} />
                  <Fact icon={<Images size={16} aria-hidden="true" />} label="Gallery" value={`${project.images.length} ${project.images.length === 1 ? "image" : "images"}`} />
                  <Fact icon={<Clock size={16} aria-hidden="true" />} label="Read time" value={`${readMinutes} min`} />
                </motion.dl>
              </header>

              <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
                {/* Main column */}
                <div className="min-w-0">
                  {blocks.length > 0 && (
                    <section aria-labelledby="project-overview-heading">
                      <Reveal>
                        <h2 id="project-overview-heading" className="border-b border-border pb-3 font-display text-2xl text-ink sm:text-3xl">
                          Project overview
                        </h2>
                      </Reveal>
                      <div className="mt-6 space-y-5 font-body text-base leading-relaxed text-ink/85">
                        {blocks.map((block, index) => {
                          if (block.type === "heading") {
                            headingCounter += 1;
                            const number = String(headingCounter).padStart(2, "0");
                            return (
                              <Reveal key={`h-${index}`}>
                                <h3 className="flex items-center gap-3 pt-6 font-display text-xl font-bold text-ink sm:text-2xl">
                                  <span className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-forest px-2 font-body text-xs font-semibold tracking-wider text-cream">
                                    {number}
                                  </span>
                                  <span className="min-w-0 break-words">{block.text}</span>
                                </h3>
                              </Reveal>
                            );
                          }
                          if (block.type === "list") {
                            return (
                              <Reveal key={`l-${index}`}>
                                <ul className="space-y-2.5">
                                  {block.items.map((item, itemIndex) => (
                                    <li
                                      key={itemIndex}
                                      className="flex gap-3 rounded-xl border border-border/70 bg-snow px-4 py-3"
                                    >
                                      <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ember" />
                                      <span className="min-w-0 break-words">{renderListItem(item)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </Reveal>
                            );
                          }
                          return (
                            <Reveal key={`p-${index}`}>
                              <p className="whitespace-pre-line break-words">
                                {block.label && (
                                  <strong className="font-bold text-ink">{block.label}. </strong>
                                )}
                                {renderLinkedText(block.text)}
                              </p>
                            </Reveal>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Project details">
                  <div className="rounded-2xl border border-border bg-snow p-5 shadow-sm sm:p-6">
                    <h2 className="font-display text-lg font-bold text-ink">Project details</h2>

                    <dl className="mt-4 space-y-4 font-body text-sm">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-ink/55">Sector</dt>
                        <dd className="mt-1 font-semibold text-ink">{project.category}</dd>
                      </div>

                      {liveHost && (
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wider text-ink/55">Live site</dt>
                          <dd className="mt-1 break-all font-semibold text-ink">{liveHost}</dd>
                        </div>
                      )}

                      {allCategories.length > 0 && (
                        <div className="hidden lg:block">
                          <dt className="text-xs font-semibold uppercase tracking-wider text-ink/55">Categories</dt>
                          <dd className="mt-2">
                            <ul className="flex flex-wrap gap-2" aria-label="Project categories">
                              {allCategories.map((category) => (
                                <li key={category}>
                                  <Link
                                    to={categoryLink(category)}
                                    className={`inline-flex min-h-9 items-center rounded-full border border-border bg-paper px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ember hover:text-ember ${focusRing}`}
                                  >
                                    {category}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      )}
                    </dl>

                    {liveUrl && (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-6 hidden min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2 font-body text-sm font-semibold text-cream transition-colors hover:bg-forest/90 lg:inline-flex ${focusRing}`}
                      >
                        Visit live project <ArrowUpRight size={15} aria-hidden="true" />
                      </a>
                    )}

                    <Link
                      to="/contact"
                      className={`mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-forest px-4 py-2 font-body text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-cream ${focusRing}`}
                    >
                      Start a similar project <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => void copyLink()}
                      className={`mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2 font-body text-sm font-medium text-ink/70 transition-colors hover:bg-paper hover:text-ink ${focusRing}`}
                    >
                      {copied ? <Check size={15} className="text-forest" aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
                      <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
                    </button>
                  </div>
                </aside>
              </div>

              {/* GALLERY */}
              <section className="mt-16" aria-labelledby="project-gallery-heading">
                <Reveal>
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">Selected work</p>
                      <h2 id="project-gallery-heading" className="mt-2 font-display text-2xl text-ink sm:text-3xl">Project gallery</h2>
                    </div>
                    <span className="rounded-full border border-border bg-snow px-3 py-1 font-body text-xs text-ink/60">
                      {project.images.length} {project.images.length === 1 ? "image" : "images"}
                    </span>
                  </div>
                </Reveal>

                {project.images.length > 0 ? (
                  <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${galleryColumns}`}>
                    {project.images.map((image, index) => {
                      // Featured wide tile on mobile/tablet only; on lg+ every tile is the same smaller size.
                      const featured = projectKind === "web" && index === 0 && project.images.length > 1;
                      return (
                        <motion.button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setLightbox(index)}
                          aria-label={`Open project image ${index + 1} of ${project.images.length}`}
                          initial={{ opacity: 0, y: 28 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{ duration: 0.5, delay: (index % 2) * 0.08, ease: "easeOut" }}
                          className={`group relative block w-full overflow-hidden rounded-2xl border border-border/80 bg-[#eee9df] text-left transition-colors hover:border-olive ${galleryFrame} ${
                            featured ? "sm:col-span-2 lg:col-span-1" : ""
                          } ${focusRing}`}
                        >
                          <img
                            src={image}
                            alt={`${project.title} project example ${index + 1}`}
                            loading={index === 0 ? "eager" : "lazy"}
                            decoding="async"
                            className={`absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-[1.04] ${
                              isLogo ? "object-contain p-6" : "object-cover object-top"
                            }`}
                          />
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          />
                          <span className="absolute left-3 top-3 rounded-full bg-snow/90 px-2.5 py-1 font-body text-[11px] font-semibold text-ink backdrop-blur">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-snow text-ink opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                            <Maximize2 size={15} aria-hidden="true" />
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border text-ink/45">
                    <ImageOff size={24} strokeWidth={1.5} aria-hidden="true" />
                    <p className="font-body text-sm">No project images have been added yet.</p>
                  </div>
                )}
              </section>

              {/* MORE LIKE THIS */}
              {related.length > 0 && (
                <section className="mt-20" aria-labelledby="related-heading">
                  <Reveal>
                    <div className="mb-6 flex items-end justify-between gap-4">
                      <div>
                        <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">Keep exploring</p>
                        <h2 id="related-heading" className="mt-2 font-display text-2xl text-ink sm:text-3xl">More like this</h2>
                      </div>
                      <Link
                        to={`/projects?tab=${projectKind === "web" ? "projects" : "design"}`}
                        className={`inline-flex min-h-11 items-center gap-1.5 font-body text-sm font-semibold text-forest hover:text-ember ${focusRing}`}
                      >
                        View all <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  </Reveal>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {related.map((item: any, index: number) => (
                      <Reveal key={item.id} delay={index * 0.08}>
                        {projectKind === "design" ? (
                          <div className="mx-auto aspect-[736/900] w-full max-w-[736px] overflow-hidden [&>*]:h-full">
                            <ProjectCard project={item} />
                          </div>
                        ) : (
                          <ProjectCard project={item} />
                        )}
                      </Reveal>
                    ))}
                  </div>
                </section>
              )}

              {/* CTA */}
              <Reveal className="mt-20">
                <section className="patterned-surface relative overflow-hidden rounded-3xl bg-forest px-6 py-12 text-cream sm:px-12 sm:py-14" aria-labelledby="project-cta-heading">
                  <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ember/30 blur-3xl" />
                  <div aria-hidden="true" className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-olive/30 blur-3xl" />
                  <div className="relative mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
                    <div className="max-w-2xl">
                      <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-cream/70">Let’s work together</p>
                      <h2 id="project-cta-heading" className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
                        Have a project like this in mind?
                      </h2>
                      <p className="mt-3 font-body text-sm leading-relaxed text-cream/80 sm:text-base">
                        Tell me what you’re looking to create, and let’s discuss the right solution for your business.
                      </p>
                    </div>
                    <Link
                      to="/contact"
                      className="group inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-olive px-6 py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-cream hover:text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                    >
                      Start a project
                      <ArrowUpRight size={16} className="ml-2 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </div>
                </section>
              </Reveal>
            </article>
          )}
        </div>
      </main>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {project && lightbox !== null && project.images[lightbox] && (
          <motion.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Project image viewer"
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close image viewer"
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-snow/10 text-cream transition-colors hover:bg-snow/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cream"
            >
              <X size={20} aria-hidden="true" />
            </button>

            {project.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setLightbox((lightbox - 1 + project.images.length) % project.images.length);
                  }}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-snow/10 text-cream transition-colors hover:bg-snow/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cream sm:left-6"
                >
                  <ChevronLeft size={22} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setLightbox((lightbox + 1) % project.images.length);
                  }}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-snow/10 text-cream transition-colors hover:bg-snow/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cream sm:right-6"
                >
                  <ChevronRight size={22} aria-hidden="true" />
                </button>
              </>
            )}

            <motion.img
              key={lightbox}
              src={project.images[lightbox]}
              alt={`${project.title} project example ${lightbox + 1}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl lg:max-h-[80vh] lg:max-w-4xl"
              onClick={(event) => event.stopPropagation()}
            />

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-snow/10 px-4 py-2 font-body text-xs text-cream backdrop-blur">
              <span>
                {lightbox + 1} / {project.images.length}
              </span>
              <a
                href={project.images[lightbox]}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-cream"
              >
                Open original <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}