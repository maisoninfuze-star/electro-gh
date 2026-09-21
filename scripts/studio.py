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
  5:  dict(box=(215, 150, 1440, 1140), poly=[(12,5),(1178,15),(1180,990),(8,990)]),  # Samsung white dryer (set A); neighbour at right excluded
  6:  dict(box=(0, 790, 1512, 1690), plain=True),   # Samsung VRT washer panel+door, hose and floor excluded
  7:  dict(box=(410, 420, 1265, 1600)),         # GE dryer, chrome
  8:  dict(box=(130, 520, 1450, 1990), plain=True), # Samsung platinum washer (VRT Steam) — partial view, plain
  9:  dict(box=(110, 210, 1460, 1910), poly=[(55,35),(1292,35),(1292,1180),(1255,1330),(60,1345)]),  # Samsung white dryer between two white machines
  10: dict(box=(40, 340, 1435, 2016), poly=[(40,40),(1245,40),(1290,1460),(60,1470)]),  # Samsung white washer $799 set
  11: dict(box=(385, 455, 1420, 1565), plain=True),  # Samsung white dryer (set B) — white on white wall; the model lifts only the door glass, so plain
  12: dict(box=(60, 780, 1470, 1745), plain=True),  # Samsung VRTplus washer panel+door, floor excluded
  13: dict(box=(320, 480, 1260, 1900)),         # Frigidaire dryer
  14: dict(box=(405, 565, 1265, 1585)),         # Frigidaire Gallery dishwasher, cardboard base excluded
  15: dict(box=(480, 730, 1235, 1980), poly=[(35,0),(690,0),(700,900),(30,900)]),  # Samsung platinum washer SALE 499
  16: dict(box=(270, 270, 1440, 2016)),         # Samsung black dryer on pedestal
  17: dict(box=(330, 380, 1300, 2016)),         # Samsung black AddWash washer
  18: dict(box=(200, 300, 1960, 1512), all=True),  # Maytag pair (landscape)
  19: dict(box=(340, 300, 1440, 1990)),         # Kenmore dryer (Amana neighbour cropped out)
  20: dict(box=(0, 300, 1400, 1960), all=True), # Amana washer (left) + dryer
  21: dict(box=(240, 560, 1512, 2016), plain=True), # Samsung grey top-load dryer — lid view
}

def keep_largest_region(fg: Image.Image) -> Image.Image:
  """
  The cutout model returns every foreground pixel it found, including slivers
  of the machines on either side. Those slivers are never connected to the
  subject, so: label connected regions of the alpha (on a 1/4-scale mask —
  plenty for blobs that are hundreds of pixels apart), keep the largest, and
  dilate it a little so the subject's own edge pixels survive.
  """
  import numpy as np
  from collections import deque
  a = np.array(fg.split()[3])
  H, W = a.shape
  f = 4
  small = (a[::f, ::f] > 8)
  h, w = small.shape
  labels = np.zeros((h, w), dtype=np.int32)
  sizes = {}
  cur = 0
  for y in range(h):
    for x in range(w):
      if small[y, x] and labels[y, x] == 0:
        cur += 1; n = 0
        q = deque([(y, x)]); labels[y, x] = cur
        while q:
          cy, cx = q.popleft(); n += 1
          for ny, nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
            if 0 <= ny < h and 0 <= nx < w and small[ny, nx] and labels[ny, nx] == 0:
              labels[ny, nx] = cur; q.append((ny, nx))
        sizes[cur] = n
  if len(sizes) <= 1:
    return fg
  best = max(sizes, key=sizes.get)
  keep = (labels == best)
  # Dilate by 2 cells (= 8px) so we never shave the subject's anti-aliased edge.
  k = keep.copy()
  for _ in range(2):
    k2 = k.copy()
    k2[1:, :] |= k[:-1, :]; k2[:-1, :] |= k[1:, :]
    k2[:, 1:] |= k[:, :-1]; k2[:, :-1] |= k[:, 1:]
    k = k2
  mask_small = Image.fromarray((k * 255).astype('uint8'))
  mask = mask_small.resize((W, H), Image.NEAREST)
  new_alpha = Image.fromarray(np.minimum(a, np.array(mask)).astype('uint8'))
  out = fg.copy(); out.putalpha(new_alpha)
  dropped = sum(v for k_, v in sizes.items() if k_ != best)
  print(f'   regions={len(sizes)} kept={sizes[best]} dropped={dropped} cells')
  return out

CANVAS = (242, 239, 234)      # --color-surface-2 #f2efea — the card and gallery background, so the plate is invisible

def cut_part(n, box, tag):
  im = ImageOps.exif_transpose(Image.open(RAW/f'{n}.jpg')).convert('RGB').crop(box)
  tmp = CUT/f'{n}-{tag}.jpg'; im.save(tmp, quality=95)
  png = CUT/f'{n}-{tag}.png'
  r = subprocess.run([str(CUTOUT), str(tmp), str(png)], capture_output=True, text=True)
  if r.returncode != 0: return None
  fg = keep_largest_region(Image.open(png).convert('RGBA'))
  b = fg.getbbox()
  return fg.crop(b) if b else None

def studio(n: int):
  spec = CROPS[n]
  if 'stack' in spec:
    # Stacked pair: the cutout model lifts the top unit and loses the lower
    # one, so cut them from the same photo separately and re-join, each part
    # scaled to the same width so the seam lines up.
    parts = [cut_part(n, b, f'p{i}') for i, b in enumerate(spec['stack'])]
    if any(p is None for p in parts):
      print(f'{n}: stack part failed'); return
    w = max(p.width for p in parts)
    parts = [p.resize((w, int(p.height * w / p.width)), Image.LANCZOS) for p in parts]
    fg = Image.new('RGBA', (w, sum(p.height for p in parts)), (0,0,0,0))
    y = 0
    for p_ in parts:
      fg.alpha_composite(p_, (0, y)); y += p_.height
    im = fg
    return compose(n, fg)
  im = ImageOps.exif_transpose(Image.open(RAW/f'{n}.jpg')).convert('RGB')
  im = im.crop(spec['box'])
  tmp = CUT/f'{n}-crop.jpg'; im.save(tmp, quality=95)
  cut_png = CUT/f'{n}.png'
  fg = None
  if not spec.get('plain'):
    args = [str(CUTOUT), str(tmp), str(cut_png)] + (['--all'] if spec.get('all') else [])
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode == 0:
      fg = keep_largest_region(Image.open(cut_png).convert('RGBA'))
      # Hand-placed silhouette, in crop coordinates. A front-facing appliance
      # is a quadrilateral; intersecting the model's alpha with it drops the
      # neighbours the model fused in at the margins without inventing a
      # single pixel — everything kept is the model's own alpha.
      if 'poly' in spec:
        from PIL import ImageDraw
        m = Image.new('L', fg.size, 0)
        ImageDraw.Draw(m).polygon(spec['poly'], fill=255)
        m = m.filter(ImageFilter.GaussianBlur(1.2))
        a = fg.split()[3]
        fg.putalpha(Image.fromarray(__import__('numpy').minimum(__import__('numpy').array(a), __import__('numpy').array(m)).astype('uint8')))
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
  return compose(n, fg)

def compose(n, fg):

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
