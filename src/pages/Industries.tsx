import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Search } from "lucide-react";
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

  const seoImage = industries.find((industry) => industry.hero_image_url)?.hero_image_url || undefined;

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
    <main className="min-h-screen overflow-hidden bg-[#FBF9F5] text-[#1A1A16]">
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical="/industries"
        image={seoImage}
        keywords="industries served Kenya, school website design Kenya, real estate website Kenya, healthcare digital solutions Kenya, NGO website development, hospitality web design Nairobi"
        schema={itemListSchema}
      />

      {/* Hero: same forest / cream / ember palette as the navbar */}
      <section className="patterned-surface relative isolate overflow-hidden bg-[hsl(var(--forest))] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-[hsl(var(--ember)/0.25)] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-72 w-72 rounded-full bg-[hsl(var(--cream)/0.12)] blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="inline-flex items-center gap-3 font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-[hsl(var(--cream))]">
            <span className="h-0.5 w-8 rounded-full bg-[hsl(var(--ember))]" />
            Industries we serve · Kenya & East Africa
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Digital work that understands <span className="text-[hsl(var(--cream))]">your industry.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
            A school, a clinic and a growing business do not work the same way. We learn what matters to your people, then shape websites, branding and digital systems around how your organisation works.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#industries"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--cream))] px-6 font-sans text-xs font-bold tracking-wider text-[hsl(var(--forest))] shadow-md transition-colors hover:bg-white"
            >
              FIND YOUR INDUSTRY <ArrowDownRight size={16} />
            </a>
            <Link
              to="/contact"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/40 px-6 font-sans text-xs font-bold tracking-wider text-white transition-colors hover:border-[hsl(var(--ember))] hover:bg-[hsl(var(--ember))]"
            >
              DISCUSS A PROJECT
            </Link>
          </div>

          {industries.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-white/15 pt-6">
              <span className="mr-1 font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                {industries.length} {industries.length === 1 ? "industry" : "industries"}
              </span>
              {industries.slice(0, 8).map((industry) => (
                <Link
                  key={industry.id}
                  to={`/industries/${industry.slug}`}
                  className="rounded-full border border-white/25 px-3 py-1.5 font-sans text-xs font-semibold text-white/85 transition-colors hover:border-[hsl(var(--cream))] hover:bg-[hsl(var(--cream))] hover:text-[hsl(var(--forest))]"
                >
                  {industry.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Directory */}
      <section id="industries" className="scroll-mt-24 py-14 sm:py-20" aria-labelledby="industry-list-heading">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--ember))]">Find your context</p>
              <h2 id="industry-list-heading" className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                Different fields. Thoughtful digital solutions.
              </h2>
              <span className="mt-4 block h-1 w-16 rounded-full bg-[hsl(var(--ember))]" />
            </div>
            {!isPending && !error && industries.length > 0 && (
              <label className="relative block w-full md:max-w-xs">
                <span className="sr-only">Search industries</span>
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--forest))]" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search, e.g. education"
                  className="min-h-11 w-full rounded-full border border-[#E8E2D6] bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-[#524646]/50 focus:border-[hsl(var(--forest))] focus:ring-2 focus:ring-[hsl(var(--forest)/0.2)]"
                />
              </label>
            )}
          </div>

          {isPending ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading industries">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-[420px] animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : error ? (
            <p role="alert" className="mt-8 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              {error instanceof Error && error.message
                ? `Industries could not be loaded: ${error.message}`
                : "Industries could not be loaded. Please try again later."}
            </p>
          ) : visibleIndustries.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-[#CFC8BC] bg-white p-8 text-center text-sm text-[#524646]/70">
              {industries.length
                ? "No industries match your search. Try another term."
                : "Industry profiles are being prepared. Please check back soon."}
            </p>
          ) : (
            <>
              <p className="mt-6 text-xs text-[#524646]/60">
                Showing {visibleIndustries.length} {visibleIndustries.length === 1 ? "industry" : "industries"}
              </p>

              {/* Uniform grid: every card has the same image ratio, height and layout */}
              <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleIndustries.map((industry, index) => (
                  <Link
                    key={industry.id}
                    to={`/industries/${industry.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-[#E8E2D6] transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-[hsl(var(--forest))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ember))]"
                  >
                    <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-[hsl(var(--forest))]">
                      {industry.hero_image_url ? (
                        <img
                          src={industry.hero_image_url}
                          alt={`${industry.name} industry`}
                          loading={index < 3 ? "eager" : "lazy"}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="h-full w-full bg-[radial-gradient(ellipse_at_75%_25%,hsl(var(--ember)/0.55),transparent_45%),linear-gradient(135deg,hsl(var(--forest)),hsl(var(--forest)/0.8))]"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--forest))] via-[hsl(var(--forest)/0.25)] to-transparent" />

                      <span className="absolute left-4 top-4 rounded-full bg-[hsl(var(--ember))] px-2.5 py-1 font-sans text-[10px] font-bold tracking-[0.16em] text-white shadow-md">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--cream))] text-[hsl(var(--forest))] opacity-0 shadow-md transition duration-300 group-hover:opacity-100">
                        <ArrowUpRight size={16} />
                      </span>

                      <h3 className="absolute inset-x-4 bottom-4 line-clamp-2 font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                        {industry.name}
                      </h3>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <p className="line-clamp-3 text-sm leading-6 text-[#524646]/85">
                        {industry.tagline || industry.description}
                      </p>

                      {(industry.service_slugs ?? []).length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {(industry.service_slugs ?? []).slice(0, 3).map((slug) => (
                            <span
                              key={slug}
                              className="rounded-full bg-[hsl(var(--cream)/0.45)] px-2.5 py-1 font-sans text-[10px] font-bold text-[hsl(var(--forest))]"
                            >
                              {prettySlug(slug)}
                            </span>
                          ))}
                        </div>
                      )}

                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 font-sans text-xs font-bold uppercase tracking-wider text-[hsl(var(--forest))]">
                        Explore industry
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>

                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-1 w-0 bg-[hsl(var(--ember))] transition-all duration-500 group-hover:w-full"
                    />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Approach */}
      <section className="bg-[hsl(var(--cream)/0.35)]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="max-w-xl">
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--ember))]">Our approach</p>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Good work starts by understanding the work.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { number: "01", title: "Listen", text: "Understand your people, goals and current constraints." },
              { number: "02", title: "Shape", text: "Agree a useful direction, scope and practical next steps." },
              { number: "03", title: "Build", text: "Deliver a clear digital experience with your team in mind." },
            ].map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border-t-4 border-[hsl(var(--ember))] bg-white p-6 shadow-sm"
              >
                <p className="font-display text-4xl font-bold text-[hsl(var(--forest))]">{step.number}</p>
                <h3 className="mt-3 font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#524646]/80">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="patterned-surface bg-[hsl(var(--forest))] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 sm:px-8 sm:py-14 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--cream))]">Have a specific challenge?</p>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Let’s find the right solution for your organisation.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Tell us what you are trying to improve. We’ll help you work out a sensible place to start.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[hsl(var(--cream))] px-7 font-sans text-xs font-bold tracking-wider text-[hsl(var(--forest))] shadow-md transition-colors hover:bg-white md:self-auto"
          >
            START A CONVERSATION <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}