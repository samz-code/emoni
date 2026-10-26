import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { SITE_URL } from "@/components/SEO";

export interface Crumb {
  label: string;
  /** Omit on the last (current) crumb. */
  to?: string;
}

/** BreadcrumbList JSON-LD matching the visible breadcrumb trail. */
export function breadcrumbSchema(items: Crumb[], currentPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: `${SITE_URL}${crumb.to ?? currentPath}`,
    })),
  };
}

export default function Breadcrumbs({
  items,
  dark = false,
}: {
  items: Crumb[];
  dark?: boolean;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={dark ? "text-cream/70 [&_span]:text-cream" : "text-ink/60 [&_span]:text-ink"}
    >
      <ol className="flex flex-wrap items-center gap-1.5 font-body text-xs sm:text-sm">
        {items.map((crumb, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {crumb.to && !last ? (
                <Link
                  to={crumb.to}
                  className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="truncate font-medium">
                  {crumb.label}
                </span>
              )}
              {!last && <ChevronRight size={13} aria-hidden="true" className="shrink-0 opacity-60" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}