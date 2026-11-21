import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SEO from "@/components/SEO";
import ServiceCard from "@/components/ServiceCard";
import ProcessStep from "@/components/ProcessStep";
import { supabase } from "@/lib/supabase";
import { applicableOffer, useOffers } from "@/lib/servicePricing";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

// One shared container so every section starts on the same left edge.
const CONTAINER = "mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8";

const WhatIDo = () => {
  const { hash } = useLocation();
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [processSteps, setProcessSteps] = useState<any[]>([]);
  const [idealFor, setIdealFor] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const offersQuery = useOffers();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, serviceRes, processRes, idealRes] = await Promise.all([
          supabase.from("service_categories").select("*").order("sort_order", { ascending: true }),
          supabase.from("services").select("*").eq("published", true).order("sort_order", { ascending: true }),
          supabase.from("process_steps").select("*").order("sort_order", { ascending: true }),
          supabase.from("ideal_for_items").select("label").order("sort_order", { ascending: true }),
        ]);

        if (catRes.data) setCategories(catRes.data);
        if (serviceRes.data) setServices(serviceRes.data);
        if (processRes.data) setProcessSteps(processRes.data);
        if (idealRes.data) setIdealFor(idealRes.data.map((item) => item.label));
      } catch (err) {
        console.error("Failed to fetch data from Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (hash && !loading) {
      const el = document.getElementById(hash.slice(1));
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash, loading]);

  useEffect(() => {
    if (offersQuery.error) console.error("Could not load service offers:", offersQuery.error);
  }, [offersQuery.error]);

  const pageTitle = "Web Developer & Brand Strategist in Nairobi, Kenya | Emoni Samuel";
  const pageDescription =
    "Custom web development, API integration, process automation, branding, digital marketing and SEO for businesses in Nairobi and across East Africa.";

  // Dynamic Schema JSON-LD based on fetched services
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Services Offered by Emoni Samuel",
    description: pageDescription,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        url: `https://www.emonisamuel.co.ke/what-i-do/${service.id}`,
        name: service.title || service.name,
        description:
          service.short_description || service.solution || service.problem || service.outcome,
        image: service.banner_url || undefined,
        areaServed: ["Nairobi", "Kenya", "East Africa"],
        provider: {
          "@type": "Person",
          name: "Emoni Samuel",
          url: "https://www.emonisamuel.co.ke",
        },
      },
    })),
  };

  if (loading) {
    return <div className="py-24 text-center font-body text-ink">Loading content...</div>;
  }

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical="/what-i-do"
        keywords="web development Nairobi, web developer Kenya, brand strategy Kenya, software engineering services Kenya, API integration Nairobi, process automation Kenya, digital marketing and SEO East Africa"
        schema={servicesSchema}
      />

      <main>
        {/* Hero: heading left, intro right, same container as the cards below */}
        <section className="bg-paper pt-24 pb-4">
          <div className={CONTAINER}>
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              animate="show"
              className="grid items-start gap-6 lg:grid-cols-[5fr_7fr] lg:gap-16"
            >
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-ember">
                  What I do
                </p>
                <h1 className="mt-3 font-display text-[36px] sm:text-[48px] text-ink leading-[1.1]">
                  Web Development &amp; Brand Strategy in Nairobi, Kenya
                </h1>
              </div>

              <p className="font-body text-lg sm:text-xl leading-relaxed text-[#4A4A4A] max-w-2xl lg:pt-8">
                I help businesses in Nairobi, across Kenya and throughout East Africa with two things
                most people keep separate: technical web development and creative brand strategy.
                Whether you need custom software, API integration or process automation, or a brand
                that needs design, digital marketing and SEO, here is exactly how I think through the
                problem.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services by Category: 2 per row on desktop */}
        <section className="bg-paper py-16">
          <div className={CONTAINER}>
            {categories.map((cat, catIndex) => {
              const catServices = services.filter((s) => s.category === cat.id);
              if (catServices.length === 0) return null;

              return (
                <div key={cat.id} className={catIndex > 0 ? "mt-16 sm:mt-20" : ""}>
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <h2 className="inline-block border border-ink/20 text-ink/60 text-xs uppercase tracking-widest px-3 py-1 rounded-[4px] font-body font-normal">
                      {String(catIndex + 1).padStart(2, "0")}. {cat.label}
                    </h2>
                    <p className="font-body text-lg text-[#4A4A4A] max-w-2xl mt-3">{cat.blurb}</p>
                  </motion.div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    {catServices.map((service, i) => (
                      <motion.div
                        key={service.id}
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        custom={i}
                        className="h-full"
                      >
                        <ServiceCard
                          service={service}
                          offer={applicableOffer(offersQuery.data, {
                            type: "service",
                            id: service.id,
                            currency: "KES",
                          })}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Ideal For */}
        {idealFor.length > 0 && (
          <section
            id="ideal-for"
            aria-labelledby="ideal-for-heading"
            className="border-t border-ink/10 bg-paper py-20 sm:py-28"
          >
            <div
              className={`${CONTAINER} grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20`}
            >
              {/* Left: sticky intro */}
              <motion.header
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className="lg:sticky lg:top-28 lg:self-start"
              >
                <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-ember">
                  Ideal for
                </p>
                <h2
                  id="ideal-for-heading"
                  className="mt-3 font-display text-[34px] leading-[1.1] text-ink sm:text-[44px]"
                >
                  Who I work with best
                </h2>
                <p className="mt-5 max-w-md font-body text-lg leading-relaxed text-ink/70">
                  I'm most effective when there's a real problem to solve and someone ready to move
                  decisively. If one of these sounds like you, let's talk.
                </p>
                <Link
                  to="/contact"
                  className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-forest px-6 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                >
                  Start a project <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </motion.header>

              {/* Right: one calm list */}
              <ol className="divide-y divide-ink/15 border-y border-ink/15">
                {idealFor.map((item, i) => (
                  <motion.li
                    key={`${item}-${i}`}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    custom={i % 4}
                    className="flex items-baseline gap-5 px-1 py-5 transition-colors hover:bg-ink/[0.03] sm:gap-6 sm:py-6"
                  >
                    <span
                      aria-hidden="true"
                      className="w-7 shrink-0 font-body text-xs font-semibold tabular-nums tracking-widest text-ember"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-body text-base leading-snug text-ink sm:text-lg">{item}</span>
                  </motion.li>
                ))}
              </ol>
            </div>

            {/* Structured data: lets search engines read the list as an ItemList */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "ItemList",
                  name: "Who I work with best",
                  itemListElement: idealFor.map((name, i) => ({
                    "@type": "ListItem",
                    position: i + 1,
                    name,
                  })),
                }).replace(/</g, "\\u003c"),
              }}
            />
          </section>
        )}

        {/* Process */}
        {processSteps.length > 0 && (
          <section className="patterned-surface bg-forest py-24">
            <div className={CONTAINER}>
              <motion.div
                variants={fadeLeft}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                <h2 className="font-display text-[38px] sm:text-[48px] text-cream leading-tight">
                  How I Work
                </h2>
                <p className="font-body text-lg text-cream/70 max-w-xl mt-4">
                  A structured approach to every engagement, from first call to final delivery.
                </p>
              </motion.div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-16">
                {processSteps.map((step, i) => (
                  <motion.div
                    key={step.id || step.step_number || i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    custom={i}
                  >
                    <ProcessStep
                      number={step.step_number}
                      title={step.title}
                      description={step.description}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default WhatIDo;