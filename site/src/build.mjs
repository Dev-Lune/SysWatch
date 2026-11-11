#!/usr/bin/env node
// Generates the home page and the guides in every language, the 404, sitemap, robots,
// llms.txt and the web manifest. Words live in src/content/<lang>.json (home page) and
// src/guides/<lang>.json (guides). No dependencies. Run: node src/build.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// The one thing to change when a new desktop version ships.
const RELEASE = { version: "0.3.0", sizeMb: 3.7, date: "2026-11-11" };

const ORIGIN = "https://syswatch.devlune.in";
const LANGS = ["en", "de", "fr", "es", "ru"]; // first one is the default, served at /
const REPO = "https://github.com/Dev-Lune/SysWatch";
const DEVLUNE = "https://www.devlune.in";
const LINKS = {
  win: `${REPO}/releases/download/v${RELEASE.version}/SysWatch_${RELEASE.version}_x64-setup.exe`,
  play: "https://play.google.com/store/apps/details?id=in.devlune.syswatch",
  releases: `${REPO}/releases`,
  repo: REPO,
  translations: `${REPO}/tree/main/translations`,
  issues: `${REPO}/issues`,
  sponsor: "https://github.com/sponsors/Dev-Lune",
  discord: "https://discord.gg/BXu9qxgaE8",
  devlune: DEVLUNE,
  work: `${DEVLUNE}/work`,
  privacy: `${DEVLUNE}/privacy`,
  terms: `${DEVLUNE}/terms`,
};

// One URL per page and language: / and /de for the home page, /install and /de/install
// for a guide. Each is one .html file (de.html, de/install.html), which Cloudflare's
// auto-trailing-slash and Vercel's cleanUrls both serve without the extension.
const GUIDES = ["install", "tailscale", "translate"];
const HOWTO = new Set(["install", "tailscale"]); // guides whose steps are also HowTo markup
const KEYS = ["home", ...GUIDES];
const prefix = (lang) => (lang === LANGS[0] ? "" : `/${lang}`);
const pathOf = (lang, key) => (key === "home" ? prefix(lang) || "/" : `${prefix(lang)}/${key}`);
const abs = (path) => ORIGIN + path;
const fileOf = (path) => (path === "/" ? "index.html" : `${path.slice(1)}.html`);
const url = (t) => abs(pathOf(t.lang, "home"));

const SRC = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SRC, "..");
const today = new Date().toISOString().slice(0, 10);
const read = (dir, l) => JSON.parse(readFileSync(join(SRC, dir, `${l}.json`), "utf8"));
const content = Object.fromEntries(LANGS.map((l) => [l, read("content", l)]));
const guides = Object.fromEntries(LANGS.map((l) => [l, read("guides", l)]));

const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const plain = (s) => String(s).replace(/<[^>]+>/g, "");
const decode = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const text = (s) => decode(plain(s));
const og = (lang) => `/assets/og/og-${existsSync(join(ROOT, "assets", "og", `og-${lang}.jpg`)) ? lang : LANGS[0]}.jpg`;

// Typographic apostrophes, and non-breaking spaces where a line must not break:
// before a unit, and around French punctuation. Text inside <code> is left exactly as written.
function typo(str, lang) {
  return str.split(/(<code>[\s\S]*?<\/code>)/).map((s, i) => (i % 2 ? s : typoText(s, lang))).join("");
}
function typoText(s, lang) {
  s = s.replace(/(\p{L})'(?=\p{L})/gu, "$1\u2019");
  s = s.replace(/(\d) (%|MB|GB|Mo|МБ)/g, "$1\u00a0$2");
  return lang === "fr" ? s.replace(/ ([:;?!»])/g, "\u00a0$1").replace(/« /g, "«\u00a0") : s;
}

// {win}, {version}, {size}... in any content string, at any depth. {guide}, {tailscale} and
// {translate} are this language's guide pages. Code samples (key "code") stay untouched.
function fill(node, lang) {
  if (typeof node === "string") {
    const size = `${new Intl.NumberFormat(lang).format(RELEASE.sizeMb)}\u00a0${content[lang].unit}`;
    const links = { ...LINKS, guide: pathOf(lang, "install"), tailscale: pathOf(lang, "tailscale"), translate: pathOf(lang, "translate") };
    return typo(node.replace(/\{(\w+)\}/g, (m, k) => (k === "version" ? RELEASE.version : k === "size" ? size : links[k] ?? m)), lang);
  }
  if (Array.isArray(node)) return node.map((n) => fill(n, lang));
  if (node && typeof node === "object") return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, k === "code" ? v : fill(v, lang)]));
  return node;
}

