import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ArrowUpRight, LogIn, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { label: "HOME", href: "/" },
  {
    label: "WHAT I DO",
    href: "/what-i-do",
    dropdown: [
      { label: "DIGITAL CONSULTANCY",          href: "/what-i-do#digital-consultancy" },
      { label: "SYSTEM DESIGN & ARCHITECTURE", href: "/what-i-do#system-design" },
      { label: "WEB DEVELOPMENT",              href: "/what-i-do#web-development" },
      { label: "GRAPHIC DESIGN & BRANDING",    href: "/what-i-do#graphic-design" },
      { label: "PAYMENT INTEGRATIONS",         href: "/what-i-do#payment-integrations" },
      { label: "PROCESS AUTOMATION",           href: "/what-i-do#process-automation" },
      { label: "API & SYSTEM INTEGRATION",     href: "/what-i-do#api-integration" },
      { label: "IT SUPPORT & CONSULTING",      href: "/what-i-do#it-support" },
      { label: "DIGITAL MARKETING",            href: "/what-i-do#digital-marketing" },
      { label: "MARKETING PLAN",               href: "/what-i-do#marketing-plan" },
      { label: "BRAND STRATEGY",               href: "/what-i-do#brand-strategy" },
      { label: "TRADITIONAL MARKETING",        href: "/what-i-do#traditional-marketing" },
      { label: "MEDIA BUYING",                 href: "/what-i-do#media-buying" },
      { label: "WEB DESIGN",                   href: "/what-i-do#web-design" },
      { label: "SEO",                          href: "/what-i-do#seo" },
      { label: "SOCIAL MEDIA",                 href: "/what-i-do#social-media" },
      { label: "CONTENT CREATION",             href: "/what-i-do#content-creation" },
    ],
  },
  { label: "COURSES",             href: "/courses" },
  { label: "PROJECTS & PRODUCTS", href: "/projects" },
  { label: "INSIGHTS",            href: "/insights" },
  { label: "CONTACT",             href: "/contact" },
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close drawer on Escape key for accessibility
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href.split("#")[0]);
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[hsl(var(--forest))] shadow-xl border-b border-[hsl(var(--cream))/0.2]"
          : "bg-[hsl(var(--forest))] border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-28">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center group shrink-0">
          <img
            src="/whitelogo.png"
            alt="Samuel Emoni Logo"
            className="h-16 sm:h-20 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* Navigation Links — desktop/laptop only */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className={`relative font-sans text-xs font-bold tracking-wider flex items-center gap-1 py-1 transition-colors ${
                    isActive(link.href)
                      ? "text-[hsl(var(--cream))]"
                      : "text-white hover:text-[hsl(var(--cream))]"
                  }`}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {link.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180 text-[hsl(var(--cream))]" : "text-white/70"
                    }`}
                  />
                  {isActive(link.href) && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[hsl(var(--ember))] rounded-full" />
                  )}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 pt-3 max-w-[90vw]"
                    >
                      <div className="w-[min(560px,90vw)] rounded-xl bg-[hsl(var(--forest))] border border-[hsl(var(--cream))/0.2] shadow-2xl overflow-hidden py-2 grid grid-cols-1 sm:grid-cols-2 gap-x-1 max-h-[70vh] overflow-y-auto">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center justify-between px-4 py-2.5 font-sans text-xs font-bold tracking-wider text-white hover:text-[hsl(var(--cream))] hover:bg-white/10 transition-colors"
                          >
                            <span>{item.label}</span>
                            <ArrowUpRight size={13} className="text-[hsl(var(--cream))/0.7] shrink-0 ml-2" />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className={`relative font-sans text-xs font-bold tracking-wider py-1 transition-colors whitespace-nowrap ${
                  isActive(link.href)
                    ? "text-[hsl(var(--cream))]"
                    : "text-white hover:text-[hsl(var(--cream))]"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[hsl(var(--ember))] rounded-full" />
                )}
              </Link>
            )
          )}
        </div>

        {/* Portal Login + Theme Toggle — desktop/laptop only */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <Link
            to="/admin/login"
            className="flex items-center gap-2 font-sans text-xs font-bold tracking-wider text-[hsl(var(--forest))] bg-[hsl(var(--cream))] py-2.5 px-5 rounded-full hover:bg-white transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <LogIn size={15} />
            <span>PORTAL LOGIN</span>
          </Link>
        </div>

        {/* Mobile / Tablet: Portal Login + Hamburger (ThemeToggle removed) */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/admin/login"
            aria-label="Portal Login"
            className="flex items-center justify-center text-[hsl(var(--forest))] bg-[hsl(var(--cream))] p-2.5 rounded-full hover:bg-white transition-colors shadow-md"
          >
            <LogIn size={18} />
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="text-white hover:text-[hsl(var(--cream))] p-2 -mr-2"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={24} className="sm:hidden" />
            <Menu size={26} className="hidden sm:block" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed top-0 right-0 h-full w-[85vw] max-w-[320px] bg-[hsl(var(--forest))] border-l border-[hsl(var(--cream))/0.2] z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-[hsl(var(--cream))/0.2] shrink-0">
                <img
                  src="/whitelogo.png"
                  alt="Samuel Emoni Logo"
                  className="h-10 w-auto object-contain"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-white hover:text-[hsl(var(--cream))] p-1"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 px-5 sm:px-6 py-4 overflow-y-auto space-y-1 min-h-0">
                {navLinks.map((link) =>
                  link.dropdown ? (
                    <div key={link.label}>
                      <button
                        onClick={() => setMobileAccordion(!mobileAccordion)}
                        className={`w-full flex items-center justify-between py-2.5 font-sans text-xs font-bold tracking-wider ${
                          isActive(link.href) ? "text-[hsl(var(--cream))]" : "text-white"
                        }`}
                        aria-expanded={mobileAccordion}
                      >
                        {link.label}
                        <ChevronDown
                          size={14}
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
                            className="overflow-hidden"
                          >
                            <div className="pl-3 border-l border-[hsl(var(--cream))/0.3] my-1 space-y-2">
                              {link.dropdown.map((item) => (
                                <Link
                                  key={item.label}
                                  to={item.href}
                                  className="block py-1.5 font-sans text-xs font-bold tracking-wider text-white/80 hover:text-[hsl(var(--cream))]"
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      className={`block py-2.5 font-sans text-xs font-bold tracking-wider ${
                        isActive(link.href) ? "text-[hsl(var(--cream))]" : "text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>

              {/* Portal Login Footer */}
              <div className="p-5 sm:p-6 border-t border-[hsl(var(--cream))/0.2] shrink-0">
                <Link
                  to="/admin/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 bg-[hsl(var(--cream))] text-[hsl(var(--forest))] py-3 font-sans text-xs font-bold tracking-wider rounded-full hover:bg-white transition-colors shadow-md"
                >
                  <LogIn size={16} />
                  <span>PORTAL LOGIN</span>
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