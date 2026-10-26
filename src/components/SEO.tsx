import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  keywords?: string;
  schema?: object | object[];
  type?: "website" | "article";
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
}

export const SITE_URL = "https://www.emonisamuel.co.ke";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

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

export default function SEO({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  keywords,
  schema,
  type = "website",
  noindex = false,
  publishedTime,
  modifiedTime,
  section,
}: SEOProps) {
  const { pathname } = useLocation();

  const url = normalizeUrl(canonical || pathname || "/");
  const img = toAbsolute(image);
  const desc = description.trim().slice(0, 300);
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={desc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1"
        }
      />

      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && section && (
        <meta property="article:section" content={section} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}