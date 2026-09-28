import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  ExternalLink,
  FileText,
  FolderKanban,
  GraduationCap,
  Handshake,
  Inbox,
  Layers,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  Newspaper,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════
   NOTIFICATIONS (new partner applications)
═══════════════════════════════════════════════════════════ */
type NewApplication = {
  id: string;
  organization_name: string;
  field: string | null;
  created_at: string;
};

type NotificationsData = { count: number; items: NewApplication[] };

function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * Query key starts with "admin-partner-applications" so ManagePartners'
 * invalidateQueries({ queryKey: ["admin-partner-applications"] }) refreshes it too
 * (e.g. when you change a status from "new").
 */
function useNewApplications() {
  const qc = useQueryClient();

  const query = useQuery<NotificationsData>({
    queryKey: ["admin-partner-applications", "new-bell"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("partner_applications")
        .select("id, organization_name, field, created_at", { count: "exact" })
        .eq("status", "new")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return { count: count ?? data?.length ?? 0, items: (data ?? []) as NewApplication[] };
    },
  });

  // Live updates (needs Realtime enabled on partner_applications; polling above is the fallback)
  useEffect(() => {
    const channel = supabase
      .channel("admin-partner-applications-bell")
      .on("postgres_changes", { event: "*", schema: "public", table: "partner_applications" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-partner-applications"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return query;
}

function NotificationBell({
  data,
  loading,
  error,
}: {
  data?: NotificationsData;
  loading: boolean;
  error: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const count = data?.count ?? 0;
  const items = data?.items ?? [];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={count ? `Notifications, ${count} new` : "Notifications"}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative p-2 rounded-lg text-[#007979] hover:bg-[#007979]/10 hover:text-[#EC5B38] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EC5B38] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#FBF9F5]">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-[#E8E2D6] rounded-xl shadow-xl overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-[#E8E2D6] flex items-center justify-between">
            <p className="font-display text-sm text-[#1A1A16]">Notifications</p>
            {count > 0 && (
              <span className="text-[10px] font-bold bg-[#EC5B38]/10 text-[#EC5B38] rounded-full px-2 py-0.5">
                {count} new
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-[#524646]/60">Loading…</p>
            ) : error ? (
              <p className="px-4 py-8 text-center text-sm text-red-600">Could not load notifications</p>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-6 h-6 mx-auto text-[#524646]/25 mb-2" />
                <p className="text-sm text-[#524646]/70">You're all caught up</p>
              </div>
            ) : (
              <ul>
                {items.map((a) => (
                  <li key={a.id}>
                    <Link
                      to="/admin/partners"
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[#FBF9F5] border-b border-[#E8E2D6]/60 last:border-b-0"
                    >
                      <span className="mt-0.5 w-8 h-8 rounded-full bg-[#007979]/10 text-[#007979] flex items-center justify-center shrink-0">
                        <Inbox className="w-4 h-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-[#1A1A16] font-medium truncate">
                          {a.organization_name}
                        </span>
                        <span className="block text-xs text-[#524646]/70 truncate">
                          New partner application{a.field ? ` · ${a.field}` : ""}
                        </span>
                        <span className="block text-[11px] text-[#9A9A9A] mt-0.5">{timeAgo(a.created_at)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            to="/admin/partners"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-center text-xs font-display font-bold tracking-widest text-[#007979] hover:bg-[#FBF9F5] border-t border-[#E8E2D6]"
          >
            VIEW ALL APPLICATIONS
          </Link>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════════════════════ */
export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const notifications = useNewApplications();
  const newApplications = notifications.data?.count ?? 0;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleNavClick = () => setIsSidebarOpen(false);

  const navLinks: { to: string; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { to: "/admin", label: "DASHBOARD", icon: LayoutDashboard },
    { to: "/admin/content", label: "SITE CONTENT", icon: FileText },
    { to: "/admin/services", label: "MANAGE SERVICES", icon: Layers },
    { to: "/admin/courses", label: "MANAGE COURSES", icon: GraduationCap },
    { to: "/admin/insights", label: "MANAGE INSIGHTS", icon: Newspaper },
    { to: "/admin/process-steps", label: "HOW I WORK", icon: ListOrdered },
    { to: "/admin/ideal-for", label: "IDEAL FOR", icon: Users },
    { to: "/admin/projects", label: "PROJECTS & CASE STUDIES", icon: FolderKanban },
    { to: "/admin/partners", label: "MANAGE PARTNERS", icon: Handshake, badge: newApplications },
  ];

  const isActiveLink = (to: string) =>
    to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(to);

  const currentPageLabel = navLinks.find((link) => isActiveLink(link.to))?.label ?? "ADMIN PORTAL";

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
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-40 w-64 bg-[#007979] text-white p-6 flex flex-col justify-between shrink-0 shadow-xl lg:h-screen overflow-y-auto transform transition-transform duration-300 ease-in-out ${
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
            {navLinks.map(({ to, label, icon: Icon, badge }) => {
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
                  <span className="flex-1">{label}</span>
                  {badge ? (
                    <span className="text-[10px] font-bold bg-[#EC5B38] text-white rounded-full px-1.5 py-0.5 leading-none">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Controls */}
        <div className="pt-6 mt-6 border-t border-[#24B1B1]/30 space-y-3">
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

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <NotificationBell
              data={notifications.data}
              loading={notifications.isPending}
              error={notifications.isError}
            />
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-display font-bold text-[#007979] hover:text-[#EC5B38] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">VISIT WEBSITE</span>
            </a>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}