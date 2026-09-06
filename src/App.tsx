import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ThemeProvider } from "@/components/ThemeProvider";

// Layout & Navigation Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import BackToTop from "@/components/BackToTop";
import ScrollToTop from "@/components/ScrollToTop";

// Public Agency Pages
import Index from "./pages/Index";
import WhatIDo from "./pages/WhatIDo";
import Courses from "./pages/Courses";
import Projects from "./pages/Projects";
import Insights from "./pages/Insights";
import InsightDetail from "./pages/InsightDetail";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

// Admin & Editor Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageServices from "./pages/admin/ManageServices";
import EditService from "./pages/admin/EditService";
import ManageCourses from "./pages/admin/ManageCourses";
import ManageProjects from "./pages/admin/ManageProjects";
import ManageProcessSteps from "./pages/admin/ManageProcessSteps";
import ManageIdealFor from "./pages/admin/ManageIdealFor";
import ManageInsights from "./pages/admin/ManageInsights";
import ManageContent from "./pages/admin/ManageContent";

const queryClient = new QueryClient();

function ProtectedAdminRoute() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifyAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        const role = profile?.role || session.user.app_metadata?.role || session.user.user_metadata?.role;
        setIsAdmin(role === "admin");
      }
      setLoading(false);
    }

    verifyAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setIsAdmin(false);
        setLoading(false);
      } else {
        verifyAdmin();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] font-display text-[#007979] text-sm tracking-widest uppercase">
        VERIFYING PORTAL ACCESS PRIVILEGES...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF9F5] font-body text-[#524646] p-6 text-center">
        <h2 className="font-display text-3xl font-bold text-[#EC5B38]">UNAUTHORIZED ACCESS</h2>
        <p className="mt-2 text-sm max-w-md text-[#524646]/80">
          Your account (<strong>{session.user.email}</strong>) is authenticated but does not hold administrator authority.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-6 px-6 py-2.5 bg-[#007979] text-[#FFE2AF] rounded-lg font-display text-sm font-bold hover:bg-[#24B1B1] transition-colors"
        >
          SIGN OUT & RETURN
        </button>
      </div>
    );
  }

  return <Outlet />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Protected Administrative CMS Routes (no Navbar/Footer) */}
            <Route path="/admin" element={<ProtectedAdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="content" element={<ManageContent />} />
                <Route path="services" element={<ManageServices />} />
                <Route path="services/new" element={<EditService />} />
                <Route path="services/edit/:id" element={<EditService />} />
                <Route path="courses" element={<ManageCourses />} />
                <Route path="projects" element={<ManageProjects />} />
                <Route path="process-steps" element={<ManageProcessSteps />} />
                <Route path="ideal-for" element={<ManageIdealFor />} />
                <Route path="insights" element={<ManageInsights />} />
              </Route>
            </Route>

            {/* Public Web Platform Routes (with Navbar/Footer) */}
            <Route
              path="*"
              element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/what-i-do" element={<WhatIDo />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/insights/:slug" element={<InsightDetail />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Footer />
                  <FloatingWidgets />
                  <BackToTop />
                </>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;