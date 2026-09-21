import type { Locale } from './config';

/**
 * COPY DECK
 * =========
 * Written, not machine-translated. French is the source language and uses
 * Québec retail register ("magasiner", "aubaines", "nous joindre", "brassée").
 * English is a re-write for the same intent, not a gloss of the French.
 *
 * Nothing in here states a warranty term, delivery price, financing offer,
 * business age or stock count. Those come from content/business.ts and the
 * product feed, and are hidden when unverified.
 */

const fr = {
  meta: {
    localeName: 'Français',
    switchTo: 'English',
    switchToShort: 'EN',
  },

  common: {
    skipToContent: 'Aller au contenu principal',
    menu: 'Menu',
    close: 'Fermer',
    search: 'Rechercher',
    searchPlaceholder: 'Réfrigérateur, laveuse Samsung, cuisinière…',
    call: 'Appeler',
    callUs: 'Nous appeler',
    whatsapp: 'WhatsApp',
    directions: 'Itinéraire',
    getDirections: "Obtenir l'itinéraire",
    viewProduct: 'Voir le produit',
    viewAll: 'Tout voir',
    loading: 'Chargement…',
    demoNotice: 'Données de démonstration',
    demoNoticeLong:
      'Catalogue de démonstration. Ces produits ne représentent pas l’inventaire réel d’Électroménagers GH.',
    email: 'Courriel',
    montreal: 'Montréal',
    laval: 'Laval',
  },

  storeChooser: {
    title: 'Quel magasin?',
    callTitle: 'Appeler quel magasin?',
    directionsTitle: 'Itinéraire vers quel magasin?',
    both: 'Deux magasins : Montréal et Laval.',
  },

  nav: {
    shop: 'Électroménagers',
    refrigerators: 'Réfrigérateurs',
    laundry: 'Buanderie',
    cooking: 'Cuisson',
    dishwashers: 'Lave-vaisselle',
    deals: 'Aubaines',
    repair: 'Réparation',
    parts: 'Pièces',
    delivery: 'Livraison',
    stores: 'Nos magasins',
    contact: 'Nous joindre',
    servicesGroup: 'Services',
    allCategories: 'Toutes les catégories',
    cta: 'Voir les électros',
    laundryGroup: {
      washers: 'Laveuses',
      dryers: 'Sécheuses',
      sets: 'Ensembles laveuse-sécheuse',
    },
    cookingGroup: {
      ranges: 'Cuisinières',
      freezers: 'Congélateurs',
    },
  },

  hero: {
    headlineTop: 'Des électroménagers de qualité.',
    headlineBottom: 'À des prix qui font du sens.',
    body: 'Découvrez une sélection d’électroménagers pour tous les budgets, avec service local, livraison et accompagnement personnalisé, à Montréal et à Laval.',
    ctaPrimary: 'Voir nos électroménagers',
    ctaSecondary: 'Voir les offres',
    trust: ['Montréal & Laval', 'Achat & revente', 'Livraison disponible'],
  },

  categories: {
    eyebrow: 'Catégories',
    title: 'Qu’est-ce qu’on vous trouve aujourd’hui?',
    cta: 'Magasiner',
  },

  deals: {
    eyebrow: 'Aubaines',
    title: 'Les aubaines du moment.',
    body: 'Une sélection qui change au fil des arrivages.',
    cta: 'Voir le produit',
    secondaryCta: 'Question? Écrivez-nous',
    viewAll: 'Voir toutes les aubaines',
    save: 'Économisez',
    was: 'Avant',
  },

  why: {
    eyebrow: 'Pourquoi Electro GH',
    title: 'Simple. Local. Sans complications.',
    body: 'Trouver le bon électroménager ne devrait pas être compliqué. Notre équipe vous aide à comparer les options et choisir selon votre espace, vos besoins et votre budget.',
    points: {
      budget: {
        title: 'Des prix pour tous les budgets',
        body: 'Du modèle d’entrée de gamme à l’électro haut de gamme, on a quelque chose dans votre fourchette.',
      },
      brands: {
        title: 'Multimarques',
        body: 'Plusieurs marques sous un même toit, pour comparer côte à côte au lieu de magasiner à l’aveugle.',
      },
      delivery: {
        title: 'Livraison disponible',
        body: 'On organise la livraison de votre achat. Parlez-nous de votre adresse et de votre échéancier.',
      },
      local: {
        title: 'Deux magasins',
        body: 'À Montréal et à Laval, joignables au téléphone, en français, en anglais et en arabe.',
      },
      buyback: {
        title: 'Achat & revente',
        body: 'On achète et on revend des électroménagers. Vous avez un appareil à vendre? Parlez-nous-en.',
      },
      repair: {
        title: 'Service de réparation',
        body: 'Un appareil qui fait des siennes? Décrivez-nous le problème et le modèle, on vous dit quoi faire.',
      },
      guidance: {
        title: 'Accompagnement personnalisé',
        body: 'On mesure, on vérifie les dimensions et on vous dit franchement si un modèle entre chez vous.',
      },
      warranty: {
        title: 'Garantie disponible',
        body: 'Des options de garantie sont offertes. Demandez-nous les détails pour le modèle qui vous intéresse.',
      },
    },
  },

  rooms: {
    eyebrow: 'Magasiner par pièce',
    kitchen: {
      title: 'Cuisine',
      body: 'Tout pour une cuisine qui travaille aussi bien qu’elle paraît.',
      cta: 'Magasiner la cuisine',
    },
    laundry: {
      title: 'Buanderie',
      body: 'Des solutions fiables pour simplifier chaque brassée.',
      cta: 'Magasiner la buanderie',
    },
  },

  dealBanner: {
    headlineTop: 'Plus de valeur.',
    headlineBottom: 'Moins cher.',
    body: 'Découvrez nos offres, liquidations et arrivages sélectionnés.',
    cta: 'Découvrir les aubaines',
  },

  howItWorks: {
    eyebrow: 'Comment ça marche',
    title: 'Votre prochain électro en 3 étapes.',
    steps: [
      { n: '01', title: 'Choisissez', body: 'Parcourez les modèles disponibles.' },
      {
        n: '02',
        title: 'Parlez à notre équipe',
        body: 'Confirmez le produit, les dimensions et les détails.',
      },
      {
        n: '03',
        title: 'Planifiez la livraison',
        body: 'Nous vous aidons à organiser la prochaine étape.',
      },
    ],
  },

  arrivals: {
    eyebrow: 'Arrivages',
    title: 'Nouvel arrivage chez Electro GH',
    body: 'L’inventaire change chaque semaine. Voici ce qui vient d’entrer en magasin.',
    cta: 'Voir tout l’inventaire',
    empty: 'Les nouveaux arrivages seront affichés ici.',
  },

  reviews: {
    eyebrow: 'Avis',
    title: 'Des clients bien équipés.',
    onGoogle: 'sur Google',
    empty: 'Les avis Google s’afficheront ici une fois la fiche connectée.',
    devOnly:
      'Aperçu de développement — aucun avis réel n’est connecté. Rien ne s’affiche en production tant que la fiche Google n’est pas branchée.',
  },

  showroom: {
    eyebrow: 'Nos magasins',
    title: 'Venez les voir en personne.',
    body: 'Deux magasins, à Montréal et à Laval. Rien ne remplace le fait de voir l’électro devant soi, d’ouvrir la porte et de poser vos questions à quelqu’un.',
    allStores: 'Voir nos deux magasins',
    hoursUnknown: 'Appelez-nous pour confirmer les heures d’ouverture.',
    hoursTitle: 'Heures d’ouverture',
    mapLabel: 'Carte de la salle de montre Électroménagers GH',
  },

  footer: {
    tagline: 'Électroménagers pour la maison. Achat & revente, à Montréal et à Laval.',
    shop: 'Magasiner',
    company: 'Services',
    contact: 'Nous joindre',
    langs: 'Service en français, en anglais et en arabe.',
    rights: 'Tous droits réservés.',
    demoBuild: 'Site de démonstration — contenu en cours de validation.',
  },

  catalog: {
    resultsOne: 'produit',
    resultsMany: 'produits',
    filters: 'Filtres',
    filter: 'Filtrer',
    clearAll: 'Tout effacer',
    clear: 'Effacer',
    apply: 'Voir les résultats',
    sort: 'Trier',
    sortOptions: {
      featured: 'En vedette',
      priceAsc: 'Prix croissant',
      priceDesc: 'Prix décroissant',
      newest: 'Plus récents',
      savings: 'Meilleures économies',
    },
    facets: {
      category: 'Catégorie',
      brand: 'Marque',
      price: 'Prix',
      condition: 'État',
      width: 'Largeur',
      colour: 'Couleur / Fini',
      availability: 'Disponibilité',
    },
    priceUnder: 'Moins de',
    priceOver: 'Plus de',
    empty: {
      title: 'Aucun produit ne correspond.',
      body: 'Essayez d’élargir vos filtres, ou écrivez-nous — l’inventaire change souvent et on peut vous avertir.',
      cta: 'Réinitialiser les filtres',
    },
    emptyStock: {
      title: 'Cette catégorie est vide pour le moment.',
      body: 'L’inventaire change chaque semaine. Appelez-nous pour savoir ce qui s’en vient.',
    },
  },

  product: {
    backTo: 'Retour à',
    model: 'Modèle',
    sku: 'Code',
    condition: 'État',
    ctaCall: 'Appeler pour ce produit',
    ctaReserve: 'Réserver ce produit',
    ctaWhatsapp: 'WhatsApp',
    reassuranceTitle: 'Besoin d’aide?',
    reassuranceBody:
      'Notre équipe peut confirmer la disponibilité et répondre à vos questions.',
    tabs: {
      description: 'Description',
      specs: 'Caractéristiques',
      dimensions: 'Dimensions',
      condition: 'État du produit',
      delivery: 'Livraison',
      warranty: 'Garantie',
    },
    dimensionLabels: {
      width: 'Largeur',
      height: 'Hauteur',
      depth: 'Profondeur',
      depthWithDoorOpen: 'Profondeur, porte ouverte',
      weight: 'Poids',
    },
    fitWarning:
      'Mesurez votre ouverture ainsi que les portes et corridors du trajet avant l’achat. On peut valider les mesures avec vous.',
    warrantyUnknown:
      'Des options de garantie sont offertes. Appelez-nous pour connaître ce qui s’applique à ce modèle.',
    deliveryUnknown:
      'La livraison est disponible. Contactez-nous avec votre code postal pour les détails et la planification.',
    specsUnknown:
      'Les caractéristiques détaillées de ce modèle n’ont pas encore été saisies. Notre équipe peut vous les confirmer.',
    related: 'Vous pourriez aussi aimer',
    gallery: 'Photos du produit',
    imagePending: 'Photo à venir',
    referenceBadge: 'Photo de référence',
    referenceLabel: 'Photo de référence du fabricant — l’appareil réel est photographié dans les autres images.',
    /** `{product}` is substituted at the call site — see lib/i18n/interpolate.ts.
     *  Kept as a plain string, not a function: dictionaries cross the
     *  server/client boundary and functions are not serialisable. */
    inquirePrefill:
      'Bonjour Electro GH, je suis intéressé(e) par {product}. Est-il encore disponible?',
  },

  pages: {
    repair: {
      eyebrow: 'Service de réparation',
      title: 'On répare aussi.',
      lead: 'Un électroménager qui ne fonctionne plus comme avant? Électroménagers GH offre un service de réparation. Un appel suffit pour savoir si on peut vous aider.',
      steps: [
        { n: '01', title: 'Appelez-nous', body: 'Au magasin le plus proche de chez vous, Montréal ou Laval.' },
        { n: '02', title: 'Décrivez le problème', body: 'Le type d’appareil, la marque, le modèle si vous l’avez, et ce qui ne va pas.' },
        { n: '03', title: 'On vous dit quoi faire', body: 'Notre équipe vous indique la prochaine étape.' },
      ],
      cta: 'Appeler pour une réparation',
      tipTitle: 'Avant d’appeler',
      tip: 'Le numéro de modèle se trouve généralement sur une étiquette à l’intérieur de la porte, sur le cadre ou à l’arrière de l’appareil. L’avoir en main accélère tout.',
      detailsPending: 'Les détails du service — appareils couverts, délais et tarifs — vous seront confirmés par téléphone.',
    },
    parts: {
      eyebrow: 'Pièces',
      title: 'La bonne pièce, pour le bon modèle.',
      lead: 'Nous offrons des pièces d’électroménagers. Ayez le numéro de modèle de votre appareil en main et appelez-nous : on vérifie ce qu’on peut vous trouver.',
      steps: [
        { n: '01', title: 'Trouvez le numéro de modèle', body: 'Sur l’étiquette à l’intérieur de la porte, sur le cadre ou à l’arrière de l’appareil.' },
        { n: '02', title: 'Appelez-nous', body: 'Décrivez la pièce dont vous avez besoin, ou le problème qu’elle doit régler.' },
        { n: '03', title: 'On vérifie', body: 'Disponibilité et prochaine étape, confirmés par téléphone.' },
      ],
      cta: 'Appeler pour une pièce',
      tipTitle: 'Pourquoi le numéro de modèle',
      tip: 'Deux appareils qui se ressemblent peuvent utiliser des pièces différentes. Le numéro de modèle évite les erreurs.',
      detailsPending: 'Disponibilité et prix confirmés par téléphone.',
    },
    delivery: {
      eyebrow: 'Livraison',
      title: 'On vous le livre.',
      lead: 'La livraison est disponible pour vos achats. Les modalités dépendent de votre adresse et de l’appareil — contactez-nous avec votre code postal pour tout organiser.',
      steps: [
        { n: '01', title: 'Mesurez', body: 'L’ouverture prévue pour l’appareil, mais aussi les portes, escaliers et corridors sur le trajet.' },
        { n: '02', title: 'Dégagez le passage', body: 'Le chemin jusqu’à l’emplacement final doit être libre le jour de la livraison.' },
        { n: '03', title: 'On planifie', body: 'Parlez-nous de votre adresse et de vos disponibilités. On organise la suite.' },
      ],
      cta: 'Appeler pour la livraison',
      tipTitle: 'Un doute sur les dimensions?',
      tip: 'On peut valider les mesures avec vous avant l’achat. Mieux vaut une question de plus qu’un appareil qui ne passe pas la porte.',
      detailsPending: 'Les frais et les délais de livraison vous sont confirmés au moment de l’achat.',
    },
    stores: {
      eyebrow: 'Nos magasins',
      title: 'Deux magasins, une même équipe.',
      lead: 'Venez voir les appareils en personne, à Montréal ou à Laval. Service en français, en anglais et en arabe.',
      hoursTitle: 'Heures d’ouverture',
      hoursUnknown: 'Appelez pour confirmer les heures d’ouverture.',
      call: 'Appeler ce magasin',
      directions: 'Itinéraire',
      mapLabel: 'Carte du magasin Électroménagers GH de {city}',
    },
    contact: {
      eyebrow: 'Nous joindre',
      title: 'Parlez-nous.',
      lead: 'Par téléphone, par courriel ou en magasin — en français, en anglais ou en arabe. Pour un produit précis, le plus rapide est d’appeler le magasin.',
      phones: 'Par téléphone',
      emailTitle: 'Par courriel',
      emailBody: 'Pour une question sans urgence, ou pour nous envoyer une photo de l’étiquette de votre appareil.',
      visit: 'En magasin',
      visitBody: 'Deux adresses, à Montréal et à Laval.',
      visitCta: 'Voir nos magasins',
      buybackTitle: 'Vous avez un électro à vendre?',
      buybackBody: 'On achète aussi des électroménagers. Appelez-nous pour en discuter.',
    },
  },

  condition: {
    new: 'Neuf',
    used: 'Usagé',
    refurbished: 'Reconditionné',
    openBox: 'Boîte ouverte',
    clearance: 'Liquidation',
  },

  availability: {
    inStock: 'En stock',
    lowStock: 'Faible stock',
    onRequest: 'Sur demande',
  },

  mobileBar: { call: 'Appeler', whatsapp: 'WhatsApp', directions: 'Itinéraire' },
};

