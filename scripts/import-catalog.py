#!/usr/bin/env python3
"""
IMPORT — the 119-record photo catalogue into the site's inventory.

Source: /Users/inder/CHat/Electro/catalog/inventory.json  (119 provisional
records read off 161 shop photos) plus the white-background renders in
website-images/normalized/.

This REPLACES the previous 16 products. Those came from a 20-photo batch of the
same store on the same visit — perceptual hashing found 2 exact and ~12
near-duplicate photos — so keeping both would list the same physical machine
twice under two names and two prices.

Naming: the catalogue's English names are cataloguing shorthand
("White top-freezer refrigerator B", "... — adjacent unit", "... later batch").
The letter suffixes and locational tails disambiguate records for a human
reviewer and must never reach a customer, so they are stripped from the name
and preserved in the admin note. The rest is translated with real gender
agreement, not word substitution: a sécheuse is blanche, a réfrigérateur is
blanc.

Publishing rule, same as the rest of the site: a unit goes live only with a
confirmed individual price and an image. Everything else is a draft carrying a
note that says exactly what is missing.
"""
import json, re, unicodedata, shutil
from pathlib import Path
from datetime import datetime, timedelta

SITE = Path(__file__).resolve().parent.parent
CAT = Path('/Users/inder/CHat/Electro')
IMG_SRC = CAT / 'website-images' / 'normalized'
IMG_DST = SITE / 'public' / 'inventory'

# ── French vocabulary ──────────────────────────────────────────────────────
# (french, english, gender) — gender drives adjective agreement.
TYPES = [
    ('integrated laundry center', 'Centre de lavage intégré', 'Integrated laundry center', 'm', 'laundry-sets'),
    ('vintage coil-top electric range', 'Cuisinière électrique à éléments spiralés', 'Vintage coil-top electric range', 'f', 'ranges'),
    ('freestanding smooth-top range', 'Cuisinière autoportante à surface lisse', 'Freestanding smooth-top range', 'f', 'ranges'),
    ('freestanding electric range', 'Cuisinière électrique autoportante', 'Freestanding electric range', 'f', 'ranges'),
    ('slide-in electric range', 'Cuisinière électrique encastrable', 'Slide-in electric range', 'f', 'ranges'),
    ('slide-in smooth-top range', 'Cuisinière encastrable à surface lisse', 'Slide-in smooth-top range', 'f', 'ranges'),
    ('smooth-top range', 'Cuisinière à surface lisse', 'Smooth-top range', 'f', 'ranges'),
    ('slide-in range', 'Cuisinière encastrable', 'Slide-in range', 'f', 'ranges'),
    ('electric range', 'Cuisinière électrique', 'Electric range', 'f', 'ranges'),
    ('range', 'Cuisinière', 'Range', 'f', 'ranges'),
    ('built-in dishwasher', 'Lave-vaisselle encastré', 'Built-in dishwasher', 'm', 'dishwashers'),
    ('dishwasher', 'Lave-vaisselle', 'Dishwasher', 'm', 'dishwashers'),
    ('french-door refrigerator', 'Réfrigérateur à portes françaises', 'French-door refrigerator', 'm', 'refrigerators'),
    ('top-freezer refrigerator', 'Réfrigérateur à congélateur supérieur', 'Top-freezer refrigerator', 'm', 'refrigerators'),
    ('bottom-freezer refrigerator', 'Réfrigérateur à congélateur inférieur', 'Bottom-freezer refrigerator', 'm', 'refrigerators'),
    ('upright freezer or refrigerator', 'Congélateur ou réfrigérateur vertical', 'Upright freezer or refrigerator', 'm', 'freezers'),
    ('upright freezer', 'Congélateur vertical', 'Upright freezer', 'm', 'freezers'),
    ('refrigerator', 'Réfrigérateur', 'Refrigerator', 'm', 'refrigerators'),
    ('freezer', 'Congélateur', 'Freezer', 'm', 'freezers'),
    ('front-load dryer', 'Sécheuse frontale', 'Front-load dryer', 'f', 'dryers'),
    ('front-load washer', 'Laveuse frontale', 'Front-load washer', 'f', 'washers'),
    ('top-load washer', 'Laveuse à chargement par le haut', 'Top-load washer', 'f', 'washers'),
    ('dryer', 'Sécheuse', 'Dryer', 'f', 'dryers'),
    ('washer', 'Laveuse', 'Washer', 'f', 'washers'),
]

