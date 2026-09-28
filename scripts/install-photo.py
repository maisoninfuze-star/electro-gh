#!/usr/bin/env python3
"""
INSTALL-PHOTO — drop a corrected product photo into the catalogue.

  install-photo.py <image> <AP-id> [<image> <AP-id> ...]

The owner sends a clean white-background shot of a machine that the first
generation pass got wrong. This puts it through the same framing as every
other card (1600x1600, product seated on a common floor line) and archives
the image it replaces under data/photos/superseded/ so nothing is lost.

Pixels are only cropped, scaled and translated — never redrawn.
"""
import sys, shutil
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public/inventory'
ARCHIVE = ROOT / 'data/photos/superseded'
CANVAS, MARGIN, NEAR_WHITE = 1600, 0.07, 246


def framed(src: Path) -> Image.Image:
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    ink = a.mean(axis=2) < NEAR_WHITE
    if not ink.any():
        raise SystemExit(f'{src}: blank image')
    rows, cols = np.where(ink)
    im = im.crop((cols.min(), rows.min(), cols.max() + 1, rows.max() + 1))
    avail = int(CANVAS * (1 - 2 * MARGIN))
    s = min(avail / im.width, avail / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    canvas = Image.new('RGB', (CANVAS, CANVAS), (255, 255, 255))
    canvas.paste(im, ((CANVAS - im.width) // 2, int((CANVAS - im.height) * 0.54)))
    return canvas


def main(argv):
    if len(argv) < 2 or len(argv) % 2:
        raise SystemExit(__doc__)
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    for src, pid in zip(argv[::2], argv[1::2]):
        pid = pid.lower()
        if not pid.startswith('ap-'):
            raise SystemExit(f'{pid}: expected an AP id like ap-113')
        dst = OUT / f'{pid}.webp'
        if dst.exists():
            n = 1
            while (ARCHIVE / f'{pid}.v{n}.webp').exists():
                n += 1
            shutil.copy2(dst, ARCHIVE / f'{pid}.v{n}.webp')
        im = framed(Path(src))
        im.save(dst, 'WEBP', quality=88, method=6)
        print(f'{pid}  <- {Path(src).name}  ({dst.stat().st_size // 1024}K)')


if __name__ == '__main__':
    main(sys.argv[1:])
