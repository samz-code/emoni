import { QueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/* ═══════════════════════════════════════════════════════════
   TYPES  (shared by the homepage and the admin panel)
═══════════════════════════════════════════════════════════ */
export type HeroContent = {
  id?: string;
  badge: string;
  heading: string;
  subheading: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
};

export type CarouselImage = {
  id?: string;
  url: string;
  alt_text?: string | null;
  sort_order: number;
};

export type HeroPair = {
  id?: string;
  problem: string;
  solution: string;
  sort_order: number;
  published: boolean;
};

export type ProcessStep = {
  id?: string;
  step_number: string;
  title: string;
  description: string;
  sort_order: number;
  published: boolean;
};

export type Sector = {
  id?: string;
  icon: string;
  label: string;
  sort_order: number;
  published: boolean;
};

export type Reason = {
  id?: string;
  t: string;
  d: string;
  sort_order: number;
  published: boolean;
};

export type Partner = {
  id?: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  category: string | null;
  show_on_home: boolean;
  published: boolean;
  sort_order: number;
};

export type ServicePreview = {
  id?: string | number;
  icon?: string;
  title?: string;
  name?: string;
  description?: string;
  problem?: string;
  summary?: string;
};

export type InsightPreview = {
  id?: string | number;
  slug?: string;
  title: string;
  excerpt?: string;
  description?: string;
  summary?: string;
  category?: string;
  read_time?: string;
  created_at?: string;
};

/** Every plain-text column of `site_settings` that the admin can edit. */
export const SETTINGS_TEXT_FIELDS = [
  "availability_text",
  "profile_title",
  "profile_subtitle",
  "profile_footer_note",
  "profile_image_url",
  "profile_cta_text",
  "profile_cta_link",
  "banner_text",
  "banner_cta_text",
  "banner_cta_link",
  "trusted_eyebrow",
  "trusted_heading",
  "services_eyebrow",
  "services_heading",
  "services_subheading",
  "process_eyebrow",
  "process_heading",
  "process_description1",
  "process_description2",
  "process_cta_text",
  "sectors_eyebrow",
  "sectors_heading",
  "sectors_subheading",
  "reasons_eyebrow",
  "reasons_heading",
  "reasons_subheading",
  "insights_eyebrow",
  "insights_heading",
  "insights_subheading",
  "cta_heading",
  "cta_subtext",
  "cta_button_text",
  "cta_button_link",
] as const;

export type SettingsTextKey = (typeof SETTINGS_TEXT_FIELDS)[number];

export type SiteSettings = {
  id?: string;
  focus_areas: string[];
} & Record<SettingsTextKey, string>;

/* ═══════════════════════════════════════════════════════════
   DEFAULTS
   Used ONLY to pre-fill empty admin forms. The public site never
   falls back to these: it renders exactly what is in the database.
═══════════════════════════════════════════════════════════ */
export const DEFAULT_HERO: Omit<HeroContent, "id"> = {
  badge: "Consulting · Public & Private Sector",
  heading: "Engineering reliable solutions for digital platforms",
  subheading:
    "I solve business problems through smart design, technology, and creative thinking. Software engineer and creative designer building reliable digital systems for businesses, NGOs, and government institutions across East Africa.",
  primary_cta_text: "Explore My Services",
  primary_cta_link: "/what-i-do",
  secondary_cta_text: "View My Work →",
  secondary_cta_link: "/projects",
};

export const DEFAULT_SETTINGS: Omit<SiteSettings, "id"> = {
  focus_areas: ["GovTech", "Systems", "Automation", "Design", "Integrations"],
  availability_text: "Available for projects",
  profile_title: "Samuel A. Emoni",
  profile_subtitle: "Solutions Architect · Digital Systems",
  profile_footer_note: "Documentation-first · No lock-in · East Africa",
  profile_image_url: "/images/profile-image.jpg",
  profile_cta_text: "Start a Project →",
  profile_cta_link: "/contact",
  banner_text: "Built for institutions that cannot afford systems that fail quietly.",
  banner_cta_text: "Talk through a problem",
  banner_cta_link: "/contact",
  trusted_eyebrow: "Trusted By",
  trusted_heading: "Institutions & brands that have shipped with me",
  services_eyebrow: "What I Do",
  services_heading: "Core Disciplines",
  services_subheading:
    "From digital strategy to deployment, every engagement is structured around a clear problem and a measurable outcome.",
  process_eyebrow: "The Approach",
  process_heading: "Diagnose first. Build second.",
  process_description1:
    "The biggest reason digital projects fail is that they start with a solution instead of a problem. Every engagement begins with a structured diagnosis — your systems, your constraints, your real goals.",
  process_description2:
    "Only then do we design. You see the full plan, signed off, before a single line of code is written.",
  process_cta_text: "See the full process",
  sectors_eyebrow: "Sectors",
  sectors_heading: "Where I do my best work",
  sectors_subheading: "Six years of work across public and private institutions in East Africa.",
  reasons_eyebrow: "Why Work With Me",
  reasons_heading: "One person, full service.",
  reasons_subheading:
    "I understand both business needs and technical solutions. After 6 years, I can build systems that actually solve your real problems.",
  insights_eyebrow: "Insights",
  insights_heading: "Field notes from the work",
  insights_subheading:
    "Practical perspectives on building digital systems in Africa — written for the people who actually have to ship them.",
  cta_heading: "Have a system to build, fix, or rescue?",
  cta_subtext:
    "Tell me about the problem. I will tell you honestly whether I am the right person to solve it — and what it will take.",
  cta_button_text: "Start a Project →",
  cta_button_link: "/contact",
};

/* ═══════════════════════════════════════════════════════════
   SMALL HELPERS
═══════════════════════════════════════════════════════════ */
export function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return [];
    if (raw.startsWith("[")) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
      } catch {
        /* fall through to comma split */
      }
    }
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/** Fill null/undefined keys of `row` from `defaults` (empty strings are kept). */
export function mergeDefaults<T extends Record<string, any>>(
  defaults: T,
  row: Record<string, any> | null | undefined
): T & { id?: string } {
  const out: Record<string, any> = { ...defaults };
  if (row) {
    for (const key of Object.keys(defaults)) {
      const value = row[key];
      if (value !== null && value !== undefined) out[key] = value;
    }
    if (row.id) out.id = row.id;
  }
  return out as T & { id?: string };
}

