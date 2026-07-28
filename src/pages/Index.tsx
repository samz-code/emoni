import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Lightbulb, Layers, Monitor, Palette, CreditCard, Workflow, Plug, Wrench,
  Building2, Landmark, Stethoscope, GraduationCap, ShoppingBag, Plane,
  ArrowRight, CheckCircle2, Banknote, Signal, Cog, Heart, Store, Sprout,
} from "lucide-react";
import { motion } from "framer-motion";
import TrustedBy from "@/components/TrustedBy";
import { services } from "@/data/services";
import { insights } from "@/data/insights";

/* ─────────────────────────────────────────
   Static data
───────────────────────────────────────── */
const serviceIcons: Record<string, typeof Lightbulb> = {
  Lightbulb, Layers, Monitor, Palette, CreditCard, Workflow, Plug, Wrench,
};

const capabilities = [
  "Digital Consultancy", "System Design", "Web Development",
  "Graphic Design", "Payment Integrations", "Process Automation",
  "API Integration", "GovTech", "Cloud & DevOps", "IT Support",
];

const stats = [
  { number: 1250, suffix: "+", label: "Projects Delivered" },
  { number: 850,  suffix: "+", label: "Clients Served" },
  { number: 6,    suffix: "+", label: "Years Design" },
  { number: 5,    suffix: "+", label: "Years Dev" },
];

const PAIRS = [
  { problem: "Slow manual work.", solution: "We automate systems." },
  { problem: "Scattered data.", solution: "We centralise everything." },
  { problem: "Low conversions.", solution: "We design to convert." },
  { problem: "Old systems.", solution: "We build scalable tech." },
];

const processSteps = [
  { n: "01", t: "Discovery",       d: "Map the environment, surface real constraints." },
  { n: "02", t: "Architecture",    d: "Document the solution before building it." },
  { n: "03", t: "Build",           d: "Use proven tools that fit the context." },
  { n: "04", t: "Security Review", d: "Test against real-world failure modes." },
  { n: "05", t: "Handover",        d: "Full documentation. No vendor lock-in." },
  { n: "06", t: "Iteration",       d: "Available for scaling and review post-launch." },
];

const sectors = [
  { icon: Landmark,      label: "Government"    },
  { icon: Building2,     label: "Enterprise"    },
  { icon: ShoppingBag,   label: "E-commerce"    },
  { icon: Plane,         label: "Tourism"       },
  { icon: GraduationCap, label: "Education"     },
  { icon: Stethoscope,   label: "Healthcare"    },
  { icon: Banknote,      label: "Finance"       },
  { icon: Signal,        label: "Telecom"       },
  { icon: Cog,           label: "Manufacturing" },
  { icon: Heart,         label: "NGOs"          },
  { icon: Store,         label: "Retail"        },
  { icon: Sprout,        label: "Agriculture"   },
];

const reasons = [
  { t: "Fair pricing based on results", d: "We agree on the final result and price first. No hidden costs or extra charges." },
  { t: "Everything written down first", d: "I document all plans and decisions before building. Your team can understand and maintain what I create." },
  { t: "No dependency on me",           d: "I use standard tools and clear code. You can easily work with other developers later if needed." },
  { t: "Support after we finish",       d: "I help with updates, improvements, and questions after the project ends. This is included in our agreement." },
];

