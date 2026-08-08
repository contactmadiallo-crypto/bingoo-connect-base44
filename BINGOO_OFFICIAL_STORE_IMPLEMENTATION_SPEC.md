# Bingoo Connect — Official Store Implementation Spec

## Status

**Production implementation contract for Base44 / Codex.**

This document is the source of truth for the Bingoo Connect NFC hardware storefront experience.

The Shop is not a landing-page mockup. It is a real ecommerce store that customers will use to buy Bingoo NFC hardware and that can also be shown to a supplier/factory as the intended physical product direction.

---

# 1. Non-negotiable product rule

**One SKU = one physical design = one product story everywhere.**

The same product must look and read consistently across:

`Landing Store -> /shop -> /product/:id -> Cart -> Checkout -> Order Confirmation`

Do not show a different design for the same SKU on different pages.

Do not place CSS-generated/cartoon hardware shapes on top of real product photography.

Do not use decorative mock hardware to represent a purchasable product.

Use the real catalog product media through the shared product media system.

Current shared presentation path:

- `src/lib/shopProducts.js`
- `src/components/shop/FactoryProductMedia.jsx`
- `src/components/landing/LandingShop.jsx`
- `src/pages/Shop.jsx`
- `src/pages/ProductDetail.jsx`
- `src/pages/Cart.jsx`
- `src/pages/Checkout.jsx`

---

# 2. Official physical design language

All Bingoo hardware should feel like one product family.

## Core visual direction

- Premium consumer electronics / modern business hardware
- Matte black, graphite, dark navy, natural dark wood
- Orange infinity mark as the main recognizable Bingoo hardware symbol
- Minimal branding
- No old crowded artwork
- No printed social-media icon grid
- No legacy busy Bingoo card face
- Product photography should look factory-real, not cartoon-like
- Neutral white / light gray studio background for catalog images
- Clean soft shadows
- Consistent camera angle and scale per category

## Metal Card flagship

The Metal Card is the flagship Bingoo Connect device.

### Front

- Matte black / brushed graphite metal
- Single orange infinity mark centered
- Small `BINGOO CONNECT` wordmark only when appropriate
- No extra visual clutter

### Back

- Activation QR
- Device code area
- NFC indicator
- Small Bingoo Connect branding

Internal activation codes must never be displayed publicly in the storefront catalog. Activation/manufacturing values are operational data handled by Bingoo/admin/backend.

## Wood Card

- Dark walnut / premium natural wood
- Clean orange infinity mark
- Minimal branding
- Same proportions and industrial design language as the Metal Card

## Small tags / key accessories

- Dark navy / graphite silicone or polymer body
- Orange infinity mark
- Premium metal ring/hardware when applicable
- Avoid oversized printed logos

## Asset devices

- Must visibly feel like real recovery hardware
- Use NFC + QR where appropriate
- Clear durable attachment method
- Clean Bingoo mark
- Do not imply GPS tracking unless a real GPS-capable product exists

---

# 3. Real store architecture — preserve existing commerce

Do **not** replace the current Stripe architecture.

Keep and improve the existing system:

- Shop
- Product Detail
- Cart
- Checkout
- ShopOrder
- Order Confirmation
- `createShopCheckout`
- `stripeWebhook`
- NFC activation
- current Stripe-backed product mapping
- manufacturing pipeline

Do not create a second checkout system.

Do not add another payment provider.

Do not expose Stripe secret keys or webhook secrets in frontend code.

Frontend pricing is display-only. Server remains authoritative.

Only the Stripe webhook may confirm payment.

---

# 4. Customer journey

The intended purchase journey is:

`Browse Device`

`-> View Device`

`-> Customize if supported`

`-> Add to Cart`

`-> Checkout`

`-> Stripe Payment`

`-> Order Confirmed`

`-> ShopOrder stored`

`-> Manufacturing items / activation codes generated after confirmed payment`

`-> Customer receives device`

`-> Customer activates NFC device`

The experience should feel comparable to a polished Shopify/DTC hardware brand.

---

# 5. Official collections

The full store should organize devices around customer intent.

## A. Professional & Networking

Active core SKUs include:

- NFC Card
- NFC Keychain
- NFC Bracelet
- NFC Sticker

Additional concepts can appear as **Coming Soon** only until real SKUs and Stripe mappings exist.

