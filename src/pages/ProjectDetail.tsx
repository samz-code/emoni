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
  const paragraphs = (project?.fullDescription || project?.description || "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {project?.image && <meta property="og:image" content={project.image} />}
      </Helmet>

      <main className="min-h-screen bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/projects"
            className="inline-flex min-h-11 items-center gap-2 font-body text-sm text-forest hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
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
              <Link to="/projects" className="mt-6 inline-flex min-h-11 items-center border border-forest px-4 text-sm text-forest">
                Return to portfolio
              </Link>
            </section>
          ) : (
            <article className="mt-8">
              <header className="max-w-3xl">
                <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ember">{project.category}</p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">{project.title}</h1>
                {project.description && (
                  <p className="mt-5 max-w-2xl font-body text-lg leading-relaxed text-ink/75">{project.description}</p>
                )}
                {project.categories.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-2" aria-label="Project categories">
                    {Array.from(new Set([project.category, ...project.categories])).map((category) => (
                      <li key={category} className="border border-border bg-snow px-3 py-2 font-body text-xs text-ink/75">
                        {category}
                      </li>
                    ))}
                  </ul>
                )}
                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex min-h-11 items-center gap-2 bg-forest px-4 py-2 font-body text-sm text-cream hover:bg-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                  >
                    Visit live project <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                )}
              </header>

              {paragraphs.length > 0 && (
                <section className="mt-12 max-w-3xl" aria-labelledby="project-overview-heading">
                  <h2 id="project-overview-heading" className="font-display text-2xl text-ink">Project overview</h2>
                  <div className="mt-4 space-y-4 font-body text-base leading-relaxed text-ink/75">
                    {paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>)}
                  </div>
                </section>
              )}

              <section className="mt-12" aria-labelledby="project-gallery-heading">
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
                        className="group block overflow-hidden border border-border bg-snow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                      >
                        <img
                          src={image}
                          alt={`${project.title} project example ${index + 1}`}
                          loading={index === 0 ? "eager" : "lazy"}
                          decoding="async"
                          className="h-auto max-h-[80vh] w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 border border-dashed border-border text-ink/45">
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
