# SysWatch website

The site served at <https://syswatch.devlune.in>. Static files only: a home page and three
guides (install, Tailscale, translation) in five languages, one stylesheet, no JavaScript, no cookies, no trackers, nothing loaded from another host.
What is in this folder is what gets served, so Vercel needs no build.

## Deployed on Cloudflare (live)

The site is live at https://syswatch.devlune.in on Cloudflare Workers static assets
(Worker name `syswatch-site`, config `wrangler.jsonc`). To publish a change:

```sh
cd site
node src/build.mjs      # only if content or the template changed
npx wrangler deploy
```

`_headers` and `_redirects` are the Cloudflare versions of the rules in `vercel.json`;
change both if you change one. `.assetsignore` keeps the generator and configs off the web.
The Vercel notes below still work if the site is ever moved.

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
| `index.html`, `de.html`, `fr.html`, `es.html`, `ru.html`, `404.html` | Generated home pages and the 404. Do not edit by hand. |
| `install.html`, `tailscale.html`, `translate.html`, `de/`, `fr/`, `es/`, `ru/` | Generated guides: `/install` is `install.html`, `/de/install` is `de/install.html`. |
| `sitemap.xml`, `robots.txt`, `llms.txt`, `site.webmanifest` | Generated too. |
| `assets/css/site.css` | The one stylesheet, written by hand. |
| `assets/fonts`, `assets/img`, `assets/og` | Self-hosted fonts (OFL, see `assets/fonts/OFL.txt`), screenshots as AVIF and WebP, social cards. |
| `vercel.json` | Clean URLs, redirects, cache and security headers. |
| `src/build.mjs` | The generator: one template, all pages. |
| `src/content/<lang>.json` | Every word on the home page, one file per language. |
| `src/guides/<lang>.json` | Every word in the three guides, one file per language. |
| `src/check.mjs` | Checks the generated output. |
| `src/images.py`, `src/og.mjs`, `src/fonts.py` | Re-encode screenshots and icons; render the social cards; subset the fonts. |
| `src/icons` | Phosphor icons (MIT, phosphoricons.com), inlined into the pages by the generator. |

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

- Text may contain `<a href="{...}">`, `<em>`, `<b>` and `<code>`, nothing else. The link
  names (`{win}`, `{play}`, `{translations}` and so on) are the `LINKS` table at the top of
  `src/build.mjs`; `{guide}`, `{tailscale}` and `{translate}` become the guide pages in the
  same language.
- A guide is a list of blocks: `h2` (with an `id`), `h3`, `p`, `note`, `list`, `steps`
  (with an `id`; a step can carry a `code` sample), `table`, `code`, `actions` (the two
  download buttons). `code` samples are printed exactly as written, in every language.
- The home page questions and setup steps, and the steps of the install and Tailscale
  guides, are also written into the structured data (FAQPage, HowTo), word for word. That
  happens by itself; the checker fails if they ever differ. Guides also carry a
  BreadcrumbList (SysWatch, then the guide).
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
const RELEASE = { version: "0.2.1", sizeMb: 3.5, date: "2026-11-11" };
```

The download link, the version line, the structured data and `llms.txt` all follow from
it. Run the two commands above and commit. The download link points at
`releases/download/v<version>/SysWatch_<version>_x64-setup.exe`, so publish the GitHub
release first.

The site prints no Android version on purpose: Google Play decides when a phone build
goes live.

## Add a language

1. Copy `src/content/en.json` to `src/content/<code>.json` and `src/guides/en.json` to
   `src/guides/<code>.json`, and translate the values. Set `lang`, `locale` and `name`
   (the language's own name). `unit` is the megabyte abbreviation used in that language.
2. Add the code to `LANGS` in `src/build.mjs` and in `src/check.mjs`.
3. Run the build and the check. The new pages, their hreflang links on every other page
   and their sitemap entries are generated.
4. Optional: render a social card with `node src/og.mjs <path to node_modules/playwright>`.
   Without one, the page uses the English card.

The fonts cover Latin, Latin Extended and Cyrillic: Unbounded (display) and Rubik (body),
one WOFF2 file per script with its `unicode-range`, so a page only downloads the scripts its
text uses. `python -I src/fonts.py <dir with the google/fonts TTFs>` writes them. A language in
another script needs that script added to `src/fonts.py` and `site.css`.

The German, French, Spanish and Russian pages and guides were machine written from the
store listing's and the repository docs' wording and have not been read by a native speaker. Corrections are welcome.

## Design and contrast

Direction D, "Bold cobalt": one cobalt `#2B44D6`, Unbounded for headings, Rubik for text, big
round shapes. Contrast pairs used (WCAG AA needs 4.5:1 for body text): white on cobalt 7.2:1,
cobalt on white 7.2:1, link `#1F33AE` on white 9.8:1, body `#383D5C` on white 10.6:1, small
grey `#555A78` on the palest tint `#E9ECFF` 5.7:1, `#D7DCFF` on cobalt 5.4:1, footer `#B6BBDD`
on ink 9.4:1. Check a new colour against its background before using it.

## Replace a screenshot

```sh
python src/images.py <folder with the raw 1080x2400 captures> <app icon.png>
node src/build.mjs
```

`src/images.py` (Pillow 11.3 or newer) lists which capture feeds which image and how it is
cropped. It also writes the favicons from the app icon.
