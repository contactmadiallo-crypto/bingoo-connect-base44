const CART_KEY = 'bingoo_cart';
const MAX_QUANTITY_PER_ITEM = 50;

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function getCartLineKey(item) {
  if (item?.lineKey) return item.lineKey;
  const design = item?.customDesign || {};
  return [
    item?.id || '',
    design.cardColor || '',
    design.colorName || '',
    design.finish || '',
    design.nameText || '',
  ].join('::');
}

export function addToCart(product, quantity = 1, customDesign) {
  const cart = getCart();
  const safeQuantity = Math.max(1, Math.min(MAX_QUANTITY_PER_ITEM, Number.isFinite(Number(quantity)) ? Math.floor(Number(quantity)) : 1));
  const item = {
    ...product,
    ...(customDesign ? { customDesign } : {}),
  };
  const lineKey = getCartLineKey(item);
  const existing = cart.find(cartItem => getCartLineKey(cartItem) === lineKey);
  if (existing) {
    existing.quantity = Math.min(MAX_QUANTITY_PER_ITEM, (Number(existing.quantity) || 0) + safeQuantity);
    existing.lineKey = lineKey;
  } else {
    cart.push({ ...item, quantity: safeQuantity, lineKey });
  }
  saveCart(cart);
  return cart;
}

export function updateQuantity(lineKey, quantity) {
  return updateCartItem(lineKey, quantity);
}

export function updateCartItem(lineKey, quantity) {
  const cart = getCart();
  const idx = cart.findIndex(item => getCartLineKey(item) === lineKey || item.id === lineKey);
  if (idx !== -1) {
    const safeQuantity = Math.min(MAX_QUANTITY_PER_ITEM, Math.floor(Number(quantity) || 0));
    if (safeQuantity <= 0) {
      cart.splice(idx, 1);
    } else {
      cart[idx].quantity = safeQuantity;
      cart[idx].lineKey = getCartLineKey(cart[idx]);
    }
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(lineKey) {
  const cart = getCart().filter(item => getCartLineKey(item) !== lineKey && item.id !== lineKey);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}
