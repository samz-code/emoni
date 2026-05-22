export type ServiceIcon =
  | "Zap"
  | "Layers"
  | "Monitor"
  | "Palette"
  | "CreditCard"
  | "Workflow"
  | "Link"
  | "Wrench";

export interface Service {
  id: string;
  icon: ServiceIcon;
  name: string;
  problem: string;
  solution: string;
  outcome: string;
  deliverables: string[];
  idealFor: string;
}

export const services: Service[] = [
  {
    id: "digital-consultancy",
    icon: "Zap",
    name: "Digital Consultancy",
    problem:
      "Organizations invest in technology without a clear strategy, resulting in wasted budgets, duplicated tools, and systems nobody actually uses.",
    solution:
      "I audit existing systems, map workflows to business goals, and deliver a practical digital roadmap with defined outcomes, prioritized phases, and realistic timelines your team can execute against.",
    outcome: "↑ ROI on tech investment",
    deliverables: [
      "Systems & workflow audit report",
      "Digital transformation roadmap (12–24 months)",
      "Technology stack recommendation",
      "Vendor & build-vs-buy analysis",
      "Executive briefing & team workshop",
    ],
    idealFor: "SMEs, NGOs, county governments, growth-stage startups",
  },
  {
    id: "system-design",
    icon: "Layers",
    name: "System Design & Architecture",
    problem:
      "Systems built without architectural planning become unmaintainable, slow, and expensive to change. One small feature request takes weeks and breaks three other things.",
    solution:
      "I design modular, scalable architectures — fully documented before any code is written. Your team understands every component, every data flow, and every decision behind it.",
    outcome: "↓ Long-term maintenance cost",
    deliverables: [
      "System architecture diagrams (C4 model)",
      "Database schema & ERD",
      "API contract specifications",
      "Infrastructure & deployment plan",
      "Security threat model",
      "Technical decision log",
    ],
    idealFor: "Companies scaling beyond MVP, replacing legacy systems",
  },
  {
    id: "web-development",
    icon: "Monitor",
    name: "Web Development",
    problem:
      "Many businesses have outdated, slow, or non-functional websites that fail to convert visitors, rank on Google, or represent their brand credibly.",
    solution:
      "I build fast, responsive websites and web applications — from marketing landing pages to full e-commerce platforms, dashboards, and government portals — with SEO and performance baked in.",
    outcome: "↑ Online visibility & conversions",
    deliverables: [
      "Custom-coded website or web app",
      "Mobile-first responsive design",
      "CMS or admin dashboard",
      "SEO setup & analytics integration",
      "Hosting & deployment configuration",
      "30-day post-launch support",
    ],
    idealFor: "Businesses, institutions, e-commerce, SaaS, portfolios",
  },
  {
    id: "graphic-design",
    icon: "Palette",
    name: "Graphic Design & Branding",
    problem:
      "Inconsistent or amateur visual identity undermines client trust before a single conversation takes place. Your brand looks different on every platform.",
    solution:
      "I create logos, brand systems, marketing collateral, pitch decks, and social media graphics that communicate professionalism and build lasting brand recognition across every touchpoint.",
    outcome: "↑ Brand authority & recall",
    deliverables: [
      "Logo design (3 concepts, unlimited revisions)",
      "Complete brand guidelines PDF",
      "Business cards, letterheads, signatures",
      "Social media template kit",
      "Pitch deck or company profile",
      "Source files (AI, PSD, Figma)",
    ],
    idealFor: "Startups, rebrands, professional services, restaurants",
  },
  {
    id: "payment-integrations",
    icon: "CreditCard",
    name: "Payment Integrations",
    problem:
      "Connecting payment gateways the wrong way creates reconciliation nightmares, security gaps, abandoned checkouts, and lost revenue you only discover months later.",
    solution:
      "I implement M-Pesa Daraja, Stripe, Flutterwave, PayPal, and Pesapal integrations that are PCI-aware, idempotent, tested against edge cases, and fully documented before going live.",
    outcome: "Zero downtime payment flows",
    deliverables: [
      "Payment gateway integration (STK, C2B, B2C)",
      "Webhook handlers with retry logic",
      "Reconciliation dashboard",
      "Refund & dispute workflows",
      "Transaction logging & monitoring",
      "Go-live checklist & runbook",
    ],
    idealFor: "E-commerce, SaaS, marketplaces, donation platforms",
  },
  {
    id: "process-automation",
    icon: "Workflow",
    name: "Process Automation",
    problem:
      "Manual, repetitive processes drain team capacity, introduce human error that compounds at scale, and quietly cost more than any salary on your books.",
    solution:
      "I identify automation opportunities, redesign the workflow with stakeholders, and build systems that eliminate bottlenecks — without disrupting daily operations.",
    outcome: "↓ 40% manual workload average",
    deliverables: [
      "Process audit & opportunity map",
      "Workflow automation (Zapier/Make/n8n)",
      "Custom scripts & scheduled jobs",
      "Email, WhatsApp & SMS automation",
      "Reporting dashboards",
      "Team training & SOP documentation",
    ],
    idealFor: "Operations teams, HR, finance, customer support",
  },
  {
    id: "api-integration",
    icon: "Link",
    name: "API & System Integration",
    problem:
      "Disconnected enterprise systems force staff to duplicate data entry across CRM, accounting, inventory, and payroll — creating dangerous information silos and reporting gaps.",
    solution:
      "I design and build robust API integrations connecting your tools reliably — with proper authentication, error handling, rate-limit awareness, monitoring, and documentation your team can maintain.",
    outcome: "Single source of truth",
    deliverables: [
      "Integration architecture document",
      "REST/GraphQL/Webhook implementations",
      "Authentication & secrets management",
      "Error monitoring & alerting",
      "Integration test suite",
      "Maintenance handover docs",
    ],
    idealFor: "Multi-system businesses, ERP migrations, SaaS connectors",
  },
  {
    id: "it-support",
    icon: "Wrench",
    name: "IT Support & Consulting",
    problem:
      "Hardware failures, network issues, misconfigured systems, and missing backups cause costly downtime that disrupts operations and erodes staff trust in technology.",
    solution:
      "I provide hardware diagnostics, network setup, server configuration, backup strategy, and ongoing IT consultation — keeping your infrastructure reliable, secure, and audit-ready.",
    outcome: "↓ Downtime & support costs",
    deliverables: [
      "Hardware diagnosis & repair",
      "Network design & WiFi optimization",
      "Server & workstation setup",
      "Backup & disaster recovery plan",
      "Cybersecurity baseline hardening",
      "Monthly retainer support option",
    ],
    idealFor: "Offices, schools, SMEs, hotels, retail outlets",
  },
];
