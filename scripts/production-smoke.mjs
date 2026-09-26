import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };

const app = read('src/App.jsx');
const srcFiles = [];
const walk = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = dir + '/' + entry.name;
    if (entry.isDirectory()) walk(p);
    else srcFiles.push(p);
  }
};
walk('src');
walk('public');
const clientText = srcFiles.map(read).join('\n');

check(!app.includes('path="/playstore-mockups"'), 'Public /playstore-mockups route must not exist');
check(!app.includes('path="/bingoo-2-mockups"'), 'Public /bingoo-2-mockups route must not exist');
for (const route of ['/admin', '/monitor', '/shop-admin', '/playstore-capture']) {
  const line = app.split('\n').find(l => l.includes(`path="${route}"`)) || '';
  check(line.includes('AdminAuthGuard'), `${route} must remain wrapped in AdminAuthGuard`);
}

check(!/sk_(live|test)_[A-Za-z0-9]/.test(clientText), 'Stripe secret literal found in client/public source');
check(!/STRIPE_SECRET_KEY/.test(clientText), 'STRIPE_SECRET_KEY must not be referenced in client/public source');
check(clientText.includes('bingooconnect.com'), 'Canonical bingooconnect.com domain missing from production client source');
check(!clientText.includes('preview--bingooconnect.base44.app'), 'Preview Base44 public URL found in production client source');

const checkout = read('base44/functions/createShopCheckout/entry.ts');
check(checkout.includes('MAX_QUANTITY_PER_ITEM'), 'Checkout quantity cap missing');
check(checkout.includes('NFC_PRODUCTS[item.product_id]'), 'Server-side checkout catalog validation missing');
check(checkout.includes('productSubtotalCents'), 'Server-authoritative checkout subtotal calculation missing');

const nfcSources = [
  read('src/lib/nfcUrl.js'),
  read('base44/functions/stripeWebhook/entry.ts'),
  read('base44/functions/createShopCheckout/entry.ts'),
].join('\n');
check(nfcSources.includes('/d/'), 'Canonical NFC /d/ identity route missing');

if (failures.length) {
  console.error('Bingoo production smoke/security checks FAILED');
  failures.forEach(f => console.error(' - ' + f));
  process.exit(1);
}
console.log('Bingoo production smoke/security checks PASS');
console.log('Verified: mock routes hidden, admin guards, client secret hygiene, canonical domain, server checkout authority, NFC /d/ identity.');
