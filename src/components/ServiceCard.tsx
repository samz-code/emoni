import { useState } from "react";
import {
  FiZap, FiLayers, FiMonitor, FiCreditCard, FiSettings, FiLink2, FiTool,
} from "react-icons/fi";
import { IoColorPaletteOutline } from "react-icons/io5";
import { CheckCircle2, Users } from "lucide-react";
import type { Service } from "@/data/services";
import type { IconType } from "react-icons";

const iconMap: Record<Service["icon"], IconType> = {
  Zap: FiZap,
  Layers: FiLayers,
  Monitor: FiMonitor,
  Palette: IoColorPaletteOutline,
  CreditCard: FiCreditCard,
  Workflow: FiSettings,
  Link: FiLink2,
  Wrench: FiTool,
};

const outcomeColors: Record<string, string> = {
  "digital-consultancy":  "#F59E0B",
  "system-design":        "#0EA5E9",
  "web-development":      "#10B981",
  "graphic-design":       "#EC4899",
  "payment-integrations": "#8B5CF6",
  "process-automation":   "#F97316",
  "api-integration":      "#06B6D4",
  "it-support":           "#F43F5E",
};

const DEFAULT_ICON_COLOR = "#6B7280";

const ServiceCard = ({ service }: { service: Service }) => {
  const Icon = iconMap[service.icon] || FiZap;
  const hoverColor = outcomeColors[service.id] || DEFAULT_ICON_COLOR;
  const [hovered, setHovered] = useState(false);

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
        {service.deliverables.map((d) => (
          <li key={d} className="flex items-start gap-2 font-body text-sm text-ink">
            <CheckCircle2 size={14} className="text-olive flex-shrink-0 mt-1" />
            <span>{d}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-5 pt-5 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Ideal For */}
        <div className="flex items-start gap-2">
          <Users size={13} className="text-[#9A9A9A] flex-shrink-0 mt-[3px]" />
          <p className="font-body text-sm text-ink font-bold leading-snug">
            {service.idealFor}
          </p>
        </div>

        {/* Outcome badge */}
        {service.outcome && (
          <span className="self-start sm:self-auto inline-block bg-forest text-cream text-xs rounded-[4px] px-2 py-1 font-body whitespace-nowrap flex-shrink-0">
            {service.outcome}
          </span>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;