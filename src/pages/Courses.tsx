import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import CourseCard from "@/components/CourseCard";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";

export interface Course {
  id: string;
  name: string;
  category: string;
  description: string;
  price?: string | number;
  level?: string;
  duration?: string;
  published?: boolean;
  sort_order?: number;
  [key: string]: any;
}

const categories = ["All", "Graphic Design", "Video Editing", "Web Dev", "Marketing"];

const Courses = () => {
  const [active, setActive] = useState("All");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("courses")
          .select("*")
          .eq("published", true)
          .order("sort_order", { ascending: true });

        if (fetchError) throw fetchError;
        setCourses(data || []);
      } catch (err: any) {
        console.error("Error loading courses:", err);
        setError(err.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filtered =
    active === "All"
      ? courses
      : courses.filter((c) => c.category?.toLowerCase() === active.toLowerCase());

  const canonicalUrl = "https://www.emonisamuel.co.ke/courses";
  const pageTitle = "Practical Tech & Design Courses | Samuel A. Emoni";
  const pageDescription = "Explore practical courses in Web Development, Graphic Design, Video Editing, and Digital Marketing built from real-world client experience.";

  // Dynamic Course Schema JSON-LD
  const coursesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Courses by Samuel A. Emoni",
    "description": pageDescription,
    "itemListElement": courses.map((course, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Course",
        "name": course.name,
        "description": course.description,
        "provider": {
          "@type": "Person",
          "name": "Samuel A. Emoni",
          "url": "https://www.emonisamuel.co.ke"
        }
      }
    }))
  };

  return (
    <>
      <Helmet>
        {/* Core Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://www.emonisamuel.co.ke/og-image.jpg" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://www.emonisamuel.co.ke/og-image.jpg" />

        {/* Structured Data / Schema */}
        <script type="application/ld+json">
          {JSON.stringify(coursesSchema)}
        </script>
      </Helmet>

      <main className="bg-paper py-24 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-[42px] text-ink">Learn From the Field</h1>
            <p className="font-body text-lg text-[#4A4A4A] max-w-2xl mt-3">
              Practical courses built from 6+ years of real client work — not theory.
            </p>
          </motion.div>

          {/* Filter tabs */}
          <div className="flex gap-6 mt-10 border-b border-border overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`pb-3 font-body text-sm whitespace-nowrap transition-colors ${
                  active === cat
                    ? "text-ink border-b-2 border-ember font-medium"
                    : "text-[#9A9A9A] hover:text-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20 gap-2 text-ink/70 font-body">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Fetching courses...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-8 flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg font-body text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Failed to load courses from database: {error}</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filtered.length === 0 && (
            <div className="py-20 text-center font-body text-[#9A9A9A]">
              No courses available for this category yet.
            </div>
          )}

          {/* Courses Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {filtered.map((course, i) => (
                <motion.div
                  key={course.id || course.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Courses;