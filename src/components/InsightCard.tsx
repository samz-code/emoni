import { Link } from "react-router-dom";
import type { InsightPreview } from "@/types/insight";

const InsightCard = ({ insight, featured = false }: { insight: InsightPreview; featured?: boolean }) => {
  const metadata = [
    insight.author ? `By ${insight.author}` : null,
    insight.date,
    insight.read_time,
  ].filter(Boolean).join(" · ");
  const focus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember";

  /* ---------- Featured: wide card, image 7 cols / text 5 cols ---------- */
  if (featured) {
    return (
      <Link
        to={`/insights/${insight.slug}`}
        className={`group block overflow-hidden rounded-lg border border-border bg-snow ${focus}`}
      >
        <div className="grid lg:grid-cols-12">
          {insight.image && (
            <div className="relative aspect-[16/10] overflow-hidden bg-forest/5 lg:col-span-7 lg:aspect-auto lg:min-h-[400px]">
              <img
                src={insight.image}
                alt=""
                loading="eager"
                decoding="async"
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
              />
            </div>
          )}
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-5 lg:p-10 xl:p-12">
            {insight.category && (
              <p className="font-body text-sm font-medium text-ember">{insight.category}</p>
            )}
            <h3 className="mt-3 font-display text-2xl normal-case leading-snug text-ink transition-colors group-hover:text-forest sm:text-3xl">
              {insight.title}
            </h3>
            {insight.excerpt && (
              <p className="mt-4 line-clamp-4 font-body text-base leading-relaxed text-[#4A4A4A]">
                {insight.excerpt}
              </p>
            )}
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5 font-body text-sm">
              <span className="text-ink/60">{metadata}</span>
              <span className="font-medium text-forest">
                Read article <span aria-hidden="true">→</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /* ---------- Grid card: image on top, text below ---------- */
  return (
    <Link to={`/insights/${insight.slug}`} className={`group flex h-full flex-col ${focus}`}>
      {insight.image && (
        <div className="aspect-[16/10] overflow-hidden rounded-md bg-forest/5">
          <img
            src={insight.image}
            alt=""
            loading="lazy"
            decoding="async"
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col pt-5">
        {insight.category && (
          <p className="font-body text-sm font-medium text-ember">{insight.category}</p>
        )}
        <h3 className="mt-2 line-clamp-3 font-display text-xl normal-case leading-snug text-ink transition-colors group-hover:text-forest">
          {insight.title}
        </h3>
        {insight.excerpt && (
          <p className="mt-3 line-clamp-3 font-body text-[0.95rem] leading-relaxed text-[#4A4A4A]">
            {insight.excerpt}
          </p>
        )}
        <p className="mt-auto pt-5 font-body text-sm text-ink/55">{metadata}</p>
      </div>
    </Link>
  );
};

export default InsightCard;