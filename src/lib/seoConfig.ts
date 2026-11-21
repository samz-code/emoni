// src/lib/seoConfig.ts
// Central place for SEO copy. Keys match the service ids used in your /what-i-do#anchors.
// Titles: keep under ~60 characters. Descriptions: keep under ~155 characters.

export const SITE = {
  name: "Emoni Samuel",
  url: "https://www.emonisamuel.co.ke",
  phone: "+254727492545",
  city: "Nairobi",
  country: "KE",
  areaServed: [
    "Nairobi",
    "Kenya",
    "East Africa",
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "United Arab Emirates",
  ],
  // Add your real profile links here. Search engines use them to connect your brand.
  sameAs: [
    // "https://www.linkedin.com/in/your-handle",
    // "https://github.com/your-handle",
    // "https://www.instagram.com/your-handle",
  ],
};

export interface PageSeo {
  title: string;
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
}

// Page-level SEO
export const PAGE_SEO: Record<string, PageSeo> = {
  home: {
    title: "Web Developer & Brand Strategist in Nairobi | Emoni Samuel",
    description:
      "I build websites, custom software and brands for businesses in Nairobi and across Kenya. See my work and get a free quote on WhatsApp.",
    primaryKeyword: "web developer in Nairobi",
    secondaryKeywords: ["website developer Kenya", "brand strategist Nairobi", "software developer Kenya"],
  },
  "what-i-do": {
    title: "Web Development & Branding Services in Nairobi, Kenya",
    description:
      "Web design, M-Pesa integration, process automation, SEO and branding for Kenyan businesses. See prices and book a service on WhatsApp.",
    primaryKeyword: "web development services Nairobi",
    secondaryKeywords: ["web design company Kenya", "branding services Nairobi", "digital marketing Kenya"],
  },
};

