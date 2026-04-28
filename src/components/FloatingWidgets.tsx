import { useState, useEffect } from "react";
import { Linkedin, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FloatingWidgets = () => {
  const [visible, setVisible] = useState(false);
  const [dimmed, setDimmed] = useState(false);
  const [hovering, setHovering] = useState<string | null>(null);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    let dimTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      setDimmed(false);
      clearTimeout(dimTimer);
      dimTimer = setTimeout(() => setDimmed(true), 8000);
    };

    resetTimer();
    window.addEventListener("mousemove", resetTimer);
    return () => {
      clearTimeout(dimTimer);
      window.removeEventListener("mousemove", resetTimer);
    };
  }, [visible]);

  if (!visible) return null;

  const buttons = [
    {
      id: "linkedin",
      icon: Linkedin,
      href: "https://www.linkedin.com/in/samuelemoni",
      bg: "bg-[#0A66C2]",
      tooltip: "Connect on LinkedIn",
    },
    {
      id: "whatsapp",
      icon: MessageCircle,
      href: "https://wa.me/254727492545",
      bg: "bg-[#25D366]",
      tooltip: "Chat on WhatsApp",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: dimmed && !hovering ? 0.25 : 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 md:bottom-6 md:right-6"
    >
      {buttons.map((btn) => (
        <div
          key={btn.id}
          className="relative"
          onMouseEnter={() => setHovering(btn.id)}
          onMouseLeave={() => setHovering(null)}
        >
          <AnimatePresence>
            {hovering === btn.id && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-ink text-snow font-body text-[12px] rounded-[4px] px-3 py-1.5 whitespace-nowrap"
              >
                {btn.tooltip}
              </motion.span>
            )}
          </AnimatePresence>
          <motion.a
            href={btn.href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.08 }}
            className={`${btn.bg} w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-snow`}
            aria-label={btn.tooltip}
          >
            <btn.icon size={20} />
          </motion.a>
        </div>
      ))}
    </motion.div>
  );
};

export default FloatingWidgets;