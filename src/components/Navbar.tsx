import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "What I Do",
    href: "/what-i-do",
    dropdown: [
      { label: "Digital Consultancy",          href: "/what-i-do#digital-consultancy" },
      { label: "System Design & Architecture", href: "/what-i-do#system-design" },
      { label: "Web Development",              href: "/what-i-do#web-development" },
      { label: "Graphic Design & Branding",    href: "/what-i-do#graphic-design" },
      { label: "Payment Integrations",         href: "/what-i-do#payment-integrations" },
      { label: "Process Automation",           href: "/what-i-do#process-automation" },
      { label: "API & System Integration",     href: "/what-i-do#api-integration" },
      { label: "IT Support & Consulting",      href: "/what-i-do#it-support" },
    ],
  },
  { label: "Courses",             href: "/courses" },
  { label: "Projects & Products", href: "/projects" },
  { label: "Insights",            href: "/insights" },
  { label: "Contact",             href: "/contact" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen]           = useState(false);
  const [dropdownOpen, setDropdownOpen]       = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState(false);
  const [scrolled, setScrolled]               = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
    setMobileAccordion(false);
  }, [location.pathname]);

  // Scroll-aware background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href.split("#")[0]);
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-forest/85 backdrop-blur-xl border-b border-cream/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
          : "bg-forest border-b border-transparent"
      }`}
    >
      {/* Top accent hairline */}
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(231,126,35,0.55) 30%, rgba(231,126,35,0.55) 70%, transparent)" }}
      />

      {/* ── Bar ── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-8 flex items-center justify-between h-20">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="relative w-14 h-14 rounded-full border-2 border-olive overflow-hidden bg-olive/30 ring-2 ring-olive/20 transition-transform duration-200 group-hover:scale-105">
            <img
              src="/images/avatar.jpg"
              alt="Samuel Emoni"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="font-display text-[15px] font-bold text-cream">Samuel Emoni</p>
            <p className="font-body text-[11px] uppercase tracking-[0.16em] text-cream/40">Digital Consultant</p>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <Link
                  to={link.href}
                  className={`group relative font-body text-[15px] font-medium flex items-center gap-1 py-1 transition-colors ${
                    isActive(link.href) ? "text-ember" : "text-cream hover:text-ember"
                  }`}
                >
                  {link.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                  <span
                    className={`absolute -bottom-0.5 left-0 h-0.5 bg-ember transition-all duration-300 ${
                      isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute top-full left-0 pt-4"
                    >
                      <div className="min-w-[300px] rounded-2xl bg-forest/95 backdrop-blur-xl border border-cream/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">
                        <div
                          className="h-px w-full"
                          style={{ background: "linear-gradient(90deg, transparent, #E77E23, transparent)" }}
                        />
                        <div className="py-2">
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.label}
                              to={item.href}
                              className="group/item flex items-center justify-between px-5 py-2.5 font-body text-[14px] font-medium text-cream/70 hover:text-ember hover:bg-white/[0.04] transition-colors"
                            >
                              <span className="transition-transform duration-200 group-hover/item:translate-x-1">
                                {item.label}
                              </span>
                              <ArrowUpRight
                                size={13}
                                className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200"
                              />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className={`group relative font-body text-[15px] font-medium py-1 transition-colors ${
                  isActive(link.href) ? "text-ember" : "text-cream hover:text-ember"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-0.5 bg-ember transition-all duration-300 ${
                    isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            )
          )}
        </div>

        {/* Desktop CTA */}
        <Link
          to="/contact"
          className="group hidden md:inline-flex items-center gap-2 bg-ember text-black px-5 py-2.5 text-[14px] font-body font-bold rounded-full transition-all duration-200 hover:bg-cream hover:shadow-[0_0_24px_rgba(231,126,35,0.4)]"
        >
          Start a Project
          <ArrowUpRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-cream p-2 -mr-1"
          aria-label="Open menu"
        >
          <Menu size={26} />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink z-50"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 h-full w-[300px] bg-forest z-50 flex flex-col border-l border-cream/10"
            >
              {/* Accent hairline */}
              <div
                className="h-px w-full flex-shrink-0"
                style={{ background: "linear-gradient(90deg, transparent, #E77E23, transparent)" }}
              />

              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-cream/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-olive overflow-hidden bg-olive/30 flex-shrink-0">
                    <img
                      src="/images/avatar.jpg"
                      alt="Samuel Emoni"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  <div className="leading-tight">
                    <p className="font-display text-sm font-bold text-cream">Samuel Emoni</p>
                    <p className="font-body text-[11px] uppercase tracking-[0.14em] text-cream/45">Digital Consultant</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-cream/60 hover:text-cream transition-colors p-1"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 px-6 py-5 space-y-1 overflow-y-auto">
                {navLinks.map((link) =>
                  link.dropdown ? (
                    <div key={link.label}>
                      <button
                        onClick={() => setMobileAccordion(!mobileAccordion)}
                        className={`w-full flex items-center justify-between py-3 font-body text-base font-semibold transition-colors ${
                          isActive(link.href) ? "text-ember" : "text-cream hover:text-ember"
                        }`}
                      >
                        {link.label}
                        <ChevronDown
                          size={15}
                          className={`transition-transform duration-200 ${mobileAccordion ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {mobileAccordion && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden pl-3 border-l border-ember/30 ml-1 mb-1"
                          >
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.label}
                                to={item.href}
                                className="block py-2.5 text-sm font-medium text-cream/75 hover:text-ember transition-colors"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      className={`block py-3 font-body text-base font-semibold transition-colors hover:text-ember ${
                        isActive(link.href) ? "text-ember" : "text-cream"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>

              {/* CTA */}
              <div className="px-6 pb-8 pt-4 border-t border-cream/10 flex-shrink-0">
                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 bg-ember text-black px-5 py-3.5 text-base font-body font-bold rounded-full hover:bg-cream transition-colors"
                >
                  Start a Project
                  <ArrowUpRight size={17} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;