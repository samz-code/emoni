import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Layers, FolderKanban, ListOrdered, Users, GraduationCap, Newspaper, ArrowRight, Eye, EyeOff, FileText,
} from "lucide-react";

type CardStat = {
  label: string;
  value: number | null;
};

const useCount = (table: string, filter?: Record<string, any>) =>
  useQuery({
    queryKey: ["dashboard-count", table, filter],
    queryFn: async () => {
      let query = supabase.from(table).select("*", { count: "exact", head: true });
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    },
  });

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

function StatPill({ label, value }: CardStat) {
  return (
    <div className="flex items-center gap-2 bg-[#FBF9F5] border border-[#524646]/10 rounded-full px-3 py-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[#24B1B1]" />
      <span className="text-xs font-medium text-[#524646]/70">{label}</span>
      <span className="text-xs font-bold text-[#007979]">
        {value === null ? "—" : value}
      </span>
    </div>
  );
}

function ManagementCard({
  icon: Icon,
  title,
  description,
  to,
  ctaLabel,
  stats,
}: {
  icon: any;
  title: string;
  description: string;
  to: string;
  ctaLabel: string;
  stats: CardStat[];
}) {
  return (
    <Link
      to={to}
      className="group relative bg-white rounded-2xl border border-[#524646]/10 shadow-sm hover:shadow-lg hover:border-[#007979]/20 transition-all duration-300 p-6 sm:p-7 flex flex-col"
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-[#007979]/10 flex items-center justify-center group-hover:bg-[#007979] transition-colors duration-300">
          <Icon className="w-5 h-5 text-[#007979] group-hover:text-[#FFE2AF] transition-colors duration-300" />
        </div>
        <ArrowRight className="w-4 h-4 text-[#524646]/30 group-hover:text-[#EC5B38] group-hover:translate-x-1 transition-all duration-300" />
      </div>

      <h2 className="font-display text-lg sm:text-xl font-bold text-[#2A2424] mt-5">
        {title}
      </h2>
      <p className="text-sm text-[#524646]/70 mt-1.5 leading-relaxed flex-1">
        {description}
      </p>

      <div className="flex flex-wrap gap-2 mt-5">
        {stats.map((s) => (
          <StatPill key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <span className="inline-flex items-center gap-1.5 text-sm font-display font-bold text-[#007979] group-hover:text-[#EC5B38] transition-colors mt-6">
        {ctaLabel}
        <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </Link>
  );
}

export default function AdminDashboard() {
  const { data: totalServices } = useCount("services");
  const { data: publishedServices } = useCount("services", { published: true });
  const { data: totalCourses } = useCount("courses");
  const { data: publishedCourses } = useCount("courses", { published: true });
  const { data: processStepsCount } = useCount("process_steps");
  const { data: idealForCount } = useCount("ideal_for_items");
  const { data: projectsCount } = useCount("projects");
  const { data: totalInsights } = useCount("insights");
  const { data: publishedInsights } = useCount("insights", { published: true });
  const { data: siteContentCount } = useCount("site_content");

  const draftServices =
    totalServices !== undefined && publishedServices !== undefined
      ? totalServices - publishedServices
      : null;

  const draftCourses =
    totalCourses !== undefined && publishedCourses !== undefined
      ? totalCourses - publishedCourses
      : null;

  const draftInsights =
    totalInsights !== undefined && publishedInsights !== undefined
      ? totalInsights - publishedInsights
      : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <p className="font-display text-xs tracking-widest uppercase text-[#EC5B38] mb-2">
          {today}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2A2424]">
          CMS Control Center
        </h1>
        <p className="text-sm text-[#524646]/60 mt-2 max-w-xl">
          Everything published on the public site is managed from here. Changes go live immediately.
        </p>
      </div>

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6">
        <ManagementCard
          icon={FileText}
          title="Site Content"
          description="Manage the hero, section headings, and CTA copy shown across the homepage."
          to="/admin/content"
          ctaLabel="Manage Content"
          stats={[{ label: "Sections", value: siteContentCount ?? null }]}
        />

        <ManagementCard
          icon={Layers}
          title="Agency Services"
          description="Manage offerings, capabilities, and deliverables shown in the What I Do section."
          to="/admin/services"
          ctaLabel="Manage Services"
          stats={[
            { label: "Published", value: publishedServices ?? null },
            { label: "Draft", value: draftServices },
          ]}
        />

        <ManagementCard
          icon={GraduationCap}
          title="Courses"
          description="Manage every course shown on the public Courses page, including pricing and status."
          to="/admin/courses"
          ctaLabel="Manage Courses"
          stats={[
            { label: "Published", value: publishedCourses ?? null },
            { label: "Draft", value: draftCourses },
          ]}
        />

        <ManagementCard
          icon={Newspaper}
          title="Insights"
          description="Manage articles shown on the public Insights page, including cover images and tags."
          to="/admin/insights"
          ctaLabel="Manage Insights"
          stats={[
            { label: "Published", value: publishedInsights ?? null },
            { label: "Draft", value: draftInsights },
          ]}
        />

        <ManagementCard
          icon={ListOrdered}
          title="How I Work"
          description="Manage the step-by-step process shown to visitors, from discovery to delivery."
          to="/admin/process-steps"
          ctaLabel="Manage Process Steps"
          stats={[{ label: "Steps", value: processStepsCount ?? null }]}
        />

        <ManagementCard
          icon={Users}
          title="Ideal For"
          description="Manage the tags shown in the Who I Work With Best section."
          to="/admin/ideal-for"
          ctaLabel="Manage Ideal For Tags"
          stats={[{ label: "Tags", value: idealForCount ?? null }]}
        />

        <ManagementCard
          icon={FolderKanban}
          title="Case Studies & Projects"
          description="Upload client work, case studies, and brand visual assets for the portfolio."
          to="/admin/projects"
          ctaLabel="Manage Projects"
          stats={[{ label: "Total", value: projectsCount ?? null }]}
        />
      </div>

      {/* Quick status strip */}
      <div className="mt-8 bg-white rounded-2xl border border-[#524646]/10 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-[#524646]/70">
          <Eye className="w-4 h-4 text-green-600" />
          <span>
            <strong className="text-[#2A2424]">{publishedServices ?? "—"}</strong> services live on site
          </span>
        </div>
        {draftServices !== null && draftServices > 0 && (
          <div className="flex items-center gap-2 text-sm text-[#524646]/70">
            <EyeOff className="w-4 h-4 text-amber-600" />
            <span>
              <strong className="text-[#2A2424]">{draftServices}</strong> service{draftServices === 1 ? "" : "s"} in draft
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-[#524646]/70">
          <Eye className="w-4 h-4 text-green-600" />
          <span>
            <strong className="text-[#2A2424]">{publishedCourses ?? "—"}</strong> courses live on site
          </span>
        </div>
        {draftCourses !== null && draftCourses > 0 && (
          <div className="flex items-center gap-2 text-sm text-[#524646]/70">
            <EyeOff className="w-4 h-4 text-amber-600" />
            <span>
              <strong className="text-[#2A2424]">{draftCourses}</strong> course{draftCourses === 1 ? "" : "s"} in draft
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-[#524646]/70">
          <Eye className="w-4 h-4 text-green-600" />
          <span>
            <strong className="text-[#2A2424]">{publishedInsights ?? "—"}</strong> insights live on site
          </span>
        </div>
        {draftInsights !== null && draftInsights > 0 && (
          <div className="flex items-center gap-2 text-sm text-[#524646]/70">
            <EyeOff className="w-4 h-4 text-amber-600" />
            <span>
              <strong className="text-[#2A2424]">{draftInsights}</strong> insight{draftInsights === 1 ? "" : "s"} in draft
            </span>
          </div>
        )}
      </div>
    </div>
  );
}