import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   CONSENT STORAGE (import these anywhere to gate scripts)
═══════════════════════════════════════════════════════════ */
const STORAGE_KEY = "cookie-consent";
const CONSENT_VERSION = 1; // bump to ask every visitor again after a policy change

export const OPEN_COOKIE_SETTINGS_EVENT = "open-cookie-settings";
export const COOKIE_CONSENT_CHANGE_EVENT = "cookie-consent-change";

export type CookieConsent = {
  version: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  savedAt: string;
};

export function getCookieConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    return parsed.version === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function saveConsent(analytics: boolean, marketing: boolean) {
  const value: CookieConsent = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics,
    marketing,
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage blocked: the banner will simply show again next visit */
  }
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, { detail: value }));
}

/** Call from a footer link / button to let visitors change their choice. */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!getCookieConsent()) timer = setTimeout(() => setVisible(true), 800);

    const onOpen = () => {
      const current = getCookieConsent();
      setAnalytics(current?.analytics ?? false);
      setMarketing(current?.marketing ?? false);
      setShowPrefs(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
    };
  }, []);

  const commit = useCallback((a: boolean, m: boolean) => {
    saveConsent(a, m);
    setVisible(false);
    setShowPrefs(false);
  }, []);

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3 }}
          className="fixed z-[9999] pointer-events-auto bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white border border-[#E8E2D6] rounded-2xl shadow-2xl p-5 font-body text-[#524646]"
        >
          {!showPrefs ? (
            <>
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-full bg-[#007979]/10 text-[#007979] flex items-center justify-center shrink-0">
                  <Cookie size={20} />
                </span>
                <div>
                  <h2 className="font-display text-lg text-[#1A1A16] leading-tight">We value your privacy</h2>
                  <p className="text-sm mt-1.5 leading-relaxed text-[#524646]/85">
                    We use cookies to keep the site working and, with your permission, to understand how it is used and
                    improve it. Read our{" "}
                    <Link to="/cookies" className="text-[#007979] underline underline-offset-2 hover:text-[#EC5B38]">
                      Cookie Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col-reverse sm:flex-row sm:items-center gap-2">
                <button
                  onClick={() => setShowPrefs(true)}
                  className="px-3 py-2 text-sm text-[#007979] hover:underline underline-offset-2 sm:mr-auto"
                >
                  Customize
                </button>
                <button
                  onClick={() => commit(false, false)}
                  className="px-4 py-2 rounded-lg border border-[#E8E2D6] text-sm font-medium text-[#524646] hover:bg-[#FBF9F5] transition-colors"
                >
                  Reject non-essential
                </button>
                <button
                  onClick={() => commit(true, true)}
                  className="px-4 py-2 rounded-lg bg-[#007979] text-[#FFE2AF] text-sm font-medium hover:bg-[#24B1B1] transition-colors"
                >
                  Accept all
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg text-[#1A1A16]">Cookie preferences</h2>
                <button
                  onClick={() => (getCookieConsent() ? setVisible(false) : setShowPrefs(false))}
                  aria-label="Back"
                  className="p-1.5 rounded-lg hover:bg-[#FBF9F5] text-[#524646]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <PrefRow
                  title="Strictly necessary"
                  description="Needed for the site to work and to remember this choice. Always on."
                  checked
                  disabled
                />
                <PrefRow
                  title="Analytics"
                  description="Help us understand which pages are useful, using anonymous statistics."
                  checked={analytics}
                  onChange={setAnalytics}
                />
                <PrefRow
                  title="Marketing"
                  description="Used to show relevant content and measure campaigns."
                  checked={marketing}
                  onChange={setMarketing}
                />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => commit(false, false)}
                  className="px-4 py-2 rounded-lg border border-[#E8E2D6] text-sm font-medium hover:bg-[#FBF9F5] transition-colors"
                >
                  Reject non-essential
                </button>
                <button
                  onClick={() => commit(analytics, marketing)}
                  className="px-4 py-2 rounded-lg bg-[#007979] text-[#FFE2AF] text-sm font-medium hover:bg-[#24B1B1] transition-colors"
                >
                  Save choices
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function PrefRow({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-[#E8E2D6] p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#1A1A16]">{title}</p>
        <p className="text-xs text-[#524646]/75 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative w-10 h-6 rounded-full shrink-0 transition-colors ${
          checked ? "bg-[#007979]" : "bg-gray-300"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
    </div>
  );
}