import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ArrowUpRight, ImageOff } from "lucide-react";
import { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
}

const sectorColors: Record<string, string> = {
  "Web Development": "bg-sky-50 text-sky-700 border-sky-100",
  "Branding":        "bg-violet-50 text-violet-700 border-violet-100",
  "GovTech":         "bg-emerald-50 text-emerald-700 border-emerald-100",
  "E-commerce":      "bg-amber-50 text-amber-700 border-amber-100",
  "Enterprise":      "bg-slate-50 text-slate-600 border-slate-100",
  "FinTech":         "bg-green-50 text-green-700 border-green-100",
  "Education":       "bg-blue-50 text-blue-700 border-blue-100",
  "NGO":             "bg-rose-50 text-rose-700 border-rose-100",
};

const ProjectCard = ({ project }: ProjectCardProps) => {
  const isLive = project.liveUrl && project.liveUrl !== "#";
  const hasImage = !!project.image;
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const sectorClass = sectorColors[project.sector] ?? "bg-stone-50 text-stone-600 border-stone-100";

  return (
    <motion.div
      className="group relative bg-snow border border-border rounded-[4px] overflow-hidden flex flex-col h-full"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{
        y: -4,
        boxShadow: "0 12px 40px -8px rgba(0,0,0,0.12), 0 4px 16px -4px rgba(0,0,0,0.06)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden bg-paper border-b border-border">
        {hasImage && !imgError ? (
          <>
            <motion.img
              src={project.image}
              alt={project.name}
              onError={() => setImgError(true)}
              className="w-full h-48 object-cover object-top"
              animate={{ scale: hovered ? 1.06 : 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
            <AnimatePresence>
              {hovered && (
                <motion.div
                  key="scrim"
                  className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {hovered && isLive && (
                <motion.a
                  key="pill"
                  href={project.liveUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-snow text-ink text-xs font-body font-medium px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <ExternalLink size={11} strokeWidth={2} />
                  View Live Site
                </motion.a>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="w-full h-36 flex flex-col items-center justify-center gap-2 text-[#C8C8C8]">
            <ImageOff size={22} strokeWidth={1.5} />
            <span className="font-body text-xs">No preview</span>
          </div>
        )}

        {isLive && (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-snow/90 backdrop-blur-sm border border-border text-[10px] font-body font-medium text-emerald-600 px-2 py-0.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center mb-3">
          <span className={`inline-block text-[11px] font-body font-medium px-2 py-0.5 rounded-[4px] border ${sectorClass}`}>
            {project.sector}
          </span>
        </div>

        <h3 className="font-display text-[17px] leading-snug text-ink">{project.name}</h3>
        <p className="font-body text-[13px] text-[#4A4A4A] mt-2 leading-relaxed flex-1">
          {project.description}
        </p>

        {isLive && (
          <a
            href={project.liveUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-ember font-body text-[13px] font-medium group/link self-start"
          >
            <span className="underline underline-offset-2 decoration-ember/30 group-hover/link:decoration-ember transition-colors">
              View project
            </span>
            <motion.span animate={hovered ? { x: 2, y: -2 } : { x: 0, y: 0 }} transition={{ duration: 0.2 }}>
              <ArrowUpRight size={14} strokeWidth={2} />
            </motion.span>
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCard;