import { Link } from "react-router-dom";
import {
  Linkedin,
  MessageCircle,
  Github,
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

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
  { icon: Linkedin, href: "https://www.linkedin.com/in/samuelemoni", label: "LinkedIn" },
  { icon: MessageCircle, href: "https://wa.me/254727492545", label: "WhatsApp" },
  { icon: Github, href: "https://github.com/Samz-Code", label: "GitHub" },
  { icon: Instagram, href: "https://www.instagram.com/emoni_sam?igsh=OGQ5ZDc2ODk2ZA==", label: "Instagram" },
  { icon: Facebook, href: "https://web.facebook.com/sam.ke.991357/", label: "Facebook" },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const yearsTrusted = year - 2020;

  return (
    <footer className="bg-forest text-cream border-t border-cream/20">

      {/* Main footer grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Brand column */}
          <div className="md:col-span-4 flex flex-col items-center text-center">
            <img
              src="/images/brand_white.png"
              alt="Samuel A. Emoni Logo"
              width={150}
              height={80}
              loading="lazy"
              className="h-16 w-auto object-contain"
            />
            <p className="font-body text-sm text-cream/70 mt-5 leading-relaxed">
              I design, build, and rescue digital systems for organizations across East Africa —
              from government platforms to growing businesses. Practical engineering, no fluff.
            </p>

            <div className="mt-6 space-y-2 font-body text-[13px] text-cream/70 text-left">
              <a href="mailto:emonisamuel54@gmail.com" className="flex items-center gap-2 hover:text-ember transition-colors">
                <Mail size={14} className="text-ember" /> emonisamuel54@gmail.com
              </a>
              <a href="tel:+254727492545" className="flex items-center gap-2 hover:text-ember transition-colors">
                <Phone size={14} className="text-ember" /> +254 727 492 545
              </a>
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-ember" /> Nairobi, Kenya · EAT (UTC+3)
              </p>
            </div>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-cream/40 mb-4">
              Explore
            </p>
            <ul className="space-y-2.5">
              {explore.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-body text-sm text-cream/80 hover:text-ember transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="md:col-span-3">
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-cream/40 mb-4">
              Services
            </p>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s.label}>
                  <Link
                    to={s.href}
                    className="font-body text-sm text-cream/80 hover:text-ember transition-colors"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-3">
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-cream/40 mb-4">
              Connect
            </p>
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 flex items-center justify-center border border-cream/20 rounded-[4px] text-cream/70 hover:text-ember hover:border-ember transition-colors"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>

            <div className="mt-6 border-l-2 border-ember pl-3 text-left">
              <p className="font-body text-[11px] uppercase tracking-[0.18em] text-cream/50">
                Working Hours
              </p>
              <p className="font-body text-[13px] text-cream/80 mt-1">Mon – Fri · 09:00 – 18:00</p>
              <p className="font-body text-[13px] text-cream/60">Sat · 10:00 – 14:00 · EAT</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-body text-[12px] text-cream/50">
            © {year} Samuel A. Emoni. All rights reserved. · <span style={{ color: '#E77E23' }}>Trusted {yearsTrusted}+ Years</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-body text-[12px] text-cream/60">
            <Link to="/privacy" className="hover:text-ember transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-ember transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;