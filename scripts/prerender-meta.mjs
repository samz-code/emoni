import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const DIST = resolve("dist");
const TEMPLATE = join(DIST, "index.html");
const SITEMAP_CANDIDATES = [join(DIST, "sitemap.xml"), resolve("public", "sitemap.xml")];
const BRAND = "Samuel Emoni";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const unxml = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");

function fail(msg) {
  console.error(`[prerender] ${msg}`);
  process.exit(1);
}

// "brand-strategy" -> "Brand Strategy"; returns null for IDs like uuids or "logo-19"
function titleFromSlug(slug) {
  if (!/^[a-z]+(-[a-z]+)*$/i.test(slug)) return null;
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function buildHtml(template, loc, pathname) {
  let html = template
    .replace(/<link[^>]*rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]*property=["']og:url["'][^>]*>\s*/gi, "");

  const last = pathname.split("/").filter(Boolean).pop();
  const humanTitle = last ? titleFromSlug(decodeURIComponent(last)) : null;
  if (humanTitle) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(humanTitle)} | ${BRAND}</title>`);
  }

  if (!/<\/head>/i.test(html)) throw new Error("Template has no </head>");

  const tags =
    `<link rel="canonical" href="${esc(loc)}" />\n` +
    `    <meta property="og:url" content="${esc(loc)}" />\n  `;
  return html.replace(/<\/head>/i, `${tags}</head>`);
}

// /industries/startups-smes -> dist/industries/startups-smes/index.html
function outputFile(pathname) {
  if (pathname === "/" || pathname === "") return TEMPLATE;
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((s) => decodeURIComponent(s));
  if (segments.some((s) => s === ".." || s === "." || /[\\:*?"<>|]/.test(s))) return null;
  return join(DIST, ...segments, "index.html");
}

function main() {
  if (!existsSync(TEMPLATE)) fail(`${TEMPLATE} not found. Run "vite build" first.`);

  const sitemapPath = SITEMAP_CANDIDATES.find((p) => existsSync(p));
  if (!sitemapPath) fail("sitemap.xml not found in dist/ or public/.");

  const xml = readFileSync(sitemapPath, "utf8");
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => unxml(m[1]));
  if (locs.length === 0) fail("No <loc> entries found in sitemap.xml.");

  const template = readFileSync(TEMPLATE, "utf8");
  const sample = [];
  let written = 0;
  let skipped = 0;

  for (const loc of locs) {
    try {
      const url = new URL(loc);
      const file = outputFile(url.pathname);
      if (!file) {
        skipped++;
        continue;
      }
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, buildHtml(template, loc, url.pathname), "utf8");
      if (sample.length < 5) sample.push(file.replace(DIST, "dist"));
      written++;
    } catch (e) {
      skipped++;
      console.warn(`[prerender] Skipped ${loc}: ${e.message}`);
    }
  }

  // Build report: fetch /prerender-report.json on the live site to confirm which build is served
  const report = {
    builtAt: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA || "local",
    vercelEnv: process.env.VERCEL_ENV || "local",
    pagesWritten: written,
    pagesSkipped: skipped,
    sitemapUsed: sitemapPath.replace(resolve("."), "."),
    sampleFiles: sample,
  };
  writeFileSync(join(DIST, "prerender-report.json"), JSON.stringify(report, null, 2), "utf8");

  console.log(
    `[prerender] Wrote ${written} pages with self-canonical tags (${skipped} skipped) from ${sitemapPath}`
  );
  if (written === 0) fail("Nothing was written.");
}

main();