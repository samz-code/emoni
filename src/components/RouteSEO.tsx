import { useLocation } from "react-router-dom";
import SEO from "@/components/SEO";
import { ROUTE_SEO } from "@/lib/seoConfig";

/**
 * Applies per-route metadata for static public pages.
 * Dynamic detail pages return null here and render their own <SEO />.
 */
export default function RouteSEO() {
  const { pathname } = useLocation();
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  const config = ROUTE_SEO[path];
  if (config) return <SEO {...config} />;

  // Dynamic detail pages render their own <SEO /> from fetched data.
  if (
    path.startsWith("/projects/") ||
    path.startsWith("/insights/") ||
    path.startsWith("/courses/") ||
    path.startsWith("/what-i-do/")
  ) {
    return null;
  }

  return (
    <SEO
      title="Page not found | Samuel Emoni"
      description="The page you are looking for does not exist."
      noindex
    />
  );
}