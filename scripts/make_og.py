"""Builds src/app/opengraph-image.png (1200x630) — used for link previews on WhatsApp, Instagram, etc."""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
W, H = 1200, 630
bg = Image.new("RGB", (W, H), (33, 20, 13))

# photo on the right
ph = Image.open(os.path.join(ROOT, "public/img/foot/cross-strap-teal.webp")).convert("RGB")
ph_w = 540
ratio = H / ph.height
ph = ph.resize((int(ph.width * ratio), H), Image.LANCZOS)
x0 = (ph.width - ph_w) // 2
bg.paste(ph.crop((x0, 0, x0 + ph_w, H)), (W - ph_w, 0))

# soft fade between the halves
import numpy as np
fw = 240
a = np.tile(np.linspace(255, 0, fw, dtype=np.float32) ** 1.0, (H, 1)).astype("uint8")
grad = Image.fromarray(a, "L")
leather = Image.new("RGB", (fw, H), (33, 20, 13))
bg.paste(leather, (W - ph_w, 0), grad)

d = ImageDraw.Draw(bg)
# stitched border
for x in range(24, W - 24, 14):
    d.line([(x, 18), (x + 8, 18)], fill=(236, 223, 200), width=2)
    d.line([(x, H - 18), (x + 8, H - 18)], fill=(236, 223, 200), width=2)
for y in range(24, H - 24, 14):
    d.line([(18, y), (18, y + 8)], fill=(236, 223, 200), width=2)
    d.line([(W - 18, y), (W - 18, y + 8)], fill=(236, 223, 200), width=2)

mark = Image.open(os.path.join(ROOT, "public/brand/logo-mark.png"))
mark.thumbnail((110, 150), Image.LANCZOS)
tan = Image.new("RGB", mark.size, (200, 148, 106))
bg.paste(tan, (70, 70), mark.split()[3])

fonts = r"C:\Windows\Fonts"
serif = ImageFont.truetype(os.path.join(fonts, "georgia.ttf"), 78)
serif_i = ImageFont.truetype(os.path.join(fonts, "georgiai.ttf"), 78)
mono = ImageFont.truetype(os.path.join(fonts, "consola.ttf"), 22)
d.text((70, 262), "Leather,", font=serif, fill=(242, 234, 221))
d.text((70, 344), "worked by hand.", font=serif_i, fill=(200, 148, 106))
d.text((72, 480), "I STYLE LEATHERS  ·  MELVISHARAM, TAMIL NADU", font=mono, fill=(236, 223, 200))
d.text((72, 516), "Sandals · Bags · Accessories · Private label", font=mono, fill=(170, 150, 130))

bg.save(os.path.join(ROOT, "src/app/opengraph-image.png"), optimize=True)
print("ok")
