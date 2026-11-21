import { useLocation } from "react-router-dom";
import SEO from "@/components/SEO";
import { ROUTE_SEO } from "@/lib/seoData";

/**
 * Pages that render their own <SEO /> from fetched or local data.
 * RouteSEO stays out of the way on these so it never marks them noindex.
 */
const SELF_MANAGED_PREFIXES = [
  "/projects/",
  "/insights/",
  "/courses/",
  "/what-i-do/",
  "/industries/",
  "/markets/",
];

/**
 * Applies per-route metadata for static public pages.
 *
 * - Known static routes get title, description, keywords, canonical, WebPage schema and breadcrumbs.
 * - Dynamic detail pages return null and render their own <SEO />.
 * - Anything else is treated as a 404 and marked noindex.
 *
 * If a page also renders its own <SEO /> (for example WhatIDo), the page's tags win,
 * because react-helmet-async uses the last-rendered values.
 */
export default function RouteSEO() {
  const { pathname } = useLocation();
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  const config = ROUTE_SEO[path];
  if (config) {
    return (
      <SEO
        title={config.title}
        description={config.description}
        keywords={config.keywords}
        image={config.image}
        imageAlt={config.imageAlt}
        noindex={config.noindex}
        pageType={config.pageType}
        breadcrumbs={config.breadcrumbs}
        canonical={path}
      />
    );
  }

  if (SELF_MANAGED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return null;
  }

  return (
    <SEO
      title="Page not found | Emoni Samuel"
      description="The page you are looking for does not exist. Return to the home page or browse my services."
      noindex
    />
  );
}