Possible future concepts:

- Premium PVC Card
- Slim Wallet Card
- Event Networking Badge
- Phone NFC Patch / Phone Tap Patch
- Pocket NFC Tag
- Conference Badge

## B. Premium Professional

Active core SKUs:

- NFC Metal Card
- NFC Wood Card

Future premium concepts may be shown as Coming Soon only:

- Matte Black Executive Metal finish
- Graphite finish
- Gold-accent finish
- Company-logo metal card
- Executive wood finish

Do not create duplicate purchasable Stripe products for finishes unless real factory SKUs exist.

## C. Business & Teams

Active core SKUs:

- NFC Table Stand
- NFC Phone Stand

Future concepts can include:

- Business Counter Stand
- Reception Tap Stand
- Employee NFC Badge
- Event Staff Badge
- Team NFC Card Pack
- Review / Contact Stand
- Restaurant Table Tap
- Desk Tap Plate
- Door / Room Tap Plate
- Check-in Stand

## D. Asset Protection

Active core SKUs:

- NFC Luggage Tag
- NFC Pet Collar Tag
- NFC Silicone Tag
- NFC Key Fob

Future concepts can include:

- Backpack Asset Tag
- Equipment Asset Tag
- Laptop / Case Tag
- Camera Gear Tag
- Travel Bundle
- Bike / Scooter Tag
- Tool Case Tag
- Instrument Case Tag
- Wallet Recovery Tag
- Key Asset Patch

Future concepts must remain `coming_soon` / non-purchasable until real Stripe-backed SKUs exist.

---

# 6. Profile Device vs Asset Device

This distinction must be simple and consistent throughout the storefront.

## Profile Device

`Tap -> Professional Profile -> Contact / Lead / Booking`

Examples:

- NFC Card
- Metal Card
- Wood Card
- Bracelet
- Keychain
- Sticker
- Table Stand
- Phone Stand
- Phone Patch

## Asset Device

`Tap / Scan -> Asset / Lost Mode -> Finder -> Owner Reconnected`

Examples:

- Luggage Tag
- Pet Collar Tag
- Silicone Tag
- Key Fob
- Backpack Tag
- Equipment Tag

Asset recovery means NFC / QR recovery. Do not market it as GPS tracking unless a GPS product is actually implemented.

---

# 7. Landing Store requirements

The Landing page must be a **curated merchandising preview**, not the full store.

Show a focused set of flagship products only.

Recommended landing assortment:

- Metal Card
- NFC Card
- Table Stand
- Bracelet
- Luggage Tag
- Pet Collar Tag

The landing product cards must use the exact same catalog objects and product media as `/shop`.

Do not create separate landing-only product art.

Primary CTA:

**Explore All Bingoo Devices** -> `/shop`

---

# 8. /shop experience

The Shop should feel like a polished hardware ecommerce catalog.

## Layout

Desktop:

- Left category/filter sidebar
- Main product grid
- 3–4 cards per row depending on width

Tablet:

- 2 products per row

Mobile:

- 1 product per row
- no horizontal overflow
- filters should collapse into an easy mobile control

## Shop controls

- All Devices
- Profile Devices
- Wearables
- Desk & Counter
- Key Accessories
- Smart Tags
- Asset Protection
- Premium
- Bundles when real bundle SKUs exist

Filters/sort can include:

- Best Sellers
- New / Coming Soon
- In Stock Only
- price range
- Featured
- Price Low to High
- Price High to Low

Do not display fake counts. Counts must derive from the catalog.

---

# 9. Product card design

Every product card should show:

- real product media
- badge when applicable
- `PROFILE DEVICE` or `ASSET DEVICE`
- category / best-for context
- product name
- concise benefit-driven tagline
- real price for purchasable SKUs
- `View`
- `Add to Cart` for purchasable products
- `Coming Soon` / `Notify Me` for non-purchasable concepts

Do not display activation codes.

Do not expose Stripe product IDs.

Do not render a decorative Bingoo plate over a real product image.

---

# 10. Product Detail Page

Each real product page should clearly show:

- same product image/media as Shop
- product name
- real price
- category
- Profile Device / Asset Device
- best for
- description
- physical features
- NFC use case
- available customization only when actually supported
- quantity selector
- Add to Cart
- Buy Now
- shipping/returns/security trust information
- activation explanation

