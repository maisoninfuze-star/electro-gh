#!/usr/bin/env python3
"""
Take the products whose image does not depict the machine for sale OFF the
public site, and correct two records whose TEXT was wrong as well.

A wrong photo on a retail listing is a misrepresentation, not a cosmetic bug:
the customer drives to Montréal for the fridge in the picture. Demoting to
draft keeps the record, the price and the notes for the owner while removing
it from the storefront until a correct photo exists.

Evidence for the two retitles, read off the owner's own photographs:

  IMG_5680 / IMG_5681 show three machines side by side.
    · LEFT   Frigidaire Gallery, ONE full-height door, one long handle,
             round red "SALE $499" sticker.
    · CENTRE Kenmore, bottom-freezer (top door + bottom drawer), yellow
             starburst "$499".
    · RIGHT  a third stainless unit, partially framed.

  GH-055 is the CENTRE machine — bottom-freezer is right, but the brand is
  Kenmore and its current image shows a french-door with a water dispenser.
  GH-056 is the LEFT machine — it is NOT a top-freezer; it is a single-door
  upright. Both its title and its image were wrong.

The retouched image supplied for GH-055 on 28 Sept is refused for the second
time: it puts the LEFT machine's Frigidaire Gallery badge and red SALE sticker
onto the CENTRE machine's bottom-freezer body.
"""
import json
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
data = json.loads((SITE / 'data/inventory.json').read_text())
by = {p['sku']: p for p in data['products']}

DEMOTE = {
    'GH-027': "L'image montre une laveuse frontale ; la photo d'origine montre une sécheuse. Photo à refaire.",
    'GH-031': "L'image montre une cuisinière double four ; la photo d'origine montre une cuisinière encastrée sous un micro-ondes. Photo à refaire.",
    'GH-055': "L'image montre un réfrigérateur à portes françaises avec distributeur ; l'appareil réel est le Kenmore à congélateur inférieur (macaron jaune 499 $) d'IMG_5680. Photo à refaire.",
    'GH-056': "Titre et image corrigés d'après IMG_5681 : l'appareil est un Frigidaire Gallery à UNE SEULE PORTE (pastille rouge SALE 499 $), pas un congélateur supérieur. Photo à refaire.",
    'GH-063': "L'image est un réfrigérateur blanc à 4 portes ; la photo d'origine montre un Frigidaire blanc à 2 portes, macaron jaune 350 $. Photo à refaire.",
    'GH-119': "Le bleu de l'image vient du reflet de la vitrine sur la photo d'origine ; l'appareil n'est pas bleu. Photo à refaire.",
    'GH-028': "L'image montre un petit réfrigérateur d'appartement ; la photo d'origine montre un grand LG inox à congélateur supérieur. Photo à refaire.",
    'GH-114': "Photo d'origine prise à travers la vitrine, très réfléchissante : impossible de confirmer que l'image correspond à l'appareil. Retirée du site en attendant une photo vérifiable.",
}

RETITLE = {
    'GH-055': {
        'brand': 'Kenmore',
        'fr': 'Réfrigérateur à congélateur inférieur Kenmore, acier inoxydable',
        'en': 'Kenmore bottom-freezer refrigerator, stainless steel',
    },
    'GH-056': {
        'brand': 'Frigidaire',
        'fr': 'Réfrigérateur une porte Frigidaire Gallery, acier inoxydable',
        'en': 'Frigidaire Gallery single-door refrigerator, stainless steel',
    },
}

changed = []
for sku, reason in DEMOTE.items():
    p = by.get(sku)
    if not p:
        print(f'!! {sku} not found'); continue
    was = p['status']
    p['status'] = 'draft'
    p['notes'] = (reason + ' ' + (p.get('notes') or '')).strip()
    if sku in RETITLE:
        r = RETITLE[sku]
        p['brand'] = r['brand']
        p['name'] = {'fr': r['fr'], 'en': r['en']}
        for img in p['images']:
            img['alt'] = r['fr']
    changed.append((sku, was, p['status']))

(SITE / 'data/inventory.json').write_text(
    json.dumps(data, ensure_ascii=False, indent=2) + '\n')

for sku, was, now in changed:
    print(f'{sku}: {was} -> {now}')
pub = sum(1 for p in data['products'] if p['status'] == 'published')
print(f"\n{len(data['products'])} products, {pub} published, {len(data['products'])-pub} draft")
