import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  keywords?: string;
  schema?: object;
}

const SITE_URL = "https://www.emonisamuel.co.ke";

export default function SEO({
  title,
  description,
  canonical,
  image = `${SITE_URL}/og-image.jpg`,
  keywords,
  schema,
}: SEOProps) {
  const url = canonical || SITE_URL;

  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />

      {keywords && (
        <meta name="keywords" content={keywords} />
      )}

      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta name="twitter:title" content={title} />

      <meta
        name="twitter:description"
        content={description}
      />

      <meta name="twitter:image" content={image} />

      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}