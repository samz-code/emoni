import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { useIndustries, useIndustry, useIndustryServices } from "@/lib/industries";

export default function IndustryDetail() {
  const { slug } = useParams();
  const industryQuery = useIndustry(slug);
  const industry = industryQuery.data;
  const servicesQuery = useIndustryServices(industry?.service_slugs);
  const { data: industries = [] } = useIndustries();

  if (industryQuery.isPending) {
    return <main className="min-h-[60vh] animate-pulse bg-[#FBF9F5]" aria-label="Loading industry details" />;
  }

  if (industryQuery.error) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-3xl px-5 py-20">
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          This industry profile could not be loaded. Please try again later.
        </p>
        <Link to="/industries" className="mt-5 inline-flex text-sm font-semibold text-[#007979] underline">Browse all industries</Link>
      </main>
    );
  }

  if (!industry) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-3xl px-5 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007979]">Industry profile</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">This industry page is not available.</h1>
        <Link to="/industries" className="mt-5 inline-flex text-sm font-semibold text-[#007979] underline">Browse all industries</Link>
      </main>
    );
  }

  const relatedIndustries = industries.filter((item) => item.slug !== industry.slug).slice(0, 3);
  const ctaLink = industry.cta_link || "/contact";
  const ctaAction = /^https?:\/\//i.test(ctaLink)
    ? <a href={ctaLink} target="_blank" rel="noreferrer" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#E7C99A] px-6 text-sm font-semibold text-[#123B36] transition hover:bg-white">{industry.cta_label || "Talk about your project"} <ArrowRight size={16} /></a>
    : <Link to={ctaLink} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#E7C99A] px-6 text-sm font-semibold text-[#123B36] transition hover:bg-white">{industry.cta_label || "Talk about your project"} <ArrowRight size={16} /></Link>;

  return (
    <main className="min-h-screen bg-[#FBF9F5] text-[#1A1A16]">
      <SEO
        title={industry.seo_title || `${industry.name} | Industry Solutions by Emoni Digital`}
        description={industry.seo_description || industry.tagline || industry.description}
        keywords={`${industry.name}, digital solutions Kenya, web development Nairobi`}
        image={industry.hero_image_url || undefined}
      />
      <section className="patterned-surface relative overflow-hidden bg-[#123B36] text-white">
        {industry.hero_image_url && (
          <>
            <img src={industry.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#123B36] via-[#123B36]/90 to-[#123B36]/50" />
          </>
        )}
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <nav aria-label="Breadcrumb" className="mb-12 text-sm text-white/65">
            <Link to="/" className="hover:text-white">Home</Link><span className="mx-2">/</span>
            <Link to="/industries" className="hover:text-white">Industries</Link><span className="mx-2">/</span>
            <span className="text-white">{industry.name}</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#E7C99A]">Industry focus</p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-6xl">{industry.hero_headline || industry.name}</h1>
          {industry.tagline && <p className="mt-5 max-w-2xl text-lg leading-7 text-white/80">{industry.tagline}</p>}
          {ctaAction}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007979]">Understanding your context</p>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Built around the realities of {industry.name.toLowerCase()}.</h2>
          <p className="mt-6 whitespace-pre-line text-base leading-8 text-[#524646]/85">{industry.overview || industry.description}</p>
        </div>
        <aside className="rounded-xl bg-[#EFEAE1] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#007979]">The principle</p>
          <p className="mt-4 font-display text-2xl font-medium leading-snug text-[#1A1A16]">
            Start with what your people need to do. Then make the digital experience support it.
          </p>
        </aside>
      </section>

      {industry.outcomes.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20">
          <div className="grid gap-3 sm:grid-cols-3">
            {industry.outcomes.map((outcome, index) => (
              <div key={outcome} className="rounded-lg border border-[#E8E2D6] bg-white p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#007979]">Outcome {String(index + 1).padStart(2, "0")}</p>
                <p className="mt-3 font-display text-lg font-medium leading-7">{outcome}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007979]">Common priorities</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Challenges worth solving</h2>
            {industry.challenges.length ? (
              <ul className="mt-7 divide-y divide-[#E8E2D6]">
                {industry.challenges.map((challenge) => (
                  <li key={challenge} className="flex gap-4 py-4 text-sm leading-6 text-[#524646]/85">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#007979]" />
                    {challenge}
                  </li>
                ))}
              </ul>
            ) : <p className="mt-5 text-sm text-[#524646]/70">We’ll identify the priorities that matter most to your organisation.</p>}
          </div>
          <div className="patterned-surface rounded-xl bg-[#123B36] p-6 text-white sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E7C99A]">How we help</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Practical, considered solutions</h2>
            {industry.solutions.length ? (
              <ul className="mt-7 space-y-5">
                {industry.solutions.map((solution, index) => (
                  <li key={solution} className="flex gap-4 text-sm leading-6 text-white/80">
                    <span className="font-semibold text-[#E7C99A]">{String(index + 1).padStart(2, "0")}</span>
                    {solution}
                  </li>
                ))}
              </ul>
            ) : <p className="mt-5 text-sm leading-6 text-white/75">We’ll shape the right approach with your team.</p>}
          </div>
        </div>
      </section>

      {industry.use_cases.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007979]">Where it can help</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">Useful applications for your team</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {industry.use_cases.map((useCase, index) => (
              <article key={`${useCase.title}-${index}`} className="rounded-xl border border-[#E8E2D6] bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#007979]">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-display text-xl font-semibold">{useCase.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#524646]/75">{useCase.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {industry.service_slugs.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007979]">Related services</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">Ways we can work together</h2>
          {servicesQuery.error ? (
            <p role="alert" className="mt-5 text-sm text-rose-800">Related services could not be loaded.</p>
          ) : servicesQuery.isPending ? (
            <p className="mt-5 text-sm text-[#524646]/70">Loading related services...</p>
          ) : (
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(servicesQuery.data ?? []).map((service) => (
                <Link key={service.id} to={`/what-i-do/${service.id}`} className="group rounded-xl border border-[#E8E2D6] bg-white p-6 transition hover:border-[#007979]/40 hover:shadow-md">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#007979]">Service</span>
                  <h3 className="mt-3 font-display text-xl font-semibold">{service.name}</h3>
                  {service.short_description && <p className="mt-3 text-sm leading-6 text-[#524646]/75">{service.short_description}</p>}
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#007979]">Explore service <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {industry.faqs.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007979]">Common questions</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Frequently asked questions</h2>
            <div className="mt-7 divide-y divide-[#E8E2D6] border-y border-[#E8E2D6]">
              {industry.faqs.map((faq, index) => (
                <details key={`${faq.question}-${index}`} className="group py-5">
                  <summary className="cursor-pointer list-none pr-6 font-semibold text-[#1A1A16] marker:hidden">
                    {faq.question}
                    <span aria-hidden="true" className="float-right text-xl font-normal text-[#007979] group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-7 text-[#524646]/75">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedIndustries.length > 0 && (
        <section className="border-t border-[#E8E2D6] bg-[#EFEAE1]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007979]">Explore more</p>
                <h2 className="mt-2 font-display text-2xl font-semibold">Other industries</h2>
              </div>
              <Link to="/industries" className="text-sm font-semibold text-[#007979] underline">View all industries</Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {relatedIndustries.map((item) => (
                <Link key={item.id} to={`/industries/${item.slug}`} className="rounded-lg border border-[#DCD5C9] bg-[#FBF9F5] p-5 text-sm font-semibold transition hover:border-[#007979]/50">
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="patterned-surface bg-[#123B36] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E7C99A]">Next step</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Let’s make your digital work fit your industry.</h2>
          </div>
          {/^https?:\/\//i.test(ctaLink)
            ? <a href={ctaLink} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 self-start rounded-full bg-[#E7C99A] px-6 text-sm font-semibold text-[#123B36] hover:bg-white sm:self-auto">{industry.cta_label || "Talk about your project"} <ArrowRight size={16} /></a>
            : <Link to={ctaLink} className="inline-flex min-h-12 items-center gap-2 self-start rounded-full bg-[#E7C99A] px-6 text-sm font-semibold text-[#123B36] hover:bg-white sm:self-auto">{industry.cta_label || "Talk about your project"} <ArrowRight size={16} /></Link>}
        </div>
      </section>
    </main>
  );
}
