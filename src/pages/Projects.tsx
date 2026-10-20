import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import ProjectCard from "@/components/ProjectCard";
import { Package, Palette, FileText, Megaphone, Code } from "lucide-react";

const iconMap = { Palette, FileText, Megaphone, Code };

type Tab = "projects" | "design" | "products";
const PROJECT_PAGE_SIZE = 12;

const tabs: { key: Tab; label: string }[] = [
  { key: "projects", label: "Web Projects" },
  { key: "design", label: "Graphic Design" },
  { key: "products", label: "Products" },
];

const DESIGN_CATEGORY_GROUPS = [
  {
    title: "Branding & Identity",
    categories: ["Branding", "Logos & Brand Identity", "Corporate Identity", "Stationery & Corporate"],
  },
  {
    title: "Print & Packaging",
    categories: ["Printing", "Print & Marketing Materials", "Print & Marketing Flyers", "Label & Package Design", "Packaging Design", "Packaging & Labels", "Posters & Flyers", "Editorial & Publication Design", "Signage & Large Format"],
  },
  {
    title: "Digital & Marketing",
    categories: ["Website & Digital Design", "UI/UX Design", "Social Media Design", "Social Media Campaigns", "Presentation Design", "Motion Graphics"],
  },
  {
    title: "Products & Illustration",
    categories: ["Product Design", "Product Mockups", "Pens & Promotional Items", "Apparel & Merchandise", "Merchandise Design", "Illustration", "3D Architectural & Interior Renders"],
  },
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
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => {
    const requestedTab = searchParams.get("tab");
    return requestedTab === "design" || requestedTab === "products" ? requestedTab : "projects";
  });
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedDesignCategory, setSelectedDesignCategory] = useState("All");

  // Fetch Web Projects from Supabase
  const {
    data: projectPages,
    isLoading: loadingProjects,
    isError: projectsFailed,
    refetch: retryProjects,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["public-projects"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase
        .from("projects")
        .select("id,name,description,sector,categories,image,live_url,created_at")
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PROJECT_PAGE_SIZE - 1);
      if (error) throw error;
      return data || [];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PROJECT_PAGE_SIZE ? allPages.length * PROJECT_PAGE_SIZE : undefined,
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const webProjectRows = projectPages?.pages.flat() ?? [];
  const webProjects = webProjectRows.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    sector: p.sector,
    categories: Array.isArray(p.categories) ? p.categories : [],
    image: p.image,
    liveUrl: p.live_url,
    landscapePreview: true,
    detailUrl: `/projects/web/${p.id}`,
  }));

  // Fetch Graphic Design items from Supabase
  const {
    data: designPages,
    isLoading: loadingDesigns,
    isError: designsFailed,
    refetch: retryDesigns,
    fetchNextPage: fetchNextDesignPage,
    hasNextPage: hasNextDesignPage,
    isFetchingNextPage: isFetchingNextDesignPage,
  } = useInfiniteQuery({
    queryKey: ["public-designs"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase
        .from("graphic_designs")
        .select("id,title,category,description,categories,image,created_at")
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PROJECT_PAGE_SIZE - 1);
      if (error) throw error;
      return data || [];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PROJECT_PAGE_SIZE ? allPages.length * PROJECT_PAGE_SIZE : undefined,
    enabled: tab === "design",
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const designRows = designPages?.pages.flat() ?? [];
  const designProjects = designRows.map((d: any) => ({
    id: d.id,
    name: d.title,
    description: d.description || d.category,
    sector: d.category,
    categories: Array.isArray(d.categories) ? d.categories : [],
    image: d.image,
    images: [],
    squarePreview: /logo/i.test(d.category || ""),
    detailUrl: `/projects/design/${d.id}`,
  }));

  // Fetch Digital Products from Supabase
  const {
    data: productPages,
    isLoading: loadingProducts,
    isError: productsFailed,
    refetch: retryProducts,
    fetchNextPage: fetchNextProductPage,
    hasNextPage: hasNextProductPage,
    isFetchingNextPage: isFetchingNextProductPage,
  } = useInfiniteQuery({
    queryKey: ["public-products"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,description,category,format,price,status,icon,created_at")
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PROJECT_PAGE_SIZE - 1);
      if (error) throw error;
      return data || [];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PROJECT_PAGE_SIZE ? allPages.length * PROJECT_PAGE_SIZE : undefined,
    enabled: tab === "products",
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const products = productPages?.pages.flat() ?? [];

  // Fetch Dynamic Site Settings
  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("projects_title,projects_subtitle")
        .single();
      if (error && error.code !== "PGRST116") console.warn("Site settings notice:", error.message);
      return data || {};
    },
    staleTime: 60_000,
  });

  const dynamicSectors = [
    "All",
    ...Array.from(new Set(webProjects.flatMap((p: any) => [p.sector, ...p.categories]).filter(Boolean))),
  ];

  const availableDesignCategories = Array.from(new Set(
    designRows.flatMap((d: any) => [d.category, ...(Array.isArray(d.categories) ? d.categories : [])])
      .filter((category): category is string => typeof category === "string" && Boolean(category.trim())),
  ));
  const groupedDesignCategories = DESIGN_CATEGORY_GROUPS.map((group) => ({ ...group, categories: [...group.categories] }));
  const knownDesignCategories = new Set(groupedDesignCategories.flatMap((group) => group.categories.map((category) => category.toLocaleLowerCase())));
  const additionalDesignCategories = availableDesignCategories.filter((category) =>
    !knownDesignCategories.has(category.toLocaleLowerCase()) && category.toLocaleLowerCase() !== "all",
  );
  if (additionalDesignCategories.length > 0) {
    groupedDesignCategories.push({ title: "More Services", categories: additionalDesignCategories });
  }

  const filteredWebProjects =
    selectedIndustry === "All"
      ? webProjects
      : webProjects.filter((p: any) => p.sector === selectedIndustry || p.categories.includes(selectedIndustry));

  const filteredDesignProjects =
    selectedDesignCategory === "All"
      ? designProjects
      : designProjects.filter((p: any) =>
          [p.sector, ...p.categories].some((category: string) =>
            category.toLocaleLowerCase() === selectedDesignCategory.toLocaleLowerCase(),
          ),
        );

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
        "mainEntityOfPage": `https://www.emonisamuel.co.ke${project.detailUrl}`,
        "image": project.image || "https://www.emonisamuel.co.ke/og-image.jpg"
      })),
      ...designProjects.map((design: any) => ({
        "@type": "CreativeWork",
        "name": design.name,
        "description": design.description,
        "image": design.image || "https://www.emonisamuel.co.ke/og-image.jpg",
        "url": `https://www.emonisamuel.co.ke${design.detailUrl}`
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

      <main className="bg-paper py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Dynamic Header */}
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
              {siteSettings?.projects_title || "Projects & Work"}
            </h1>
            <p className="font-body text-[16px] text-[#4A4A4A] max-w-2xl mt-3 leading-relaxed">
              {siteSettings?.projects_subtitle || "Browse web development applications, graphic design projects, and digital products."}
            </p>
          </motion.header>

          {/* Tab Navigation */}
          <div role="group" aria-label="Choose portfolio section" className="mt-10 flex gap-6 overflow-x-auto border-b border-border sm:gap-8">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                aria-pressed={tab === key}
                onClick={() => setTab(key)}
                className={`min-h-11 whitespace-nowrap border-b-2 pb-2 font-body text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
                  tab === key ? "text-ink border-b-2 border-ember font-medium" : "text-[#9A9A9A] hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* WEB PROJECTS TAB */}
          {tab === "projects" && (
            <section aria-label="Web development projects">
              <div role="group" aria-label="Filter by industry" className="mt-6 flex flex-wrap gap-2.5">
                {dynamicSectors.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    aria-pressed={selectedIndustry === sec}
                    onClick={() => setSelectedIndustry(sec)}
                    className={`min-h-11 border px-5 py-2.5 text-sm font-body transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
                      selectedIndustry === sec
                        ? "border-ember bg-ember text-snow font-medium"
                        : "border-border bg-snow text-ink hover:border-ember"
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              {loadingProjects ? (
                <div className="py-20 text-center font-body text-xs text-[#9A9A9A]">Loading projects...</div>
              ) : projectsFailed ? (
                <div className="py-16 text-center" role="alert">
                  <p className="font-body text-sm text-red-700">Projects could not be loaded.</p>
                  <button type="button" onClick={() => void retryProjects()} className="mt-3 rounded border border-border px-4 py-2 font-body text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember">Retry</button>
                </div>
              ) : filteredWebProjects.length === 0 ? (
                <div className="py-20 text-center font-body text-xs text-[#9A9A9A]">No web projects available.</div>
              ) : (
                <>
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredWebProjects.map((project: any) => (
                      <div key={project.id || project.name}>
                        <ProjectCard project={project} />
                      </div>
                    ))}
                </div>
                {hasNextPage && (
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={() => void fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="min-h-11 border border-border bg-snow px-5 py-3 font-body text-sm font-medium text-ink hover:border-olive disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                    >
                      {isFetchingNextPage ? "Loading more projects…" : "Load more projects"}
                    </button>
                  </div>
                )}
                </>
              )}
            </section>
          )}

          {/* GRAPHIC DESIGN TAB */}
          {tab === "design" && (
            <section aria-label="Graphic design projects">
              <div className="mt-6 space-y-5">
                <div>
                  <h2 className="mb-2 font-display text-sm font-semibold text-ink">Browse all services</h2>
                  <button
                    type="button"
                    aria-pressed={selectedDesignCategory === "All"}
                    onClick={() => setSelectedDesignCategory("All")}
                    className={`min-h-10 rounded-xl border px-4 py-2 font-body text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
                      selectedDesignCategory === "All"
                        ? "border-ember bg-ember text-snow font-medium"
                        : "border-border bg-snow text-ink hover:border-ember"
                    }`}
                  >
                    All Graphic Design
                  </button>
                </div>
                {groupedDesignCategories.map((group) => (
                  <div key={group.title}>
                    <h3 className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-ink/65">{group.title}</h3>
                    <div role="group" aria-label={`${group.title} categories`} className="flex flex-wrap gap-2">
                      {group.categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          aria-pressed={selectedDesignCategory === category}
                          onClick={() => setSelectedDesignCategory(category)}
                          className={`min-h-10 rounded-xl border px-4 py-2 font-body text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
                            selectedDesignCategory === category
                              ? "border-ember bg-ember text-snow font-medium"
                              : "border-border bg-snow text-ink hover:border-ember"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {loadingDesigns ? (
                <div className="py-20 text-center font-body text-xs text-[#9A9A9A]">Loading designs...</div>
              ) : designsFailed ? (
                <div className="py-16 text-center" role="alert">
                  <p className="font-body text-sm text-red-700">Design work could not be loaded.</p>
                  <button type="button" onClick={() => void retryDesigns()} className="mt-3 rounded border border-border px-4 py-2 font-body text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember">Retry</button>
                </div>
              ) : filteredDesignProjects.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-border bg-snow px-6 py-10 text-center">
                  <h2 className="font-display text-xl text-ink">
                    {selectedDesignCategory === "All"
                      ? "Graphic design work is being updated."
                      : `Looking for ${selectedDesignCategory}?`}
                  </h2>
                  <p className="mx-auto mt-2 max-w-xl font-body text-sm leading-relaxed text-ink/65">
                    {selectedDesignCategory === "All"
                      ? "Please check back soon, or get in touch to discuss your design needs."
                      : "Get in touch to discuss this service and how it can support your project."}
                  </p>
                  <Link
                    to="/contact"
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-forest px-5 py-2.5 font-body text-sm font-medium text-cream hover:bg-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                  >
                    Ask about this service
                  </Link>
                </div>
              ) : (
                <>
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDesignProjects.map((project: any) => (
                    <div key={project.id || project.name}>
                      <ProjectCard project={project} />
                    </div>
                  ))}
                </div>
                {hasNextDesignPage && (
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={() => void fetchNextDesignPage()}
                      disabled={isFetchingNextDesignPage}
                      className="min-h-11 border border-border bg-snow px-5 py-3 font-body text-sm font-medium text-ink hover:border-olive disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                    >
                      {isFetchingNextDesignPage ? "Loading more designs…" : "Load more designs"}
                    </button>
                  </div>
                )}
                </>
              )}
            </section>
          )}

          {/* PRODUCTS TAB */}
          {tab === "products" && (
            <section aria-label="Digital products and templates">
              {loadingProducts ? (
                <div className="py-20 text-center font-body text-xs text-[#9A9A9A]">Loading store items...</div>
              ) : productsFailed ? (
                <div className="py-16 text-center" role="alert">
                  <p className="font-body text-sm text-red-700">Products could not be loaded.</p>
                  <button type="button" onClick={() => void retryProducts()} className="mt-3 rounded border border-border px-4 py-2 font-body text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember">Retry</button>
                </div>
              ) : products.length === 0 ? (
                <div className="py-20 text-center font-body text-xs text-[#9A9A9A]">No products available.</div>
              ) : (
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8" variants={containerVariants} initial="hidden" animate="show">
                  {products.map((product: any) => {
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
                            <Link to="/contact" className={`inline-flex min-h-11 items-center gap-1.5 font-body text-[12px] font-medium px-3.5 py-2 rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${product.status === "available" ? "bg-ink text-snow" : "border border-border text-[#7A7A7A]"}`}>
                              {product.status === "available" ? "Get this" : "Notify me"}
                            </Link>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </motion.div>
              )}
              {hasNextProductPage && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => void fetchNextProductPage()}
                    disabled={isFetchingNextProductPage}
                    className="min-h-11 border border-border bg-snow px-5 py-3 font-body text-sm font-medium text-ink hover:border-olive disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                  >
                    {isFetchingNextProductPage ? "Loading more products…" : "Load more products"}
                  </button>
                </div>
              )}
            </section>
          )}

          <aside className="mt-16 border-t border-border pt-8 sm:mt-20 sm:pt-10">
            <p className="font-body text-xs font-medium uppercase tracking-widest text-ember">Have something in mind?</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl text-ink sm:text-3xl">Let’s discuss your project.</h2>
                <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-[#4A4A4A]">
                  Get in touch to talk through your goals and the right next step.
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex min-h-11 items-center justify-center self-start bg-forest px-5 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember sm:self-auto"
              >
                Discuss a project
              </Link>
            </div>
          </aside>

        </div>
      </main>
    </>
  );
}