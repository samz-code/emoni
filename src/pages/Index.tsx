import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Lightbulb, Layers, Monitor, Palette, CreditCard, Workflow, Plug, Wrench,
  Building2, Landmark, Stethoscope, GraduationCap, ShoppingBag, Plane,
  ArrowRight, CheckCircle2, Banknote, Signal, Cog, Heart, Store, Sprout,
} from "lucide-react";
import TrustedBy from "@/components/TrustedBy";

/* ─── Icon maps ─────────────────────────────────────────────── */
const serviceIcons: Record<string, typeof Lightbulb> = {
  Lightbulb, Layers, Monitor, Palette, CreditCard, Workflow, Plug, Wrench,
};

const sectorIconMap: Record<string, typeof Landmark> = {
  Landmark, Building2, ShoppingBag, Plane, GraduationCap, Stethoscope,
  Banknote, Signal, Cog, Heart, Store, Sprout,
};

/* ─── Lightweight Static Grid Backdrop ──────────────────────── */
function BoxGridBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] ${className}`}
    />
  );
}

/* ─── Problem / Solution cycler ────────────────────────────── */
function useProblemSolution(pairs: Record<string, any>[], holdMs = 2600) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"problem" | "solution">("problem");

  useEffect(() => {
    if (!pairs.length) return;
    const interval = setInterval(() => {
      setPhase((prevPhase) => {
        if (prevPhase === "problem") {
          return "solution";
        } else {
          setIndex((prevIndex) => (prevIndex + 1) % pairs.length);
          return "problem";
        }
      });
    }, holdMs);

    return () => clearInterval(interval);
  }, [holdMs, pairs.length]);

  return {
    pair: pairs[index] || { problem: "Digital Engineering", solution: "Systems Architecture" },
    phase,
  };
}

/* ─── Standard Link ────────────────────────────────────────── */
function MagneticLink({
  to,
  children,
  className,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="w-full sm:w-auto">
      <Link to={to} className={className}>
        {children}
      </Link>
    </div>
  );
}

/* ─── Eyebrow ──────────────────────────────────────────────── */
function Eyebrow({
  children,
  tone = "olive",
}: {
  children: React.ReactNode;
  tone?: "olive" | "cream";
}) {
  const cls =
    tone === "cream"
      ? "border-cream/30 text-cream/80"
      : "border-olive text-olive dark:border-olive/60 dark:text-olive";
  return (
    <span
      className={`inline-block border ${cls} text-[10px] sm:text-xs uppercase tracking-widest px-2.5 py-1 rounded-[4px] font-body`}
    >
      {children}
    </span>
  );
}

/* ─── Standard Grid Container ──────────────────────────────── */
function RevealGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
interface HomePageData {
  services: any[];
  insights: any[];
  pairs: any[];
  processSteps: any[];
  sectors: any[];
  reasons: any[];
}

const Index = () => {
  const { data = {} as HomePageData, isLoading } = useQuery<HomePageData>({
    queryKey: ["home-page-data"],
    queryFn: async () => {
      const [
        { data: services },
        { data: insights },
        { data: pairs },
        { data: processSteps },
        { data: sectors },
        { data: reasons },
      ] = await Promise.all([
        supabase.from("services").select("*").limit(3),
        supabase.from("insights").select("*").limit(3),
        supabase.from("hero_pairs").select("*"),
        supabase.from("process_steps").select("*"),
        supabase.from("sectors").select("*"),
        supabase.from("reasons").select("*"),
      ]);

      return {
        services: services ?? [],
        insights: insights ?? [],
        pairs: pairs ?? [],
        processSteps: processSteps ?? [],
        sectors: sectors ?? [],
        reasons: reasons ?? [],
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const services = data.services || [];
  const insights = data.insights || [];
  const pairs = data.pairs || [];
  const processSteps = data.processSteps || [];
  const sectors = data.sectors || [];
  const reasons = data.reasons || [];

  const { pair, phase } = useProblemSolution(pairs);

  return (
    <main className="bg-paper text-ink dark:bg-[#0F0F0C] dark:text-cream transition-colors duration-300 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative bg-paper dark:bg-[#0F0F0C] overflow-hidden">
        <BoxGridBackdrop className="opacity-35" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-20 md:pb-28">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 md:mb-14">
            <Eyebrow>Consulting · Public & Private Sector</Eyebrow>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="min-h-[100px] sm:min-h-[140px] md:min-h-[160px] flex flex-col justify-center">
                <p
                  className={`font-body text-[10px] sm:text-[11px] uppercase tracking-[0.2em] mb-2 sm:mb-3 transition-colors duration-300 ${
                    phase === "problem" ? "text-ember" : "text-forest dark:text-olive"
                  }`}
                >
                  {phase === "problem" ? "The Problem" : "The Solution"}
                </p>

                <h1
                  className={`font-display text-[32px] sm:text-[48px] md:text-[60px] leading-[1.08] sm:leading-[1.05] tracking-tight max-w-2xl transition-colors duration-300 ${
                    phase === "solution"
                      ? "text-forest dark:text-olive"
                      : "text-ink dark:text-cream"
                  }`}
                >
                  {phase === "problem"
                    ? (pair?.problem ?? pair?.title ?? "")
                    : (pair?.solution ?? pair?.subtitle ?? "")}
                </h1>
              </div>

              <p className="font-body text-base sm:text-lg md:text-xl text-[#4A4A4A] dark:text-cream/70 max-w-xl mt-6 sm:mt-8 leading-relaxed">
                I solve business problems through smart design, technology, and creative thinking.
                Software engineer and creative designer building reliable digital systems for
                businesses, NGOs, and government institutions across East Africa.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 sm:mt-10">
                <MagneticLink
                  to="/what-i-do"
                  className="w-full sm:w-auto text-center bg-forest text-cream px-7 py-3.5 text-sm font-body rounded-[4px] hover:opacity-90 transition-opacity inline-block"
                >
                  Explore My Services
                </MagneticLink>
                <MagneticLink
                  to="/projects"
                  className="w-full sm:w-auto text-center border border-forest/80 text-forest dark:border-olive dark:text-olive px-7 py-3.5 text-sm font-body rounded-[4px] hover:bg-forest hover:text-cream dark:hover:bg-olive dark:hover:text-ink transition-colors inline-block"
                >
                  View My Work &rarr;
                </MagneticLink>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 max-w-md mx-auto lg:max-w-none w-full">
              <div className="bg-snow dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[6px] overflow-hidden shadow-lg sm:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-transform duration-300">
                <div className="relative h-64 sm:h-80 md:h-96 w-full bg-olive/10">
                  <img
                    src="/images/profile-image.jpg"
                    alt="Samuel Emoni"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                </div>

                <div className="p-5 sm:p-6 relative bg-snow dark:bg-[#1A1A16]">
                  <h2 className="font-display text-lg sm:text-xl text-ink dark:text-cream text-center">
                    Samuel A. Emoni
                  </h2>
                  <p className="font-body text-xs sm:text-[13px] text-olive text-center mt-0.5">
                    Solutions Architect · Digital Systems
                  </p>

                  <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-[#E0DAD0] dark:border-olive/20">
                    <p className="font-body text-[10px] uppercase tracking-widest text-[#9A9A9A] mb-2.5 text-center">
                      Focus areas
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {["GovTech", "Systems", "Automation", "Design", "Integrations"].map(
                        (cap) => (
                          <span
                            key={cap}
                            className="border border-olive/60 text-forest dark:text-olive text-[10px] sm:text-[11px] rounded-[3px] px-2 py-0.5 font-body"
                          >
                            {cap}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <MagneticLink
                    to="/contact"
                    className="block mt-4 sm:mt-5 bg-ember text-snow text-sm text-center rounded-[4px] py-3 font-body font-medium hover:opacity-90 transition-opacity w-full"
                  >
                    Start a Project &rarr;
                  </MagneticLink>
                </div>
              </div>

              <p className="font-body text-[11px] sm:text-[12px] text-[#9A9A9A] text-center mt-3 sm:mt-4 leading-relaxed">
                Documentation-first · No lock-in · East Africa
              </p>
            </div>
          </div>
        </div>
      </section>

      <TrustedBy />

      {/* BANNER */}
      <section className="bg-forest py-8 sm:py-10 border-y border-olive/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <p className="font-display text-cream text-lg sm:text-xl md:text-2xl max-w-xl leading-snug">
              Built for institutions that cannot afford systems that fail quietly.
            </p>
            <MagneticLink
              to="/contact"
              className="w-full sm:w-auto text-center shrink-0 inline-flex items-center justify-center gap-2 border border-cream/40 text-cream px-5 py-2.5 text-sm font-body rounded-[4px] hover:bg-cream hover:text-forest transition-colors"
            >
              Talk through a problem <ArrowRight size={14} />
            </MagneticLink>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-paper dark:bg-[#0F0F0C] py-16 sm:py-24 border-t border-[#E0DAD0] dark:border-olive/15" aria-labelledby="services-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6">
            <div>
              <Eyebrow>What I Do</Eyebrow>
              <h2
                id="services-heading"
                className="font-display text-[28px] sm:text-[36px] md:text-[42px] text-ink dark:text-cream mt-3 sm:mt-4 max-w-xl leading-tight"
              >
                Core Disciplines
              </h2>
              <p className="font-body text-base sm:text-lg text-[#4A4A4A] dark:text-cream/70 max-w-xl mt-2 sm:mt-3">
                From digital strategy to deployment, every engagement is structured around a clear problem and a measurable outcome.
              </p>
            </div>
            <Link to="/what-i-do" className="font-body text-sm text-ember font-medium inline-flex items-center gap-2 hover:underline shrink-0 mt-2 md:mt-0">
              View all services <ArrowRight size={14} />
            </Link>
          </div>

          <RevealGrid className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="bg-snow dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-5 h-44 animate-pulse" />
              ))
            ) : services.length === 0 ? (
              <p className="text-[#9A9A9A] font-body text-sm col-span-full py-8 text-center">No published services found in database.</p>
            ) : (
              services.slice(0, 3).map((service: any) => {
                const Icon = serviceIcons[service.icon] || Lightbulb;
                return (
                  <div key={service.id || service.name || service.title} className="hover:-translate-y-1 transition-transform duration-200">
                    <Link
                      to={`/what-i-do#${service.id}`}
                      className="group bg-snow dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-5 hover:border-ember transition-colors duration-200 block h-full flex-col justify-between"
                    >
                      <div>
                        <div>
                          <Icon size={22} className="text-olive group-hover:text-ember transition-colors duration-200" />
                        </div>
                        <h3 className="font-display text-[17px] sm:text-[18px] text-ink dark:text-cream group-hover:text-ember mt-3 leading-snug transition-colors duration-200">
                          {service.title || service.name}
                        </h3>
                        <p className="font-body text-[13px] text-[#4A4A4A] dark:text-cream/60 mt-2 leading-relaxed line-clamp-3">
                          {service.description || service.problem || service.summary}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 mt-4 text-[12px] font-body text-ember opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                        View service <ArrowRight size={11} />
                      </span>
                    </Link>
                  </div>
                );
              })
            )}
          </RevealGrid>
        </div>
      </section>

      {/* PROCESS STEPS */}
      <section className="bg-forest py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-5">
              <Eyebrow tone="cream">The Approach</Eyebrow>
              <h2 className="font-display text-[28px] sm:text-[36px] md:text-[42px] text-cream mt-3 sm:mt-4 leading-tight">
                Diagnose first. Build second.
              </h2>
              <p className="font-body text-sm sm:text-base text-cream/70 mt-3 sm:mt-4 leading-relaxed">
                The biggest reason digital projects fail is that they start with a solution instead of a problem. Every engagement begins with a structured diagnosis — your systems, your constraints, your real goals.
              </p>
              <p className="font-body text-sm sm:text-base text-cream/70 mt-3 sm:mt-4 leading-relaxed">
                Only then do we design. You see the full plan, signed off, before a single line of code is written.
              </p>
              <MagneticLink
                to="/what-i-do"
                className="w-full sm:w-auto text-center justify-center inline-flex items-center gap-2 mt-6 sm:mt-8 border border-ember text-ember px-5 py-3 text-sm font-body rounded-[4px] hover:bg-ember hover:text-snow transition-colors"
              >
                See the full process <ArrowRight size={14} />
              </MagneticLink>
            </div>

            <div className="lg:col-span-7">
              <RevealGrid className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-olive/20 border border-olive/20 rounded-[4px] overflow-hidden">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="bg-forest p-5 sm:p-6 animate-pulse h-32" />
                  ))
                ) : processSteps.length === 0 ? (
                  <p className="text-cream/60 font-body text-sm p-6 col-span-full">No process steps found in database.</p>
                ) : (
                  processSteps.map((s: any, idx: number) => (
                    <div
                      key={s.id || idx}
                      className="bg-forest p-5 sm:p-6 hover:bg-white/5 transition-colors duration-200"
                    >
                      <p className="font-display text-[28px] sm:text-[36px] text-olive/50 leading-none">
                        {s.step_number || s.n || `0${idx + 1}`}
                      </p>
                      <h3 className="font-display text-[18px] sm:text-[20px] text-cream mt-2">
                        {s.title || s.t || s.name}
                      </h3>
                      <p className="font-body text-[13px] text-cream/60 mt-2 leading-relaxed">
                        {s.description || s.d || s.detail}
                      </p>
                    </div>
                  ))
                )}
              </RevealGrid>
            </div>
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section className="bg-snow dark:bg-[#141410] py-16 sm:py-24 border-t border-[#E0DAD0] dark:border-olive/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <Eyebrow>Sectors</Eyebrow>
            <h2 className="font-display text-[28px] sm:text-[36px] md:text-[42px] text-ink dark:text-cream mt-3 sm:mt-4 leading-tight">
              Where I do my best work
            </h2>
            <p className="font-body text-base sm:text-lg text-[#4A4A4A] dark:text-cream/70 mt-2 sm:mt-3">
              Six years of work across public and private institutions in East Africa.
            </p>
          </div>
          <RevealGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-8 sm:mt-12">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-paper dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-5 h-28 animate-pulse" />
              ))
            ) : sectors.length === 0 ? (
              <p className="text-[#9A9A9A] font-body text-sm col-span-full py-8 text-center">No sectors configured.</p>
            ) : (
              sectors.map((sec: any) => {
                const Icon = sectorIconMap[sec.icon] || Landmark;
                return (
                  <div key={sec.label || sec.name || sec.id} className="hover:-translate-y-1 transition-transform duration-200">
                    <div className="group bg-paper dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-4 sm:p-6 text-center hover:border-olive transition-colors duration-200">
                      <div>
                        <Icon size={24} className="text-forest dark:text-olive mx-auto sm:w-[26px] sm:h-[26px] group-hover:scale-110 transition-transform duration-200" />
                      </div>
                      <p className="font-body text-[12px] sm:text-[13px] text-ink dark:text-cream mt-2 sm:mt-3 font-medium">
                        {sec.label || sec.name || sec.title}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </RevealGrid>
        </div>
      </section>

      {/* WHY WORK WITH ME */}
      <section className="bg-paper dark:bg-[#0F0F0C] py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5">
              <Eyebrow>Why Work With Me</Eyebrow>
              <h2 className="font-display text-[28px] sm:text-[36px] md:text-[42px] text-ink dark:text-cream mt-3 sm:mt-4 leading-tight">
                One person, full service.
              </h2>
              <p className="font-body text-base sm:text-lg text-[#4A4A4A] dark:text-cream/70 mt-3 sm:mt-4 leading-relaxed">
                I understand both business needs and technical solutions. After 6 years, I can build systems that actually solve your real problems.
              </p>
            </div>
            <RevealGrid className="lg:col-span-7 space-y-3 sm:space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="bg-snow dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-5 h-24 animate-pulse" />
                ))
              ) : reasons.length === 0 ? (
                <p className="text-[#9A9A9A] font-body text-sm py-4">No reasons configured.</p>
              ) : (
                reasons.map((item: any, idx: number) => (
                  <div
                    key={item.id || item.title || idx}
                    className="bg-snow dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-4 sm:p-5 flex gap-3.5 sm:gap-4 hover:translate-x-1 transition-transform duration-200"
                  >
                    <div>
                      <CheckCircle2 size={18} className="text-ember shrink-0 mt-0.5 sm:w-[20px] sm:h-[20px]" />
                    </div>
                    <div>
                      <h3 className="font-display text-[17px] sm:text-[20px] text-ink dark:text-cream leading-snug">
                        {item.title || item.t || item.heading}
                      </h3>
                      <p className="font-body text-[13px] sm:text-[14px] text-[#4A4A4A] dark:text-cream/60 mt-1.5 leading-relaxed">
                        {item.description || item.d || item.detail}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </RevealGrid>
          </div>
        </div>
      </section>

      {/* INSIGHTS */}
      <section className="bg-snow dark:bg-[#141410] py-16 sm:py-24 border-t border-[#E0DAD0] dark:border-olive/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6">
            <div>
              <Eyebrow>Insights</Eyebrow>
              <h2 className="font-display text-[28px] sm:text-[36px] md:text-[42px] text-ink dark:text-cream mt-3 sm:mt-4 max-w-xl leading-tight">
                Field notes from the work
              </h2>
              <p className="font-body text-base sm:text-lg text-[#4A4A4A] dark:text-cream/70 max-w-xl mt-2 sm:mt-3">
                Practical perspectives on building digital systems in Africa — written for the people who actually have to ship them.
              </p>
            </div>
            <Link to="/insights" className="font-body text-sm text-ember font-medium inline-flex items-center gap-2 hover:underline shrink-0 mt-2 md:mt-0">
              All insights <ArrowRight size={14} />
            </Link>
          </div>

          <RevealGrid className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="bg-paper dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-5 h-52 animate-pulse" />
              ))
            ) : insights.length === 0 ? (
              <p className="text-[#9A9A9A] font-body text-sm col-span-full py-8 text-center">No insights published yet.</p>
            ) : (
              insights.slice(0, 3).map((post: any) => (
                <div key={post.slug || post.id} className="h-full hover:-translate-y-1 transition-transform duration-200">
                  <Link
                    to={`/insights/${post.slug || post.id}`}
                    className="bg-paper dark:bg-[#1A1A16] border border-[#E0DAD0] dark:border-olive/20 rounded-[4px] p-5 hover:border-olive transition-colors duration-200 block h-full flex-col justify-between"
                  >
                    <div>
                      <span className="inline-block bg-forest text-cream text-xs rounded-[4px] px-2 py-0.5 font-body">
                        {post.category || "General"}
                      </span>
                      <h3 className="font-display text-[18px] sm:text-[20px] text-ink dark:text-cream mt-3 leading-snug">
                        {post.title}
                      </h3>
                      <p className="font-body text-[13px] text-[#4A4A4A] dark:text-cream/60 mt-2 leading-relaxed line-clamp-3">
                        {post.excerpt || post.description || post.summary}
                      </p>
                    </div>
                    <p className="font-body text-[11px] sm:text-[12px] text-[#9A9A9A] mt-4">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""} {post.read_time ? `· ${post.read_time}` : ""}
                    </p>
                  </Link>
                </div>
              ))
            )}
          </RevealGrid>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-[#F7F4ED] dark:bg-[#0F0F0C] py-16 sm:py-20 md:py-28 overflow-hidden">
        <BoxGridBackdrop className="opacity-40" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-[30px] sm:text-[42px] md:text-[54px] text-forest dark:text-olive leading-tight">
            Have a system to build, fix, or rescue?
          </h2>
          <p className="font-body text-base sm:text-lg text-black/70 dark:text-cream/70 mt-4 sm:mt-5 max-w-2xl mx-auto">
            Tell me about the problem. I will tell you honestly whether I am the right person to solve it — and what it will take.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 sm:mt-10">
            <MagneticLink
              to="/contact"
              className="w-full sm:w-auto text-center bg-ember text-snow px-8 py-3.5 text-sm font-body font-bold rounded-[4px] hover:opacity-90 transition-opacity inline-block"
            >
              Start a Project &rarr;
            </MagneticLink>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;