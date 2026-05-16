import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield, TrendingUp, Zap,
  Lightbulb, Layers, Monitor, Palette, CreditCard, Workflow, Plug, Wrench,
  Building2, Landmark, Stethoscope, GraduationCap, ShoppingBag, Plane,
  ArrowRight, CheckCircle2, Banknote, Signal, Cog, Heart, Store, Sprout,
} from "lucide-react";
import { motion } from "framer-motion";
import TrustedBy from "@/components/TrustedBy";
import { services } from "@/data/services";
import { insights } from "@/data/insights";

/* ─────────────────────────────────────────
   Types & static data
───────────────────────────────────────── */
const serviceIcons: Record<string, typeof Lightbulb> = {
  Lightbulb, Layers, Monitor, Palette, CreditCard, Workflow, Plug, Wrench,
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const capabilities = [
  "Digital Consultancy", "System Design", "Web Development",
  "Graphic Design", "Payment Integrations", "Process Automation",
  "API Integration", "GovTech", "Cloud & DevOps", "IT Support",
];

const stats = [
  { number: 1000, suffix: "+", label: "Projects Delivered" },
  { number: 500,  suffix: "+", label: "Clients Served" },
  { number: 6,    suffix: "+", label: "Years Design" },
  { number: 5,    suffix: "+", label: "Years Dev" },
];

const PHRASES = [
  "Building Systems That Drive Performance and Accountability.",
  "Delivering Digital Infrastructure at Scale.",
  "Powering Accountability Through Technology.",
];

/* ─────────────────────────────────────────
   Hooks
───────────────────────────────────────── */
function useTypewriter(
  phrases: string[],
  typingSpeed = 48,
  deletingSpeed = 28,
  pauseMs = 1900,
) {
  const [displayed, setDisplayed] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting) {
      if (charIdx < current.length) {
        timeout = setTimeout(() => setCharIdx((c) => c + 1), typingSpeed);
      } else {
        timeout = setTimeout(() => setDeleting(true), pauseMs);
      }
    } else {
      if (charIdx > 0) {
        timeout = setTimeout(() => setCharIdx((c) => c - 1), deletingSpeed);
      } else {
        setDeleting(false);
        setPhraseIdx((i) => (i + 1) % phrases.length);
      }
    }

    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx, phrases, typingSpeed, deletingSpeed, pauseMs]);

  return displayed;
}

