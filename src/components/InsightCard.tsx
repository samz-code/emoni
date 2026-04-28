import { Link } from "react-router-dom";
import type { Insight } from "@/data/insights";
import { Eye } from "lucide-react";

const InsightCard = ({ insight, featured = false }: { insight: Insight; featured?: boolean }) => {
  if (featured) {
    return (
      <Link to={`/insights/${insight.slug}`} className="block">
        <div className="bg-forest text-cream p-10 rounded-[4px] hover:bg-forest/95 transition-colors">
          {insight.image && (
            <div className="mb-6 overflow-hidden rounded-[4px]">
              <img
                src={insight.image}
                alt={insight.title}
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <span className="inline-block bg-cream/10 text-cream text-xs rounded-[4px] px-2 py-1 font-body">
            {insight.category}
          </span>
          <h3 className="font-display text-[38px] text-cream mt-4 leading-tight max-w-2xl">
            {insight.title}
          </h3>
          {insight.excerpt && (
            <p className="font-body text-base text-cream/80 mt-4 max-w-xl leading-relaxed">
              {insight.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 mt-6">
            <span className="font-body text-[12px] text-cream/60">
              {insight.date} · {insight.readTime}
            </span>
            {insight.readers && (
              <span className="flex items-center gap-1 font-body text-[12px] text-cream/60">
                <Eye size={12} />
                {insight.readers.toLocaleString()} reads
              </span>
            )}
            <span className="text-ember font-body text-[13px] font-medium">
              Read More →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/insights/${insight.slug}`} className="block h-full">
      <div className="bg-snow border border-border rounded-[4px] p-5 h-full hover:border-olive transition-colors">
        {insight.image && (
          <div className="mb-4 overflow-hidden rounded-[4px]">
            <img
              src={insight.image}
              alt={insight.title}
              className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <span className="inline-block bg-forest text-cream text-xs rounded-[4px] px-2 py-1 font-body">
          {insight.category}
        </span>
        <h3 className="font-display text-[22px] text-ink mt-3 leading-snug">{insight.title}</h3>
        {insight.excerpt && (
          <p className="font-body text-sm text-[#4A4A4A] mt-2 leading-relaxed">{insight.excerpt}</p>
        )}
        <div className="flex justify-between items-center mt-4">
          <span className="font-body text-[12px] text-[#9A9A9A]">
            {insight.date} · {insight.readTime}
          </span>
          {insight.readers && (
            <span className="flex items-center gap-1 font-body text-[11px] text-[#9A9A9A]">
              <Eye size={10} />
              {insight.readers.toLocaleString()}
            </span>
          )}
          <span className="text-ember font-body text-[13px] font-medium">
            Read More →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default InsightCard;
