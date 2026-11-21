import { useRef, useState, type ReactNode } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import ProjectCard from "@/components/ProjectCard";
import { Package, Palette, FileText, Megaphone, Code, ChevronDown, SlidersHorizontal } from "lucide-react";

const iconMap = { Palette, FileText, Megaphone, Code };

type Tab = "projects" | "design" | "products";
const PROJECT_PAGE_SIZE = 12;
// How many industry filters the Web Projects sidebar shows before "Show all".
const VISIBLE_SECTOR_COUNT = 8;

type SiteSettings = {
  projects_title?: string | null;
  projects_subtitle?: string | null;
};

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

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember";

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-10 rounded-full border px-3.5 py-2 font-body text-[13px] transition-colors active:scale-[0.97] xl:min-h-9 xl:rounded-xl xl:px-3 xl:py-1.5 ${focusRing} ${
        active
          ? "border-ember bg-ember text-snow font-medium"
          : "border-border bg-snow text-ink hover:border-ember"
      }`}
    >
      {children}
    </button>
  );
}

// Mobile/tablet-only button that opens and closes the filter panel (hidden on xl+).
function MobileFilterToggle({
  open,
  onToggle,
  panelId,
  label,
  current,
  count,
}: {
  open: boolean;
  onToggle: () => void;
  panelId: string;
  label: string;
  current: string;
  count: number;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onToggle}
      className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-border bg-paper px-4 py-2 text-left xl:hidden ${focusRing}`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <SlidersHorizontal size={16} className="shrink-0 text-ember" />
        <span className="min-w-0 truncate font-body text-sm text-ink">
          <span className="text-ink/50">{label}: </span>
          <span className="font-medium">{current}</span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="rounded-full bg-ember/10 px-2 py-0.5 font-body text-[11px] font-semibold text-ember">
          {count}
        </span>
        <ChevronDown size={16} className={`text-ink/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </span>
    </button>
  );
}

export default function Projects() {
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const requestedCategory = searchParams.get("category");

  const [tab, setTabState] = useState<Tab>(() =>
    requestedTab === "design" || requestedTab === "products" ? requestedTab : "projects",
  );
  // A category link from a project page (?tab=...&category=...) pre-selects the matching filter.
  const [selectedIndustry, setSelectedIndustry] = useState(() =>
    requestedCategory && requestedTab !== "design" && requestedTab !== "products" ? requestedCategory : "All",
  );
  const [selectedDesignCategory, setSelectedDesignCategory] = useState(() =>
    requestedCategory && requestedTab === "design" ? requestedCategory : "All",
  );

  // Web Projects sidebar: show only the first few industries until "Show all" is pressed.
  const [showAllSectors, setShowAllSectors] = useState(false);

  // Mobile/tablet: whether the filter dropdown panel is open.
  const [filterOpen, setFilterOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Graphic Design sidebar accordion: which service groups are expanded.
  // If a category was requested via the URL, its group starts open; otherwise the first group does.
  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    if (!requestedCategory || requestedTab !== "design") return [DESIGN_CATEGORY_GROUPS[0].title];
    const match = DESIGN_CATEGORY_GROUPS.find((group) =>
      group.categories.some((category) => category.toLocaleLowerCase() === requestedCategory.toLocaleLowerCase()),
    );
    return [match ? match.title : "More Services"];
  });

  const toggleGroup = (title: string) =>
    setOpenGroups((current) =>
      current.includes(title) ? current.filter((item) => item !== title) : [...current, title],
    );

  const setTab = (next: Tab) => {
    setTabState(next);
    setFilterOpen(false);
  };

  // After picking a filter on small screens: close the dropdown and bring the results into view.
  const afterFilterPick = () => {
    setFilterOpen(false);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1279px)").matches) {
      requestAnimationFrame(() => {
        const el = resultsRef.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top, behavior: "smooth" });
      });
    }
  };

  const pickIndustry = (value: string) => {
    setSelectedIndustry(value);
    afterFilterPick();
  };

  const pickDesignCategory = (value: string) => {
    setSelectedDesignCategory(value);
    afterFilterPick();
  };

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

  // Fetch Dynamic Site Settings (typed so projects_title / projects_subtitle resolve correctly)
  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("projects_title,projects_subtitle")
        .single();
      if (error && error.code !== "PGRST116") console.warn("Site settings notice:", error.message);
      return (data as SiteSettings | null) ?? {};
    },
    staleTime: 60_000,
  });

  const dynamicSectors: string[] = [
    "All",
    ...Array.from(
      new Set(
        webProjects
          .flatMap((p: any) => [p.sector, ...p.categories])
          .filter((value: unknown): value is string => typeof value === "string" && Boolean(value)),
      ),
    ),
  ];
  // Keep the requested category visible even before its project page has loaded.
  if (selectedIndustry !== "All" && !dynamicSectors.includes(selectedIndustry)) {
    dynamicSectors.push(selectedIndustry);
  }

  // Sidebar list for Web Projects (everything except the "All" button).
  const sectorOptions = dynamicSectors.filter((sector) => sector !== "All");
  const hiddenSectorCount = Math.max(0, sectorOptions.length - VISIBLE_SECTOR_COUNT);
  const visibleSectors = showAllSectors
    ? sectorOptions
    : (() => {
        const firstFew = sectorOptions.slice(0, VISIBLE_SECTOR_COUNT);
        // Never hide the currently selected industry.
        if (selectedIndustry !== "All" && sectorOptions.includes(selectedIndustry) && !firstFew.includes(selectedIndustry)) {
          firstFew.push(selectedIndustry);
        }
        return firstFew;
      })();

  const availableDesignCategories = Array.from(new Set(
    designRows.flatMap((d: any) => [d.category, ...(Array.isArray(d.categories) ? d.categories : [])])
      .filter((category): category is string => typeof category === "string" && Boolean(category.trim())),
  ));
  const groupedDesignCategories = DESIGN_CATEGORY_GROUPS.map((group) => ({ ...group, categories: [...group.categories] }));
  const knownDesignCategories = new Set(groupedDesignCategories.flatMap((group) => group.categories.map((category) => category.toLocaleLowerCase())));
  const additionalDesignCategories = availableDesignCategories.filter((category) =>
    !knownDesignCategories.has(category.toLocaleLowerCase()) && category.toLocaleLowerCase() !== "all",
  );
  if (
    selectedDesignCategory !== "All" &&
    !knownDesignCategories.has(selectedDesignCategory.toLocaleLowerCase()) &&
    !additionalDesignCategories.some((category) => category.toLocaleLowerCase() === selectedDesignCategory.toLocaleLowerCase())
  ) {
    additionalDesignCategories.push(selectedDesignCategory);
  }
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
        {/* Web Projects and Graphic Design are widened on xl screens only, to make room for the
            right-hand filter column while keeping the cards the same size. Products keeps max-w-6xl. */}
        <div
          className={`mx-auto px-4 sm:px-6 lg:px-8 ${
            tab === "products" ? "max-w-6xl" : "max-w-6xl xl:max-w-[1440px]"
          }`}
        >

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
                className={`min-h-11 whitespace-nowrap border-b-2 pb-2 font-body text-sm transition-colors ${focusRing} ${
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
              {/* Mobile/tablet: filter dropdown sits above the cards. xl+: two columns, cards left, filter right. */}
              <div className="flex flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_260px] xl:gap-8">

                {/* Cards column (card sizes unchanged) */}
                <div ref={resultsRef} className="min-w-0">
                  {loadingProjects ? (
                    <div className="py-20 text-center font-body text-xs text-[#9A9A9A]">Loading projects...</div>
                  ) : projectsFailed ? (
                    <div className="py-16 text-center" role="alert">
                      <p className="font-body text-sm text-red-700">Projects could not be loaded.</p>
                      <button type="button" onClick={() => void retryProjects()} className={`mt-3 rounded border border-border px-4 py-2 font-body text-sm ${focusRing}`}>Retry</button>
                    </div>
                  ) : filteredWebProjects.length === 0 ? (
                    <div className="py-20 text-center font-body text-xs text-[#9A9A9A]">No web projects available.</div>
                  ) : (
                    <>
                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:mt-8">
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
                          className={`min-h-11 border border-border bg-snow px-5 py-3 font-body text-sm font-medium text-ink hover:border-olive disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
                        >
                          {isFetchingNextPage ? "Loading more projects…" : "Load more projects"}
                        </button>
                      </div>
                    )}
                    </>
                  )}
                </div>

                {/* Filter: dropdown on mobile/tablet, right-hand column on xl+ */}
                <aside
                  aria-label="Browse web projects by industry"
                  className="order-first mt-6 rounded-2xl border border-border bg-snow p-3 shadow-sm xl:order-none xl:mt-8 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:self-start xl:overflow-y-auto xl:p-4 xl:shadow-none"
                >
                  <MobileFilterToggle
                    open={filterOpen}
                    onToggle={() => setFilterOpen((current) => !current)}
                    panelId="web-filter-panel"
                    label="Industry"
                    current={selectedIndustry === "All" ? "All Web Projects" : selectedIndustry}
                    count={filteredWebProjects.length}
                  />

                  <div
                    id="web-filter-panel"
                    className={`${filterOpen ? "mt-3 block" : "hidden"} max-h-[60vh] overflow-y-auto xl:mt-0 xl:block xl:max-h-none xl:overflow-visible`}
                  >
                    <h2 className="mb-3 hidden font-display text-sm font-semibold uppercase tracking-wider text-ink xl:block">
                      Browse by industry
                    </h2>

                    <button
                      type="button"
                      aria-pressed={selectedIndustry === "All"}
                      onClick={() => pickIndustry("All")}
                      className={`min-h-11 w-full rounded-xl border px-4 py-2 text-left font-body text-sm transition-colors xl:min-h-10 ${focusRing} ${
                        selectedIndustry === "All"
                          ? "border-ember bg-ember text-snow font-medium"
                          : "border-border bg-snow text-ink hover:border-ember"
                      }`}
                    >
                      All Web Projects
                    </button>

                    {sectorOptions.length > 0 && (
                      <div role="group" aria-label="Filter by industry" className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                        {visibleSectors.map((sec) => (
                          <FilterChip
                            key={sec}
                            active={selectedIndustry === sec}
                            onClick={() => pickIndustry(sec)}
                          >
                            {sec}
                          </FilterChip>
                        ))}
                      </div>
                    )}

                    {hiddenSectorCount > 0 && (
                      <button
                        type="button"
                        aria-expanded={showAllSectors}
                        onClick={() => setShowAllSectors((current) => !current)}
                        className={`mt-3 inline-flex min-h-10 items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wider text-ink/65 hover:text-ink xl:min-h-9 ${focusRing}`}
                      >
                        {showAllSectors ? "Show fewer" : `Show all (${sectorOptions.length})`}
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${showAllSectors ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>
                </aside>
              </div>
            </section>
          )}

          {/* GRAPHIC DESIGN TAB */}
          {tab === "design" && (
            <section aria-label="Graphic design projects">
              {/* Mobile/tablet: filter dropdown sits above the cards. xl+: two columns, cards left, filter right. */}
              <div className="flex flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_260px] xl:gap-8">

                {/* Cards column */}
                <div ref={resultsRef} className="min-w-0">
                  {loadingDesigns ? (
                    <div className="py-20 text-center font-body text-xs text-[#9A9A9A]">Loading designs...</div>
                  ) : designsFailed ? (
                    <div className="py-16 text-center" role="alert">
                      <p className="font-body text-sm text-red-700">Design work could not be loaded.</p>
                      <button type="button" onClick={() => void retryDesigns()} className={`mt-3 rounded border border-border px-4 py-2 font-body text-sm ${focusRing}`}>Retry</button>
                    </div>
                  ) : filteredDesignProjects.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-border bg-snow px-6 py-10 text-center xl:mt-8">
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
                        className={`mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-forest px-5 py-2.5 font-body text-sm font-medium text-cream hover:bg-forest/90 ${focusRing}`}
                      >
                        Ask about this service
                      </Link>
                    </div>
                  ) : (
                    <>
                    {/* 2 columns. Each card is held to a 736 x 900 proportion and never wider than 736px. */}
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:mt-8">
                      {filteredDesignProjects.map((project: any) => (
                        <div
                          key={project.id || project.name}
                          className="mx-auto aspect-[736/900] w-full max-w-[736px] overflow-hidden [&>*]:h-full"
                        >
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
                          className={`min-h-11 border border-border bg-snow px-5 py-3 font-body text-sm font-medium text-ink hover:border-olive disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
                        >
                          {isFetchingNextDesignPage ? "Loading more designs…" : "Load more designs"}
                        </button>
                      </div>
                    )}
                    </>
                  )}
                </div>

                {/* Filter: dropdown on mobile/tablet, right-hand column on xl+ */}
                <aside
                  aria-label="Browse all services"
                  className="order-first mt-6 rounded-2xl border border-border bg-snow p-3 shadow-sm xl:order-none xl:mt-8 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:self-start xl:overflow-y-auto xl:p-4 xl:shadow-none"
                >
                  <MobileFilterToggle
                    open={filterOpen}
                    onToggle={() => setFilterOpen((current) => !current)}
                    panelId="design-filter-panel"
                    label="Service"
                    current={selectedDesignCategory === "All" ? "All Graphic Design" : selectedDesignCategory}
                    count={filteredDesignProjects.length}
                  />

                  <div
                    id="design-filter-panel"
                    className={`${filterOpen ? "mt-3 block" : "hidden"} max-h-[60vh] overflow-y-auto xl:mt-0 xl:block xl:max-h-none xl:overflow-visible`}
                  >
                    <h2 className="mb-3 hidden font-display text-sm font-semibold uppercase tracking-wider text-ink xl:block">
                      Browse all services
                    </h2>

                    <button
                      type="button"
                      aria-pressed={selectedDesignCategory === "All"}
                      onClick={() => pickDesignCategory("All")}
                      className={`min-h-11 w-full rounded-xl border px-4 py-2 text-left font-body text-sm transition-colors xl:min-h-10 ${focusRing} ${
                        selectedDesignCategory === "All"
                          ? "border-ember bg-ember text-snow font-medium"
                          : "border-border bg-snow text-ink hover:border-ember"
                      }`}
                    >
                      All Graphic Design
                    </button>

                    <div className="mt-3 divide-y divide-border border-t border-border">
                      {groupedDesignCategories.map((group, index) => {
                        const isOpen = openGroups.includes(group.title);
                        const hasSelected = group.categories.some(
                          (category) => category.toLocaleLowerCase() === selectedDesignCategory.toLocaleLowerCase(),
                        );
                        const panelId = `design-group-${index}`;

                        return (
                          <div key={group.title}>
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              aria-controls={panelId}
                              onClick={() => toggleGroup(group.title)}
                              className={`flex min-h-12 w-full items-center justify-between gap-2 py-2 text-left xl:min-h-11 ${focusRing}`}
                            >
                              <span className="font-body text-xs font-semibold uppercase tracking-wider text-ink/65">
                                {group.title}
                                <span className="ml-1.5 font-normal text-ink/40">({group.categories.length})</span>
                              </span>
                              <span className="flex items-center gap-2">
                                {hasSelected && (
                                  <span className="h-2 w-2 rounded-full bg-ember" aria-label="Contains selected category" />
                                )}
                                <ChevronDown
                                  size={16}
                                  className={`text-ink/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                />
                              </span>
                            </button>

                            <div
                              id={panelId}
                              role="group"
                              aria-label={`${group.title} categories`}
                              className={`${isOpen ? "flex" : "hidden"} flex-wrap gap-2 pb-3 pt-1`}
                            >
                              {group.categories.map((category) => (
                                <FilterChip
                                  key={category}
                                  active={selectedDesignCategory.toLocaleLowerCase() === category.toLocaleLowerCase()}
                                  onClick={() => pickDesignCategory(category)}
                                >
                                  {category}
                                </FilterChip>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </aside>
              </div>
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
                  <button type="button" onClick={() => void retryProducts()} className={`mt-3 rounded border border-border px-4 py-2 font-body text-sm ${focusRing}`}>Retry</button>
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
                            <Link to="/contact" className={`inline-flex min-h-11 items-center gap-1.5 font-body text-[12px] font-medium px-3.5 py-2 rounded-[4px] ${focusRing} ${product.status === "available" ? "bg-ink text-snow" : "border border-border text-[#7A7A7A]"}`}>
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
                    className={`min-h-11 border border-border bg-snow px-5 py-3 font-body text-sm font-medium text-ink hover:border-olive disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
                  >
                    {isFetchingNextProductPage ? "Loading more products…" : "Load more products"}
                  </button>
                </div>
              )}
            </section>
          )}

        </div>
      </main>
    </>
  );
}