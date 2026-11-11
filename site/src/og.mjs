#!/usr/bin/env node
// Renders the social cards: assets/og/og-<lang>.jpg, 1200x630, one per language.
// Only needed when a headline changes or a language is added. Needs Playwright, which the
// site itself does not depend on:  node src/og.mjs <path to node_modules/playwright>
// A language without a card falls back to the English one in build.mjs.
import { readFileSync, mkdirSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SRC = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SRC, "..");
const { chromium } = createRequire(import.meta.url)(process.argv[2] ?? "playwright");

const card = (t) => `<!doctype html><html lang="${t.lang}"><meta charset="utf-8">
<link rel="stylesheet" href="/assets/css/site.css">
<style>
body{width:1200px;height:630px;overflow:hidden;background:#0E0F11 radial-gradient(52rem 34rem at 6% -10%,rgba(224,164,88,.2),transparent 62%)}
.c{display:grid;grid-template-columns:1fr 400px;gap:56px;align-items:center;height:630px;padding:0 72px}
.mark{margin:0;font-size:40px;line-height:1}
h1{margin-top:28px;font-size:${t.lang === "en" ? 76 : 64}px}
.kicker{margin:44px 0 0;font-size:19px}
.inst *,.inst *::after{animation:none}
.trace-run{width:100%}
.inst{padding:30px}
.inst-num{font-size:112px}
.trace{height:150px}
</style>
<div class="c"><div><p class="mark">Sys<b>Watch</b></p><h1>${t.hero.h1}</h1><p class="kicker">${t.hero.kicker}</p></div>
<div class="inst"><div class="inst-top"><span class="inst-k">CPU</span><span class="inst-live"><i></i>${t.hero.live}</span></div>
<div class="inst-read"><p class="inst-num"><span></span><small>%</small></p></div>
<div class="trace"><svg class="trace-run" viewBox="0 0 480 160" preserveAspectRatio="none"><path class="trace-line" d="M0,96L40,60L80,74L120,44L160,66L200,92L240,110L280,84L320,58L360,70L400,46L440,62L480,64.6"/></svg><i class="trace-limit"></i></div>
<div class="inst-bar"><i class="inst-fill"></i><i class="inst-tick"></i></div></div></div>`;

mkdirSync(join(ROOT, "assets", "og"), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
let html = "";
// The card is served from a made-up origin so /assets/... resolves to the files on disk.
await page.route("**/*", (route) => {
  const path = new URL(route.request().url()).pathname;
  return path === "/card" ? route.fulfill({ contentType: "text/html", body: html }) : route.fulfill({ path: join(ROOT, path) });
});
for (const f of readdirSync(join(SRC, "content"))) {
  const t = JSON.parse(readFileSync(join(SRC, "content", f), "utf8"));
  html = card(t);
  await page.goto("http://og.local/card");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(ROOT, "assets", "og", `og-${t.lang}.jpg`), type: "jpeg", quality: 88 });
  console.log("og", t.lang);
}
await browser.close();
