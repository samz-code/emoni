import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "@/components/ProjectCard";
import GraphicDesignGallery from "@/components/GraphicDesignGallery";
import { projects, products } from "@/data/projects";
import { Package, Palette, FileText, Megaphone, Code } from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────
const sectors = [
  "All",
  "Web Development",
  "GovTech",
  "E-commerce",
];

const iconMap = { Palette, FileText, Megaphone, Code };

type Tab = "projects" | "design" | "products";

const tabs: { key: Tab; label: string }[] = [
  { key: "projects", label: "Web Projects" },
  { key: "design",   label: "Graphic Design" },
  { key: "products", label: "Products" },
];

// ── Animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show:  { opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:  { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } },
};

// ─────────────────────────────────────────────────────────────────────────────

const Projects = () => {
  const [tab, setTab] = useState<Tab>("projects");
  const [sector, setSector] = useState("All");

  const filteredProjects =
    sector === "All" ? projects : projects.filter((p) => p.sector === sector);

  return (
    <main className="bg-paper py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page header — SEO h1 ── */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1 className="font-display text-[40px] leading-tight text-ink">
            Projects & Work
          </h1>
          <p className="font-body text-[16px] text-[#4A4A4A] max-w-2xl mt-3 leading-relaxed">
            Full-stack web development, graphic design, and digital products
            delivered for businesses, government institutions, and NGOs across
            Kenya and East Africa since 2021.
          </p>
        </motion.header>

        {/* ── Tab bar ── */}
        <nav
          aria-label="Portfolio sections"
          className="flex gap-8 mt-10 border-b border-border overflow-x-auto"
        >
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`pb-3 font-body text-[14px] whitespace-nowrap transition-colors ${
                tab === key
                  ? "text-ink border-b-2 border-ember font-medium"
                  : "text-[#9A9A9A] hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ════════════════════════════════════════════════════════════════════
            WEB PROJECTS
        ════════════════════════════════════════════════════════════════════ */}
        {tab === "projects" && (
          <section aria-label="Web development projects">
            <div className="mt-6 mb-1">
              <p className="font-body text-[13px] text-[#9A9A9A] max-w-xl">
                Production websites, government portals, e-commerce platforms, and
                enterprise tools — built with Next.js, React, and PostgreSQL.
              </p>
            </div>

            {/* Sector filter */}
            <div
              role="tablist"
              aria-label="Filter by sector"
              className="flex gap-5 mt-5 overflow-x-auto pb-1 border-b border-border"
            >
              {sectors.map((s) => (
                <button
                  key={s}
                  role="tab"
                  aria-selected={sector === s}
                  onClick={() => setSector(s)}
                  className={`pb-3 font-body text-[13px] whitespace-nowrap transition-colors ${
                    sector === s
                      ? "text-ink border-b-2 border-ember font-medium"
                      : "text-[#9A9A9A] hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={sector}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                {filteredProjects.map((project) => (
                  <motion.div key={project.name} variants={cardVariants} layout>
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </section>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            GRAPHIC DESIGN
        ════════════════════════════════════════════════════════════════════ */}
        {tab === "design" && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38 }}
          >
            <div className="mt-6 max-w-2xl">
              <h2 className="font-display text-[26px] text-ink">General Graphic Design</h2>
              <p className="font-body text-[14px] text-[#4A4A4A] mt-2 leading-relaxed">
                Logos, posters, CVs, banners, menus, certificates, and more —
                designed for Kenyan and East African clients. All work is delivered
                print-ready and in editable formats. Use the filters below to browse
                by category, or scroll to see the full portfolio.
              </p>
            </div>
            <GraphicDesignGallery />
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            PRODUCTS
        ════════════════════════════════════════════════════════════════════ */}
        {tab === "products" && (
          <section aria-label="Digital products and templates">
            <div className="mt-6 mb-8 max-w-2xl">
              <h2 className="font-display text-[26px] text-ink">Digital Products</h2>
              <p className="font-body text-[14px] text-[#4A4A4A] mt-2 leading-relaxed">
                Templates, checklists, and starter kits distilled from real client
                engagements — immediately usable for freelancers, agencies, and
                growing businesses in Kenya.
              </p>
            </div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {products.map((product) => {
                const message =
                  product.status === "available"
                    ? `Hi Samuel, I'd like to get "${product.name}". What are the next steps?`
                    : `Hi Samuel, please notify me when "${product.name}" is available.`;
                const href = `https://wa.me/254727492545?text=${encodeURIComponent(message)}`;
                const Icon = iconMap[product.icon as keyof typeof iconMap] || Package;

                return (
                  <motion.article
                    key={product.name}
                    variants={cardVariants}
                    className="bg-snow border border-border rounded-[4px] flex flex-col overflow-hidden"
                    whileHover={{
                      y: -3,
                      boxShadow: "0 10px 36px -8px rgba(0,0,0,0.09), 0 3px 12px -3px rgba(0,0,0,0.05)",
                    }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                  >
                    {/* Icon area */}
                    <div className="bg-paper h-20 flex items-center justify-center border-b border-border">
                      <Icon size={30} className="text-ink/20" strokeWidth={1.5} />
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <span className="font-body text-[11px] uppercase tracking-widest text-[#9A9A9A]">
                        {product.category}
                      </span>
                      <h3 className="font-display text-[16px] text-ink mt-2 leading-snug">
                        {product.name}
                      </h3>
                      <p className="font-body text-[13px] text-[#4A4A4A] mt-2 leading-relaxed flex-1">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                        <div>
                          <p className="font-body text-[11px] text-[#9A9A9A]">{product.format}</p>
                          <p className="font-body text-[15px] font-semibold text-ink mt-0.5">
                            ${product.price}
                          </p>
                        </div>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 font-body text-[12px] font-medium px-3.5 py-2 rounded-[4px] transition-opacity hover:opacity-85 ${
                            product.status === "available"
                              ? "bg-ink text-snow"
                              : "border border-border text-[#7A7A7A]"
                          }`}
                        >
                          {product.status === "available" ? "Get this" : "Notify me"}
                        </a>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </section>
        )}

      </div>
    </main>
  );
};

export default Projects;