// Service-level SEO
export const SERVICE_SEO: Record<string, PageSeo> = {
  "web-development": {
    title: "Website Development in Nairobi, Kenya | From KSh",
    description:
      "Fast, mobile-friendly websites and web apps for Kenyan businesses. Clear pricing, delivery timeline and support. Book on WhatsApp.",
    primaryKeyword: "website development Nairobi",
    secondaryKeywords: ["web developer Kenya", "custom website Kenya", "ecommerce website Kenya"],
  },
  "web-design": {
    title: "Web Design in Nairobi | Modern Business Websites",
    description:
      "Professional web design in Nairobi that turns visitors into customers. Responsive layouts, SEO-ready pages and fast loading.",
    primaryKeyword: "web design Nairobi",
    secondaryKeywords: ["website design Kenya", "web design company Nairobi", "business website design Kenya"],
  },
  "payment-integrations": {
    title: "M-Pesa & Payment Integration in Kenya | Daraja API",
    description:
      "Accept M-Pesa, card and bank payments on your website or app. Daraja STK Push, C2B and B2C integration for Kenyan businesses.",
    primaryKeyword: "M-Pesa integration Kenya",
    secondaryKeywords: ["Daraja API developer", "STK push integration", "payment gateway Kenya"],
  },
  "api-integration": {
    title: "API & System Integration in Nairobi, Kenya",
    description:
      "Connect your website, CRM, accounting and payment tools so data flows without manual work. API integration for Kenyan businesses.",
    primaryKeyword: "API integration Kenya",
    secondaryKeywords: ["system integration Nairobi", "software integration services Kenya"],
  },
  "process-automation": {
    title: "Business Process Automation in Kenya | Save Hours Weekly",
    description:
      "Automate invoicing, reports, approvals and customer follow-ups. Process automation for Nairobi and East African businesses.",
    primaryKeyword: "business process automation Kenya",
    secondaryKeywords: ["workflow automation Nairobi", "automate business processes Kenya"],
  },
  "system-design": {
    title: "Custom Software & System Design in Nairobi",
    description:
      "Custom business systems designed around how you work: inventory, bookings, CRM and portals. Software development in Nairobi, Kenya.",
    primaryKeyword: "custom software development Kenya",
    secondaryKeywords: ["system design Nairobi", "business software Kenya", "software developer Nairobi"],
  },
  seo: {
    title: "SEO Services in Nairobi, Kenya | Rank on Google",
    description:
      "Local and technical SEO to help Kenyan businesses rank on Google and get more calls and WhatsApp leads. See packages and pricing.",
    primaryKeyword: "SEO services Nairobi",
    secondaryKeywords: ["SEO expert Kenya", "local SEO Nairobi", "SEO company Kenya"],
  },
  "digital-marketing": {
    title: "Digital Marketing in Nairobi, Kenya | Get More Leads",
    description:
      "Google, Facebook and Instagram campaigns that bring real enquiries. Digital marketing for Nairobi and Kenyan businesses.",
    primaryKeyword: "digital marketing Nairobi",
    secondaryKeywords: ["digital marketing agency Kenya", "online marketing Kenya"],
  },
  "social-media": {
    title: "Social Media Management in Nairobi, Kenya",
    description:
      "Content, scheduling and community management for Facebook, Instagram, TikTok and LinkedIn. Social media management for Kenyan brands.",
    primaryKeyword: "social media management Nairobi",
    secondaryKeywords: ["social media marketing Kenya", "social media manager Nairobi"],
  },
  "graphic-design": {
    title: "Logo & Graphic Design in Nairobi | Branding Kenya",
    description:
      "Logos, brand identity, flyers and packaging designed to make your business look credible. Graphic design in Nairobi, Kenya.",
    primaryKeyword: "graphic design Nairobi",
    secondaryKeywords: ["logo design Nairobi", "branding Kenya", "graphic designer Kenya"],
  },
  "brand-strategy": {
    title: "Brand Strategy in Nairobi, Kenya | Positioning & Identity",
    description:
      "Positioning, messaging and visual identity that make customers choose you. Brand strategy for growing Kenyan businesses.",
    primaryKeyword: "brand strategy Nairobi",
    secondaryKeywords: ["branding agency Kenya", "brand identity Nairobi"],
  },
  "it-support": {
    title: "IT Support & Consulting in Nairobi, Kenya",
    description:
      "Practical IT support and technology advice for Nairobi businesses: setup, security, cloud tools and systems that work.",
    primaryKeyword: "IT consultant Nairobi",
    secondaryKeywords: ["IT support Kenya", "IT consulting services Nairobi"],
  },
  "digital-consultancy": {
    title: "Digital Consultancy in Nairobi, Kenya | Strategy",
    description:
      "Get clear on what to build, buy or fix before you spend. Digital strategy and consulting for Kenyan businesses.",
    primaryKeyword: "digital consultancy Kenya",
    secondaryKeywords: ["digital transformation Kenya", "digital strategy Nairobi"],
  },
};

/** Use for the SEO component's title/description. Falls back to database fields. */
export const seoForService = (service: {
  id: string;
  name: string;
  short_description?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
}) => {
  const preset = SERVICE_SEO[service.id];
  return {
    title: service.seo_title || preset?.title || `${service.name} in Nairobi, Kenya | ${SITE.name}`,
    description:
      service.seo_description ||
      preset?.description ||
      service.short_description ||
      `${service.name} for businesses in Nairobi and across Kenya.`,
    keywords: preset ? [preset.primaryKeyword, ...preset.secondaryKeywords].join(", ") : undefined,
  };
};

/** Site-wide business schema. Render once on the home page. */
export const professionalServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE.url}/#business`,
  name: SITE.name,
  url: SITE.url,
  telephone: SITE.phone,
  image: `${SITE.url}/whitelogo.png`,
  priceRange: "KSh",
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE.city,
    addressCountry: SITE.country,
  },
  areaServed: SITE.areaServed,
  knowsAbout: [
    "Web development",
    "Software engineering",
    "M-Pesa integration",
    "Process automation",
    "Brand strategy",
    "SEO",
    "Digital marketing",
  ],
  sameAs: SITE.sameAs,
};

/** Breadcrumbs help Google show your page path in results. */
export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: `${SITE.url}${item.path}`,
  })),
});