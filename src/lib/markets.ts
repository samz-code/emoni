// src/lib/markets.ts
// Reads market landing pages from Supabase. Until the table has rows, the static list in
// seoMarkets.ts is used, so the public pages never break and never show a blank screen.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MARKETS, type Market } from "@/lib/seoMarkets";

export type MarketRow = Market & {
  id?: string;
  published: boolean;
  sortOrder: number;
  updatedAt?: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const fromRow = (r: any): MarketRow => ({
  id: r.id,
  slug: r.slug,
  country: r.country,
  flags: r.flags ?? [],
  title: r.title,
  description: r.description ?? "",
  h1: r.h1,
  intro: r.intro ?? "",
  primaryKeyword: r.primary_keyword ?? "",
  secondaryKeywords: r.secondary_keywords ?? [],
  currency: r.currency ?? "USD",
  challengesHeading: r.challenges_heading ?? "",
  challenges: r.challenges ?? [],
  whyWorkWithMe: r.why_work_with_me ?? [],
  deliverables: r.deliverables ?? [],
  workingModel: r.working_model ?? { heading: "", text: "" },
  costOfWaiting: r.cost_of_waiting ?? "",
  faqs: r.faqs ?? [],
  popularServices: r.popular_services ?? [],
  whatsappMessage: r.whatsapp_message ?? "",
  published: r.published ?? true,
  sortOrder: r.sort_order ?? 0,
  updatedAt: r.updated_at,
});

const clean = (list: string[]) => list.map((s) => s.trim()).filter(Boolean);
const cleanPairs = <T extends Record<string, string>>(list: T[], key: keyof T) =>
  list.filter((x) => String(x[key] ?? "").trim());

export const toRow = (m: MarketRow) => ({
  slug: m.slug.trim(),
  country: m.country.trim(),
  flags: clean(m.flags).map((f) => f.toLowerCase()),
  title: m.title.trim(),
  description: m.description.trim(),
  h1: m.h1.trim(),
  intro: m.intro.trim(),
  primary_keyword: m.primaryKeyword.trim(),
  secondary_keywords: clean(m.secondaryKeywords),
  currency: m.currency.trim() || "USD",
  challenges_heading: m.challengesHeading.trim(),
  challenges: cleanPairs(m.challenges, "heading"),
  why_work_with_me: cleanPairs(m.whyWorkWithMe, "heading"),
  deliverables: cleanPairs(m.deliverables, "heading"),
  working_model: m.workingModel,
  cost_of_waiting: m.costOfWaiting.trim(),
  faqs: cleanPairs(m.faqs, "q"),
  popular_services: clean(m.popularServices),
  whatsapp_message: m.whatsappMessage.trim(),
  published: m.published,
  sort_order: m.sortOrder,
});

const staticRows = (): MarketRow[] => MARKETS.map((m, i) => ({ ...m, published: true, sortOrder: i }));

/** Published markets from the database. */
export function useMarkets() {
  return useQuery({
    queryKey: ["markets"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("markets")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(fromRow);
    },
  });
}

/** Database markets when there are any, otherwise the static defaults. */
export function useMarketList(): MarketRow[] {
  const q = useMarkets();
  return q.data && q.data.length > 0 ? q.data : staticRows();
}

export function useMarket(slug?: string): { market?: MarketRow; loading: boolean } {
  const q = useMarkets();
  const fallback = staticRows().find((m) => m.slug === slug);

  // While loading, show the static version if one exists so the page paints instantly.
  if (q.isPending) return { market: fallback, loading: !fallback };

  const list = q.data && q.data.length > 0 ? q.data : staticRows();
  return { market: list.find((m) => m.slug === slug), loading: false };
}