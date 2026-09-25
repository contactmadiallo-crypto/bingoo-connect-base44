const COLLECTION_FR = {
  professional: { label: 'Professionnel & Réseautage', headline: 'Partagez votre profil professionnel partout.', bestFor: 'Professionnels indépendants, réseautage, réunions et événements.' },
  business: { label: 'Entreprises & Équipes', headline: 'Transformez chaque lieu physique en point de connexion.', bestFor: 'Accueil, bureaux, salons, restaurants et équipes.' },
  asset: { label: 'Protection des actifs', headline: 'Donnez une identité numérique à vos objets de valeur.', bestFor: 'Bagages, animaux, sacs, clés et objets portables.' },
  premium: { label: 'Collection Premium', headline: 'Faites une première impression haut de gamme.', bestFor: 'Dirigeants et professionnels recherchant du matériel premium.' },
};

const PRODUCT_FR = {
  'nfc-card': {
    name: 'Carte NFC',
    tagline: 'Touchez pour partager instantanément votre profil complet.',
    description: 'Carte NFC en PVC noir mat premium avec marque Bingoo officielle et logo infini embossé. Préprogrammée avec votre profil numérique. Fonctionne avec les smartphones compatibles NFC — aucune application requise.',
    badge: 'Meilleure vente', bestFor: 'Réseautage professionnel',
    features: ['Finition PVC mate premium','Logo infini Bingoo embossé','Préprogrammée avec votre profil','Résistante à l’eau et aux rayures'],
  },
  'nfc-keychain': {
    name: 'Porte-clés NFC', tagline: 'Toujours avec vous. Toujours prêt à partager.',
    description: 'Porte-clés NFC rond bleu marine compact avec marque Bingoo officielle. Se fixe à tout anneau de clés et partage votre profil numérique complet d’un simple geste.',
    bestFor: 'Usage quotidien', features: ['Tag NFC rond et durable','Finition bleu marine mate','Compatible avec tout anneau de clés standard','Fonctionne avec tous les téléphones NFC'],
  },
  'nfc-bracelet': {
    name: 'Bracelet NFC', tagline: 'Portez votre profil. Partagez d’un geste.',
    description: 'Bracelet NFC en silicone bleu marine confortable avec logo Bingoo officiel. Partagez votre profil numérique directement depuis votre poignet.',
    badge: 'Portable', bestFor: 'Événements & réseautage', features: ['Bracelet en silicone souple','Conception résistante à l’eau','Finition bleu marine mate','Fonctionne avec tous les téléphones NFC'],
  },
  'nfc-sticker': {
    name: 'Autocollant NFC', tagline: 'Collez-le partout. Partagez partout.',
    description: 'Autocollant NFC rond bleu marine avec adhésif puissant et marque Bingoo. Idéal pour ordinateurs portables, vitrines, devantures et surfaces planes.',
    bestFor: 'Partage flexible', features: ['Adhésif puissant','Design rond ultra-fin','Fonctionne sur la plupart des surfaces planes','Finition bleu marine mate'],
  },
  'nfc-metal-card': {
    name: 'Carte NFC métal', tagline: 'Métal brossé premium. Conçue pour impressionner.',
    description: 'Carte professionnelle NFC de luxe en métal gunmetal brossé avec marque Bingoo infini discrète. Un outil premium pour dirigeants et professionnels.',
    badge: 'Vedette', bestFor: 'Réseautage premium', features: ['Finition gunmetal brossée','Construction premium robuste','Logo Bingoo gravé','Durabilité longue durée'],
  },
  'nfc-wood-card': {
    name: 'Carte NFC bois', tagline: 'Élégance naturelle. Réseautage durable.',
    description: 'Carte NFC en bois de noyer teinté foncé avec veinage visible et logo infini Bingoo orange. Une présence distinctive et écoresponsable.',
    badge: 'Éco', bestFor: 'Premium naturel', features: ['Véritable veinage de noyer','Finition teintée mate','Texture naturelle unique','Puce NFC intégrée'],
  },
  'nfc-table-stand': {
    name: 'Support de table NFC', tagline: 'Laissez vos clients toucher et se connecter au comptoir.',
    description: 'Support NFC bleu marine élégant pour salons, bureaux, restaurants et accueils. Posez-le sur une surface et laissez les clients se connecter d’un geste.',
    badge: 'Comptoir', bestFor: 'Accueil & comptoirs', features: ['Base stable et lestée','Puce NFC intégrée','Finition bleu marine mate','Idéal pour comptoirs et bureaux'],
  },
  'nfc-phone-stand': {
    name: 'Support téléphone NFC', tagline: 'Posez votre téléphone. Partagez votre profil.',
    description: 'Support téléphone NFC bleu marine mat avec inclinaison et puce Bingoo intégrée. À la fois accessoire de bureau et point de connexion.',
    badge: 'Bureau', bestFor: 'Bureaux & espaces de travail', features: ['Support téléphone incliné','Puce NFC intégrée','Finition bleu marine mate','Compagnon de bureau idéal'],
  },
  'nfc-luggage-tag': {
    name: 'Étiquette bagage NFC', tagline: 'Ne perdez plus vos bagages. Touchez pour les récupérer.',
    description: 'Étiquette bagage NFC bleu marine premium avec code QR de secours et marque Bingoo. Si l’objet est perdu, un scan ou un geste ouvre vos informations de récupération sécurisées — sans application.',
    badge: 'Voyage', bestFor: 'Valises & sacs de voyage', features: ['NFC + code QR de secours','Matériau durable pour le voyage','Liée au profil d’actif du bagage','Le Mode Perdu affiche les informations de récupération','Aucune application requise'],
  },
  'nfc-pet-collar': {
    name: 'Médaille NFC pour animal', tagline: 'Gardez votre compagnon en sécurité. Touchez pour l’identifier.',
    description: 'Médaille NFC bleu marine durable avec marque Bingoo. Se fixe au collier et se relie au profil d’actif de votre animal. En cas de perte, le contact de récupération s’affiche instantanément.',
    badge: 'Sécurité animal', bestFor: 'Identification & récupération des animaux', features: ['Silicone durable et sûr pour animaux','Compatible avec les colliers standards','Liée au profil d’actif de l’animal','Le Mode Perdu affiche les informations de récupération','Résistante à l’eau et aux intempéries'],
  },
  'nfc-silicone-tag': {
    name: 'Tag NFC silicone', tagline: 'Durable. Flexible. Toujours partageable.',
    description: 'Tag NFC goutte en silicone bleu marine mat avec marque Bingoo. Souple, durable et idéal pour sacs, tours de cou et usage quotidien.',
    bestFor: 'Sacs & équipements', features: ['Silicone souple en forme de goutte','Durable et flexible','Finition bleu marine mate','Puce NFC intégrée'],
  },
  'nfc-key-fob': {
    name: 'Porte-clés tag NFC', tagline: 'Tag compact sur anneau. Touchez à tout moment.',
    description: 'Porte-clés NFC bleu marine mat en forme de goutte avec anneau argenté et marque Bingoo. Le format classique, revisité.',
    bestFor: 'Clés & actifs portables', features: ['Design goutte compact','Anneau argenté inclus','Finition bleu marine mate','Compact et léger'],
  },
};

export function localizeCollection(collection, language) {
  if (!collection || language !== 'fr') return collection;
  return { ...collection, ...(COLLECTION_FR[collection.id] || {}) };
}

export function localizeShopProduct(product, language) {
  if (!product || language !== 'fr') return product;
  return { ...product, ...(PRODUCT_FR[product.id] || {}) };
}
