interface Client {
  name: string;
  logo: string; // path in /public
}

const clients: Client[] = [
  { name: "Reigns Clinic",           logo: "/Reigns Clinic.png" },
  { name: "Aruba Arabian Restaurant",logo: "/Aruba Arabian Restaurant.png" },
  { name: "Urban Beer Kenya",        logo: "/Urban Beer Kenya.png" },
  { name: "Kawira Consult",          logo: "/Kawira Consult.png" },
  { name: "Rav Africa Safaris",      logo: "/Rav-Africa-Safaris-Logo.png" },
  { name: "Sopa Lodges",             logo: "/Sopa Lodges.jpg" },
  { name: "Silverstone Events,Tour and Travel ",  logo: "/silverstone.png" },
  { name: "Solai Coffee",            logo: "/Solai Coffee.png" },
  { name: "Equity Bank",             logo: "/Equity Bank.png" },
  { name: "Turkana County Gov",      logo: "/Turkana County Gov.png" },
  { name: "Racsam Graphixs Agency",  logo: "/Racsam Graphixs Agency.png" },
  { name: "Safaricom",               logo: "/Safaricom.png" },
  { name: " Blesssed Edmond Academy",            logo: "/blessed.png" },
  { name: "Khetias Supermarket",     logo: "/Khetias Supermarket.png" },
  { name: "Domas Little Voices Therapy Hub",     logo: "/domas.png" },
];

const TrustedBy = () => {
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
        <div className="flex w-max animate-marquee gap-8 items-center">
          {loop.map(({ name, logo }, i) => (
            <div
              key={`${name}-${i}`}
              className="flex items-center justify-center shrink-0"
            >
              <div className="flex items-center justify-center w-[160px] h-[80px] border border-olive/40 rounded-[4px] bg-white/60 px-4 py-3">
                <img
                  src={logo}
                  alt={`${name} logo`}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const span = document.createElement("span");
                    span.className = "text-forest font-display text-xs text-center leading-tight";
                    span.textContent = name;
                    e.currentTarget.parentElement?.appendChild(span);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;