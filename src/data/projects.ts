export interface Project {
  name: string;
  sector: string;
  description: string;
  tags: string[];
  liveUrl: string | null;
  year?: string;
}

export interface Product {
  name: string;
  category: string;
  description: string;
  format: string;
  status: "available" | "update";
  icon: string;
  price: number;
}

export const projects: Project[] = [
  {
    name: "Capepcy Hardware",
    sector: "E-commerce",
    description:
      "Full e-commerce website with inventory management, M-Pesa checkout, order tracking, and admin dashboard for a Nairobi hardware store.",
    tags: ["React", "Next.js", "PostgreSQL", "M-Pesa"],
    liveUrl: "https://www.capepcyhardware.co.ke/",
    year: "2025",
  },
  {
    name: "Turkana County Website",
    sector: "GovTech",
    description:
      "Government portal with service delivery features, news publishing, downloadable documents, and a citizen feedback module.",
    tags: ["Next.js", "Node.js", "PostgreSQL"],
    liveUrl: "https://www.turkanacounty.go.ke/",
    year: "2024",
  },
  {
    name: "Axis Africa Safaris",
    sector: "Web Development",
    description:
      "Safari booking platform with tour packages, itinerary builder, and inquiry-to-booking flow integrated with WhatsApp.",
    tags: ["React", "Tailwind", "Node.js"],
    liveUrl: "https://www.axisafricasafaris.com/",
    year: "2023",
  },
  {
    name: "Hyrax Safaris",
    sector: "Web Development",
    description:
      "Premium safari experience website with rich media galleries, lodge profiles, and lead capture for a high-end clientele.",
    tags: ["React", "Next.js", "Tailwind"],
    liveUrl: "https://hyraxsafaris.com/",
    year: "2024",
  },
  {
    name: "Fred's Ranch & Resort",
    sector: "Web Development",
    description:
      "Restaurant and resort website with menu integration, room availability calendar, and event-booking inquiries.",
    tags: ["React", "Tailwind", "Node.js"],
    liveUrl: "https://fredsranch.co.ke/",
    year: "2023",
  },
  {
    name: "NeuroUni",
    sector: "Branding",
    description:
      "Full brand identity for an AI-focused learning platform — logo system, guidelines, marketing collateral, and pitch deck.",
    tags: ["Logo Design", "Brand Identity", "Illustrator"],
    liveUrl: null,
    year: "2024",
  },
 
  {
    name: "Click2Skill",
    sector: "Branding",
    description:
      "Complete logo and brand identity design for an upskilling marketplace targeting East African learners.",
    tags: ["Logo Design", "Illustrator"],
    liveUrl: null,
    year: "2024",
  },
  {
    name: "Emoni Samuel Portfolio",
    sector: "Web Development",
    description:
      "Professional portfolio showcasing full-stack consulting skills, services, courses, and insights — built editorial-first.",
    tags: ["Next.js", "React", "Tailwind"],
    liveUrl: "https://www.emonisamuel.co.ke",
    year: "2025",
  },
  {
    name: "County Health Records System",
    sector: "GovTech",
    description:
      "Internal records dashboard for a sub-county health office — patient intake, referral tracking, and monthly reporting exports.",
    tags: ["Next.js", "PostgreSQL", "Auth"],
    liveUrl: null,
    year: "2024",
  },
  {
    name: "Mombasa Logistics Portal",
    sector: "Enterprise",
    description:
      "Driver dispatch, vehicle tracking, and consignment status portal for a coastal freight operator.",
    tags: ["React", "Node.js", "MongoDB", "Maps API"],
    liveUrl: null,
    year: "2024",
  },
  {
    name: "Karibu Schools ERP",
    sector: "Education",
    description:
      "School management platform: fees, grading, attendance, parent portal, and SMS notifications for primary schools.",
    tags: ["Next.js", "Supabase", "M-Pesa", "SMS"],
    liveUrl: null,
    year: "2025",
  },
  {
    name: "AgriLink Marketplace",
    sector: "E-commerce",
    description:
      "Farmer-to-buyer marketplace connecting smallholder produce with restaurants and retailers, featuring escrow payments.",
    tags: ["React", "Node.js", "M-Pesa", "Escrow"],
    liveUrl: null,
    year: "2025",
  },
  {
    name: "Sahara Realty CRM",
    sector: "Enterprise",
    description:
      "Custom CRM for a property firm — listings, viewing scheduler, client pipeline, and commission tracking.",
    tags: ["Next.js", "PostgreSQL", "Calendar"],
    liveUrl: null,
    year: "2024",
  },
  {
    name: "Ujamaa Microfinance Loan App",
    sector: "FinTech",
    description:
      "Loan origination and repayment tracking system with M-Pesa disbursement, scoring rules, and auditor-friendly reports.",
    tags: ["Next.js", "PostgreSQL", "Daraja", "Reports"],
    liveUrl: null,
    year: "2024",
  },
  {
    name: "Kilifi Tourism Board",
    sector: "GovTech",
    description:
      "Destination marketing site with operator directory, events calendar, and multilingual support (EN/SW).",
    tags: ["Next.js", "i18n", "CMS"],
    liveUrl: "#",
    year: "2025",
  },
  {
    name: "BrewWorks Café POS",
    sector: "E-commerce",
    description:
      "Tablet-first point-of-sale and inventory system for a multi-branch café chain — offline-tolerant with daily sync.",
    tags: ["React", "PWA", "IndexedDB", "Node.js"],
    liveUrl: null,
    year: "2024",
  },
  {
    name: "Mama Mboga Delivery",
    sector: "E-commerce",
    description:
      "Hyperlocal grocery delivery web app — vendor onboarding, dispatcher console, and rider WhatsApp routing.",
    tags: ["Next.js", "Twilio", "Maps API"],
    liveUrl: null,
    year: "2025",
  },
  {
    name: "Tuko Pamoja Donation Platform",
    sector: "NGO",
    description:
      "Recurring donations platform for a faith-based NGO with M-Pesa, Stripe, automated receipts, and donor segmentation.",
    tags: ["Next.js", "Stripe", "M-Pesa", "Email"],
    liveUrl: null,
    year: "2024",
  },
  {
    name: "Savannah Lodge Booking Engine",
    sector: "Web Development",
    description:
      "Direct-booking engine with rate management, channel-manager sync, and on-site card + M-Pesa deposits.",
    tags: ["Next.js", "Channel Manager", "Payments"],
    liveUrl: null,
    year: "2024",
  },
];

