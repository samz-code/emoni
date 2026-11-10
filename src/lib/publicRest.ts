const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ydswydifmafjvtlqbmmm.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "******";

type PublicQuery = {
  select?: string;
  filters?: Record<string, string | number | boolean>;
  inValues?: Record<string, (string | number)[]>;
  order?: { column: string; ascending?: boolean }[];
  limit?: number;
};

export async function fetchPublicRows<T>(table: string, query: PublicQuery = {}): Promise<T[]> {
  const url = new URL(`/rest/v1/${encodeURIComponent(table)}`, supabaseUrl);
  url.searchParams.set("select", query.select ?? "*");

  Object.entries(query.filters ?? {}).forEach(([column, value]) => {
    url.searchParams.set(column, `eq.${value}`);
  });
  Object.entries(query.inValues ?? {}).forEach(([column, values]) => {
    const list = values
      .map((value) => `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
      .join(",");
    url.searchParams.set(column, `in.(${list})`);
  });
  query.order?.forEach(({ column, ascending = true }) => {
    url.searchParams.append("order", `${column}.${ascending ? "asc" : "desc"}`);
  });
  if (query.limit !== undefined) url.searchParams.set("limit", String(query.limit));

  const response = await fetch(url, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Public ${table} request failed (${response.status}): ${detail}`);
  }
  return (await response.json()) as T[];
}
