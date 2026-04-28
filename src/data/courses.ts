export interface Course {
  name: string;
  category: string;
  icon: string;                  // lucide-react icon name
  description: string;
  audience: string;
  duration: string;
  price: number;                 // course price in USD
  status: "enrolling" | "waitlist" | "update";
  whatYouGet: {
    highlights: string[];        // 4–6 bullet outcomes / deliverables
    tools: string[];             // software / platforms used
    certificate: boolean;        // graduates receive a certificate
    liveSupport: boolean;        // live Q&A or cohort sessions included
    projectCount: number;        // number of hands-on projects
    bonuses?: string[];          // optional bonus materials / perks
  };
}

export const courses: Course[] = [
  {
    name: "Adobe Photoshop Mastery",
    category: "Graphic Design",
    icon: "Palette",
    description:
      "Master photo editing, retouching, digital art, and graphic design with industry-standard Adobe Photoshop — from layers to advanced compositing.",
    audience: "Beginner to Advanced",
    duration: "8 Weeks · Self-paced",
    price: 249,
    status: "enrolling",
    whatYouGet: {
      highlights: [
        "Complete command of layers, masks, blend modes, and smart objects",
        "Professional photo retouching & skin-correction workflows",
        "Digital painting and compositing techniques used in commercial campaigns",
        "Export-ready files for print, web, and social media",
        "A polished portfolio of 6+ original Photoshop projects",
        "Lifetime access to all lesson recordings and asset packs",
      ],
      tools: ["Adobe Photoshop (latest)", "Adobe Bridge", "Camera Raw"],
      certificate: true,
      liveSupport: false,
      projectCount: 6,
      bonuses: [
        "500+ premium brushes, textures & mockup pack",
        "Photoshop keyboard-shortcut cheat sheet (printable PDF)",
        "Private student community access",
      ],
    },
  },
  {
    name: "Adobe Illustrator Pro",
    category: "Graphic Design",
    icon: "Brush",
    description:
      "Create stunning vector graphics, logos, icons, and illustrations with Adobe Illustrator. Includes real client briefs and feedback rounds.",
    audience: "Beginner to Intermediate",
    duration: "6 Weeks · Self-paced",
    price: 199,
    status: "enrolling",
    whatYouGet: {
      highlights: [
        "Full mastery of the Pen tool, Pathfinder, and shape-builder workflows",
        "Logo design system from brief to final delivery",
        "Icon sets and brand-ready illustration styles",
        "Print production knowledge: bleeds, CMYK, and press-ready file setup",
        "4 real client briefs with written feedback from the instructor",
        "Lifetime access to all lessons and resource libraries",
      ],
      tools: ["Adobe Illustrator (latest)", "Adobe Fonts"],
      certificate: true,
      liveSupport: false,
      projectCount: 4,
      bonuses: [
        "300+ vector icon starter pack",
        "Brand guide template (editable .ai file)",
        "Access to private student community",
      ],
    },
  },
  {
    name: "Video Editing with Adobe Premiere Pro",
    category: "Video Editing",
    icon: "Film",
    description:
      "Edit professional videos, reels, YouTube content, and social media clips like a pro — including color grading, audio sync, and export presets.",
    audience: "All Levels",
    duration: "10 Weeks · Self-paced",
    price: 299,
    status: "enrolling",
    whatYouGet: {
      highlights: [
        "Professional multi-track timeline editing from raw footage to final cut",
        "Color grading with Lumetri Color — cinematic looks from scratch",
        "Audio mixing, dialogue clean-up, and music syncing",
        "Export presets optimised for YouTube, Instagram, TikTok, and broadcast",
        "5 complete edited videos ready for your portfolio or client delivery",
        "Efficient proxy workflow for editing on any machine speed",
      ],
      tools: ["Adobe Premiere Pro (latest)", "Adobe Audition", "Frame.io"],
      certificate: true,
      liveSupport: false,
      projectCount: 5,
      bonuses: [
        "20 cinematic LUT (colour grade) pack",
        "Royalty-free music & SFX library (100+ tracks)",
        "Export preset file — one-click YouTube & Instagram setup",
      ],
    },
  },
  {
    name: "After Effects Animation",
    category: "Video Editing",
    icon: "Clapperboard",
    description:
      "Create stunning motion graphics, kinetic typography, logo animations, and visual effects for brands and creators.",
    audience: "Intermediate to Advanced",
    price: 279,
    duration: "8 Weeks · Self-paced",
    status: "enrolling",
    whatYouGet: {
      highlights: [
        "Keyframe animation fundamentals and graph editor mastery",
        "Kinetic typography reel you can show clients immediately",
        "Logo animation stings — the most in-demand freelance deliverable",
        "Expression scripting basics to automate repetitive animations",
        "Visual effects compositing: green screen, particle systems, and light leaks",
        "Full motion-graphics project from concept to rendered video",
      ],
      tools: ["Adobe After Effects (latest)", "Adobe Premiere Pro", "Lottie (for web export)"],
      certificate: true,
      liveSupport: false,
      projectCount: 5,
      bonuses: [
        "50+ reusable motion preset (.ffx) library",
        "Lottie export workflow guide for web developers",
        "Transition & text-animation starter pack",
      ],
    },
  },
  {
    name: "Canva Design Essentials",
    category: "Graphic Design",
    icon: "Sparkles",
    description:
      "Design beautiful social media posts, presentations, flyers, and marketing materials with Canva — no prior design experience needed.",
    audience: "Beginner Friendly",
    duration: "4 Weeks · Self-paced",
    price: 99,
    status: "enrolling",
    whatYouGet: {
      highlights: [
        "Full confidence navigating Canva Free and Canva Pro features",
        "Consistent brand kit setup — colours, fonts, logo in one place",
        "30-day plug-and-play social media content calendar",
        "On-brand Instagram, LinkedIn, and Facebook post templates",
        "Pitch deck & flyer templates adapted to your business",
        "Exporting best practices for print, digital, and animated formats",
      ],
      tools: ["Canva (Free & Pro)", "Canva Brand Kit", "Canva Presentations"],
      certificate: true,
      liveSupport: false,
      projectCount: 3,
      bonuses: [
        "100 Canva template bundle (posts, stories, carousels, pitch decks)",
        "Brand colour palette generator guide",
        "Font pairing cheat sheet (PDF)",
      ],
    },
  },
  {
    name: "Digital Marketing Consultation",
    category: "Marketing",
    icon: "Target",
    description:
      "Learn proven strategies to grow your brand through SEO, paid ads, email funnels, and analytics — applied to a real business case study.",
    audience: "All Levels",
    duration: "6 Weeks · Self-paced",
    price: 229,
    status: "enrolling",
    whatYouGet: {
      highlights: [
        "Full-funnel digital marketing strategy — from awareness to conversion",
        "SEO audit and keyword plan for your own website or client site",
        "Meta and Google Ads campaigns set up, launched, and optimised",
        "Email automation sequence (7-email welcome funnel, ready to deploy)",
        "Analytics dashboard setup in GA4 — know which numbers actually matter",
        "Real business case study applied throughout every module",
      ],
      tools: ["Google Analytics 4", "Meta Ads Manager", "Mailchimp / ConvertKit", "SEMrush (trial)"],
      certificate: true,
      liveSupport: false,
      projectCount: 4,
      bonuses: [
        "Marketing audit checklist (PDF)",
        "Ad copywriting swipe file (50 proven hooks)",
        "KPI tracking spreadsheet template",
      ],
    },
  },
  {
    name: "Complete Adobe Creative Suite",
    category: "Graphic Design",
    icon: "Palette",
    description:
      "Master Photoshop, Illustrator, InDesign, Premiere Pro, and After Effects in one cohort program with weekly live sessions and portfolio reviews.",
    audience: "Beginner to Advanced",
    duration: "16 Weeks · Live Cohort",
    price: 699,
    status: "enrolling",
    whatYouGet: {
      highlights: [
        "End-to-end mastery across 5 industry-standard Adobe applications",
        "Weekly live sessions with the instructor — questions answered in real time",
        "Peer cohort for accountability, collaboration, and networking",
        "Two formal portfolio reviews with written and video feedback",
        "10+ portfolio projects spanning print, digital, video, and motion",
        "Mentorship office hours for career and freelance guidance",
      ],
      tools: [
        "Adobe Photoshop",
        "Adobe Illustrator",
        "Adobe InDesign",
        "Adobe Premiere Pro",
        "Adobe After Effects",
      ],
      certificate: true,
      liveSupport: true,
      projectCount: 10,
      bonuses: [
        "All individual course asset packs bundled",
        "InDesign magazine & editorial layout template pack",
        "Priority WhatsApp support group with instructor",
        "Alumni network access post-graduation",
      ],
    },
  },
  {
    name: "Social Media Content Creation",
    category: "Marketing",
    icon: "Camera",
    description:
      "Create engaging content for Instagram, TikTok, YouTube Shorts, and LinkedIn. Learn hooks, scripting, shooting, and editing workflows.",
    audience: "Beginner to Intermediate",
    duration: "5 Weeks · Self-paced",
    price: 179,
    status: "enrolling",
    whatYouGet: {
      highlights: [
        "Platform-specific content strategy for Instagram, TikTok, YouTube Shorts, and LinkedIn",
        "Hook formulas and script templates that drive watch time and shares",
        "Phone shooting masterclass — lighting, framing, and audio on a budget",
        "End-to-end editing workflow from raw clip to published post",
        "Content calendar system to batch-produce 30 posts in one day",
        "Analytics review framework to double down on what works",
      ],
      tools: ["CapCut", "Canva", "Instagram Creator Studio", "TikTok Studio", "Notion (planning)"],
      certificate: true,
      liveSupport: false,
      projectCount: 4,
      bonuses: [
        "90-day content idea bank (300+ prompts)",
        "Hook swipe file — 60 proven opening lines",
        "Caption formula cheat sheet (PDF)",
      ],
    },
  },
  {
    name: "Web Development Bootcamp (HTML, CSS, JS)",
    category: "Web Dev",
    icon: "Code2",
    description:
      "Go from zero to building real, responsive websites using HTML5, CSS3, and modern JavaScript. Includes 5 portfolio projects and Git basics.",
    audience: "Absolute Beginner",
    duration: "12 Weeks · Live Cohort",
    price: 499,
    status: "enrolling",
    whatYouGet: {
      highlights: [
        "Solid HTML5 semantic structure and accessibility fundamentals",
        "CSS Flexbox, Grid, and responsive design for all screen sizes",
        "Vanilla JavaScript — DOM manipulation, events, fetch API, and async logic",
        "5 portfolio-ready projects: landing page, portfolio site, JS app, and more",
        "Git & GitHub version control — the professional dev workflow",
        "Code review sessions from instructors every two weeks",
      ],
      tools: ["VS Code", "Git & GitHub", "Chrome DevTools", "Netlify (deployment)"],
      certificate: true,
      liveSupport: true,
      projectCount: 5,
      bonuses: [
        "HTML/CSS reference cheat sheet (printable PDF)",
        "Starter component library (buttons, navbars, cards)",
        "Job-ready GitHub profile setup guide",
      ],
    },
  },
  {
    name: "React & Next.js for Real Projects",
    category: "Web Dev",
    icon: "Code2",
    description:
      "Build production-grade web apps with React, Next.js, TypeScript, and Tailwind. Ship a deployable SaaS-style project by week 10.",
    audience: "Intermediate Developers",
    duration: "10 Weeks · Live Cohort",
    price: 599,
    status: "enrolling",
    whatYouGet: {
      highlights: [
        "React fundamentals to advanced patterns — hooks, context, and performance",
        "Next.js App Router, server components, and API routes in production",
        "TypeScript typing system that makes your codebases actually maintainable",
        "Tailwind CSS — utility-first styling at professional speed",
        "Authentication, database integration (Supabase/Prisma), and deployment",
        "A live, deployed SaaS-style web app added to your GitHub and portfolio",
      ],
      tools: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Vercel"],
      certificate: true,
      liveSupport: true,
      projectCount: 3,
      bonuses: [
        "Next.js project starter boilerplate (auth + DB pre-wired)",
        "Component library with 20+ reusable UI pieces",
        "Deployment & environment-variable guide (PDF)",
      ],
    },
  },
  {
    name: "M-Pesa & Payment Integration Masterclass",
    category: "Web Dev",
    icon: "CreditCard",
    description:
      "The exact approach used in production: Daraja STK Push, C2B, B2C, webhooks, reconciliation, and going live without breaking things.",
    audience: "Developers with Backend Basics",
    price: 149,
    duration: "4 Weeks · Self-paced",
    status: "enrolling",
    whatYouGet: {
      highlights: [
        "Full Daraja API setup — sandbox to production, credentials to go-live checklist",
        "STK Push (Lipa Na M-Pesa) integration with real callback handling",
        "C2B and B2C flows for marketplace and disbursement use cases",
        "Webhook security, idempotency, and retry logic — production best practices",
        "Transaction reconciliation logic to prevent revenue leakage",
        "Working code samples in Node.js and PHP you can drop into your project",
      ],
      tools: ["Safaricom Daraja API", "Node.js / PHP", "ngrok (local webhook testing)", "Postman"],
      certificate: true,
      liveSupport: false,
      projectCount: 2,
      bonuses: [
        "Go-live checklist PDF (never miss a compliance step again)",
        "Reconciliation spreadsheet template",
        "Postman collection for all Daraja endpoints",
      ],
    },
  },
  {
    name: "Brand Strategy for Founders",
    category: "Marketing",
    icon: "Lightbulb",
    description:
      "Position your business, define your brand voice, and build a visual identity that earns trust — even before you can afford an agency.",
    audience: "Founders & Solopreneurs",
    price: 129,
    duration: "4 Weeks · Self-paced",
    status: "enrolling",
    whatYouGet: {
      highlights: [
        "Clear brand positioning statement — who you are, who you serve, and why you win",
        "Defined brand voice and tone guide your whole team can follow",
        "DIY visual identity: logo direction, colour palette, and typography system",
        "One-page brand strategy document to guide every marketing decision",
        "Website copy framework — hero, about, and services sections written and reviewed",
        "Competitor audit and differentiation map for your market",
      ],
      tools: ["Canva", "Notion (brand docs)", "Google Docs"],
      certificate: true,
      liveSupport: false,
      projectCount: 2,
      bonuses: [
        "Brand strategy workbook (fillable PDF)",
        "Brand voice exercise templates",
        "10 common founder branding mistakes — mini guide",
      ],
    },
  },
  {
    name: "UI/UX Design with Figma",
    category: "Graphic Design",
    icon: "Layout",
    description:
      "Design clean, conversion-focused interfaces from research to handoff — wireframes, prototypes, design systems, and developer specs.",
    price: 269,
    audience: "Designers & Product People",
    duration: "8 Weeks · Self-paced",
    status: "enrolling",
    whatYouGet: {
      highlights: [
        "Figma proficiency from frames and auto-layout to variables and components",
        "UX research methods — user interviews, affinity maps, and journey mapping",
        "Low-fi to high-fi wireframe workflow for web and mobile",
        "Interactive prototype you can test with real users without writing code",
        "Complete design system with tokens, components, and usage documentation",
        "Developer handoff using Figma Dev Mode — specs, assets, and annotations",
      ],
      tools: ["Figma (Free & Professional)", "FigJam", "Maze (usability testing)"],
      certificate: true,
      liveSupport: false,
      projectCount: 3,
      bonuses: [
        "Figma UI kit — 200+ components ready to customise",
        "UX research interview script template",
        "Design critique checklist (PDF)",
      ],
    },
  },
  {
    name: "AI Tools for Creators & Consultants",
    category: "Marketing",
    icon: "Zap",
    description:
      "Practical workflows using ChatGPT, Midjourney, Runway, and automation — to ship more content, faster, without losing quality or voice.",
    audience: "All Levels",
    duration: "3 Weeks · Self-paced",
    price: 99,
    status: "enrolling",
    whatYouGet: {
      highlights: [
        "Prompt engineering that gets consistent, on-brand output from any AI model",
        "AI image generation workflow with Midjourney for marketing and social content",
        "Video generation with Runway ML — B-roll, ads, and short-form content",
        "Content repurposing system: turn one idea into 10 pieces across platforms",
        "Automation stack with Make (Integromat) to remove manual busywork",
        "Maintaining your unique voice and quality bar while using AI assistance",
      ],
      tools: ["ChatGPT / Claude", "Midjourney", "Runway ML", "Make (Integromat)", "Notion AI"],
      certificate: true,
      liveSupport: false,
      projectCount: 2,
      bonuses: [
        "50 battle-tested prompt templates for creators",
        "AI tools comparison cheat sheet (updated quarterly)",
        "Automation workflow template library",
      ],
    },
  },
  {
    name: "Freelance to Agency: Scale Your Practice",
    category: "Marketing",
    icon: "TrendingUp",
    description:
      "How I scaled from solo freelancer to 1000+ projects delivered — pricing, proposals, contracts, client systems, and team building.",
    audience: "Working Freelancers",
    duration: "5 Weeks · Live Cohort",
    price: 399,
    status: "waitlist",
    whatYouGet: {
      highlights: [
        "Pricing model overhaul — move from hourly rates to retainers and project value pricing",
        "Proposal and contract templates that win higher-paying clients",
        "Client onboarding and delivery system so nothing falls through the cracks",
        "Hiring and briefing your first subcontractors or team members",
        "Business operations: invoicing, cash flow, and profit margin management",
        "Live cohort with weekly group sessions and a peer accountability partner",
      ],
      tools: ["Notion (CRM & ops)", "HoneyBook / Bonsai (contracts)", "Loom (client comms)"],
      certificate: true,
      liveSupport: true,
      projectCount: 2,
      bonuses: [
        "Editable proposal and contract templates (Word + PDF)",
        "Freelance rate calculator spreadsheet",
        "Client red-flag checklist — know who NOT to work with",
        "Alumni Slack community with active instructor participation",
      ],
    },
  },
  {
    name: "Cybersecurity Fundamentals for SMEs",
    category: "Web Dev",
    icon: "Shield",
    description:
      "Practical security: account hygiene, backups, phishing defense, network basics, and incident response — built for non-engineers.",
    audience: "Business Owners & Ops Teams",
    price: 119,
    duration: "4 Weeks · Self-paced",
    status: "update",
    whatYouGet: {
      highlights: [
        "Complete account hygiene audit — passwords, MFA, and access control review",
        "Automated backup strategy covering files, email, and cloud data",
        "Phishing and social engineering defence training for your whole team",
        "Network basics: router security, guest Wi-Fi, and VPN use cases",
        "Incident response plan you can execute without an IT department",
        "Security policy one-pager template ready to share with employees",
      ],
      tools: ["Bitwarden (password manager)", "Google Workspace / Microsoft 365 security settings", "Cloudflare (DNS)"],
      certificate: true,
      liveSupport: false,
      projectCount: 1,
      bonuses: [
        "SME security checklist (printable PDF — laminate and post it)",
        "Phishing simulation email examples for staff awareness training",
        "Incident response playbook template",
      ],
    },
  },
];