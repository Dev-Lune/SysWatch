#!/usr/bin/env node
// Checks the generated site. No dependencies. Run after build: node src/check.mjs
// Prints every problem it finds, then exits 1 if there were any.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://syswatch.devlune.in";
const LANGS = ["en", "de", "fr", "es", "ru"];
const GUIDES = ["install", "tailscale", "translate"];
const HOWTO = ["install", "tailscale"];
const KEYS = ["home", ...GUIDES];
const pathOf = (lang, key) => (key === "home" ? (lang === "en" ? "/" : `/${lang}`) : `${lang === "en" ? "" : `/${lang}`}/${key}`);
const fileOf = (path) => (path === "/" ? "index.html" : `${path.slice(1)}.html`);
const urlOf = (lang, key) => ORIGIN + pathOf(lang, key);

const RELEASE = readFileSync(join(ROOT, "src", "build.mjs"), "utf8").match(/const RELEASE = \{ version: "([^"]+)"/)[1];
const fails = [];
const fail = (where, what) => fails.push(`${where}: ${what}`);
const read = (f) => readFileSync(join(ROOT, f), "utf8");
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const text = (s) => decode(s.replace(/<[^>]+>/g, ""));
const one = (html, re) => (html.match(re) ?? [])[1];
const all = (html, re) => [...html.matchAll(re)].map((m) => m[1]);
const ids = (html) => new Set(all(html, / id="([^"]*)"/g));

