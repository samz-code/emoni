import { describe, expect, it } from "vitest";
import { applicableOffer, isOfferActive, quotePrice, type Offer } from "./servicePricing";

const offer: Offer = {
  id: "global",
  target_type: "all",
  target_id: null,
  enabled: true,
  title: "Launch offer",
  description: "",
  currency: "KES",
  discount_type: "percentage",
  discount_value: 10,
  starts_at: null,
  ends_at: null,
  show_on_home: false,
  banner_image_url: null,
  banner_format: "banner",
  banner_alt: "",
  cta_text: "View offer",
  cta_link: "",
  sort_order: 0,
};

describe("service pricing offers", () => {
  it("applies percentage discounts and calculates savings", () => {
    expect(quotePrice(26_000, offer)).toEqual({
      original: 26_000,
      discounted: 23_400,
      savings: 2_600,
    });
  });

  it("applies fixed discounts without reducing a price below zero", () => {
    expect(quotePrice(1_500, { ...offer, discount_type: "fixed", discount_value: 2_000 })).toEqual({
      original: 1_500,
      discounted: 0,
      savings: 1_500,
    });
  });

  it("does not apply disabled or out-of-window offers", () => {
    expect(isOfferActive({ ...offer, enabled: false }, Date.UTC(2026, 0, 1))).toBe(false);
    expect(isOfferActive({ ...offer, starts_at: "2026-02-01T00:00:00Z" }, Date.UTC(2026, 0, 1))).toBe(false);
    expect(isOfferActive({ ...offer, ends_at: "2025-12-31T23:59:59Z" }, Date.UTC(2026, 0, 1))).toBe(false);
  });

  it("chooses an item-specific offer ahead of a category or global offer", () => {
    const itemOffer = { ...offer, id: "specific", target_type: "service" as const, target_id: "web-design", discount_value: 5 };
    const servicesOffer = { ...offer, id: "services", target_type: "services" as const, discount_value: 15 };
    const selected = applicableOffer(
      [offer, servicesOffer, itemOffer],
      { type: "service", id: "web-design", currency: "KES" },
    );
    expect(selected?.id).toBe("specific");
  });

  it("does not apply fixed-price offers to a different currency", () => {
    const fixedUsd = { ...offer, target_type: "courses" as const, currency: "USD" as const, discount_type: "fixed" as const, discount_value: 10 };
    expect(applicableOffer([fixedUsd], { type: "course", id: "react", currency: "USD" })?.id).toBe("global");
    expect(applicableOffer([{ ...fixedUsd, target_type: "all" as const }], { type: "service", id: "web", currency: "KES" })).toBeNull();
  });
});
