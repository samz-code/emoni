import { describe, expect, it } from "vitest";
import { optimizeSupabaseImageUrl } from "./imageOptimization";

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
});
