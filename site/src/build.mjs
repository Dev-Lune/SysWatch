#!/usr/bin/env node
// Generates the language pages, 404, sitemap, robots, llms.txt and the web manifest
// from one template and src/content/<lang>.json. No dependencies. Run: node src/build.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// The one thing to change when a new desktop version ships.
const RELEASE = { version: "0.2.0", sizeMb: 3.5, date: "2026-11-10" };

const ORIGIN = "https://syswatch.devlune.in";
const LANGS = ["en", "de", "fr", "es", "ru"]; // first one is the default, served at /
const REPO = "https://github.com/Dev-Lune/SysWatch";
const DEVLUNE = "https://www.devlune.in";
const LINKS = {
  win: `${REPO}/releases/download/v${RELEASE.version}/SysWatch_${RELEASE.version}_x64-setup.exe`,
  play: "https://play.google.com/store/apps/details?id=in.devlune.syswatch",
  releases: `${REPO}/releases`,
  translations: `${REPO}/tree/main/translations`,
  tailscale: `${REPO}/blob/main/docs/TAILSCALE.md`,
  issues: `${REPO}/issues`,
  sponsor: "https://github.com/sponsors/Dev-Lune",
  discord: "https://discord.gg/BXu9qxgaE8",
  devlune: DEVLUNE,
  work: `${DEVLUNE}/work`,
  guide: `${DEVLUNE}/download/syswatch`,
  privacy: `${DEVLUNE}/privacy`,
  terms: `${DEVLUNE}/terms`,
};

const SRC = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SRC, "..");
const today = new Date().toISOString().slice(0, 10);
const content = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(readFileSync(join(SRC, "content", `${l}.json`), "utf8"))]));

const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const plain = (s) => String(s).replace(/<[^>]+>/g, "");
const url = (t) => ORIGIN + (t.path === "/" ? "/" : t.path);
const file = (t) => (t.path === "/" ? "index.html" : `${t.path.slice(1)}.html`);
const og = (t) => `/assets/og/og-${existsSync(join(ROOT, "assets", "og", `og-${t.lang}.jpg`)) ? t.lang : LANGS[0]}.jpg`;

// Typographic apostrophes, and non-breaking spaces where a line must not break:
// before a unit, and around French punctuation.
function typo(s, lang) {
  s = s.replace(/(\p{L})'(?=\p{L})/gu, "$1\u2019");
  s = s.replace(/(\d) (%|MB|GB|Mo|МБ)/g, "$1\u00a0$2");
  return lang === "fr" ? s.replace(/ ([:;?!»])/g, "\u00a0$1").replace(/« /g, "«\u00a0") : s;
}

// {win}, {version}, {size}... in any content string, at any depth.
function fill(node, lang) {
  if (typeof node === "string") {
    const size = `${new Intl.NumberFormat(lang).format(RELEASE.sizeMb)}\u00a0${content[lang].unit}`;
    return typo(node.replace(/\{(\w+)\}/g, (m, k) => (k === "version" ? RELEASE.version : k === "size" ? size : LINKS[k] ?? m)), lang);
  }
  if (Array.isArray(node)) return node.map((n) => fill(n, lang));
  if (node && typeof node === "object") return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, fill(v, lang)]));
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

function picture(name, widths, w, h, alt, sizes) {
  const set = (ext) => widths.map((x) => `/assets/img/${name}-${x}.${ext} ${x}w`).join(", ");
  return `<picture><source type="image/avif" srcset="${set("avif")}" sizes="${sizes}"><source type="image/webp" srcset="${set("webp")}" sizes="${sizes}"><img src="/assets/img/${name}-${widths[0]}.webp" width="${w}" height="${h}" alt="${attr(alt)}" loading="lazy" decoding="async"></picture>`;
}

// The hero instrument: 24 CPU readings, one every 2 s. The same numbers are baked into
// site.css (the figure strip and the bar, arc and hot keyframes). After changing them,
// `node src/build.mjs --keyframes` prints the lines to paste there.
const READINGS = [61, 58, 66, 73, 79, 84, 88, 93, 86, 78, 71, 64, 57, 52, 46, 41, 38, 44, 49, 45, 40, 42, 47, 55];
const LIMIT = 90;
const y = (v) => (150 - v * 1.4).toFixed(1).replace(/\.0$/, "");
const tracePoints = [...READINGS, ...READINGS, READINGS[0]].map((v, i) => `${i * 20},${y(v)}`);
const traceLine = `M${tracePoints.join("L")}`;
const traceFill = `${traceLine}L960,160L0,160Z`;

