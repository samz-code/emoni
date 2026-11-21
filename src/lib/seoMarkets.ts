// src/lib/seoMarkets.ts
// One entry = one landing page at /markets/:slug
// IMPORTANT: every market needs genuinely different content. Google treats near-identical
// pages that only swap the country name as "doorway pages" and can demote the whole site.
// Every section below is written per market. Replace anything that is not literally true
// for you (rates, tools, turnaround times) before publishing.

export interface Market {
  slug: string;
  country: string; // used in schema areaServed
  flags: string[]; // ISO codes for flagcdn, e.g. ["us"]
  title: string; // keep under ~60 characters
  description: string; // keep under ~155 characters
  h1: string;
  intro: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  currency: string;

  // Why they need to hire someone at all
  challengesHeading: string;
  challenges: { heading: string; text: string }[];

  // Why hire me specifically
  whyWorkWithMe: { heading: string; text: string }[];

  // Concrete outputs
  deliverables: { heading: string; text: string }[];

  // How the engagement runs in this market (time zone, payment, communication)
  workingModel: { heading: string; text: string };

  // Cost of doing nothing / doing it badly
  costOfWaiting: string;

  faqs: { q: string; a: string }[];

  popularServices: string[]; // service ids from your database, shown first
  whatsappMessage: string;
}

