import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  FaInstagram,
  FaFacebook,
  FaXTwitter,
  FaReddit,
  FaLinkedin,
  FaPinterest,
  FaBehance,
} from "react-icons/fa6";

// ─── Data ────────────────────────────────────────────────────────────────────

const services = [
  { label: "Digital Consultancy",     href: "/what-i-do#digital-consultancy" },
  { label: "System Architecture",     href: "/what-i-do#system-design" },
  { label: "Web Development",         href: "/what-i-do#web-development" },
  { label: "Payment Integrations",    href: "/what-i-do#payment-integrations" },
  { label: "Process Automation",      href: "/what-i-do#process-automation" },
  { label: "IT Support & Consulting", href: "/what-i-do#it-support" },
];

const explore = [
  { label: "Home",                href: "/" },
  { label: "What I Do",           href: "/what-i-do" },
  { label: "Courses",             href: "/courses" },
  { label: "Projects & Products", href: "/projects" },
  { label: "Insights",            href: "/insights" },
  { label: "Contact",             href: "/contact" },
];

const socials: {
  Icon: React.ElementType;
  href: string;
  label: string;
  color: string;
  isOfficialProfile: boolean;
}[] = [
  { Icon: FaLinkedin,  href: "https://www.linkedin.com/in/samuelemoni?utm_source=share_via&utm_content=profile&utm_medium=member_android", label: "LinkedIn",    color: "#0A66C2", isOfficialProfile: true },
  { Icon: FaInstagram, href: "https://www.instagram.com/emoni_sam?igsh=OGQ5ZDc2ODk2ZA==", label: "Instagram", color: "#E1306C", isOfficialProfile: true },
  { Icon: FaFacebook,  href: "https://www.facebook.com/share/14bqxEBvppA/", label: "Facebook",  color: "#1877F2", isOfficialProfile: true },
  { Icon: FaXTwitter,  href: "https://x.com/samuelemoni18",             label: "X (Twitter)", color: "#ffffff", isOfficialProfile: true },
  { Icon: FaReddit,    href: "https://www.reddit.com/u/sam-emoni/s/PTQvc1bUu9", label: "Reddit",   color: "#FF4500", isOfficialProfile: true },
  { Icon: FaPinterest, href: "https://pin.it/qZWHrli7q",                label: "Pinterest",  color: "#E60023", isOfficialProfile: true },
  { Icon: FaBehance,   href: "https://www.behance.net/samturkidemoni",  label: "Behance",    color: "#1769FF", isOfficialProfile: true },
];

// ─── Logo with hover color-shift ─────────────────────────────────────────────

