import React from "react";
import {
  Star,
  MessageCircle,
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
} from "lucide-react";
import type { Course } from "@/data/courses";

const WHATSAPP_NUMBER = "254727492545";

// Map icon names to components
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
  const ctaStyles = {
    enrolling: "bg-ember text-snow",
    waitlist: "border border-forest text-forest",
    update: "border border-olive text-forest bg-olive/10",
  };
  const ctaText = {
    enrolling: "Enroll Now",
    waitlist: "Join Waitlist",
    update: "Get Update",
  };

  const messages = {
    enrolling: `Hello Samuel, I'd like to enroll in the "${course.name}" course. Could you share the next steps and fees?`,
    waitlist: `Hello Samuel, please add me to the waitlist for "${course.name}".`,
    update: `Hello Samuel, please notify me when "${course.name}" is available.`,
  };

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messages[course.status])}`;

  return (
    <div className="rounded-[4px] overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-forest p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-block border border-cream/40 text-cream text-xs rounded-[4px] px-2 py-1 font-body">
            {course.category}
          </span>
          {iconMap[course.icon] && React.createElement(iconMap[course.icon], {
            size: 32,
            className: "text-cream",
          })}
        </div>
        <h3 className="font-display text-[22px] text-cream leading-snug">{course.name}</h3>
      </div>
      {/* Body */}
      <div className="bg-snow border border-border border-t-0 rounded-b-[4px] p-6 flex flex-col flex-1">
        <p className="font-body text-sm text-[#4A4A4A] leading-relaxed">{course.description}</p>
        <p className="font-body text-[12px] text-olive mt-3">For: {course.audience}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="inline-block border border-border text-ink text-xs rounded-[4px] px-2 py-1 font-body self-start">
            {course.duration}
          </span>
          <span className="text-2xl font-display text-ember font-bold">${course.price}</span>
        </div>

        {/* What You Get */}
        <div className="mt-4">
          <h4 className="font-body text-sm font-medium text-ink">What You Get:</h4>
          <ul className="list-disc list-inside text-sm text-[#4A4A4A] mt-2 space-y-1">
            {course.whatYouGet.highlights.map((highlight, idx) => (
              <li key={idx}>{highlight}</li>
            ))}
          </ul>
         
        </div>

        {/* CTA */}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-auto pt-5 block`}
        >
          <span
            className={`w-full inline-flex items-center justify-center gap-2 rounded-[4px] py-3 text-sm font-body font-medium transition-opacity hover:opacity-90 ${ctaStyles[course.status]}`}
          >
            <MessageCircle size={16} />
            {ctaText[course.status]} on WhatsApp
          </span>
        </a>
      </div>
    </div>
  );
};

export default CourseCard;
