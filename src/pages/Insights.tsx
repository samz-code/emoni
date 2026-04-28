import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import InsightCard from "@/components/InsightCard";
import { insights } from "@/data/insights";
import { BookOpen, Users, TrendingUp, Filter } from "lucide-react";

const categories = ["All", "Engineering", "Business", "GovTech", "Design", "AI & Automation", "Blockchain", "UX/UI Design", "Entrepreneurship", "Remote Work", "Sustainability", "FinTech", "Security", "Marketing"];

const Insights = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [totalReaders, setTotalReaders] = useState(0);

  useEffect(() => {
    const baseReaders = insights.reduce((sum, insight) => sum + (insight.readers || 0), 0);
    let storedReaders = 0;

    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem("insightViews");
        const counts: Record<string, number> = stored ? JSON.parse(stored) : {};
        storedReaders = Object.values(counts).reduce((sum: number, value: number) => sum + value, 0);
      } catch {
        storedReaders = 0;
      }
    }

    setTotalReaders(baseReaders + storedReaders);
  }, []);

  const filteredInsights = selectedCategory === "All"
    ? insights
    : insights.filter(insight => insight.category === selectedCategory || insight.tags?.includes(selectedCategory));

  const featured = filteredInsights[0];
  const rest = filteredInsights.slice(1);

  const dotPattern = `data:image/svg+xml,${encodeURIComponent('<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="#ffffff" fill-opacity="0.05"><circle cx="30" cy="30" r="4"/></g></g></svg>')}`;

  return (
    <main className="bg-paper">
      {/* Animated Banner */}
      <div
        className="relative overflow-hidden bg-[#E77E23] py-24"
        style={{
          backgroundImage: `linear-gradient(rgba(231, 126, 35, 0.9), rgba(231, 126, 35, 0.9)), url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'multiply'
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url('${dotPattern}')` }}
        />

        {/* Floating Elements */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-16 h-16 bg-ember/20 rounded-full"
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-12 h-12 bg-olive/30 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block mb-4"
            >
              <BookOpen size={64} className="text-cream mx-auto" />
            </motion.div>
            <h1 className="font-display text-[48px] md:text-[64px] text-cream leading-tight">
              Insights & Perspectives
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-body text-xl text-cream/80 max-w-3xl mx-auto mt-6 leading-relaxed"
            >
              Deep dives into digital systems, emerging technologies, and building technology solutions in Africa and beyond.
            </motion.p>
          </motion.div>

          {/* Stats Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 mt-12"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={24} className="text-ember" />
                <div>
                  <div className="text-2xl font-bold text-cream">{insights.length}</div>
                  <div className="text-sm text-cream/70">Articles</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20"
            >
              <div className="flex items-center gap-3">
                <Users size={24} className="text-ember" />
                <div>
                  <div className="text-2xl font-bold text-cream">{totalReaders.toLocaleString()}</div>
                  <div className="text-sm text-cream/70">Readers</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20"
            >
              <div className="flex items-center gap-3">
                <TrendingUp size={24} className="text-ember" />
                <div>
                  <div className="text-2xl font-bold text-cream">{categories.length - 1}</div>
                  <div className="text-sm text-cream/70">Topics</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Filter size={20} className="text-olive" />
            <h2 className="font-display text-2xl text-ink">Explore Topics</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full font-body text-sm transition-all ${
                  selectedCategory === category
                    ? "bg-ember text-cream shadow-lg"
                    : "bg-snow border border-border text-ink hover:border-olive hover:bg-olive/5"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Featured Article */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mb-16"
          >
            <h2 className="font-display text-3xl text-ink mb-8">Featured Article</h2>
            <InsightCard insight={featured} featured />
          </motion.div>
        )}

        {/* Articles Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="font-display text-3xl text-ink mb-8">
            {selectedCategory === "All" ? "Latest Articles" : `${selectedCategory} Articles`}
          </h2>

          {rest.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((insight, i) => (
                <motion.div
                  key={insight.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + i * 0.05 }}
                >
                  <InsightCard insight={insight} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen size={48} className="text-olive/40 mx-auto mb-4" />
              <p className="text-lg text-ink/60">No articles found in this category yet.</p>
              <p className="text-sm text-ink/40 mt-2">Check back soon for new content!</p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
};

export default Insights;