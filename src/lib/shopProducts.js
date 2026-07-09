// Official Bingoo NFC Product Catalog — 10 branded products
// Each maps to a Stripe product in createShopCheckout backend function.

export const PRODUCTS = [
  {
    id: 'nfc-card',
    name: 'NFC Card',
    tagline: 'Tap to share your full profile instantly.',
    description: 'Premium matte black PVC NFC card with official Bingoo branding and embossed infinity logo. Pre-programmed with your digital profile. Works with all NFC-enabled smartphones — no app required.',
    price: 19.99,
    image: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/579589e5c_generated_image.png',
    category: 'card',
    badge: 'Best Seller',
    activationCode: 'BNG-00001',
    features: [
      'Premium matte PVC finish',
      'Embossed Bingoo infinity logo',
      'Pre-programmed with your profile',
      'Waterproof & scratch-resistant',
    ],
  },
  {
    id: 'nfc-keychain',
    name: 'NFC Keychain',
    tagline: 'Always on you. Always ready to share.',
    description: 'Compact round navy NFC keychain tag with official Bingoo branding. Attaches to any key ring and shares your full digital profile with a single tap.',
    price: 14.99,
    image: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/490b649b9_generated_image.png',
    category: 'keychain',
    badge: null,
    activationCode: 'BNG-00002',
    features: [
      'Durable round NFC tag',
      'Matte navy finish',
      'Fits any standard key ring',
      'Works with all NFC phones',
    ],
  },
  {
    id: 'nfc-metal-card',
    name: 'NFC Metal Card',
    tagline: 'Premium brushed metal. Built to impress.',
    description: 'Luxury brushed gunmetal NFC business card with subtle Bingoo infinity branding. The ultimate premium networking tool for executives and professionals.',
    price: 29.99,
    image: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/03d00e1da_generated_image.png',
    category: 'card',
    badge: 'Premium',
    activationCode: 'BNG-00003',
    features: [
      'Brushed gunmetal finish',
      'Heavy-duty premium build',
      'Engraved Bingoo logo',
      'Lifetime durability',
    ],
  },
  {
    id: 'nfc-wood-card',
    name: 'NFC Wood Card',
    tagline: 'Natural elegance. Sustainable networking.',
    description: 'Dark stained walnut wood NFC card with visible grain texture and orange Bingoo infinity logo. A distinctive, eco-friendly networking statement.',
    price: 27.99,
    image: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/1a5773539_generated_image.png',
    category: 'card',
    badge: 'Eco',
    activationCode: 'BNG-00004',
    features: [
      'Real walnut wood grain',
      'Matte stained finish',
      'Unique natural texture',
      'Embedded NFC chip',
    ],
  },
  {
    id: 'nfc-sticker',
    name: 'NFC Sticker',
    tagline: 'Stick it anywhere. Share everywhere.',
    description: 'Round navy NFC sticker with strong adhesive backing and Bingoo branding. Perfect for laptops, windows, storefronts, and any flat surface.',
    price: 7.99,
    image: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/41b35e638_generated_image.png',
    category: 'sticker',
    badge: null,
    activationCode: 'BNG-00005',
    features: [
      'Strong adhesive backing',
      'Ultra-thin round design',
      'Works on most flat surfaces',
      'Matte navy finish',
    ],
  },
  {
    id: 'nfc-bracelet',
    name: 'NFC Bracelet',
    tagline: 'Wear your profile. Share with a tap.',
    description: 'Comfortable navy silicone NFC wristband with official Bingoo logo. Share your digital profile directly from your wrist with a single tap.',
    price: 24.99,
    image: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/2dd53607e_generated_image.png',
    category: 'bracelet',
    badge: 'Wearable',
    activationCode: 'BNG-00006',
    features: [
      'Soft silicone wristband',
      'Water-resistant design',
      'Matte navy finish',
      'Works with all NFC phones',
    ],
  },
  {
    id: 'nfc-silicone-tag',
    name: 'NFC Silicone Tag',
    tagline: 'Durable. Flexible. Always shareable.',
    description: 'Matte navy silicone teardrop NFC tag with Bingoo branding. Soft, durable, and perfect for bags, lanyards, and everyday carry.',
    price: 12.99,
    image: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/9b2b123df_generated_image.png',
    category: 'tag',
    badge: null,
    activationCode: 'BNG-00007',
    features: [
      'Soft silicone teardrop',
      'Durable & flexible',
      'Matte navy finish',
      'Embedded NFC chip',
    ],
  },
  {
    id: 'nfc-key-fob',
    name: 'NFC Key Fob',
    tagline: 'Compact tag on a keyring. Tap anytime.',
    description: 'Matte navy teardrop NFC key fob with silver keyring attachment and Bingoo branding. The classic keychain form factor, refined.',
    price: 11.99,
    image: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/7f3c6a842_generated_image.png',
    category: 'keychain',
    badge: null,
    activationCode: 'BNG-00008',
    features: [
      'Teardrop key fob design',
      'Silver keyring included',
      'Matte navy finish',
      'Compact & lightweight',
    ],
  },
  {
    id: 'nfc-table-stand',
    name: 'NFC Table Stand',
    tagline: 'Let clients tap and connect at your counter.',
    description: 'Sleek navy NFC counter stand for salons, offices, restaurants, and reception desks. Place it on any surface and let clients tap to connect.',
    price: 34.99,
    image: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/ba2752299_generated_image.png',
    category: 'stand',
    badge: 'Counter',
    activationCode: 'BNG-00009',
    features: [
      'Stable weighted base',
      'Embedded NFC chip',
      'Matte navy finish',
      'Ideal for countertops & desks',
    ],
  },
  {
    id: 'nfc-phone-stand',
    name: 'NFC Phone Stand',
    tagline: 'Hold your phone. Share your profile.',
    description: 'Matte navy NFC phone stand with angled holder and embedded Bingoo chip. Doubles as a desk accessory and a tap-to-connect point.',
    price: 22.99,
    image: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/58823bec7_generated_image.png',
    category: 'stand',
    badge: 'Desk',
    activationCode: 'BNG-00010',
    features: [
      'Angled phone holder',
      'Embedded NFC chip',
      'Matte navy finish',
      'Perfect desk companion',
    ],
  },
];