// Every /assets URL except fonts gets ?v=<content hash>, because /assets is cached for a year.
// Fonts are left alone: their preload URL has to match the URL in site.css byte for byte.
const hashes = new Map();
function versioned(html) {
  return html.replace(/\/assets\/(?:css|img|og)\/[\w.-]+\.(?:css|avif|webp|png|jpg|svg)/g, (p) => {
    if (!hashes.has(p)) hashes.set(p, createHash("sha256").update(readFileSync(join(ROOT, p))).digest("hex").slice(0, 8));
    return `${p}?v=${hashes.get(p)}`;
  });
}
// rel="noopener" on every link that leaves the site.
const external = (html) => html.replace(/<a ([^>]*href="https?:\/\/[^>]*)>/g, (m, inner) => (/\brel=/.test(inner) ? m : `<a ${inner} rel="noopener">`));

function picture(name, widths, w, h, alt, sizes, eager = false) {
  const set = (ext) => widths.map((x) => `/assets/img/${name}-${x}.${ext} ${x}w`).join(", ");
  return `<picture><source type="image/avif" srcset="${set("avif")}" sizes="${sizes}"><source type="image/webp" srcset="${set("webp")}" sizes="${sizes}"><img src="/assets/img/${name}-${widths[0]}.webp" width="${w}" height="${h}" alt="${attr(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}

// Phosphor icons (MIT, phosphoricons.com), regular weight, one file each in src/icons.
const icon = (n) =>
  readFileSync(join(SRC, "icons", `${n}.svg`), "utf8").trim().replace("<svg ", '<svg class="ico" aria-hidden="true" focusable="false" width="24" height="24" ');
const ic = (n) => `<span class="ic">${icon(n)}</span>`;
const logo = '<img src="/assets/img/icon-64.webp" srcset="/assets/img/icon-64.webp 2x, /assets/img/icon-96.webp 3x" width="32" height="32" alt="">';
const wordmark = '<span translate="no">SysWatch</span>';
// "Free. No ads. No account." becomes three chips.
const chips = (s) => s.split(/(?<=\.)\s+/).map((x) => x.replace(/\.$/, ""));

// ---- Structured data ------------------------------------------------------------------

const ORG = {
  "@type": "Organization",
  "@id": "https://devlune.in/#studio",
  name: "DevLune",
  url: DEVLUNE,
  logo: `${DEVLUNE}/app/icon-512.png`,
  address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressCountry: "IN" },
  sameAs: ["https://github.com/Dev-Lune", LINKS.discord],
};
const publisher = { "@id": ORG["@id"] };
const WEBSITE = { "@type": "WebSite", "@id": `${ORIGIN}/#website`, url: `${ORIGIN}/`, name: "SysWatch", inLanguage: LANGS, publisher };
// "<" is escaped so no text can close the script element early.
const ldScript = (graph) => `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;

function homeLd(t) {
  const page = url(t);
  const offer = { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" };
  const image = abs(og(t.lang));
  return ldScript([
    ORG,
    WEBSITE,
    {
      "@type": "WebPage",
      "@id": `${page}#webpage`,
      url: page,
      name: t.title,
      description: t.description,
      inLanguage: t.lang,
      isPartOf: { "@id": WEBSITE["@id"] },
      about: { "@id": `${ORIGIN}/#windows-app` },
      primaryImageOfPage: image,
      dateModified: today,
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${ORIGIN}/#windows-app`,
      name: "SysWatch",
      description: t.description,
      url: page,
      image,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Windows 10, Windows 11",
      processorRequirements: "x64",
      softwareVersion: RELEASE.version,
      datePublished: RELEASE.date,
      downloadUrl: LINKS.win,
      fileSize: `${RELEASE.sizeMb}MB`,
      releaseNotes: LINKS.releases,
      featureList: t.features,
      isAccessibleForFree: true,
      offers: offer,
      publisher,
      author: publisher,
    },
    {
      "@type": "MobileApplication",
      "@id": `${ORIGIN}/#android-app`,
      name: "SysWatch",
      description: t.description,
      url: page,
      image,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Android 7.0",
      installUrl: LINKS.play,
      downloadUrl: LINKS.play,
      inLanguage: LANGS,
      featureList: t.features,
      isAccessibleForFree: true,
      offers: offer,
      publisher,
      author: publisher,
    },
    {
      "@type": "HowTo",
      "@id": `${page}#howto`,
      name: t.setup.howto,
      description: t.setup.lead,
      inLanguage: t.lang,
      step: t.setup.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.t, text: s.d, url: `${page}#step-${i + 1}` })),
    },
    {
      "@type": "FAQPage",
      "@id": `${page}#faq`,
      inLanguage: t.lang,
      mainEntity: t.faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: external(f.a) } })),
    },
  ]);
}

