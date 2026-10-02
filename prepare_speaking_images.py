from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parent
DEST = ROOT / "assets" / "speaking"
SUPPORTED = {".jpg", ".jpeg", ".png", ".webp"}
MAX_WIDTH = 1800          # photos wider than this are shrunk (needs Pillow; skipped if missing)

try:
    from PIL import Image, ImageOps
except ImportError:
    Image = None

print("\nINA ALOGWU SPEAKING IMAGE IMPORTER")
print("Paste the full path to the folder containing Ina's speaking photos.")
source = Path(input("Source folder: ").strip().strip('"'))

if not source.exists() or not source.is_dir():
    raise SystemExit("Folder not found. Check the path and run the script again.")

files = sorted(
    [p for p in source.rglob("*") if p.is_file() and p.suffix.lower() in SUPPORTED],
    key=lambda p: p.name.lower(),
)
if not files:
    raise SystemExit("No .jpg / .png / .webp images found in that folder.")

DEST.mkdir(parents=True, exist_ok=True)

# Remove only previously imported numbered speaking images. Originals are never touched.
for old in DEST.glob("ina-speaking-*"):
    if old.is_file():
        old.unlink()

names = []
for i, src in enumerate(files, 1):
    if Image:
        target = DEST / f"ina-speaking-{i:02d}.jpg"
        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            if im.width > MAX_WIDTH:
                im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)))
            im.save(target, "JPEG", quality=85, optimize=True)
    else:
        target = DEST / f"ina-speaking-{i:02d}{src.suffix.lower()}"
        shutil.copy2(src, target)
    names.append(target.name)
    print(f"{i:02d}. {src.name}  ->  {target.name}")

# Layout pattern: some photos tall, some wide, repeating every 11 photos.
def card_class(i):
    m = (i - 1) % 11
    return "gallery-card" + (" tall" if m in (0, 5) else " wide" if m in (3, 8) else "")

figures = "\n".join(
    f'        <figure class="{card_class(i)}" data-gallery-item>'
    f'<img src="assets/speaking/{n}" alt="Ina Alogwu speaking at an event" loading="lazy">'
    f"<figcaption>Speaking moment</figcaption></figure>"
    for i, n in enumerate(names, 1)
)

html_path = ROOT / "index.html"
html = html_path.read_text(encoding="utf-8")

pattern = re.compile(r"(<!-- GALLERY:START -->\n).*?(\n\s*<!-- GALLERY:END -->)", re.S)
if not pattern.search(html):
    raise SystemExit("Could not find the <!-- GALLERY:START --> / <!-- GALLERY:END --> markers in index.html.")

html = pattern.sub(lambda m: m.group(1) + figures + m.group(2), html)
html = re.sub(r'(id="galleryCounter">)[^<]*(<)', rf"\g<1>1 / {len(names)}\g<2>", html)
html_path.write_text(html, encoding="utf-8")

print(f"\nDone. {len(names)} photos imported and the gallery in index.html was rebuilt.")
print("Your original photos were left untouched.")
if not Image:
    print("Tip: run  pip install pillow  to auto-compress photos so the page loads faster.")
print("Open index.html with Live Server to see the result.")