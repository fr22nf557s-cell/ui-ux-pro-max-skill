#!/usr/bin/env python3
"""Render the Norvex monogram icon set (PNG) with Pillow: 32 (ico), 180, 192, 512, 512 maskable."""
import sys
from PIL import Image, ImageDraw

out = sys.argv[1] if len(sys.argv) > 1 else "app/public"
INK, CHAMP, IVORY = (11, 12, 16), (233, 214, 174), (243, 238, 228)

def render(size, pad=0.0, radius=0.19):
    s = 1024
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, s - 1, s - 1), radius=int(s * radius), fill=INK)
    inner = int(s * pad)
    w = s - 2 * inner
    c = s / 2
    r = w * 0.31
    pts = [(c, c - r), (c + r, c), (c, c + r), (c - r, c)]
    d.polygon(pts, outline=CHAMP, width=int(w * 0.04))
    n = w * 0.16
    d.line([(c - n, c + n), (c - n, c - n), (c + n, c + n), (c + n, c - n)], fill=IVORY, width=int(w * 0.05), joint="curve")
    return im.resize((size, size), Image.LANCZOS)

render(192).save(f"{out}/icon-192.png")
render(512).save(f"{out}/icon-512.png")
render(512, pad=0.1, radius=0.0).save(f"{out}/icon-512-maskable.png")
render(180).save(f"{out}/apple-touch-icon.png")
render(32).save(f"{out}/favicon.ico", format="ICO", sizes=[(32, 32)])
print("icons written to", out)
