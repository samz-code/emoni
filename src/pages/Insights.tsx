import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import InsightCard from "@/components/InsightCard";
import { supabase } from "@/lib/supabase";
import type { InsightPreview } from "@/types/insight";
import { Loader2 } from "lucide-react";

const Insights = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const {
    data: insights = [],
    isLoading: loading,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ["public-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insights")
        .select("slug,title,category,read_time,excerpt,date,author,image,tags,featured")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as InsightPreview[];
    },
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const categories = useMemo(() => {
    const unique = new Set<string>();
    insights.forEach((insight) => {
      if (insight.category) unique.add(insight.category);
      insight.tags?.forEach((tag) => unique.add(tag));
    });
    return ["All", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [insights]);

  const filteredInsights =
    selectedCategory === "All"
      ? insights
      : insights.filter(
          (insight) => insight.category === selectedCategory || insight.tags?.includes(selectedCategory)
        );

  const featured = filteredInsights.find((i) => i.featured) || filteredInsights[0];
  const rest = filteredInsights.filter((i) => i.slug !== featured?.slug);

  // SEO
  const canonicalUrl = "https://www.emonisamuel.co.ke/insights";
  const pageTitle =
    selectedCategory === "All"
      ? "Insights & Perspectives | Samuel A. Emoni"
      : `${selectedCategory} Articles & Insights | Samuel A. Emoni`;
  const pageDescription =
    "Deep dives into digital systems, software architecture, emerging technologies, and building digital solutions in Africa and beyond.";
  const ogImage = "https://www.emonisamuel.co.ke/og-image.jpg";

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    publisher: { "@type": "Person", name: "Samuel A. Emoni", url: "https://www.emonisamuel.co.ke" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: filteredInsights.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://www.emonisamuel.co.ke/insights/${item.slug}`,
        name: item.title,
      })),
    },
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
      </Helmet>

      <main className="bg-paper">
        {/* Page header */}
        <header className="border-b border-border bg-snow py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl normal-case leading-tight text-ink sm:text-5xl">Insights</h1>
            <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-[#4A4A4A] sm:text-lg">
              Notes on digital systems, emerging technologies, and building technology solutions in Africa and beyond.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {/* Topic filter */}
          <nav aria-label="Filter articles by topic" className="mb-10 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
                className={`shrink-0 rounded-full border px-4 py-2 font-body text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
                  selectedCategory === category
                    ? "border-forest bg-forest text-cream"
                    : "border-border bg-snow text-ink hover:border-olive"
                }`}
              >
                {category}
              </button>
            ))}
          </nav>

          {loading && (
            <div className="py-20 text-center">
              <Loader2 size={28} className="mx-auto mb-4 animate-spin text-ember" aria-hidden="true" />
              <p className="font-body text-sm text-ink/60">Loading articles…</p>
            </div>
          )}

          {!loading && loadError && (
            <div className="py-16 text-center" role="alert">
              <p className="font-body text-sm text-red-700">Articles could not be loaded. Please try again.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-4 rounded border border-border bg-snow px-4 py-2 font-body text-sm text-ink hover:border-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !loadError && (
            <>
              {featured && (
                <section aria-label="Featured article" className="mb-16">
                  <InsightCard insight={featured} featured />
                </section>
              )}

              <section aria-labelledby="latest-heading">
                <div className="mb-8 flex items-baseline justify-between border-b border-border pb-3">
                  <h2 id="latest-heading" className="font-display text-xl text-ink">
                    {selectedCategory === "All" ? "Latest articles" : `${selectedCategory} articles`}
                  </h2>
                  <span className="font-body text-sm text-ink/55">
                    {filteredInsights.length} {filteredInsights.length === 1 ? "article" : "articles"}
                  </span>
                </div>

                {rest.length > 0 ? (
                  <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((insight) => (
                      <InsightCard key={insight.slug} insight={insight} />
                    ))}
                  </div>
                ) : (
                  <p className="py-12 text-center font-body text-base text-ink/70">
                    {featured ? "That's the only article in this topic so far." : "No articles found in this topic."}
                  </p>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default Insights;