export const MARKETS: Market[] = [
  {
    slug: "united-states",
    country: "United States",
    flags: ["us"],
    title: "Web Developer for US Businesses | Remote, Kenya-Based",
    description:
      "Hire a senior web developer and brand strategist for your US business. Clear USD pricing, weekly updates and fast delivery. Book a free call.",
    h1: "Web Development & Brand Strategy for US Businesses",
    intro:
      "I work remotely with US startups, agencies and small businesses that want senior-level web development, automation and branding without agency overhead. You get one person accountable for the result, clear scope and weekly progress updates.",
    primaryKeyword: "hire web developer remote",
    secondaryKeywords: ["offshore web developer", "affordable web development for small business", "freelance full-stack developer"],
    currency: "USD",
    challengesHeading: "Why US businesses end up needing a dedicated developer",
    challenges: [
      {
        heading: "Agencies are expensive and diluted",
        text: "A typical US agency bills for account managers, project managers and juniors before a senior developer touches your project. You pay a premium and still explain your business three times.",
      },
      {
        heading: "Hiring full-time is a big commitment",
        text: "A senior in-house developer costs salary, benefits, equipment and months of recruiting. If your need is a launch, a rebuild or a set of integrations, that is more overhead than the work justifies.",
      },
      {
        heading: "Your tools do not talk to each other",
        text: "CRM, payments, scheduling, email and spreadsheets all hold part of the picture. Staff re-key data by hand, leads slip through, and nobody trusts the numbers.",
      },
      {
        heading: "The website looks fine but does not sell",
        text: "Slow pages, unclear messaging and weak search visibility mean visitors leave before they ever become enquiries, and you cannot tell why.",
      },
    ],
    whyWorkWithMe: [
      { heading: "Straightforward pricing", text: "Fixed-scope quotes in USD, so there are no surprise hours on the invoice." },
      { heading: "Working hours that fit", text: "Nairobi afternoons are US East Coast mornings. We overlap for calls, and I work async the rest of the time." },
      { heading: "Strategy and build together", text: "The same person plans the brand, designs the site and builds the system, so nothing is lost between handoffs." },
    ],
    deliverables: [
      { heading: "A fast, conversion-focused website", text: "Built on a modern stack, mobile-first, with analytics and clear calls to action wired in from day one." },
      { heading: "Automations that remove manual work", text: "Lead capture to CRM, invoices, reminders and reports running without anyone copying and pasting." },
      { heading: "API and payment integrations", text: "Stripe, your CRM, booking and accounting tools connected properly, with error handling and logs." },
      { heading: "Brand identity that matches the product", text: "Logo, colour, type and messaging, delivered as a usable kit your team can keep applying." },
      { heading: "Documentation and handover", text: "You own the code, the accounts and a plain-English guide, so you are never locked in to me." },
    ],
    workingModel: {
      heading: "How we would work together",
      text: "We start with a call during your morning, agree a fixed scope in USD and split payment into milestones. You get a written update every week, a demo link you can click through between meetings, and a direct line on WhatsApp or email for anything urgent.",
    },
    costOfWaiting:
      "Every month a slow, disconnected site stays live is a month of enquiries lost to competitors whose sites load faster and answer questions sooner. Manual admin also compounds: a team spending ten hours a week on copy-and-paste work is spending over 500 hours a year on something software can do.",
    faqs: [
      {
        q: "Can you really work with US time zones from Nairobi?",
        a: "Yes. Nairobi is 7 hours ahead of US Eastern and 10 hours ahead of Pacific. We hold calls in your morning, which is my late afternoon or evening, and I deliver written updates and recorded walkthroughs so work never waits on a meeting.",
      },
      {
        q: "How do I pay, and in what currency?",
        a: "Quotes are in USD. Payment is milestone-based, so you pay as each agreed stage is delivered rather than the full amount up front.",
      },
      {
        q: "Who owns the code and accounts when the project is done?",
        a: "You do. Hosting, domains, repositories and third-party accounts are set up in your name, and I hand over documentation so another developer could take over if you ever wanted that.",
      },
    ],
    popularServices: ["web-development", "process-automation", "api-integration", "brand-strategy"],
    whatsappMessage: "Hi Samuel, I found you from the US page and would like to discuss a project.",
  },
  {
    slug: "canada",
    country: "Canada",
    flags: ["ca"],
    title: "Web Developer for Canadian Businesses | Remote Team",
    description:
      "Web development, automation and branding for Canadian businesses. Pricing in CAD or USD, clear scope and regular updates. Book a free call.",
    h1: "Web Development & Branding for Canadian Businesses",
    intro:
      "I help Canadian small businesses and startups launch fast websites, connect their tools and build brands that look credible from day one. I can quote in CAD or USD and work around your team's schedule.",
    primaryKeyword: "web developer for Canadian businesses",
    secondaryKeywords: ["remote web developer Canada", "website design for small business Canada", "web development outsourcing Canada"],
    currency: "CAD",
    challengesHeading: "Why Canadian businesses look for outside web help",
    challenges: [
      {
        heading: "A thin local talent pool for small budgets",
        text: "Experienced developers in Toronto, Vancouver or Calgary are in high demand and priced accordingly. Small businesses often end up choosing between a template site and a quote they cannot justify.",
      },
      {
        heading: "Bilingual and compliance requirements add work",
        text: "If you serve Quebec or federal clients, French content is not optional. Add PIPEDA and provincial privacy expectations, and a simple site becomes a more careful build than most freelancers account for.",
      },
      {
        heading: "Sites built once and never found",
        text: "A site without proper structure, speed and local search setup will not show up for the searches your customers make, no matter how good it looks.",
      },
      {
        heading: "Branding that signals a startup, not a business",
        text: "Inconsistent logos, colours and wording make a young company feel less trustworthy than it is, which costs deals with larger customers.",
      },
    ],
    whyWorkWithMe: [
      { heading: "Quotes in CAD or USD", text: "You see the total cost up front in the currency you budget in." },
      { heading: "Privacy-aware builds", text: "I build with privacy in mind, including consent and data handling, and can work to your PIPEDA requirements." },
      { heading: "Both bilingual-ready and SEO-ready", text: "Sites are structured for search from the start, and I can set up English and French versions if you need them." },
    ],
    deliverables: [
      { heading: "A site structured for local search", text: "Clean page structure, fast loading, schema markup and city or province targeting so you can be found where you operate." },
      { heading: "English and French versions", text: "Language switching, separate URLs for each language and proper hreflang tags so search engines serve the right version." },
      { heading: "Consent and privacy setup", text: "Cookie consent, privacy policy placement and careful handling of form data, built to your own legal guidance." },
      { heading: "A consistent brand kit", text: "Logo, colours, type and templates for social, print and email, so every touchpoint looks like the same company." },
      { heading: "Analytics you can read", text: "Simple dashboards showing where visitors come from and which pages produce enquiries." },
    ],
    workingModel: {
      heading: "How we would work together",
      text: "Nairobi is 8 hours ahead of Eastern Canada, so most communication is written and recorded, with live calls scheduled in your morning. You approve a fixed scope in CAD or USD, review progress through a staging link, and pay in milestones.",
    },
    costOfWaiting:
      "Canadian customers research online before they call. If your site is slow, unclear or missing in search, they will contact the competitor who appears first. For businesses serving Quebec, lacking French content shuts you out of a whole market without you ever seeing the lost enquiries.",
    faqs: [
      {
        q: "Can you build a site that meets Canadian privacy expectations?",
        a: "I build with consent and data handling in mind and follow the requirements you or your legal adviser specify, including PIPEDA. I am a developer, not a lawyer, so legal wording should be reviewed by your own counsel.",
      },
      {
        q: "Do you support French as well as English?",
        a: "Yes. I can set up both languages with separate URLs and correct language tags. Translation can be supplied by you or your translator, and I will integrate it cleanly.",
      },
      {
        q: "What is the time difference like in practice?",
        a: "Nairobi is 8 hours ahead of Toronto and 11 ahead of Vancouver. Calls fit your morning, and I work through your night, so feedback you send at the end of your day is often addressed by the time you log on.",
      },
    ],
    popularServices: ["web-development", "seo", "web-design", "graphic-design"],
    whatsappMessage: "Hi Samuel, I found you from the Canada page and would like to discuss a project.",
  },
  {
    slug: "united-kingdom",
    country: "United Kingdom",
    flags: ["gb"],
    title: "Web Developer for UK Businesses | Same-Day Overlap",
    description:
      "Web development, SEO and branding for UK businesses. Only 2-3 hours from UK time, with clear GBP or USD pricing. Book a free call.",
    h1: "Web Development, SEO & Branding for UK Businesses",
    intro:
      "Nairobi is only two to three hours ahead of the UK, so we can talk live every working day. I work with UK businesses that want a dependable developer and brand partner at a fair price.",
    primaryKeyword: "web developer for UK businesses",
    secondaryKeywords: ["remote developer UK timezone", "outsourced web development UK", "website design for small business UK"],
    currency: "GBP",
    challengesHeading: "Why UK businesses need a dependable web partner",
    challenges: [
      {
        heading: "Day rates keep climbing",
        text: "London and agency day rates for senior developers have risen steadily. For many SMEs the choice is a template build or a budget they cannot approve.",
      },
      {
        heading: "Outsourcing has a reputation problem",
        text: "Many UK companies have tried offshore work and been burned by poor communication, missed deadlines and time zones that make every question a 24-hour wait.",
      },
      {
        heading: "GDPR and cookie rules are easy to get wrong",
        text: "UK GDPR and PECR expect proper consent, clear privacy information and careful data handling. A site that ignores them risks complaints and lost trust.",
      },
      {
        heading: "Local search is competitive",
        text: "Customers search for services in their town. Without proper local SEO and a fast mobile site, you lose those searches to better-optimised competitors.",
      },
    ],
    whyWorkWithMe: [
      { heading: "Real-time overlap", text: "Calls and reviews happen within your normal working day." },
      { heading: "GDPR-aware", text: "Cookie consent, data handling and privacy pages are built in, and I can follow your own compliance policies." },
      { heading: "Clear invoices", text: "Fixed-scope quotes and milestone payments." },
    ],
    deliverables: [
      { heading: "A site built for local and national search", text: "Technical SEO, location pages, schema markup and speed work aimed at the searches your customers actually make." },
      { heading: "Consent and privacy built in", text: "Cookie banner that blocks tracking until consent, privacy notice and data-handling set up to your policy." },
      { heading: "Integrations with UK tools", text: "Stripe, GoCardless, Xero, Mailchimp and booking systems connected so admin stops being manual." },
      { heading: "Brand and marketing assets", text: "Identity, social templates and campaign pages that match, ready for launch." },
      { heading: "Support after launch", text: "A defined period of fixes and tweaks after go-live, then optional monthly maintenance." },
    ],
    workingModel: {
      heading: "How we would work together",
      text: "With only a two to three hour difference, we can run a call at 10:00 your time and still be inside my working day. You get a fixed quote in GBP or USD, a weekly progress note and milestone invoices, so there are no surprises on either side.",
    },
    costOfWaiting:
      "UK search is crowded and customers compare three or four options in minutes. A site that loads in four seconds instead of one, or that has no clear local pages, quietly sends those customers to a competitor. Compliance gaps also carry real risk if a customer or regulator raises them later.",
    faqs: [
      {
        q: "Is the time difference a problem for UK clients?",
        a: "No. Nairobi is two hours ahead of the UK in winter and three in summer, so we share almost the entire working day. Meetings, reviews and quick questions happen live.",
      },
      {
        q: "Can I pay in pounds?",
        a: "Yes. I can quote in GBP or USD. Payment is split into milestones tied to delivered work.",
      },
      {
        q: "Will the site be GDPR-compliant?",
        a: "I build in cookie consent, privacy pages and sensible data handling, and follow your compliance policy. Final legal sign-off should come from your own adviser, as I am a developer rather than a solicitor.",
      },
    ],
    popularServices: ["web-development", "seo", "digital-marketing", "brand-strategy"],
    whatsappMessage: "Hi Samuel, I found you from the UK page and would like to discuss a project.",
  },
  {
    slug: "australia",
    country: "Australia",
    flags: ["au"],
    title: "Web Developer for Australian Businesses | Remote",
    description:
      "Web development, automation and branding for Australian small businesses. Clear AUD or USD pricing and async-friendly delivery. Book a call.",
    h1: "Web Development & Branding for Australian Businesses",
    intro:
      "I work with Australian businesses that need a reliable remote developer and designer. Because our working days barely overlap, I run projects asynchronously with written updates and recorded walkthroughs, so you never wait on a meeting to move forward.",
    primaryKeyword: "remote web developer Australia",
    secondaryKeywords: ["outsourced web development Australia", "website design small business Australia"],
    currency: "AUD",
    challengesHeading: "Why Australian businesses outsource web work",
    challenges: [
      {
        heading: "Local developers are scarce and costly",
        text: "Sydney and Melbourne rates are high, and smaller cities have fewer experienced options. Many businesses wait weeks just to get a quote.",
      },
      {
        heading: "Offshore time zones usually mean silence",
        text: "Most overseas developers sleep while you work, so a simple question takes a day to answer and projects drag. The problem is not the distance, it is the lack of a system for it.",
      },
      {
        heading: "Systems that do not connect",
        text: "Bookings, invoicing in Xero or MYOB, payments and customer messages sit in separate places, and staff patch the gaps by hand.",
      },
      {
        heading: "Sites that look dated against bigger competitors",
        text: "Small businesses compete with national brands online. A dated or slow site makes a good local business look less reliable than it is.",
      },
    ],
    whyWorkWithMe: [
      { heading: "Async by design", text: "Written briefs, recorded demos and clear milestones replace unnecessary meetings." },
      { heading: "Overnight progress", text: "You send feedback at the end of your day and often wake up to the changes." },
      { heading: "Fixed-scope quotes", text: "Know the cost before work begins." },
    ],
    deliverables: [
      { heading: "A modern, mobile-first website", text: "Fast on Australian mobile networks, clear on the first screen, and easy for your team to update." },
      { heading: "Recorded walkthroughs for every milestone", text: "A short video for each delivery, so you can review it on your schedule and reply in writing." },
      { heading: "Automation of repetitive admin", text: "Quotes, bookings, reminders and invoice syncing connected to the tools you already use." },
      { heading: "Brand refresh", text: "Logo, colours and type that make a small business look established." },
      { heading: "Clean handover", text: "Documentation, credentials and training videos so your team is self-sufficient." },
    ],
    workingModel: {
      heading: "How we would work together",
      text: "Nairobi is 5 to 8 hours behind Australian time, so the overlap is brief. I replace live meetings with a written project brief, a shared task board and a recorded demo at each milestone. You give feedback at the end of your day, and I work on it during mine, so the project keeps moving while you sleep.",
    },
    costOfWaiting:
      "Slow replies are the usual reason offshore projects fail, and the cost is time: a project that should take six weeks stretches to twelve when each question costs a day. Choosing a process built for async work removes that delay, and every week saved is a week earlier that customers can book, pay and find you online.",
    faqs: [
      {
        q: "Will the time difference slow my project down?",
        a: "Not if the project is run asynchronously, which is how I work with Australian clients. You get written briefs, recorded demos and clear milestones, and your feedback at the end of your day is often addressed by the time you wake.",
      },
      {
        q: "Can we still have a live call?",
        a: "Yes. Early evening in Nairobi lines up with late-night or early-morning slots in Australia, and I am happy to schedule one at kickoff and at key milestones.",
      },
      {
        q: "Can you connect my site to Xero, MYOB or Stripe?",
        a: "Yes. I build integrations with common Australian accounting and payment tools so invoices, payments and bookings sync without manual entry.",
      },
    ],
    popularServices: ["web-development", "web-design", "process-automation"],
    whatsappMessage: "Hi Samuel, I found you from the Australia page and would like to discuss a project.",
  },
  {
    slug: "united-arab-emirates",
    country: "United Arab Emirates",
    flags: ["ae"],
    title: "Web Developer for UAE & Dubai Businesses | Remote",
    description:
      "Web development, branding and automation for UAE businesses and Gulf companies expanding into Africa. Book a free call.",
    h1: "Web Development & Branding for UAE Businesses",
    intro:
      "I support UAE businesses with websites, systems and branding, and Gulf companies expanding into East Africa that need a local technical partner who understands Kenyan payments and customers.",
    primaryKeyword: "web developer for UAE businesses",
    secondaryKeywords: ["web development Dubai remote", "Africa market entry technology partner"],
    currency: "USD",
    challengesHeading: "Why UAE and Gulf businesses need a regional tech partner",
    challenges: [
      {
        heading: "Africa expansion fails on local details",
        text: "Gulf companies moving into East Africa find that payments, mobile habits, delivery and trust signals work differently. A site copied from the Gulf does not convert in Nairobi.",
      },
      {
        heading: "Dubai agency pricing",
        text: "Agencies in Dubai charge premium rates for work a lean specialist can deliver faster. Start-ups and SMEs often cannot justify the retainer.",
      },
      {
        heading: "Standing out in a crowded market",
        text: "The UAE is competitive and design-conscious. A generic website or inconsistent brand loses credibility quickly with customers and investors.",
      },
      {
        heading: "Bilingual and regional expectations",
        text: "Arabic and English support, right-to-left layouts and regional payment options need to be planned from the beginning, not retrofitted.",
      },
    ],
    whyWorkWithMe: [
      { heading: "A bridge to East Africa", text: "If you sell into Kenya or the region, I can build the local payment, delivery and marketing setup." },
      { heading: "Close time zone", text: "Nairobi is one hour behind the UAE, so meetings are easy." },
      { heading: "Branding and build together", text: "One partner for identity, website and systems." },
    ],
    deliverables: [
      { heading: "A professional website for your market", text: "Polished design, fast performance and clear messaging for UAE customers and investors." },
      { heading: "Africa launch setup", text: "M-Pesa and mobile-money payments, mobile-first pages and local search so your East Africa entry works on day one." },
      { heading: "Arabic and English support", text: "Language switching and right-to-left layout handled properly where your audience needs it." },
      { heading: "Systems and automation", text: "Order, inventory, CRM and reporting connected so the Gulf head office sees what happens in the field." },
      { heading: "Brand identity that travels", text: "A brand that reads well in Dubai and adapts to Nairobi without becoming two separate identities." },
    ],
    workingModel: {
      heading: "How we would work together",
      text: "Nairobi is one hour behind the UAE, so our working days are almost identical. We hold regular live calls, I share progress weekly and you get a single point of contact for design, development and the Kenya-side setup.",
    },
    costOfWaiting:
      "Companies that delay a proper East Africa setup often launch with the wrong payment methods or a site that is slow on local mobile networks, then spend months fixing it while customers go elsewhere. Getting the local details right before launch costs far less than correcting them after.",
    faqs: [
      {
        q: "Can you help my company enter the Kenyan market?",
        a: "Yes. I can build M-Pesa payment integrations, a mobile-first local site, local search visibility and branding, and I am based in Nairobi to handle on-the-ground testing and setup.",
      },
      {
        q: "Do you work in Arabic?",
        a: "I can build bilingual Arabic and English sites with correct right-to-left layout. Content translation should be supplied by a native speaker, and I will integrate it carefully.",
      },
      {
        q: "How does pricing work for Gulf companies?",
        a: "Quotes are in USD with a fixed scope and milestone payments, so you know the cost before work starts.",
      },
    ],
    popularServices: ["web-development", "brand-strategy", "payment-integrations"],
    whatsappMessage: "Hi Samuel, I found you from the UAE page and would like to discuss a project.",
  },
  {
    slug: "expanding-to-kenya",
    country: "Kenya",
    flags: ["ke"],
    title: "Tech Partner for Companies Entering Kenya | M-Pesa",
    description:
      "Launching in Kenya? Get M-Pesa payments, a local website, SEO and branding set up by a Nairobi-based developer. Book a free call.",
    h1: "A Local Tech Partner for Companies Expanding into Kenya",
    intro:
      "Foreign companies often struggle with the details that make a product work in Kenya: M-Pesa payments, mobile-first design, local search habits and trusted branding. I handle those details so your launch works from day one.",
    primaryKeyword: "M-Pesa integration for international companies",
    secondaryKeywords: ["launch product in Kenya", "Kenya market entry technology", "Daraja API developer"],
    currency: "USD",
    challengesHeading: "Why companies entering Kenya need someone on the ground",
    challenges: [
      {
        heading: "Cards are not how Kenya pays",
        text: "Most customers pay with M-Pesa, not credit cards. A checkout built only around Stripe or PayPal will lose a large share of buyers before they finish paying.",
      },
      {
        heading: "Most users are on phones and unstable data",
        text: "Pages that work on fibre in Europe can feel broken on a mid-range Android over mobile data. Heavy sites lose customers quietly.",
      },
      {
        heading: "Integration is harder than the docs suggest",
        text: "Safaricom's Daraja API involves STK Push callbacks, shortcodes, go-live approval and reconciliation. First attempts by teams unfamiliar with it often stall or fail in production.",
      },
      {
        heading: "Trust has to be earned locally",
        text: "Kenyan customers look for local contact details, local payment options and a presence that feels established. A foreign brand without them looks risky.",
      },
    ],
    whyWorkWithMe: [
      { heading: "M-Pesa and local payments", text: "Daraja STK Push, C2B and B2C integrations built and tested for the Kenyan market." },
      { heading: "Mobile-first and fast", text: "Sites designed for the phones and connection speeds your Kenyan customers actually use." },
      { heading: "On the ground", text: "Based in Nairobi, so I can handle local setup, testing and brand presence in person." },
    ],
    deliverables: [
      { heading: "Working M-Pesa payments", text: "STK Push checkout, payment confirmation, reconciliation and a tested go-live, not just a sandbox demo." },
      { heading: "A mobile-first Kenyan website", text: "Lightweight pages that load quickly on 3G and 4G, with local contact details and trust signals." },
      { heading: "Local search and listings", text: "Google Business Profile, local keywords and content that match how Kenyans search." },
      { heading: "Branding for the local audience", text: "Messaging, visuals and social presence adapted to Kenyan customers rather than copied from your home market." },
      { heading: "Support while you learn the market", text: "Ongoing fixes and adjustments after launch as you see how real customers behave." },
    ],
    workingModel: {
      heading: "How we would work together",
      text: "I am in Nairobi, so I can test payments on real Kenyan phones and numbers, handle local setup in person and join calls in your time zone. We start with a scoping call, agree what a successful launch looks like, and I report weekly until you are live and stable.",
    },
    costOfWaiting:
      "A launch without M-Pesa or a fast mobile experience usually means low conversion, which is often misread as weak demand. Companies then spend months and marketing budget before discovering the product was fine and the setup was wrong. Fixing the foundations first is cheaper than diagnosing the problem later.",
    faqs: [
      {
        q: "Do I need a Kenyan company to use M-Pesa?",
        a: "To receive M-Pesa payments directly you normally need a paybill or till number, which requires a registered business. I can advise on the options for foreign companies, including working through a local partner or payment aggregator, and set up whichever route you choose.",
      },
      {
        q: "How long does an M-Pesa integration take?",
        a: "Development can be quick, but Safaricom's go-live approval and your account setup add time. I will give a realistic timeline after reviewing your situation, and I handle the technical steps while you handle the business paperwork.",
      },
      {
        q: "Can you help beyond payments?",
        a: "Yes. I can build the website, set up local SEO, create branding and connect your systems, so you work with one person rather than coordinating several vendors.",
      },
    ],
    popularServices: ["payment-integrations", "web-development", "seo", "digital-marketing"],
    whatsappMessage: "Hi Samuel, we are planning to launch in Kenya and need a technical partner.",
  },
  {
    slug: "east-africa",
    country: "East Africa",
    flags: ["ke", "ug", "tz", "rw"],
    title: "Web Developer in East Africa | Uganda, Tanzania, Rwanda",
    description:
      "Web development, mobile-money integration and branding for businesses in Uganda, Tanzania, Rwanda and across East Africa.",
    h1: "Web Development & Branding Across East Africa",
    intro:
      "Based in Nairobi, I work with businesses in Uganda, Tanzania, Rwanda, Ethiopia and neighbouring markets that want professional websites, automation and brands without hiring an overseas agency.",
    primaryKeyword: "web developer East Africa",
    secondaryKeywords: ["website design Uganda", "website design Tanzania", "web development Rwanda"],
    currency: "USD",
    challengesHeading: "Why East African businesses need a regional developer",
    challenges: [
      {
        heading: "Overseas agencies do not understand your customers",
        text: "Foreign teams design for card payments and fast broadband. Your customers use mobile money and mobile data, and a site that ignores that does not sell.",
      },
      {
        heading: "Local options are uneven",
        text: "Many local providers stop at a basic brochure site. Businesses that need payments, automation or integrations struggle to find someone who can deliver all of it.",
      },
      {
        heading: "Mobile money is fragmented",
        text: "M-Pesa, MTN MoMo, Airtel Money and others work differently in each country. A system that handles only one limits where you can grow.",
      },
      {
        heading: "Growing across borders is complicated",
        text: "Selling in Uganda, Tanzania and Rwanda means different currencies, languages and expectations, and a website that can handle all of them.",
      },
    ],
    whyWorkWithMe: [
      { heading: "Regional understanding", text: "I know how customers pay, search and shop across the region." },
      { heading: "Same time zone", text: "East Africa Time means live calls without scheduling pain." },
      { heading: "Mobile money ready", text: "Payment integrations can be tailored to the mobile-money providers your customers use." },
    ],
    deliverables: [
      { heading: "A website built for regional mobile users", text: "Fast, lightweight pages that work on mid-range phones and limited data." },
      { heading: "Mobile-money payments", text: "Integrations with the providers your customers use, such as M-Pesa, MTN MoMo and Airtel Money, based on your country." },
      { heading: "Multi-currency and multi-language support", text: "Pricing and content that adapt for Kenya, Uganda, Tanzania and Rwanda, including Swahili and French where needed." },
      { heading: "Automation and reporting", text: "Orders, stock and customer data connected so you can manage several locations from one dashboard." },
      { heading: "Brand and marketing assets", text: "A recognisable identity and social content that works across the region." },
    ],
    workingModel: {
      heading: "How we would work together",
      text: "We share the same time zone, so calls happen at normal hours and questions get same-day answers. I can meet in person if you are in Nairobi or travel for larger projects, and I work with you on a fixed scope with milestone payments.",
    },
    costOfWaiting:
      "Competitors who accept mobile money online and show up in local search are already capturing the customers you are missing. Every month without proper online payment and visibility is revenue going to businesses that made the change earlier.",
    faqs: [
      {
        q: "Which mobile-money providers can you integrate?",
        a: "I can work with M-Pesa through Daraja, and with providers such as MTN MoMo and Airtel Money depending on your country and the provider's available APIs. Availability varies, so I confirm the options for your market at the start.",
      },
      {
        q: "Do you work with businesses outside Kenya?",
        a: "Yes. I work remotely with clients in Uganda, Tanzania, Rwanda, Ethiopia and neighbouring markets, and can travel for larger projects.",
      },
      {
        q: "Can I pay in my local currency?",
        a: "Quotes are in USD, and payment can usually be arranged through mobile money, bank transfer or card. We agree the method at the start so there is no confusion later.",
      },
    ],
    popularServices: ["web-development", "payment-integrations", "graphic-design", "digital-marketing"],
    whatsappMessage: "Hi Samuel, I found you from the East Africa page and would like to discuss a project.",
  },
];

export const getMarket = (slug?: string) => MARKETS.find((m) => m.slug === slug);