const stepOf = (s) => (typeof s === "string" ? { d: s } : s);

function guideLd(t, key) {
  const g = t.g.pages[key];
  const page = abs(pathOf(t.lang, key));
  const graph = [
    ORG,
    WEBSITE,
    {
      "@type": "WebPage",
      "@id": `${page}#webpage`,
      url: page,
      name: g.title,
      description: g.description,
      inLanguage: t.lang,
      isPartOf: { "@id": WEBSITE["@id"] },
      about: { "@id": `${ORIGIN}/#windows-app` },
      breadcrumb: { "@id": `${page}#breadcrumb` },
      primaryImageOfPage: abs(og(t.lang)),
      dateModified: today,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${page}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "SysWatch", item: url(t) },
        { "@type": "ListItem", position: 2, name: text(g.crumb), item: page },
      ],
    },
  ];
  if (HOWTO.has(key)) {
    // One HowToSection per visible list of steps, named after the heading above it.
    const sections = [];
    let heading = "";
    for (const b of g.blocks) {
      if (b.h2) heading = text(b.h2);
      if (b.steps) sections.push({ name: heading, steps: b.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: text(stepOf(s).d), url: `${page}#${b.id}-${i + 1}` })) });
    }
    graph.push({
      "@type": "HowTo",
      "@id": `${page}#howto`,
      name: text(g.h1),
      description: text(g.lead),
      inLanguage: t.lang,
      step: sections.length === 1 ? sections[0].steps : sections.map((s, i) => ({ "@type": "HowToSection", position: i + 1, name: s.name, itemListElement: s.steps })),
    });
  }
  return ldScript(graph);
}

// ---- Shared page parts ----------------------------------------------------------------

