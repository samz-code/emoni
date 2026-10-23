import { Fragment, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowUpRight, ImageOff } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

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

const linkClass =
  "break-words font-semibold text-forest underline decoration-ember/60 underline-offset-2 transition-colors hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember";

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

export default function ProjectDetail() {
  const { kind, id } = useParams();
  const projectKind = isProjectKind(kind) ? kind : null;
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

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {project?.image && <meta property="og:image" content={project.image} />}
      </Helmet>

      <main className="min-h-screen bg-paper py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/projects"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-forest bg-forest px-5 py-2 font-body text-sm font-semibold text-cream transition-colors hover:bg-olive hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to projects
          </Link>

          {isLoading ? (
            <p className="py-24 text-center font-body text-sm text-ink/60">Loading project details…</p>
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
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
                {/* Main column */}
                <div className="min-w-0">
                  <header>
                    <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">{project.category}</p>
                    <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">{project.title}</h1>
                    {project.description && (
                      <p className="mt-5 font-body text-lg leading-relaxed text-ink/80">{project.description}</p>
                    )}

                    {/* Categories + live link on small screens (sidebar holds them on desktop) */}
                    <div className="lg:hidden">
                      {allCategories.length > 0 && (
                        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Project categories">
                          {allCategories.map((category) => (
                            <li key={category}>
                              <Link
                                to={categoryLink(category)}
                                className="inline-flex min-h-10 items-center rounded-xl border border-border bg-snow px-3 py-2 font-body text-xs font-medium text-ink transition-colors hover:border-ember hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
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
                          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest px-4 py-2 font-body text-sm font-semibold text-cream hover:bg-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                        >
                          Visit live project <ArrowUpRight size={15} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </header>

                  {blocks.length > 0 && (
                    <section className="mt-10" aria-labelledby="project-overview-heading">
                      <h2 id="project-overview-heading" className="border-b border-border pb-3 font-display text-2xl text-ink">
                        Project overview
                      </h2>
                      <div className="mt-6 space-y-5 font-body text-base leading-relaxed text-ink/85">
                        {blocks.map((block, index) => {
                          if (block.type === "heading") {
                            return (
                              <h3
                                key={`h-${index}`}
                                className="border-l-4 border-ember pl-3 pt-4 font-display text-xl font-bold text-ink"
                              >
                                {block.text}
                              </h3>
                            );
                          }
                          if (block.type === "list") {
                            return (
                              <ul key={`l-${index}`} className="list-disc space-y-2 pl-6">
                                {block.items.map((item, itemIndex) => (
                                  <li key={itemIndex} className="break-words">{renderListItem(item)}</li>
                                ))}
                              </ul>
                            );
                          }
                          return (
                            <p key={`p-${index}`} className="whitespace-pre-line break-words">
                              {block.label && (
                                <strong className="font-bold text-ink">{block.label}. </strong>
                              )}
                              {renderLinkedText(block.text)}
                            </p>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Project details">
                  <div className="rounded-2xl border border-border bg-snow p-5 sm:p-6">
                    <h2 className="font-display text-lg font-bold text-ink">Project details</h2>

                    <dl className="mt-4 space-y-4 font-body text-sm">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-ink/55">Sector</dt>
                        <dd className="mt-1 font-semibold text-ink">{project.category}</dd>
                      </div>

                      {allCategories.length > 0 && (
                        <div className="hidden lg:block">
                          <dt className="text-xs font-semibold uppercase tracking-wider text-ink/55">Categories</dt>
                          <dd className="mt-2">
                            <ul className="flex flex-wrap gap-2" aria-label="Project categories">
                              {allCategories.map((category) => (
                                <li key={category}>
                                  <Link
                                    to={categoryLink(category)}
                                    className="inline-flex min-h-9 items-center rounded-xl border border-border bg-paper px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ember hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
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
                        className="mt-6 hidden min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2 font-body text-sm font-semibold text-cream transition-colors hover:bg-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember lg:inline-flex"
                      >
                        Visit live project <ArrowUpRight size={15} aria-hidden="true" />
                      </a>
                    )}

                    <Link
                      to="/contact"
                      className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-forest px-4 py-2 font-body text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                    >
                      Start a similar project <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </aside>
              </div>

              <section className="mt-14" aria-labelledby="project-gallery-heading">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">Selected work</p>
                    <h2 id="project-gallery-heading" className="mt-2 font-display text-2xl text-ink">Project gallery</h2>
                  </div>
                  <span className="font-body text-xs text-ink/55">{project.images.length} {project.images.length === 1 ? "image" : "images"}</span>
                </div>
                {project.images.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {project.images.map((image, index) => (
                      <a
                        key={`${image}-${index}`}
                        href={image}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open full-size project image ${index + 1}`}
                        className={`group relative block w-full overflow-hidden rounded-2xl border border-border/80 bg-[#eee9df] transition-colors hover:border-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${galleryFrame}`}
                      >
                        <img
                          src={image}
                          alt={`${project.title} project example ${index + 1}`}
                          loading={index === 0 ? "eager" : "lazy"}
                          decoding="async"
                          className={`absolute inset-0 h-full w-full transition-transform duration-300 group-hover:scale-[1.03] ${
                            isLogo ? "object-contain p-6" : "object-cover object-top"
                          }`}
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border text-ink/45">
                    <ImageOff size={24} strokeWidth={1.5} aria-hidden="true" />
                    <p className="font-body text-sm">No project images have been added yet.</p>
                  </div>
                )}
              </section>

              <section className="mt-16 overflow-hidden rounded-2xl bg-forest px-6 py-10 text-cream sm:px-10 sm:py-12" aria-labelledby="project-cta-heading">
                <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                  <div className="max-w-2xl">
                    <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-cream/70">Let’s work together</p>
                    <h2 id="project-cta-heading" className="mt-2 font-display text-2xl leading-tight sm:text-3xl">
                      Have a project like this in mind?
                    </h2>
                    <p className="mt-3 font-body text-sm leading-relaxed text-cream/80">
                      Tell me what you’re looking to create, and let’s discuss the right solution for your business.
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-olive px-6 py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-cream hover:text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                  >
                    Start a project <ArrowUpRight size={16} className="ml-2" aria-hidden="true" />
                  </Link>
                </div>
              </section>
            </article>
          )}
        </div>
      </main>
    </>
  );
}