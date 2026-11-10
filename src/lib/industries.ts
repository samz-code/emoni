import { useQuery } from "@tanstack/react-query";
import { fetchPublicRows } from "@/lib/publicRest";

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
    queryFn: () =>
      fetchPublicRows<Industry>("industries", {
        filters: { published: true },
        order: [{ column: "sort_order" }, { column: "name" }],
      }),
    staleTime: 60_000,
  });
}

export function useIndustry(slug: string | undefined) {
  return useQuery({
    queryKey: ["industry", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const rows = await fetchPublicRows<Industry>("industries", {
        filters: { slug: slug ?? "", published: true },
        limit: 1,
      });
      return rows[0] ?? null;
    },
    staleTime: 60_000,
  });
}

export function useIndustryServices(serviceSlugs: string[] | undefined) {
  return useQuery({
    queryKey: ["industry-services", serviceSlugs],
    enabled: Boolean(serviceSlugs?.length),
    queryFn: () =>
      fetchPublicRows<IndustryService>("services", {
        select: "id,name,starting_from,short_description",
        inValues: { id: serviceSlugs ?? [] },
        filters: { published: true },
        order: [{ column: "sort_order" }],
      }),
    staleTime: 60_000,
  });
}
