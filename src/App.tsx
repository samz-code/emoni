import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect, useState } from "react";

// SEO
import SEO from "@/components/SEO";
import RouteSEO from "@/components/RouteSEO";

// Layout & Navigation Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsent from "@/components/CookieConsent";

const FloatingWidgets = lazy(() => import("@/components/FloatingWidgets"));
const PopupManager = lazy(() => import("@/components/popups/PopupManager"));
const Index = lazy(() => import("./pages/Index"));
const WhatIDo = lazy(() => import("./pages/WhatIDo"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Partners = lazy(() => import("./pages/Partners"));
const Insights = lazy(() => import("./pages/Insights"));
const InsightDetail = lazy(() => import("./pages/InsightDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageServices = lazy(() => import("./pages/admin/ManageServices"));
const EditService = lazy(() => import("./pages/admin/EditService"));
const ManageCourses = lazy(() => import("./pages/admin/ManageCourses"));
const ManageProjects = lazy(() => import("./pages/admin/ManageProjects"));
const ManageAbout = lazy(() => import("./pages/admin/ManageAbout"));
const ManageProcessSteps = lazy(() => import("./pages/admin/ManageProcessSteps"));
const ManageIdealFor = lazy(() => import("./pages/admin/ManageIdealFor"));
const ManageInsights = lazy(() => import("./pages/admin/ManageInsights"));
const ManageContent = lazy(() => import("./pages/admin/ManageContent"));
const ManagePartners = lazy(() => import("./pages/admin/ManagePartners"));
const ManagePopups = lazy(() => import("./pages/admin/ManagePopups"));
const ManageClientWork = lazy(() => import("./pages/admin/ManageClientWork"));
const ManageOffers = lazy(() => import("./pages/admin/ManageOffers"));
const ManageIndustries = lazy(() => import("./pages/admin/ManageIndustries"));
const Industries = lazy(() => import("./pages/Industries"));
const IndustryDetail = lazy(() => import("./pages/IndustryDetail"));
const ClientProposalPage = lazy(() =>
  import("./pages/ClientDocuments").then((module) => ({ default: module.ClientProposalPage })),
);
const WebsiteReviewClientPage = lazy(() =>
  import("./pages/ClientDocuments").then((module) => ({ default: module.WebsiteReviewClientPage })),
);
const WebsiteReviewRequestPage = lazy(() =>
  import("./pages/ClientDocuments").then((module) => ({ default: module.WebsiteReviewRequestPage })),
);

const queryClient = new QueryClient();

function DeferredFloatingWidgets() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  return ready ? (
    <Suspense fallback={null}>
      <FloatingWidgets />
    </Suspense>
  ) : null;
}

function DeferredPopupManager() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  return ready ? (
    <Suspense fallback={null}>
      <PopupManager />
    </Suspense>
  ) : null;
}

/** Keeps private pages out of search results and AI indexes. */
function NoIndex() {
  return (
    <SEO
      title="Private | Emoni Digital Solutions"
      description="Private page."
      noindex
    />
  );
}

function ProtectedAdminRoute() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    let requestId = 0;
    let unsubscribe = () => {};

    void import("@/lib/supabase")
      .then(({ supabase }) => {
        if (!active) return;

        async function verifyAdmin(currentSession: Session | null) {
          const currentRequest = ++requestId;
          setSession(currentSession);
          setLoading(true);

          if (!currentSession?.user) {
            setIsAdmin(false);
            setLoading(false);
            return;
          }

          try {
            const { data: profile, error } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", currentSession.user.id)
              .single();

            if (error && error.code !== "PGRST116") {
              console.error("Unable to verify administrator profile:", error);
            }

            const role = profile?.role || currentSession.user.app_metadata?.role;
            if (active && currentRequest === requestId) setIsAdmin(role === "admin");
          } catch (error) {
            console.error("Unable to verify administrator access:", error);
            if (active && currentRequest === requestId) setIsAdmin(false);
          } finally {
            if (active && currentRequest === requestId) setLoading(false);
          }
        }

        void supabase.auth.getSession().then(({ data, error }) => {
          if (error) console.error("Unable to read the current authentication session:", error);
          if (active) void verifyAdmin(data.session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          void Promise.resolve().then(() => verifyAdmin(session));
        });
        unsubscribe = () => subscription.unsubscribe();
      })
      .catch((error: unknown) => {
        console.error("Unable to load administrator authentication:", error);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <>
        <NoIndex />
        <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] font-display text-[#007979] text-sm tracking-widest uppercase">
          VERIFYING PORTAL ACCESS PRIVILEGES...
        </div>
      </>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <>
        <NoIndex />
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF9F5] font-body text-[#524646] p-6 text-center">
          <h2 className="font-display text-3xl font-bold text-[#EC5B38]">UNAUTHORIZED ACCESS</h2>
          <p className="mt-2 text-sm max-w-md text-[#524646]/80">
            Your account (<strong>{session.user.email}</strong>) is authenticated but does not hold administrator authority.
          </p>
          <button
            onClick={() => {
              void import("@/lib/supabase")
                .then(({ supabase }) => supabase.auth.signOut())
                .catch((error: unknown) => {
                  console.error("Unable to sign out:", error);
                });
            }}
            className="mt-6 px-6 py-2.5 bg-[#007979] text-[#FFE2AF] rounded-lg font-display text-sm font-bold hover:bg-[#24B1B1] transition-colors"
          >
            SIGN OUT & RETURN
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <NoIndex />
      <Outlet />
    </>
  );
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div className="min-h-screen bg-paper dark:bg-[#0F0F0C]" aria-busy="true" />}>
            <Routes>
              {/* Protected Administrative CMS Routes (no Navbar/Footer) */}
              <Route path="/admin" element={<ProtectedAdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="content" element={<ManageContent />} />
                  <Route path="services" element={<ManageServices />} />
                  <Route path="offers" element={<ManageOffers />} />
                  <Route path="industries" element={<ManageIndustries />} />
                  <Route path="services/new" element={<EditService />} />
                  <Route path="services/edit/:id" element={<EditService />} />
                  <Route path="courses" element={<ManageCourses />} />
                  <Route path="projects" element={<ManageProjects />} />
                  <Route path="about" element={<ManageAbout />} />
                  <Route path="process-steps" element={<ManageProcessSteps />} />
                  <Route path="ideal-for" element={<ManageIdealFor />} />
                  <Route path="insights" element={<ManageInsights />} />
                  <Route path="partners" element={<ManagePartners />} />
                  <Route path="popups" element={<ManagePopups />} />
                  <Route path="client-work" element={<ManageClientWork />} />
                </Route>
              </Route>

              {/* Private client documents (never indexed) */}
              <Route
                path="/proposal/:token"
                element={
                  <>
                    <NoIndex />
                    <ClientProposalPage />
                  </>
                }
              />
              <Route
                path="/website-review"
                element={
                  <>
                    <NoIndex />
                    <WebsiteReviewRequestPage />
                  </>
                }
              />
              <Route
                path="/website-review/:token"
                element={
                  <>
                    <NoIndex />
                    <WebsiteReviewClientPage />
                  </>
                }
              />

              {/* Public Web Platform Routes (with Navbar/Footer) */}
              <Route
                path="*"
                element={
                  <>
                    <RouteSEO />
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/what-i-do/:id" element={<ServiceDetail />} />
                      <Route path="/what-i-do" element={<WhatIDo />} />
                      <Route path="/courses/:id" element={<CourseDetail />} />
                      <Route path="/courses" element={<Courses />} />
                      <Route path="/projects/:kind/:id" element={<ProjectDetail />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/industries/:slug" element={<IndustryDetail />} />
                      <Route path="/industries" element={<Industries />} />
                      <Route path="/partners" element={<Partners />} />
                      <Route path="/insights" element={<Insights />} />
                      <Route path="/insights/:slug" element={<InsightDetail />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/cookies" element={<Cookies />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Footer />
                    <DeferredFloatingWidgets />
                    <BackToTop />
                    <DeferredPopupManager />
                    <CookieConsent />
                  </>
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;