import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ImageOff, ChevronLeft, ChevronRight } from "lucide-react";

export interface ProjectCardProps {
  project: {
    id?: string | number;
    name: string;
    description: string;
    sector?: string;
    industry?: string;
    image?: string;
    images?: string[];
    liveUrl?: string;
    landscapePreview?: boolean;
    squarePreview?: boolean;
    detailUrl?: string;
  };
}

const formatDisplayUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname !== "/" ? parsed.pathname : ""}`;
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
};

const safeExternalUrl = (value?: string) => {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
};

const ProjectCard = ({ project }: ProjectCardProps) => {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  const imageList: string[] = Array.isArray(project.images) && project.images.length > 0
    ? project.images
    : project.image
    ? [project.image]
    : [];

  const hasImages = imageList.length > 0 && !imgError;
  const isCarousel = imageList.length > 1;
  const liveUrl = safeExternalUrl(project.liveUrl);
  const sectorName = project.sector || project.industry || "General";

  // Logos keep their full artwork (contained + padded); everything else fills the frame edge to edge.
  const isLogo = Boolean(project.squarePreview);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIdx((prev) => (prev + 1) % imageList.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIdx((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-snow transition-colors hover:border-olive">
      <div className={`relative w-full overflow-hidden bg-[#eee9df] ${project.landscapePreview ? "aspect-video" : isLogo ? "aspect-square" : "aspect-[736/900]"}`}>
        {hasImages ? (
          <>
            <img
              src={imageList[currentImageIdx]}
              alt={project.name}
              onError={() => setImgError(true)}
              loading="lazy"
              decoding="async"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className={`absolute inset-0 h-full w-full transition-transform duration-300 group-hover:scale-[1.03] ${
                isLogo ? "object-contain p-6" : "object-cover object-top"
              }`}
            />

            {isCarousel && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 min-h-11 min-w-11 rounded-full bg-snow/90 text-ink shadow-sm transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember cursor-pointer"
                  aria-label="Previous Image"
                >
                  <ChevronLeft size={16} className="mx-auto" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 min-h-11 min-w-11 rounded-full bg-snow/90 text-ink shadow-sm transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember cursor-pointer"
                  aria-label="Next Image"
                >
                  <ChevronRight size={16} className="mx-auto" />
                </button>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-xs">
                  {imageList.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIdx(idx);
                      }}
                      className="flex min-h-10 min-w-10 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ember"
                      aria-label={`Show ${project.name} image ${idx + 1}`}
                      aria-pressed={currentImageIdx === idx}
                    >
                      <span className={`h-1.5 rounded-full transition-all ${
                        currentImageIdx === idx ? "w-3 bg-snow" : "w-1.5 bg-snow/60"
                      }`} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink/35">
            <ImageOff size={22} strokeWidth={1.5} />
            <span className="font-body text-xs">No preview available</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2">
          <span className="font-body text-[11px] font-medium text-ink/55">
            {sectorName}
          </span>
        </div>

        <h3 className="font-display text-lg font-semibold leading-snug text-ink normal-case">
          {project.name}
        </h3>
        {project.description && project.description !== sectorName && (
          <p className="mt-2 line-clamp-3 font-body text-sm leading-relaxed text-[#4A4A4A]">
            {project.description}
          </p>
        )}

        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${project.name} at ${formatDisplayUrl(liveUrl)}`}
            className="mt-4 inline-flex min-h-10 items-center gap-1 self-start font-body text-xs font-medium text-forest underline decoration-forest/30 underline-offset-4 transition-colors hover:text-ember hover:decoration-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            View project <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        )}
        {project.detailUrl && (
          <Link
            to={project.detailUrl}
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border border-forest px-4 py-2 font-body text-sm font-medium text-forest transition-colors hover:bg-forest hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            View Details
          </Link>
        )}
      </div>
    </article>
  );
};

export default ProjectCard;