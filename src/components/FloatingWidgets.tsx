import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Official brand SVG logos ─────────────────────────────────────────────────

// WhatsApp — official logo from Meta / WhatsApp Brand Resources
const WhatsAppSVG = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.5 21.5l4.487-1.374A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm-1.32 5.876c-.19-.445-.388-.454-.567-.462l-.483-.008c-.168 0-.44.063-.67.314-.232.252-.885.865-.885 2.11 0 1.244.906 2.447 1.032 2.616.127.168 1.752 2.79 4.32 3.8.6.232 1.07.37 1.434.474.603.172 1.152.148 1.586.09.484-.065 1.49-.61 1.7-1.198.21-.588.21-1.092.147-1.198-.063-.105-.232-.168-.484-.294-.252-.126-1.49-.735-1.722-.819-.232-.084-.4-.126-.568.126-.168.252-.65.819-.798.987-.147.168-.294.189-.546.063-.252-.126-1.065-.392-2.028-1.25-.749-.668-1.255-1.493-1.402-1.745-.147-.252-.016-.388.11-.513.115-.112.253-.295.378-.441.126-.147.168-.252.252-.42.084-.168.042-.315-.02-.44-.063-.127-.555-1.365-.768-1.87Z"
      fill="#fff"
    />
  </svg>
);

// ─── Button config ───────────────────────────────────────────────────────────

const buttons = [
  {
    id: "whatsapp",
    SVG: WhatsAppSVG,
    href: "https://wa.me/254727492545",
    bg: "#25D366",
    ringColor: "rgba(37,211,102,0.45)",
    tooltip: "Chat on WhatsApp",
  },
];

// ─── Pulse ring ───────────────────────────────────────────────────────────────

const PulseRing = ({ color }: { color: string }) => (
  <>
    {[0, 1].map((i) => (
      <motion.span
        key={i}
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: color }}
        initial={{ scale: 1, opacity: 0.55 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          delay: i * 0.9,
          ease: "easeOut",
        }}
      />
    ))}
  </>
);

// ─── Main component ───────────────────────────────────────────────────────────

const FloatingWidgets = () => {
  const [visible, setVisible] = useState(false);
  const [dimmed, setDimmed] = useState(false);
  const [hovering, setHovering] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    let dimTimer: ReturnType<typeof setTimeout>;
    const reset = () => {
      setDimmed(false);
      clearTimeout(dimTimer);
      dimTimer = setTimeout(() => setDimmed(true), 8000);
    };
    reset();
    window.addEventListener("mousemove", reset);
    return () => {
      clearTimeout(dimTimer);
      window.removeEventListener("mousemove", reset);
    };
  }, [visible]);

  if (!visible) return null;

  const isDimmed = dimmed && !hovering;

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: isDimmed ? 0.2 : 1, x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="fixed bottom-6 right-5 z-[100] flex flex-col gap-4 md:bottom-8 md:right-7"
    >
      {buttons.map((btn, index) => (
        <motion.div
          key={btn.id}
          initial={{ opacity: 0, scale: 0.4, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: index * 0.15,
          }}
          className="relative flex items-center justify-end"
          onMouseEnter={() => setHovering(btn.id)}
          onMouseLeave={() => setHovering(null)}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {hovering === btn.id && (
              <motion.div
                initial={{ opacity: 0, x: 12, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 12, scale: 0.9 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-full mr-3.5 flex items-center pointer-events-none"
              >
                <span
                  className="font-body text-[12.5px] font-semibold text-white whitespace-nowrap rounded-lg px-3.5 py-2 shadow-xl"
                  style={{ background: btn.bg }}
                >
                  {btn.tooltip}
                </span>
                {/* Arrow */}
                <span
                  className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-0 h-0"
                  style={{
                    borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent",
                    borderLeft: `5px solid ${btn.bg}`,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button */}
          <motion.a
            href={btn.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={btn.tooltip}
            whileHover={{ scale: 1.14, rotate: 6 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-2xl"
            style={{ background: btn.bg }}
          >
            {/* Pulse rings */}
            {hovering !== btn.id && <PulseRing color={btn.ringColor} />}

            {/* Gloss sheen */}
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.28) 0%, transparent 60%)",
              }}
            />

            {/* Logo */}
            <span className="relative z-10">
              <btn.SVG />
            </span>
          </motion.a>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default FloatingWidgets;