/* ─────────────────────────────────────────
   Shared motion presets
───────────────────────────────────────── */
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// Container that staggers its children into view on scroll
const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const gridItem = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/* ─────────────────────────────────────────
   Animated box-grid backdrop
   A fine lattice of small cells with dotted
   borders, woven with a few solid accent
   lines. Cells fade in on a diagonal stagger
   and a handful "spark" in the brand accent.
───────────────────────────────────────── */
function BoxGridBackdrop({ className = "" }: { className?: string }) {
  const cols = 22;
  const rows = 12;
  const total = cols * rows;
  const cells = Array.from({ length: total });

  // Deterministic sets so SSR/CSR match and nothing flickers per render
  const sparks = new Set([27, 53, 88, 114, 150, 187, 205, 233, 41, 96]);
  // Solid vertical accent lines (whole columns)
  const solidCols = new Set([4, 11, 18]);
  // Solid horizontal accent lines (whole rows)
  const solidRows = new Set([3, 8]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* text-olive sets currentColor; borders tint from it via /opacity utilities */}
      <div
        className="grid h-full w-full text-olive"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {cells.map((_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const solidRight = solidCols.has(col);
          const solidBottom = solidRows.has(row);
          return (
            <motion.div
              key={i}
              className={[
                "relative border-r border-b border-current",
                // Mix: solid accent lines where flagged, dotted hairlines elsewhere
                solidRight ? "[border-right-style:solid]" : "[border-right-style:dotted]",
                solidBottom ? "[border-bottom-style:solid]" : "[border-bottom-style:dotted]",
                solidRight ? "border-r-olive/30" : "border-r-olive/15",
                solidBottom ? "border-b-olive/30" : "border-b-olive/15",
              ].join(" ")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: col * 0.012 + row * 0.02 }}
            >
              {sparks.has(i) && (
                <motion.span
                  className="absolute inset-0 bg-ember/[0.07]"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    delay: (i % 7) * 0.55,
                    ease: "easeInOut",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Hooks
───────────────────────────────────────── */
function useProblemSolution(pairs: typeof PAIRS, holdMs = 2200, switchMs = 600) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"problem" | "solution">("problem");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hold = setTimeout(() => {
      setVisible(false);
      const swap = setTimeout(() => {
        if (phase === "problem") {
          setPhase("solution");
        } else {
          setPhase("problem");
          setIndex((i) => (i + 1) % pairs.length);
        }
        setVisible(true);
      }, switchMs);
      return () => clearTimeout(swap);
    }, holdMs);

    return () => clearTimeout(hold);
  }, [index, phase, holdMs, switchMs, pairs.length]);

  return { pair: pairs[index], phase, visible };
}

function useCountUp(target: number, duration = 1200, delay = 300) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let raf = 0;
    const delayTimer = setTimeout(() => {
      let start: number | null = null;
      const step = (timestamp: number) => {
        if (start === null) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setCount(Math.floor(progress * target));
        if (progress < 1) raf = requestAnimationFrame(step);
        else setCount(target);
      };
      raf = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  return count;
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */
function AnimatedStat({
  number, suffix, label, delay,
}: { number: number; suffix: string; label: string; delay: number }) {
  const count = useCountUp(number, 1200, delay);
  return (
    <div>
      <p className="font-display text-[28px] text-forest">
        {count}{suffix}
      </p>
      <p className="font-body text-[11px] text-[#9A9A9A]">{label}</p>
    </div>
  );
}

function Eyebrow({ children, tone = "olive" }: { children: React.ReactNode; tone?: "olive" | "cream" }) {
  const cls =
    tone === "cream"
      ? "border-cream/30 text-cream/80"
      : "border-olive text-olive";
  return (
    <span className={`inline-block border ${cls} text-xs uppercase tracking-widest px-3 py-1 rounded-[4px] font-body`}>
      {children}
    </span>
  );
}

/* Reusable scroll-reveal grid wrapper */
function RevealGrid({
  children, className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={gridContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
const Index = () => {
  const { pair, phase, visible } = useProblemSolution(PAIRS);

  return (
    <main>

      {/* ── Hero ── */}
      <section className="relative bg-paper py-16 md:py-24 overflow-hidden">
        {/* Animated box-grid backdrop, faded toward content */}
        <BoxGridBackdrop className="opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left */}
            <motion.div {...fadeIn} className="lg:col-span-7">
              <Eyebrow>Consulting · Public &amp; Private Sector</Eyebrow>

              {/* Problem / Solution headline */}
              <div className="min-h-[120px] md:min-h-[140px] flex flex-col justify-center mt-6">
                <motion.p
                  key={`label-${phase}`}
                  className={`font-body text-[11px] uppercase tracking-widest mb-2 ${
                    phase === "problem" ? "text-ember" : "text-forest"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {phase === "problem" ? "The Problem" : "The Solution"}
                </motion.p>

                <motion.h1
                  key={`${phase}-${pair.problem}`}
                  className={`font-display text-4xl md:text-[48px] leading-tight max-w-xl ${
                    phase === "solution" ? "text-forest" : "text-ink"
                  }`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -10 }}
                  transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {phase === "problem" ? pair.problem : pair.solution}
                </motion.h1>
              </div>

              <p className="font-body text-lg text-[#4A4A4A] max-w-lg mt-4 leading-relaxed">
                I solve business problems through smart design, technology, and creative thinking. As a software engineer and creative designer, I build reliable digital systems and impactful brand experiences for businesses, NGOs, and government institutions across East Africa.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  to="/what-i-do"
                  className="bg-forest text-cream px-6 py-3 text-sm font-body rounded-[4px] hover:opacity-90 transition-opacity"
                >
                  Explore My Services
                </Link>
                <Link
                  to="/projects"
                  className="border border-forest text-forest px-6 py-3 text-sm font-body rounded-[4px] hover:bg-forest hover:text-cream transition-colors"
                >
                  View My Work →
                </Link>
              </div>
            </motion.div>

            {/* Right — Profile Card */}
            <motion.div
              {...fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="bg-snow/90 backdrop-blur-sm border border-[#E0DAD0] rounded-[4px] p-6 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.3)]">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full border-2 border-olive overflow-hidden bg-olive/20">
                    <img
                      src="/images/profile-image.jpg"
                      alt="Samuel Emoni"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <h2 className="font-display text-xl text-ink text-center mt-3">Samuel A. Emoni</h2>
                <p className="font-body text-[13px] text-olive text-center">
                  Software Solutions Architect | Digital Systems Consultant
                </p>

                {/* Pulsing availability dot */}
                <div className="flex items-center justify-center gap-2 mt-2">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-green-500"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="font-body text-[12px] text-olive">Available for projects</span>
                </div>

                <div className="border-t border-[#E0DAD0] my-4" />

                {/* Count-up stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  {stats.map((stat, i) => (
                    <AnimatedStat
                      key={stat.label}
                      number={stat.number}
                      suffix={stat.suffix}
                      label={stat.label}
                      delay={300 + i * 150}
                    />
                  ))}
                </div>

                <div className="border-t border-[#E0DAD0] my-4" />

                <p className="font-body text-[11px] uppercase tracking-widest text-[#9A9A9A] mb-3">
                  CAPABILITIES
                </p>

                {/* Staggered capability tags */}
                <div className="flex flex-wrap gap-1">
                  {capabilities.map((cap, i) => (
                    <motion.span
                      key={cap}
                      className="border border-olive text-forest text-xs rounded-[4px] px-2 py-1 font-body"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.07, duration: 0.3 }}
                    >
                      {cap}
                    </motion.span>
                  ))}
                </div>

                <Link
                  to="/contact"
                  className="block mt-4 bg-ember text-snow text-sm text-center rounded-[4px] py-3 font-body font-medium hover:opacity-90 transition-opacity"
                >
                  Start a Project →
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <TrustedBy />

      {/* ── Services Preview ── */}
      <section
        className="bg-paper py-24 border-t border-[#E0DAD0]"
        aria-labelledby="services-heading"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <Eyebrow>What I Do</Eyebrow>
              <h2
                id="services-heading"
                className="font-display text-[42px] text-ink mt-4 max-w-xl leading-tight"
              >
                Eight disciplines. One operating standard.
              </h2>
              <p className="font-body text-lg text-[#4A4A4A] max-w-xl mt-3">
                From digital strategy to deployment, every engagement is structured around a clear
                problem and a measurable outcome.
              </p>
            </div>
            <Link
              to="/what-i-do"
              className="font-body text-sm text-ember font-medium inline-flex items-center gap-2 hover:underline shrink-0"
              aria-label="View all services offered by Samuel Emoni"
            >
              View all services <ArrowRight size={14} />
            </Link>
          </div>

          <RevealGrid
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12"
          >
            {services.slice(0, 8).map((service) => {
              const Icon = serviceIcons[service.icon] || Lightbulb;
              return (
                <motion.div key={service.id} variants={gridItem}>
                  <Link
                    to={`/what-i-do#${service.id}`}
                    aria-label={`Learn more about ${service.name}`}
                    className="group bg-snow border border-[#E0DAD0] rounded-[4px] p-5 hover:border-ember hover:-translate-y-1 transition-all duration-200 block h-full"
                  >
                    <Icon
                      size={22}
                      className="text-olive group-hover:text-ember transition-colors duration-200"
                    />
                    <h3 className="font-display text-[18px] text-ink group-hover:text-ember mt-3 leading-snug transition-colors duration-200">
                      {service.name}
                    </h3>
                    <p className="font-body text-[13px] text-[#4A4A4A] mt-2 leading-relaxed line-clamp-3">
                      {service.problem}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-3 text-[12px] font-body text-ember opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      View service <ArrowRight size={11} />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </RevealGrid>
        </div>
      </section>

      {/* ── Approach ── */}
      <section className="bg-forest py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-5"
            >
              <Eyebrow tone="cream">The Approach</Eyebrow>
              <h2 className="font-display text-[42px] text-cream mt-4 leading-tight">
                Diagnose first. Build second.
              </h2>
              <p className="font-body text-base text-cream/70 mt-4 leading-relaxed">
                The biggest reason digital projects fail is that they start with a solution instead
                of a problem. Every engagement begins with a structured diagnosis — your systems,
                your constraints, your real goals.
              </p>
              <p className="font-body text-base text-cream/70 mt-4 leading-relaxed">
                Only then do we design. You see the full plan, signed off, before a single line of
                code is written.
              </p>
              <Link
                to="/what-i-do"
                className="inline-flex items-center gap-2 mt-8 border border-ember text-ember px-5 py-3 text-sm font-body rounded-[4px] hover:bg-ember hover:text-snow transition-colors"
              >
                See the full process <ArrowRight size={14} />
              </Link>
            </motion.div>

            <div className="lg:col-span-7">
              <RevealGrid className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-olive/20 border border-olive/20 rounded-[4px] overflow-hidden">
                {processSteps.map((s) => (
                  <motion.div key={s.n} variants={gridItem} className="bg-forest p-6">
                    <p className="font-display text-[36px] text-olive/50 leading-none">{s.n}</p>
                    <h3 className="font-display text-[20px] text-cream mt-2">{s.t}</h3>
                    <p className="font-body text-[13px] text-cream/60 mt-2 leading-relaxed">{s.d}</p>
                  </motion.div>
                ))}
              </RevealGrid>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sectors ── */}
      <section className="bg-snow py-24 border-t border-[#E0DAD0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <Eyebrow>Sectors</Eyebrow>
            <h2 className="font-display text-[42px] text-ink mt-4 leading-tight">
              Where I do my best work
            </h2>
            <p className="font-body text-lg text-[#4A4A4A] mt-3">
              Six years of work across public and private institutions in East Africa.
            </p>
          </div>

          <RevealGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-12">
            {sectors.map(({ icon: Icon, label }) => (
              <motion.div
                key={label}
                variants={gridItem}
                className="group bg-paper border border-[#E0DAD0] rounded-[4px] p-6 text-center hover:border-olive hover:-translate-y-1 transition-all duration-200"
              >
                <Icon size={26} className="text-forest mx-auto group-hover:scale-110 transition-transform duration-200" />
                <p className="font-body text-[13px] text-ink mt-3 font-medium">{label}</p>
              </motion.div>
            ))}
          </RevealGrid>
        </div>
      </section>

      {/* ── Why work with me ── */}
      <section className="bg-paper py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <Eyebrow>Why Work With Me</Eyebrow>
              <h2 className="font-display text-[42px] text-ink mt-4 leading-tight">
                One person, full service.
              </h2>
              <p className="font-body text-lg text-[#4A4A4A] mt-4 leading-relaxed">
                I understand both business needs and technical solutions. After 6 years, I can build
                systems that actually solve your real problems.
              </p>
            </div>

            <RevealGrid className="lg:col-span-7 space-y-4">
              {reasons.map((item) => (
                <motion.div
                  key={item.t}
                  variants={gridItem}
                  className="bg-snow border border-[#E0DAD0] rounded-[4px] p-5 flex gap-4"
                >
                  <CheckCircle2 size={20} className="text-ember shrink-0 mt-1" />
                  <div>
                    <h3 className="font-display text-[20px] text-ink leading-snug">{item.t}</h3>
                    <p className="font-body text-[14px] text-[#4A4A4A] mt-2 leading-relaxed">{item.d}</p>
                  </div>
                </motion.div>
              ))}
            </RevealGrid>
          </div>
        </div>
      </section>

      {/* ── Insights preview ── */}
      <section className="bg-snow py-24 border-t border-[#E0DAD0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <Eyebrow>Insights</Eyebrow>
              <h2 className="font-display text-[42px] text-ink mt-4 max-w-xl leading-tight">
                Field notes from the work
              </h2>
              <p className="font-body text-lg text-[#4A4A4A] max-w-xl mt-3">
                Practical perspectives on building digital systems in Africa — written for the people
                who actually have to ship them.
              </p>
            </div>
            <Link
              to="/insights"
              className="font-body text-sm text-ember font-medium inline-flex items-center gap-2 hover:underline shrink-0"
            >
              All insights <ArrowRight size={14} />
            </Link>
          </div>

          <RevealGrid className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {insights.slice(0, 3).map((post) => (
              <motion.div key={post.slug} variants={gridItem} className="h-full">
                <Link
                  to={`/insights/${post.slug}`}
                  className="bg-paper border border-[#E0DAD0] rounded-[4px] p-5 hover:border-olive hover:-translate-y-1 transition-all duration-200 block h-full"
                >
                  <span className="inline-block bg-forest text-cream text-xs rounded-[4px] px-2 py-1 font-body">
                    {post.category}
                  </span>
                  <h3 className="font-display text-[20px] text-ink mt-3 leading-snug">{post.title}</h3>
                  <p className="font-body text-[13px] text-[#4A4A4A] mt-2 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <p className="font-body text-[12px] text-[#9A9A9A] mt-4">
                    {post.date} · {post.readTime}
                  </p>
                </Link>
              </motion.div>
            ))}
          </RevealGrid>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative bg-[#F7F4ED] py-20 md:py-24 overflow-hidden">
        <BoxGridBackdrop className="opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-[44px] md:text-[56px] text-green leading-tight">
            Have a system to build, fix, or rescue?
          </h2>
          <p className="font-body text-lg text-black/70 mt-5 max-w-2xl mx-auto">
            Tell me about the problem. I will tell you honestly whether I am the right person to
            solve it — and what it will take.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <Link
              to="/contact"
              className="bg-ember text-snow px-8 py-3.5 text-sm font-body font-bold rounded-[4px] hover:opacity-90 transition-opacity"
            >
              Start a Project →
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
};

export default Index;