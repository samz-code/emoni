import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "@/components/ProjectCard";
import { projects, products } from "@/data/projects";
import { Package, Palette, FileText, Megaphone, Code } from "lucide-react";

const sectors = [
  "All",
  "Web Development",
  "Branding",
  "GovTech",
  "E-commerce",
  "Enterprise",
  "FinTech",
  "Education",
  "NGO",
];

const iconMap = {
  Palette,
  FileText,
  Megaphone,
  Code,
};

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.97,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

// ────────────────────────────────────────────────────────────────────────────

const Projects = () => {
  const [tab, setTab] = useState<"projects" | "products">("projects");
  const [sector, setSector] = useState("All");

  const filteredProjects =
    sector === "All"
      ? projects
      : projects.filter((p) => p.sector === sector);

  return (
    <main className="bg-paper py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-[42px] text-ink">
            Projects & Products
          </h1>
          <p className="font-body text-lg text-[#4A4A4A] max-w-2xl mt-3">
            Selected work delivered for businesses and institutions across East
            Africa — plus digital products available now.
          </p>
        </motion.div>

        {/* ── Tab switcher ── */}
        <div className="flex gap-8 mt-10 border-b border-border">
          {(["projects", "products"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 font-body text-[15px] capitalize transition-colors ${
                tab === t
                  ? "text-ink border-b-2 border-ember font-medium"
                  : "text-[#9A9A9A] hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── PROJECTS tab ── */}
        {tab === "projects" && (
          <>
            {/* Sector filter pills */}
            <div className="flex gap-6 mt-6 overflow-x-auto pb-1">
              {sectors.map((s) => (
                <button
                  key={s}
                  onClick={() => setSector(s)}
                  className={`pb-2 font-body text-sm whitespace-nowrap transition-colors ${
                    sector === s
                      ? "text-ink border-b-2 border-ember font-medium"
                      : "text-[#9A9A9A] hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Card grid — AnimatePresence lets exiting cards animate out */}
            <AnimatePresence mode="wait">
              <motion.div
                key={sector} // re-mount the list whenever sector changes
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.name}
                    variants={cardVariants}
                    layout
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {/* ── PRODUCTS tab ── */}
        {tab === "products" && (
          <>
            <p className="font-body text-[15px] text-[#4A4A4A] mt-6 mb-8">
              Digital products, templates, and tools built from real project
              experience — available for immediate download.
            </p>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {products.map((product) => {
                const message =
                  product.status === "available"
                    ? `Hello Samuel, I'd like to get the "${product.name}" product. Could you share the next steps?`
                    : `Hello Samuel, please notify me when "${product.name}" is available.`;
                const href = `https://wa.me/254727492545?text=${encodeURIComponent(
                  message
                )}`;

                return (
                  <motion.div
                    key={product.name}
                    variants={cardVariants}
                    className="bg-snow border border-border rounded-[4px] flex flex-col overflow-hidden"
                    whileHover={{
                      y: -4,
                      boxShadow:
                        "0 12px 40px -8px rgba(0,0,0,0.10), 0 4px 16px -4px rgba(0,0,0,0.05)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  >
                    {/* Icon header */}
                    <div className="bg-paper h-24 flex items-center justify-center border-b border-border">
                      {(() => {
                        const IconComponent =
                          iconMap[product.icon as keyof typeof iconMap] ||
                          Package;
                        return (
                          <IconComponent
                            size={36}
                            className="text-olive/40"
                            strokeWidth={1.5}
                          />
                        );
                      })()}
                    </div>

                    {/* Card body */}
                    <div className="p-5 flex flex-col flex-1">
                      <span className="inline-block bg-olive/10 text-olive text-xs rounded-[4px] px-2 py-1 font-body self-start">
                        {product.category}
                      </span>
                      <h3 className="font-display text-lg text-ink mt-3">
                        {product.name}
                      </h3>
                      <p className="font-body text-sm text-[#4A4A4A] mt-2 leading-relaxed">
                        {product.description}
                      </p>
                      <p className="font-body text-[12px] text-[#9A9A9A] mt-2">
                        {product.format}
                      </p>
                      <p className="font-body text-sm font-medium text-ember mt-1">
                        ${product.price}
                      </p>

                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 block"
                      >
                        <span
                          className={`w-full inline-flex items-center justify-center rounded-[4px] py-2.5 text-sm font-body font-medium transition-opacity hover:opacity-90 ${
                            product.status === "available"
                              ? "bg-ember text-snow"
                              : "border border-olive text-forest bg-olive/10"
                          }`}
                        >
                          {product.status === "available"
                            ? "Request on WhatsApp"
                            : "Get Update on WhatsApp"}
                        </span>
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
};

export default Projects;