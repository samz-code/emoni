import type { ImgHTMLAttributes, SyntheticEvent } from "react";
import { optimizeSupabaseImageUrl } from "@/lib/imageOptimization";

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

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (optimizedSrc !== src && image.getAttribute("src") === optimizedSrc) {
      image.src = src;
      return;
    }
    onError?.(event);
  };

  return <img {...props} src={optimizedSrc} onError={handleError} />;
}
