"""Build logo assets from the brand PNG (white artwork on black):
  public/brand/logo-full.png   — whole badge, white on transparent (use as CSS mask / texture)
  public/brand/logo-mark.png   — just the oval + laces mark
  src/app/icon.png, apple-icon.png — favicons
"""
import os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, "..", "..", "Logo", "I Style Logo.png"))
PUB = os.path.join(HERE, "..", "public", "brand")
APP = os.path.join(HERE, "..", "src", "app")
os.makedirs(PUB, exist_ok=True)

im = Image.open(SRC).convert("L")
a = np.asarray(im).astype(np.float32) / 255.0  # luminance == coverage


def save_mask(alpha, path, pad=8):
    ys, xs = np.where(alpha > 0.05)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    alpha = alpha[max(0, y0 - pad): y1 + pad + 1, max(0, x0 - pad): x1 + pad + 1]
    h, w = alpha.shape
    rgba = np.zeros((h, w, 4), np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(path, optimize=True)
    return w, h


print("full", save_mask(a, os.path.join(PUB, "logo-full.png")))

# The mark = the largest connected component (oval ring) + everything inside it.
binary = a > 0.5
lab, n = ndimage.label(binary)
sizes = ndimage.sum(binary, lab, range(1, n + 1))
ring = lab == (np.argmax(sizes) + 1)
inside = ndimage.binary_fill_holes(ring)
inside = ndimage.binary_dilation(inside, iterations=3)
mark = a * inside
print("mark", save_mask(mark, os.path.join(PUB, "logo-mark.png")))


def icon(size, path, radius_frac=0.22):
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    # rounded square in leather brown
    m = Image.new("L", (size * 4, size * 4), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size * 4 - 1, size * 4 - 1], radius=int(size * 4 * radius_frac), fill=255)
    m = m.resize((size, size), Image.LANCZOS)
    tile = Image.new("RGBA", (size, size), (42, 22, 14, 255))
    bg.paste(tile, (0, 0), m)
    mk = Image.open(os.path.join(PUB, "logo-mark.png"))
    s = int(size * 0.62)
    mk.thumbnail((s, s), Image.LANCZOS)
    cream = Image.new("RGBA", mk.size, (240, 228, 210, 255))
    bg.paste(cream, ((size - mk.width) // 2, (size - mk.height) // 2), mk.split()[3])
    bg.save(path)


icon(512, os.path.join(APP, "icon.png"))
icon(180, os.path.join(APP, "apple-icon.png"), radius_frac=0.0)
print("icons done")
