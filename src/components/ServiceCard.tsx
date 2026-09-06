import { useState } from "react";
import {
  FiZap, FiLayers, FiMonitor, FiCreditCard, FiSettings, FiLink2, FiTool,
  FiTrendingUp, FiTarget, FiCompass, FiRadio, FiBarChart2, FiLayout,
  FiSearch, FiShare2, FiEdit3,
} from "react-icons/fi";
import { IoColorPaletteOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { CheckCircle2, Users } from "lucide-react";
import type { IconType } from "react-icons";

// Types matching Supabase database structure
export interface Service {
  id: string;
  category: string;
  icon: string;
  name: string;
  problem: string;
  solution: string;
  outcome: string;
  deliverables: string[];
  ideal_for: string;
  published: boolean;
  sort_order?: number;
}

const iconMap: Record<string, IconType> = {
  Zap: FiZap,
  Layers: FiLayers,
  Monitor: FiMonitor,
  Palette: IoColorPaletteOutline,
  CreditCard: FiCreditCard,
  Workflow: FiSettings,
  Link: FiLink2,
  Wrench: FiTool,
  TrendingUp: FiTrendingUp,
  Target: FiTarget,
  Compass: FiCompass,
  Radio: FiRadio,
  BarChart2: FiBarChart2,
  Layout: FiLayout,
  Search: FiSearch,
  Share2: FiShare2,
  Edit3: FiEdit3,
};

const outcomeColors: Record<string, string> = {
  "digital-consultancy":    "#F59E0B",
  "system-design":          "#0EA5E9",
  "web-development":        "#10B981",
  "graphic-design":         "#EC4899",
  "payment-integrations":   "#8B5CF6",
  "process-automation":     "#F97316",
  "api-integration":        "#06B6D4",
  "it-support":             "#F43F5E",
  "digital-marketing":      "#EA580C",
  "marketing-plan":         "#CA8A04",
  "brand-strategy":         "#DB2777",
  "traditional-marketing":  "#78716C",
  "media-buying":           "#4F46E5",
  "web-design":             "#14B8A6",
  "seo":                    "#2563EB",
  "social-media":           "#E11D48",
  "content-creation":       "#9333EA",
};

const DEFAULT_ICON_COLOR = "#6B7280";
const WHATSAPP_NUMBER = "254727492545";

const buildWhatsAppLink = (serviceName: string) => {
  const message = `Hi Samuel, I'd like to book the ${serviceName} service.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const ServiceCard = ({ service }: { service: Service }) => {
  const Icon = iconMap[service.icon] || FiZap;
  const hoverColor = outcomeColors[service.id] || DEFAULT_ICON_COLOR;
  const [hovered, setHovered] = useState(false);

  const deliverablesList = Array.isArray(service.deliverables) ? service.deliverables : [];

  return (
    <div
      id={service.id}
      className="group bg-snow border border-border border-l-4 border-l-ember rounded-[4px] p-6 scroll-mt-24 flex flex-col h-full transition-shadow duration-300 hover:shadow-md"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon */}
      <div className="mb-3">
        <Icon
          size={26}
          style={{ color: hovered ? hoverColor : DEFAULT_ICON_COLOR, transition: "color 0.3s ease" }}
        />
      </div>

      {/* Title */}
      <h3 className="font-display text-[22px] text-ink">{service.name}</h3>

      {/* Problem */}
      <p className="font-body text-[10px] uppercase tracking-widest text-ember mt-4 mb-1 font-semibold">
        THE PROBLEM
      </p>
      <p className="font-body text-sm text-[#4A4A4A] leading-relaxed">{service.problem}</p>

      {/* Solution */}
      <p className="font-body text-[10px] uppercase tracking-widest text-olive mt-4 mb-1 font-semibold">
        HOW I SOLVE IT
      </p>
      <p className="font-body text-sm text-[#4A4A4A] leading-relaxed">{service.solution}</p>

      {/* Deliverables */}
      <p className="font-body text-[10px] uppercase tracking-widest text-[#9A9A9A] mt-5 mb-2 font-semibold">
        WHAT YOU GET
      </p>
      <ul className="space-y-1.5 flex-1">
        {deliverablesList.map((d, index) => (
          <li key={index} className="flex items-start gap-2 font-body text-sm text-ink">
            <CheckCircle2 size={14} className="text-olive flex-shrink-0 mt-1" />
            <span>{d}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-5 pt-5 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Ideal For */}
        {service.ideal_for && (
          <div className="flex items-start gap-2">
            <Users size={13} className="text-[#9A9A9A] flex-shrink-0 mt-[3px]" />
            <p className="font-body text-sm text-ink font-bold leading-snug">
              {service.ideal_for}
            </p>
          </div>
        )}

        {/* Outcome badge */}
        {service.outcome && (
          <span className="self-start sm:self-auto inline-block bg-forest text-cream text-xs rounded-[4px] px-2 py-1 font-body whitespace-nowrap flex-shrink-0">
            {service.outcome}
          </span>
        )}
      </div>

      {/* Book on WhatsApp */}
      <a
        href={buildWhatsAppLink(service.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 bg-[#25D366] text-white font-body text-sm font-bold tracking-wide py-2.5 rounded-[4px] hover:bg-[#1FB855] transition-colors"
      >
        <FaWhatsapp size={16} />
        <span>Book on WhatsApp</span>
      </a>
    </div>
  );
};

export default ServiceCard;