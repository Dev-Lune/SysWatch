# SysWatch website

The site served at <https://syswatch.devlune.in>. Static files only: five language pages,
one stylesheet, no JavaScript, no cookies, no trackers, nothing loaded from another host.
What is in this folder is what gets served, so Vercel needs no build.

## Deploy on Vercel

1. **Add New, Project**, import `Dev-Lune/SysWatch`.
2. Set **Root Directory** to `site`. Leave the framework preset on **Other** and the
   build, install and output fields empty (`vercel.json` already says "no framework").
   Deploy.
3. **Settings, Domains**: add `syswatch.devlune.in` and create the CNAME record Vercel
   shows.

Keep Vercel Web Analytics and Speed Insights switched off for this project. They inject a
script, which the Content-Security-Policy in `vercel.json` blocks, and the site tells
visitors it has no trackers.

After the first deploy, submit `https://syswatch.devlune.in/sitemap.xml` in Google Search
Console and Bing Webmaster Tools.

## What is here

| Path | What it is |
|---|---|
| `index.html`, `de.html`, `fr.html`, `es.html`, `ru.html`, `404.html` | Generated pages. Do not edit by hand. |
| `sitemap.xml`, `robots.txt`, `llms.txt`, `site.webmanifest` | Generated too. |
| `assets/css/site.css` | The one stylesheet, written by hand. |
| `assets/fonts`, `assets/img`, `assets/og` | Self-hosted fonts (OFL, see `assets/fonts/OFL.txt`), screenshots as AVIF and WebP, social cards. |
| `vercel.json` | Clean URLs, redirects, cache and security headers. |
| `src/build.mjs` | The generator: one template, all pages. |
| `src/content/<lang>.json` | Every word on the site, one file per language. |
| `src/check.mjs` | Checks the generated output. |
| `src/images.py`, `src/og.mjs` | Re-encode screenshots and icons; render the social cards. |

`src` and this README are not deployed (`.vercelignore`).

## Change the text, then regenerate

Needs Node 18 or newer and nothing else.

```sh
node src/build.mjs    # writes the pages, sitemap, robots, llms.txt, manifest
node src/check.mjs    # titles, descriptions, hreflang, JSON-LD, links, images, dashes
```

Commit the generated files together with the change. To look at the result locally:
`npx serve .` from this folder, then open the address it prints.

Things worth knowing before editing:

- Text may contain `<a href="{guide}">`, `<em>` and `<b>`, nothing else. The link names
  (`{win}`, `{play}`, `{guide}`, `{translations}` and so on) are the `LINKS` table at the
  top of `src/build.mjs`.
- The questions and the three setup steps are also written into the page's structured
  data, word for word. That happens by itself; the checker fails if they ever differ.
- Titles stay under 60 characters and descriptions between 140 and 160. The checker
  enforces both.
- No inline `style` attributes and no scripts. The Content-Security-Policy refuses them,
  and so does the checker.
- Everything under `/assets` is cached for a year. The generator adds `?v=<hash>` to each
  CSS and image URL, so a changed file is fetched again. Fonts are the exception: give a
  changed font a new file name.

## When a new desktop version ships

Edit one constant at the top of `src/build.mjs`:

```js
const RELEASE = { version: "0.2.0", sizeMb: 3.5, date: "2026-11-10" };
```

The download link, the version line, the structured data and `llms.txt` all follow from
it. Run the two commands above and commit. The download link points at
`releases/download/v<version>/SysWatch_<version>_x64-setup.exe`, so publish the GitHub
release first.

The site prints no Android version on purpose: Google Play decides when a phone build
goes live.

## Add a language

1. Copy `src/content/en.json` to `src/content/<code>.json` and translate the values. Set
   `lang`, `locale`, `path` (`/<code>`) and `name` (the language's own name). `unit` is the
   megabyte abbreviation used in that language.
2. Add the code to `LANGS` in `src/build.mjs` and to `PAGES` in `src/check.mjs`.
3. Run the build and the check. The new page, its hreflang links on every other page and
   its sitemap entry are generated.
4. Optional: render a social card with `node src/og.mjs <path to node_modules/playwright>`.
   Without one, the page uses the English card.

The fonts cover Latin, Latin Extended and Cyrillic. Bricolage Grotesque and Instrument
Sans have no Cyrillic, so the Russian page is set in Onest (see the `:lang(ru)` rule in
`site.css`). A language in another script needs a font added the same way.

The German, French, Spanish and Russian pages were machine written from the store
listing's wording and have not been read by a native speaker. Corrections are welcome.

## Replace a screenshot

```sh
python src/images.py <folder with the raw 1080x2400 captures> <app icon.png>
node src/build.mjs
```

`src/images.py` (Pillow 11.3 or newer) lists which capture feeds which image and how it is
cropped. It also writes the favicons from the app icon.
