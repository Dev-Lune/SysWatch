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

// The card is the hero in small: cobalt, the headline with its white pill, two real screens.
const card = (t) => `<!doctype html><html lang="${t.lang}"><meta charset="utf-8">
<link rel="stylesheet" href="/assets/css/site.css">
<style>
body{width:1200px;height:630px;overflow:hidden;background:var(--blue)}
.c{position:relative;display:grid;grid-template-columns:640px 1fr;align-items:center;height:630px;padding:0 0 0 72px;color:var(--on-blue)}
.brand{font-size:30px;margin:0}
.brand img{width:44px;height:44px;border-radius:12px}
h1{margin-top:34px;color:#fff;font-size:${t.lang === "en" ? 64 : 52}px;line-height:1.06;letter-spacing:-.02em;font-weight:800}
.kicker{margin-top:34px;font-size:20px}
.art{position:relative;height:630px}
.blob{position:absolute;width:560px;height:560px;left:40px;top:60px}
.phone{position:absolute;width:250px}
.p1{left:70px;top:70px;transform:rotate(-7deg);z-index:2}
.p2{left:290px;top:140px;width:220px;transform:rotate(6deg)}
</style>
<div class="c"><div><p class="brand"><img src="/assets/img/icon-96.webp" alt=""><span>SysWatch</span></p><h1>${t.hero.h1}</h1><p class="kicker">${t.hero.kicker}</p></div>
<div class="art"><i class="blob"></i><div class="phone p1"><img src="/assets/img/overview-720.webp" alt=""></div><div class="phone p2"><img src="/assets/img/face-poster-720.webp" alt=""></div></div></div>`;

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
