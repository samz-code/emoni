import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Loader2, Clock, Eye, Calendar, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Insight } from "@/types/insight";

const sanitizeArticleHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, iframe, object, embed, svg, math, form, input, button, base, meta, link").forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || ["srcdoc", "srcset", "formaction", "xlink:href"].includes(name)) {
        el.removeAttribute(attr.name);
      }

      if (name === "style" && /url\s*\(|expression\s*\(|@import|behavior\s*:/i.test(attr.value)) {
        el.removeAttribute(attr.name);
      }

      if (name === "href" || name === "src") {
        const value = attr.value.trim();
        try {
          const url = new URL(value, window.location.origin);
          const allowedProtocols = name === "src"
            ? ["http:", "https:"]
            : ["http:", "https:", "mailto:", "tel:"];
          if (!allowedProtocols.includes(url.protocol)) el.removeAttribute(attr.name);
        } catch {
          el.removeAttribute(attr.name);
        }
      }
    });

    if (el instanceof HTMLAnchorElement && el.target === "_blank") {
      el.rel = "noopener noreferrer";
    }
  });
  return doc.body.innerHTML;
};

const looksLikeHtml = (text: string) => /<[a-z][\s\S]*>/i.test(text);
type RelatedInsight = Pick<Insight, "slug" | "title" | "category" | "read_time" | "excerpt" | "date" | "image">;

const InsightDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [related, setRelated] = useState<RelatedInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    setInsight(null);
    setRelated([]);
    setLoadError(false);

    if (!slug) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    const loadArticleData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("insights")
          .select("id,slug,title,category,read_time,excerpt,date,author,image,body,readers,tags,featured,published,sort_order,created_at,updated_at")
          .eq("slug", slug)
          .eq("published", true)
          .single();

        if (error?.code === "PGRST116") {
          return;
        }
        if (error) throw error;
        if (!data) return;
        if (!active) return;

        setInsight(data as Insight);
        setLoading(false);

        void Promise.resolve()
          .then(async () => {
            const { data: relatedData, error: relatedError } = await supabase
              .from("insights")
              .select("slug,title,category,read_time,excerpt,date,image")
              .neq("slug", slug)
              .eq("published", true)
              .order("sort_order", { ascending: true })
              .limit(3);
            if (relatedError) throw relatedError;
            if (active && relatedData) setRelated(relatedData);
          })
          .catch((error: unknown) => {
            console.error("Error loading related insights:", error);
          });

        const sessionKey = `read_insight_${slug}`;
        let alreadyViewed = false;
        try {
          alreadyViewed = sessionStorage.getItem(sessionKey) !== null;
          if (!alreadyViewed) sessionStorage.setItem(sessionKey, "pending");
        } catch (error) {
          console.error("Unable to access session storage for article view tracking:", error);
        }

        if (!alreadyViewed) {
          void Promise.resolve()
            .then(async () => {
              const { error } = await supabase.rpc("increment_insight_readers", { insight_slug: slug });
              if (error) throw error;
              try {
                sessionStorage.setItem(sessionKey, "true");
              } catch (storageError) {
                console.error("Unable to save article view tracking state:", storageError);
              }
              if (active) {
                setInsight((prev) => (prev ? { ...prev, readers: (prev.readers || 0) + 1 } : null));
              }
            })
            .catch((error: unknown) => {
              try {
                sessionStorage.removeItem(sessionKey);
              } catch (storageError) {
                console.error("Unable to clear article view tracking state:", storageError);
              }
              console.error("Error recording article view:", error);
            });
        }
      } catch (error) {
        if (active) setLoadError(true);
        console.error("Error loading article from database:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadArticleData();
    return () => {
      active = false;
    };
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
            <p className="font-body text-ink/60 mt-3">
              {loadError ? "The article could not be loaded. Please try again later." : "This insight article is unavailable or unassigned."}
            </p>
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
      "name": insight.author || "Samuel A. Emoni",
      ...(insight.author ? {} : { "url": "https://www.emonisamuel.co.ke" })
    },
    "publisher": {
      "@type": "Person",
      "name": "Samuel A. Emoni",
      "url": "https://www.emonisamuel.co.ke"
    },
    "articleSection": insight.category,
    "keywords": insight.tags ? insight.tags.join(", ") : undefined
  };

  const hasTags = Boolean(insight.tags && insight.tags.length > 0);

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

      <main className="bg-paper min-h-screen overflow-x-hidden">
        {/* HERO: title + meta on the left, cover image on the right (stacks on mobile) */}
        <section className="bg-forest py-8 sm:py-12 lg:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={
                insight.image
                  ? "grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
                  : "max-w-4xl"
              }
            >
              <div className={insight.image ? "lg:col-span-6 xl:col-span-5 min-w-0" : "min-w-0"}>
                <Link to="/insights" className="inline-flex items-center gap-2 text-cream/70 font-body text-xs sm:text-sm hover:text-ember transition-colors mb-6">
                  <ArrowLeft size={16} /> Back to Insights
                </Link>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {insight.category && (
                    <span className="bg-ember text-cream text-xs rounded px-2.5 py-1 font-body font-medium">
                      {insight.category}
                    </span>
                  )}
                  {insight.featured && (
                    <span className="bg-cream/20 text-cream text-xs rounded px-2.5 py-1 font-body">
                      Featured
                    </span>
                  )}
                </div>

                <h1 className="font-display text-2xl sm:text-4xl xl:text-5xl text-cream leading-tight break-words">
                  {insight.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-cream/70 font-body text-xs sm:text-sm mt-6">
                  <span>Published by {insight.author || "Samuel A. Emoni"}</span>
                  {insight.date && <span className="flex items-center gap-1.5"><Calendar size={14} aria-hidden="true" /> {insight.date}</span>}
                  {insight.read_time && <span className="flex items-center gap-1.5"><Clock size={14} aria-hidden="true" /> {insight.read_time}</span>}
                  {Boolean(insight.readers) && <span className="flex items-center gap-1.5"><Eye size={14} aria-hidden="true" /> {insight.readers?.toLocaleString()} reads</span>}
                </div>
              </div>

              {insight.image && (
                <div className="lg:col-span-6 xl:col-span-7 min-w-0">
                  <div className="overflow-hidden rounded-lg shadow-xl border border-cream/10">
                    <img
                      src={insight.image}
                      alt={insight.title}
                      fetchPriority="high"
                      decoding="async"
                      className="w-full aspect-[16/10] lg:aspect-[16/9] object-cover"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* BODY: article column + sticky sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-10 lg:gap-12 items-start">
            <article className="min-w-0 w-full">
              {insight.excerpt && (
                <p className="font-body text-base sm:text-lg md:text-xl text-ink font-medium leading-relaxed mb-8 border-l-4 border-ember pl-4 break-words">
                  {insight.excerpt}
                </p>
              )}

              {isRichHtmlBody ? (
                <div
                  className="insight-body font-body text-sm sm:text-base text-ink/90 leading-relaxed overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(body[0]) }}
                />
              ) : (
                <div className="space-y-6">
                  {body.map((line, idx) => {
                    if (line.startsWith("## ")) {
                      return (
                        <h2 key={idx} className="font-display text-xl sm:text-2xl text-ink mt-8 mb-3 pt-4 border-t border-border break-words">
                          {line.replace(/^##\s/, "")}
                        </h2>
                      );
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <li key={idx} className="font-body text-sm sm:text-base text-ink/80 leading-relaxed list-disc ml-6 break-words">
                          {line.replace(/^-\s/, "")}
                        </li>
                      );
                    }
                    return (
                      <p key={idx} className="font-body text-sm sm:text-base text-ink/90 leading-relaxed break-words">
                        {line}
                      </p>
                    );
                  })}
                </div>
              )}
            </article>

            {(hasTags || related.length > 0) && (
              <aside className="min-w-0 w-full lg:sticky lg:top-24 space-y-6">
                {hasTags && (
                  <div className="bg-snow border border-border rounded-lg p-5">
                    <h2 className="font-display text-base text-ink mb-3 flex items-center gap-2">
                      <Tag size={16} className="text-ink/40" /> Topics
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {insight.tags?.map((tag) => (
                        <span key={tag} className="bg-paper border border-border text-ink/70 text-xs px-3 py-1 rounded-full font-body">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {related.length > 0 && (
                  <div className="bg-snow border border-border rounded-lg p-5">
                    <h2 className="font-display text-base text-ink mb-4">Related Insights</h2>
                    <ul className="divide-y divide-border/60">
                      {related.map((item) => (
                        <li key={item.slug} className="first:pt-0 last:pb-0 py-4">
                          <Link to={`/insights/${item.slug}`} className="group flex gap-4">
                            {item.image && (
                              <div className="aspect-[4/3] w-24 shrink-0 overflow-hidden bg-paper sm:w-28">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  loading="lazy"
                                  decoding="async"
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              {item.category && (
                                <span className="text-xs font-body text-ember font-medium uppercase tracking-wider">
                                  {item.category}
                                </span>
                              )}
                              <h3 className="font-display text-base text-ink mt-1 group-hover:text-ember transition-colors line-clamp-2">
                                {item.title}
                              </h3>
                              <div className="font-body text-xs text-ink/50 mt-2 flex flex-wrap gap-x-3 gap-y-1">
                                {item.date && <span>{item.date}</span>}
                                {item.read_time && <span>{item.read_time}</span>}
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </aside>
            )}
          </div>
        </div>

        {/* Global Mobile Anti-Overlap & Rich-Text Renderer Engine */}
        <style>{`
          /* Universal Container Constraints */
          .insight-body {
            width: 100%;
            max-width: 100%;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }

          /* Headings & Text Break Rules */
          .insight-body h1, .insight-body h2, .insight-body h3, .insight-body h4, .insight-body p {
            max-width: 100%;
            word-break: break-word;
            overflow-wrap: anywhere;
          }

          .insight-body h1 { font-size: 1.4rem; font-weight: 700; margin: 1.5rem 0 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(0,0,0,0.1); }
          .insight-body h2 { font-size: 1.25rem; font-weight: 700; margin: 1.5rem 0 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(0,0,0,0.1); }
          .insight-body h3 { font-size: 1.1rem; font-weight: 600; margin: 1.25rem 0 0.5rem; }
          .insight-body p { margin: 0 0 1rem; line-height: 1.65; }

          @media (min-width: 640px) {
            .insight-body h1 { font-size: 1.6rem; margin: 2rem 0 0.75rem; padding-top: 1rem; }
            .insight-body h2 { font-size: 1.35rem; margin: 2rem 0 0.75rem; padding-top: 1rem; }
            .insight-body h3 { font-size: 1.15rem; }
          }

          .insight-body ul { list-style: disc; padding-left: 1.25rem; margin: 0 0 1.1rem; }
          .insight-body ol { list-style: decimal; padding-left: 1.25rem; margin: 0 0 1.1rem; }
          .insight-body li { margin: 0.35rem 0; word-break: break-word; }
          .insight-body a { color: #b45309; text-decoration: underline; word-break: break-all; }

          /* Blockquotes / Callouts */
          .insight-body blockquote {
            border-left: 4px solid #b45309;
            padding: 0.5rem 0.75rem;
            margin: 1rem 0;
            font-style: italic;
            color: rgba(0,0,0,0.8);
            background-color: rgba(180, 83, 9, 0.05);
            border-radius: 0 0.375rem 0.375rem 0;
            max-width: 100%;
          }

          /* Force Images, SVGs, Frames and Canvas elements to respect parent width */
          .insight-body img, 
          .insight-body iframe, 
          .insight-body svg, 
          .insight-body figure,
          .insight-body canvas {
            max-width: 100% !important;
            height: auto !important;
            box-sizing: border-box;
          }

          /* Mobile Horizontal Scroll Wrappers for Tables */
          .insight-body table {
            width: 100% !important;
            border-collapse: collapse;
            margin: 1.25rem 0;
            font-size: 0.8125rem;
            display: block;
            overflow-x: auto;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
          }

          .insight-body th, .insight-body td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
          }

          .insight-body th {
            background-color: #f3f4f6;
            font-weight: 600;
          }

          /* Shape Mask Wrappers */
          .insight-body .shape-mask-wrapper {
            display: block;
            margin: 0.75rem auto;
            max-width: 100% !important;
          }

          /* Custom Editors/Templates Grid Flattening on Mobile */
          @media (max-width: 768px) {
            .insight-body div[style*="grid-template-columns"],
            .insight-body div[style*="display: flex"],
            .insight-body div[style*="display:flex"] {
              display: flex !important;
              flex-direction: column !important;
              grid-template-columns: 1fr !important;
              width: 100% !important;
              gap: 1rem !important;
            }

            .insight-body div[style*="width"],
            .insight-body [style*="min-width"] {
              width: 100% !important;
              min-width: 0 !important;
              max-width: 100% !important;
            }
          }
        `}</style>
      </main>
    </>
  );
};

export default InsightDetail;