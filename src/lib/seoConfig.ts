import type { SEOProps } from "@/components/SEO";

type RouteSeo = Omit<SEOProps, "canonical">;

const BASE_KEYWORDS =
  "best graphic designer in Kenya, best graphic designer in Africa, software engineer Kenya, software developer Nairobi, best UI design in Kenya, best UI design in Africa";

/**
 * Static route metadata. Dynamic pages (/projects/:kind/:id, /insights/:slug)
 * are intentionally absent: they render their own <SEO /> from fetched data.
 */
export const ROUTE_SEO: Record<string, RouteSeo> = {
  "/": {
    title: "Samuel Emoni | Best Graphic Designer & Software Engineer in Kenya",
    description:
      "Samuel Emoni is a top-rated graphic designer, software engineer and software developer in Nairobi, Kenya, delivering the best UI/UX design, websites, web apps and branding across Kenya and Africa.",
    keywords: `${BASE_KEYWORDS}, UI UX designer Kenya, web developer Kenya, brand identity Nairobi`,
  },
  "/what-i-do": {
    title: "Services | Graphic Design, UI/UX & Software Development Kenya",
    description:
      "Graphic design, brand identity, UI/UX design, web development, custom software and business automation by Samuel Emoni in Nairobi, serving clients across Kenya and Africa.",
    keywords: `${BASE_KEYWORDS}, web design Nairobi, custom software development Kenya, business automation Kenya`,
  },
  "/projects": {
    title: "Projects | Branding, UI/UX & Software by Samuel Emoni",
    description:
      "Selected branding, UI/UX, web and software projects by Samuel Emoni, a Nairobi-based graphic designer and software engineer serving Kenya and Africa.",
    keywords: `${BASE_KEYWORDS}, graphic design portfolio Kenya, web development portfolio Nairobi`,
  },
  "/courses": {
    title: "Courses | Learn Design & Software Development in Kenya",
    description:
      "Practical courses in graphic design, UI/UX and software development taught by Samuel Emoni, a Nairobi-based designer and software engineer.",
    keywords: "graphic design course Kenya, web development course Nairobi, UI UX course Kenya",
  },
  "/partners": {
    title: "Partners | Emoni Digital Solutions, Nairobi Kenya",
    description:
      "Organisations and partners that collaborate with Emoni Digital Solutions on design, software and digital consultancy across Kenya and Africa.",
  },
  "/insights": {
    title: "Insights | Design, Software & Digital Strategy in Africa",
    description:
      "Articles on graphic design, UI/UX, software engineering and digital strategy for businesses and government in Kenya and Africa, by Samuel Emoni.",
    keywords: "design insights Kenya, software engineering articles Africa, govtech Kenya",
  },
  "/contact": {
    title: "Contact Samuel Emoni | Hire a Designer & Developer in Nairobi",
    description:
      "Start a project with Samuel Emoni. Hire a graphic designer, UI/UX designer or software developer in Nairobi, Kenya, for clients across Africa.",
    keywords: "hire graphic designer Nairobi, hire software developer Kenya, contact web developer Nairobi",
  },
  "/privacy": {
    title: "Privacy Policy | Emoni Digital Solutions",
    description: "How Emoni Digital Solutions collects, uses and protects your personal information.",
  },
  "/terms": {
    title: "Terms of Service | Emoni Digital Solutions",
    description: "Terms and conditions for using the Emoni Digital Solutions website and services.",
  },
  "/cookies": {
    title: "Cookie Policy | Emoni Digital Solutions",
    description: "How Emoni Digital Solutions uses cookies and how you can manage your preferences.",
  },
  "/admin/login": {
    title: "Admin Login | Emoni Digital Solutions",
    description: "Private administrator sign-in.",
    noindex: true,
  },
};