const SparkLogo = () => (
  <motion.div
    className="relative self-start cursor-pointer"
    style={{ width: 200, height: 112 }}
    whileHover="hovered"
    initial="idle"
  >
    <motion.div
      className="absolute inset-0 pointer-events-none rounded-2xl"
      variants={{
        idle:    { opacity: 0, background: "radial-gradient(ellipse at center, rgba(231,126,35,0.20) 0%, transparent 70%)" },
        hovered: { opacity: 1, background: "radial-gradient(ellipse at center, rgba(231,126,35,0.55) 0%, transparent 70%)" },
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ filter: "blur(12px)" }}
    />
    <motion.div
      className="absolute inset-0 pointer-events-none rounded-xl z-20"
      variants={{
        idle:    { opacity: 0 },
        hovered: { opacity: 0.22 },
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ background: "#E77E23", mixBlendMode: "color" }}
    />
    <motion.img
      src="/images/brand_white.png"
      alt="Samuel A. Emoni"
      loading="lazy"
      className="h-28 w-auto object-contain relative z-10"
      variants={{
        idle:    { scale: 1,    filter: "brightness(1)" },
        hovered: { scale: 1.04, filter: "brightness(1.15) drop-shadow(0 0 12px rgba(231,126,35,0.6))" },
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    />
  </motion.div>
);

// ─── Section heading ──────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="font-body text-[11px] font-semibold uppercase tracking-[0.24em] text-cream/30 mb-6">
    {children}
  </p>
);

// ─── Column link list ─────────────────────────────────────────────────────────

const LinkList = ({ items }: { items: { label: string; href: string }[] }) => (
  <ul className="flex flex-col gap-4">
    {items.map((link) => (
      <li key={link.label}>
        <Link
          to={link.href}
          className="group inline-flex items-center gap-1.5 font-body text-[15px] text-cream/65 hover:text-ember transition-colors duration-200"
        >
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            {link.label}
          </span>
          <ArrowUpRight
            size={13}
            className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
          />
        </Link>
      </li>
    ))}
  </ul>
);

// ─── Footer ──────────────────────────────────────────────────────────────────

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-forest text-cream overflow-hidden">

      {/* Ambient corner glow */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(231,126,35,0.28) 0%, transparent 70%)" }}
      />

      {/* Top accent rule */}
      <div
        className="relative h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, #E77E23 30%, #E77E23 70%, transparent)" }}
      />

      {/* ── CTA strip ── */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-14">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 border-b border-cream/8 pb-14">
          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.24em] text-ember mb-4">
              Let's build something
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[0.95] tracking-tight text-cream">
              Have a project
              <br />
              <span className="text-cream/40">in mind?</span>
            </h2>
          </div>

          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 self-start rounded-full bg-ember px-8 py-4 font-body text-[15px] font-bold text-black transition-all duration-200 hover:bg-cream hover:shadow-[0_0_30px_rgba(231,126,35,0.4)]"
          >
            Start a conversation
            <ArrowUpRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10">

          {/* ── Brand column ── */}
          <div className="lg:col-span-4 flex flex-col gap-7">
            <SparkLogo />

            <p className="font-body text-[15px] text-cream/45 leading-relaxed max-w-xs">
              Full-stack development and design, built for clarity and scale.
            </p>

            <div className="flex flex-col gap-3.5">
              <a
                href="mailto:emonisamuel54@gmail.com"
                className="flex items-center gap-3.5 font-body text-[15px] text-cream/55 hover:text-ember transition-colors duration-200 group"
              >
                <span className="w-9 h-9 rounded-lg border border-cream/12 flex items-center justify-center group-hover:border-ember/40 transition-colors flex-shrink-0">
                  <Mail size={15} className="text-ember" />
                </span>
                emonisamuel54@gmail.com
              </a>

              <a
                href="tel:+254727492545"
                className="flex items-center gap-3.5 font-body text-[15px] text-cream/55 hover:text-ember transition-colors duration-200 group"
              >
                <span className="w-9 h-9 rounded-lg border border-cream/12 flex items-center justify-center group-hover:border-ember/40 transition-colors flex-shrink-0">
                  <Phone size={15} className="text-ember" />
                </span>
                +254 727 492 545
              </a>

              <div className="flex items-center gap-3.5 font-body text-[15px] text-cream/55">
                <span className="w-9 h-9 rounded-lg border border-cream/12 flex items-center justify-center flex-shrink-0">
                  <MapPin size={15} className="text-ember" />
                </span>
                Nairobi, Kenya · EAT (UTC+3)
              </div>
            </div>
          </div>

          {/* ── Explore ── */}
          <div className="lg:col-span-2">
            <SectionLabel>Explore</SectionLabel>
            <LinkList items={explore} />
          </div>

          {/* ── Services ── */}
          <div className="lg:col-span-3">
            <SectionLabel>Services</SectionLabel>
            <LinkList items={services} />
          </div>

          {/* ── Connect ── */}
          <div className="lg:col-span-3">
            <SectionLabel>Connect</SectionLabel>

            {/* 2-column social grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {socials.map(({ Icon, href, label, color, isOfficialProfile }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel={isOfficialProfile ? "me noopener noreferrer" : "noopener noreferrer"}
                  aria-label={`Samuel A. Emoni on ${label}`}
                  title={`Samuel A. Emoni on ${label}`}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-cream/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-cream/20 transition-all duration-200 group"
                >
                  <Icon
                    size={18}
                    style={{ color }}
                    className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                  />
                  <span className="font-body text-[13px] font-medium text-cream/55 group-hover:text-cream/90 transition-colors leading-tight truncate">
                    {label}
                  </span>
                </a>
              ))}
            </div>

            {/* Working hours */}
            <div className="mt-8 pl-4 border-l-2 border-ember/60">
              <SectionLabel>Working Hours</SectionLabel>
              <p className="font-body text-[15px] text-cream/70">Mon – Fri · 09:00 – 18:00</p>
              <p className="font-body text-[13px] text-cream/45 mt-1">Sat · 10:00 – 14:00 · EAT</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ backgroundColor: "#E77E23" }} className="relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-body text-[13px] font-bold text-black">
            © {year} Samuel A. Emoni. All rights reserved.
          </p>
          <div className="flex items-center gap-5 font-body text-[13px] font-bold text-black">
            <Link to="/privacy" className="hover:text-white transition-colors duration-150">Privacy Policy</Link>
            <span className="text-black/35">·</span>
            <Link to="/terms" className="hover:text-white transition-colors duration-150">Terms & Conditions</Link>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;