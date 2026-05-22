import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ArrowUpRight, ImageOff } from "lucide-react";
import {
  designItems,
  designCategories,
  DesignCategory,
  DesignItem,
} from "@/data/graphicDesign";

// ── SEO-optimised category descriptions ──────────────────────────────────────
const categoryDescriptions: Record<DesignCategory, string> = {
  "Logos":
    "Custom logo design for startups, SMEs, and NGOs across Kenya and East Africa. Delivered in vector formats (AI, SVG, PDF) ready for print and digital.",
  "Posters & Flyers":
    "A3 and A4 event posters, promotional flyers, and church programmes designed for maximum impact in print and digital distribution.",
  "Invitations & Cards":
    "Wedding invitations, birthday cards, corporate event invites, and baby shower designs — print-ready and digitally shareable.",
  "Certificates":
    "Training certificates, awards, and academic completion designs aligned with institutional brand guidelines.",
  "Fiverr Gigs":
    "Professional Fiverr gig cover images that convert — optimised for the platform's thumbnail dimensions and buyer expectations.",
  "CV / Resume & Cover Letter":
    "ATS-friendly and visually polished CV, resume, and cover letter designs for professionals and graduates.",
  "Banners & Roll-Ups":
    "Roll-up banners, outdoor backdrops, step-and-repeat banners, and web banners sized and print-ready for Kenyan printers.",
  "Menus & Price Lists":
    "Restaurant menus, café drinks boards, salon price cards, and service price lists — designed to reflect brand quality.",
  "Labels & Stickers":
    "Product labels for honey jars, cosmetics, water bottles, and packaged goods — print-ready for local label printers.",
  "Product Design":
    "Packaging mockups, T-shirt prints, branded merchandise, and product presentation artwork.",
  "Company Profiles":
    "Multi-page company profiles and capability statements designed for pitch meetings, tenders, and client onboarding.",
  "YouTube Thumbnails":
    "Click-optimised YouTube thumbnails for tech, business, vlog, and motivational channels — sized 1280×720px.",
  "Brochures":
    "Tri-fold and bi-fold brochures for services, real estate, schools, and medical practices — designed for offset and digital print.",
};

// Aspect ratio per category so images are never cropped
const categoryAspect: Record<DesignCategory, string> = {
  "Logos":                    "aspect-square",
  "Posters & Flyers":         "aspect-[3/4]",   // portrait A4/A3
  "Invitations & Cards":      "aspect-[3/4]",
  "Certificates":             "aspect-[4/3]",
  "Fiverr Gigs":              "aspect-[16/9]",
  "CV / Resume & Cover Letter":"aspect-[3/4]",
  "Banners & Roll-Ups":       "aspect-[9/16]",  // tall roll-ups
  "Menus & Price Lists":      "aspect-[3/4]",
  "Labels & Stickers":        "aspect-square",
  "Product Design":           "aspect-[4/3]",
  "Company Profiles":         "aspect-[3/4]",
  "YouTube Thumbnails":       "aspect-[16/9]",
  "Brochures":                "aspect-[4/3]",
};

