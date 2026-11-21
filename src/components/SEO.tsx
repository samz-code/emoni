import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
  keywords?: string;
  schema?: object | object[];
  type?: "website" | "article";
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  /** Adds a WebPage-family schema node linked to your site and business. */
  pageType?: "WebPage" | "CollectionPage" | "ContactPage" | "AboutPage";
  /** Adds a BreadcrumbList schema so Google can show the page path in results. */
  breadcrumbs?: { name: string; path: string }[];
  /** Article pages: author name. Defaults to the site owner. */
  author?: string;
}

export const SITE_URL = "https://www.emonisamuel.co.ke";
export const SITE_NAME = "Emoni Digital Solutions";
const AUTHOR_NAME = "Samuel A. Emoni";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_IMAGE_ALT = "Emoni Samuel, web developer and brand strategist in Nairobi, Kenya";
const TWITTER_HANDLE = ""; // e.g. "@yourhandle". Leave empty to omit.
const THEME_COLOR = "#007979";

function toAbsolute(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}/${value.replace(/^\/+/, "")}`;
}

function normalizeUrl(value: string): string {
  const absolute = toAbsolute(value).split("?")[0].split("#")[0];
  return absolute.length > SITE_URL.length + 1
    ? absolute.replace(/\/+$/, "")
    : `${SITE_URL}/`;
}

/** Escapes "<" so structured data can never close the script tag early. */
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function SEO({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  imageAlt,
  keywords,
  schema,
  type = "website",
  noindex = false,
  publishedTime,
  modifiedTime,
  section,
  pageType,
  breadcrumbs,
  author,
}: SEOProps) {
  const { pathname } = useLocation();

  // index.html ships default tags for crawlers that do not run JavaScript. Once React has
  // rendered this page's own tags, remove those defaults so Google never sees two
  // descriptions, two robots rules or a wrong canonical.
  useEffect(() => {
    document
      .querySelectorAll(
        [
          'meta[name="description"]:not([data-rh])',
          'meta[name="keywords"]:not([data-rh])',
          'meta[name="robots"]:not([data-rh])',
          'meta[name="author"]:not([data-rh])',
          'meta[name="theme-color"]:not([data-rh])',
          'meta[property^="og:"]:not([data-rh])',
          'meta[name^="twitter:"]:not([data-rh])',
          'link[rel="canonical"]:not([data-rh])',
        ].join(",")
      )
      .forEach((el) => el.remove());
  }, [pathname, title]);

  const url = normalizeUrl(canonical || pathname || "/");
  const img = toAbsolute(image);
  const isDefaultImage = img === DEFAULT_IMAGE;
  const alt = imageAlt || (isDefaultImage ? DEFAULT_IMAGE_ALT : title);
  const desc = description.trim().replace(/\s+/g, " ").slice(0, 300);

  // Writing aid: warns in development when a title or description will be cut off in Google.
  if (import.meta.env?.DEV && !noindex) {
    if (title.length > 60) console.warn(`[SEO] Title is ${title.length} characters (aim for 60 or fewer): "${title}"`);
    if (desc.length > 160) console.warn(`[SEO] Description is ${desc.length} characters (aim for 160 or fewer) on ${url}`);
    if (desc.length < 70) console.warn(`[SEO] Description is short (${desc.length} characters) on ${url}`);
  }

  const extraSchemas: object[] = [];

  if (pageType) {
    extraSchemas.push({
      "@context": "https://schema.org",
      "@type": pageType,
      "@id": `${url}#webpage`,
      url,
      name: title,
      description: desc,
      inLanguage: "en-KE",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#business` },
      primaryImageOfPage: { "@type": "ImageObject", url: img },
      ...(modifiedTime ? { dateModified: modifiedTime } : {}),
    });
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    extraSchemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: normalizeUrl(b.path),
      })),
    });
  }

  const schemas = [
    ...(schema ? (Array.isArray(schema) ? schema : [schema]) : []),
    ...extraSchemas,
  ];

  return (
    <Helmet>
      <html lang="en-KE" />
      <title>{title}</title>
      <meta name="description" content={desc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author || AUTHOR_NAME} />
      <meta name="theme-color" content={THEME_COLOR} />
      <meta
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        }
      />

      <link rel="canonical" href={url} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:image:alt" content={alt} />
      {isDefaultImage && <meta property="og:image:width" content="1200" />}
      {isDefaultImage && <meta property="og:image:height" content="630" />}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && section && (
        <meta property="article:section" content={section} />
      )}
      {type === "article" && (
        <meta property="article:author" content={author || AUTHOR_NAME} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      {TWITTER_HANDLE && <meta name="twitter:site" content={TWITTER_HANDLE} />}
      {TWITTER_HANDLE && <meta name="twitter:creator" content={TWITTER_HANDLE} />}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      <meta name="twitter:image:alt" content={alt} />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {safeJson(s)}
        </script>
      ))}
    </Helmet>
  );
}