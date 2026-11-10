import type { ImgHTMLAttributes, SyntheticEvent } from "react";
import { getSupabaseImageSrcSet, optimizeSupabaseImageUrl } from "@/lib/imageOptimization";

type OptimizedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  transformWidth: number;
};

export default function OptimizedImage({
  src,
  transformWidth,
  onError,
  ...props
}: OptimizedImageProps) {
  const optimizedSrc = optimizeSupabaseImageUrl(src, transformWidth);
  const srcSet = getSupabaseImageSrcSet(src, [transformWidth, 320, 640, 960, 1440]);

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

  return <img {...props} src={optimizedSrc} srcSet={srcSet} onError={handleError} />;
}
