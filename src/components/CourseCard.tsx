import React from "react";
import {
  Palette,
  Brush,
  Film,
  Clapperboard,
  Sparkles,
  Target,
  Camera,
  Code2,
  CreditCard,
  Lightbulb,
  Layout,
  Zap,
  TrendingUp,
  Shield,
  GraduationCap,
} from "lucide-react";

export interface Course {
  id?: string;
  name: string;
  category: string;
  description: string;
  audience?: string;
  duration?: string;
  price?: string | number;
  status?: "enrolling" | "waitlist" | "update" | string;
  icon?: string;
  whatYouGet?: {
    highlights?: string[];
    [key: string]: any;
  } | string[] | any;
  [key: string]: any;
}

const WHATSAPP_NUMBER = "254727492545";

const iconMap: { [key: string]: any } = {
  Palette,
  Brush,
  Film,
  Clapperboard,
  Sparkles,
  Target,
  Camera,
  Code2,
  CreditCard,
  Lightbulb,
  Layout,
  Zap,
  TrendingUp,
  Shield,
};

const CourseCard = ({ course }: { course: Course }) => {
  // Normalize status and supply fallback
  const currentStatus = (course?.status as "enrolling" | "waitlist" | "update") || "enrolling";

  const ctaStyles: Record<string, string> = {
    enrolling: "bg-ember text-snow",
    waitlist: "border border-forest text-forest",
    update: "border border-olive text-forest bg-olive/10",
  };

  const ctaText: Record<string, string> = {
    enrolling: "Enroll Now",
    waitlist: "Join Waitlist",
    update: "Get Update",
  };

  const messages: Record<string, string> = {
    enrolling: `Hello Samuel, I'd like to enroll in the "${course?.name || "Course"}" course. Could you share the next steps and fees?`,
    waitlist: `Hello Samuel, please add me to the waitlist for "${course?.name || "Course"}".`,
    update: `Hello Samuel, please notify me when "${course?.name || "Course"}" is available.`,
  };

  // Extract highlights array safely regardless of JSON structure
  const highlights: string[] = Array.isArray(course?.whatYouGet)
    ? course.whatYouGet
    : Array.isArray(course?.whatYouGet?.highlights)
    ? course.whatYouGet.highlights
    : [];

  const IconComponent = iconMap[course?.icon || ""] || GraduationCap;
  const activeCtaStyle = ctaStyles[currentStatus] || ctaStyles.enrolling;
  const activeCtaText = ctaText[currentStatus] || "Enquire Now";
  const activeMessage = messages[currentStatus] || messages.enrolling;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(activeMessage)}`;

  return (
    <div className="rounded-[4px] overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-forest p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-block border border-cream/40 text-cream text-xs rounded-[4px] px-2 py-1 font-body">
            {course?.category || "General"}
          </span>
          <IconComponent size={32} className="text-cream" />
        </div>
        <h3 className="font-display text-[22px] text-cream leading-snug">{course?.name}</h3>
      </div>

      {/* Body */}
      <div className="bg-snow border border-border border-t-0 rounded-b-[4px] p-6 flex flex-col flex-1">
        <p className="font-body text-sm text-[#4A4A4A] leading-relaxed">{course?.description}</p>
        
        {course?.audience && (
          <p className="font-body text-[12px] text-olive mt-3">For: {course.audience}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          {course?.duration && (
            <span className="inline-block border border-border text-ink text-xs rounded-[4px] px-2 py-1 font-body self-start">
              {course.duration}
            </span>
          )}
          {course?.price !== undefined && (
            <span className="text-2xl font-display text-ember font-bold">${course.price}</span>
          )}
        </div>

        {/* What You Get Section */}
        {highlights.length > 0 && (
          <div className="mt-4">
            <h4 className="font-body text-sm font-medium text-ink">What You Get:</h4>
            <ul className="list-disc list-inside text-sm text-[#4A4A4A] mt-2 space-y-1">
              {highlights.map((highlight, idx) => (
                <li key={idx}>{highlight}</li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-5 block"
        >
          <span
            className={`w-full inline-flex items-center justify-center gap-2 rounded-[4px] py-3 text-sm font-body font-medium transition-opacity hover:opacity-90 ${activeCtaStyle}`}
          >
            {activeCtaText} on WhatsApp
          </span>
        </a>
      </div>
    </div>
  );
};

export default CourseCard;