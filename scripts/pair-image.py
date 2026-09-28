#!/usr/bin/env python3
"""
PAIR-IMAGE — one card image that shows the washer AND the dryer.

A laundry set is one product, so its first image has to show both machines;
a card that shows a single machine reads as a single machine for sale. This
takes the two existing studio cutouts of a set, lifts each product off its
white ground, and re-seats the two on one canvas, side by side on a common
floor line, at their true relative heights.

Nothing is redrawn: each machine is the same pixels, only scaled uniformly
and translated. Writes public/inventory/<sku>-pair.webp.
"""
import json, sys
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
INV, OUT = ROOT / 'data/inventory.json', ROOT / 'public/inventory'
CANVAS, MARGIN, GAP, NEAR_WHITE = 1600, 0.06, 0.035, 246


def cut(path: Path):
    """Crop a studio frame to its product, and report the product's own height."""
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    ink = a.mean(axis=2) < NEAR_WHITE
    if not ink.any():
        raise SystemExit(f'{path}: blank')
    rows, cols = np.where(ink)
    return im.crop((cols.min(), rows.min(), cols.max() + 1, rows.max() + 1))


def pair(left: Path, right: Path, dst: Path):
    a, b = cut(left), cut(right)
    # Keep the two at their photographed relative scale: the studio frames are
    # all the same size, so a machine that came back taller really is taller.
    gap = int(CANVAS * GAP)
    avail_w = int(CANVAS * (1 - 2 * MARGIN)) - gap
    avail_h = int(CANVAS * (1 - 2 * MARGIN))
    s = min(avail_w / (a.width + b.width), avail_h / max(a.height, b.height))
    a = a.resize((max(1, round(a.width * s)), max(1, round(a.height * s))), Image.LANCZOS)
    b = b.resize((max(1, round(b.width * s)), max(1, round(b.height * s))), Image.LANCZOS)
    canvas = Image.new('RGB', (CANVAS, CANVAS), (255, 255, 255))
    total = a.width + gap + b.width
    x = (CANVAS - total) // 2
    floor = int((CANVAS + max(a.height, b.height)) / 2 * 1.04)   # seat both on one line
    floor = min(floor, CANVAS - int(CANVAS * MARGIN))
    canvas.paste(a, (x, floor - a.height))
    canvas.paste(b, (x + a.width + gap, floor - b.height))
    canvas.save(dst, 'WEBP', quality=88, method=6)
    return dst


def main():
    doc = json.loads(INV.read_text())
    made = []
    for p in doc['products']:
        if p['category'] != 'laundry-sets':
            continue
        srcs = [i for i in p['images'] if not i['src'].endswith('-pair.webp')]
        if len(srcs) < 2:
            print(f"SKIP {p['sku']}: only {len(srcs)} image(s) — {p['name']['fr']}")
            continue
        dst = OUT / f"{p['sku'].lower()}-pair.webp"
        pair(OUT / Path(srcs[0]['src']).name, OUT / Path(srcs[1]['src']).name, dst)
        made.append(p['sku'])
        entry = {'src': f'/inventory/{dst.name}', 'alt': p['name']['fr'],
                 'width': CANVAS, 'height': CANVAS, 'kind': 'pair'}
        p['images'] = [entry] + srcs
    tmp = INV.with_suffix('.json.tmp')
    tmp.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n')
    tmp.replace(INV)
    print(f'{len(made)} paired images: {", ".join(made)}')


if __name__ == '__main__':
    main()
