import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      type="button"
      onClick={scrollTop}
      aria-label="Back to top"
      className={`fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 bg-forest text-cream border border-cream/20 px-4 py-2.5 rounded-[4px] font-body text-[12px] uppercase tracking-[0.18em] hover:bg-ember hover:text-paper hover:border-ember transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <ArrowUp size={14} />
      Top
    </button>
  );
};

export default BackToTop;