function head(t, key, title, description, ld) {
  const script = t.lang === "ru" ? "cyrillic" : "latin";
  const fonts = [`unbounded-${script}`, `rubik-${script}`];
  const image = abs(og(t.lang));
  const self = abs(pathOf(t.lang, key));
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${attr(title)}</title>
<meta name="description" content="${attr(description)}">
<link rel="canonical" href="${self}">
${LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${abs(pathOf(l, key))}">`).join("\n")}
<link rel="alternate" hreflang="x-default" href="${abs(pathOf(LANGS[0], key))}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="theme-color" content="#2B44D6">
<meta name="color-scheme" content="light">
${fonts.map((f) => `<link rel="preload" href="/assets/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join("\n")}
<link rel="stylesheet" href="/assets/css/site.css">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
<link rel="manifest" href="/site.webmanifest">
<meta name="application-name" content="SysWatch">
<meta name="apple-mobile-web-app-title" content="SysWatch">
<meta name="author" content="DevLune">
<meta property="og:type" content="website">
<meta property="og:site_name" content="SysWatch">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${self}">
<meta property="og:image" content="${image}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${attr(t.ogAlt)}">
<meta property="og:locale" content="${t.locale}">
${LANGS.filter((l) => l !== t.lang).map((l) => `<meta property="og:locale:alternate" content="${content[l].locale}">`).join("\n")}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(title)}">
<meta name="twitter:description" content="${attr(description)}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${attr(t.ogAlt)}">
${ld}`;
}

// Links to the same page in every language.
const langLinks = (key, current, all) =>
  all.map((o) => `<li><a href="${pathOf(o.lang, key)}" hreflang="${o.lang}" lang="${o.lang}"${o.lang === current ? ' aria-current="page"' : ""}>${o.name}</a></li>`).join("\n");

function header(t, key, all) {
  const home = pathOf(t.lang, "home");
  const to = (id) => (key === "home" ? `#${id}` : `${home}#${id}`);
  return `<a class="skip" href="#main">${t.skip}</a>
<header class="top">
<div class="wrap top-in">
<a class="brand" href="${home}" aria-label="SysWatch">${logo}${wordmark}</a>
<nav class="nav" aria-label="${attr(t.nav.main)}">
<a href="${to("see")}">${t.nav.see}</a>
<a href="${to("connect")}">${t.nav.connect}</a>
<a href="${to("setup")}">${t.nav.setup}</a>
<a href="${to("faq")}">${t.nav.faq}</a>
</nav>
<details class="drop guides">
<summary>${t.g.nav.label}${icon("caret-down")}</summary>
<ul>
${GUIDES.map((k) => `<li><a href="${pathOf(t.lang, k)}"${k === key ? ' aria-current="page"' : ""}>${t.g.nav[k]}</a></li>`).join("\n")}
</ul>
</details>
<details class="drop lang">
<summary aria-label="${t.lang.toUpperCase()}: ${attr(t.nav.language)}, ${attr(t.name)}">${t.lang.toUpperCase()}${icon("caret-down")}</summary>
<ul>
${langLinks(key, t.lang, all)}
</ul>
</details>
<a class="btn btn-main btn-small" href="${to("setup")}">${t.nav.download}</a>
</div>
</header>`;
}

function footer(t, key, all) {
  return `<footer class="bottom">
<div class="wrap bottom-in">
<div class="bottom-brand">
<p class="brand">${wordmark}</p>
<p>${t.footer.made}</p>
<nav aria-label="${attr(t.nav.language)}">
<ul class="langs">
${langLinks(key, t.lang, all)}
</ul>
</nav>
</div>
<nav class="bottom-col" aria-labelledby="f-get">
<h2 id="f-get">${t.footer.get}</h2>
<ul>
<li><a href="${LINKS.win}">${t.hero.win}</a></li>
<li><a href="${LINKS.play}">${t.hero.play}</a></li>
<li><a href="${LINKS.releases}">${t.setup.releases}</a></li>
<li><a href="${LINKS.sponsor}">${t.footer.sponsor}</a></li>
</ul>
</nav>
<nav class="bottom-col" aria-labelledby="f-help">
<h2 id="f-help">${t.footer.help}</h2>
<ul>
${GUIDES.map((k) => `<li><a href="${pathOf(t.lang, k)}"${k === key ? ' aria-current="page"' : ""}>${t.g.nav[k]}</a></li>`).join("\n")}
<li><a href="${LINKS.issues}">${t.footer.issues}</a></li>
<li><a href="${LINKS.discord}">${t.footer.discord}</a></li>
</ul>
</nav>
<nav class="bottom-col" aria-labelledby="f-studio">
<h2 id="f-studio">${t.footer.studio}</h2>
<ul>
<li><a href="${LINKS.devlune}">${t.footer.site}</a></li>
<li><a href="${LINKS.work}">${t.footer.work}</a></li>
<li><a href="${LINKS.privacy}">${t.privacy.policy}</a></li>
<li><a href="${LINKS.terms}">${t.privacy.terms}</a></li>
</ul>
</nav>
</div>
<div class="wrap">
<p class="legal">© ${today.slice(0, 4)} DevLune. ${t.footer.legal}</p>
</div>
</footer>`;
}

const shell = (t, key, all, headHtml, main) => `<!doctype html>
<html lang="${t.lang}" dir="ltr">
<head>
${headHtml}
</head>
<body>
${header(t, key, all)}

${main}

${footer(t, key, all)}
</body>
</html>
`;

const downloadButtons = (t) => `<div class="actions">
<a class="btn btn-main" href="${LINKS.win}">${icon("windows-logo-fill")}<span>${t.hero.win}</span></a>
<a class="btn btn-alt" href="${LINKS.play}">${icon("google-play-logo-fill")}<span>${t.hero.play}</span></a>
</div>`;
const meta = (t) => `<p class="meta">${t.hero.meta}<br>${t.hero.meta2}</p>`;
const secHead = (id, s, lead = s.lead) => `<div class="sec-head">
<h2 id="${id}-h">${s.h2}</h2>
${lead ? `<p class="lead">${lead}</p>\n` : ""}</div>`;
const ticks = (list) => `<ul class="ticks">\n${list.map((p) => `<li>${p}</li>`).join("\n")}\n</ul>`;
const tiles = (cells, icons, cls = "tiles") => `<div class="${cls}">\n${cells.map((c, i) => `<div class="tile">${ic(icons[i])}<h3>${c.t}</h3><p>${c.d}</p></div>`).join("\n")}\n</div>`;
// Art face names are never translated; music face names are, as in the app.
const phoneFaces = (faces, names, keep) => `<div class="faces">\n${faces.map((f, i) => `<figure><div class="phone">${picture(names[i], [360, 720], 360, 760, f.alt, "(min-width: 1000px) 220px, 30vw")}</div><figcaption${keep ? ' translate="no"' : ""}>${f.t}</figcaption></figure>`).join("\n")}\n</div>`;

// ---- Home page ------------------------------------------------------------------------

function homePage(t, all) {
  const shots = ["overview", "alerts", "settings", "gallery"];
  const main = `<main id="main">
<section class="hero" aria-labelledby="hero-h">
<div class="wrap hero-in">
<div class="hero-copy">
<p class="kicker">${t.hero.kicker}</p>
<h1 id="hero-h">${t.hero.h1}</h1>
<p class="lead">${t.hero.lead}</p>
${downloadButtons(t)}
${meta(t)}
<ul class="assure">
${chips(t.hero.reassure).map((r) => `<li>${r}</li>`).join("\n")}
</ul>
</div>
<div class="hero-art">
<i class="blob blob-1" aria-hidden="true"></i><i class="blob blob-2" aria-hidden="true"></i>
<div class="phone ph-1">${picture("overview", [360, 720], 360, 760, t.see.items[0].alt, "(min-width: 1000px) 260px, 46vw", true)}</div>
<div class="phone ph-2">${picture("face-poster", [360, 720], 360, 760, t.playing.faces[0].alt, "(min-width: 1000px) 220px, 40vw")}</div>
</div>
</div>
</section>

<div class="stats-band">
<div class="wrap">
<ul class="stats">
${t.stats.map(([n, l]) => `<li><b>${n}</b><span>${l}</span></li>`).join("\n")}
</ul>
</div>
</div>

<section class="sec" id="see" aria-labelledby="see-h">
<div class="wrap">
${secHead("see", t.see)}
<div class="row4">
${t.see.items.map((it, i) => `<figure class="pop"><div class="phone">${picture(shots[i], [360, 720], 360, 760, it.alt, "(min-width: 1000px) 260px, 44vw")}</div><figcaption><b>${it.t}</b>${it.d}</figcaption></figure>`).join("\n")}
</div>
</div>
</section>

<section class="sec" id="alerts" aria-labelledby="alerts-h">
<div class="wrap">
${secHead("alerts", t.alerts)}
<div class="say" aria-hidden="true">
<p>${t.alerts.rule1}</p>
<p>${t.alerts.rule2}</p>
<span>${icon("timer")}${t.alerts.quiet}</span>
</div>
${ticks(t.alerts.points)}
</div>
</section>

<section class="sec" id="look" aria-labelledby="look-h">
<div class="wrap">
${secHead("look", t.look)}
<div class="look">
<figure class="look-fig"><div class="tablet">${picture("landscape-light", [720, 1440], 720, 300, t.look.alt, "(min-width: 1000px) 640px, 90vw")}</div><figcaption>${t.look.cap}</figcaption></figure>
${tiles(t.look.cells, ["palette", "moon", "squares-four", "list-numbers"])}
</div>
</div>
</section>

<section class="sec sec-blue" id="standby" aria-labelledby="standby-h">
<div class="wrap">
${secHead("standby", t.standby)}
${phoneFaces(t.standby.faces, ["face-ink", "face-bauhaus", "face-blocks"], true)}
${ticks(t.standby.points)}
</div>
</section>

<section class="sec" id="playing" aria-labelledby="playing-h">
<div class="wrap">
<div class="playing">
<div>
${secHead("playing", t.playing)}
${ticks(t.playing.points)}
<p class="only">${t.playing.only}</p>
</div>
${phoneFaces(t.playing.faces, ["face-poster", "face-vinyl", "face-glossy"], false)}
</div>
</div>
</section>

<section class="sec" id="pc" aria-labelledby="pc-h">
<div class="wrap">
${secHead("pc", t.pc)}
${tiles(t.pc.cells, ["feather", "translate", "cloud"], "tiles tiles-3")}
</div>
</section>

<section class="sec" id="connect" aria-labelledby="connect-h">
<div class="wrap">
${secHead("connect", t.connect)}
<div class="modes">
${t.connect.modes.map((m, i) => `<article class="mode">
${ic(["wifi-high", "cloud", "lock-key"][i])}
<p class="tag">${m.tag}</p>
<h3>${m.name}</h3>
<dl>
${m.vals.map((v, j) => `<div><dt>${t.connect.rows[j]}</dt><dd>${v}</dd></div>`).join("\n")}
</dl>
<p class="note">${m.note}${i === 2 ? ` <a href="${pathOf(t.lang, "tailscale")}">${t.connect.guide}</a>` : ""}</p>
</article>`).join("\n")}
</div>
<p class="foot">${t.connect.foot}</p>
</div>
</section>

<section class="sec" id="setup" aria-labelledby="setup-h">
<div class="wrap">
${secHead("setup", t.setup)}
<ol class="steps">
${t.setup.steps.map((s, i) => `<li id="step-${i + 1}"><span class="step-n" aria-hidden="true">${i + 1}</span><h3>${s.t}</h3><p>${s.d}</p></li>`).join("\n")}
</ol>
${downloadButtons(t)}
${meta(t)}
<p class="more"><a href="${pathOf(t.lang, "install")}">${t.setup.guide}</a><a href="${LINKS.releases}">${t.setup.releases}</a></p>
</div>
</section>

<section class="sec" id="privacy" aria-labelledby="privacy-h">
<div class="wrap">
${secHead("privacy", t.privacy, "")}
${tiles(t.privacy.items, ["user-minus", "eye", "wifi-high", "cloud", "shield-check", "browser"])}
<p class="more"><a href="${LINKS.privacy}">${t.privacy.policy}</a><a href="${LINKS.terms}">${t.privacy.terms}</a></p>
</div>
</section>

<section class="sec" id="faq" aria-labelledby="faq-h">
<div class="wrap">
${secHead("faq", t.faq, "")}
<div class="faq">
${t.faq.items.map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join("\n")}
</div>
</div>
</section>

<section class="sec" id="translate" aria-labelledby="translate-h">
<div class="wrap">
<div class="panel">
${ic("translate")}
<h2 id="translate-h">${t.translate.h2}</h2>
<p>${t.translate.p}</p>
<p class="actions"><a class="btn btn-white" href="${LINKS.translations}">${t.translate.cta}</a><a class="btn btn-ghost" href="${pathOf(t.lang, "translate")}">${t.translate.guide}</a></p>
</div>
</div>
</section>
</main>`;
  return shell(t, "home", all, head(t, "home", t.title, t.description, homeLd(t)), main);
}

// ---- Guide pages ----------------------------------------------------------------------

const pre = (code) => `<pre tabindex="0"><code>${esc(code)}</code></pre>`;

function table(T) {
  return `<div class="table"><table>
<thead><tr>${T.head.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead>
<tbody>
${T.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td data-label="${attr(text(T.head[i]))}">${c}</td>`)).join("")}</tr>`).join("\n")}
</tbody>
</table></div>`;
}

