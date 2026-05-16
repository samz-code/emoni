import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

// ─── Official brand SVG logos ────────────────────────────────────────────────

const InstagramLogo = () => (
  <svg viewBox="0 0 32 32" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ig-g1" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#ig-g1)" />
    <path d="M16 9.6A6.4 6.4 0 1 0 16 22.4 6.4 6.4 0 0 0 16 9.6Zm0 10.56A4.16 4.16 0 1 1 16 11.84a4.16 4.16 0 0 1 0 8.32Z" fill="#fff" />
    <circle cx="22.72" cy="9.28" r="1.5" fill="#fff" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#1877F2" />
    <path d="M21.5 16H18V13c0-.93.5-1.5 1.5-1.5H21.5V8H19C16.24 8 14.5 9.9 14.5 13V16H12V19.5H14.5V28H18V19.5H20.75L21.5 16Z" fill="#fff" />
  </svg>
);

const TwitterXLogo = () => (
  <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#000" />
    <path d="M23.37 5.5h3.3L19.5 14.06 28 26.5h-6.63l-5.2-6.8-5.95 6.8H6.9l7.7-8.8L4 5.5h6.8l4.7 6.2 5.87-6.2Zm-1.16 19.2h1.83L9.9 7.37H7.94l14.27 17.33Z" fill="#fff" />
  </svg>
);

const RedditLogo = () => (
  <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#FF4500" />
    <path d="M26.67 16a2.33 2.33 0 0 0-3.96-1.65 11.4 11.4 0 0 0-6.16-1.96l1.05-4.93 3.43.72a1.67 1.67 0 1 0 .17-.83l-3.84-.81a.33.33 0 0 0-.4.25L15.8 13.4a11.47 11.47 0 0 0-6.21 1.96 2.33 2.33 0 1 0-2.59 3.73 4.67 4.67 0 0 0-.05.67c0 3.41 3.97 6.18 8.88 6.18s8.88-2.77 8.88-6.18a4.67 4.67 0 0 0-.05-.67A2.34 2.34 0 0 0 26.67 16ZM11 18a1.33 1.33 0 1 1 2.67 0A1.33 1.33 0 0 1 11 18Zm7.45 3.53a4.56 4.56 0 0 1-3.12 1.01 4.56 4.56 0 0 1-3.12-1.01.33.33 0 1 1 .46-.48 3.9 3.9 0 0 0 2.66.84 3.9 3.9 0 0 0 2.66-.84.33.33 0 1 1 .46.48Zm-.12-2.2a1.33 1.33 0 1 1 0-2.66 1.33 1.33 0 0 1 0 2.66Z" fill="#fff" />
  </svg>
);

const LinkedInLogo = () => (
  <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#0A66C2" />
    <path d="M10 12.5H6.67V25H10V12.5ZM8.33 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM25.33 18c0-3.33-2-5.33-4.67-5.33a4.27 4.27 0 0 0-3.33 1.6V12.5H14V25h3.33v-6.67c0-1.46.93-2.66 2.34-2.66s2.33 1.13 2.33 2.8V25h3.33V18Z" fill="#fff" />
  </svg>
);

const GitHubLogo = () => (
  <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#24292F" />
    <path fillRule="evenodd" clipRule="evenodd" d="M16 5.33A10.67 10.67 0 0 0 12.63 26c.53.1.73-.23.73-.5v-1.77c-2.97.64-3.6-1.43-3.6-1.43a2.83 2.83 0 0 0-1.18-1.57c-.97-.66.07-.65.07-.65a2.24 2.24 0 0 1 1.64 1.1 2.27 2.27 0 0 0 3.1.9 2.27 2.27 0 0 1 .67-1.43C11.3 20.38 9.07 19.52 9.07 16a4.13 4.13 0 0 1 1.1-2.87 3.83 3.83 0 0 1 .1-2.83s.9-.28 2.93 1.1a10.1 10.1 0 0 1 5.33 0c2.03-1.38 2.93-1.1 2.93-1.1a3.83 3.83 0 0 1 .1 2.83A4.13 4.13 0 0 1 22.6 16c0 4.1-2.5 5-4.87 5.27a2.53 2.53 0 0 1 .73 1.97v2.92c0 .28.2.6.73.5A10.67 10.67 0 0 0 16 5.33Z" fill="#fff" />
  </svg>
);

const PinterestLogo = () => (
  <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#E60023" />
    <path d="M16 5.33A10.67 10.67 0 0 0 12.07 25.9c-.05-.5-.1-1.29.02-1.85l.8-3.36s-.2-.41-.2-1.01c0-.95.55-1.65 1.23-1.65.58 0 .86.44.86.96 0 .59-.37 1.47-.57 2.28-.16.68.34 1.24 1.01 1.24 1.21 0 2.14-1.43 2.14-3.49 0-1.83-1.32-3.11-3.2-3.11A3.64 3.64 0 0 0 10.3 18.4c0 .72.28 1.49.63 1.91a.25.25 0 0 1 .06.24l-.23.93c-.04.15-.13.19-.3.11-1.14-.53-1.84-2.18-1.84-3.5 0-2.86 2.07-5.47 5.97-5.47 3.13 0 5.57 2.23 5.57 5.21 0 3.11-1.96 5.6-4.68 5.6-.91 0-1.77-.48-2.06-1.04l-.56 2.1c-.2.78-.75 1.74-1.12 2.33A10.67 10.67 0 1 0 16 5.33Z" fill="#fff" />
  </svg>
);

const BehanceLogo = () => (
  <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#1769FF" />
    <path d="M12.67 9.33H6.67V22.67h6.33c2.67 0 4.67-1.33 4.67-4 0-1.6-.8-2.8-2-3.33.93-.53 1.47-1.47 1.47-2.67 0-2.27-1.8-3.34-4.47-3.34Zm-.33 5.34H9.33v-3h2.9c1.07 0 1.77.53 1.77 1.47 0 1-.7 1.53-1.66 1.53Zm.4 5.33H9.33v-3.33h3.33c1.34 0 2 .66 2 1.73 0 1.2-.8 1.6-2 1.6ZM25.33 16.67h-7.33c.13 1.46 1.2 2.4 2.67 2.4 1.06 0 1.86-.54 2.13-1.34h2.53C24.8 20.13 22.8 22 20.53 22c-2.93 0-5.2-2.13-5.2-5.07 0-2.8 2.14-5.07 5.2-5.07 3.2 0 5.2 2.4 4.8 4.81Zm-4.93-3.74c-1.27 0-2.27.8-2.4 2.14h4.67c-.14-1.34-1.07-2.14-2.27-2.14ZM18.67 10h4.66v1.33h-4.66V10Z" fill="#fff" />
  </svg>
);

// ─── Data ───────────────────────────────────────────────────────────────────

const services = [
  { label: "Digital Consultancy", href: "/what-i-do#digital-consultancy" },
  { label: "System Architecture", href: "/what-i-do#system-design" },
  { label: "Web Development", href: "/what-i-do#web-development" },
  { label: "Payment Integrations", href: "/what-i-do#payment-integrations" },
  { label: "Process Automation", href: "/what-i-do#process-automation" },
  { label: "IT Support & Consulting", href: "/what-i-do#it-support" },
];

