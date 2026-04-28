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
      { label: "Digital Consultancy", href: "/what-i-do#digital-consultancy" },
      { label: "System Design & Architecture", href: "/what-i-do#system-design" },
      { label: "Web Development", href: "/what-i-do#web-development" },
      { label: "Graphic Design & Branding", href: "/what-i-do#graphic-design" },
      { label: "Payment Integrations", href: "/what-i-do#payment-integrations" },
      { label: "Process Automation", href: "/what-i-do#process-automation" },
      { label: "API & System Integration", href: "/what-i-do#api-integration" },
      { label: "IT Support & Consulting", href: "/what-i-do#it-support" },
    ],
  },
  { label: "Courses", href: "/courses" },
  { label: "Projects & Products", href: "/projects" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Avatar */}
        <Link to="/" className="flex-shrink-0">
          <div className="w-14 h-14 rounded-full border-2 border-olive overflow-hidden bg-olive/30">
            <img
              src="/images/avatar.jpg"
              alt="Samuel Emoni"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
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
          className="md:hidden text-cream p-2"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-72 bg-forest z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4">
                <div className="w-14 h-14 rounded-full border-2 border-olive overflow-hidden bg-olive/30">
                  <img src="/images/avatar.jpg" alt="Samuel Emoni" className="w-full h-full object-cover" />
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-cream p-2" aria-label="Close menu">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 px-4 py-4 space-y-1">
                {navLinks.map((link) =>
                  link.dropdown ? (
                    <div key={link.label}>
                      <button
                        onClick={() => setMobileAccordion(!mobileAccordion)}
                        className={`w-full flex items-center justify-between py-3 font-body text-lg font-semibold text-cream ${
                          isActive(link.href) ? "text-ember" : ""
                        }`}
                      >
                        {link.label}
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${mobileAccordion ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {mobileAccordion && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-4"
                          >
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.label}
                                to={item.href}
                                className="block py-2 text-base font-medium text-cream/80 hover:text-ember transition-colors"
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
                      className={`block py-3 font-body text-lg font-semibold text-cream transition-colors hover:text-ember ${
                        isActive(link.href) ? "text-ember" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
              <div className="p-4">
                <Link
                  to="/contact"
                  className="block text-center bg-ember text-snow px-5 py-3 text-base font-body font-semibold rounded-[4px]"
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
