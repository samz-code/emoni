import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OptimizedImage from "./OptimizedImage";

describe("OptimizedImage", () => {
  it("falls back to the original URL when a Supabase transformation fails", () => {
    const src = "https://project.supabase.co/storage/v1/object/public/media/photo.jpg";
    render(<OptimizedImage src={src} transformWidth={640} alt="Test photo" />);
    const image = screen.getByAltText("Test photo");

    fireEvent.error(image);

    expect(image).toHaveAttribute("src", src);
  });

  it("forwards errors when the original URL fails", () => {
    const onError = vi.fn();
    const src = "https://images.example.com/photo.jpg";
    render(<OptimizedImage src={src} transformWidth={640} alt="Test photo" onError={onError} />);
    const image = screen.getByAltText("Test photo");

    fireEvent.error(image);

    expect(onError).toHaveBeenCalledOnce();
  });
});