const rows = [];
const titles = new Map();
const descriptions = new Map();
for (const key of KEYS) for (const lang of LANGS) {
  const f = fileOf(pathOf(lang, key));
  if (!existsSync(join(ROOT, f))) { fail(f, "missing"); continue; }
  const html = read(f);
  const title = decode(one(html, /<title>([^<]*)<\/title>/) ?? "");
  const desc = decode(one(html, /<meta name="description" content="([^"]*)"/) ?? "");
  const canonical = one(html, /<link rel="canonical" href="([^"]*)"/);
  const h1 = all(html, /<h1[ >]([\s\S]*?)<\/h1>/g);
  rows.push({ page: f, title: [...title].length, description: [...desc].length, h1: h1.length, canonical });

  if (one(html, /<html lang="([^"]*)"/) !== lang) fail(f, "html lang");
  if (![...title].length || [...title].length >= 60) fail(f, `title is ${[...title].length} characters (want under 60)`);
  if ([...desc].length < 140 || [...desc].length > 160) fail(f, `description is ${[...desc].length} characters (want 140 to 160)`);
  if (titles.has(title)) fail(f, `same title as ${titles.get(title)}`);
  if (descriptions.has(desc)) fail(f, `same description as ${descriptions.get(desc)}`);
  titles.set(title, f);
  descriptions.set(desc, f);
  if (canonical !== urlOf(lang, key)) fail(f, `canonical ${canonical}`);
  if (one(html, /<meta property="og:url" content="([^"]*)"/) !== canonical) fail(f, "og:url differs from canonical");
  if (h1.length !== 1) fail(f, `${h1.length} h1 elements`);

  // hreflang: every language of the same page plus x-default (English), nothing else.
  const alt = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g)].map((m) => [m[1], m[2]]));
  for (const l of LANGS) if (alt[l] !== urlOf(l, key)) fail(f, `hreflang ${l} is ${alt[l]}`);
  if (alt["x-default"] !== urlOf("en", key)) fail(f, `hreflang x-default is ${alt["x-default"]}`);
  if (Object.keys(alt).length !== LANGS.length + 1) fail(f, "hreflang count");
  // The language switcher points at the same page in each language.
  for (const l of LANGS) if (!html.includes(`<a href="${pathOf(l, key)}" hreflang="${l}"`)) fail(f, `language switcher lacks ${l}`);

  // Heading order never skips a level.
  let last = 0;
  for (const n of all(html, /<h([1-6])[ >]/g).map(Number)) {
    if (n > last + 1) fail(f, `heading jumps from h${last} to h${n}`);
    last = n;
  }

  for (const img of html.match(/<img [^>]*>/g) ?? []) {
    for (const a of ["width", "height"]) if (!new RegExp(` ${a}="[^"]+"`).test(img)) fail(f, `img without ${a}: ${img.slice(0, 80)}`);
    // alt="" is allowed only for the logo, which sits in a link that carries aria-label="SysWatch".
    if (!/ alt="[^"]+"/.test(img) && !(/ alt=""/.test(img) && /\/icon-\d+\.webp/.test(img))) fail(f, `img without alt: ${img.slice(0, 80)}`);
  }

  // The CSP allows no inline style and no script. JSON-LD is a data block, not a script the browser runs.
  if (/ style="/.test(html) || /<style/.test(html)) fail(f, "inline style (the CSP blocks it)");
  if (/<script(?! type="application\/ld\+json")/.test(html)) fail(f, "a script that is not JSON-LD");
  if (/ on[a-z]+="/.test(html)) fail(f, "inline event handler");

  // Links: internal ones resolve to a page (and to an id on it), external ones are https with rel=noopener.
  const here = ids(html);
  for (const tag of html.match(/<a [^>]*>/g) ?? []) {
    const href = one(tag, /href="([^"]*)"/);
    if (href.startsWith("#")) {
      if (!here.has(href.slice(1))) fail(f, `anchor ${href} has no target`);
    } else if (href.startsWith("/")) {
      const [path, hash] = href.split("#");
      const target = fileOf(path);
      if (!existsSync(join(ROOT, target))) fail(f, `link ${href} has no page`);
      else if (hash && !ids(read(target)).has(hash)) fail(f, `link ${href}: no #${hash} on ${target}`);
    } else if (!href.startsWith("https://")) fail(f, `link ${href}`);
    else if (!/rel="noopener"/.test(tag)) fail(f, `external link without rel=noopener: ${href}`);
    // The guides live on this site now: no links to the old copies.
    if (/github\.com\/Dev-Lune\/SysWatch\/blob\/[^"]*\.md|devlune\.in\/download\/syswatch/.test(href)) fail(f, `links to an off-site copy of a guide: ${href}`);
  }
  for (const [, inner] of html.matchAll(/<a [^>]*>([\s\S]*?)<\/a>/g)) if (/^(click here|here|read more|learn more|more)$/i.test(text(inner).trim())) fail(f, `vague link text "${inner}"`);
  for (const a of new Set(all(html, /(\/(?:assets\/[\w./-]+|favicon[\w.-]*|apple-touch-icon\.png|site\.webmanifest))/g))) if (!existsSync(join(ROOT, a))) fail(f, `missing file ${a}`);

  // The only version number a page may print is the release that is out (build.mjs RELEASE):
  // features of an unreleased build can be described, its version cannot.
  for (const v of new Set(html.match(/\b\d+\.\d+\.\d+\b/g) ?? [])) if (v !== RELEASE) fail(f, `mentions version ${v}, but the release is ${RELEASE}`);
  // Each page preloads the display and body fonts for its own script.
  const script = lang === "ru" ? "cyrillic" : "latin";
  for (const font of ["unbounded", "rubik"]) if (!html.includes(`<link rel="preload" href="/assets/fonts/${font}-${script}.woff2"`)) fail(f, `does not preload ${font}-${script}`);

  // Structured data.
  let graph = [];
  try { graph = JSON.parse(one(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/))["@graph"]; } catch (e) { fail(f, `JSON-LD does not parse: ${e.message}`); }
  const byType = (t) => graph.filter((n) => n["@type"] === t);
  const need = (node, keys, name) => keys.forEach((k) => node?.[k] ?? fail(f, `${name} lacks ${k}`));
  need(byType("Organization")[0], ["name", "url", "logo"], "Organization");
  need(byType("WebSite")[0], ["name", "url"], "WebSite");
  need(byType("WebPage")[0], ["name", "url", "inLanguage"], "WebPage");
  if (byType("WebPage")[0]?.url !== canonical) fail(f, "WebPage url differs from canonical");
  if (/aggregateRating|"review"/.test(JSON.stringify(graph))) fail(f, "rating or review markup");

  if (key === "home") {
    for (const app of [...byType("SoftwareApplication"), ...byType("MobileApplication")]) {
      need(app, ["name", "operatingSystem", "applicationCategory", "offers", "downloadUrl", "publisher"], app["@type"]);
      if (app.offers?.price !== "0" || !app.offers?.priceCurrency) fail(f, `${app["@type"]} offer`);
    }
    if (byType("SoftwareApplication").length !== 1 || byType("MobileApplication").length !== 1) fail(f, "expected one Windows and one Android application");
    if (!byType("SoftwareApplication")[0]?.softwareVersion) fail(f, "desktop softwareVersion");
    if (byType("MobileApplication")[0]?.softwareVersion) fail(f, "the Android entry must not print a version");
    // FAQPage and HowTo mirror the visible page word for word.
    const shownFaq = [...html.matchAll(/<details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map((m) => [m[1], m[2]]);
    const faq = (byType("FAQPage")[0]?.mainEntity ?? []).map((q) => [q.name, q.acceptedAnswer?.text]);
    if (faq.length < 8 || JSON.stringify(faq) !== JSON.stringify(shownFaq)) fail(f, "FAQPage differs from the visible questions");
    const shownSteps = [...html.matchAll(/<li id="step-\d"><span[^>]*>\d<\/span><h3>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p><\/li>/g)].map((m) => [m[1], m[2]]);
    const steps = (byType("HowTo")[0]?.step ?? []).map((s) => [s.name, s.text]);
    if (steps.length !== 3 || JSON.stringify(steps) !== JSON.stringify(shownSteps)) fail(f, "HowTo differs from the visible steps");
    continue;
  }

  // Guides: a visible breadcrumb and BreadcrumbList that agree, and HowTo that mirrors every visible step.
  const crumbs = byType("BreadcrumbList")[0]?.itemListElement ?? [];
  const shownCrumbs = [...(one(html, /<nav class="crumbs"[^>]*>([\s\S]*?)<\/nav>/) ?? "").matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => text(m[1]));
  if (crumbs.length !== 2 || crumbs[0].item !== urlOf(lang, "home") || crumbs[1].item !== canonical) fail(f, "BreadcrumbList is not Home > this page");
  if (JSON.stringify(crumbs.map((c) => c.name)) !== JSON.stringify(shownCrumbs)) fail(f, `BreadcrumbList names ${JSON.stringify(crumbs.map((c) => c.name))} differ from the visible ${JSON.stringify(shownCrumbs)}`);
  const howto = byType("HowTo")[0];
  if (!HOWTO.includes(key)) { if (howto) fail(f, "unexpected HowTo"); continue; }
  if (!howto) { fail(f, "missing HowTo"); continue; }
  need(howto, ["name", "step"], "HowTo");
  if (howto.name !== text(h1[0].replace(/^[^>]*>/, ""))) fail(f, "HowTo name differs from the h1");
  const ld = howto.step.flatMap((s) => (s["@type"] === "HowToSection" ? s.itemListElement : [s])).map((s) => [s.url.split("#")[1], s.text]);
  const shown = [...html.matchAll(/<ol class="gsteps">([\s\S]*?)<\/ol>/g)].flatMap((m) => [...m[1].matchAll(/<li id="([\w-]+)"><p>([\s\S]*?)<\/p>/g)].map((x) => [x[1], text(x[2])]));
  if (!shown.length || JSON.stringify(ld) !== JSON.stringify(shown)) fail(f, "HowTo differs from the visible steps");
  for (const s of howto.step) if (s["@type"] === "HowToSection" && !html.includes(`>${s.name}</h2>`)) fail(f, `HowToSection "${s.name}" has no visible heading`);
}

// Sitemap: exactly the expected pages, each with its date.
const sitemap = read("sitemap.xml");
const expected = KEYS.flatMap((key) => LANGS.map((lang) => urlOf(lang, key)));
const locs = all(sitemap, /<loc>([^<]*)<\/loc>/g);
if (JSON.stringify([...locs].sort()) !== JSON.stringify([...expected].sort())) fail("sitemap.xml", `lists ${locs.length} URLs, expected ${expected.length}`);
// No XHTML-namespaced elements: they make browsers draw the sitemap as a page of run-on text.
// The alternates are checked in each page's <head> above.
if (/xhtml/.test(sitemap)) fail("sitemap.xml", "carries xhtml elements; keep it a plain urlset");
if ((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) ?? []).length !== locs.length) fail("sitemap.xml", "every URL needs a lastmod date");
if (!/^<\?xml[^>]*\?>\s*(?:<!--[\s\S]*?-->\s*)?<urlset[^>]*>[\s\S]*<\/urlset>\s*$/.test(sitemap) || (sitemap.match(/<url>/g) ?? []).length !== (sitemap.match(/<\/url>/g) ?? []).length) fail("sitemap.xml", "not well formed");
if (!read("robots.txt").includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) fail("robots.txt", "sitemap line");
for (const k of GUIDES) if (!read("llms.txt").includes(urlOf("en", k))) fail("llms.txt", `does not list ${urlOf("en", k)}`);
JSON.parse(read("site.webmanifest"));
JSON.parse(read("vercel.json"));

// No long dashes in anything a person or a shell reads.
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "node_modules" || name === ".wrangler") continue;
    if (statSync(p).isDirectory()) walk(p);
    else if ([".html", ".css", ".txt", ".xml", ".json", ".jsonc", ".md", ".mjs", ".py", ".webmanifest", ".svg"].includes(extname(p)) && /[\u2013\u2014]/.test(readFileSync(p, "utf8"))) fail(p.slice(ROOT.length + 1), "contains an em or en dash");
  }
})(ROOT);

const cssBytes = statSync(join(ROOT, "assets/css/site.css")).size;
if (cssBytes > 26000) fail("site.css", `${cssBytes} bytes (budget 26000)`);

console.table(rows);
console.log(`${rows.length} pages, ${locs.length} sitemap URLs, site.css ${cssBytes} bytes`);
if (fails.length) { console.error(`\n${fails.length} problem(s):\n` + fails.join("\n")); process.exit(1); }
console.log("all checks passed");
