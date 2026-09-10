import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ImageOff, ChevronLeft, ChevronRight } from "lucide-react";

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
  };
}

const sectorDot: Record<string, string> = {
  "Web Development": "bg-sky-500",
  "Branding": "bg-violet-500",
  "Graphic Design": "bg-pink-500",
  "GovTech": "bg-emerald-500",
  "E-commerce": "bg-amber-500",
  "Enterprise": "bg-slate-500",
  "FinTech": "bg-green-500",
  "Education": "bg-blue-500",
  "NGO": "bg-rose-500",
  "Logos & Brand Identity": "bg-violet-500",
  "Fiverr Gigs": "bg-amber-500",
  "Labels & Stickers": "bg-pink-500",
  "Logos": "bg-violet-500",
  "Menus & Price Lists": "bg-emerald-500",
  "Posters & Flyers": "bg-sky-500",
  "Product Design": "bg-blue-500",
};

// Design-focused sectors that shouldn't show web deployment statuses
const designSectors = [
  "Graphic Design",
  "Branding",
  "Logos & Brand Identity",
  "Labels & Stickers",
  "Logos",
  "Menus & Price Lists",
  "Posters & Flyers",
  "Product Design",
];

const formatDisplayUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname !== "/" ? parsed.pathname : ""}`;
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
};

const ProjectCard = ({ project }: ProjectCardProps) => {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const imageList: string[] = Array.isArray(project.images) && project.images.length > 0
    ? project.images
    : project.image
    ? [project.image]
    : [];

  const hasImages = imageList.length > 0 && !imgError;
  const isCarousel = imageList.length > 1;
  const isLive = Boolean(project.liveUrl && project.liveUrl !== "#");
  const sectorName = project.sector || project.industry || "General";
  const dotClass = sectorDot[sectorName] ?? "bg-stone-400";
  const isDesignProject = designSectors.includes(sectorName);

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
    <motion.div
      className="group relative bg-snow border border-border rounded-lg overflow-hidden flex flex-col h-full"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{
        y: -3,
        boxShadow: "0 8px 24px -6px rgba(0,0,0,0.10), 0 2px 8px -2px rgba(0,0,0,0.04)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {/* Image & Carousel Section */}
      <div className="relative overflow-hidden bg-paper border-b border-border h-48">
        {hasImages ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIdx}
                className="w-full h-full flex items-center justify-center p-5"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1, scale: hovered ? 1.04 : 1 }}
                exit={{ opacity: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={imageList[currentImageIdx]}
                  alt={`${project.name} - ${currentImageIdx + 1}`}
                  onError={() => setImgError(true)}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              </motion.div>
            </AnimatePresence>

            {isCarousel && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-snow/80 backdrop-blur-sm text-ink hover:bg-snow shadow-sm transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Previous Image"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-snow/80 backdrop-blur-sm text-ink hover:bg-snow shadow-sm transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Next Image"
                >
                  <ChevronRight size={16} />
                </button>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-xs">
                  {imageList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setCurrentImageIdx(idx);
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                        currentImageIdx === idx ? "bg-snow w-3" : "bg-snow/50"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#C8C8C8]">
            <ImageOff size={22} strokeWidth={1.5} />
            <span className="font-body text-xs">No preview available</span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-3">
          <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A8A8A]">
            {sectorName}
          </span>
        </div>

        <h3 className="font-display text-[17px] leading-snug text-ink">{project.name}</h3>
        <p className="font-body text-[13px] text-[#4A4A4A] mt-2 leading-relaxed line-clamp-3">
          {project.description}
        </p>

        {/* Status Footer */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-3 text-[12px]">
          <span
            className={`flex items-center gap-1.5 font-mono uppercase tracking-wide ${
              isLive
                ? "text-emerald-600"
                : isDesignProject
                ? "text-violet-600"
                : "text-[#B0B0B0]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLive
                  ? "bg-emerald-500 animate-pulse"
                  : isDesignProject
                  ? "bg-violet-500"
                  : "bg-[#D4D4D4]"
              }`}
            />
            {isLive ? "Live" : isDesignProject ? "Design Asset" : "Archived"}
          </span>

          {isLive && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 min-w-0 text-ember font-body font-medium group/link"
            >
              <span className="underline underline-offset-2 decoration-ember/30 group-hover/link:decoration-ember transition-colors truncate">
                {formatDisplayUrl(project.liveUrl as string)}
              </span>
              <ExternalLink size={12} strokeWidth={2} className="shrink-0" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;