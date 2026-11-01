import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight, Search } from "lucide-react";
import SEO, { SITE_URL } from "@/components/SEO";
import { useIndustries } from "@/lib/industries";

const pageTitle = "Industries Served in Kenya | Emoni Digital Solutions";
const pageDescription =
  "Explore digital solutions for schools, real estate, healthcare, hospitality, NGOs and growing businesses in Kenya. Practical websites, branding and digital systems shaped around your industry.";

const prettySlug = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function Industries() {
  const { data: industries = [], isPending, error } = useIndustries();
  const [search, setSearch] = useState("");

  const visibleIndustries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return industries;
    return industries.filter((industry) =>
      [industry.name, industry.tagline, industry.description].some((value) =>
        value?.toLowerCase().includes(term),
      ),
    );
  }, [industries, search]);

  const featuredIndustry = industries.find((industry) => industry.hero_image_url) ?? industries[0];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: pageDescription,
    url: `${SITE_URL}/industries`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: industries.map((industry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: industry.name,
        url: `${SITE_URL}/industries/${industry.slug}`,
      })),
    },
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F5F0] text-[#1A1A16]">
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical="/industries"
        image={featuredIndustry?.hero_image_url || undefined}
        keywords="industries served Kenya, school website design Kenya, real estate website Kenya, healthcare digital solutions Kenya, NGO website development, hospitality web design Nairobi"
        schema={itemListSchema}
      />

      {/* Compact hero */}
      <section className="relative isolate overflow-hidden bg-[#123B36] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(to_right,#ffffff18_1px,transparent_1px),linear-gradient(to_bottom,#ffffff18_1px,transparent_1px)] [background-size:40px_40px]"
        />
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <div>
            <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E7C99A]">
              <span className="h-px w-8 bg-[#E7C99A]" />
              Industries we serve · Kenya & East Africa
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
              Digital work that understands your industry.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
              A school, a clinic and a growing business do not work the same way. We learn what matters to your people, then shape websites, branding and digital systems around how your organisation works.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href="#industries"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#E7C99A] px-5 text-sm font-semibold text-[#123B36] transition hover:bg-white"
              >
                Find your industry <ArrowDownRight size={16} />
              </a>
              <Link
                to="/contact"
                className="text-sm font-semibold text-white/85 underline decoration-white/35 underline-offset-4 transition hover:text-[#E7C99A]"
              >
                Discuss a project
              </Link>
            </div>

            {industries.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2 border-t border-white/15 pt-5">
                {industries.slice(0, 6).map((industry) => (
                  <Link
                    key={industry.id}
                    to={`/industries/${industry.slug}`}
                    className="rounded-full border border-white/25 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-[#E7C99A] hover:text-[#E7C99A]"
                  >
                    {industry.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Featured card: full width, taller, text overlaid on the image */}
          {featuredIndustry && (
            <Link
              to={`/industries/${featuredIndustry.slug}`}
              className="group relative mt-10 block overflow-hidden rounded-xl border border-white/15 bg-[#1C5149] transition hover:border-[#E7C99A]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C99A]"
            >
              <div className="relative h-72 overflow-hidden sm:h-[26rem] lg:h-[32rem]">
                {featuredIndustry.hero_image_url ? (
                  <img
                    src={featuredIndustry.hero_image_url}
                    alt={`${featuredIndustry.name} digital solutions in Kenya`}
                    className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="h-full w-full bg-[radial-gradient(ellipse_at_70%_35%,#e7c99a55,transparent_40%),linear-gradient(135deg,#1c5149,#123b36)]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#101d1b]/85 via-[#101d1b]/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-8">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E7C99A]">A closer look</p>
                    <p className="mt-1 truncate font-display text-2xl font-semibold sm:text-4xl">{featuredIndustry.name}</p>
                    {(featuredIndustry.tagline || featuredIndustry.description) && (
                      <p className="mt-2 hidden max-w-xl line-clamp-2 text-sm leading-6 text-white/80 sm:block">
                        {featuredIndustry.tagline || featuredIndustry.description}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/50 transition group-hover:border-[#E7C99A] group-hover:bg-[#E7C99A] group-hover:text-[#123B36] sm:h-12 sm:w-12">
                    <ArrowRight size={18} />
                  </span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Directory */}
      <section id="industries" className="scroll-mt-20 py-12 sm:py-16" aria-labelledby="industry-list-heading">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-5 border-b border-[#DCD7CD] pb-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#007979]">Find your context</p>
              <h2 id="industry-list-heading" className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">
                Different fields. Thoughtful digital solutions.
              </h2>
            </div>
            {!isPending && !error && industries.length > 0 && (
              <label className="relative block w-full md:max-w-xs">
                <span className="sr-only">Search industries</span>
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817D75]" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search, e.g. education"
                  className="min-h-11 w-full rounded-full border border-[#D5D0C6] bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-[#817D75] focus:border-[#007979] focus:ring-2 focus:ring-[#007979]/15"
                />
              </label>
            )}
          </div>

          {isPending ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading industries">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="h-[390px] animate-pulse rounded-xl bg-white" />
              ))}
            </div>
          ) : error ? (
            <p role="alert" className="mt-6 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              {error instanceof Error && error.message
                ? `Industries could not be loaded: ${error.message}`
                : "Industries could not be loaded. Please try again later."}
            </p>
          ) : visibleIndustries.length === 0 ? (
            <p className="mt-6 rounded-md border border-dashed border-[#CFC8BC] bg-white p-8 text-center text-sm text-[#524646]/70">
              {industries.length
                ? "No industries match your search. Try another term."
                : "Industry profiles are being prepared. Please check back soon."}
            </p>
          ) : (
            <>
              <p className="mt-5 text-xs text-[#524646]/60">
                Showing {visibleIndustries.length} {visibleIndustries.length === 1 ? "industry" : "industries"}
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleIndustries.map((industry, index) => (
                  <Link
                    key={industry.id}
                    to={`/industries/${industry.slug}`}
                    className="group flex min-h-[390px] flex-col overflow-hidden rounded-xl border border-[#E5E0D7] bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#007979]/45 hover:shadow-[0_14px_36px_-22px_rgba(18,59,54,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007979]"
                  >
                    <div className="relative h-48 shrink-0 overflow-hidden bg-[#DDE7E2] sm:h-56">
                      {industry.hero_image_url ? (
                        <img
                          src={industry.hero_image_url}
                          alt={`${industry.name} industry`}
                          loading={index < 4 ? "eager" : "lazy"}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="h-full w-full bg-[radial-gradient(ellipse_at_75%_25%,#e7c99a99,transparent_35%),linear-gradient(135deg,#1c5149,#123b36)]"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute left-3 top-3 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-white backdrop-blur-sm">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <h3 className="font-display text-lg font-semibold leading-snug sm:text-xl">{industry.name}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#524646]/75">
                        {industry.tagline || industry.description}
                      </p>

                      {(industry.service_slugs ?? []).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(industry.service_slugs ?? []).slice(0, 3).map((slug) => (
                            <span
                              key={slug}
                              className="rounded-full bg-[#F1EEE7] px-2 py-0.5 text-[10px] font-medium text-[#524646]/80"
                            >
                              {prettySlug(slug)}
                            </span>
                          ))}
                        </div>
                      )}

                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-semibold uppercase tracking-[0.1em] text-[#007979]">
                        Explore industry
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Approach */}
      <section className="border-y border-[#E2DDD3] bg-[#EFEAE1]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#007979]">Our approach</p>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">
              Good work starts by understanding the work.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { number: "01", title: "Listen", text: "Understand your people, goals and current constraints." },
              { number: "02", title: "Shape", text: "Agree a useful direction, scope and practical next steps." },
              { number: "03", title: "Build", text: "Deliver a clear digital experience with your team in mind." },
            ].map((step) => (
              <article key={step.number} className="rounded-lg bg-white/60 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-[#007979]">{step.number}</p>
                <h3 className="mt-2 font-display text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-[13px] leading-5 text-[#524646]/75">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#123B36] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:px-8 sm:py-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E7C99A]">Have a specific challenge?</p>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">
              Let’s find the right solution for your organisation.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Tell us what you are trying to improve. We’ll help you work out a sensible place to start.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#E7C99A] px-6 text-sm font-semibold text-[#123B36] transition hover:bg-white md:self-auto"
          >
            Start a conversation <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}