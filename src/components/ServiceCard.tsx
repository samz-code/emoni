import { Lightbulb, Layers, Monitor, Palette, CreditCard, Workflow, Plug, Wrench, Clock, Users, Wrench as ToolIcon, CheckCircle2, type LucideIcon } from "lucide-react";
import type { Service } from "@/data/services";

const iconMap: Record<string, LucideIcon> = {
  Lightbulb, Layers, Monitor, Palette, CreditCard, Workflow, Plug, Wrench,
};

const ServiceCard = ({ service }: { service: Service }) => {
  const Icon = iconMap[service.icon] || Lightbulb;

  return (
    <div id={service.id} className="bg-snow border border-border border-l-4 border-l-ember rounded-[4px] p-6 scroll-mt-24">
      <div className="flex items-start justify-between gap-4">
        <Icon size={24} className="text-olive" />
        {service.startingFrom && (
          <span className="font-body text-[11px] uppercase tracking-widest text-[#9A9A9A]">
            From <span className="text-ink font-medium normal-case tracking-normal">{service.startingFrom}</span>
          </span>
        )}
      </div>

      <h3 className="font-display text-[22px] text-ink mt-3">{service.name}</h3>

      <p className="font-body text-[10px] uppercase tracking-widest text-ember mt-4 mb-1 font-semibold">THE PROBLEM</p>
      <p className="font-body text-sm text-[#4A4A4A] leading-relaxed">{service.problem}</p>

      <p className="font-body text-[10px] uppercase tracking-widest text-olive mt-4 mb-1 font-semibold">HOW I SOLVE IT</p>
      <p className="font-body text-sm text-[#4A4A4A] leading-relaxed">{service.solution}</p>

      <p className="font-body text-[10px] uppercase tracking-widest text-[#9A9A9A] mt-5 mb-2 font-semibold">WHAT YOU GET</p>
      <ul className="space-y-1.5">
        {service.deliverables.map((d) => (
          <li key={d} className="flex items-start gap-2 font-body text-sm text-ink">
            <CheckCircle2 size={14} className="text-olive flex-shrink-0 mt-1" />
            <span>{d}</span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-border">
        <div>
          <p className="font-body text-[10px] uppercase tracking-widest text-[#9A9A9A] mb-1 flex items-center gap-1 font-semibold">
            <Clock size={11} /> Timeline
          </p>
          <p className="font-body text-sm text-ink">{service.timeline}</p>
        </div>
        <div>
          <p className="font-body text-[10px] uppercase tracking-widest text-[#9A9A9A] mb-1 flex items-center gap-1 font-semibold">
            <Users size={11} /> Ideal For
          </p>
          <p className="font-body text-sm text-ink leading-snug">{service.idealFor}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="font-body text-[10px] uppercase tracking-widest text-[#9A9A9A] mb-2 flex items-center gap-1 font-semibold">
          <ToolIcon size={11} /> Tools & Stack
        </p>
        <div className="flex flex-wrap gap-1.5">
          {service.tools.map((t) => (
            <span key={t} className="border border-border text-ink text-xs rounded-[4px] px-2 py-0.5 font-body">
              {t}
            </span>
          ))}
        </div>
      </div>

      {service.outcome && (
        <span className="inline-block bg-forest text-cream text-xs rounded-[4px] px-2 py-1 mt-5 font-body">
          {service.outcome}
        </span>
      )}
    </div>
  );
};

export default ServiceCard;