if (process.argv.includes("--keyframes")) {
  const at = (i) => `${+((i * 100) / READINGS.length).toFixed(3)}%`;
  const frames = (fn) => [...READINGS, READINGS[0]].map((v, i) => `${at(i)}{${fn(v)}}`).join("");
  console.log(`.inst-num span::after{content:"${READINGS.join("\\" + "A ")}"}`);
  console.log(`@keyframes bar{${frames((v) => `transform:scaleX(${v / 100})`)}}`);
  console.log(`@keyframes arc{${frames((v) => `stroke-dasharray:${+(v * 1.225).toFixed(1)} 163.4`)}}`);
  console.log(`@keyframes hot{${READINGS.map((v, i) => `${at(i)}{color:var(--${v > LIMIT ? "alert" : "ink"})}`).join("")}}`);
  process.exit(0);
}

const ICON = {
  win: '<svg class="ico" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M2 3.5 9 2.6v6.9H2zM10 2.4 18 1.3v8.2h-8zM2 10.5h7v6.9l-7-.9zM10 10.5h8v8.2l-8-1.1z"/></svg>',
  play: '<svg class="ico" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M4.2 1.8c-.5-.3-1.2.1-1.2.7v15c0 .6.7 1 1.2.7l13-7.5c.5-.3.5-1.1 0-1.4z"/></svg>',
  out: '<svg class="ico ico-out" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M5 3h8v8M13 3 3.5 12.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
const wordmark = '<span translate="no">Sys<b>Watch</b></span>';

function jsonLd(t) {
  const page = url(t);
  const offer = { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" };
  const publisher = { "@id": "https://devlune.in/#studio" };
  const image = ORIGIN + og(t);
  const graph = [
    {
      "@type": "Organization",
      "@id": "https://devlune.in/#studio",
      name: "DevLune",
      url: DEVLUNE,
      logo: `${DEVLUNE}/app/icon-512.png`,
      address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressCountry: "IN" },
      sameAs: ["https://github.com/Dev-Lune", LINKS.discord],
    },
    { "@type": "WebSite", "@id": `${ORIGIN}/#website`, url: `${ORIGIN}/`, name: "SysWatch", inLanguage: LANGS, publisher },
    {
      "@type": "WebPage",
      "@id": `${page}#webpage`,
      url: page,
      name: t.title,
      description: t.description,
      inLanguage: t.lang,
      isPartOf: { "@id": `${ORIGIN}/#website` },
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
  ];
  // "<" is escaped so no answer can close the script element early.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

function head(t, all) {
  const fonts = t.lang === "ru" ? ["onest-cyrillic", "onest-latin"] : ["bricolage-700-latin", "instrument-sans-latin"];
  const image = ORIGIN + og(t);
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${attr(t.title)}</title>
<meta name="description" content="${attr(t.description)}">
<link rel="canonical" href="${url(t)}">
${all.map((o) => `<link rel="alternate" hreflang="${o.lang}" href="${url(o)}">`).join("\n")}
<link rel="alternate" hreflang="x-default" href="${ORIGIN}/">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="theme-color" content="#0E0F11">
<meta name="color-scheme" content="dark">
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
<meta property="og:title" content="${attr(t.title)}">
<meta property="og:description" content="${attr(t.description)}">
<meta property="og:url" content="${url(t)}">
<meta property="og:image" content="${image}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${attr(t.ogAlt)}">
<meta property="og:locale" content="${t.locale}">
${all.filter((o) => o !== t).map((o) => `<meta property="og:locale:alternate" content="${o.locale}">`).join("\n")}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(t.title)}">
<meta name="twitter:description" content="${attr(t.description)}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${attr(t.ogAlt)}">
<script type="application/ld+json">${jsonLd(t)}</script>`;
}

function langMenu(t, all) {
  return `<details class="lang">
<summary aria-label="${t.lang.toUpperCase()}: ${attr(t.nav.language)}, ${attr(t.name)}">${t.lang.toUpperCase()}</summary>
<ul>
${all.map((o) => `<li><a href="${o.path}" hreflang="${o.lang}" lang="${o.lang}"${o === t ? ' aria-current="page"' : ""}>${o.name}</a></li>`).join("\n")}
</ul>
</details>`;
}

function page(t, all) {
  const buttons = `<div class="actions">
<a class="btn btn-primary" href="${LINKS.win}">${ICON.win}${t.hero.win}</a>
<a class="btn btn-ghost" href="${LINKS.play}">${ICON.play}${t.hero.play}</a>
</div>`;
  const shots = ["overview", "alerts", "settings", "gallery"];
  const faces = ["face-ink", "face-bauhaus", "face-blocks"];
  return `<!doctype html>
<html lang="${t.lang}" dir="ltr">
<head>
${head(t, all)}
</head>
<body>
<a class="skip" href="#main">${t.skip}</a>
<header class="top">
<div class="wrap top-in">
<a class="mark" href="${t.path}" aria-label="SysWatch">${wordmark}</a>
<nav class="top-nav" aria-label="${attr(t.nav.main)}">
<a href="#see">${t.nav.see}</a>
<a href="#connect">${t.nav.connect}</a>
<a href="#setup">${t.nav.setup}</a>
<a href="#faq">${t.nav.faq}</a>
</nav>
${langMenu(t, all)}
<a class="btn btn-primary btn-small" href="#setup">${t.nav.download}</a>
</div>
</header>

<main id="main">
<section class="hero">
<div class="wrap hero-in">
<div class="hero-copy">
<p class="kicker">${t.hero.kicker}</p>
<h1>${t.hero.h1}</h1>
<p class="lead">${t.hero.lead}</p>
${buttons}
<p class="meta">${t.hero.meta}<br>${t.hero.meta2}</p>
<p class="reassure">${t.hero.reassure}</p>
</div>
<div class="hero-art">
<input class="pause-box" type="checkbox" id="pause">
<div class="inst" aria-hidden="true">
<div class="inst-top"><span class="inst-k">CPU</span><span class="inst-live"><i></i>${t.hero.live}</span></div>
<div class="inst-read">
<p class="inst-num"><span></span><small>%</small></p>
<svg class="arc" viewBox="0 0 64 64" width="64" height="64"><circle class="arc-bg" cx="32" cy="32" r="26"/><circle class="arc-val" cx="32" cy="32" r="26"/></svg>
</div>
<div class="trace">
<svg class="trace-run" viewBox="0 0 960 160" width="960" height="160" preserveAspectRatio="none">
<defs><linearGradient id="trace-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0A458" stop-opacity=".2"/><stop offset="1" stop-color="#E0A458" stop-opacity="0"/></linearGradient></defs>
<path d="${traceFill}" fill="url(#trace-fade)"/><path class="trace-line" d="${traceLine}"/>
</svg>
<i class="trace-limit"></i>
</div>
<p class="inst-limit">${t.hero.limit} ${LIMIT}%</p>
<div class="inst-bar"><i class="inst-fill"></i><i class="inst-tick"></i></div>
<dl class="inst-rows">
<div><dt>GPU</dt><dd>58<small>%</small></dd></div>
<div><dt>MEM</dt><dd>61<small>%</small></dd></div>
<div><dt>NET</dt><dd>9.01<small>MB/s</small></dd></div>
</dl>
</div>
<label class="pause" for="pause">${t.hero.pause}</label>
</div>
</div>
<div class="wrap">
<ul class="stats">
${t.stats.map(([n, l]) => `<li><b>${n}</b><span>${l}</span></li>`).join("\n")}
</ul>
</div>
</section>

<section class="sec" id="see" aria-labelledby="see-h">
<div class="wrap">
<div class="sec-head">
<p class="kicker">${t.see.kicker}</p>
<h2 id="see-h">${t.see.h2}</h2>
<p class="lead">${t.see.lead}</p>
</div>
<div class="plates">
${t.see.items.map((it, i) => `<figure class="plate">${picture(shots[i], [360, 720], 360, 760, it.alt, "(min-width: 1000px) 250px, (min-width: 600px) 42vw, 44vw")}<figcaption><b>${it.t}</b>${it.d}</figcaption></figure>`).join("\n")}
</div>
</div>
</section>

<section class="sec" id="alerts" aria-labelledby="alerts-h">
<div class="wrap split">
<div>
<p class="kicker">${t.alerts.kicker}</p>
<h2 id="alerts-h">${t.alerts.h2}</h2>
<p class="lead">${t.alerts.lead}</p>
<ul class="ticks">
${t.alerts.points.map((p) => `<li>${p}</li>`).join("\n")}
</ul>
</div>
<div class="rules" aria-hidden="true">
<div class="rule">
<p class="rule-s">${t.alerts.rule1}</p>
<div class="rule-bar"><i class="fill-72"></i><b class="tick-90"></b></div>
<p class="rule-m"><span>72%</span><span class="hot">${t.hero.limit} 90%</span></p>
</div>
<div class="rule">
<p class="rule-s">${t.alerts.rule2}</p>
<div class="rule-bar"><i class="fill-64"></i><b class="tick-20"></b></div>
<p class="rule-m"><span>64%</span><span class="hot">${t.hero.limit} 20%</span></p>
</div>
<p class="rule-q">${t.alerts.quiet}</p>
</div>
</div>
</section>

<section class="sec" id="look" aria-labelledby="look-h">
<div class="wrap">
<div class="sec-head">
<p class="kicker">${t.look.kicker}</p>
<h2 id="look-h">${t.look.h2}</h2>
<p class="lead">${t.look.lead}</p>
</div>
<div class="look">
<figure class="plate plate-wide">${picture("landscape-light", [720, 1440], 720, 300, t.look.alt, "(min-width: 1000px) 640px, 92vw")}<figcaption>${t.look.cap}</figcaption></figure>
<dl class="cells">
${t.look.cells.map((c) => `<div><dt>${c.t}</dt><dd>${c.d}</dd></div>`).join("\n")}
</dl>
</div>
</div>
</section>

<section class="sec" id="standby" aria-labelledby="standby-h">
<div class="wrap">
<div class="sec-head">
<p class="kicker">${t.standby.kicker}</p>
<h2 id="standby-h">${t.standby.h2}</h2>
<p class="lead">${t.standby.lead}</p>
</div>
<div class="standby">
<div class="faces">
${t.standby.faces.map((f, i) => `<figure class="plate">${picture(faces[i], [360, 720], 360, 760, f.alt, "(min-width: 1000px) 210px, 29vw")}<figcaption><b translate="no">${f.t}</b></figcaption></figure>`).join("\n")}
</div>
<ul class="ticks">
${t.standby.points.map((p) => `<li>${p}</li>`).join("\n")}
</ul>
</div>
</div>
</section>

<section class="sec" id="connect" aria-labelledby="connect-h">
<div class="wrap">
<div class="sec-head">
<p class="kicker">${t.connect.kicker}</p>
<h2 id="connect-h">${t.connect.h2}</h2>
<p class="lead">${t.connect.lead}</p>
</div>
<div class="modes">
${t.connect.modes.map((m) => `<article class="mode">
<p class="mode-tag">${m.tag}</p>
<h3>${m.name}</h3>
<dl>
${m.vals.map((v, i) => `<div><dt>${t.connect.rows[i]}</dt><dd>${v}</dd></div>`).join("\n")}
</dl>
<p class="mode-note">${m.note}</p>
</article>`).join("\n")}
</div>
<p class="foot">${t.connect.foot} <a href="${LINKS.tailscale}">${t.connect.guide}</a></p>
</div>
</section>

<section class="sec" id="setup" aria-labelledby="setup-h">
<div class="wrap">
<div class="sec-head">
<p class="kicker">${t.setup.kicker}</p>
<h2 id="setup-h">${t.setup.h2}</h2>
<p class="lead">${t.setup.lead}</p>
</div>
<ol class="steps">
${t.setup.steps.map((s, i) => `<li id="step-${i + 1}"><span class="step-n" aria-hidden="true">${i + 1}</span><h3>${s.t}</h3><p>${s.d}</p></li>`).join("\n")}
</ol>
${buttons}
<p class="meta">${t.hero.meta}<br>${t.hero.meta2}</p>
<p class="more"><a href="${LINKS.guide}">${t.setup.guide}</a><a href="${LINKS.releases}">${t.setup.releases}</a></p>
</div>
</section>

<section class="sec" id="privacy" aria-labelledby="privacy-h">
<div class="wrap">
<div class="sec-head">
<p class="kicker">${t.privacy.kicker}</p>
<h2 id="privacy-h">${t.privacy.h2}</h2>
</div>
<dl class="cells cells-3">
${t.privacy.items.map((c) => `<div><dt>${c.t}</dt><dd>${c.d}</dd></div>`).join("\n")}
</dl>
<p class="more"><a href="${LINKS.privacy}">${t.privacy.policy}</a><a href="${LINKS.terms}">${t.privacy.terms}</a></p>
</div>
</section>

<section class="sec" id="faq" aria-labelledby="faq-h">
<div class="wrap split split-faq">
<div class="sec-head">
<p class="kicker">${t.faq.kicker}</p>
<h2 id="faq-h">${t.faq.h2}</h2>
</div>
<div class="faq">
${t.faq.items.map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join("\n")}
</div>
</div>
</section>

<section class="sec" id="translate" aria-labelledby="translate-h">
<div class="wrap split">
<div>
<p class="kicker">${t.translate.kicker}</p>
<h2 id="translate-h">${t.translate.h2}</h2>
</div>
<div>
<p class="lead">${t.translate.p}</p>
<p class="more"><a href="${LINKS.translations}">${t.translate.cta}</a></p>
</div>
</div>
</section>
</main>

<footer class="bottom">
<div class="wrap bottom-in">
<div class="bottom-brand">
<p class="mark">${wordmark}</p>
<p>${t.footer.made}</p>
<nav aria-label="${attr(t.nav.language)}">
<ul class="langs">
${all.map((o) => `<li><a href="${o.path}" hreflang="${o.lang}" lang="${o.lang}"${o === t ? ' aria-current="page"' : ""}>${o.name}</a></li>`).join("\n")}
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
<li><a href="${LINKS.guide}">${t.footer.guide}</a></li>
<li><a href="${LINKS.tailscale}">${t.footer.tailscale}</a></li>
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
</footer>
</body>
</html>
`;
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
<meta name="theme-color" content="#0E0F11">
<meta name="color-scheme" content="dark">
<link rel="preload" href="/assets/fonts/bricolage-700-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
</head>
<body>
<header class="top"><div class="wrap top-in"><a class="mark" href="/" aria-label="SysWatch">${wordmark}</a></div></header>
<main id="main" class="lost">
<div class="wrap">
<p class="lost-n" aria-hidden="true">404</p>
<h1>This page is not here.</h1>
<p class="lead">The address may be mistyped, or the page has moved. SysWatch itself is one page, in five languages.</p>
<ul class="langs">
${all.map((o) => `<li><a href="${o.path}" hreflang="${o.lang}" lang="${o.lang}">SysWatch, ${o.name}</a></li>`).join("\n")}
</ul>
<p class="more"><a href="${LINKS.guide}">${t.footer.guide}</a></p>
</div>
</main>
</body>
</html>
`;
}

const all = LANGS.map((l) => fill(content[l], l));
const out = (name, text) => writeFileSync(join(ROOT, name), text);
for (const t of all) out(file(t), versioned(external(page(t, all))));
out("404.html", versioned(external(notFound(all))));

out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${all.map((t) => `<url>
<loc>${url(t)}</loc>
<lastmod>${today}</lastmod>
${all.map((o) => `<xhtml:link rel="alternate" hreflang="${o.lang}" href="${url(o)}"/>`).join("\n")}
<xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/"/>
</url>`).join("\n")}
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
  background_color: "#0E0F11",
  theme_color: "#0E0F11",
  icons: [192, 512].map((s) => ({ src: `/assets/img/icon-${s}.png`, sizes: `${s}x${s}`, type: "image/png" })),
}, null, 2) + "\n");

