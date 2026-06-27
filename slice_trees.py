from PIL import Image
import sys

filename = sys.argv[1] if len(sys.argv) > 1 else "assets/bg/tree_morning.png"
prefix = sys.argv[2] if len(sys.argv) > 2 else "tree_morning"

src = Image.open(filename).convert("RGBA")
W, H = src.size
cols, rows = 4, 3
cw, ch = W // cols, H // rows

print(f"Sheet: {W}x{H}, cell: {cw}x{ch}")

for r in range(rows):
    for c in range(cols):
        idx = r * cols + c + 1
        box = (c * cw, r * ch, (c+1) * cw, (r+1) * ch)
        cell = src.crop(box)
        out = f"assets/bg/{prefix}_{idx:02d}.png"
        cell.save(out)
        print(f"saved {out}")