COLOURS = {
    'white':       ({'m': 'blanc', 'f': 'blanche'}, 'white', 'white'),
    'graphite':    ({'m': 'graphite', 'f': 'graphite'}, 'graphite', 'slate'),
    'stainless':   ({'m': 'en acier inoxydable', 'f': 'en acier inoxydable'}, 'stainless steel', 'stainless'),
    'silver':      ({'m': 'argent', 'f': 'argent'}, 'silver', 'slate'),
    'blue-gray':   ({'m': 'bleu-gris', 'f': 'bleu-gris'}, 'blue-grey', 'slate'),
    'gray':        ({'m': 'gris', 'f': 'grise'}, 'grey', 'slate'),
    'dark':        ({'m': 'foncé', 'f': 'foncée'}, 'dark', 'black'),
    'black':       ({'m': 'noir', 'f': 'noire'}, 'black', 'black'),
    'red':         ({'m': 'rouge', 'f': 'rouge'}, 'red', 'other'),
}

FEATURES = [
    ('with glass lid', 'couvercle vitré', 'glass lid'),
    ('with broad glass door', 'grande porte vitrée', 'broad glass door'),
    ('with rectangular glass door', 'porte vitrée rectangulaire', 'rectangular glass door'),
    ('with rectangular recessed handle', 'poignée rectangulaire encastrée', 'rectangular recessed handle'),
    ('with recessed handle', 'poignée encastrée', 'recessed handle'),
    ('with vertical handle', 'poignée verticale', 'vertical handle'),
    ('with side-mounted vertical handles', 'poignées verticales latérales', 'side-mounted vertical handles'),
    ('with curved handles', 'poignées incurvées', 'curved handles'),
    ('with wide horizontal handle', 'large poignée horizontale', 'wide horizontal handle'),
    ('with dark curved console', 'console incurvée foncée', 'dark curved console'),
    ('with gray five-knob console', 'console grise à cinq boutons', 'grey five-knob console'),
    ('with black console', 'console noire', 'black console'),
    ('with white console', 'console blanche', 'white console'),
    ('with blue console', 'console bleue', 'blue console'),
    ('with gray console', 'console grise', 'grey console'),
    ('with silver console', 'console argentée', 'silver console'),
    ('with central dial', 'cadran central', 'central dial'),
    ('with two dials', 'deux cadrans', 'two dials'),
    ('with three dials', 'trois cadrans', 'three dials'),
    ('with four rotary controls', 'quatre boutons rotatifs', 'four rotary controls'),
    ('with central touch controls', 'commandes tactiles centrales', 'central touch controls'),
    ('with wide touch panel', 'large panneau tactile', 'wide touch panel'),
    ('with touch panel', 'panneau tactile', 'touch panel'),
    ('with oval control panel', 'panneau de commande ovale', 'oval control panel'),
    ('with dispenser', 'distributeur', 'dispenser'),
    ('flat front', 'façade plate', 'flat front'),
]

# Cataloguing shorthand: useful to the reviewer, meaningless to a customer.
NOISE = [
    r',?\s*later batch', r',?\s*later view', r',?\s*stacked window display',
    r'\s*—\s*adjacent unit', r'\s*behind window [A-E]\b', r'\s*with blue price tag',
    r'\s*beneath [A-Za-z]+ dryer', r'\s*beneath [A-Za-z]+ washer',
]


def parse(name: str):
    """English catalogue name -> (fr, en, gender, category, finish, leftovers)."""
    s = name.strip()
    stripped = []
    for pat in NOISE:
        m = re.search(pat, s, flags=re.I)
        if m:
            stripped.append(m.group(0).strip(' ,—'))
            s = re.sub(pat, '', s, flags=re.I)
    # trailing single-letter disambiguator ("... refrigerator B")
    m = re.search(r'\s+([A-E])$', s)
    if m:
        stripped.append(f'variante {m.group(1)}')
        s = s[:m.start()]
    low = s.lower().strip().rstrip(',')

    colour_key = next((c for c in COLOURS if low.startswith(c)), None)
    rest = low[len(colour_key):].strip() if colour_key else low

    tkey = next((t for t in TYPES if t[0] in rest), None)
    if tkey is None:
        return None
    _, fr_type, en_type, gender, category = tkey
    rest = rest.replace(tkey[0], '', 1).strip(' ,')

    feats_fr, feats_en = [], []
    for eng, fr, en in FEATURES:
        if eng in rest:
            feats_fr.append(fr); feats_en.append(en)
            rest = rest.replace(eng, '', 1).strip(' ,')

    fr = fr_type
    en = en_type
    finish = None
    if colour_key:
        adj, en_col, finish = COLOURS[colour_key]
        fr = f'{fr_type} {adj[gender]}'
        en = f'{en_col.capitalize()} {en_type[0].lower()}{en_type[1:]}'
    if feats_fr:
        fr += ', ' + ', '.join(feats_fr)
        en += ', ' + ', '.join(feats_en)
    leftover = rest.strip(' ,')
    return fr, en, gender, category, finish, stripped, leftover


