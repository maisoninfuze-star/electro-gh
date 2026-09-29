"""Owner's photos of 29 Sept 2026 → four new listings.

Images are cut from the owner's own photos (Apple Vision mask + hand split,
white balance only) or, for the Samsung shot close between other fridges,
a plain crop. Nothing is redrawn. Prices only where a sticker is readable on
that unit; brands only where a badge is readable.
"""
import json, os, datetime

PATH = 'data/inventory.json'
now = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
doc = json.load(open(PATH))
skus = {p['sku'] for p in doc['products']}
ids = {p['id'] for p in doc['products']}

def img(src, alt, kind):
    assert os.path.exists('public' + src), src
    return {'src': src, 'alt': alt, 'width': 1600, 'height': 1600, 'kind': kind}

NEW = [
  dict(id='gh-s19', sku='GH-S19', slug='ensemble-laveuse-a-chargement-par-le-haut-et-secheuse-blanc',
       brand='', category='laundry-sets', price=0, priceOnRequest=True, finish='white', storeId='laval',
       name={'fr': 'Ensemble laveuse à chargement par le haut et sécheuse, blanc',
             'en': 'Top-load washer and dryer set, white'},
       description={'fr': 'Laveuse à chargement par le haut et sécheuse assortie, toutes deux blanches avec panneau de commande électronique. La sécheuse a une porte à grand hublot. Vendues ensemble.',
                    'en': 'Top-load washer with a matching dryer, both white with electronic control panels. The dryer has a large windowed door. Sold as a pair.'},
       image=('/inventory/gh-s19-pair.webp', 'studio'), source='owner-2026-09-29-28.webp',
       notes='Photo du propriétaire (29 sept) prise devant le magasin de LAVAL (3576, chemin du Souvenir). Ensemble : laveuse à chargement par le haut (gauche) + sécheuse (droite). Aucun prix visible → « Prix sur demande » (consigne du propriétaire pour les ensembles). Marque non lisible sur la photo (écussons trop petits) — à confirmer. Image : masque Apple Vision sur la photo réelle + balance des blancs (reflet bleu du ciel), aucun pixel redessiné.'),
  dict(id='gh-120', sku='GH-120', slug='refrigerateur-a-portes-francaises-samsung-ecran-tactile-distributeur',
       brand='Samsung', category='refrigerators', price=850, finish='stainless',
       name={'fr': 'Réfrigérateur à portes françaises Samsung avec écran tactile et distributeur',
             'en': 'Samsung French-door refrigerator with touchscreen and dispenser'},
       description={'fr': 'Réfrigérateur à portes françaises en acier inoxydable avec écran tactile intégré à la porte droite, distributeur d’eau, de glaçons et de glace concassée, et tiroir congélateur en bas.',
                    'en': 'Stainless steel French-door refrigerator with a touchscreen built into the right door, a water, cubed-ice and crushed-ice dispenser, and a bottom freezer drawer.'},
       image=('/inventory/gh-120.webp', 'original'), source='owner-2026-09-29-30.webp',
       notes='Photo du propriétaire (29 sept). Étiquette jaune « $850 » collée sur la porte droite de CE réfrigérateur ; écusson SAMSUNG sur la même porte. Image : recadrage de la photo réelle (le bas du tiroir sort du cadre et d’autres réfrigérateurs le touchent des deux côtés — un détourage sur blanc aurait paru tronqué).'),
  dict(id='gh-121', sku='GH-121', slug='refrigerateur-sans-congelateur-blanc-une-porte',
       brand='', category='refrigerators', price=0, priceOnRequest=True, finish='white',
       name={'fr': 'Réfrigérateur sans congélateur blanc, une porte',
             'en': 'White all-refrigerator, single door'},
       description={'fr': 'Réfrigérateur pleine hauteur à une seule porte, sans compartiment congélateur, blanc, avec commandes électroniques sur la porte.',
                    'en': 'Full-height single-door refrigerator with no freezer compartment, white, with electronic controls on the door.'},
       image=('/inventory/gh-121.webp', 'studio'), source='owner-2026-09-29-29.webp',
       notes='Photo du propriétaire (29 sept), appareil de GAUCHE des deux. Le propriétaire confirme : réfrigérateur (tout-réfrigérateur), pas un congélateur. Aucun prix visible → « Prix sur demande ». Marque non lisible (écusson ovale trop petit).'),
  dict(id='gh-122', sku='GH-122', slug='refrigerateur-sans-congelateur-blanc-une-porte-2',
       brand='', category='refrigerators', price=0, priceOnRequest=True, finish='white',
       name={'fr': 'Réfrigérateur sans congélateur blanc, une porte',
             'en': 'White all-refrigerator, single door'},
       description={'fr': 'Réfrigérateur pleine hauteur à une seule porte, sans compartiment congélateur, blanc, avec commandes électroniques sur la porte.',
                    'en': 'Full-height single-door refrigerator with no freezer compartment, white, with electronic controls on the door.'},
       image=('/inventory/gh-122.webp', 'studio'), source='owner-2026-09-29-29.webp',
       notes='Photo du propriétaire (29 sept), appareil de DROITE des deux. Pastille rouge « SALE » sur la porte, montant ILLISIBLE sur la photo → « Prix sur demande » en attendant le prix. Marque non lisible.'),
]

for n in NEW:
    assert n['sku'] not in skus and n['id'] not in ids, n['sku']
    src, kind = n.pop('image'); source = n.pop('source')
    p = {**n, 'condition': 'used', 'inventoryStatus': 'in-stock',
         'images': [img(src, n['name']['fr'], kind)], 'featured': False, 'deal': False,
         'status': 'published', 'sourcePhotos': [source], 'createdAt': now, 'updatedAt': now}
    assert os.path.exists('data/source-photos/' + source)
    if not p['brand']: p['brand'] = ''
    doc['products'].append(p)

tmp = PATH + '.tmp'
with open(tmp, 'w') as f:
    json.dump(doc, f, ensure_ascii=False, indent=2); f.write('\n')
os.replace(tmp, PATH)
print(len(doc['products']), 'products;', sum(p['status'] == 'published' for p in doc['products']), 'published')