function normalizeSettings(row: Record<string, any>): SiteSettings {
  const out: Record<string, any> = { id: row.id, focus_areas: toStringArray(row.focus_areas) };
  for (const key of SETTINGS_TEXT_FIELDS) {
    out[key] = typeof row[key] === "string" ? row[key] : "";
  }
  return out as SiteSettings;
}

/* ═══════════════════════════════════════════════════════════
   LOCAL CACHE  (stale-while-revalidate → instant repeat visits)
═══════════════════════════════════════════════════════════ */
const CACHE_PREFIX = "emoni-home-v1:";
const STALE_MS = 60_000;

type CacheEntry<T> = { at: number; data: T };

function readCache<T>(key: string): CacheEntry<T> | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.at === "number" && "data" in parsed) return parsed as CacheEntry<T>;
  } catch {
    /* storage blocked or corrupt → ignore */
  }
  return undefined;
}

function writeCache<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* quota exceeded or storage blocked → ignore */
  }
}

export function clearHomeCache() {
  if (typeof window === "undefined") return;
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

/** Call after any admin save so the homepage refetches immediately. */
export function invalidateHomeContent(queryClient: QueryClient) {
  clearHomeCache();
  return queryClient.invalidateQueries({ queryKey: ["home"] });
}

/* ═══════════════════════════════════════════════════════════
   FETCH HELPERS
═══════════════════════════════════════════════════════════ */
type ListOptions = {
  select?: string[];
  published?: boolean;
  order?: string;
  ascending?: boolean;
  limit?: number;
  /** Retry without the published filter / ordering if those columns do not exist. */
  tolerant?: boolean;
};

async function listRows<T>(table: string, opts: ListOptions = {}): Promise<T[]> {
  const selects = opts.select?.length ? opts.select : ["*"];
  const wantPublished = opts.published ?? false;
  const variants = opts.tolerant
    ? [
        { pub: wantPublished, ord: true },
        { pub: wantPublished, ord: false },
        { pub: false, ord: true },
        { pub: false, ord: false },
      ]
    : [{ pub: wantPublished, ord: true }];

  let lastError: unknown = null;
  for (const sel of selects) {
    for (const v of variants) {
      let q: any = supabase.from(table).select(sel);
      if (v.pub) q = q.eq("published", true);
      if (v.ord && opts.order) q = q.order(opts.order, { ascending: opts.ascending ?? true });
      if (opts.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (!error) return (data ?? []) as T[];
      lastError = error;
    }
  }
  throw lastError;
}

async function getSingleRow<T>(table: string): Promise<T | null> {
  const { data, error } = await supabase.from(table).select("*").limit(1).maybeSingle();
  if (error) throw error;
  return (data as T | null) ?? null;
}

function useHomeQuery<T>(key: string, fn: () => Promise<T>) {
  return useQuery<T>({
    queryKey: ["home", key],
    queryFn: async () => {
      const data = await fn();
      writeCache(key, data);
      return data;
    },
    initialData: () => readCache<T>(key)?.data,
    initialDataUpdatedAt: () => readCache<T>(key)?.at,
    staleTime: STALE_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/* ═══════════════════════════════════════════════════════════
   HOOKS — one independent query per section, so each section
   paints the moment its own data arrives.
═══════════════════════════════════════════════════════════ */
export function useHomeHero() {
  return useHomeQuery<HeroContent | null>("hero", () => getSingleRow<HeroContent>("hero_content"));
}

export function useHomeSettings() {
  return useHomeQuery<SiteSettings | null>("settings", async () => {
    const row = await getSingleRow<Record<string, any>>("site_settings");
    return row ? normalizeSettings(row) : null;
  });
}

export function useHomePairs() {
  return useHomeQuery<HeroPair[]>("pairs", () =>
    listRows<HeroPair>("hero_pairs", { published: true, order: "sort_order" })
  );
}

export function useHomeCarousel() {
  return useHomeQuery<CarouselImage[]>("carousel", () =>
    listRows<CarouselImage>("carousel_images", { select: ["id,url,alt_text,sort_order"], order: "sort_order" })
  );
}

/** scope "home" → Trusted-By strip; scope "all" → future /partners page. */
export function useHomePartners(scope: "home" | "all" = "home") {
  return useHomeQuery<Partner[]>(`partners-${scope}`, async () => {
    let q: any = supabase
      .from("partners")
      .select("id,name,logo_url,website_url,description,category,show_on_home,sort_order,published")
      .eq("published", true);
    if (scope === "home") q = q.eq("show_on_home", true);
    const { data, error } = await q.order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Partner[];
  });
}

export function useHomeServices() {
  return useHomeQuery<ServicePreview[]>("services", () =>
    listRows<ServicePreview>("services", { published: true, order: "sort_order", limit: 3, tolerant: true })
  );
}

export function useHomeProcess() {
  return useHomeQuery<ProcessStep[]>("process", () =>
    listRows<ProcessStep>("process_steps", { published: true, order: "sort_order" })
  );
}

export function useHomeSectors() {
  return useHomeQuery<Sector[]>("sectors", () =>
    listRows<Sector>("sectors", { published: true, order: "sort_order" })
  );
}

export function useHomeReasons() {
  return useHomeQuery<Reason[]>("reasons", () =>
    listRows<Reason>("reasons", { published: true, order: "sort_order" })
  );
}

export function useHomeInsights() {
  return useHomeQuery<InsightPreview[]>("insights", () =>
    listRows<InsightPreview>("insights", {
      select: ["id,slug,title,excerpt,category,read_time,created_at", "*"],
      published: true,
      order: "created_at",
      ascending: false,
      limit: 3,
      tolerant: true,
    })
  );
}