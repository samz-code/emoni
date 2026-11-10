export function optimizeSupabaseImageUrl(src: string, width: number, quality = 75): string {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }

  const publicObjectPath = "/storage/v1/object/public/";
  if (!url.hostname.endsWith(".supabase.co") || !url.pathname.includes(publicObjectPath)) {
    return src;
  }

  url.pathname = url.pathname.replace(publicObjectPath, "/storage/v1/render/image/public/");
  url.searchParams.set("width", String(Math.max(1, Math.round(width))));
  url.searchParams.set("quality", String(Math.min(100, Math.max(1, Math.round(quality)))));
  url.searchParams.set("format", "webp");
  return url.toString();
}

export function getSupabaseImageSrcSet(src: string, widths: number[], quality = 75): string | undefined {
  const entries = [...new Set(widths.map((width) => Math.max(1, Math.round(width))))].sort(
    (a, b) => a - b,
  );
  const transformed = entries.map((width) => ({
    width,
    url: optimizeSupabaseImageUrl(src, width, quality),
  }));
  if (transformed.every(({ url }) => url === src)) return undefined;
  return transformed.map(({ width, url }) => `${url} ${width}w`).join(", ");
}
