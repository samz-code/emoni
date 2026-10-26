import {
  Palette, Brush, Film, Clapperboard, Sparkles, Target, Camera, Code2,
  CreditCard, Lightbulb, Layout, Zap, TrendingUp, Shield, Layers, Monitor,
  Workflow, Link as LinkIcon, Wrench, Compass, Radio, BarChart2, Search,
  Share2, Edit3, type LucideIcon,
} from "lucide-react";

/** Every icon name offered in ManageCourses and ManageServices. */
const ICONS: Record<string, LucideIcon> = {
  Palette, Brush, Film, Clapperboard, Sparkles, Target, Camera, Code2,
  CreditCard, Lightbulb, Layout, Zap, TrendingUp, Shield, Layers, Monitor,
  Workflow, Link: LinkIcon, Wrench, Compass, Radio, BarChart2, Search,
  Share2, Edit3,
};

export const resolveIcon = (name?: string | null): LucideIcon =>
  (name && ICONS[name]) || Zap;

/** Safely turns a jsonb / text[] column into a clean string list. */
export const asList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

/** Trims whitespace and cuts at a word boundary for meta descriptions. */
export const truncate = (text: string | null | undefined, max = 155): string => {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
};

export const toNumber = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** "$249", or null when the price is 0 / not set. */
export const formatUsd = (value: unknown): string | null => {
  const n = toNumber(value);
  return n > 0 ? `$${n.toLocaleString("en-US")}` : null;
};