function block(b, t) {
  if (b.h2) return `<h2 id="${b.id}">${b.h2}</h2>`;
  if (b.h3) return `<h3>${b.h3}</h3>`;
  if (b.p) return `<p>${b.p}</p>`;
  if (b.note) return `<p class="note">${b.note}</p>`;
  if (b.list) return ticks(b.list);
  if (b.code) return pre(b.code);
  if (b.table) return table(b.table);
  if (b.actions) return downloadButtons(t);
  if (b.steps) {
    return `<ol class="gsteps">\n${b.steps.map((s, i) => {
      const x = stepOf(s);
      return `<li id="${b.id}-${i + 1}"><p>${x.d}</p>${x.code ? pre(x.code) : ""}</li>`;
    }).join("\n")}\n</ol>`;
  }
  throw new Error(`unknown block ${JSON.stringify(b).slice(0, 80)}`);
}

function guidePage(t, key, all) {
  const g = t.g.pages[key];
  const sections = g.blocks.filter((b) => b.h2);
  const main = `<main id="main" class="guide">
<div class="ghero">
<div class="wrap">
<nav class="crumbs" aria-label="${attr(t.g.crumbs)}">
<ol><li><a href="${pathOf(t.lang, "home")}">SysWatch</a></li><li aria-current="page">${g.crumb}</li></ol>
</nav>
<header class="guide-head">
<p class="kicker">${g.kicker}</p>
<h1>${g.h1}</h1>
<p class="lead">${g.lead}</p>
</header>
</div>
</div>
<div class="wrap">
<div class="guide-in">
<article class="prose">
${g.blocks.map((b) => block(b, t)).join("\n")}
</article>
<nav class="toc" aria-labelledby="toc-h">
<p id="toc-h">${t.g.toc}</p>
<ol>
${sections.map((b) => `<li><a href="#${b.id}">${b.h2}</a></li>`).join("\n")}
</ol>
</nav>
</div>
<nav class="guide-more" aria-labelledby="more-h">
<h2 id="more-h">${t.g.more}</h2>
<ul>
${GUIDES.filter((k) => k !== key).map((k) => `<li><a href="${pathOf(t.lang, k)}"><b>${t.g.pages[k].h1}</b><span>${t.g.pages[k].description}</span></a></li>`).join("\n")}
</ul>
</nav>
</div>
</main>`;
  return shell(t, key, all, head(t, key, g.title, g.description, guideLd(t, key)), main);
}

