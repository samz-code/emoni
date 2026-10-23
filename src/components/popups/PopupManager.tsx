import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CONSENT_EVENT, hasConsent, hasDecided } from "@/components/CookieConsent";
import type { Popup } from "./popupTypes";
import { PopupBannerView, PopupModalView } from "./PopupViews";

const EXCLUDED_PREFIXES = ["/admin", "/partner", "/portal", "/login", "/register", "/auth"];

function scopeMatches(scope: string, pathname: string): boolean {
  const rules = scope.split(",").map((rule) => rule.trim()).filter(Boolean);
  if (rules.length === 0) return true;
  return rules.some((rule) => {
    if (rule === "*" || rule === "/*") return true;
    const clean = rule.replace(/\/\*$/, "").replace(/\/+$/, "") || "/";
    if (clean === "/") return pathname === "/";
    return pathname === clean || pathname.startsWith(`${clean}/`);
  });
}

const storageKey = (popup: Popup) => `putu_popup_${popup.id}_${new Date(popup.updated_at).getTime()}`;

function isDismissed(popup: Popup): boolean {
  try {
    if (popup.frequency === "always") return false;
    const key = storageKey(popup);
    if (popup.frequency === "session") return sessionStorage.getItem(key) !== null;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    if (popup.frequency === "once") return true;
    const timestamp = Number(raw);
    return Number.isFinite(timestamp) && Date.now() - timestamp < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function rememberDismissal(popup: Popup): void {
  if (popup.frequency === "always" || !hasConsent("functional")) return;
  try {
    const key = storageKey(popup);
    if (popup.frequency === "session") sessionStorage.setItem(key, "1");
    else localStorage.setItem(key, String(Date.now()));
  } catch (error) {
    console.warn("Unable to store popup dismissal preference:", error);
  }
}

export default function PopupManager() {
  const { pathname } = useLocation();
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [consentDone, setConsentDone] = useState(hasDecided);
  const [modalReady, setModalReady] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        if (active) setLoggedIn(!!data.session);
      })
      .catch((error: unknown) => {
        console.warn("Unable to read authentication state for popups:", error);
        if (active) setLoggedIn(false);
      });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setLoggedIn(!!session);
    });
    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("popups")
          .select("*")
          .eq("is_active", true)
          .order("priority", { ascending: false })
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (active) setPopups((data ?? []) as Popup[]);
      } catch (error) {
        console.warn("Popups load failed:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onChange = () => setConsentDone(hasDecided());
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  useEffect(() => {
    setModalReady(false);
    const timer = window.setTimeout(() => setModalReady(true), 1500);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const eligible = useMemo(() => {
    if (loggedIn === null) return [];
    if (EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return [];
    const now = Date.now();
    return popups.filter((popup) => {
      if (!popup.is_active || hidden.has(popup.id)) return false;
      if (popup.starts_at && new Date(popup.starts_at).getTime() > now) return false;
      if (popup.ends_at && new Date(popup.ends_at).getTime() < now) return false;
      if (popup.audience === "guests" && loggedIn) return false;
      if (popup.audience === "customers" && !loggedIn) return false;
      if (!scopeMatches(popup.page_scope, pathname)) return false;
      return !isDismissed(popup);
    });
  }, [popups, hidden, loggedIn, pathname]);

  const banner = eligible.find((popup) => popup.placement === "banner");
  const modal = eligible.find((popup) => popup.placement === "modal");
  const dismiss = useCallback((popup: Popup) => {
    rememberDismissal(popup);
    setHidden((previous) => new Set(previous).add(popup.id));
  }, []);

  return (
    <>
      {banner && <PopupBannerView key={banner.id} popup={banner} from={pathname} onDismiss={() => dismiss(banner)} />}
      {modal && consentDone && modalReady && (
        <PopupModalView key={modal.id} popup={modal} from={pathname} onDismiss={() => dismiss(modal)} />
      )}
    </>
  );
}
