import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
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
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href.split("#")[0]);
  };

  return (
    <nav className="sticky top-0 z-50 bg-forest w-full">
      {/* ── Desktop & Mobile bar ── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-8 flex items-center justify-between h-20">

        {/* Avatar — larger, breathing room from the edge */}
        <Link to="/" className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full border-2 border-olive overflow-hidden bg-olive/30 ring-2 ring-olive/20">
            <img
              src="/images/avatar.jpg"
              alt="Samuel Emoni"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
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
                  className={`font-body text-base font-semibold text-cream flex items-center gap-1 transition-colors hover:text-ember ${
                    isActive(link.href) ? "underline underline-offset-4 decoration-ember" : ""
                  }`}
                >
                  {link.label}
                  <ChevronDown size={14} />
                </Link>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 bg-forest border-t-2 border-ember z-50 min-w-[260px] py-2">
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="block px-4 py-2 text-base font-medium text-cream hover:text-ember transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className={`font-body text-sm text-cream transition-colors hover:text-ember ${
                  isActive(link.href) ? "underline underline-offset-4 decoration-ember" : ""
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Desktop CTA */}
        <Link
          to="/contact"
          className="hidden md:inline-block bg-ember text-snow px-5 py-3 text-base font-body font-semibold rounded-[4px] hover:opacity-90 transition-opacity"
        >
          Start a Project →
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink z-50"
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 h-full w-72 bg-forest z-50 flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-cream/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-olive overflow-hidden bg-olive/30 flex-shrink-0">
                    <img
                      src="/images/avatar.jpg"
                      alt="Samuel Emoni"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="leading-tight">
                    <p className="font-body text-sm font-bold text-cream">Samuel Emoni</p>
                    <p className="font-body text-xs text-cream/50">Digital Consultant</p>
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
              <div className="px-6 pb-8 pt-4 border-t border-cream/10">
                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center bg-ember text-snow px-5 py-3.5 text-base font-body font-semibold rounded-[4px] hover:opacity-90 transition-opacity"
                >
                  Start a Project →
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