function notFound(all) {
  const t = all[0];
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found | SysWatch</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#2B44D6">
<meta name="color-scheme" content="light">
<link rel="preload" href="/assets/fonts/unbounded-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
</head>
<body>
<a class="skip" href="#main">${t.skip}</a>
<header class="top"><div class="wrap top-in"><a class="brand" href="/" aria-label="SysWatch">${logo}${wordmark}</a></div></header>
<main id="main" class="lost">
<div class="ghero">
<div class="wrap"><div class="guide-head">
<p class="ghero-n" aria-hidden="true">404</p>
<h1>This page is not here.</h1>
<p class="lead">The address may be mistyped, or the page has moved. Try the home page, in any of five languages, or one of the guides.</p>
</div></div>
</div>
<div class="wrap">
<ul class="langs">
${all.map((o) => `<li><a href="${pathOf(o.lang, "home")}" hreflang="${o.lang}" lang="${o.lang}">SysWatch, ${o.name}</a></li>`).join("\n")}
</ul>
<ul class="langs">
${GUIDES.map((k) => `<li><a href="${pathOf(t.lang, k)}">${t.g.nav[k]}</a></li>`).join("\n")}
</ul>
</div>
</main>
</body>
</html>
`;
}

// ---- Write everything -----------------------------------------------------------------

const all = LANGS.map((l) => ({ ...fill(content[l], l), g: fill(guides[l], l) }));
const out = (name, body) => {
  mkdirSync(dirname(join(ROOT, name)), { recursive: true });
  writeFileSync(join(ROOT, name), body);
};
for (const t of all) {
  out(fileOf(pathOf(t.lang, "home")), versioned(external(homePage(t, all))));
  for (const key of GUIDES) out(fileOf(pathOf(t.lang, key)), versioned(external(guidePage(t, key, all))));
}
out("404.html", versioned(external(notFound(all))));

// Plain sitemap: the language alternates are in every page's <head>, which is where search
// engines read them. Putting xhtml:link elements here made browsers render the file as a web
// page, a run-on wall of addresses and dates, in place of the XML tree.
out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<!-- SysWatch: ${KEYS.length * LANGS.length} pages, ${LANGS.length} languages. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${KEYS.flatMap((key) => LANGS.map((lang) => `  <url>
    <loc>${abs(pathOf(lang, key))}</loc>
    <lastmod>${today}</lastmod>
  </url>`)).join("\n")}
</urlset>
`);

