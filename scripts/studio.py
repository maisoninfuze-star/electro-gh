"""
STUDIO PIPELINE — real Electro GH photos → clean product images.

  raw store photo → hand-set crop to the subject → Apple Vision subject cutout
  → composite on warm white with a soft contact shadow → 1600px WebP

Nothing about the appliance is regenerated: the pixels of the machine are the
pixels the owner photographed. Only the wall, floor and neighbours go.
Crops are per-photo because the store is packed and the cutout model merges
touching machines into one subject.
"""
import subprocess, sys, io
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
RAW, CUT, OUT = ROOT/'data/photos/raw', ROOT/'data/photos/cut', ROOT/'public/inventory'
CUT.mkdir(exist_ok=True, parents=True); OUT.mkdir(exist_ok=True, parents=True)
CUTOUT = ROOT/'scripts/cutout/cutout'

# (x0, y0, x1, y1) in raw-photo pixels. `all` keeps every instance (side-by-side sets).
CROPS = {
  2:  dict(box=(395, 80, 1200, 2016)),          # GE dryer on LG washer (fridge at left dropped)
  3:  dict(box=(330, 0, 1230, 2016)),           # Electrolux stack
  4:  dict(box=(185, 290, 1245, 1970)),         # Samsung top-load washer
  5:  dict(box=(230, 160, 1420, 1140)),         # Samsung white dryer only (washer below excluded)
  6:  dict(box=(0, 600, 1512, 2016), plain=True),   # Samsung VRT washer — panel close-up, hose in frame
  7:  dict(box=(410, 420, 1265, 1600)),         # GE dryer, chrome
  8:  dict(box=(130, 540, 1450, 1980)),         # Samsung platinum washer (VRT Steam)
  9:  dict(box=(110, 210, 1460, 1910)),         # Samsung white dryer
  10: dict(box=(40, 340, 1435, 2016)),          # Samsung white washer $799 set
  11: dict(box=(380, 460, 1410, 1570), plain=True), # Samsung white dryer SALE 750 — white on white wall, cutout chews edges
  12: dict(box=(60, 770, 1470, 1950), plain=True),  # Samsung VRTplus washer — panel close-up
  13: dict(box=(320, 480, 1260, 1900)),         # Frigidaire dryer
  14: dict(box=(400, 560, 1270, 1620)),         # Frigidaire Gallery dishwasher
  15: dict(box=(470, 720, 1245, 1980)),         # Samsung platinum washer SALE 499
  16: dict(box=(270, 270, 1440, 2016)),         # Samsung black dryer on pedestal
  17: dict(box=(330, 380, 1300, 2016)),         # Samsung black AddWash washer
  18: dict(box=(200, 300, 1960, 1512), all=True),  # Maytag pair (landscape)
  19: dict(box=(100, 300, 1440, 1990)),         # Kenmore dryer
  20: dict(box=(0, 300, 1400, 1960), all=True), # Amana washer (left) + dryer
  21: dict(box=(240, 560, 1512, 2016), plain=True), # Samsung grey top-load dryer — lid view
}

CANVAS = (242, 239, 234)      # --color-surface-2 #f2efea — the card and gallery background, so the plate is invisible

def studio(n: int):
  spec = CROPS[n]
  im = ImageOps.exif_transpose(Image.open(RAW/f'{n}.jpg')).convert('RGB')
  im = im.crop(spec['box'])
  tmp = CUT/f'{n}-crop.jpg'; im.save(tmp, quality=95)
  cut_png = CUT/f'{n}.png'
  fg = None
  if not spec.get('plain'):
    args = [str(CUTOUT), str(tmp), str(cut_png)] + (['--all'] if spec.get('all') else [])
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode == 0:
      fg = Image.open(cut_png).convert('RGBA')
      bbox = fg.getbbox()
      if bbox: fg = fg.crop(bbox)
      # A cutout much shorter than its crop means the model latched onto a
      # control panel instead of the machine — fall back to the plain crop.
      if fg.height < 0.45 * im.height:
        print(f'{n}: cutout too small ({fg.height}/{im.height}), using plain crop'); fg = None
    else:
      print(f'{n}: cutout failed ({r.stderr.strip()}), using plain crop')
  if fg is None:
    # Plain crop: the store background stays, but it is a tidy, centred,
    # consistently-framed photo instead of a phone snapshot. Flagged in the
    # feed as `studio: false` so the admin shows it needs a better photo.
    fg = im.convert('RGBA')

  # Compose: subject centred with breathing room on a 4:5 warm-white plate.
  W = 1600; H = 2000
  margin = 0.08
  maxw, maxh = int(W*(1-2*margin)), int(H*(1-2*margin))
  scale = min(maxw/fg.width, maxh/fg.height)
  fg = fg.resize((int(fg.width*scale), int(fg.height*scale)), Image.LANCZOS)
  x = (W - fg.width)//2; y = int(H*0.5 - fg.height*0.47)  # sit slightly low

  plate = Image.new('RGBA', (W, H), CANVAS + (255,))
  is_cut = fg.getextrema()[3][0] == 0   # has transparent pixels → real cutout
  if is_cut:
    # Contact shadow: the alpha, squashed, blurred, darkened, under the subject.
    alpha = fg.split()[3]
    sh = Image.new('RGBA', (W, H), (0,0,0,0))
    shadow_h = max(40, int(fg.height*0.06))
    band = alpha.resize((fg.width, shadow_h)).point(lambda a: int(a*0.55))
    sh.paste((22,24,26,255), (x, y+fg.height-shadow_h//2), band)
    sh = sh.filter(ImageFilter.GaussianBlur(28))
    plate.alpha_composite(sh)
  plate.alpha_composite(fg, (x, y))
  out = OUT/f'gh-{n}.webp'
  plate.convert('RGB').save(out, 'WEBP', quality=86, method=6)
  print(f'{n}: ok  {fg.width}x{fg.height} subject → {out.name} ({out.stat().st_size//1024}K)')

if __name__ == '__main__':
  ns = [int(a) for a in sys.argv[1:]] or sorted(CROPS)
  for n in ns: studio(n)
