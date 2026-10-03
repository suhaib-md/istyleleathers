"""Curate + optimise source photography into public/img (webp) and write a size manifest.

Only images WITHOUT visible third-party brand marks are included on purpose —
many factory shots carry other labels' names on insoles / plates.
Run:  python scripts/process_images.py
"""
import os, json
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, "..", ".."))  # the "I Style" folder
OUT = os.path.join(HERE, "..", "public", "img")
MANIFEST = os.path.join(HERE, "..", "src", "content", "images.json")

# (source, dest, options)  options: crop_sparkle, max, crop=(l,t,r,b fractions)
items = [
    # ---------- footwear ----------
    ("Instagram/Posts/post 18.png", "foot/woven-toe-ring-sage", {}),
    ("Instagram/Posts/post 19.png", "foot/tan-v-thong-sage", {}),
    ("Instagram/Posts/post 20.png", "foot/double-buckle-sage", {}),
    ("Professional Images/professional footwear/4.1.png", "foot/double-buckle-white", {}),
    ("Professional Images/professional footwear/4.2.png", "foot/double-buckle-top", {}),
    ("Instagram/Posts/post 21.png", "foot/h-strap-sage", {}),
    ("Professional Images/professional footwear/5.1.png", "foot/h-strap-white", {}),
    ("Professional Images/Studio Images/Light Studio BG/Sandal Light BG.png", "foot/h-strap-light", {}),
    ("Professional Images/Studio Images/White BG/hero.png", "foot/h-strap-hero", {}),
    ("Instagram/Posts/post 22.png", "foot/croc-buckle-sage", {}),
    ("Professional Images/professional footwear/7.1.png", "foot/croc-buckle-white", {}),
    ("Instagram/Posts/post 23.png", "foot/navy-cross-sage", {}),
    ("Professional Images/sandal.png", "foot/croc-cross-buckle-sage", {"max": 1700}),
    ("Graphics/green gray.png", "foot/cross-strap-teal", {"crop_sparkle": True}),
    ("Graphics/Gemini_Generated_Image_9pmaks9pmaks9pma.png", "foot/cross-strap-light-tall", {"crop_sparkle": True}),
    ("Graphics/Gemini_Generated_Image_z48istz48istz48i.png", "foot/cross-strap-sand", {"crop_sparkle": True}),
    ("Graphics/Gemini_Generated_Image_t1i0vmt1i0vmt1i0.png", "foot/perforated-slide-sage", {"crop_sparkle": True}),
    ("Instagram/Posts/Instagram post - 17.jpg", "foot/perforated-slide-sage-2", {}),
    ("Instagram/Posts/Instagram post - 24.jpg", "foot/multi-strap-thong-plinth", {}),
    ("Instagram/Posts/Instagram post - 25.jpg", "foot/cognac-cross-thong-plinth", {}),
    ("Instagram/Posts/Instagram post - 26.jpg", "foot/croc-thong-plinth", {}),
    ("Instagram/Posts/Instagram post - 28.jpg", "foot/tan-thong-plinth", {}),
    ("Instagram/Posts/Instagram post - 29.jpg", "foot/mono-thong-plinth", {}),
    # ---------- bags (studio) ----------
    ("Professional Images/Studio Images/Brown Studio BG/office bag brown studio bg.png", "bags/professional-studio", {}),
    ("Professional Images/Studio Images/White BG/office bag.png", "bags/professional-white", {}),
    ("Professional Images/Studio Images/Light Studio BG/office bag light studio bg.png", "bags/professional-light", {"crop_sparkle": True}),
    ("Professional Images/Studio Images/Brown Studio BG/doc bag brown studio bg.png", "bags/minimalist-studio", {}),
    ("Professional Images/Studio Images/White BG/doc bag white bg.png", "bags/minimalist-white", {}),
    ("Professional Images/Studio Images/Brown Studio BG/green canvas duffel brown studio bg.png", "bags/explorer-studio", {}),
    ("Professional Images/Studio Images/White BG/green canvas duffel white bg.png", "bags/explorer-white", {}),
    ("Professional Images/Studio Images/White BG/burgundy canvas duffel white bg.png", "bags/burgundy-explorer-white", {}),
    ("Professional Images/Studio Images/Brown Studio BG/mesh backpack brown studio bg.png", "bags/classic-backpack-studio", {}),
    ("Professional Images/Studio Images/White BG/Mesh Backpack.png", "bags/classic-backpack-white", {}),
    ("Professional Images/Studio Images/Brown Studio BG/brown duffel brown studio bg.png", "bags/traveler-studio", {}),
    ("Professional Images/professional bags/instagram/bag 5.png", "bags/traveler-white", {}),
    ("Professional Images/Studio Images/Brown Studio BG/tan duffel brown studio bg.png", "bags/essential-studio", {}),
    ("Professional Images/professional bags/instagram/bag 1.png", "bags/essential-white", {}),
    ("Professional Images/professional bags/instagram/bag 2.png", "bags/cognac-duffel-white", {}),
    ("Professional Images/professional bags/instagram/bag 3.png", "bags/cognac-duffel-white-2", {}),
    ("Professional Images/professional bags/instagram/bag 4.png", "bags/croc-duffel-white", {}),
    ("Bags/Bags edited/bag4.png", "bags/onyx-croc-duffel", {}),
    ("Bags/Bags edited/bag5.png", "bags/racer-duffel", {}),
    ("Bags/Bags edited/bag17.png", "bags/racer-duffel-2", {}),
    ("Bags/Bags edited/bag6.png", "bags/diagonal-croc-brief", {}),
    ("Bags/Bags edited/bag7.png", "bags/woven-weekender", {}),
    ("Bags/Bags edited/bag8.png", "bags/croc-panel-brief", {}),
    ("Bags/Bags edited/bag9.png", "bags/slate-stripe-brief", {}),
    ("Bags/Bags edited/bag10.png", "bags/onyx-weekender", {}),
    ("Bags/Bags edited/bag11.png", "bags/croc-pocket-brief", {}),
    ("Bags/Bags edited/bag12.png", "bags/woven-panel-brief", {}),
    ("Bags/Bags edited/bag13.png", "bags/heritage-flap-brief", {}),
    ("Bags/Bags edited/bag15.png", "bags/sand-canvas-duffel", {}),
    ("Bags/Bags edited/bag16.png", "bags/forest-canvas-duffel", {}),
    ("Bags/Bags edited/bag18.png", "bags/city-brief", {}),
    ("Bags/Bags edited/bag19.png", "bags/cognac-brief", {}),
    # ---------- accessories ----------
    ("Professional Images/Studio Images/White BG/watch roll.png", "acc/watch-roll-white", {}),
    ("Raw Images/IMG-20251011-WA0075.jpg", "acc/watch-roll-wood", {}),
    ("Raw Images/IMG-20251011-WA0087.jpg", "acc/watch-roll-black", {}),
    ("Raw Images/IMG-20251011-WA0088.jpg", "acc/watch-roll-black-closed", {}),
    ("Professional Images/Studio Images/White BG/specs 1.png", "acc/specs-sleeve-white", {}),
    ("Raw Images/IMG-20251011-WA0096.jpg", "acc/specs-sleeve-wood", {}),
    ("Professional Images/Studio Images/White BG/specscase.png", "acc/specs-case-white", {}),
    ("Raw Images/IMG-20251011-WA0060.jpg", "acc/specs-case-wood", {}),
    ("Raw Images/IMG-20251011-WA0061.jpg", "acc/specs-case-wood-2", {}),
    ("Professional Images/Studio Images/White BG/keychains 1.png", "acc/hook-keychains-white", {"crop": (0.36, 0.0, 1.0, 1.0)}),
    ("Raw Images/IMG-20251011-WA0146.jpg", "acc/loop-keychains-dark", {}),
    ("Raw Images/IMG-20251011-WA0148.jpg", "acc/loop-keychains-dark-2", {}),
    ("Raw Images/IMG-20251011-WA0145.jpg", "acc/clip-keychains-dark", {}),
    ("Raw Images/IMG-20251011-WA0102.jpg", "acc/drop-keychains-wood", {}),
    ("Raw Images/IMG-20251011-WA0063.jpg", "acc/shoe-horn-wood", {}),
    ("Raw Images/IMG-20251011-WA0062.jpg", "acc/shoe-horn-wood-2", {}),
    ("Raw Images/IMG-20251011-WA0090.jpg", "acc/pen-stand-wood", {}),
    ("Raw Images/IMG-20251011-WA0065.jpg", "acc/card-stand-wood", {}),
    ("Raw Images/IMG-20251011-WA0054.jpg", "acc/envelope-folios-wood", {}),
    ("Raw Images/IMG-20251011-WA0089.jpg", "acc/envelope-folios-wood-2", {}),
    ("Raw Images/IMG-20251011-WA0091.jpg", "acc/wall-pocket-wood", {}),
    ("Raw Images/IMG-20251011-WA0092.jpg", "acc/wall-pocket-mounted", {}),
    # ---------- workshop (real factory floor) ----------
    ("Bags/bag-11.jpeg", "workshop/floor-duffel", {}),
    ("Bags/bag-9.jpeg", "workshop/floor-weekender", {}),
    ("Bags/bag-22.jpeg", "workshop/bench-woven", {}),
    ("Bags/bag-10.jpeg", "workshop/cutting-mat-brief", {}),
    ("Bags/bag-14.jpeg", "workshop/croc-on-mat", {}),
    ("Bags/bag-6.jpeg", "workshop/croc-duffel-mat", {"crop": (0.0, 0.3, 1.0, 1.0)}),
    ("Bags/bag-21.jpeg", "workshop/woven-closeup", {}),
    ("Bags/bag-17.jpeg", "workshop/racer-held", {}),
    ("Bags/bag-13.jpeg", "workshop/racer-held-2", {}),
    ("Bags/bag-12.jpeg", "workshop/slate-held", {}),
    ("Bags/WhatsApp Image 2026-09-27 at 5.57.12 AM (1).jpeg", "workshop/black-brief-held", {}),
    ("Bags/WhatsApp Image 2026-09-27 at 5.57.12 AM.jpeg", "workshop/cognac-brief-held", {}),
    ("WhatsApp Image 2026-04-18 at 10.47.47 AM.jpeg", "workshop/slate-brief-table", {}),
    ("Bags/bag-3.jpeg", "workshop/croc-weekender-mat", {}),
    ("Bags/bag-2.jpeg", "workshop/woven-brief-held", {}),
    # ---------- instagram (the brand's real posts) ----------
    ("Instagram/Posts/Post 3/square/Instagram post - 14.jpg", "insta/bags-distance", {"max": 900}),
    ("Instagram/Posts/Instagram post - 16.jpg", "insta/footwear-collection", {"max": 900}),
    ("Instagram/Posts/Post 3/square/Instagram post - 8.jpg", "insta/minimalist", {"max": 900}),
    ("Instagram/Posts/Post 3/square/Instagram post - 9.jpg", "insta/explorer", {"max": 900}),
    ("Instagram/Posts/Instagram post - 27.jpg", "insta/elegance", {"max": 900}),
    ("Instagram/Posts/Post 3/square/Instagram post - 10.jpg", "insta/essential", {"max": 900}),
    ("Instagram/Posts/Post 3/square/Instagram post - 11.jpg", "insta/traveler", {"max": 900}),
    ("Instagram/Posts/Post 3/square/Instagram post - 12.jpg", "insta/classic", {"max": 900}),
    ("Instagram/Posts/Post 3/square/Instagram post - 13.jpg", "insta/professional", {"max": 900}),
    ("Instagram/Posts/Post 1/leather.jpg", "insta/i-style-leathers", {"max": 900}),
    ("Graphics/Step into Comfort.jpg", "insta/step-into-comfort", {"max": 900}),
    ("Instagram/Posts/Instagram post - 22.jpg", "insta/croc-buckle", {"max": 900}),
    # ---------- brand ----------
    ("Instagram/Posts/Post 1/logo.png", "brand/logo-on-leather", {}),
]


def main():
    manifest = {}
    for src, dest, opt in items:
        p = os.path.join(SRC, src)
        im = Image.open(p)
        im = ImageOps.exif_transpose(im)
        has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
        im = im.convert("RGBA" if has_alpha else "RGB")
        W, H = im.size
        if opt.get("crop_sparkle"):
            # Gemini sparkle watermark sits in the bottom-right corner — trim it off.
            im = im.crop((0, 0, int(W * 0.915), int(H * 0.925)))
        if "crop" in opt:
            l, t, r, b = opt["crop"]
            W, H = im.size
            im = im.crop((int(W * l), int(H * t), int(W * r), int(H * b)))
        mx = opt.get("max", 1600)
        im.thumbnail((mx, mx), Image.LANCZOS)
        out = os.path.normpath(os.path.join(OUT, dest + ".webp"))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        im.save(out, "WEBP", quality=82, method=6)
        manifest["/img/" + dest + ".webp"] = {"w": im.width, "h": im.height}
        print(f"{dest:40s} {im.width}x{im.height}  {os.path.getsize(out)//1024}KB")

    os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
    with open(MANIFEST, "w") as f:
        json.dump(manifest, f, indent=1)
    print("manifest:", len(manifest))


if __name__ == "__main__":
    main()
