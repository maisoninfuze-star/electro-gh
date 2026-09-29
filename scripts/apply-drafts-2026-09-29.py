"""Draft clean-up, 29 Sept 2026.

Every draft was compared, at full resolution, with the store's original
photos (~/Downloads/Electro/IMG_*.JPG). Only units whose render matches the
real machine are published. A price is used only when a sticker is readable
ON THAT UNIT; otherwise the owner chose "Prix sur demande" (ranges and
fridges only; laundry stays draft because it is mostly sold in sets).
Asserts before writing; writes atomically.
"""
import json, os, datetime

PATH = 'data/inventory.json'
TODAY = '29 sept 2026'
now = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')

doc = json.load(open(PATH))
by = {p['sku']: p for p in doc['products']}

def note(p, text):
    p['notes'] = (p.get('notes') or '').rstrip() + f'\n\n[{TODAY}] {text}'
    p['updatedAt'] = now

# ── Publish with the price read on the unit's own sticker ──────────────────
PRICED = {
    'GH-050': (600, 'KitchenAid', 'IMG_5675 : étiquette jaune « $600 » collée sur la bande vitrée de CETTE cuisinière (le second autocollant visible est son reflet dans la surface vitrée). Écusson KitchenAid sur la porte.'),
    'GH-057': (350, 'Admiral', 'IMG_5683 : pastille rouge « SALE $350 » collée sur la table de cuisson de CETTE cuisinière. ADMIRAL imprimé sur le dosseret.'),
    'GH-087': (239, 'Maytag', 'IMG_5722 : étiquette bleue manuscrite « 239$ » sur la vitre de CETTE cuisinière. MAYTAG imprimé sur le panneau de commande.'),
    'GH-089': (349, 'Whirlpool', 'IMG_5726 : étiquette bleue manuscrite « 349$ » sur la vitre de CETTE cuisinière. Écusson Whirlpool sur la porte.'),
}
for sku, (price, brand, why) in PRICED.items():
    p = by[sku]
    assert p['status'] == 'draft' and p['price'] == 0, sku
    assert p['category'] in ('ranges', 'refrigerators'), sku
    p.update(price=price, brand=brand, status='published')
    p.pop('priceOnRequest', None)
    note(p, f'PUBLIÉ. Prix lu sur l’appareil lui-même, en pleine résolution (manqué au catalogage sur photo réduite). {why} Image vérifiée conforme à la photo d’origine.')

# ── Publish as "Prix sur demande" (owner's choice, 29 sept) ─────────────────
ON_REQUEST = {
    'GH-037': None, 'GH-039': None, 'GH-041': None,
    'GH-043': 'LG',  # badge « LG » lisible sur la porte (IMG_5646)
    'GH-051': None, 'GH-052': None,
}
for sku, brand in ON_REQUEST.items():
    p = by[sku]
    assert p['status'] == 'draft' and p['price'] == 0, sku
    assert p['category'] in ('ranges', 'refrigerators'), sku
    if brand:
        assert not p['brand'], sku
        p['brand'] = brand
    p.update(status='published', priceOnRequest=True)
    note(p, 'PUBLIÉ en « Prix sur demande » sur instruction du propriétaire : aucun prix lisible sur les photos, image vérifiée conforme à la photo d’origine en pleine résolution. Saisir le prix dès qu’il est connu (le prix saisi remplace automatiquement la mention).'
         + (f' Marque {brand} lue sur l’écusson.' if brand else ''))

# ── Stay draft: the render invented parts of the machine ───────────────────
REJECT = {
    'GH-042': ('GE', 'L’image ajoute une rangée de 5 boutons en façade ; la vraie GE (IMG_5645) a ses 4 boutons sur le dosseret seulement.'),
    'GH-053': (None, 'L’image ajoute un distributeur d’eau ; le vrai Kenmore (IMG_5678) n’en a pas — le distributeur visible appartient au réfrigérateur voisin.'),
    'GH-078': ('LG', 'L’image montre des grilles de cuisinière AU GAZ, 8 boutons et un autre logo ; la vraie (IMG_5704) est une LG encastrable à 6 boutons.'),
    'GH-079': ('Whirlpool', 'L’image a 5 boutons et un logo illisible ; la vraie (IMG_5705) est une Whirlpool à 4 boutons.'),
    'GH-088': ('Kelvinator', 'L’image ajoute un 5e bouton ; la vraie (IMG_5724) est une Kelvinator à 4 boutons.'),
}
for sku, (brand, why) in REJECT.items():
    p = by[sku]
    assert p['status'] == 'draft', sku
    if brand:
        assert p['brand'] in ('', brand), sku
        p['brand'] = brand
    note(p, f'RESTE EN BROUILLON — photo à refaire. {why}' + (f' Marque {brand} lue sur la photo d’origine.' if brand else ''))

# ── Take down: live listing whose image carries two brand badges ───────────
p = by['GH-068']
assert p['status'] == 'published', 'GH-068'
p['status'] = 'draft'
note(p, 'RETIRÉ DU SITE (accord du propriétaire, 29 sept) : l’image porte à la fois un écusson SAMSUNG et un écusson LG. Le propriétaire veut aussi retirer cette laveuse seule au profit de l’ensemble GH-S14.')

# ── GH-066 identity, for the Samsung stack work ─────────────────────────────
p = by['GH-066']
note(p, 'IDENTITÉ VÉRIFIÉE : la photo d’origine (IMG_5694) montre la sécheuse Samsung ARGENT posée sur la laveuse gris foncé — c’est l’ensemble « B », pas l’ensemble GH-S14. L’image la montre BLANCHE : couleur fausse, photo à refaire.')

tmp = PATH + '.tmp'
with open(tmp, 'w') as f:
    json.dump(doc, f, ensure_ascii=False, indent=2)
    f.write('\n')
os.replace(tmp, PATH)
ps = doc['products']
print('published', sum(p['status'] == 'published' for p in ps), 'draft', sum(p['status'] == 'draft' for p in ps))
