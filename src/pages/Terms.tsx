import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const sections = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "services", title: "2. Services & Scope" },
  { id: "pricing", title: "3. Quotations & Pricing" },
  { id: "payments", title: "4. Payment Terms & Billing" },
  { id: "milestones", title: "5. Milestone Delivery & Non-Payment" },
  { id: "deliverables", title: "6. Deliverables & Revisions" },
  { id: "ip", title: "7. Intellectual Property Rights" },
  { id: "client-responsibilities", title: "8. Client Responsibilities" },
  { id: "warranties", title: "9. Warranties & Post-Launch Support" },
  { id: "liability", title: "10. Limitation of Liability" },
  { id: "termination", title: "11. Termination & Cancellations" },
  { id: "confidentiality", title: "12. Confidentiality & Non-Disclosure" },
  { id: "governing-law", title: "13. Governing Law & Arbitration" },
  { id: "contact", title: "14. Contact & Inquiries" },
];

const Terms = () => {
  const [activeSection, setActiveSection] = useState("acceptance");

  // SEO Meta Variables
  const canonicalUrl = "https://www.emonisamuel.co.ke/terms";
  const pageTitle = "Terms & Conditions | Samuel A. Emoni";
  const pageDescription = "Standard commercial terms, service delivery guidelines, payment schedules, and legal framework governing client engagements with Samuel A. Emoni.";
  const ogImage = "https://www.emonisamuel.co.ke/og-image.jpg";

  // WebPage Structured Data Schema
  const termsSchema = {
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

  // IntersectionObserver for active section tracking
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
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />

        <script type="application/ld+json">
          {JSON.stringify(termsSchema)}
        </script>
      </Helmet>

      <main className="bg-paper min-h-screen selection:bg-ember/20 selection:text-ember">
        {/* Header Hero Banner */}
        <section className="bg-forest border-b border-border/20 py-16 sm:py-20 md:py-28 text-cream relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <span className="inline-block bg-ember/15 border border-ember/30 text-ember px-3.5 py-1.5 rounded-full font-body text-xs font-semibold uppercase tracking-wider mb-6">
                Legal & Commercial Framework
              </span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-cream font-bold tracking-tight leading-none">
                Terms & Conditions
              </h1>
              <p className="font-body text-base sm:text-lg text-cream/80 mt-6 leading-relaxed max-w-2xl">
                Transparent, balanced terms establishing collaboration benchmarks, milestone billing, software IP rights, and delivery guarantees.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-cream/70 font-body text-xs mt-8 pt-6 border-t border-cream/15">
                <span>Last Revised: September 2026</span>
                <span className="hidden sm:inline text-cream/30">/</span>
                <span>Jurisdiction: Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </section>

        {/* Commercial Highlights Cards */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-snow/95 backdrop-blur-md border border-border/80 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <h3 className="font-display text-base font-semibold text-ink">Milestone Execution</h3>
              <p className="font-body text-xs text-ink/70 mt-1 leading-snug">Projects are executed in clear phases tied to specific schedule payments.</p>
            </div>

            <div className="bg-snow/95 backdrop-blur-md border border-border/80 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <h3 className="font-display text-base font-semibold text-ink">30-Day Launch Warranty</h3>
              <p className="font-body text-xs text-ink/70 mt-1 leading-snug">Includes 30 days of full post-launch bug fixing for all agreed scope items.</p>
            </div>

            <div className="bg-snow/95 backdrop-blur-md border border-border/80 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <h3 className="font-display text-base font-semibold text-ink">Paid Asset Delivery</h3>
              <p className="font-body text-xs text-ink/70 mt-1 leading-snug">Code and deliverables are transferred strictly up to the paid milestone.</p>
            </div>
          </div>
        </section>

        {/* Mobile Horizontal Section Bar */}
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

        {/* Content Layout */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            
            {/* Sticky Sidebar */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-28 space-y-4 bg-snow border border-border/80 p-5 rounded-xl shadow-sm">
                <div className="flex items-center justify-between px-2 pb-3 border-b border-border">
                  <p className="font-display text-xs font-semibold uppercase tracking-wider text-ink/60">
                    Table of Contents
                  </p>
                  <span className="text-[10px] bg-forest/10 text-forest font-semibold px-2 py-0.5 rounded-full">
                    14 Sections
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
                  <p className="font-body text-xs text-ink/70 font-medium">Need a custom enterprise contract?</p>
                  <Link 
                    to="/contact" 
                    className="inline-block text-ember font-body text-xs font-semibold hover:underline mt-1.5"
                  >
                    Request a Tailored SOW &rarr;
                  </Link>
                </div>
              </div>
            </aside>

            {/* Terms Body Content */}
            <div className="lg:col-span-8 space-y-10 font-body text-base text-ink/85 leading-relaxed">
              
              <section id="acceptance" className="scroll-mt-28 bg-snow/80 border border-border/70 p-6 sm:p-8 rounded-xl shadow-xs">
                <h2 className="font-display text-2xl font-bold text-forest mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing emonisamuel.co.ke, commissioning a software project, or retaining Samuel A. Emoni for software architecture and development services, you explicitly agree to be bound by these Terms & Conditions.
                </p>
                <p className="mt-3 text-ink/70 text-sm bg-paper/80 p-4 rounded-lg border border-border/50">
                  If acting on behalf of a corporation, business entity, or public organization, you represent that you hold full legal authorization to execute binding agreements for that entity.
                </p>
              </section>

              <section id="services" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-display text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">2. Services & Scope</h2>
                <p className="mb-4">
                  I specialize in enterprise web applications, mobile platforms, payment integrations (M-Pesa, Stripe, cards), API architectures, and technical auditing.
                </p>
                <p className="mb-4 font-medium text-ink">
                  Every project engagement is formally bound by an issued Statement of Work (SOW) outlining:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                  {[
                    "Detailed technical features & specs",
                    "Agreed milestones & payment schedule",
                    "Fixed or hourly financial parameters",
                    "Allocated UAT & revision cycles"
                  ].map((text, idx) => (
                    <div key={idx} className="bg-snow border border-border/80 p-3.5 rounded-lg text-sm">
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section id="pricing" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-display text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">3. Quotations & Pricing</h2>
                <p className="mb-4">
                  Official project quotes remain valid for <strong>30 calendar days</strong> from issuance. Pricing is quoted in Kenyan Shillings (KES) or US Dollars (USD) as defined in the primary agreement.
                </p>
                <div className="bg-ember/10 border-l-4 border-ember p-4 rounded-r-lg text-sm text-ink/90">
                  <strong className="block text-ink font-semibold mb-0.5">Scope Expansion Policy</strong>
                  Feature requests, design pivots, or integrations outside the signed SOW will be estimated separately and billed at the standard rate of <strong>$40 USD / KES 5,000 per hour</strong> upon written approval.
                </div>
              </section>

              <section id="payments" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-display text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">4. Payment Terms & Billing</h2>
                <p className="mb-4">Standard billing structures apply based on structured project phases:</p>
                
                <div className="space-y-3 mb-6">
                  <div className="border border-border p-4 rounded-xl bg-snow flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div>
                      <span className="font-display font-semibold text-ink text-sm block">Milestone Billing</span>
                      <span className="text-xs text-ink/70">Projects are divided into defined milestones with payment due prior to commencing work on each phase.</span>
                    </div>
                    <span className="bg-ember/15 text-ember text-xs font-semibold px-3 py-1 rounded-full shrink-0">Milestone-Based</span>
                  </div>

                  <div className="border border-border p-4 rounded-xl bg-snow flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div>
                      <span className="font-display font-semibold text-ink text-sm block">Monthly Retainers</span>
                      <span className="text-xs text-ink/70">Invoiced in advance on the 1st of each month with net-7 payment terms.</span>
                    </div>
                    <span className="bg-forest/15 text-forest text-xs font-semibold px-3 py-1 rounded-full shrink-0">Monthly Advance</span>
                  </div>
                </div>

                <p className="text-sm text-ink/70">
                  Supported channels include M-Pesa Paybill/Till, Bank Wire Transfers (EFT/RTGS), and Card payments. Overdue balances beyond 7 calendar days accrue interest at <strong>2% per month</strong> until settled.
                </p>
              </section>

              <section id="milestones" className="scroll-mt-28 bg-snow border border-ember/30 p-6 sm:p-8 rounded-xl shadow-xs">
                <h2 className="font-display text-2xl font-bold text-forest mb-4">5. Milestone Execution, Default & Cancellation</h2>
                <p className="mb-4">
                  To ensure structured development and risk mitigation, all software engagements operate on a sequential milestone framework.
                </p>
                
                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-paper rounded-lg border border-border/80">
                    <h3 className="font-semibold text-ink mb-1">Non-Payment & Cancellation</h3>
                    <p className="text-ink/80">
                      If the client fails or declines to make payments as agreed for any milestone schedule, development work will immediately halt. We reserve the explicit right to cancel the project contract due to non-payment.
                    </p>
                  </div>

                  <div className="p-4 bg-paper rounded-lg border border-border/80">
                    <h3 className="font-semibold text-ink mb-1">No-Refund Policy</h3>
                    <p className="text-ink/80">
                      All payments made for completed or active milestones are strictly non-refundable. Funds paid compensate for specialized engineering time, operational overhead, and completed work units up to that date.
                    </p>
                  </div>

                  <div className="p-4 bg-paper rounded-lg border border-border/80">
                    <h3 className="font-semibold text-ink mb-1">Deliverables Up to Paid Reach</h3>
                    <p className="text-ink/80">
                      In the event of contract cancellation or non-payment, the client will be handed over source code, assets, and project documentation strictly corresponding to the milestones fully paid for up to that point. Unpaid features or future phase assets will remain unreleased.
                    </p>
                  </div>
                </div>
              </section>

              <section id="deliverables" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-display text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">6. Deliverables & Revisions</h2>
                <p className="mb-3">
                  All fixed-scope milestone engagements include up to <strong>two (2) rounds of revisions</strong> for UI designs and functional flows within that specific milestone's scope bounds.
                </p>
                <div className="bg-snow border border-border/80 p-4 rounded-lg text-sm text-ink/80">
                  <strong>Implicit Sign-off:</strong> Deliverables submitted for User Acceptance Testing (UAT) are deemed accepted if no functional defects or feedback are submitted within <strong>7 working days</strong>.
                </div>
              </section>

              <section id="ip" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-display text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">7. Intellectual Property Rights</h2>
                <p className="mb-3">
                  Upon settlement of milestone fees, ownership of custom codebases and assets associated with those paid milestones transfers to the client. Full total project ownership transfers upon 100% contract settlement.
                </p>
                <p className="text-sm text-ink/70">
                  Pre-existing internal utility tools, reusable helper libraries, and boilerplate software remain my intellectual property, granted to you under a non-exclusive, perpetual license.
                </p>
              </section>

              <section id="client-responsibilities" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-display text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">8. Client Responsibilities</h2>
                <p className="mb-3">
                  Timely delivery requires prompt provision of branding assets, third-party API credentials, server access, and review feedback.
                </p>
                <p className="text-sm text-ink/70 bg-paper/60 p-3 rounded-lg border border-border/40">
                  Project stalls exceeding 21 consecutive days due to client delays may trigger a 10% re-activation fee to re-align development resources.
                </p>
              </section>

              <section id="warranties" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-display text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">9. Warranties & Post-Launch Support</h2>
                <p className="mb-4">
                  Custom applications include a <strong>30-day post-launch warranty</strong> starting from production deployment, covering free remediation of scoped software defects.
                </p>
                <div className="bg-snow border border-border p-4 rounded-lg text-sm text-ink/70">
                  <p className="font-semibold text-ink mb-1.5">Warranty Exclusions:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Third-party server, hosting, or provider outages</li>
                    <li>Code modifications made by external third-party developers</li>
                    <li>Breaking changes introduced by external API updates (e.g., M-Pesa/Google)</li>
                  </ul>
                </div>
              </section>

              <section id="liability" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-display text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">10. Limitation of Liability</h2>
                <p className="mb-3">
                  Total aggregate liability for any legal or technical claims connected to an engagement shall not exceed the total fees paid by the client under that specific contract in the 3 months preceding the claim.
                </p>
              </section>

              <section id="termination" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-display text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">11. Termination & Cancellations</h2>
                <p>
                  Either party may terminate an active agreement with <strong>14 days' written notice</strong>. The client remains responsible for all billable hours and completed milestones prior to termination.
                </p>
              </section>

              <section id="confidentiality" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-display text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">12. Confidentiality & Non-Disclosure</h2>
                <p>
                  Both parties agree to treat business logic, customer data, and source code as strictly confidential perpetually. Mutual NDAs are available upon request prior to project initiation.
                </p>
              </section>

              <section id="governing-law" className="scroll-mt-28 bg-snow/30 border border-border/50 p-6 sm:p-8 rounded-xl">
                <h2 className="font-display text-2xl font-bold text-forest mb-4 pb-3 border-b border-border">13. Governing Law & Arbitration</h2>
                <p>
                  These terms are governed by the substantive laws of the <strong>Republic of Kenya</strong>. Any unresolved disputes shall be submitted to binding arbitration in Nairobi under the Kenya Arbitration Act.
                </p>
              </section>

              {/* Direct Contact Card */}
              <section id="contact" className="scroll-mt-28 bg-forest text-cream p-6 sm:p-8 rounded-xl shadow-lg relative overflow-hidden">
                <h2 className="font-display text-2xl font-bold text-cream mb-4">14. Contact & Inquiries</h2>
                <p className="text-cream/80 mb-6 text-sm">
                  Questions regarding these commercial terms or requesting custom contract terms? Reach out directly:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-body text-cream/90 bg-cream/5 p-4 rounded-lg border border-cream/10">
                  <div className="space-y-1">
                    <p className="font-semibold text-cream">Samuel A. Emoni</p>
                    <p className="text-xs text-cream/70">Software Architect & Tech Lead</p>
                    <p className="text-xs pt-2">Nairobi, Kenya</p>
                  </div>
                  <div className="space-y-2 text-xs sm:border-l sm:border-cream/10 sm:pl-4">
                    <p>
                      <a href="mailto:emonisamuel54@gmail.com" className="text-cream hover:text-ember underline transition-colors">
                        emonisamuel54@gmail.com
                      </a>
                    </p>
                    <p>
                      <a href="tel:+254727492545" className="text-cream hover:text-ember underline transition-colors">
                        +254 727 492 545
                      </a>
                    </p>
                  </div>
                </div>
              </section>

              {/* Navigation CTAs */}
              <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link to="/privacy" className="text-forest font-body text-sm font-semibold hover:underline">
                  Read Privacy Policy
                </Link>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center justify-center bg-ember text-cream px-6 py-3 rounded-lg font-body text-sm font-semibold hover:bg-ember/90 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
                >
                  Initiate a Project Engagement &rarr;
                </Link>
              </div>

            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Terms;