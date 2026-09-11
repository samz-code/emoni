import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import InsightCard from "@/components/InsightCard";
import { supabase } from "@/lib/supabase";
import type { Insight } from "@/types/insight";
import { BookOpen, Users, TrendingUp, Filter, Loader2 } from "lucide-react";

const Insights = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [totalReaders, setTotalReaders] = useState(0);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { data, error } = await supabase
          .from("insights")
          .select("*")
          .eq("published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false });

        if (error) throw error;

        const fetched = (data || []) as Insight[];
        setInsights(fetched);
        setTotalReaders(fetched.reduce((sum, insight) => sum + (insight.readers || 0), 0));
      } catch (err: any) {
        console.error("Error fetching insights from database:", err);
        setLoadError(err.message || "Failed to load articles from the database.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    insights.forEach((insight) => {
      if (insight.category) unique.add(insight.category);
      insight.tags?.forEach((tag) => unique.add(tag));
    });
    return ["All", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [insights]);

  const filteredInsights = selectedCategory === "All"
    ? insights
    : insights.filter(insight => insight.category === selectedCategory || insight.tags?.includes(selectedCategory));

  const explicitFeatured = filteredInsights.find((i) => i.featured);
  const featured = explicitFeatured || filteredInsights[0];
  const rest = filteredInsights.filter((i) => i.slug !== featured?.slug);

  const dotPattern = `data:image/svg+xml,${encodeURIComponent('<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="#ffffff" fill-opacity="0.05"><circle cx="30" cy="30" r="4"/></g></g></svg>')}`;

  const canonicalUrl = "https://www.emonisamuel.co.ke/insights";
  const pageTitle = selectedCategory === "All" 
    ? "Insights & Perspectives | Samuel A. Emoni" 
    : `${selectedCategory} Articles & Insights | Samuel A. Emoni`;
  const pageDescription = "Deep dives into digital systems, software architecture, emerging technologies, and building digital solutions in Africa and beyond.";
  const ogImage = "https://www.emonisamuel.co.ke/og-image.jpg";

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": canonicalUrl,
    "publisher": {
      "@type": "Person",
      "name": "Samuel A. Emoni",
      "url": "https://www.emonisamuel.co.ke"
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": filteredInsights.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://www.emonisamuel.co.ke/insights/${item.slug}`,
        "name": item.title
      }))
    }
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

        <script type="application/ld+json">
          {JSON.stringify(collectionSchema)}
        </script>
      </Helmet>

      <main className="bg-paper overflow-x-hidden min-h-screen">
        {/* Animated Banner */}
        <div
          className="relative overflow-hidden bg-[#E77E23] py-12 sm:py-20 md:py-24"
          style={{
            backgroundImage: `linear-gradient(rgba(231, 126, 35, 0.9), rgba(231, 126, 35, 0.9)), url('/blog.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'multiply'
          }}
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: `url('${dotPattern}')` }}
          />

          {/* Floating Background Elements - Hidden on small screens to prevent layout shifting */}
          <motion.div
            className="hidden sm:block absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full pointer-events-none"
            animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="hidden sm:block absolute bottom-10 right-10 w-16 h-16 bg-ember/20 rounded-full pointer-events-none"
            animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="hidden sm:block absolute top-1/2 left-1/4 w-12 h-12 bg-olive/30 rounded-full pointer-events-none"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6 sm:mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block mb-3 sm:mb-4"
              >
                <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-cream mx-auto" />
              </motion.div>
              <h1 className="font-display text-3xl sm:text-5xl md:text-[64px] text-cream leading-tight break-words px-2">
                Insights & Perspectives
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-body text-base sm:text-xl text-cream/80 max-w-3xl mx-auto mt-4 sm:mt-6 leading-relaxed px-2"
              >
                Deep dives into digital systems, emerging technologies, and building technology solutions in Africa and beyond.
              </motion.p>
            </motion.div>

            {/* Stats Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto mt-8 sm:mt-12"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:px-6 sm:py-4 border border-white/20 flex items-center justify-center min-w-0"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <BookOpen size={20} className="text-ember shrink-0 sm:w-6 sm:h-6" />
                  <div className="text-left min-w-0">
                    <div className="text-lg sm:text-2xl font-bold text-cream truncate">{insights.length}</div>
                    <div className="text-xs sm:text-sm text-cream/70 truncate">Articles</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:px-6 sm:py-4 border border-white/20 flex items-center justify-center min-w-0"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <Users size={20} className="text-ember shrink-0 sm:w-6 sm:h-6" />
                  <div className="text-left min-w-0">
                    <div className="text-lg sm:text-2xl font-bold text-cream truncate">{totalReaders.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-cream/70 truncate">Readers</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:px-6 sm:py-4 border border-white/20 flex items-center justify-center min-w-0"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <TrendingUp size={20} className="text-ember shrink-0 sm:w-6 sm:h-6" />
                  <div className="text-left min-w-0">
                    <div className="text-lg sm:text-2xl font-bold text-cream truncate">{Math.max(0, categories.length - 1)}</div>
                    <div className="text-xs sm:text-sm text-cream/70 truncate">Topics</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-8 sm:mb-12"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
              <Filter size={18} className="text-olive sm:w-5 sm:h-5" />
              <h2 className="font-display text-xl sm:text-2xl text-ink">Explore Topics</h2>
            </div>

            {/* Horizontal Scroll / Flex Wrap Pills */}
            <div className="flex flex-wrap gap-2 sm:gap-3 max-w-full">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-body text-xs sm:text-sm transition-all break-words max-w-full ${
                    selectedCategory === category
                      ? "bg-ember text-cream shadow-md"
                      : "bg-snow border border-border text-ink hover:border-olive hover:bg-olive/5"
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16 sm:py-20">
              <Loader2 size={36} className="animate-spin text-ember mx-auto mb-4" />
              <p className="font-body text-ink/60 text-xs sm:text-sm">Fetching articles from the database...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && loadError && (
            <div className="text-center py-16 sm:py-20 px-4">
              <p className="font-body text-red-600 text-xs sm:text-sm">{loadError}</p>
              <p className="font-body text-ink/40 text-xs mt-2">Please refresh the page or try again shortly.</p>
            </div>
          )}

          {!loading && !loadError && (
            <>
              {/* Featured Article */}
              {featured && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="mb-10 sm:mb-16 min-w-0"
                >
                  <h2 className="font-display text-2xl sm:text-3xl text-ink mb-4 sm:mb-8">Featured Article</h2>
                  <div className="w-full min-w-0 overflow-hidden">
                    <InsightCard insight={featured} featured />
                  </div>
                </motion.div>
              )}

              {/* Articles Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="min-w-0"
              >
                <h2 className="font-display text-2xl sm:text-3xl text-ink mb-6 sm:mb-8">
                  {selectedCategory === "All" ? "Latest Articles" : `${selectedCategory} Articles`}
                </h2>

                {rest.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {rest.map((insight, i) => (
                      <motion.div
                        key={insight.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.9 + i * 0.05 }}
                        className="w-full min-w-0"
                      >
                        <InsightCard insight={insight} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <BookOpen size={40} className="text-olive/40 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg text-ink/60">No articles found in this category yet.</p>
                    <p className="text-xs sm:text-sm text-ink/40 mt-1 sm:mt-2">Check back soon for new content!</p>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default Insights;