def photo_num(name):
    m = re.search(r'(\d{4})', name or '')
    return int(m.group(1)) if m else 0


def kind_of(r):
    """
    What THIS record is, not what stands next to it. The catalogue names
    neighbours for context — "Dark front-load washer beneath Samsung dryer"
    is a washer — so the neighbour clause is cut before matching, and
    'dishwasher' is tested before 'washer' because it contains it.
    """
    t = (r['name'] + ' ' + r.get('description', '')).lower()
    t = re.split(r'\bbeneath\b|\bbelow\b|\bunder\b|\babove\b', t)[0]
    if 'dishwasher' in t: return 'dishwasher'
    if 'laundry center' in t: return 'center'
    if 'dryer' in t: return 'dryer'
    if 'washer' in t: return 'washer'
    return 'other'


def find_pairs(records):
    """
    The shop sells most laundry as washer+dryer pairs, and the catalogue splits
    every pair into two records because it inventories one appliance per
    record. Worse, the set sticker is stuck on ONE machine, so its partner
    often carries no price at all — requiring both records to show the same set
    price found only 6 of them and missed the rest.

    Pair a washer with a dryer co-photographed or within 3 frames, when any of:
      a) both carry the same set (or unconfirmed-scope) price
      b) one carries a set price and the partner carries none
      c) the catalogue calls them a matched pair
      d) neither carries any price and they share one photograph

    Never pair a candidate that has its own INDIVIDUAL price — that machine is
    sold on its own, whatever stands beside it. The pair takes the set amount
    when one exists, and is a draft when it does not.
    """
    def setish(r):
        return [p['amount'] for p in r.get('prices', []) if p.get('scope') != 'individual']

    def individual(r):
        return [p['amount'] for p in r.get('prices', []) if p.get('scope') == 'individual']

    def eligible(r):
        # Sold on its own only if it has an individual price AND no set price.
        # AP-001 carries both ($300 alone, $650 as a pair) and must stay pairable.
        return not (individual(r) and not setish(r))

    laundry = [r for r in records if kind_of(r) in ('washer', 'dryer') and eligible(r)]
    dryers = [r for r in laundry if kind_of(r) == 'dryer']
    washers = [r for r in laundry if kind_of(r) == 'washer']

    # Score EVERY candidate pair, then assign best-first. Walking the list in
    # photo order and taking the first acceptable washer let an earlier dryer
    # steal a washer that belonged to a later, far better match.
    cands = []
    for d in dryers:
        for w in washers:
            gap = abs(photo_num(d['primary_photo']) - photo_num(w['primary_photo']))
            if gap > 3:
                continue
            same_photo = d['primary_photo'] == w['primary_photo']
            sd, sw = setish(d), setish(w)
            matched = 'matched pair' in (d['name'] + w['name']).lower()
            if sd and sw and sd[0] == sw[0]:
                reason, sc = "même étiquette d'ensemble (%s $)" % sd[0], 100
            elif (sd and not sw) or (sw and not sd):
                reason, sc = "étiquette d'ensemble (%s $) sur un seul des deux appareils" % (sd or sw)[0], 80
            elif matched:
                reason, sc = 'catalogue : « matched pair »', 70
            elif not sd and not sw and same_photo:
                reason, sc = 'photographiés ensemble, aucun prix visible', 50
            else:
                continue
            if same_photo:
                sc += 20
            if d.get('brand') == w.get('brand') and (d.get('brand') or 'Unknown') != 'Unknown':
                sc += 10
            sc -= 8 * gap
            cands.append((sc, reason, d, w))

    cands.sort(key=lambda c: (-c[0], c[2]['id']))
    pairs, used = [], set()
    for sc, reason, d, w in cands:
        if d['id'] in used or w['id'] in used:
            continue
        used.add(d['id']); used.add(w['id'])
        amt = (setish(d) or setish(w) or [0])[0]
        # Confident = photographed together, or the same brand. A cross-brand
        # pair inferred from two different frames is a proposal, not a fact
        # (the catalogue itself says "matching dryer not positively
        # identified"), so it is imported as a draft for the owner to confirm.
        confident = (d['primary_photo'] == w['primary_photo']
                     or (d.get('brand') == w.get('brand')
                         and (d.get('brand') or 'Unknown') != 'Unknown'))
        pairs.append((amt, w, d, reason, confident))
    pairs.sort(key=lambda p: p[2]['id'])
    return pairs, used