const explore = [
  { label: "Home", href: "/" },
  { label: "What I Do", href: "/what-i-do" },
  { label: "Courses", href: "/courses" },
  { label: "Projects & Products", href: "/projects" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

const socials = [
  { Logo: InstagramLogo, href: "https://www.instagram.com/emoni_sam?igsh=OGQ5ZDc2ODk2ZA==", label: "Instagram" },
  { Logo: FacebookLogo, href: "https://web.facebook.com/sam.ke.991357/", label: "Facebook" },
  { Logo: TwitterXLogo, href: "https://twitter.com/", label: "Twitter / X" },
  { Logo: RedditLogo, href: "https://www.reddit.com/", label: "Reddit" },
  { Logo: LinkedInLogo, href: "https://www.linkedin.com/in/samuelemoni", label: "LinkedIn" },
  { Logo: GitHubLogo, href: "https://github.com/Samz-Code", label: "GitHub" },
  { Logo: PinterestLogo, href: "https://www.pinterest.com/", label: "Pinterest" },
  { Logo: BehanceLogo, href: "https://www.behance.net/", label: "Behance" },
];


// ─── Animated Spark Logo ─────────────────────────────────────────────────────

const SPARKS = [
  { angle: 0,   delay: 0,    size: 5, dist: 56 },
  { angle: 45,  delay: 0.3,  size: 3, dist: 62 },
  { angle: 90,  delay: 0.6,  size: 6, dist: 52 },
  { angle: 135, delay: 0.9,  size: 3, dist: 65 },
  { angle: 180, delay: 0.2,  size: 5, dist: 58 },
  { angle: 225, delay: 0.7,  size: 4, dist: 60 },
  { angle: 270, delay: 0.4,  size: 6, dist: 54 },
  { angle: 315, delay: 1.0,  size: 3, dist: 63 },
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
      transition={{
        duration: 2.4,
        delay,
        repeat: Infinity,
        repeatDelay: 0.8,
        ease: "easeInOut",
      }}
    >
      {/* 4-point star shape */}
      <svg viewBox="0 0 10 10" width={size} height={size}>
        <path
          d="M5 0 L5.6 4.4 L10 5 L5.6 5.6 L5 10 L4.4 5.6 L0 5 L4.4 4.4 Z"
          fill="#E77E23"
        />
      </svg>
    </motion.div>
  );
};

const SparkLogo = () => (
  <div className="relative self-start" style={{ width: 180, height: 112 }}>
    {/* Spark particles */}
    {SPARKS.map((s, i) => (
      <StarSpark key={i} {...s} />
    ))}

    {/* Soft ambient glow behind logo */}
    <motion.div
      className="absolute inset-0 rounded-full pointer-events-none"
      style={{
        background: "radial-gradient(ellipse at center, rgba(231,126,35,0.18) 0%, transparent 70%)",
        filter: "blur(8px)",
      }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Logo itself — subtle pulse scale */}
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

// ─── Component ──────────────────────────────────────────────────────────────

const Footer = () => {
  const year = new Date().getFullYear();
  const yearsTrusted = year - 2020;

  return (
    <footer className="bg-forest text-cream">

      {/* Top divider accent */}
      <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, transparent, #E77E23 30%, #E77E23 70%, transparent)" }} />

      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* ── Brand column ── */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <SparkLogo />

            <p className="font-body text-[15px] leading-[1.8] text-cream/70 max-w-sm">
              I design, build, and rescue digital systems for organizations across
              East Africa — from government platforms to growing businesses.
              Practical engineering, no fluff.
            </p>

            {/* Contact */}
            <div className="flex flex-col gap-3 mt-1">
              <a
                href="mailto:emonisamuel54@gmail.com"
                className="flex items-center gap-3 font-body text-[14px] text-cream/65 hover:text-ember transition-colors group"
              >
                <span className="w-8 h-8 rounded-md border border-cream/15 flex items-center justify-center group-hover:border-ember/50 transition-colors flex-shrink-0">
                  <Mail size={14} className="text-ember" />
                </span>
                emonisamuel54@gmail.com
              </a>
              <a
                href="tel:+254727492545"
                className="flex items-center gap-3 font-body text-[14px] text-cream/65 hover:text-ember transition-colors group"
              >
                <span className="w-8 h-8 rounded-md border border-cream/15 flex items-center justify-center group-hover:border-ember/50 transition-colors flex-shrink-0">
                  <Phone size={14} className="text-ember" />
                </span>
                +254 727 492 545
              </a>
              <div className="flex items-center gap-3 font-body text-[14px] text-cream/65">
                <span className="w-8 h-8 rounded-md border border-cream/15 flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-ember" />
                </span>
                Nairobi, Kenya · EAT (UTC+3)
              </div>
            </div>
          </div>

          {/* ── Explore ── */}
          <div className="lg:col-span-2">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-cream/35 mb-6">
              Explore
            </p>
            <ul className="flex flex-col gap-3.5">
              {explore.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-body text-[15px] text-cream/70 hover:text-ember hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Services ── */}
          <div className="lg:col-span-3">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-cream/35 mb-6">
              Services
            </p>
            <ul className="flex flex-col gap-3.5">
              {services.map((s) => (
                <li key={s.label}>
                  <Link
                    to={s.href}
                    className="font-body text-[15px] text-cream/70 hover:text-ember hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Connect ── */}
          <div className="lg:col-span-3">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-cream/35 mb-6">
              Connect
            </p>

            {/* 2 × 4 social grid */}
            <div className="grid grid-cols-2 gap-3">
              {socials.map(({ Logo, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-cream/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-cream/25 transition-all duration-200 group"
                >
                  <span className="flex-shrink-0 rounded-md overflow-hidden leading-none shadow group-hover:scale-110 transition-transform duration-200">
                    <Logo />
                  </span>
                  <span className="font-body text-[13px] font-medium text-cream/65 group-hover:text-cream transition-colors leading-tight">
                    {label}
                  </span>
                </a>
              ))}
            </div>

            {/* Working hours */}
            <div className="mt-8 pl-4 border-l-[3px] border-ember">
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-cream/35 mb-2">
                Working Hours
              </p>
              <p className="font-body text-[14px] text-cream/75">Mon – Fri · 09:00 – 18:00</p>
              <p className="font-body text-[13px] text-cream/50 mt-0.5">Sat · 10:00 – 14:00 · EAT</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ backgroundColor: "#E77E23" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-[13px] font-bold text-black">
            © {year} Samuel A. Emoni. All rights reserved.
            <span className="mx-2 text-black/40">·</span>
            <span className="font-bold text-black">Trusted {yearsTrusted}+ Years</span>
          </p>
          <div className="flex items-center gap-6 font-body text-[13px] font-bold text-black">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-black/40">·</span>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;