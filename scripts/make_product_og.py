"""Per-product link-preview images (1200x630 JPEG) → public/og/<slug>.jpg

WhatsApp / Instagram previews are far more reliable with JPEG than WebP.
Reads the catalogue straight from src/content/products.ts (slug, name, line, first image).
Run: python scripts/make_product_og.py
"""
import os, re
from PIL import Image, ImageDraw, ImageFont, ImageOps
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
OUT = os.path.join(ROOT, "public", "og")
os.makedirs(OUT, exist_ok=True)

src = open(os.path.join(ROOT, "src/content/products.ts"), encoding="utf8").read()
blocks = re.findall(r'slug: "([^"]+)",\s*name: "([^"]+)",\s*line: "([^"]+)",.*?images: \[\s*"([^"]+)"', src, re.S)

W, H = 1200, 630
fonts = r"C:\Windows\Fonts"
serif = ImageFont.truetype(os.path.join(fonts, "georgia.ttf"), 64)
serif_i = ImageFont.truetype(os.path.join(fonts, "georgiai.ttf"), 34)
mono = ImageFont.truetype(os.path.join(fonts, "consola.ttf"), 20)
mark = Image.open(os.path.join(ROOT, "public/brand/logo-mark.png"))
mark.thumbnail((64, 90), Image.LANCZOS)

for slug, name, line, img in blocks:
    bg = Image.new("RGB", (W, H), (33, 20, 13))
    ph = Image.open(os.path.join(ROOT, "public", img.lstrip("/"))).convert("RGB")
    pw = 600
    ph = ImageOps.fit(ph, (pw, H), Image.LANCZOS)
    bg.paste(ph, (W - pw, 0))
    fw = 140
    a = np.tile(np.linspace(255, 0, fw, dtype=np.float32), (H, 1)).astype("uint8")
    bg.paste(Image.new("RGB", (fw, H), (33, 20, 13)), (W - pw, 0), Image.fromarray(a, "L"))
    d = ImageDraw.Draw(bg)
    for x in range(24, W - 24, 14):
        d.line([(x, 18), (x + 8, 18)], fill=(236, 223, 200), width=2)
        d.line([(x, H - 18), (x + 8, H - 18)], fill=(236, 223, 200), width=2)
    for y in range(24, H - 24, 14):
        d.line([(18, y), (18, y + 8)], fill=(236, 223, 200), width=2)
        d.line([(W - 18, y), (W - 18, y + 8)], fill=(236, 223, 200), width=2)
    bg.paste(Image.new("RGB", mark.size, (200, 148, 106)), (64, 60), mark.split()[3])
    # wrap the name if needed
    words, lines, cur = name.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=serif) > 500 and cur:
            lines.append(cur)
            cur = w
        else:
            cur = t
    lines.append(cur)
    y = 300 - (len(lines) - 1) * 36
    for ln in lines:
        d.text((64, y), ln, font=serif, fill=(242, 234, 221))
        y += 74
    d.text((66, y + 6), line, font=serif_i, fill=(200, 148, 106))
    d.text((66, 520), "I STYLE LEATHERS · MELVISHARAM, TAMIL NADU", font=mono, fill=(236, 223, 200))
    d.text((66, 552), "Handmade to order · Enquire on WhatsApp", font=mono, fill=(170, 150, 130))
    bg.save(os.path.join(OUT, f"{slug}.jpg"), "JPEG", quality=84, optimize=True, progressive=True)

print("og images:", len(blocks))
