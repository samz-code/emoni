import { useState } from "react";
import { motion } from "framer-motion";
import CourseCard from "@/components/CourseCard";
import { courses } from "@/data/courses";

const categories = ["All", "Graphic Design", "Video Editing", "Web Dev", "Marketing"];

const Courses = () => {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? courses : courses.filter((c) => c.category === active);

  return (
    <main className="bg-paper py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {filtered.map((course, i) => (
            <motion.div
              key={course.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Courses;
