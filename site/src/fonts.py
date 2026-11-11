# Subsets Unbounded (display) and Rubik (body) into self-hosted WOFF2, one file per script, so a
# page only downloads the scripts it uses (site.css gives each file its unicode-range).
# Sources are the google/fonts OFL variable TTFs. Needs fontTools + brotli.
# Run: python -I src/fonts.py <dir with unbounded__Unbounded[wght].ttf and rubik__Rubik[wght].ttf>
# A changed font needs a new file name: /assets is cached for a year and fonts carry no ?v= hash.
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / "assets" / "fonts"
# The same ranges Google Fonts uses; site.css repeats them in each @font-face.
RANGES = {
    "latin": "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
    "latin-ext": "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
    "cyrillic": "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116",
}
JOBS = [  # out name, source, weight range kept
    ("unbounded", "unbounded__Unbounded[wght].ttf", (600, 800)),
    ("rubik", "rubik__Rubik[wght].ttf", (400, 600)),
]
for name, src, wght in JOBS:
    for script, rng in RANGES.items():
        f = TTFont(SRC / src, lazy=False)
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["kern", "liga", "calt", "tnum", "lnum", "case", "ccmp", "locl", "mark", "mkmk"]
        uni = subset.parse_unicodes(rng.replace("U+", "").replace(",", " "))
        s = subset.Subsetter(opts)
        s.populate(unicodes=uni)
        s.subset(f)
        f = instancer.instantiateVariableFont(f, {"wght": wght})
        p =OUT / f"{name}-{script}.woff2"
        f.flavor = "woff2"
        f.save(p)
        print(p.name, p.stat().st_size // 1024, "KB")
