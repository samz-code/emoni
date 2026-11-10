import { useQuery } from "@tanstack/react-query";
import { fetchPublicRows } from "@/lib/publicRest";

export type OfferTarget = "all" | "services" | "courses" | "service" | "course";

export interface Offer {
  id: string;
  target_type: OfferTarget;
  target_id: string | null;
  enabled: boolean;
  title: string;
  description: string;
  currency: "KES" | "USD";
  discount_type: "percentage" | "fixed";
  discount_value: number;
  starts_at: string | null;
  ends_at: string | null;
  show_on_home: boolean;
  banner_image_url: string | null;
  banner_format: "banner" | "flyer";
  banner_alt: string;
  cta_text: string;
  cta_link: string;
  sort_order: number;
}

export interface PriceQuote {
  original: number;
  discounted: number;
  savings: number;
}

export function useOffers() {
  return useQuery({
    queryKey: ["offers"],
    queryFn: async (): Promise<Offer[]> => {
      return fetchPublicRows<Offer>("offers", {
        filters: { enabled: true },
        order: [{ column: "sort_order" }],
      });
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}

export function isOfferActive(
  offer: Offer | null | undefined,
  now = Date.now(),
): boolean {
  if (!offer?.enabled || !Number.isFinite(Number(offer.discount_value)) || offer.discount_value <= 0) {
    return false;
  }
  if (offer.discount_type === "percentage" && offer.discount_value > 100) return false;
  if (offer.starts_at && new Date(offer.starts_at).getTime() > now) return false;
  if (offer.ends_at && new Date(offer.ends_at).getTime() <= now) return false;
  return true;
}

export function applicableOffer(
  offers: Offer[] | null | undefined,
  target: { type: "service" | "course"; id: string; currency: "KES" | "USD" },
  now = Date.now(),
): Offer | null {
  const targetKinds: OfferTarget[] =
    target.type === "service" ? ["service", "services", "all"] : ["course", "courses", "all"];
  const specificity: Record<OfferTarget, number> = {
    all: 1,
    services: 2,
    courses: 2,
    service: 3,
    course: 3,
  };

  return (offers ?? [])
    .filter((offer) => {
      if (!isOfferActive(offer, now) || !targetKinds.includes(offer.target_type)) return false;
      if (offer.target_type === target.type && offer.target_id !== target.id) return false;
      return offer.discount_type !== "fixed" || offer.currency === target.currency;
    })
    .sort((a, b) => specificity[b.target_type] - specificity[a.target_type] || a.sort_order - b.sort_order)[0] ?? null;
}

export function quotePrice(price: number, offer?: Offer | null, now = Date.now()): PriceQuote {
  const original = Math.max(0, Number.isFinite(price) ? price : 0);
  if (!offer || !isOfferActive(offer, now) || original === 0) {
    return { original, discounted: original, savings: 0 };
  }

  const rawDiscount =
    offer.discount_type === "percentage"
      ? (original * offer.discount_value) / 100
      : offer.discount_value;
  const discounted = Math.max(0, Math.round((original - rawDiscount) * 100) / 100);
  return { original, discounted, savings: original - discounted };
}

export function formatKes(amount: number): string {
  return formatPrice(amount, "KES");
}

export function formatPrice(amount: number, currency: "KES" | "USD"): string {
  return new Intl.NumberFormat(currency === "KES" ? "en-KE" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