const en = all[0];
out("llms.txt", `# SysWatch

> ${en.description}

SysWatch is two free apps made by DevLune, a software studio in Hyderabad, India. A small desktop app runs on a Windows PC and reads its hardware. An Android app shows those readings live and sends a notification when one crosses a limit the user set. There are no ads and no account. It is read only: the phone cannot control the PC.

## Key facts

- Readings: CPU, GPU, memory, network, storage, battery and uptime, each with a history graph. Temperatures are shown when the PC reports them.
- Alerts: rules written as sentences (for example "CPU load above 90%"), each limit drawn as a red line on its gauge.
- Standby: 24 always-on faces for a phone on a desk stand (16 instrument faces, 8 art faces), and a home screen widget in four looks.
- Look: a chosen accent colour, light, dark or true black theme, five Overview layouts (Bridge, Gauges, Strip charts, Ledger, Focus).
- Three ways to connect: Local (same Wi-Fi, instant, readings stay on the network), Cloud by DevLune (works from anywhere, nothing to set up, about 2 seconds per update), Tailscale (instant and private from anywhere).
- Desktop app: Windows 10 and 11, 64-bit, version ${RELEASE.version}, about ${RELEASE.sizeMb} MB. The installer is not code signed, so Windows SmartScreen shows a warning (More info, then Run anyway).
- Phone app: Android 7.0 and newer, on Google Play.
- App languages: English, German, French, Spanish, Russian. Community translations are welcome: one text file per language, and a merged translation reaches the app without an app update.
- Price: free on both sides.

## Links

- [Website](${ORIGIN}/): this site, also in ${all.slice(1).map((t) => `[${t.name}](${url(t)})`).join(", ")}
- [Download for Windows](${LINKS.win})
- [SysWatch on Google Play](${LINKS.play})
- [Download and setup guide](${LINKS.guide})
- [All releases and changelog](${LINKS.releases})
- [Tailscale guide](${LINKS.tailscale})
- [Translations](${LINKS.translations})
- [Privacy policy](${LINKS.privacy}) and [terms](${LINKS.terms})
- [DevLune](${LINKS.devlune})
`);

console.log(`built ${all.length} pages, 404, sitemap, robots, llms.txt, manifest (${hashes.size} versioned assets)`);
