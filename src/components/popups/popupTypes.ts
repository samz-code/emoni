export type Placement = "banner" | "modal";
export type DisplayMode = "text" | "image" | "image_text";
export type Variant =
  | "amber"
  | "sky"
  | "emerald"
  | "rose"
  | "indigo"
  | "orange"
  | "teal"
  | "violet"
  | "cyan"
  | "lime"
  | "pink"
  | "slate";
export type Audience = "guests" | "customers" | "everyone";
export type Frequency = "always" | "session" | "daily" | "once";

export interface Popup {
  id: string;
  name: string;
  activity_tag: string | null;
  placement: Placement;
  display_mode: DisplayMode;
  variant: Variant;
  title: string | null;
  body: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  secondary_label: string | null;
  secondary_href: string | null;
  audience: Audience;
  page_scope: string;
  frequency: Frequency;
  priority: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PopupDraft = Omit<Popup, "id" | "created_at" | "updated_at">;

export const FLYER_WIDTH = 1200;
export const FLYER_HEIGHT = 675;

export interface VariantStyle {
  alert: string;
  icon: string;
  badge: string;
  primary: string;
  secondary: string;
  strip: string;
  swatch: string;
}

export const VARIANT_STYLES: Record<Variant, VariantStyle> = {
  amber: {
    alert: "border-amber-400 bg-amber-50 text-amber-900",
    icon: "text-amber-600",
    badge: "bg-amber-200 text-amber-900",
    primary: "bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-600",
    secondary: "border border-amber-600 text-amber-900 hover:bg-amber-100 focus-visible:ring-amber-600",
    strip: "bg-amber-500 text-white",
    swatch: "bg-amber-500",
  },
  sky: {
    alert: "border-sky-400 bg-sky-50 text-sky-900",
    icon: "text-sky-600",
    badge: "bg-sky-200 text-sky-900",
    primary: "bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-600",
    secondary: "border border-sky-600 text-sky-900 hover:bg-sky-100 focus-visible:ring-sky-600",
    strip: "bg-sky-500 text-white",
    swatch: "bg-sky-500",
  },
  emerald: {
    alert: "border-emerald-400 bg-emerald-50 text-emerald-900",
    icon: "text-emerald-600",
    badge: "bg-emerald-200 text-emerald-900",
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600",
    secondary: "border border-emerald-600 text-emerald-900 hover:bg-emerald-100 focus-visible:ring-emerald-600",
    strip: "bg-emerald-500 text-white",
    swatch: "bg-emerald-500",
  },
  rose: {
    alert: "border-rose-400 bg-rose-50 text-rose-900",
    icon: "text-rose-600",
    badge: "bg-rose-200 text-rose-900",
    primary: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600",
    secondary: "border border-rose-600 text-rose-900 hover:bg-rose-100 focus-visible:ring-rose-600",
    strip: "bg-rose-500 text-white",
    swatch: "bg-rose-500",
  },
  indigo: {
    alert: "border-indigo-400 bg-indigo-50 text-indigo-900",
    icon: "text-indigo-600",
    badge: "bg-indigo-200 text-indigo-900",
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-600",
    secondary: "border border-indigo-600 text-indigo-900 hover:bg-indigo-100 focus-visible:ring-indigo-600",
    strip: "bg-indigo-500 text-white",
    swatch: "bg-indigo-500",
  },
  orange: {
    alert: "border-orange-400 bg-orange-50 text-orange-900",
    icon: "text-orange-600",
    badge: "bg-orange-200 text-orange-900",
    primary: "bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-orange-600",
    secondary: "border border-orange-600 text-orange-900 hover:bg-orange-100 focus-visible:ring-orange-600",
    strip: "bg-orange-500 text-white",
    swatch: "bg-orange-500",
  },
  teal: {
    alert: "border-teal-400 bg-teal-50 text-teal-900",
    icon: "text-teal-600",
    badge: "bg-teal-200 text-teal-900",
    primary: "bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-600",
    secondary: "border border-teal-600 text-teal-900 hover:bg-teal-100 focus-visible:ring-teal-600",
    strip: "bg-teal-500 text-white",
    swatch: "bg-teal-500",
  },
  violet: {
    alert: "border-violet-400 bg-violet-50 text-violet-900",
    icon: "text-violet-600",
    badge: "bg-violet-200 text-violet-900",
    primary: "bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-600",
    secondary: "border border-violet-600 text-violet-900 hover:bg-violet-100 focus-visible:ring-violet-600",
    strip: "bg-violet-500 text-white",
    swatch: "bg-violet-500",
  },
  cyan: {
    alert: "border-cyan-400 bg-cyan-50 text-cyan-900",
    icon: "text-cyan-600",
    badge: "bg-cyan-200 text-cyan-900",
    primary: "bg-cyan-600 text-white hover:bg-cyan-700 focus-visible:ring-cyan-600",
    secondary: "border border-cyan-600 text-cyan-900 hover:bg-cyan-100 focus-visible:ring-cyan-600",
    strip: "bg-cyan-500 text-white",
    swatch: "bg-cyan-500",
  },
  lime: {
    alert: "border-lime-400 bg-lime-50 text-lime-900",
    icon: "text-lime-700",
    badge: "bg-lime-200 text-lime-900",
    primary: "bg-lime-700 text-white hover:bg-lime-800 focus-visible:ring-lime-700",
    secondary: "border border-lime-700 text-lime-900 hover:bg-lime-100 focus-visible:ring-lime-700",
    strip: "bg-lime-600 text-white",
    swatch: "bg-lime-500",
  },
  pink: {
    alert: "border-pink-400 bg-pink-50 text-pink-900",
    icon: "text-pink-600",
    badge: "bg-pink-200 text-pink-900",
    primary: "bg-pink-600 text-white hover:bg-pink-700 focus-visible:ring-pink-600",
    secondary: "border border-pink-600 text-pink-900 hover:bg-pink-100 focus-visible:ring-pink-600",
    strip: "bg-pink-500 text-white",
    swatch: "bg-pink-500",
  },
  slate: {
    alert: "border-slate-400 bg-slate-50 text-slate-900",
    icon: "text-slate-600",
    badge: "bg-slate-200 text-slate-900",
    primary: "bg-slate-700 text-white hover:bg-slate-800 focus-visible:ring-slate-700",
    secondary: "border border-slate-600 text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-600",
    strip: "bg-slate-600 text-white",
    swatch: "bg-slate-500",
  },
};

export const PLACEMENT_OPTIONS: { value: Placement; label: string }[] = [
  { value: "banner", label: "Alert banner (top of page)" },
  { value: "modal", label: "Popup (centered)" },
];

export const MODE_OPTIONS: { value: DisplayMode; label: string }[] = [
  { value: "text", label: "Text only" },
  { value: "image", label: "Flyer only" },
  { value: "image_text", label: "Flyer and text" },
];

export const AUDIENCE_OPTIONS: { value: Audience; label: string }[] = [
  { value: "guests", label: "Guests (not logged in)" },
  { value: "customers", label: "Logged in users" },
  { value: "everyone", label: "Everyone" },
];

export const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "always", label: "Every page load" },
  { value: "session", label: "Once per browser session" },
  { value: "daily", label: "Once per day" },
  { value: "once", label: "Only once" },
];
