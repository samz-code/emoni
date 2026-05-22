import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ServiceCard from "@/components/ServiceCard";
import ProcessStep from "@/components/ProcessStep";
import { services } from "@/data/services";

const processSteps = [
  { number: "01", title: "Discovery & Problem Mapping", description: "I start by understanding your environment — your systems, constraints, and goals. No assumptions. No templates." },
  { number: "02", title: "Architecture & Solution Design", description: "I propose a fully documented solution before any code is written. You see and approve the complete plan first." },
  { number: "03", title: "Build & Integration", description: "I build with your team or independently using proven technologies that fit your context — not the latest trends." },
  { number: "04", title: "Testing & Security Review", description: "Every delivery goes through rigorous functional testing and security review. Secure by design, every time." },
  { number: "05", title: "Deployment & Handover", description: "Clean handover with full documentation and training. You completely own what I build — no vendor lock-in." },
  { number: "06", title: "Continuous Improvement", description: "Post-launch I remain available for iteration, scaling, and strategic review as your needs evolve." },
];

const idealFor = [
  "Startups moving from MVP to production",
  "SMEs outgrowing spreadsheets & manual processes",
  "Agencies needing a technical partner",
  "Teams with legacy systems that need modernising",
  "Founders who need a CTO without the full-time cost",
  "Organisations handling sensitive data who need security-first thinking",
];

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

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash]);

  return (
    <main>
      {/* ── Services Grid ── */}
      <section className="bg-paper py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate="show"
          >
            <h1 className="font-display text-[52px] text-ink leading-tight">What I Do</h1>
            <p className="font-body text-xl text-[#4A4A4A] max-w-2xl mt-4">
              Every engagement starts with understanding the real problem. Here is how I identify and solve them.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={i}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ideal For ── */}
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
              I am most effective when there is a real problem to solve and someone ready to move decisively.
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

      {/* ── Process ── */}
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
              A structured approach to every engagement — from first call to final delivery.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-16">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                custom={i}
              >
                <ProcessStep {...step} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default WhatIDo; 