def slugify(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s)).strip('-')[:80]


def main():
    data = json.loads((CAT / 'catalog/inventory.json').read_text())
    records = data['products']
    IMG_DST.mkdir(parents=True, exist_ok=True)

    # Clear the old renders; the new set fully replaces them.
    for old in IMG_DST.glob('gh-*.webp'):
        old.unlink()

    products, unparsed, taken = [], [], {}
    base = datetime(2026, 9, 20, 12, 0, 0)

    pairs, paired_ids = find_pairs(records)
    print(f'{len(pairs)} washer+dryer sets identified')
    for amt, w, d, why, conf in pairs:
        price = f'${amt}' if amt else 'no price'
        print(f"   {price:9} {'OK ' if conf else 'chk'} {d['id']} ({d.get('brand')} dryer) + {w['id']} ({w.get('brand')} washer)   <- {why}")

    def copy_img(rec, alt):
        src = IMG_SRC / f"{rec['id']}.webp"
        if not src.exists(): return None
        dst = IMG_DST / f"{rec['id'].lower()}.webp"
        shutil.copy2(src, dst)
        return {'src': f'/inventory/{dst.name}', 'alt': alt,
                'width': 1600, 'height': 1600, 'kind': 'studio'}

    # ── Sets first ────────────────────────────────────────────────────────
    for n, (amt, w, d, why, confident) in enumerate(pairs):
        # 'Unknown' is a catalogue placeholder, never a brand a customer reads.
        wb = w.get('brand') if (w.get('brand') or 'Unknown') != 'Unknown' else ''
        db = d.get('brand') if (d.get('brand') or 'Unknown') != 'Unknown' else ''
        same = bool(wb) and wb == db
        brand = wb if same else ''
        wp = parse(w['name'])
        if same:
            fr = f'Ensemble laveuse et sécheuse {wb}'
            en = f'{wb} washer and dryer set'
        elif wb and db:
            fr = f'Ensemble laveuse {wb} et sécheuse {db}'
            en = f'{wb} washer and {db} dryer set'
        else:
            # One or both plates unreadable — name the pair, claim no brand.
            fr = 'Ensemble laveuse et sécheuse'
            en = 'Washer and dryer set'
        imgs = [im for im in (copy_img(w, fr), copy_img(d, fr)) if im]
        note = [
            f"Ensemble constitué à partir de deux fiches du catalogue photo "
            f"({w['id']} laveuse + {d['id']} sécheuse). Raison du jumelage : {why}.",
            ('Confirmer que les deux appareils se vendent bien ensemble à ce prix.'
             if amt else 'AUCUN PRIX visible sur les photos — à saisir avant publication.'),
            ('' if confident else
             'JUMELAGE À VÉRIFIER : marques différentes et appareils photographiés séparément. '
             'Confirmer que ces deux appareils forment bien l’ensemble avant de publier.'),
            'Numéros de modèle non lisibles sur les photos.',
        ]
        if not same:
            note.append(f'Marques différentes : laveuse {wb}, sécheuse {db}.')
        note.append(f"Photos sources : {w['primary_photo']}, {d['primary_photo']}.")
        slug = slugify(fr)
        taken.setdefault('laundry-sets', set())
        if slug in taken['laundry-sets']:
            k = 2
            while f'{slug}-{k}' in taken['laundry-sets']: k += 1
            slug = f'{slug}-{k}'
        taken['laundry-sets'].add(slug)
        products.append({
            'id': f"cat-set-{d['id'].lower()}",
            'slug': slug,
            'sku': f"GH-S{n+1:02d}",
            'brand': brand,
            'name': {'fr': fr, 'en': en},
            'description': {
                'fr': f"Ensemble laveuse et sécheuse vendu en paire. {w.get('description','')} {d.get('description','')}".strip(),
                'en': f"Washer and dryer sold as a pair. {w.get('description','')} {d.get('description','')}".strip(),
            },
            'category': 'laundry-sets',
            'price': amt,
            'condition': 'used',
            'inventoryStatus': 'in-stock',
            'finish': wp[4] if wp else None,
            'images': imgs,
            'featured': n < 4,
            'deal': False,
            'status': 'published' if (imgs and amt and confident) else 'draft',
            'notes': ' '.join(note),
            'createdAt': (base - timedelta(minutes=n)).isoformat(timespec='milliseconds') + 'Z',
            'updatedAt': (base - timedelta(minutes=n)).isoformat(timespec='milliseconds') + 'Z',
        })

    for i, r in enumerate(records):
        if r['id'] in paired_ids:
            continue
        parsed = parse(r['name'])
        if not parsed:
            unparsed.append((r['id'], r['name'])); continue
        fr, en, gender, category, finish, stripped, leftover = parsed

        img = IMG_SRC / f"{r['id']}.webp"
        images = []
        if img.exists():
            dst = IMG_DST / f"{r['id'].lower()}.webp"
            shutil.copy2(img, dst)
            images = [{'src': f'/inventory/{dst.name}', 'alt': fr,
                       'width': 1600, 'height': 1600, 'kind': 'studio'}]

        ind = [p for p in r.get('prices', []) if p.get('scope') == 'individual']
        setp = [p for p in r.get('prices', []) if p.get('scope') == 'set']
        other = [p for p in r.get('prices', []) if p.get('scope') not in ('individual', 'set')]

        # ONLY an individual price may be published. A set sticker ($650 for a
        # washer+dryer pair) attached to one machine is not that machine's
        # price, and publishing it would advertise a washer alone at the price
        # of the pair. Such a record carries the amount so the owner can see
        # it, but stays a draft until they confirm the unit price.
        price = ind[0]['amount'] if ind else (setp[0]['amount'] if setp else 0)
        price_is_individual = bool(ind)

        brand_known = (r.get('brand') or 'Unknown') != 'Unknown'
        status = 'published' if (price and images and price_is_individual) else 'draft'

        # Admin note: every reason this needs a human, in the owner's language.
        note = []
        if not price:
            note.append('Aucun prix lisible sur les photos.')
        elif not ind and setp:
            note.append(f"Prix affiché = prix d'ENSEMBLE ({setp[0]['amount']} $). Confirmer le prix à l'unité.")
        if other:
            note.append('Étiquette de prix dont la portée (unité ou ensemble) n’est pas confirmée.')
        if len(r.get('prices', [])) > 1:
            amounts = ', '.join(f"{p['amount']} $ ({p.get('scope')})" for p in r['prices'])
            note.append(f'Plusieurs étiquettes photographiées : {amounts}.')
        if not brand_known:
            note.append('Marque non lisible sur les photos — à confirmer sur la plaque signalétique.')
        note.append('Numéro de modèle non lisible sur les photos.')
        if stripped:
            note.append('Repères de catalogage : ' + ' ; '.join(stripped) + '.')
        if leftover:
            note.append(f'Détail non traduit : « {leftover} ».')
        for n in r.get('notes', []):
            note.append(n)
        if r.get('price_status'):
            note.append(r['price_status'])
        if kind_of(r) in ('washer', 'dryer'):
            note.append('Le magasin vend surtout les laveuses et sécheuses en ensemble — '
                        'confirmer si cet appareil se vend seul ou avec son partenaire.')
        note.append(f"Photos sources : {', '.join(r.get('source_photos', []))} (réf. catalogue {r['id']})")

        slug = slugify(fr)
        taken.setdefault(category, set())
        if slug in taken[category]:
            k = 2
            while f'{slug}-{k}' in taken[category]: k += 1
            slug = f'{slug}-{k}'
        taken[category].add(slug)

        products.append({
            'id': f"cat-{r['id'].lower()}",
            'slug': slug,
            'sku': r['id'].replace('AP-', 'GH-'),
            'brand': r['brand'] if brand_known else '',
            'name': {'fr': fr, 'en': en},
            'description': {'fr': r.get('description', ''), 'en': r.get('description', '')} if r.get('description') else None,
            'category': category,
            'price': price,
            'condition': 'used',
            'inventoryStatus': 'in-stock',
            'finish': finish,
            'images': images,
            'featured': False,
            'deal': False,
            'status': status,
            'notes': ' '.join(note),
            'createdAt': (base - timedelta(minutes=i * 3)).isoformat(timespec='milliseconds') + 'Z',
            'updatedAt': (base - timedelta(minutes=i * 3)).isoformat(timespec='milliseconds') + 'Z',
        })

    # Drop nulls so the JSON matches the optional fields in the Product type.
    for p in products:
        for k in [k for k, v in p.items() if v is None]:
            del p[k]

    (SITE / 'data/inventory.json').write_text(
        json.dumps({'products': products}, ensure_ascii=False, indent=2) + '\n')

    pub = sum(1 for p in products if p['status'] == 'published')
    print(f'{len(products)} products written ({pub} published, {len(products)-pub} draft)')
    if unparsed:
        print('UNPARSED NAMES:'); [print('  ', *u) for u in unparsed]
    import collections
    print('by category:', collections.Counter(p['category'] for p in products).most_common())
    print('images copied:', len(list(IMG_DST.glob('*.webp'))))


if __name__ == '__main__':
    main()
