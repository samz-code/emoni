import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { insights } from "@/data/insights";

const InsightDetail = () => {
  const { slug } = useParams();
  const insight = insights.find((i) => i.slug === slug);

  const [views, setViews] = useState(insight?.readers || 0);

  useEffect(() => {
    if (!insight || typeof window === "undefined") {
      return;
    }

    try {
      const storageKey = "insightViews";
      const stored = window.localStorage.getItem(storageKey);
      const counts = stored ? JSON.parse(stored) : {};
      const current = Number(counts[insight.slug] || 0);
      const next = current + 1;
      const updated = { ...counts, [insight.slug]: next };
      window.localStorage.setItem(storageKey, JSON.stringify(updated));
      setViews((insight.readers || 0) + next);
    } catch {
      setViews(insight.readers || 0);
    }
  }, [insight]);

  if (!insight) {
    return (
      <main className="bg-paper py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-[42px] text-ink">Article not found</h1>
          <Link to="/insights" className="text-ember font-body text-sm mt-6 inline-block hover:underline">
            ← Back to Insights
          </Link>
        </div>
      </main>
    );
  }

  const related = insights.filter((i) => i.slug !== insight.slug).slice(0, 3);

  return (
    <main className="bg-paper">
      {/* Header */}
      <section className="bg-forest py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 text-cream/70 font-body text-sm hover:text-ember transition-colors"
            >
              <ArrowLeft size={14} /> All Insights
            </Link>
            {insight.image && (
              <div className="mt-6 mb-6 overflow-hidden rounded-[8px]">
                <img
                  src={insight.image}
                  alt={insight.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}
            <span className="inline-block bg-cream/10 text-cream text-xs rounded-[4px] px-2 py-1 font-body mt-6">
              {insight.category}
            </span>
            <h1 className="font-display text-[40px] md:text-[48px] text-cream mt-4 leading-tight">
              {insight.title}
            </h1>
            <p className="font-body text-[13px] text-cream/60 mt-4">
              {insight.date} · {insight.readTime} · {views.toLocaleString()} reads
            </p>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <article className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-body text-xl text-ink leading-relaxed mb-10">
            {insight.excerpt}
          </p>
          <div className="space-y-5">
            {insight.body.map((line, idx) => {
              if (line.startsWith("## ")) {
                return (
                  <h2
                    key={idx}
                    className="font-display text-[28px] text-ink mt-10 mb-2 leading-tight"
                  >
                    {line.replace(/^##\s/, "")}
                  </h2>
                );
              }
              if (line.startsWith("- ")) {
                // Group consecutive bullets
                return (
                  <li
                    key={idx}
                    className="font-body text-base text-[#3A3A3A] leading-relaxed list-disc ml-6"
                  >
                    {line.replace(/^-\s/, "")}
                  </li>
                );
              }
              return (
                <p
                  key={idx}
                  className="font-body text-base text-[#3A3A3A] leading-relaxed"
                >
                  {line}
                </p>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 bg-snow border border-[#E0DAD0] rounded-[4px] p-8">
            <h3 className="font-display text-[24px] text-ink">
              Have a project in mind?
            </h3>
            <p className="font-body text-[15px] text-[#4A4A4A] mt-2 max-w-lg">
              I work with businesses and institutions across East Africa to
              design and build digital systems that work.
            </p>
            <Link
              to="/contact"
              className="inline-block mt-5 bg-ember text-snow text-sm font-body font-medium rounded-[4px] px-5 py-3 hover:opacity-90 transition-opacity"
            >
              Start a Project →
            </Link>
          </div>
        </div>
      </article>

      {/* Related */}
      <section className="bg-snow border-t border-[#E0DAD0] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-[28px] text-ink">Related reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/insights/${r.slug}`}
                className="bg-paper border border-[#E0DAD0] rounded-[4px] p-5 block hover:border-olive transition-colors"
              >
                <span className="inline-block bg-forest text-cream text-xs rounded-[4px] px-2 py-1 font-body">
                  {r.category}
                </span>
                <h3 className="font-display text-[20px] text-ink mt-3 leading-snug">
                  {r.title}
                </h3>
                <p className="font-body text-[12px] text-[#9A9A9A] mt-3">
                  {r.date} · {r.readTime}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default InsightDetail;