export const products: Product[] = [
  {
    name: "Brand Identity Starter Kit",
    category: "Design Templates",
    description:
      "Illustrator templates for logo design, brand guidelines, and social media assets — used in real client engagements.",
    format: "Illustrator",
    status: "available",
    icon: "Palette",
    price: 25,
  },
  {
    name: "Website Project Proposal Template",
    category: "Business Documents",
    description:
      "Professional proposal template used in real client engagements — fully editable scope, deliverables, and pricing sections.",
    format: "DOCX + PDF",
    status: "available",
    icon: "FileText",
    price: 15,
  },
  {
    name: "Social Media Content Calendar",
    category: "Marketing Templates",
    description:
      "90-day content planning calendar with caption frameworks, posting schedules, and platform-specific best practices.",
    format: "Google Sheets",
    status: "available",
    icon: "Megaphone",
    price: 20,
  },
  {
    name: "Freelance Client Contract Pack",
    category: "Business Documents",
    description:
      "Lawyer-reviewed service agreement, NDA, and scope-of-work templates tailored for Kenyan freelancers and agencies.",
    format: "DOCX + PDF",
    status: "available",
    icon: "FileText",
    price: 30,
  },
  {
    name: "Pitch Deck Template (Investor-Ready)",
    category: "Design Templates",
    description:
      "12-slide pitch deck with founder narrative structure, traction slide, financials, and ask — Illustrator & PowerPoint.",
    format: "Illustrator + PPTX",
    status: "available",
    icon: "Palette",
    price: 40,
  },
  {
    name: "Website Launch Checklist",
    category: "Dev Resources",
    description:
      "The 87-point pre-launch checklist used before every site I deploy — SEO, security, performance, accessibility, analytics.",
    format: "PDF",
    status: "available",
    icon: "Code",
    price: 10,
  },
  {
    name: "Brand Discovery Questionnaire",
    category: "Business Documents",
    description:
      "The exact intake form used to brief client brand projects — saves weeks of back-and-forth on positioning.",
    format: "DOCX + PDF",
    status: "available",
    icon: "FileText",
    price: 12,
  },
  {
    name: "API Integration Checklist",
    category: "Dev Resources",
    description:
      "The exact checklist used before every payment integration goes live — auth, retries, idempotency, logging, alerts.",
    format: "PDF",
    status: "update",
    icon: "Code",
    price: 15,
  },
  {
    name: "M-Pesa Daraja Starter Kit",
    category: "Dev Resources",
    description:
      "Production-tested STK Push, C2B, and B2C code samples with webhook handling, retries, and reconciliation patterns.",
    format: "Code + Docs",
    status: "update",
    icon: "Code",
    price: 35,
  },
  {
    name: "SaaS Landing Page Template",
    category: "Design Templates",
    description:
      "Conversion-focused landing page in Next.js + Tailwind — sections proven to convert across 30+ launches.",
    format: "Code (ZIP)",
    status: "update",
    icon: "Palette",
    price: 50,
  },
  {
    name: "Quarterly Business Review Template",
    category: "Business Documents",
    description:
      "Run a structured QBR in 60 minutes — agenda, KPI dashboard, action register, and stakeholder summary.",
    format: "Sheets + DOCX",
    status: "available",
    icon: "FileText",
    price: 18,
  },
  {
    name: "Hiring Scorecard for Tech Roles",
    category: "Business Documents",
    description:
      "Rubric-based interview scorecard for developers, designers, and ops hires — reduces gut-feel hires.",
    format: "Sheets",
    status: "update",
    icon: "FileText",
    price: 22,
  },
  {
    name: "Design Packaging and Label",
    category: "Design Templates",
    description:
      "Professional packaging and label design templates for products and branding — customizable for various industries.",
    format: "Illustrator",
    status: "available",
    icon: "Palette",
    price: 70,
  },
];
