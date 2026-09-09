import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import ProjectCard from "@/components/ProjectCard";
import { Package, Palette, FileText, Megaphone, Code, Building2 } from "lucide-react";

const iconMap = { Palette, FileText, Megaphone, Code };

type Tab = "projects" | "design" | "products";

const tabs: { key: Tab; label: string }[] = [
  { key: "projects", label: "Web Projects" },
  { key: "design", label: "Graphic Design" },
  { key: "products", label: "Products" },
];

// Motion Variants
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } },
};

export default function Projects() {
  const [tab, setTab] = useState<Tab>("projects");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedDesignCategory, setSelectedDesignCategory] = useState("All");

  // Fetch Web Projects from Supabase
  const { data: webProjectRows = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["public-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const webProjects = webProjectRows.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    sector: p.sector,
    industry: p.industry,
    image: p.image,
    images: p.images,
    liveUrl: p.live_url,
  }));

  // Fetch Graphic Design items from Supabase
  const { data: designRows = [], isLoading: loadingDesigns } = useQuery({
    queryKey: ["public-designs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("graphic_designs")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const designProjects = designRows.map((d: any) => ({
    id: d.id,
    name: d.title,
    description: d.category,
    sector: d.category,
    image: d.image,
    images: d.images,
    liveUrl: d.live_url,
  }));

  // Fetch Digital Products from Supabase
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["public-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch Dynamic Site Settings
  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").single();
      if (error && error.code !== "PGRST116") console.warn("Site settings notice:", error.message);
      return data || {};
    },
  });

  const dynamicSectors = [
    "All",
    ...Array.from(new Set(webProjects.map((p: any) => p.sector || p.industry).filter(Boolean))),
  ];

  const designCategories = [
    "All",
    ...Array.from(new Set(designRows.map((d: any) => d.category).filter(Boolean))),
  ];

  const filteredWebProjects =
    selectedIndustry === "All"
      ? webProjects
      : webProjects.filter((p: any) => (p.sector || p.industry) === selectedIndustry);

  const filteredDesignProjects =
    selectedDesignCategory === "All"
      ? designProjects
      : designProjects.filter((p: any) => p.sector === selectedDesignCategory);

  const clientLogos = webProjects.filter((p: any) => p.image || p.logo || (p.images && p.images.length > 0));

  const totalItemsShipped = webProjects.length + designRows.length;

  const canonicalUrl = "https://www.emonisamuel.co.ke/projects";
  const pageTitle = `${siteSettings?.projects_title || "Web Projects, Design Portfolio & Products"} | Samuel A. Emoni`;
  const pageDescription = siteSettings?.projects_subtitle || "Browse a portfolio of full-stack web applications, custom digital systems, graphic design projects, and digital products built by Samuel A. Emoni.";

  // Dynamic Schema markup for Portfolio
  const portfolioSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": canonicalUrl,
    "creator": {
      "@type": "Person",
      "name": "Samuel A. Emoni",
      "url": "https://www.emonisamuel.co.ke"
    },
    "hasPart": [
      ...webProjects.map((project: any) => ({
        "@type": "CreativeWork",
        "name": project.name,
        "description": project.description,
        "url": project.liveUrl || canonicalUrl,
        "image": project.image || "https://www.emonisamuel.co.ke/og-image.jpg"
      })),
      ...designProjects.map((design: any) => ({
        "@type": "CreativeWork",
        "name": design.name,
        "description": design.description,
        "image": design.image || "https://www.emonisamuel.co.ke/og-image.jpg"
      }))
    ]
  };

  return (
    <>
      <Helmet>
        {/* Core Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://www.emonisamuel.co.ke/og-image.jpg" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://www.emonisamuel.co.ke/og-image.jpg" />

        {/* Structured Data / Schema */}
        <script type="application/ld+json">
          {JSON.stringify(portfolioSchema)}
        </script>
      </Helmet>

      <main className="bg-paper py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Dynamic Header */}
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h1 className="font-display text-[40px] leading-tight text-ink">
              {siteSettings?.projects_title || "Projects & Work"}
            </h1>
            <p className="font-body text-[16px] text-[#4A4A4A] max-w-2xl mt-3 leading-relaxed">
              {siteSettings?.projects_subtitle || "Browse web development applications, graphic design projects, and digital products."}
            </p>
          </motion.header>

          {/* Dynamic Database-Driven Stats Strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex flex-wrap gap-x-10 gap-y-4 mt-10 pt-8 border-t border-border"
          >
            <div>
              <p className="font-display text-[28px] text-ink leading-none">{totalItemsShipped}</p>
              <p className="font-body text-[12px] uppercase tracking-widest text-[#9A9A9A] mt-1.5">Projects Shipped</p>
            </div>
            <div>
              <p className="font-display text-[28px] text-ink leading-none">{Math.max(0, dynamicSectors.length - 1)}</p>
              <p className="font-body text-[12px] uppercase tracking-widest text-[#9A9A9A] mt-1.5">Industries Served</p>
            </div>
            <div>
              <p className="font-display text-[28px] text-ink leading-none">{products.length}</p>
              <p className="font-body text-[12px] uppercase tracking-widest text-[#9A9A9A] mt-1.5">Digital Products</p>
            </div>
          </motion.div>

          {/* Client Logos Infinite Marquee Carousel */}
          {clientLogos.length > 0 && (
            <div className="mt-12 pt-6 border-t border-border">
              <p className="font-body text-[11px] uppercase tracking-widest text-[#9A9A9A] mb-4">Client Portfolio & Partners</p>
              <div className="relative overflow-hidden w-full flex items-center bg-snow/50 p-4 rounded-lg border border-border">
                <div className="flex gap-8 items-center animate-marquee whitespace-nowrap min-w-full shrink-0">
                  {clientLogos.concat(clientLogos).map((item: any, idx: number) => (
                    <div key={`${item.id || idx}-${idx}`} className="flex items-center gap-2 px-4 py-1.5 rounded bg-white border border-border shrink-0 shadow-2xs">
                      <Building2 size={16} className="text-[#007979]" />
                      <span className="font-body text-xs font-bold text-ink">{item.name || item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <nav aria-label="Portfolio sections" className="flex gap-8 mt-10 border-b border-border overflow-x-auto">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`pb-3 font-body text-[14px] whitespace-nowrap transition-colors cursor-pointer ${
                  tab === key ? "text-ink border-b-2 border-ember font-medium" : "text-[#9A9A9A] hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* WEB PROJECTS TAB */}
          {tab === "projects" && (
            <section aria-label="Web development projects">
              <div role="tablist" aria-label="Filter by industry" className="flex gap-4 mt-6 overflow-x-auto pb-2 border-b border-border">
                {dynamicSectors.map((sec) => (
                  <button
                    key={sec}
                    role="tab"
                    aria-selected={selectedIndustry === sec}
                    onClick={() => setSelectedIndustry(sec)}
                    className={`px-3 py-1.5 rounded-full text-xs font-body transition-all cursor-pointer ${
                      selectedIndustry === sec
                        ? "bg-[#007979] text-white font-medium shadow-2xs"
                        : "bg-paper text-[#9A9A9A] border border-border hover:text-ink"
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              {loadingProjects ? (
                <div className="py-20 text-center font-body text-xs text-[#9A9A9A]">Loading projects...</div>
              ) : filteredWebProjects.length === 0 ? (
                <div className="py-20 text-center font-body text-xs text-[#9A9A9A]">No web projects available.</div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedIndustry}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                  >
                    {filteredWebProjects.map((project: any) => (
                      <motion.div key={project.id || project.name} variants={cardVariants} layout>
                        <ProjectCard project={project} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </section>
          )}

          {/* GRAPHIC DESIGN TAB */}
          {tab === "design" && (
            <section aria-label="Graphic design projects">
              {designCategories.length > 1 && (
                <div role="tablist" aria-label="Filter design categories" className="flex gap-4 mt-6 overflow-x-auto pb-2 border-b border-border">
                  {designCategories.map((cat) => (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={selectedDesignCategory === cat}
                      onClick={() => setSelectedDesignCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-body transition-all cursor-pointer ${
                        selectedDesignCategory === cat
                          ? "bg-[#007979] text-white font-medium shadow-2xs"
                          : "bg-paper text-[#9A9A9A] border border-border hover:text-ink"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {loadingDesigns ? (
                <div className="py-20 text-center font-body text-xs text-[#9A9A9A]">Loading designs...</div>
              ) : filteredDesignProjects.length === 0 ? (
                <div className="py-20 text-center font-body text-xs text-[#9A9A9A]">No graphic design items found in database.</div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedDesignCategory}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                  >
                    {filteredDesignProjects.map((project: any) => (
                      <motion.div key={project.id || project.name} variants={cardVariants} layout>
                        <ProjectCard project={project} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </section>
          )}

          {/* PRODUCTS TAB */}
          {tab === "products" && (
            <section aria-label="Digital products and templates">
              {loadingProducts ? (
                <div className="py-20 text-center font-body text-xs text-[#9A9A9A]">Loading store items...</div>
              ) : products.length === 0 ? (
                <div className="py-20 text-center font-body text-xs text-[#9A9A9A]">No products available.</div>
              ) : (
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8" variants={containerVariants} initial="hidden" animate="show">
                  {products.map((product: any) => {
                    const contactPhone = siteSettings?.whatsapp_number || product.whatsapp_number;
                    const message = product.status === "available"
                      ? `Hi, I'd like to get "${product.name}".`
                      : `Hi, please notify me when "${product.name}" is available.`;
                    const href = product.buy_url || (contactPhone ? `https://wa.me/${contactPhone}?text=${encodeURIComponent(message)}` : "#");
                    const Icon = iconMap[product.icon as keyof typeof iconMap] || Package;

                    return (
                      <motion.article
                        key={product.id || product.name}
                        variants={cardVariants}
                        className="bg-snow border border-border rounded-[4px] flex flex-col overflow-hidden"
                        whileHover={{ y: -3, boxShadow: "0 10px 36px -8px rgba(0,0,0,0.09)" }}
                      >
                        <div className="bg-paper h-20 flex items-center justify-center border-b border-border">
                          <Icon size={30} className="text-ink/20" strokeWidth={1.5} />
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <span className="font-body text-[11px] uppercase tracking-widest text-[#9A9A9A]">{product.category}</span>
                          <h3 className="font-display text-[16px] text-ink mt-2 leading-snug">{product.name}</h3>
                          <p className="font-body text-[13px] text-[#4A4A4A] mt-2 leading-relaxed flex-1">{product.description}</p>
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                            <div>
                              <p className="font-body text-[11px] text-[#9A9A9A]">{product.format}</p>
                              <p className="font-body text-[15px] font-semibold text-ink mt-0.5">${product.price}</p>
                            </div>
                            <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 font-body text-[12px] font-medium px-3.5 py-2 rounded-[4px] ${product.status === "available" ? "bg-ink text-snow" : "border border-border text-[#7A7A7A]"}`}>
                              {product.status === "available" ? "Get this" : "Notify me"}
                            </a>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </motion.div>
              )}
            </section>
          )}

        </div>
      </main>
    </>
  );
}