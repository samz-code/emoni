import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import {
  FaInstagram,
  FaFacebook,
  FaXTwitter,
  FaReddit,
  FaLinkedin,
  FaGithub,
  FaPinterest,
  FaBehance,
} from "react-icons/fa6";

// ─── Data ────────────────────────────────────────────────────────────────────

const services = [
  { label: "Digital Consultancy",    href: "/what-i-do#digital-consultancy" },
  { label: "System Architecture",    href: "/what-i-do#system-design" },
  { label: "Web Development",        href: "/what-i-do#web-development" },
  { label: "Payment Integrations",   href: "/what-i-do#payment-integrations" },
  { label: "Process Automation",     href: "/what-i-do#process-automation" },
  { label: "IT Support & Consulting",href: "/what-i-do#it-support" },
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
  { Icon: FaLinkedin,  href: "https://www.linkedin.com/in/samuelemoni?utm_source=share_via&utm_content=profile&utm_medium=member_android", label: "LinkedIn", color: "#0A66C2", isOfficialProfile: true },
  { Icon: FaGithub,    href: "https://github.com/Samz-Code",            label: "GitHub",   color: "#ffffff", isOfficialProfile: true },
  { Icon: FaInstagram, href: "https://www.instagram.com/emoni_sam?igsh=OGQ5ZDc2ODk2ZA==", label: "Instagram", color: "#E1306C", isOfficialProfile: true },
  { Icon: FaFacebook,  href: "https://www.facebook.com/share/14bqxEBvppA/", label: "Facebook", color: "#1877F2", isOfficialProfile: true },
  { Icon: FaXTwitter,  href: "https://x.com/samuelemoni18",             label: "X (Twitter)", color: "#ffffff", isOfficialProfile: true },
  { Icon: FaReddit,    href: "https://www.reddit.com/u/sam-emoni/s/PTQvc1bUu9", label: "Reddit", color: "#FF4500", isOfficialProfile: true },
  { Icon: FaPinterest, href: "https://pin.it/qZWHrli7q",                label: "Pinterest", color: "#E60023", isOfficialProfile: true },
  { Icon: FaBehance,   href: "https://www.behance.net/samturkidemoni",  label: "Behance", color: "#1769FF", isOfficialProfile: true },
];
// ─── Spark animation ─────────────────────────────────────────────────────────

const SPARKS = [
  { angle: 0,   delay: 0,   size: 5, dist: 56 },
  { angle: 45,  delay: 0.3, size: 3, dist: 62 },
  { angle: 90,  delay: 0.6, size: 6, dist: 52 },
  { angle: 135, delay: 0.9, size: 3, dist: 65 },
  { angle: 180, delay: 0.2, size: 5, dist: 58 },
  { angle: 225, delay: 0.7, size: 4, dist: 60 },
  { angle: 270, delay: 0.4, size: 6, dist: 54 },
  { angle: 315, delay: 1.0, size: 3, dist: 63 },
];

