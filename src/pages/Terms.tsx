import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <main className="bg-paper min-h-screen">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-olive mb-4">
          Legal · Updated April 2026
        </p>
        <h1 className="font-heading text-4xl md:text-5xl text-ink leading-tight">
          Terms & Conditions
        </h1>
        <p className="font-body text-base text-ink/70 mt-4 max-w-2xl">
          The terms below govern use of emonisamuel.co.ke and any professional engagement with
          Samuel A. Emoni unless superseded by a signed contract.
        </p>

        <div className="mt-12 space-y-10 font-body text-[15px] text-ink/85 leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">1. Acceptance</h2>
            <p>
              By browsing this website, requesting a proposal, or engaging my services, you agree
              to these Terms. If you do not agree, please discontinue use of the site and decline
              the engagement.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">2. Services Offered</h2>
            <p>
              I provide digital consultancy, system design and architecture, web and software
              development, branding, payment integrations, automation, API integration, and IT
              support. Each engagement is scoped through a written proposal or Statement of Work
              (SOW) which forms the binding agreement between parties.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">3. Quotations & Pricing</h2>
            <p>
              Quotations are valid for 30 days from issue. Prices are quoted in Kenyan Shillings (KES)
              or US Dollars (USD) as agreed. Out-of-scope work is billed separately at the published
              hourly or project rate after written approval from the client.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">4. Payment Terms</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Project engagements: 50% deposit on signing, balance on delivery (or per milestone schedule).</li>
              <li>Retainers: invoiced monthly in advance.</li>
              <li>Rescue & advisory: invoiced weekly or per agreed cadence.</li>
              <li>Accepted methods: M-Pesa, bank transfer, Stripe, or Wise.</li>
              <li>Overdue invoices accrue 2% interest per month after a 7-day grace period.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">5. Deliverables & Revisions</h2>
            <p>
              Each SOW lists deliverables and the number of revision rounds included. Additional
              revisions beyond the agreed number are billable. Sign-off is deemed given if no
              written feedback is received within 7 working days of delivery.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">6. Intellectual Property</h2>
            <p>
              On full payment, the client owns the final deliverables (code, designs, documents)
              produced specifically for the project. I retain ownership of pre-existing tools,
              libraries, frameworks, and methodologies, and I reserve the right to showcase the
              work in my portfolio unless an NDA states otherwise.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">7. Client Responsibilities</h2>
            <p>
              Clients agree to provide timely access to required information, accounts, and
              decision-makers. Delays caused by missing inputs may shift the project timeline and,
              where significant, may incur a re-mobilization fee.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">8. Warranties & Support</h2>
            <p>
              Custom-built systems include 30 days of free post-launch bug fixes related to delivered
              functionality. Beyond that period, support is available under a maintenance retainer.
              Third-party platforms, hosting outages, and changes requested by the client after sign-off
              are not covered by the warranty.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">9. Limitation of Liability</h2>
            <p>
              My total liability for any claim arising from an engagement is limited to the fees
              paid for that engagement in the 3 months preceding the claim. I am not liable for
              indirect, incidental, or consequential damages including loss of profit, data, or
              business opportunity.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">10. Termination</h2>
            <p>
              Either party may terminate an engagement with 14 days' written notice. The client
              remains liable for all work completed up to the termination date. Deposits are
              non-refundable once discovery work has commenced.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">11. Confidentiality</h2>
            <p>
              Both parties agree to keep confidential all non-public information shared during the
              engagement. This obligation survives termination of the contract.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">12. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the Republic of Kenya. Disputes shall first
              be addressed through good-faith negotiation, and if unresolved, through arbitration
              in Nairobi under the Arbitration Act, 1995.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-forest mb-3">13. Contact</h2>
            <p>
              Samuel A. Emoni · Nairobi, Kenya<br />
              Email: <a className="text-ember underline" href="mailto:emonisamuel54@gmail.com">emonisamuel54@gmail.com</a><br />
              Phone: <a className="text-ember underline" href="tel:+254727492545">+254 727 492 545</a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-ink/10">
          <Link to="/contact" className="inline-block text-ember font-body text-sm hover:underline">
            Ready to start a project? Contact me →
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Terms;
