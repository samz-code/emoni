import type { ImgHTMLAttributes, SyntheticEvent } from "react";
import { getSupabaseImageSrcSet, optimizeSupabaseImageUrl } from "@/lib/imageOptimization";

type OptimizedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "fetchPriority"> & {
  src: string;
  transformWidth: number;
  fetchPriority?: "high" | "low" | "auto";
};

export default function OptimizedImage({
  src,
  transformWidth,
  fetchPriority,
  onError,
  ...props
}: OptimizedImageProps) {
  const optimizedSrc = optimizeSupabaseImageUrl(src, transformWidth);
  const srcSet = getSupabaseImageSrcSet(src, [transformWidth, 320, 640, 960, 1440]);
  const setFetchPriority = (image: HTMLImageElement | null) => {
    if (image && fetchPriority) image.setAttribute("fetchpriority", fetchPriority);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (optimizedSrc !== src && image.getAttribute("data-original-src") !== src) {
      image.setAttribute("data-original-src", src);
      image.removeAttribute("srcset");
      image.src = src;
      return;
    }
    onError?.(event);
  };

  return <img {...props} ref={setFetchPriority} src={optimizedSrc} srcSet={srcSet} onError={handleError} />;
}
