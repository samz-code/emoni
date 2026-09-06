import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  FileText,
  Layers,
  GraduationCap,
  FolderKanban,
  ListOrdered,
  Users,
  Newspaper,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleNavClick = () => setIsSidebarOpen(false);

  const navLinks = [
    { to: "/admin", label: "DASHBOARD", icon: LayoutDashboard },
    { to: "/admin/content", label: "SITE CONTENT", icon: FileText },
    { to: "/admin/services", label: "MANAGE SERVICES", icon: Layers },
    { to: "/admin/courses", label: "MANAGE COURSES", icon: GraduationCap },
    { to: "/admin/insights", label: "MANAGE INSIGHTS", icon: Newspaper },
    { to: "/admin/process-steps", label: "HOW I WORK", icon: ListOrdered },
    { to: "/admin/ideal-for", label: "IDEAL FOR", icon: Users },
    { to: "/admin/projects", label: "PROJECTS & CASE STUDIES", icon: FolderKanban },
  ];

  const isActiveLink = (to: string) =>
    to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(to);

  const currentPageLabel =
    navLinks.find((link) => isActiveLink(link.to))?.label.replace(/&/g, "&") ?? "ADMIN PORTAL";

  return (
    <div className="flex min-h-screen bg-[#FBF9F5] font-body text-[#524646]">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-40 w-64 bg-[#007979] text-white p-6 flex flex-col justify-between shrink-0 shadow-xl lg:h-screen transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="pb-8 border-b border-[#24B1B1]/30 flex items-center justify-between">
            <Link to="/admin" className="block" onClick={handleNavClick}>
              <img
                src="/whitelogo.png"
                alt="Samuel Emoni Logo"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 text-[#FFE2AF] hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-2 font-display">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = isActiveLink(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={handleNavClick}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    active
                      ? "bg-[#24B1B1]/25 text-white"
                      : "text-[#FFE2AF] hover:bg-[#24B1B1]/20 hover:text-white hover:translate-x-1"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-[#FFE2AF]" />
                  )}
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active ? "text-[#FFE2AF]" : "text-[#24B1B1] group-hover:text-[#FFE2AF]"
                    }`}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Controls */}
        <div className="pt-6 border-t border-[#24B1B1]/30 space-y-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full flex items-center gap-2 px-3.5 py-2.5 text-sm font-display text-[#FFE2AF] bg-black/20 hover:bg-[#24B1B1]/30 hover:text-white rounded-lg transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4 text-[#24B1B1] group-hover:text-white transition-colors shrink-0" />
            <span>VISIT WEBSITE</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-display text-red-300 hover:bg-red-500/20 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Workplace */}
      <div className="flex-1 flex flex-col min-h-screen w-full lg:w-auto overflow-hidden">
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 lg:px-12 py-4 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#524646]/10 shadow-[0_1px_0_0_rgba(82,70,70,0.04)]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 text-[#007979] hover:text-[#EC5B38] transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="font-display text-[10px] sm:text-xs tracking-widest uppercase text-[#524646]/50">
                Admin Portal
              </p>
              <p className="font-display text-xs sm:text-sm tracking-widest uppercase text-[#007979] truncate">
                {currentPageLabel}
              </p>
            </div>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-display font-bold text-[#007979] hover:text-[#EC5B38] transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">VISIT WEBSITE</span>
          </a>
        </header>

        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}