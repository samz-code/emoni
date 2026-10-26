import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Clock, Eye, Calendar, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Insight } from "@/types/insight";
import SEO, { SITE_URL } from "@/components/SEO";

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

/** Converts any parseable date string to ISO 8601, or undefined if invalid. */
const toIso = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};
type RelatedInsight = Pick<Insight, "slug" | "title" | "category" | "read_time" | "excerpt" | "date" | "image">;

const InsightDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [related, setRelated] = useState<RelatedInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);

  const richHtml = useMemo(() => {
    const b = insight?.body || [];
    return b.length === 1 && looksLikeHtml(b[0]) ? sanitizeArticleHtml(b[0]) : "";
  }, [insight]);

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

  // Wrap each <pre> in a .code-block container and add a Copy button
  useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;

    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.parentElement?.classList.contains("code-block")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "code-block";
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy-btn";
      btn.textContent = "Copy";
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(pre.textContent || "");
          btn.textContent = "Copied!";
        } catch {
          btn.textContent = "Failed";
        }
        setTimeout(() => (btn.textContent = "Copy"), 1800);
      });
      wrapper.appendChild(btn);
    });
  }, [richHtml]);

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
        <SEO
          title="Article Not Found | Samuel A. Emoni"
          description="This article could not be found."
          noindex
        />
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
  const record = insight as Insight & { created_at?: string | null; updated_at?: string | null };
  const canonicalUrl = `${SITE_URL}/insights/${insight.slug}`;
  const pageTitle = `${insight.title} | Samuel A. Emoni`;
  const pageDescription =
    insight.excerpt ||
    "Read insights on design, software development and digital strategy by Samuel A. Emoni.";
  const articleImage = insight.image || `${SITE_URL}/og-image.jpg`;
  const publishedIso = toIso(insight.date) ?? toIso(record.created_at);
  const modifiedIso = toIso(record.updated_at) ?? publishedIso;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    headline: insight.title,
    description: pageDescription,
    url: canonicalUrl,
    image: [articleImage],
    datePublished: publishedIso,
    dateModified: modifiedIso,
    inLanguage: "en-KE",
    author: {
      "@type": "Person",
      name: insight.author || "Samuel A. Emoni",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Emoni Digital Solutions",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    articleSection: insight.category,
    keywords: insight.tags && insight.tags.length > 0 ? insight.tags.join(", ") : undefined,
  };

  const hasTags = Boolean(insight.tags && insight.tags.length > 0);

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical={canonicalUrl}
        image={articleImage}
        type="article"
        keywords={insight.tags && insight.tags.length > 0 ? insight.tags.join(", ") : undefined}
        publishedTime={publishedIso}
        modifiedTime={modifiedIso}
        section={insight.category}
        schema={articleSchema}
      />

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
                  ref={bodyRef}
                  className="insight-body font-body text-sm sm:text-base text-ink/90 leading-relaxed overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: richHtml }}
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

          /* ===== CODE: clearly different from normal text ===== */
          .insight-body pre {
            background: #17221c;
            color: #e9f5eb;
            border-left: 4px solid #b45309;
            border-radius: 0.5rem;
            padding: 2.25rem 1rem 1rem;
            margin: 1.25rem 0;
            max-width: 100%;
            overflow-x: auto;
            white-space: pre;
            word-break: normal;
            overflow-wrap: normal;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
            font-size: 0.8125rem;
            line-height: 1.65;
            tab-size: 2;
            -webkit-overflow-scrolling: touch;
          }
          .insight-body pre code {
            background: transparent;
            color: inherit;
            border: 0;
            padding: 0;
            font-size: inherit;
            font-family: inherit;
            white-space: pre;
            word-break: normal;
            overflow-wrap: normal;
          }
          /* inline code inside sentences */
          .insight-body :not(pre) > code {
            background: rgba(180, 83, 9, 0.1);
            color: #9a3412;
            border: 1px solid rgba(180, 83, 9, 0.25);
            border-radius: 0.25rem;
            padding: 0.1rem 0.35rem;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: 0.875em;
            overflow-wrap: anywhere;
          }
          .insight-body .code-block { position: relative; margin: 1.25rem 0; }
          .insight-body .code-block pre { margin: 0; }
          .insight-body .code-block::before {
            content: "CODE";
            position: absolute;
            top: 0.55rem;
            left: 1rem;
            z-index: 1;
            font-size: 0.65rem;
            letter-spacing: 0.12em;
            font-weight: 700;
            color: rgba(233, 245, 235, 0.55);
            pointer-events: none;
          }
          .insight-body .code-copy-btn {
            position: absolute;
            top: 0.4rem;
            right: 0.5rem;
            z-index: 1;
            font-size: 0.7rem;
            padding: 0.2rem 0.6rem;
            border-radius: 0.25rem;
            background: rgba(255, 255, 255, 0.12);
            color: #e9f5eb;
            border: 1px solid rgba(255, 255, 255, 0.2);
            cursor: pointer;
          }
          .insight-body .code-copy-btn:hover { background: rgba(255, 255, 255, 0.25); }

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