// ── Color & Material Options per product category ───────────────────────────
export const PRODUCT_OPTIONS = {
  card: {
    colors: [
      { name: 'Navy', value: '#0b2149' },
      { name: 'Black', value: '#0F172A' },
      { name: 'Orange', value: '#f97316' },
      { name: 'White', value: '#F1F5F9' },
    ],
    materials: [
      { name: 'Matte PVC', value: 'matte' },
      { name: 'Brushed Metal', value: 'metal' },
      { name: 'Wood', value: 'wood' },
      { name: 'Frosted', value: 'frosted' },
    ],
  },
  keychain: {
    colors: [
      { name: 'Navy', value: '#0b2149' },
      { name: 'Black', value: '#0F172A' },
      { name: 'Orange', value: '#f97316' },
    ],
    materials: [
      { name: 'Silicone', value: 'silicone' },
      { name: 'Metal', value: 'metal' },
    ],
  },
  sticker: {
    colors: [
      { name: 'Navy', value: '#0b2149' },
      { name: 'Black', value: '#0F172A' },
      { name: 'Orange', value: '#f97316' },
      { name: 'White', value: '#F1F5F9' },
    ],
    materials: [{ name: 'Vinyl', value: 'vinyl' }],
  },
  bracelet: {
    colors: [
      { name: 'Navy', value: '#0b2149' },
      { name: 'Black', value: '#0F172A' },
      { name: 'Orange', value: '#f97316' },
    ],
    materials: [{ name: 'Silicone', value: 'silicone' }],
  },
  tag: {
    colors: [
      { name: 'Navy', value: '#0b2149' },
      { name: 'Black', value: '#0F172A' },
      { name: 'Orange', value: '#f97316' },
    ],
    materials: [{ name: 'Silicone', value: 'silicone' }],
  },
  stand: {
    colors: [
      { name: 'Navy', value: '#0b2149' },
      { name: 'Black', value: '#0F172A' },
      { name: 'White', value: '#F1F5F9' },
    ],
    materials: [
      { name: 'ABS Plastic', value: 'abs' },
      { name: 'Metal', value: 'metal' },
    ],
  },
};

// ── "Perfect For" audience tags per product category ─────────────────────────
export const PERFECT_FOR = {
  card:     ['Attorneys', 'Realtors', 'Consultants', 'Agents', 'Executives'],
  keychain: ['Drivers', 'Field Reps', 'Students', 'Event Staff'],
  sticker:  ['Retailers', 'Cafés', 'Gyms', 'Startups'],
  bracelet: ['Event Planners', 'Festivals', 'Sports Teams', 'Staff'],
  tag:      ['Travelers', 'Lanyard Users', 'Teachers', 'Coaches'],
  stand:    ['Salons', 'Restaurants', 'Reception', 'Retail Counters'],
};

// ── Shared activation steps ──────────────────────────────────────────────────
export const ACTIVATION_STEPS = [
  'Receive your device in the mail',
  'Enter device code at bingooconnect.com/activate',
  'Link to your Bingoo profile',
  'Tap to share — done!',
];