// Generates public/sitemap.xml from static routes + Supabase rows.
// Usage:  node scripts/generate-sitemap.mjs
// Env:    VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (read from process env, .env.local or .env)
// Never fails the build: if Supabase is unreachable it writes the static routes only.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://www.emonisamuel.co.ke";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = resolve(ROOT, "public", "sitemap.xml");
const TODAY = new Date().toISOString().slice(0, 10);

/** Static public routes (private routes are intentionally excluded). */
const STATIC_ROUTES = [
  "/",
  "/what-i-do",
  "/projects",
  "/courses",
  "/partners",
  "/insights",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
];

/**
 * Dynamic content sources. Adjust table names / path builders to match your schema.
 * Rows flagged unpublished (published === false or status === "draft") are skipped.
 */
const DYNAMIC_SOURCES = [
  {
    table: "insights",
    toPath: (row) => (row.slug ? `/insights/${row.slug}` : null),
  },
  {
    // Web projects -> /projects/web/:id
    table: "projects",
    toPath: (row) => (row.id ? `/projects/web/${row.id}` : null),
  },
  {
    // Graphic design projects -> /projects/design/:id
    table: "graphic_designs",
    toPath: (row) => (row.id ? `/projects/design/${row.id}` : null),
  },
  {
    // Course detail pages -> /courses/:id
    table: "courses",
    toPath: (row) => (row.id ? `/courses/${row.id}` : null),
  },
  {
    // Service detail pages -> /what-i-do/:id
    table: "services",
    toPath: (row) => (row.id ? `/what-i-do/${row.id}` : null),
  },
];

function loadEnvFile(file) {
  const out = {};
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    out[match[1]] = (match[2] ?? "").replace(/^['"]|['"]$/g, "").trim();
  }
  return out;
}

const env = {
  ...loadEnvFile(resolve(ROOT, ".env")),
  ...loadEnvFile(resolve(ROOT, ".env.local")),
  ...process.env,
};

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toDate(value) {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : TODAY;
}

function isPublished(row) {
  if (row.published === false) return false;
  if (typeof row.status === "string" && row.status.toLowerCase() === "draft") return false;
  return true;
}

async function fetchDynamicEntries() {
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn(
      "[sitemap] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing; blog and project URLs NOT included."
    );
    return [];
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const entries = [];

  for (const source of DYNAMIC_SOURCES) {
    try {
      const { data, error } = await supabase.from(source.table).select("*");
      if (error) throw error;
      for (const row of data ?? []) {
        if (!isPublished(row)) continue;
        const path = source.toPath(row);
        if (path) entries.push({ path, lastmod: toDate(row.updated_at || row.created_at) });
      }
      console.log(`[sitemap] ${source.table}: ${data?.length ?? 0} rows read`);
    } catch (err) {
      console.warn(`[sitemap] Could not read "${source.table}": ${err?.message ?? err}`);
    }
  }
  return entries;
}

async function main() {
  const entries = [
    ...STATIC_ROUTES.map((path) => ({ path, lastmod: TODAY })),
    ...(await fetchDynamicEntries()),
  ];

  const seen = new Set();
  const unique = entries.filter((e) => {
    if (seen.has(e.path)) return false;
    seen.add(e.path);
    return true;
  });

  const body = unique
    .map(({ path, lastmod }) => {
      const loc = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  writeFileSync(OUTPUT, xml, "utf8");
  console.log(`[sitemap] Wrote ${unique.length} URLs to ${OUTPUT}`);
}

main().catch((err) => {
  console.warn(`[sitemap] Generation failed: ${err?.message ?? err}`);
  process.exit(0);
});
