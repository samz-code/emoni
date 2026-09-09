import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const sections = [
  { id: "collection", title: "1. Information Collection" },
  { id: "usage", title: "2. How Information is Used" },
  { id: "storage", title: "3. Storage & Security" },
  { id: "confidentiality", title: "4. Confidentiality & NDAs" },
  { id: "cookies", title: "5. Cookies & Tracking" },
  { id: "rights", title: "6. Data Rights (Kenya Act 2019)" },
  { id: "retention", title: "7. Retention Policy" },
  { id: "third-parties", title: "8. Third-Party Platforms" },
  { id: "international", title: "9. International Data Transfers" },
  { id: "updates", title: "10. Policy Updates" },
  { id: "contact", title: "11. Contact & Data Controller" },
];

const Privacy = () => {
  const [activeSection, setActiveSection] = useState("collection");

  // SEO Meta Variables
  const canonicalUrl = "https://www.emonisamuel.co.ke/privacy";
  const pageTitle = "Privacy Policy | Samuel A. Emoni";
  const pageDescription = "Comprehensive privacy standards, data handling procedures, and legal compliance framework under the Kenya Data Protection Act, 2019 governing Samuel A. Emoni's digital services.";
  const ogImage = "https://www.emonisamuel.co.ke/og-image.jpg";

  // WebPage Structured Data Schema
  const privacySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": canonicalUrl,
    "publisher": {
      "@type": "Person",
      "name": "Samuel A. Emoni",
      "url": "https://www.emonisamuel.co.ke"
    }
  };

  // IntersectionObserver for active section navigation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -110;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <>
      <Helmet>
        {/* Core Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(privacySchema)}
        </script>
      </Helmet>

      <main className="bg-paper min-h-screen selection:bg-ember/20 selection:text-ember">
        {/* Header Hero Banner */}
        <section className="bg-forest border-b border-border/20 py-16 sm:py-20 md:py-28 text-cream relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <span className="inline-block bg-ember/15 border border-ember/30 text-ember px-3.5 py-1.5 rounded-full font-body text-xs font-semibold uppercase tracking-wider mb-6">
                Data Protection & Privacy Framework
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-cream font-bold tracking-tight leading-none">
                Privacy Policy
              </h1>
              <p className="font-body text-base sm:text-lg text-cream/80 mt-6 leading-relaxed max-w-2xl">
                Transparent information handling practices detailing how Samuel A. Emoni collects, stores, secures, and processes client and visitor data in compliance with statutory frameworks.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-cream/70 font-body text-xs mt-8 pt-6 border-t border-cream/15">
                <span>Last Updated: April 2026</span>
                <span className="hidden sm:inline text-cream/30">/</span>
                <span>Statute: Kenya Data Protection Act (2019)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-snow/95 backdrop-blur-md border border-border/80 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <h3 className="font-heading text-base font-semibold text-ink">Zero Data Monetization</h3>
              <p className="font-body text-xs text-ink/70 mt-1 leading-snug">
                Your details are never sold, rented, or commercialized to advertising networks or broker aggregators.
              </p>
            </div>

            <div className="bg-snow/95 backdrop-blur-md border border-border/80 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <h3 className="font-heading text-base font-semibold text-ink">Encrypted Credential Isolation</h3>
              <p className="font-body text-xs text-ink/70 mt-1 leading-snug">
                Shared API credentials and database keys are vaulted in secure password managers and purged post-launch.
              </p>
            </div>

            <div className="bg-snow/95 backdrop-blur-md border border-border/80 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <h3 className="font-heading text-base font-semibold text-ink">Statutory Compliance</h3>
              <p className="font-body text-xs text-ink/70 mt-1 leading-snug">
                Fully aligned with the provisions and data subject rights of the Kenya Data Protection Act, 2019.
              </p>
            </div>
          </div>
        </section>

        {/* Mobile Section Nav Bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-snow/90 backdrop-blur-md border-b border-border py-3 px-4 shadow-xs overflow-x-auto no-scrollbar">
          <div className="flex gap-2 w-max">
            {sections.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-3 py-1.5 rounded-full font-body text-xs whitespace-nowrap transition-all ${
                  activeSection === item.id
                    ? "bg-forest text-cream font-medium shadow-xs"
                    : "bg-paper text-ink/70 hover:bg-border/40"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            
            {/* Sticky Navigation Sidebar */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-28 space-y-4 bg-snow border border-border/80 p-5 rounded-xl shadow-sm">
                <div className="flex items-center justify-between px-2 pb-3 border-b border-border">
                  <p className="font-heading text-xs font-semibold uppercase tracking-wider text-ink/60">
                    Policy Structure
                  </p>
                  <span className="text-[10px] bg-forest/10 text-forest font-semibold px-2 py-0.5 rounded-full">
                    11 Sections
                  </span>
                </div>
                
                <nav className="space-y-0.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                  {sections.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg font-body text-xs transition-all block ${
                          isActive
                            ? "bg-forest text-cream font-medium shadow-xs"
                            : "text-ink/70 hover:bg-paper hover:text-ink"
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="pt-4 border-t border-border/80 bg-paper/50 p-3 rounded-lg">
                  <p className="font-body text-xs text-ink/70 font-medium">Need legal or privacy clarification?</p>
                  <Link 
                    to="/contact" 
                    className="inline-block text-ember font-body text-xs font-semibold hover:underline mt-1.5"
                  >
                    Direct Inquiry Channel &rarr;
                  </Link>
                </div>
              </div>
            </aside>

            {/* Detailed Body Content */}
            <div className="lg:col-span-8 space-y-10 font-body text-base text-ink/85 leading-relaxed">
              
              <section id="collection" className="scroll-mt-28 bg-snow/80 border border-border/70 p-6 sm:p-8 rounded-xl shadow-xs">
                <h2 className="font-heading text-2xl font-bold text-forest mb-4">1. Information Collection</h2>
                <p className="mb-4">
                  Information is gathered directly through user interaction and automatically via privacy-first Web operational analytics when accessing <strong>emonisamuel.co.ke</strong>.
                </p>

                <div className="space-y-4 text-sm mt-4">
                  <div className="p-4 bg-paper rounded-lg border border-border/80">
                    <h3 className="font-semibold text-ink mb-1">A. Information Provided Directly</h3>
                    <p className="text-ink/80">
                      When initiating contact via form submissions, direct email, phone, WhatsApp, or professional platforms (LinkedIn), the following personal data points are collected:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-ink/75">
                      <li>Full Name and Corporate Designation</li>
                      <li>Business Email Address and Contact Phone Number</li>
                      <li>Company/Organization Legal Name and Geographic Location</li>
                      <li>Project specifications, technical requirements, and financial budgets</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-paper rounded-lg border border-border/80">
                    <h3 className="font-semibold text-ink mb-1">B. Software Engineering Credentials & Data</h3>
                    <p className="text-ink/80">
                      During commercial development contracts, clients may provide access to technical assets, including repository credentials, cloud server keys (AWS, Vercel, Supabase), API tokens (M-Pesa, Stripe), and internal database schemas.
                    </p>
                  </div>

                  <div className="p-4 bg-paper rounded-lg border border-border/80">
                    <h3 className="font-semibold text-ink mb-1">C. Automated Technical Telemetry</h3>
                    <p className="text-ink/80">
                      Automated systems log non-identifiable technical data including device browser types, operating system profiles, coarse geographic region (city level), landing pages visited, and session duration.
                    </p>
                  </div>
                </div>
              </section>

              <section id="usage" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-heading text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">2. How Information is Used</h2>
                <p className="mb-4">
                  Collected data is processed strictly for legitimate commercial and engineering purposes under lawful conditions:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                  {[
                    "Formulating technical architecture proposals & cost estimates",
                    "Executing contracted software engineering & consulting work",
                    "Facilitating financial invoicing, payments, & tax compliance",
                    "Maintaining ongoing server health & API operational monitoring",
                    "Transmitting critical system updates & milestone sign-offs",
                    "Ensuring compliance with Kenyan statutory requirements"
                  ].map((text, idx) => (
                    <div key={idx} className="bg-snow border border-border/80 p-3.5 rounded-lg text-sm">
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-ink/70 bg-paper p-3.5 rounded-lg border border-border/50">
                  <strong>Strict Non-Disclosure Guarantee:</strong> Personal or commercial data is strictly prohibited from sale, licensing, barter, or transfer to third-party ad brokers or data aggregators.
                </p>
              </section>

              <section id="storage" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-heading text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">3. Data Storage & Security</h2>
                <p className="mb-4">
                  Industry-grade administrative, technical, and physical safeguards protect all stored personal and project data from unauthorized access, loss, or disclosure:
                </p>
                
                <div className="space-y-3 text-sm">
                  <div className="bg-snow border border-border/80 p-4 rounded-lg">
                    <strong className="block text-ink font-semibold mb-1">Encryption Protocols</strong>
                    <p className="text-ink/75">
                      All data in transit is encrypted using transport layer security (TLS 1.3). Data at rest resides on encrypted cloud storage instances utilizing AES-256 standard encryption.
                    </p>
                  </div>

                  <div className="bg-snow border border-border/80 p-4 rounded-lg">
                    <strong className="block text-ink font-semibold mb-1">Credential Vaulting & Rotation</strong>
                    <p className="text-ink/75">
                      Client API keys, database connection strings, and server credentials are never stored in plain text or public repositories. They are maintained within isolated zero-knowledge password vaults (1Password/Bitwarden) and purged or rotated upon project handover.
                    </p>
                  </div>
                </div>
              </section>

              <section id="confidentiality" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-heading text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">4. Confidentiality & NDAs</h2>
                <p className="mb-3">
                  All business ideas, propriety system architectures, source code, graphic designs, and strategic operational communications exchanged during inquiries or engagements are classified as <strong>Strictly Confidential</strong> by default.
                </p>
                <div className="bg-ember/10 border-l-4 border-ember p-4 rounded-r-lg text-sm text-ink/90">
                  <strong className="block text-ink font-semibold mb-0.5">Formal Non-Disclosure Agreements (NDAs)</strong>
                  Standard non-disclosure terms are respected immediately upon initial consultation. Dedicated corporate Non-Disclosure Agreements (NDAs) can be executed prior to technical discovery sessions upon request.
                </div>
              </section>

              <section id="cookies" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-heading text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">5. Cookies & Tracking</h2>
                <p className="mb-3">
                  This website operates on an essential-only tracking model:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-ink/80">
                  <li><strong>Essential Session Storage:</strong> Temporary functional storage used to maintain navigation state, accessibility preferences, and UI responsiveness.</li>
                  <li><strong>Zero Behavioral Retargeting:</strong> Meta Pixel, Google Remarketing, or invasive fingerprinting scripts are not deployed on this domain.</li>
                  <li><strong>Privacy Analytics:</strong> Anonymized, cookieless metrics may be logged to evaluate aggregate traffic performance without identifying individual visitors.</li>
                </ul>
              </section>

              <section id="rights" className="scroll-mt-28 bg-snow border border-forest/30 p-6 sm:p-8 rounded-xl shadow-xs">
                <h2 className="font-heading text-2xl font-bold text-forest mb-4">6. Data Rights (Kenya Data Protection Act, 2019)</h2>
                <p className="mb-4">
                  Pursuant to the provisions of the Kenya Data Protection Act (2019), data subjects maintain enforceable legal rights regarding their personal data:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-paper rounded-lg border border-border/80">
                    <strong>Right to Access:</strong> Request full disclosure of all personal records maintained about you.
                  </div>
                  <div className="p-3 bg-paper rounded-lg border border-border/80">
                    <strong>Right to Rectification:</strong> Request immediate correction of inaccurate or incomplete records.
                  </div>
                  <div className="p-3 bg-paper rounded-lg border border-border/80">
                    <strong>Right to Erasure ("Right to be Forgotten"):</strong> Request complete purging of personal records where legal retention mandates do not apply.
                  </div>
                  <div className="p-3 bg-paper rounded-lg border border-border/80">
                    <strong>Right to Restriction & Object:</strong> Halt or limit processing of data for specific marketing or non-essential operations.
                  </div>
                </div>

                <p className="mt-4 text-xs text-ink/70">
                  To exercise any statutory right, submit a written request to <a className="text-ember underline" href="mailto:emonisamuel54@gmail.com">emonisamuel54@gmail.com</a>. Statutory response SLA is guaranteed within <strong>14 business days</strong>.
                </p>
              </section>

              <section id="retention" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-heading text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">7. Retention Policy</h2>
                <p className="mb-3">
                  Information is retained only for periods necessary to fulfill operational, legal, and financial obligations:
                </p>
                <div className="space-y-2 text-sm text-ink/80">
                  <div className="flex justify-between p-3 bg-snow rounded-lg border border-border/60">
                    <span>Unconverted Inquiry Form Submissions</span>
                    <strong className="text-forest">6 Months</strong>
                  </div>
                  <div className="flex justify-between p-3 bg-snow rounded-lg border border-border/60">
                    <span>Client Credentials & System API Keys</span>
                    <strong className="text-forest">Purged at Launch / Close</strong>
                  </div>
                  <div className="flex justify-between p-3 bg-snow rounded-lg border border-border/60">
                    <span>Invoices & Financial Accounting Logs</span>
                    <strong className="text-forest">7 Years (Tax Statutory Obligation)</strong>
                  </div>
                </div>
              </section>

              <section id="third-parties" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-heading text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">8. Third-Party Platforms</h2>
                <p className="mb-3">
                  Custom software applications regularly require integration with licensed infrastructure providers (e.g., M-Pesa Safaricom Daraja, Stripe, Vercel, Supabase, Google Workspace).
                </p>
                <p className="text-sm text-ink/70">
                  While integration security is handled with rigor, third-party operational infrastructure processing is bound by those respective organizations' privacy policies. Relevant platform policies are outlined during Statement of Work (SOW) drafting.
                </p>
              </section>

              <section id="international" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-heading text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">9. International Data Transfers</h2>
                <p className="text-sm text-ink/80">
                  Where client projects require international cloud host environments (e.g., AWS US-East or EU Central regions), infrastructure setup guarantees that cross-border transfer security complies with statutory requirements through secure cloud vendor agreements.
                </p>
              </section>

              <section id="updates" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-heading text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">10. Policy Updates</h2>
                <p className="text-sm text-ink/80">
                  This Privacy Policy is periodically reviewed to reflect technology shifts, legal requirements, or updated engineering workflows. Material policy adjustments will be communicated to active clients via direct email notification. The "Last Updated" header accurately reflects the operational version date.
                </p>
              </section>

              {/* Direct Contact & Controller Section */}
              <section id="contact" className="scroll-mt-28 bg-forest text-cream p-6 sm:p-8 rounded-xl shadow-lg relative overflow-hidden">
                <h2 className="font-heading text-2xl font-bold text-cream mb-4">11. Contact & Data Controller</h2>
                <p className="text-cream/80 mb-6 text-sm">
                  For formal data privacy inquiries, statutory rights requests, or technical credential management questions, contact the Data Controller directly:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-body text-cream/90 bg-cream/5 p-4 rounded-lg border border-cream/10">
                  <div className="space-y-1">
                    <p className="font-semibold text-cream">Samuel A. Emoni</p>
                    <p className="text-xs text-cream/70">Full-Stack Software Engineer & Technical Lead</p>
                    <p className="text-xs pt-2">Nairobi, Kenya</p>
                  </div>
                  <div className="space-y-2 text-xs sm:border-l sm:border-cream/10 sm:pl-4">
                    <p>
                      Email:{" "}
                      <a href="mailto:emonisamuel54@gmail.com" className="text-cream hover:text-ember underline transition-colors">
                        emonisamuel54@gmail.com
                      </a>
                    </p>
                    <p>
                      Phone:{" "}
                      <a href="tel:+254727492545" className="text-cream hover:text-ember underline transition-colors">
                        +254 727 492 545
                      </a>
                    </p>
                  </div>
                </div>
              </section>

              {/* Bottom Cross Navigation */}
              <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link to="/terms" className="text-forest font-body text-sm font-semibold hover:underline">
                  Read Commercial Terms & Conditions
                </Link>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center justify-center bg-ember text-cream px-6 py-3 rounded-lg font-body text-sm font-semibold hover:bg-ember/90 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
                >
                  Have a Question? Contact Me &rarr;
                </Link>
              </div>

            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Privacy;