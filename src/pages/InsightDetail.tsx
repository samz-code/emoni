import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Loader2, Clock, Eye, Calendar, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Insight } from "@/types/insight";

// Client-side sanitizer: strips scripts/styles/iframes and inline event handlers
const sanitizeArticleHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, iframe, object, embed").forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.name.startsWith("on")) el.removeAttribute(attr.name);
    });
  });
  return doc.body.innerHTML;
};

const looksLikeHtml = (text: string) => /<[a-z][\s\S]*>/i.test(text);

const InsightDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [related, setRelated] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const loadArticleData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("insights")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .single();

        if (error || !data) {
          setInsight(null);
          setLoading(false);
          return;
        }

        setInsight(data as Insight);

        // Session-cached unique view increment
        const sessionKey = `read_insight_${slug}`;
        if (!sessionStorage.getItem(sessionKey)) {
          await supabase.rpc("increment_insight_readers", { insight_slug: slug });
          sessionStorage.setItem(sessionKey, "true");
          setInsight((prev) => (prev ? { ...prev, readers: (prev.readers || 0) + 1 } : null));
        }

        // Dynamic Related Articles from Supabase
        const { data: relatedData } = await supabase
          .from("insights")
          .select("*")
          .neq("slug", slug)
          .eq("published", true)
          .order("sort_order", { ascending: true })
          .limit(3);

        if (relatedData) setRelated(relatedData as Insight[]);
      } catch (err) {
        console.error("Error loading article from database:", err);
      } finally {
        setLoading(false);
      }
    };

    loadArticleData();
  }, [slug]);

  if (loading) {
    return (
      <main className="bg-paper min-h-screen py-32 flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-ember mb-4" />
        <p className="font-body text-ink/60 text-sm">Fetching article details...</p>
      </main>
    );
  }

  if (!insight) {
    return (
      <>
        <Helmet>
          <title>Article Not Found | Samuel A. Emoni</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <main className="bg-paper min-h-screen py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl text-ink">Article Not Found</h1>
            <p className="font-body text-ink/60 mt-3">This insight article is unavailable or unassigned.</p>
            <Link to="/insights" className="inline-flex items-center gap-2 text-ember font-body text-sm mt-6 font-medium hover:underline">
              <ArrowLeft size={16} /> Return to Insights
            </Link>
          </div>
        </main>
      </>
    );
  }

  const body = insight.body || [];
  const isRichHtmlBody = body.length === 1 && looksLikeHtml(body[0]);

  // SEO dynamic values
  const canonicalUrl = `https://www.emonisamuel.co.ke/insights/${insight.slug}`;
  const pageTitle = `${insight.title} | Samuel A. Emoni`;
  const pageDescription = insight.excerpt || "Read technical insights, architecture patterns, and software development guides by Samuel A. Emoni.";
  const articleImage = insight.image || "https://www.emonisamuel.co.ke/og-image.jpg";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": insight.title,
    "description": pageDescription,
    "url": canonicalUrl,
    "image": articleImage,
    "datePublished": insight.date,
    "dateModified": insight.date,
    "author": {
      "@type": "Person",
      "name": "Samuel A. Emoni",
      "url": "https://www.emonisamuel.co.ke"
    },
    "publisher": {
      "@type": "Person",
      "name": "Samuel A. Emoni",
      "url": "https://www.emonisamuel.co.ke"
    },
    "articleSection": insight.category,
    "keywords": insight.tags ? insight.tags.join(", ") : undefined
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={articleImage} />
        <meta property="article:published_time" content={insight.date} />
        <meta property="article:section" content={insight.category} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={articleImage} />

        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>

      <main className="bg-paper min-h-screen">
        <section className="bg-forest py-12 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Link to="/insights" className="inline-flex items-center gap-2 text-cream/70 font-body text-xs sm:text-sm hover:text-ember transition-colors mb-6">
                <ArrowLeft size={16} /> Back to Insights
              </Link>
              
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-ember text-cream text-xs rounded px-2.5 py-1 font-body font-medium">
                  {insight.category}
                </span>
                {insight.featured && (
                  <span className="bg-cream/20 text-cream text-xs rounded px-2.5 py-1 font-body">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl text-cream leading-tight">
                {insight.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-cream/70 font-body text-xs sm:text-sm mt-6">
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {insight.date}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Clock size={14} /> {insight.read_time}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Eye size={14} /> {(insight.readers || 0).toLocaleString()} reads</span>
              </div>
            </motion.div>
          </div>
        </section>

        {insight.image && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 md:-mt-14">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="overflow-hidden rounded-lg shadow-xl border border-border"
            >
              <img
                src={insight.image}
                alt={insight.title}
                className="w-full h-[22rem] sm:h-[30rem] md:h-[38rem] lg:h-[44rem] object-cover"
              />
            </motion.div>
          </div>
        )}

        <article className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="font-body text-lg sm:text-xl text-ink font-medium leading-relaxed mb-8 border-l-4 border-ember pl-4">
              {insight.excerpt}
            </p>

            {isRichHtmlBody ? (
              <div
                className="insight-body font-body text-sm sm:text-base text-ink/90 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(body[0]) }}
              />
            ) : (
              <div className="space-y-6">
                {body.map((line, idx) => {
                  if (line.startsWith("## ")) {
                    return (
                      <h2 key={idx} className="font-display text-xl sm:text-2xl text-ink mt-8 mb-3 pt-4 border-t border-border">
                        {line.replace(/^##\s/, "")}
                      </h2>
                    );
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <li key={idx} className="font-body text-sm sm:text-base text-ink/80 leading-relaxed list-disc ml-6">
                        {line.replace(/^-\s/, "")}
                      </li>
                    );
                  }
                  return (
                    <p key={idx} className="font-body text-sm sm:text-base text-ink/90 leading-relaxed">
                      {line}
                    </p>
                  );
                })}
              </div>
            )}

            {insight.tags && insight.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-border flex flex-wrap items-center gap-2">
                <Tag size={16} className="text-ink/40 mr-1" />
                {insight.tags.map((tag) => (
                  <span key={tag} className="bg-snow border border-border text-ink/70 text-xs px-3 py-1 rounded-full font-body">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>

        {related.length > 0 && (
          <section className="bg-snow border-t border-border py-12 md:py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-display text-2xl text-ink mb-6">Related Insights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/insights/${item.slug}`}
                    className="bg-paper border border-border rounded-lg p-5 flex flex-col justify-between hover:border-ember transition-colors group shadow-sm"
                  >
                    <div>
                      <span className="text-xs font-body text-ember font-medium uppercase tracking-wider">{item.category}</span>
                      <h3 className="font-display text-lg text-ink mt-2 group-hover:text-ember transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="font-body text-xs text-ink/60 mt-2 line-clamp-2">{item.excerpt}</p>
                    </div>
                    <div className="font-body text-xs text-ink/40 mt-4 pt-4 border-t border-border/50 flex justify-between">
                      <span>{item.date}</span>
                      <span>{item.read_time}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Global CSS Renderer for Editor Content Elements, Templates, and Layouts */}
        <style>{`
          .insight-body h1 { font-size: 1.6rem; font-weight: 700; margin: 2rem 0 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.1); }
          .insight-body h2 { font-size: 1.35rem; font-weight: 700; margin: 2rem 0 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.1); }
          .insight-body h3 { font-size: 1.15rem; font-weight: 600; margin: 1.25rem 0 0.5rem; }
          .insight-body p { margin: 0 0 1.1rem; line-height: 1.7; }
          .insight-body ul { list-style: disc; padding-left: 1.5rem; margin: 0 0 1.1rem; }
          .insight-body ol { list-style: decimal; padding-left: 1.5rem; margin: 0 0 1.1rem; }
          .insight-body li { margin: 0.35rem 0; }
          .insight-body a { color: #b45309; text-decoration: underline; }
          
          /* Custom Callout and Blockquotes */
          .insight-body blockquote {
            border-left: 4px solid #b45309;
            padding: 0.75rem 1rem;
            margin: 1.25rem 0;
            font-style: italic;
            color: rgba(0,0,0,0.8);
            background-color: rgba(180, 83, 9, 0.05);
            border-radius: 0 0.375rem 0.375rem 0;
          }

          /* Responsive Tables */
          .insight-body table, .insight-body .rte-custom-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            font-size: 0.875rem;
            display: table;
            overflow-x: auto;
          }
          .insight-body th, .insight-body td {
            border: 1px solid #d1d5db;
            padding: 10px 14px;
            text-align: left;
          }
          .insight-body th {
            background-color: #f3f4f6;
            font-weight: 600;
          }

          /* Image Mask & Frame Template Support */
          .insight-body img { max-width: 100%; height: auto; }
          .insight-body .shape-mask-wrapper { display: inline-block; margin: 0.75rem 0; max-width: 100%; }
          .insight-body .shape-mask-wrapper img { display: block; object-fit: cover; }
          
          /* Grid & Column Layout Breakdown on Mobile */
          @media (max-width: 768px) {
            .insight-body div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
          }
        `}</style>
      </main>
    </>
  );
};

export default InsightDetail;