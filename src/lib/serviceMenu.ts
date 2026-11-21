import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface ServiceMenuItem {
  label: string;
  href: string;
}

// Module-level cache: the menu is fetched once per page load, not on every navigation.
let cache: ServiceMenuItem[] | null = null;
let inflight: Promise<ServiceMenuItem[]> | null = null;

const loadServiceMenu = async (): Promise<ServiceMenuItem[]> => {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, sort_order")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .filter((s) => s.id && s.name)
    .map((s) => ({
      label: String(s.name).toUpperCase(),
      // The service card on /what-i-do has id={service.id}, so this anchor scrolls to it.
      href: `/what-i-do#${s.id}`,
    }));
};

/**
 * Returns the published services as dropdown items.
 * Returns [] while loading or if the request fails, so the caller can show a fallback.
 */
export const useServiceMenu = (): ServiceMenuItem[] => {
  const [items, setItems] = useState<ServiceMenuItem[]>(cache ?? []);

  useEffect(() => {
    if (cache) return;

    let cancelled = false;
    inflight = inflight ?? loadServiceMenu();

    inflight
      .then((result) => {
        cache = result;
        if (!cancelled) setItems(result);
      })
      .catch((err) => {
        console.error("Could not load services for the menu:", err);
      })
      .finally(() => {
        inflight = null;
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return items;
};