"""Re-encode the app screenshots for the site (Pillow 11.3+, which writes AVIF and WebP).

Usage: python src/images.py <path to play-assets/screenshots> <path to app icon.png>
Output: assets/img/<name>-<width>.avif|webp, favicons and touch icon in the site root.
The site caches /assets/* for a year: build.mjs adds a content hash to every URL,
so run `node src/build.mjs` after this.
"""
import base64, io, os, sys
from PIL import Image

SHOTS, ICON = sys.argv[1], sys.argv[2]
ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "assets", "img")

# name: (source file, crop box, output widths). Portrait crops drop the status bar (9:19).
PORTRAIT = (0, 100, 1080, 2380)
TALL = (0, 72, 1080, 2352)  # the 1080x2424 music face captures, same 9:19 crop
JOBS = {
    "face-poster": ("11-standby-poster.png", TALL, (360, 720)),
    "face-vinyl": ("12-standby-vinyl.png", TALL, (360, 720)),
    "face-glossy": ("13-standby-glossy.png", TALL, (360, 720)),
    "overview": ("01-overview.png", PORTRAIT, (360, 720)),
    "alerts": ("07-alert-editor.png", PORTRAIT, (360, 720)),
    "settings": ("02-settings.png", PORTRAIT, (360, 720)),
    "gallery": ("03-standby-gallery.png", PORTRAIT, (360, 720)),
    "face-ink": ("04-standby-ink.png", PORTRAIT, (360, 720)),
    "face-bauhaus": ("05-standby-bauhaus.png", PORTRAIT, (360, 720)),
    "face-blocks": ("09-standby-blocks.png", PORTRAIT, (360, 720)),
    "landscape-light": ("08-overview-landscape-light.png", (0, 80, 2400, 1080), (720, 1440)),
}

os.makedirs(OUT, exist_ok=True)
for name, (src, box, widths) in JOBS.items():
    im = Image.open(os.path.join(SHOTS, src)).convert("RGB").crop(box)
    for w in widths:
        h = round(im.height * w / im.width)
        r = im.resize((w, h), Image.LANCZOS)
        r.save(os.path.join(OUT, f"{name}-{w}.avif"), quality=58, speed=2)
        r.save(os.path.join(OUT, f"{name}-{w}.webp"), quality=80, method=6)
        print(name, w, h, *(os.path.getsize(os.path.join(OUT, f"{name}-{w}.{e}")) for e in ("avif", "webp")))

icon = Image.open(ICON).convert("RGBA")
icon.resize((32, 32), Image.LANCZOS).save(os.path.join(ROOT, "favicon-32.png"), optimize=True)
icon.resize((48, 48), Image.LANCZOS).save(os.path.join(ROOT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
for size in (192, 512):
    icon.resize((size, size), Image.LANCZOS).save(os.path.join(ROOT, "assets", "img", f"icon-{size}.png"), optimize=True)
# The header and footer mark: 32 css px, so 64 and 96 for sharp screens.
for size in (64, 96):
    icon.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, f"icon-{size}.webp"), quality=90, method=6)
# iOS paints transparent corners black, so the touch icon sits on the icon's own navy.
touch = Image.new("RGB", (180, 180), icon.convert("RGB").getpixel((256, 60)))
small = icon.resize((180, 180), Image.LANCZOS)
touch.paste(small, (0, 0), small)
touch.save(os.path.join(ROOT, "apple-touch-icon.png"), optimize=True)
# The app icon only exists as a bitmap, so the SVG favicon wraps a 96 px copy of it.
buf = io.BytesIO()
icon.resize((96, 96), Image.LANCZOS).save(buf, "PNG", optimize=True)
with open(os.path.join(ROOT, "favicon.svg"), "w", encoding="ascii") as f:
    f.write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><image width="96" height="96" href="data:image/png;base64,'
            + base64.b64encode(buf.getvalue()).decode() + '"/></svg>\n')
print("icons written")
