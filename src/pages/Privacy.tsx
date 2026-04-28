import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <main className="bg-paper min-h-screen">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-olive mb-4">
          Legal · Updated April 2026
        </p>
        <h1 className="font-heading text-4xl md:text-5xl text-ink leading-tight">
          Privacy Policy
        </h1>
        <p className="font-body text-base text-ink/70 mt-4 max-w-2xl">
          How Samuel A. Emoni ("I", "me") collects, uses, and protects information you share through emonisamuel.co.ke and related professional engagements.
        </p>

        <div className="mt-12 space-y-10 font-body text-[15px] text-ink/85 leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">1. Information I Collect</h2>
            <p>
              When you contact me through the website, email, WhatsApp, or LinkedIn, I receive the
              details you choose to share — typically your name, email address, phone number,
              organization, and a description of your project or inquiry. The site itself collects
              minimal anonymous analytics (page views, device type, referrer) to improve content.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">2. How I Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To respond to inquiries and provide proposals or quotations.</li>
              <li>To deliver contracted consulting, development, or training services.</li>
              <li>To send invoices, project updates, and relevant follow-ups.</li>
              <li>To improve the website experience and content relevance.</li>
            </ul>
            <p className="mt-3">
              I do not sell, rent, or trade your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">3. Data Storage & Security</h2>
            <p>
              Client data is stored on reputable cloud platforms with industry-standard encryption
              in transit (TLS) and at rest. Access is restricted to me and, where strictly necessary,
              vetted collaborators bound by confidentiality. Project credentials shared during
              engagements are stored in encrypted password managers and rotated or deleted at
              project close.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">4. Confidentiality</h2>
            <p>
              All commercial conversations, source code, designs, and business information shared
              during engagements are treated as confidential by default — whether or not a separate
              NDA is signed. I am happy to sign mutual NDAs on request.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">5. Cookies & Analytics</h2>
            <p>
              The site uses essential cookies for navigation and may use lightweight, privacy-respecting
              analytics. No advertising trackers, fingerprinting, or third-party retargeting pixels
              are deployed.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">6. Your Rights</h2>
            <p>
              Under the Kenya Data Protection Act, 2019, you have the right to access, correct, or
              request deletion of personal data I hold about you. To exercise any of these rights,
              email{" "}
              <a className="text-ember underline" href="mailto:samuelemoni18@gmail.com">
                samuelemoni18@gmail.com
              </a>
              . I will respond within 14 working days.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">7. Third-Party Services</h2>
            <p>
              Some projects involve integrations with platforms such as M-Pesa, Stripe, Google
              Workspace, or hosting providers. Their handling of data is governed by their own
              privacy policies, which I will reference in any project requiring such integrations.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">8. Updates</h2>
            <p>
              This policy may be updated periodically. Material changes will be communicated to
              active clients by email. The "Updated" date at the top reflects the latest revision.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">9. Contact</h2>
            <p>
              Samuel A. Emoni · Nairobi, Kenya<br />
              Email: <a className="text-ember underline" href="mailto:samuelemoni18@gmail.com">samuelemoni18@gmail.com</a><br />
              Phone: <a className="text-ember underline" href="tel:+254727492545">+254 727 492 545</a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-ink/10">
          <Link to="/contact" className="inline-block text-ember font-body text-sm hover:underline">
            Have a question about this policy? Contact me →
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Privacy;