// ── Animation variants ────────────────────────────────────────────────────────
const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const tileVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ── Lightbox ──────────────────────────────────────────────────────────────────
interface LightboxProps {
  items: DesignItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const Lightbox = ({ items, index, onClose, onPrev, onNext }: LightboxProps) => {
  const item = items[index];
  const waHref = `https://wa.me/254727492545?text=${encodeURIComponent(
    `Hi Samuel, I'd like a ${item.category} design — similar to "${item.title}". Please share pricing and turnaround.`
  )}`;

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing: ${item.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="absolute inset-0 bg-ink/85 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative z-10 w-full max-w-[900px] bg-snow rounded-[4px] overflow-hidden shadow-2xl grid md:grid-cols-[1fr_300px]"
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* ── Image pane ── */}
        <div className="relative bg-[#F5F5F0] flex items-center justify-center min-h-[300px] md:min-h-[500px]">
          <img
            key={item.id}
            src={item.image}
            alt={`${item.title} — ${item.category} design by Samuel Emoni`}
            className="w-full h-full object-contain max-h-[560px] p-4"
          />

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                aria-label="Previous design"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-snow border border-border flex items-center justify-center shadow-sm hover:shadow transition-shadow"
              >
                <ChevronLeft size={16} className="text-ink" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                aria-label="Next design"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-snow border border-border flex items-center justify-center shadow-sm hover:shadow transition-shadow"
              >
                <ChevronRight size={16} className="text-ink" />
              </button>
            </>
          )}

          <span className="absolute bottom-3 right-3 font-body text-[10px] text-[#9A9A9A] bg-snow/80 px-2 py-0.5 rounded">
            {index + 1} / {items.length}
          </span>
        </div>

        {/* ── Detail pane ── */}
        <div className="border-l border-border flex flex-col p-6 gap-5">
          <div className="flex justify-between items-start">
            <span className="font-body text-[11px] uppercase tracking-widest text-[#9A9A9A]">
              {item.category}
            </span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-paper transition-colors"
            >
              <X size={13} className="text-ink" />
            </button>
          </div>

          <h3 className="font-display text-[20px] leading-snug text-ink">{item.title}</h3>

          <p className="font-body text-[13px] text-[#4A4A4A] leading-relaxed">
            {categoryDescriptions[item.category]}
          </p>

          <div className="mt-auto pt-4 border-t border-border flex flex-col gap-3">
            <p className="font-body text-[12px] text-[#9A9A9A]">
              Based in Nairobi · Available for remote projects
            </p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-ink text-snow font-body text-[13px] font-medium py-2.5 px-4 rounded-[4px] hover:bg-ink/90 transition-colors"
            >
              Get a Quote on WhatsApp
              <ArrowUpRight size={13} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Image tile ────────────────────────────────────────────────────────────────
const DesignTile = ({ item, onClick }: { item: DesignItem; onClick: () => void }) => {
  const [broken, setBroken] = useState(false);
  const aspectClass = categoryAspect[item.category] ?? "aspect-[3/4]";

  return (
    <motion.button
      variants={tileVariants}
      onClick={onClick}
      aria-label={`View ${item.title}`}
      className="group relative rounded-[4px] overflow-hidden border border-border bg-[#F5F5F0] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink w-full"
      whileHover={{ y: -3, boxShadow: "0 8px 28px -4px rgba(0,0,0,0.14)" }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
    >
      {/* Image area — correct aspect per category, image never cropped */}
      <div className={`${aspectClass} w-full overflow-hidden bg-[#F0F0EB]`}>
        {broken ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#C0C0C0]">
            <ImageOff size={22} strokeWidth={1.5} />
            <span className="font-body text-[10px]">No preview</span>
          </div>
        ) : (
          <motion.img
            src={item.image}
            alt={`${item.title} — graphic design by Samuel Emoni`}
            loading="lazy"
            onError={() => setBroken(true)}
            className="w-full h-full object-contain p-2"
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        )}
      </div>

      {/* Label bar */}
      <div className="px-3 py-2.5 border-t border-border flex items-center justify-between gap-2 bg-snow">
        <span className="font-body text-[11px] text-ink leading-tight line-clamp-2">{item.title}</span>
        <ArrowUpRight
          size={12}
          className="text-[#C0C0C0] group-hover:text-ink transition-colors shrink-0"
          strokeWidth={2}
        />
      </div>
    </motion.button>
  );
};

