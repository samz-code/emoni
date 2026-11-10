import { describe, expect, it } from "vitest";
import { getSupabaseImageSrcSet, optimizeSupabaseImageUrl } from "./imageOptimization";

describe("optimizeSupabaseImageUrl", () => {
  it("requests a WebP transformation for public Supabase images", () => {
    const result = new URL(
      optimizeSupabaseImageUrl(
        "https://project.supabase.co/storage/v1/object/public/media/photo.jpg?download=1",
        640,
      ),
    );

    expect(result.pathname).toBe("/storage/v1/render/image/public/media/photo.jpg");
    expect(result.searchParams.get("download")).toBe("1");
    expect(result.searchParams.get("width")).toBe("640");
    expect(result.searchParams.get("quality")).toBe("75");
    expect(result.searchParams.get("format")).toBe("webp");
  });

  it("leaves non-Supabase and invalid image URLs unchanged", () => {
    const externalUrl = "https://images.example.com/photo.jpg";
    const invalidUrl = "not-a-url";

    expect(optimizeSupabaseImageUrl(externalUrl, 640)).toBe(externalUrl);
    expect(optimizeSupabaseImageUrl(invalidUrl, 640)).toBe(invalidUrl);
  });

  it("builds responsive image variants without duplicate widths", () => {
    const srcSet = getSupabaseImageSrcSet(
      "https://project.supabase.co/storage/v1/object/public/media/photo.jpg",
      [640, 320, 640],
    );

    expect(srcSet).toContain("width=320");
    expect(srcSet).toContain("width=640");
    expect(srcSet?.match(/ 320w/g)).toHaveLength(1);
    expect(srcSet?.match(/ 640w/g)).toHaveLength(1);
  });
});
