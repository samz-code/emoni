import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import ServiceCard from "@/components/ServiceCard";
import ProcessStep from "@/components/ProcessStep";
import { supabase } from "@/lib/supabase";

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

const WhatIDo = () => {
  const { hash } = useLocation();
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [processSteps, setProcessSteps] = useState<any[]>([]);
  const [idealFor, setIdealFor] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

  const canonicalUrl = "https://www.emonisamuel.co.ke/what-i-do";
  const pageTitle = "Software Engineering, Web Development & Branding Services | Samuel A. Emoni";
  const pageDescription = "Explore custom software engineering, full-stack web development, digital systems, and brand strategy services tailored for businesses and organizations in Kenya and beyond.";

  // Generate dynamic Schema JSON-LD based on fetched services
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Services Offered by Samuel A. Emoni",
    "description": pageDescription,
    "itemListElement": services.map((service, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": service.title || service.name,
        "description": service.description || service.blurb,
        "provider": {
          "@type": "Person",
          "name": "Samuel A. Emoni",
          "url": "https://www.emonisamuel.co.ke"
        }
      }
    }))
  };

  if (loading) {
    return <div className="py-24 text-center font-body text-ink">Loading content...</div>;
  }

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
        <meta property="og:image" content="https://www.emonisamuel.co.ke/og-image.jpg" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://www.emonisamuel.co.ke/og-image.jpg" />

        {/* Structured Data / Schema */}
        <script type="application/ld+json">
          {JSON.stringify(servicesSchema)}
        </script>
      </Helmet>

      <main>
        {/* Hero */}
        <section className="bg-paper pt-24 pb-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeLeft} initial="hidden" animate="show">
              <h1 className="font-display text-[52px] text-ink leading-tight">What I Do</h1>
              <p className="font-body text-xl text-[#4A4A4A] max-w-2xl mt-4">
                I work across two worlds most people keep separate, the technical and the creative.
                Below is exactly how I think through a problem, whether it's a system that's broken
                or a brand nobody recognizes yet.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services by Category */}
        <section className="bg-paper py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {categories.map((cat, catIndex) => {
              const catServices = services.filter((s) => s.category === cat.id);
              if (catServices.length === 0) return null;

              return (
                <div key={cat.id} className={catIndex > 0 ? "mt-20" : ""}>
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <span className="inline-block border border-ink/20 text-ink/60 text-xs uppercase tracking-widest px-3 py-1 rounded-[4px] font-body">
                      {String(catIndex + 1).padStart(2, "0")}. {cat.label}
                    </span>
                    <p className="font-body text-lg text-[#4A4A4A] max-w-2xl mt-3">
                      {cat.blurb}
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {catServices.map((service, i) => (
                      <motion.div
                        key={service.id}
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        custom={i}
                      >
                        <ServiceCard service={service} />
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
          <section className="bg-paper border-t border-ink/10 py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                <span className="inline-block border border-ink/20 text-ink/60 text-xs uppercase tracking-widest px-3 py-1 rounded-[4px] font-body">
                  Ideal For
                </span>
                <h2 className="font-display text-[42px] text-ink mt-4 leading-tight">
                  Who I work with best
                </h2>
                <p className="font-body text-lg text-[#4A4A4A] max-w-2xl mt-3">
                  I'm most effective when there's a real problem to solve and someone ready to move decisively.
                </p>
              </motion.div>

              <div className="mt-12 flex flex-wrap gap-4">
                {idealFor.map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    custom={i}
                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                    className="border-2 border-ink text-ink font-body font-bold text-base px-6 py-4 rounded-[4px] bg-transparent cursor-default"
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Process */}
        {processSteps.length > 0 && (
          <section className="bg-forest py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                variants={fadeLeft}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                <h2 className="font-display text-[48px] text-cream leading-tight">How I Work</h2>
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
                    <ProcessStep number={step.step_number} title={step.title} description={step.description} />
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