For customizable products, connect to the existing Design Studio only where supported.

Do not offer fake color/material combinations that do not match a real SKU or real manufacturing option.

---

# 11. Cart

Keep the existing cart architecture.

Cart should show:

- product image
- product name
- customization/options
- quantity
- unit price
- line total
- subtotal
- shipping
- total

Retail products allow quantity `1+`.

Do not force a normal retail customer to buy 10 units.

Any future custom/corporate bulk product may enforce its own minimum if manufacturing requires it.

Client prices are never authoritative.

---

# 12. Checkout and Stripe

Keep existing `createShopCheckout` and Stripe Checkout.

Keep:

- server-authoritative product catalog
- Stripe idempotency
- ShopOrder creation
- success URL
- cancel URL
- webhook signature verification

Coming Soon products must never enter checkout.

Unknown/non-Stripe product IDs must be rejected server-side.

---

# 13. Shipping

Shipping remains server-authoritative.

Current fixed shipping may remain temporarily, but it must stay isolated in server configuration so later phases can support:

- US domestic shipping
- international shipping
- free-shipping thresholds
- Stripe Shipping Rates

Do not trust client-calculated shipping.

---

# 14. Order confirmation / My Orders

After confirmed payment show:

- Order Confirmed
- order number
- products
- total paid
- shipping address
- payment status
- fulfillment/order status
- Track My Order when available

Clear the cart only after confirmed paid status according to the existing payment flow.

My Orders must remain user-scoped and must never expose another customer's order.

---

# 15. Manufacturing handoff

This store is also intended to communicate the physical product direction to suppliers/factories.

For each future real SKU, maintain a supplier-ready record including:

- SKU / internal product ID
- product name
- category
- material
- dimensions
- color/finish
- logo placement
- NFC chip/type requirements
- QR requirements when applicable
- attachment/hardware requirements
- packaging direction
- front design
- back design
- customization constraints
- minimum manufacturing quantity where applicable

Do not generate activation/NFC device records before Stripe payment is confirmed.

Existing manufacturing flow remains:

`ShopOrder -> Manufacturing Items -> NFCDevice records -> BG activation codes -> available status`

---

# 16. Product media source of truth

Use the shared product media layer everywhere.

Current implementation direction:

`FactoryProductMedia(product)`

must be used consistently in:

- Landing Store
- Shop
- Product Detail
- related commerce surfaces where product media is displayed

If an official product render is upgraded, update the catalog/media source once rather than creating page-specific variants.

Preferred future image set per physical SKU:

1. front hero studio shot
2. rear / activation-side shot
3. 3/4 angle
4. lifestyle/use shot
5. scale/context shot
6. packaging shot

All should represent the same physical design.

---

# 17. What must be removed

Remove or do not reintroduce:

- old crowded Bingoo card artwork
- old printed social icon grid
- customer-facing activation codes
- cartoon device illustrations used as purchasable product media
- CSS hardware overlays on real device photos
- mismatched product designs between Shop and Product Detail
- fake prices
- fake stock
- fake Stripe IDs
- duplicate purchasable SKUs for cosmetic concepts

---

# 18. What must NOT be touched during this store pass

Do not redesign unrelated systems:

- Landing Hero
- Authentication
- Profile functionality
- Lost Mode business logic
- NFC activation business logic
- Subscription plans
- Dashboard

Only improve the commerce/product presentation and its consistency.

---

# 19. Definition of done

The store pass is complete only when:

1. A customer can see one device on Landing, open `/shop`, open `/product/:id`, add it to Cart, and reach Checkout without the device changing design or identity.
2. All purchasable devices use real catalog media.
3. No activation code appears publicly.
4. Coming Soon concepts cannot enter checkout.
5. The store is responsive and usable on mobile.
6. Existing Stripe checkout/webhook/order architecture remains intact.
7. Product media looks credible enough to present to a real supplier/factory.
8. Product hierarchy feels comparable to a premium Shopify/DTC hardware store.

---

# Final implementation instruction to Base44

**Do not redesign from scratch. Consolidate the existing working store around this spec.**

Use the existing Bingoo codebase, catalog, Stripe mapping, cart, checkout, order system and NFC activation flow.

Improve the presentation, consistency and product realism without breaking existing commerce logic.

When there is a conflict between an old visual/mockup and this document, this document is the current store direction.