// ── Gallery ───────────────────────────────────────────────────────────────────
const GraphicDesignGallery = () => {
  const [active, setActive] = useState<"All" | DesignCategory>("All");
  const [lightboxItems, setLightboxItems] = useState<DesignItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filteredItems =
    active === "All" ? designItems : designItems.filter((d) => d.category === active);

  const open = useCallback((items: DesignItem[], idx: number) => {
    setLightboxItems(items);
    setLightboxIndex(idx);
    document.body.style.overflow = "hidden";
  }, []);

  const close = useCallback(() => {
    setLightboxItems([]);
    document.body.style.overflow = "";
  }, []);

  const prev = useCallback(
    () => setLightboxIndex((i) => (i - 1 + lightboxItems.length) % lightboxItems.length),
    [lightboxItems.length]
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i + 1) % lightboxItems.length),
    [lightboxItems.length]
  );

  useEffect(() => () => { document.body.style.overflow = ""; }, []);

  return (
    <section aria-label="Graphic design portfolio">
      {/* ── Filter tabs ── */}
      <div
        role="tablist"
        aria-label="Filter by design category"
        className="flex gap-1 flex-wrap mt-6 mb-10"
      >
        {(["All", ...designCategories] as const).map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={active === cat}
            onClick={() => setActive(cat)}
            className={`font-body text-[12px] px-3 py-1.5 rounded-[3px] border transition-colors ${
              active === cat
                ? "bg-ink text-snow border-ink"
                : "bg-snow text-[#7A7A7A] border-border hover:border-ink/40 hover:text-ink"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── All view: grouped sections ── */}
      {active === "All" ? (
        <div className="space-y-16">
          {designCategories.map((cat) => {
            const items = designItems.filter((d) => d.category === cat);
            if (!items.length) return null;
            return (
              <motion.section
                key={cat}
                aria-labelledby={`section-${cat.replace(/\W+/g, "-").toLowerCase()}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* Section heading */}
                <div className="flex items-baseline gap-4 mb-5 pb-3 border-b border-border">
                  <h2
                    id={`section-${cat.replace(/\W+/g, "-").toLowerCase()}`}
                    className="font-display text-[19px] text-ink"
                  >
                    {cat}
                  </h2>
                  <span className="font-body text-[12px] text-[#9A9A9A]">
                    {items.length} {items.length === 1 ? "piece" : "pieces"}
                  </span>
                </div>

                {/* 
                  Grid columns adapt to the natural shape of each category:
                  - Portrait items (posters, CVs): fewer columns so they're tall enough
                  - Square items (logos): more columns fine
                  - Landscape items: standard 3-4 cols
                */}
                <motion.div
                  className={`grid gap-4 ${
                    cat === "Posters & Flyers" ||
                    cat === "CV / Resume & Cover Letter" ||
                    cat === "Invitations & Cards" ||
                    cat === "Menus & Price Lists" ||
                    cat === "Company Profiles" ||
                    cat === "Banners & Roll-Ups"
                      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                      : cat === "YouTube Thumbnails" || cat === "Fiverr Gigs"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  }`}
                  variants={gridVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-30px" }}
                >
                  {items.map((item, idx) => (
                    <DesignTile key={item.id} item={item} onClick={() => open(items, idx)} />
                  ))}
                </motion.div>
              </motion.section>
            );
          })}
        </div>
      ) : (
        /* ── Filtered view ── */
        <div>
          <p className="font-body text-[14px] text-[#4A4A4A] max-w-2xl mb-6 leading-relaxed">
            {categoryDescriptions[active as DesignCategory]}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className={`grid gap-4 ${
                active === "Posters & Flyers" ||
                active === "CV / Resume & Cover Letter" ||
                active === "Invitations & Cards" ||
                active === "Menus & Price Lists" ||
                active === "Company Profiles" ||
                active === "Banners & Roll-Ups"
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  : active === "YouTube Thumbnails" || active === "Fiverr Gigs"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              }`}
              variants={gridVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              {filteredItems.map((item, idx) => (
                <DesignTile key={item.id} item={item} onClick={() => open(filteredItems, idx)} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxItems.length > 0 && (
          <Lightbox
            items={lightboxItems}
            index={lightboxIndex}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default GraphicDesignGallery;