function useCountUp(target: number, duration = 1200, delay = 300) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let raf: number;
    const delayTimer = setTimeout(() => {
      let start: number | null = null;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
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

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
const Index = () => {
  const headline = useTypewriter(PHRASES);

  return (
    <main>

      {/* ── Hero ── */}
      <section className="relative bg-paper py-16 md:py-24 overflow-hidden">

        {/* Background image at 10% opacity */}
        <div
          className="absolute inset-0 bg-center bg-cover pointer-events-none"
          style={{
            backgroundImage: "url('/images/hero-bg.jpg')",
            opacity: 0.10,
            zIndex: 0,
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Left */}
            <motion.div {...fadeIn} className="lg:col-span-7">
              <span className="inline-block border border-olive text-olive text-xs uppercase tracking-widest px-3 py-1 rounded-[4px] mb-6 font-body">
                Consulting · Public &amp; Private Sector
              </span>

              {/* Typewriter headline */}
              <h1 className="font-display text-4xl md:text-[56px] text-ink leading-tight max-w-xl min-h-[120px] md:min-h-[140px]">
                {headline}
                <span
                  className="inline-block w-[3px] h-[0.85em] bg-forest align-middle ml-1"
                  style={{ animation: "blink 0.75s step-end infinite" }}
                />
              </h1>

              {/* Blink keyframe (tiny, inlined) */}
              <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

              <p className="font-body text-lg text-[#4A4A4A] max-w-lg mt-4 leading-relaxed">
                I partner with businesses and government institutions to design, develop, and improve
                digital systems that work — reliably, securely, and at scale. 1000+ projects delivered
                across East Africa.
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

              {/* Badge icons — static, no animation */}
              <div className="flex flex-wrap gap-8 mt-8">
                {[
                  { icon: Shield,     text: "Secure by Design"  },
                  { icon: TrendingUp, text: "Outcome Focused"   },
                  { icon: Zap,        text: "Fast Delivery"     },
                ].map((badge) => (
                  <span
                    key={badge.text}
                    className="flex flex-col items-center gap-1.5 text-xs font-body text-olive"
                  >
                    <badge.icon size={28} strokeWidth={1.5} />
                    {badge.text}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right — Profile Card */}
            <motion.div
              {...fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="bg-snow border border-[#E0DAD0] rounded-[4px] p-6">
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
              <span className="inline-block border border-olive text-olive text-xs uppercase tracking-widest px-3 py-1 rounded-[4px] font-body">
                What I Do
              </span>
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

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12"
            role="list"
            aria-label="Services offered by Samuel Emoni"
          >
            {services.slice(0, 8).map((service) => {
              const Icon = serviceIcons[service.icon] || Lightbulb;
              return (
                <Link
                  key={service.id}
                  to={`/what-i-do#${service.id}`}
                  role="listitem"
                  aria-label={`Learn more about ${service.name}`}
                  className="group bg-snow border border-[#E0DAD0] rounded-[4px] p-5 hover:border-ember transition-colors duration-200 block"
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
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Approach ── */}
      <section className="bg-forest py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <span className="inline-block border border-cream/30 text-cream/80 text-xs uppercase tracking-widest px-3 py-1 rounded-[4px] font-body">
                The Approach
              </span>
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
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-olive/20 border border-olive/20 rounded-[4px] overflow-hidden">
                {[
                  { n: "01", t: "Discovery",       d: "Map the environment, surface real constraints." },
                  { n: "02", t: "Architecture",    d: "Document the solution before building it." },
                  { n: "03", t: "Build",           d: "Use proven tools that fit the context." },
                  { n: "04", t: "Security Review", d: "Test against real-world failure modes." },
                  { n: "05", t: "Handover",        d: "Full documentation. No vendor lock-in." },
                  { n: "06", t: "Iteration",       d: "Available for scaling and review post-launch." },
                ].map((s) => (
                  <div key={s.n} className="bg-forest p-6">
                    <p className="font-display text-[36px] text-olive/50 leading-none">{s.n}</p>
                    <h3 className="font-display text-[20px] text-cream mt-2">{s.t}</h3>
                    <p className="font-body text-[13px] text-cream/60 mt-2 leading-relaxed">{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sectors ── */}
      <section className="bg-snow py-24 border-t border-[#E0DAD0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block border border-olive text-olive text-xs uppercase tracking-widest px-3 py-1 rounded-[4px] font-body">
              Sectors
            </span>
            <h2 className="font-display text-[42px] text-ink mt-4 leading-tight">
              Where I do my best work
            </h2>
            <p className="font-body text-lg text-[#4A4A4A] mt-3">
              Six years of work across public and private institutions in East Africa.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-12">
            {[
              { icon: Landmark,     label: "Government"    },
              { icon: Building2,    label: "Enterprise"    },
              { icon: ShoppingBag,  label: "E-commerce"    },
              { icon: Plane,        label: "Tourism"       },
              { icon: GraduationCap,label: "Education"     },
              { icon: Stethoscope,  label: "Healthcare"    },
              { icon: Banknote,     label: "Finance"       },
              { icon: Signal,       label: "Telecom"       },
              { icon: Cog,          label: "Manufacturing" },
              { icon: Heart,        label: "NGOs"          },
              { icon: Store,        label: "Retail"        },
              { icon: Sprout,       label: "Agriculture"   },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="bg-paper border border-[#E0DAD0] rounded-[4px] p-6 text-center"
              >
                <Icon size={26} className="text-forest mx-auto" />
                <p className="font-body text-[13px] text-ink mt-3 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why work with me ── */}
      <section className="bg-paper py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <span className="inline-block border border-olive text-olive text-xs uppercase tracking-widest px-3 py-1 rounded-[4px] font-body">
                Why Work With Me
              </span>
              <h2 className="font-display text-[42px] text-ink mt-4 leading-tight">
                One person, full service.
              </h2>
              <p className="font-body text-lg text-[#4A4A4A] mt-4 leading-relaxed">
                I understand both business needs and technical solutions. After 6 years, I can build
                systems that actually solve your real problems.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {[
                {
                  t: "Fair pricing based on results",
                  d: "We agree on the final result and price first. No hidden costs or extra charges.",
                },
                {
                  t: "Everything written down first",
                  d: "I document all plans and decisions before building. Your team can understand and maintain what I create.",
                },
                {
                  t: "No dependency on me",
                  d: "I use standard tools and clear code. You can easily work with other developers later if needed.",
                },
                {
                  t: "Support after we finish",
                  d: "I help with updates, improvements, and questions after the project ends. This is included in our agreement.",
                },
              ].map((item) => (
                <div
                  key={item.t}
                  className="bg-snow border border-[#E0DAD0] rounded-[4px] p-5 flex gap-4"
                >
                  <CheckCircle2 size={20} className="text-ember shrink-0 mt-1" />
                  <div>
                    <h3 className="font-display text-[20px] text-ink leading-snug">{item.t}</h3>
                    <p className="font-body text-[14px] text-[#4A4A4A] mt-2 leading-relaxed">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Insights preview ── */}
      <section className="bg-snow py-24 border-t border-[#E0DAD0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="inline-block border border-olive text-olive text-xs uppercase tracking-widest px-3 py-1 rounded-[4px] font-body">
                Insights
              </span>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {insights.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                to={`/insights/${post.slug}`}
                className="bg-paper border border-[#E0DAD0] rounded-[4px] p-5 hover:border-olive transition-colors block h-full"
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
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-forest py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-[44px] md:text-[56px] text-cream leading-tight">
            Have a system to build, fix, or rescue?
          </h2>
          <p className="font-body text-lg text-cream/70 mt-5 max-w-2xl mx-auto">
            Tell me about the problem. I will tell you honestly whether I am the right person to
            solve it — and what it will take.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <Link
              to="/contact"
              className="bg-ember text-snow px-6 py-3 text-sm font-body font-medium rounded-[4px] hover:opacity-90 transition-opacity"
            >
              Start a Project →
            </Link>
            <Link
              to="/projects"
              className="border border-cream/40 text-cream px-6 py-3 text-sm font-body rounded-[4px] hover:bg-cream hover:text-forest transition-colors"
            >
              See past work
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
};

export default Index;