"""
Imports Ina's speaking photos (12 max), gives them proper file names and
captions, and rebuilds the gallery in index.html.

HOW TO USE
1. Put the 12 photos you want in ONE folder, named so they sort in the order you want.
2. Edit the CAPTIONS list below so caption #1 describes photo #1, and so on.
3. Run:  python prepare_speaking_images.py   and paste the folder path.
"""
from pathlib import Path
import re
import shutil

# ---- EDIT THESE: one caption per photo, in the same order as your photos ----
CAPTIONS = [
    "Speaking at GITEX Nigeria 2025",
    "Speaking at The Nigeria Summit 2025",
    "Speaking at Africa Technology Expo",
    "Building Products session at the launch of building products by Product Dive 2025",
    "Speaking at the 2022 Entrepreneurship Forum at Carnegie Mellon University Africa (Kigali, Rwanda)",
    "Speaking at the 2022 Entrepreneurship Forum at Carnegie Mellon University Africa (Kigali, Rwanda)",
    "Speaking at Africa Technology Expo",
    "Speaking to Product Mangers and Tech Professionals at the Product Dive 2025 engagement",
    "Speaking at  GITEX Morocco 2025",
    "The Nigeria Summit 2025",
    "Product Dive 2025",
    "Product Dive 2025",
]
# -----------------------------------------------------------------------------

LIMIT = 12
MAX_WIDTH = 1600
ROOT = Path(__file__).resolve().parent
DEST = ROOT / "assets" / "speaking"
SUPPORTED = {".jpg", ".jpeg", ".png", ".webp"}

try:
    from PIL import Image, ImageOps
except ImportError:
    Image = None

def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")

print("\nINA ALOGWU SPEAKING IMAGE IMPORTER")
source = Path(input("Folder with the speaking photos: ").strip().strip('"'))
if not source.is_dir():
    raise SystemExit("Folder not found. Check the path and try again.")

files = sorted((p for p in source.rglob("*") if p.is_file() and p.suffix.lower() in SUPPORTED),
               key=lambda p: p.name.lower())
if not files:
    raise SystemExit("No .jpg / .png / .webp images found in that folder.")
if len(files) > LIMIT:
    print(f"Found {len(files)} photos; using the first {LIMIT}.")
files = files[:LIMIT]

DEST.mkdir(parents=True, exist_ok=True)
for old in list(DEST.glob("ina-speaking-*")) + list(DEST.glob("ina-alogwu-*")):
    if old.is_file():
        old.unlink()           # only previously imported files; originals are never touched

items = []
for i, src in enumerate(files, 1):
    caption = CAPTIONS[i - 1] if i <= len(CAPTIONS) else "Speaking engagement"
    ext = ".jpg" if Image else src.suffix.lower()
    name = f"ina-alogwu-{i:02d}-{slug(caption)}{ext}"
    target = DEST / name
    if Image:
        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            if im.width > MAX_WIDTH:
                im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)))
            im.save(target, "JPEG", quality=80, optimize=True)
    else:
        shutil.copy2(src, target)
    items.append((name, caption))
    print(f"{i:02d}. {src.name}  ->  {name}")

def card_class(i):                       # tall / wide pattern for a 12-photo grid
    return "gallery-card" + (" tall" if i in (1, 6) else " wide" if i in (4, 9) else "")

figures = "\n".join(
    f'        <figure class="{card_class(i)}" data-gallery-item>'
    f'<img src="assets/speaking/{n}" alt="Ina Alogwu — {c}" loading="lazy">'
    f"<figcaption>{c}</figcaption></figure>"
    for i, (n, c) in enumerate(items, 1)
)

html_path = ROOT / "index.html"
html = html_path.read_text(encoding="utf-8")
pattern = re.compile(r"(<!-- GALLERY:START -->\n).*?(\n\s*<!-- GALLERY:END -->)", re.S)
if not pattern.search(html):
    raise SystemExit("GALLERY:START / GALLERY:END markers not found in index.html.")
html = pattern.sub(lambda m: m.group(1) + figures + m.group(2), html)
html = re.sub(r'(id="galleryCounter">)[^<]*(<)', rf"\g<1>1 / {len(items)}\g<2>", html)
html_path.write_text(html, encoding="utf-8")

print(f"\nDone: {len(items)} photos imported, named and captioned; gallery rebuilt.")
if not Image:
    print("Tip: run  pip install pillow  to auto-compress the photos.")