const StarSpark = ({ angle, delay, size, dist }: { angle: number; delay: number; size: number; dist: number }) => {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * dist;
  const y = Math.sin(rad) * dist;
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 pointer-events-none"
      style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
      animate={{
        x: [0, x * 0.6, x, x * 0.6, 0],
        y: [0, y * 0.6, y, y * 0.6, 0],
        opacity: [0, 1, 0.8, 0.4, 0],
        scale: [0, 1.4, 1, 0.6, 0],
      }}
      transition={{ duration: 2.4, delay, repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 10 10" width={size} height={size}>
        <path d="M5 0 L5.6 4.4 L10 5 L5.6 5.6 L5 10 L4.4 5.6 L0 5 L4.4 4.4 Z" fill="#E77E23" />
      </svg>
    </motion.div>
  );
};

const SparkLogo = () => (
  <div className="relative self-start" style={{ width: 200, height: 120 }}>
    {SPARKS.map((s, i) => <StarSpark key={i} {...s} />)}
    <motion.div
      className="absolute inset-0 rounded-full pointer-events-none"
      style={{ background: "radial-gradient(ellipse at center, rgba(231,126,35,0.18) 0%, transparent 70%)", filter: "blur(8px)" }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.img
      src="/images/brand_white.png"
      alt="Samuel A. Emoni"
      loading="lazy"
      className="h-28 w-auto object-contain relative z-10"
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

// ─── Footer ──────────────────────────────────────────────────────────────────

const Footer = () => {
  const year = new Date().getFullYear();
  const yearsTrusted = year - 2020;

  return (
    <footer className="bg-forest text-cream">

      {/* Top accent rule */}
      <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, transparent, #E77E23 30%, #E77E23 70%, transparent)" }} />

      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10">

          {/* ── Brand column ── */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <SparkLogo />

            {/* Contact rows */}
            <div className="flex flex-col gap-4 mt-1">
              <a
                href="mailto:emonisamuel54@gmail.com"
                className="flex items-center gap-4 font-body text-[16px] text-cream/65 hover:text-ember transition-colors group"
              >
                <span className="w-10 h-10 rounded-lg border border-cream/15 flex items-center justify-center group-hover:border-ember/50 transition-colors flex-shrink-0">
                  <Mail size={17} className="text-ember" />
                </span>
                emonisamuel54@gmail.com
              </a>
              <a
                href="tel:+254727492545"
                className="flex items-center gap-4 font-body text-[16px] text-cream/65 hover:text-ember transition-colors group"
              >
                <span className="w-10 h-10 rounded-lg border border-cream/15 flex items-center justify-center group-hover:border-ember/50 transition-colors flex-shrink-0">
                  <Phone size={17} className="text-ember" />
                </span>
                +254 727 492 545
              </a>
              <div className="flex items-center gap-4 font-body text-[16px] text-cream/65">
                <span className="w-10 h-10 rounded-lg border border-cream/15 flex items-center justify-center flex-shrink-0">
                  <MapPin size={17} className="text-ember" />
                </span>
                Nairobi, Kenya · EAT (UTC+3)
              </div>
            </div>
          </div>

          {/* ── Explore ── */}
          <div className="lg:col-span-2">
            <p className="font-body text-[12px] font-semibold uppercase tracking-[0.22em] text-cream/35 mb-7">
              Explore
            </p>
            <ul className="flex flex-col gap-5">
              {explore.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-body text-[16px] text-cream/70 hover:text-ember hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Services ── */}
          <div className="lg:col-span-3">
            <p className="font-body text-[12px] font-semibold uppercase tracking-[0.22em] text-cream/35 mb-7">
              Services
            </p>
            <ul className="flex flex-col gap-5">
              {services.map((s) => (
                <li key={s.label}>
                  <Link
                    to={s.href}
                    className="font-body text-[16px] text-cream/70 hover:text-ember hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Connect ── */}
          <div className="lg:col-span-3">
            <p className="font-body text-[12px] font-semibold uppercase tracking-[0.22em] text-cream/35 mb-7">
              Connect
            </p>

            {/* 2×4 social grid */}
            <div className="grid grid-cols-2 gap-3">
              {socials.map(({ Icon, href, label, color, isOfficialProfile }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel={isOfficialProfile ? "me noopener noreferrer" : "noopener noreferrer"}
                  aria-label={`Samuel A. Emoni on ${label}`}
                  title={`Samuel A. Emoni on ${label}`}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-cream/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-cream/25 transition-all duration-200 group"
                >
                  <Icon
                    size={26}
                    style={{ color }}
                    className="flex-shrink-0 drop-shadow group-hover:scale-110 transition-transform duration-200"
                  />
                  <span className="font-body text-[13px] font-medium text-cream/60 group-hover:text-cream transition-colors leading-tight truncate">
                    {label}
                  </span>
                </a>
              ))}
            </div>

            {/* Working hours */}
            <div className="mt-10 pl-5 border-l-[3px] border-ember">
              <p className="font-body text-[12px] font-semibold uppercase tracking-[0.22em] text-cream/35 mb-2.5">
                Working Hours
              </p>
              <p className="font-body text-[16px] text-cream/75">Mon – Fri · 09:00 – 18:00</p>
              <p className="font-body text-[14px] text-cream/50 mt-1">Sat · 10:00 – 14:00 · EAT</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ backgroundColor: "#E77E23" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-[14px] font-bold text-black">
            © {year} Samuel A. Emoni. All rights reserved.
            <span className="mx-2 text-black/40">·</span>
            <span className="font-bold text-black">Trusted {yearsTrusted}+ Years</span>
          </p>
          <div className="flex items-center gap-6 font-body text-[14px] font-bold text-black">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-black/40">·</span>
            <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
