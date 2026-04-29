import {
  Coffee, Hammer, Compass, Mountain, TreePine, Landmark,
  Brain, GraduationCap, Building2, Signal, Banknote, Building,
  type LucideIcon,
} from "lucide-react";

interface Client {
  name: string;
  Icon?: LucideIcon;
  logo?: string; // Path to logo image
}

const clients: Client[] = [
  { name: "Reigns Clinic" },
  { name: "Aruba Arabian Restaurant" },
  { name: "Urban Beer Kenya" },
  { name: "Kawira Consult" },
  { name: "Armand Air" },
  { name: "Rav Africa Safaris" },
  { name: "Sopa Lodges" },
  { name: "Loyal Nature Adventure" },
  { name: "Solai Coffee" },
  { name: "Equity Bank" },
  { name: "Turkana County Gov" },
  { name: "Racsam Graphixs Agency" },
  { name: "Safaricom" },
  { name: "M-Kopa Kenya" },
  { name: "Khetias Supermaket" },
  { name: "Golf Hotel Kakamega" },
  { name: "BanDex Enterprise Ltd" },
];

const TrustedBy = () => {
  // Duplicate the list so the marquee loops seamlessly
  const loop = [...clients, ...clients];

  return (
    <section className="bg-snow py-16 border-y border-[#E0DAD0] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <p className="font-body text-[11px] uppercase tracking-widest text-ember mb-2">
          Trusted By
        </p>
        <h2 className="font-display text-[28px] md:text-[34px] text-ink">
          Institutions & brands that have shipped with me
        </h2>
      </div>

      {/* Marquee */}
      <div
        className="relative w-full"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex w-max animate-marquee gap-12 items-center">
          {loop.map(({ name }, i) => (
            <div
              key={`${name}-${i}`}
              className="flex items-center gap-3 shrink-0 px-4"
            >
              <div className="flex items-center justify-center min-w-[120px] h-12 border border-olive/40 rounded-[4px] bg-forest/10 px-3">
                <span className="text-forest font-display text-sm text-center whitespace-nowrap">{name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
