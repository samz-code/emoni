import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Industry {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  hero_headline: string;
  description: string;
  overview: string;
  hero_image_url: string;
  challenges: string[];
  solutions: string[];
  outcomes: string[];
  use_cases: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  service_slugs: string[];
  seo_title: string;
  seo_description: string;
  cta_label: string;
  cta_link: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface IndustryService {
  id: string;
  name: string;
  starting_from: string | null;
  short_description: string | null;
}

export function slugifyIndustryName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function useIndustries() {
  return useQuery({
    queryKey: ["industries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industries")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Industry[];
    },
    staleTime: 60_000,
  });
}

export function useIndustry(slug: string | undefined) {
  return useQuery({
    queryKey: ["industry", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industries")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return (data as Industry | null) ?? null;
    },
    staleTime: 60_000,
  });
}

export function useIndustryServices(serviceSlugs: string[] | undefined) {
  return useQuery({
    queryKey: ["industry-services", serviceSlugs],
    enabled: Boolean(serviceSlugs?.length),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id,name,starting_from,short_description")
        .in("id", serviceSlugs ?? [])
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as IndustryService[];
    },
    staleTime: 60_000,
  });
}