out("robots.txt", `User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`);

out("site.webmanifest", JSON.stringify({
  name: "SysWatch",
  short_name: "SysWatch",
  description: plain(all[0].description),
  start_url: "/",
  display: "browser",
  background_color: "#FFFFFF",
  theme_color: "#2B44D6",
  icons: [192, 512].map((s) => ({ src: `/assets/img/icon-${s}.png`, sizes: `${s}x${s}`, type: "image/png" })),
}, null, 2) + "\n");

const en = all[0];
out("llms.txt", `# SysWatch

> ${en.description}

SysWatch is two free apps made by DevLune, a software studio in Hyderabad, India. A small desktop app runs on a Windows PC and reads its hardware. An Android app shows those readings live and sends a notification when one crosses a limit the user set. There are no ads and no account. It is read only, except play, pause and skip for media in Local and Tailscale mode, when the user allows it on the PC.

## Key facts

- Readings: CPU, GPU, memory, network, storage, battery and uptime, each with a history graph. Temperatures are shown when the PC reports them.
- Alerts: rules written as sentences (for example "CPU load above 90%"), each limit drawn as a red line on its gauge.
- Standby: 29 always-on faces for a phone on a desk stand (16 instrument faces, 8 art faces, 5 music faces), dimmed when idle or always bright, framed or full screen, and a home screen widget in four looks.
- Now playing: the phone shows what the PC is playing, with its cover, on Overview and in five music standby faces (Poster, Ambient, Glossy, Vinyl, Quiet). The phone can play, pause and skip media on the PC; this is on by default and is switched off in the PC app's Settings. Local and Tailscale mode only, never through the cloud.
- Look: a chosen accent colour, light, dark or true black theme, five Overview layouts (Bridge, Gauges, Strip charts, Ledger, Focus).
- Three ways to connect: Local (same Wi-Fi, instant, readings stay on the network), Cloud by DevLune (works from anywhere, nothing to set up, at most one update every 2 seconds), Tailscale (instant and private from anywhere).
- Desktop app: Windows 10 and 11, 64-bit, version ${RELEASE.version}, about ${RELEASE.sizeMb} MB. Hidden to the tray it uses about 55 to 73 MB of memory and under 0.5% of one CPU core; Lightweight mode samples every 3 seconds and sends every 5 seconds in Cloud mode. The installer is not code signed, so Windows SmartScreen shows a warning (More info, then Run anyway).
- Phone app: Android 7.0 and newer, on Google Play.
- App languages: both apps are in English, German, French, Spanish and Russian; the Windows app starts in the Windows language and can be changed in setup or Settings. Community translations are welcome: one text file per language covers both apps, and a merged translation reaches the apps without an update.
- Price: free on both sides.

## Guides

Each guide is also in German, French, Spanish and Russian, under /de, /fr, /es and /ru.

${GUIDES.map((k) => `- [${text(en.g.pages[k].h1)}](${abs(pathOf("en", k))}): ${text(en.g.pages[k].description)}`).join("\n")}

## Links

- [Website](${ORIGIN}/): this site, also in ${all.slice(1).map((t) => `[${t.name}](${url(t)})`).join(", ")}
- [Download for Windows](${LINKS.win})
- [SysWatch on Google Play](${LINKS.play})
- [All releases and changelog](${LINKS.releases})
- [Translations folder](${LINKS.translations})
- [Privacy policy](${LINKS.privacy}) and [terms](${LINKS.terms})
- [DevLune](${LINKS.devlune})
`);

console.log(`built ${all.length * KEYS.length} pages (${KEYS.join(", ")} in ${LANGS.join(", ")}), 404, sitemap, robots, llms.txt, manifest (${hashes.size} versioned assets)`);
