from pathlib import Path
from PIL import Image, ImageOps

MAX_WIDTH = 1800
folders = [Path("assets/speaking"), Path("assets")]
seen = set()

for folder in folders:
    for p in folder.glob("*"):
        if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"} or p in seen:
            continue
        seen.add(p)
        before = p.stat().st_size
        with Image.open(p) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            if im.width > MAX_WIDTH:
                im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)))
            im.save(p.with_suffix(".jpg"), "JPEG", quality=82, optimize=True)
        print(f"{p.name}: {before // 1024} KB -> {p.with_suffix('.jpg').stat().st_size // 1024} KB")