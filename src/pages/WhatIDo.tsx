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
      {/* Services Grid */}
      <section className="bg-paper py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-[42px] text-ink">What I Do</h1>
            <p className="font-body text-lg text-[#4A4A4A] max-w-2xl mt-3">
              Every engagement starts with understanding the real problem. Here is how I identify and solve them.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-forest py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-[38px] text-cream">How I Work</h2>
          <p className="font-body text-base text-cream/70 max-w-xl mt-3">
            A structured approach to every engagement — from first call to final delivery.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-16">
            {processSteps.map((step) => (
              <ProcessStep key={step.number} {...step} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default WhatIDo;