/** English is typed against the French deck, so a missing key is a build error. */
type Dict = typeof fr;

const en: Dict = {
  meta: { localeName: 'English', switchTo: 'Français', switchToShort: 'FR' },

  common: {
    skipToContent: 'Skip to main content',
    menu: 'Menu',
    close: 'Close',
    search: 'Search',
    searchPlaceholder: 'Refrigerator, Samsung washer, range…',
    call: 'Call',
    callUs: 'Call us',
    whatsapp: 'WhatsApp',
    directions: 'Directions',
    getDirections: 'Get directions',
    viewProduct: 'View product',
    viewAll: 'View all',
    loading: 'Loading…',
    demoNotice: 'Demo data',
    demoNoticeLong:
      'Demonstration catalogue. These products do not represent the real inventory of Électroménagers GH.',
    email: 'Email',
    montreal: 'Montréal',
    laval: 'Laval',
  },

  storeChooser: {
    title: 'Which store?',
    callTitle: 'Call which store?',
    directionsTitle: 'Directions to which store?',
    both: 'Two stores: Montréal and Laval.',
  },

  nav: {
    shop: 'Appliances',
    refrigerators: 'Refrigerators',
    laundry: 'Laundry',
    cooking: 'Cooking',
    dishwashers: 'Dishwashers',
    deals: 'Deals',
    repair: 'Repair',
    parts: 'Parts',
    delivery: 'Delivery',
    stores: 'Our stores',
    contact: 'Contact',
    servicesGroup: 'Services',
    allCategories: 'All categories',
    cta: 'Browse appliances',
    laundryGroup: { washers: 'Washers', dryers: 'Dryers', sets: 'Washer & dryer sets' },
    cookingGroup: { ranges: 'Ranges & stoves', freezers: 'Freezers' },
  },

  hero: {
    headlineTop: 'Quality appliances.',
    headlineBottom: 'At prices that make sense.',
    body: 'A selection of home appliances for every budget, with local service, delivery and one-on-one guidance, in Montréal and Laval.',
    ctaPrimary: 'Browse appliances',
    ctaSecondary: 'See the deals',
    trust: ['Montréal & Laval', 'We buy & sell', 'Delivery available'],
  },

  categories: {
    eyebrow: 'Categories',
    title: 'What are we finding you today?',
    cta: 'Shop',
  },

  deals: {
    eyebrow: 'Deals',
    title: 'This week’s best value.',
    body: 'A selection that changes as new stock arrives.',
    cta: 'View product',
    secondaryCta: 'Questions? Message us',
    viewAll: 'See all deals',
    save: 'Save',
    was: 'Was',
  },

  why: {
    eyebrow: 'Why Electro GH',
    title: 'Simple. Local. No runaround.',
    body: 'Finding the right appliance shouldn’t be complicated. Our team helps you compare the options and choose based on your space, your needs and your budget.',
    points: {
      budget: {
        title: 'Prices for every budget',
        body: 'From entry-level to high-end, there is something here in your range.',
      },
      brands: {
        title: 'Multiple brands',
        body: 'Several brands under one roof, so you can compare side by side instead of shopping blind.',
      },
      delivery: {
        title: 'Delivery available',
        body: 'We arrange delivery for your purchase. Tell us your address and your timing.',
      },
      local: {
        title: 'Two stores',
        body: 'In Montréal and Laval, a phone call away, in French, English or Arabic.',
      },
      buyback: {
        title: 'We buy & sell',
        body: 'We buy appliances as well as sell them. Have one to sell? Talk to us.',
      },
      repair: {
        title: 'Repair service',
        body: 'Appliance acting up? Describe the problem and the model, and we’ll tell you what to do next.',
      },
      guidance: {
        title: 'One-on-one guidance',
        body: 'We check the dimensions and tell you straight whether a model actually fits your space.',
      },
      warranty: {
        title: 'Warranty available',
        body: 'Warranty options are offered. Ask us what applies to the model you have in mind.',
      },
    },
  },

  rooms: {
    eyebrow: 'Shop by room',
    kitchen: {
      title: 'Kitchen',
      body: 'Everything for a kitchen that works as well as it looks.',
      cta: 'Shop the kitchen',
    },
    laundry: {
      title: 'Laundry',
      body: 'Dependable machines that make every load simpler.',
      cta: 'Shop the laundry room',
    },
  },

  dealBanner: {
    headlineTop: 'More value.',
    headlineBottom: 'Less money.',
    body: 'Browse our offers, clearance and selected new arrivals.',
    cta: 'See the deals',
  },

  howItWorks: {
    eyebrow: 'How it works',
    title: 'Your next appliance in 3 steps.',
    steps: [
      { n: '01', title: 'Choose', body: 'Browse the models currently available.' },
      { n: '02', title: 'Talk to our team', body: 'Confirm the product, the dimensions and the details.' },
      { n: '03', title: 'Plan the delivery', body: 'We help you organise the next step.' },
    ],
  },

  arrivals: {
    eyebrow: 'New arrivals',
    title: 'Just arrived at Electro GH',
    body: 'Inventory changes every week. Here’s what just came into the showroom.',
    cta: 'See all inventory',
    empty: 'New arrivals will appear here.',
  },

  reviews: {
    eyebrow: 'Reviews',
    title: 'Customers, properly equipped.',
    onGoogle: 'on Google',
    empty: 'Google reviews will appear here once the profile is connected.',
    devOnly:
      'Development preview — no real reviews are connected. Nothing renders in production until the Google profile is wired up.',
  },

  showroom: {
    eyebrow: 'Our stores',
    title: 'Come see them in person.',
    body: 'Two stores, in Montréal and Laval. Nothing beats standing in front of the appliance, opening the door, and asking someone your questions.',
    allStores: 'See both stores',
    hoursUnknown: 'Please call to confirm our opening hours.',
    hoursTitle: 'Opening hours',
    mapLabel: 'Map of the Électroménagers GH showroom',
  },

  footer: {
    tagline: 'Home appliances. We buy & sell, in Montréal and Laval.',
    shop: 'Shop',
    company: 'Services',
    contact: 'Contact',
    langs: 'Service in French, English and Arabic.',
    rights: 'All rights reserved.',
    demoBuild: 'Demonstration site — content pending client validation.',
  },

  catalog: {
    resultsOne: 'product',
    resultsMany: 'products',
    filters: 'Filters',
    filter: 'Filter',
    clearAll: 'Clear all',
    clear: 'Clear',
    apply: 'Show results',
    sort: 'Sort',
    sortOptions: {
      featured: 'Featured',
      priceAsc: 'Price, low to high',
      priceDesc: 'Price, high to low',
      newest: 'Newest',
      savings: 'Biggest savings',
    },
    facets: {
      category: 'Category',
      brand: 'Brand',
      price: 'Price',
      condition: 'Condition',
      width: 'Width',
      colour: 'Colour / Finish',
      availability: 'Availability',
    },
    priceUnder: 'Under',
    priceOver: 'Over',
    empty: {
      title: 'No products match.',
      body: 'Try widening your filters, or message us — inventory turns over often and we can let you know.',
      cta: 'Reset filters',
    },
    emptyStock: {
      title: 'This category is empty right now.',
      body: 'Inventory changes weekly. Call us to hear what’s coming in.',
    },
  },

  product: {
    backTo: 'Back to',
    model: 'Model',
    sku: 'SKU',
    condition: 'Condition',
    ctaCall: 'Call about this product',
    ctaReserve: 'Reserve this product',
    ctaWhatsapp: 'WhatsApp',
    reassuranceTitle: 'Need a hand?',
    reassuranceBody: 'Our team can confirm availability and answer your questions.',
    tabs: {
      description: 'Description',
      specs: 'Specifications',
      dimensions: 'Dimensions',
      condition: 'Product condition',
      delivery: 'Delivery',
      warranty: 'Warranty',
    },
    dimensionLabels: {
      width: 'Width',
      height: 'Height',
      depth: 'Depth',
      depthWithDoorOpen: 'Depth, door open',
      weight: 'Weight',
    },
    fitWarning:
      'Measure your opening, plus the doors and hallways along the route, before buying. We can check the measurements with you.',
    warrantyUnknown:
      'Warranty options are offered. Call us to find out what applies to this model.',
    deliveryUnknown:
      'Delivery is available. Contact us with your postal code for details and scheduling.',
    specsUnknown:
      'Detailed specifications for this model haven’t been entered yet. Our team can confirm them for you.',
    related: 'You might also like',
    gallery: 'Product photos',
    imagePending: 'Photo coming soon',
    referenceBadge: 'Reference photo',
    referenceLabel: 'Manufacturer reference photo — the actual unit is shown in the other images.',
    inquirePrefill:
      "Hello Electro GH, I'm interested in {product}. Is it still available?",
  },

  pages: {
    repair: {
      eyebrow: 'Repair service',
      title: 'We fix them too.',
      lead: 'An appliance that isn’t working the way it used to? Électroménagers GH offers a repair service. One call is enough to find out whether we can help.',
      steps: [
        { n: '01', title: 'Call us', body: 'At whichever store is closer to you, Montréal or Laval.' },
        { n: '02', title: 'Describe the problem', body: 'The type of appliance, the brand, the model if you have it, and what’s going wrong.' },
        { n: '03', title: 'We tell you what’s next', body: 'Our team lays out the next step.' },
      ],
      cta: 'Call about a repair',
      tipTitle: 'Before you call',
      tip: 'The model number is usually on a label inside the door, on the frame, or on the back of the appliance. Having it ready speeds everything up.',
      detailsPending: 'Service details — appliances covered, timing and rates — are confirmed by phone.',
    },
    parts: {
      eyebrow: 'Parts',
      title: 'The right part, for the right model.',
      lead: 'We offer appliance parts. Have your appliance’s model number ready and call us: we’ll check what we can find for you.',
      steps: [
        { n: '01', title: 'Find the model number', body: 'On the label inside the door, on the frame, or on the back of the appliance.' },
        { n: '02', title: 'Call us', body: 'Describe the part you need, or the problem it should fix.' },
        { n: '03', title: 'We check', body: 'Availability and next step, confirmed by phone.' },
      ],
      cta: 'Call about a part',
      tipTitle: 'Why the model number matters',
      tip: 'Two appliances that look alike can use different parts. The model number is what prevents mistakes.',
      detailsPending: 'Availability and pricing confirmed by phone.',
    },
    delivery: {
      eyebrow: 'Delivery',
      title: 'We bring it to you.',
      lead: 'Delivery is available for your purchases. The details depend on your address and the appliance — contact us with your postal code and we’ll arrange everything.',
      steps: [
        { n: '01', title: 'Measure', body: 'The opening for the appliance, but also the doors, stairs and hallways along the route.' },
        { n: '02', title: 'Clear the path', body: 'The way to the final spot needs to be free on delivery day.' },
        { n: '03', title: 'We schedule', body: 'Tell us your address and your availability. We organise the rest.' },
      ],
      cta: 'Call about delivery',
      tipTitle: 'Unsure about the dimensions?',
      tip: 'We can check the measurements with you before you buy. One extra question beats an appliance that won’t fit through the door.',
      detailsPending: 'Delivery fees and timing are confirmed at the time of purchase.',
    },
    stores: {
      eyebrow: 'Our stores',
      title: 'Two stores, one team.',
      lead: 'Come see the appliances in person, in Montréal or Laval. Service in French, English and Arabic.',
      hoursTitle: 'Opening hours',
      hoursUnknown: 'Please call to confirm opening hours.',
      call: 'Call this store',
      directions: 'Directions',
      mapLabel: 'Map of the Électroménagers GH {city} store',
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Talk to us.',
      lead: 'By phone, by email or in store — in French, English or Arabic. For a specific product, the fastest route is to call the store.',
      phones: 'By phone',
      emailTitle: 'By email',
      emailBody: 'For a non-urgent question, or to send us a photo of your appliance’s label.',
      visit: 'In store',
      visitBody: 'Two addresses, in Montréal and Laval.',
      visitCta: 'See our stores',
      buybackTitle: 'Have an appliance to sell?',
      buybackBody: 'We buy appliances too. Call us to talk it over.',
    },
  },

  condition: {
    new: 'New',
    used: 'Used',
    refurbished: 'Refurbished',
    openBox: 'Open box',
    clearance: 'Clearance',
  },

  availability: { inStock: 'In stock', lowStock: 'Low stock', onRequest: 'On request' },

  mobileBar: { call: 'Call', whatsapp: 'WhatsApp', directions: 'Directions' },
};

export const DICTIONARIES: Record<Locale, Dict> = { fr, en };
export type Dictionary = Dict;
export const getDictionary = (locale: Locale): Dict => DICTIONARIES[locale];
