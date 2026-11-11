#!/usr/bin/env node
// Checks the generated site. No dependencies. Run after build: node src/check.mjs
// Exits 1 on the first kind of failure it can name, after printing all of them.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://syswatch.devlune.in";
const PAGES = { en: "index.html", de: "de.html", fr: "fr.html", es: "es.html", ru: "ru.html" };
const urlOf = (l) => `${ORIGIN}/${l === "en" ? "" : l}`;
const fails = [];
const fail = (where, what) => fails.push(`${where}: ${what}`);
const read = (f) => readFileSync(join(ROOT, f), "utf8");
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const one = (html, re) => (html.match(re) ?? [])[1];
const all = (html, re) => [...html.matchAll(re)].map((m) => m[1]);

const rows = [];
for (const [lang, f] of Object.entries(PAGES)) {
  const html = read(f);
  const title = decode(one(html, /<title>([^<]*)<\/title>/) ?? "");
  const desc = decode(one(html, /<meta name="description" content="([^"]*)"/) ?? "");
  const canonical = one(html, /<link rel="canonical" href="([^"]*)"/);
  const h1 = all(html, /<h1[ >]([\s\S]*?)<\/h1>/g);
  rows.push({ page: f, lang: one(html, /<html lang="([^"]*)"/), title: [...title].length, description: [...desc].length, h1: h1.length, canonical });

  if (one(html, /<html lang="([^"]*)"/) !== lang) fail(f, "html lang");
  if (![...title].length || [...title].length >= 60) fail(f, `title is ${[...title].length} characters (want under 60)`);
  if ([...desc].length < 140 || [...desc].length > 160) fail(f, `description is ${[...desc].length} characters (want 140 to 160)`);
  if (canonical !== urlOf(lang)) fail(f, `canonical ${canonical}`);
  if (h1.length !== 1) fail(f, `${h1.length} h1 elements`);

  // hreflang: every page lists every language plus x-default, each pointing at that language's own URL.
  const alt = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g)].map((m) => [m[1], m[2]]));
  for (const l of Object.keys(PAGES)) if (alt[l] !== urlOf(l)) fail(f, `hreflang ${l} is ${alt[l]}`);
  if (alt["x-default"] !== `${ORIGIN}/`) fail(f, "hreflang x-default");
  if (Object.keys(alt).length !== Object.keys(PAGES).length + 1) fail(f, "hreflang count");

  // Heading order never skips a level.
  let last = 0;
  for (const n of all(html, /<h([1-6])[ >]/g).map(Number)) {
    if (n > last + 1) fail(f, `heading jumps from h${last} to h${n}`);
    last = n;
  }

  // Images: width, height and a real alt on every one.
  for (const img of html.match(/<img [^>]*>/g) ?? []) {
    for (const a of ["width", "height", "alt"]) if (!new RegExp(` ${a}="[^"]+"`).test(img)) fail(f, `img without ${a}: ${img.slice(0, 80)}`);
  }

  // The CSP allows no inline style and no script. JSON-LD is a data block, not a script the browser runs.
  if (/ style="/.test(html) || /<style/.test(html)) fail(f, "inline style (the CSP blocks it)");
  if (/<script(?! type="application\/ld\+json")/.test(html)) fail(f, "a script that is not JSON-LD");
  if (/ on[a-z]+="/.test(html)) fail(f, "inline event handler");

  // Links: internal ones resolve to a file or an id on the page, external ones carry rel=noopener and https.
  const ids = new Set(all(html, / id="([^"]*)"/g));
  for (const tag of html.match(/<a [^>]*>/g) ?? []) {
    const href = one(tag, /href="([^"]*)"/);
    if (href.startsWith("#")) { if (!ids.has(href.slice(1))) fail(f, `anchor ${href} has no target`); }
    else if (href.startsWith("/")) { if (!existsSync(join(ROOT, href === "/" ? "index.html" : `${href.slice(1)}.html`))) fail(f, `link ${href} has no page`); }
    else if (!href.startsWith("https://")) fail(f, `link ${href}`);
    else if (!/rel="noopener"/.test(tag)) fail(f, `external link without rel=noopener: ${href}`);
  }
  for (const [, text] of html.matchAll(/<a [^>]*>([\s\S]*?)<\/a>/g)) if (/^(click here|here|read more|learn more|more)$/i.test(text.replace(/<[^>]+>/g, "").trim())) fail(f, `vague link text "${text}"`);
  const assets = new Set(all(html, /(\/(?:assets\/[\w./-]+|favicon[\w.-]*|apple-touch-icon\.png|site\.webmanifest))/g));
  for (const a of assets) if (!existsSync(join(ROOT, a))) fail(f, `missing file ${a}`);

  // Structured data.
  let graph = [];
  try { graph = JSON.parse(one(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/))["@graph"]; } catch (e) { fail(f, `JSON-LD does not parse: ${e.message}`); }
  const byType = (t) => graph.filter((n) => n["@type"] === t);
  const need = (node, keys, name) => keys.forEach((k) => node?.[k] ?? fail(f, `${name} lacks ${k}`));
  need(byType("Organization")[0], ["name", "url", "logo"], "Organization");
  need(byType("WebSite")[0], ["name", "url"], "WebSite");
  for (const app of [...byType("SoftwareApplication"), ...byType("MobileApplication")]) {
    need(app, ["name", "operatingSystem", "applicationCategory", "offers", "downloadUrl", "publisher"], app["@type"]);
    if (app.offers?.price !== "0" || !app.offers?.priceCurrency) fail(f, `${app["@type"]} offer`);
  }
  if (byType("SoftwareApplication").length !== 1 || byType("MobileApplication").length !== 1) fail(f, "expected one Windows and one Android application");
  if (!byType("SoftwareApplication")[0]?.softwareVersion) fail(f, "desktop softwareVersion");
  if (byType("MobileApplication")[0]?.softwareVersion) fail(f, "the Android entry must not print a version");
  if (/aggregateRating|"review"/.test(JSON.stringify(graph))) fail(f, "rating or review markup");
  // FAQPage and HowTo mirror the visible page word for word.
  const shownFaq = [...html.matchAll(/<details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map((m) => [m[1], m[2]]);
  const faq = (byType("FAQPage")[0]?.mainEntity ?? []).map((q) => [q.name, q.acceptedAnswer?.text]);
  if (faq.length < 8 || JSON.stringify(faq) !== JSON.stringify(shownFaq)) fail(f, "FAQPage differs from the visible questions");
  const shownSteps = [...html.matchAll(/<li id="step-\d"><span[^>]*>\d<\/span><h3>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p><\/li>/g)].map((m) => [m[1], m[2]]);
  const steps = (byType("HowTo")[0]?.step ?? []).map((s) => [s.name, s.text]);
  if (steps.length !== 3 || JSON.stringify(steps) !== JSON.stringify(shownSteps)) fail(f, "HowTo differs from the visible steps");
}

// Sitemap: exactly the five pages, each with the full alternate set.
const sitemap = read("sitemap.xml");
const locs = all(sitemap, /<loc>([^<]*)<\/loc>/g);
if (JSON.stringify(locs) !== JSON.stringify(Object.keys(PAGES).map(urlOf))) fail("sitemap.xml", `lists ${locs.join(", ")}`);
if ((sitemap.match(/<xhtml:link /g) ?? []).length !== locs.length * (locs.length + 1)) fail("sitemap.xml", "alternate count");
if (!/^<\?xml[^>]*\?>\s*<urlset[^>]*>[\s\S]*<\/urlset>\s*$/.test(sitemap) || (sitemap.match(/<url>/g) ?? []).length !== (sitemap.match(/<\/url>/g) ?? []).length) fail("sitemap.xml", "not well formed");
if (!read("robots.txt").includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) fail("robots.txt", "sitemap line");
JSON.parse(read("site.webmanifest"));
JSON.parse(read("vercel.json"));

// No long dashes in anything a person or a shell reads.
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if ([".html", ".css", ".txt", ".xml", ".json", ".md", ".mjs", ".py", ".webmanifest", ".svg"].includes(extname(p)) && /[\u2013\u2014]/.test(readFileSync(p, "utf8"))) fail(p.slice(ROOT.length + 1), "contains an em or en dash");
  }
})(ROOT);

const cssBytes = statSync(join(ROOT, "assets/css/site.css")).size;
if (cssBytes > 25000) fail("site.css", `${cssBytes} bytes (budget 25000)`);

console.table(rows);
console.log(`site.css ${cssBytes} bytes`);
if (fails.length) { console.error(`\n${fails.length} problem(s):\n` + fails.join("\n")); process.exit(1); }
console.log("all checks passed");
