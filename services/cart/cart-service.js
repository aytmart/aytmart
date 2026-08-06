/**
 * ==========================================================================
 * File: /services/cart/cart-service.js
 * Description: Client-side Cart Service — single source of truth for the
 * shopping cart, persisted via StorageHelper under ENV.STORAGE_KEYS.CART.
 *
 * Storage shape: { items: [...] }
 * Item schema (Title_Case — matches what cart.html / checkout.html render):
 *   { Product_ID, Product_Name, SKU, Image, Price, Quantity }
 *
 * Compatibility: preserves the public API already called elsewhere in the
 * site — getCart(), getSummary(), add(), updateQuantity(), removeItem(),
 * clearCart() — and always dispatches a `cart-updated` window event after
 * any mutation, since header.js (badge sync) and cart.html both listen
 * for it.
 * ==========================================================================
 */

const CartService = {
  /** @private */
  _key() {
    return (typeof ENV !== 'undefined' && ENV.STORAGE_KEYS && ENV.STORAGE_KEYS.CART) || 'ayt_cart';
  },

  /**
   * Reads the cart from storage. Always returns a well-formed { items: [] }
   * shape even if storage is empty, corrupted, or unavailable.
   */
  getCart() {
    const raw = (typeof StorageHelper !== 'undefined')
      ? StorageHelper.get(this._key(), { items: [] })
      : { items: [] };
    if (!raw || !Array.isArray(raw.items)) return { items: [] };
    return raw;
  },

  /** @private */
  _save(cart) {
    if (typeof StorageHelper !== 'undefined') StorageHelper.set(this._key(), cart);
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart } }));
  },

  /**
   * Adds a product to the cart by ID, incrementing quantity if it's already
   * present. Looks the product up via ProductService so the cart stores a
   * fresh name/price/image/sku snapshot at the time of adding.
   *
   * @param {string} productId
   * @param {number} [qty=1]
   */
  async add(productId, qty = 1) {
    const cart = this.getCart();
    const existing = cart.items.find((i) => i.Product_ID === String(productId));

    if (existing) {
      existing.Quantity = Math.max(1, (parseInt(existing.Quantity, 10) || 0) + qty);
      this._save(cart);
      return cart;
    }

    let product = null;
    try {
      if (typeof ProductService !== 'undefined' && typeof ProductService.getById === 'function') {
        product = await ProductService.getById(productId);
      }
    } catch (e) {
      console.warn(`CartService.add: could not fetch product ${productId} for cart snapshot.`, e);
    }

    const newItem = product
      ? {
          Product_ID: String(product.id),
          Product_Name: product.name,
          SKU: product.sku || 'AYT-GEN-SKU',
          Image: product.image,
          Price: parseFloat(product.sale_price || product.price || 0),
          Quantity: Math.max(1, qty)
        }
      : {
          // Defensive fallback: keeps the cart usable instead of silently
          // dropping the add-to-cart action if the product lookup fails.
          Product_ID: String(productId),
          Product_Name: 'পণ্য',
          SKU: 'AYT-GEN-SKU',
          Image: '',
          Price: 0,
          Quantity: Math.max(1, qty)
        };

    cart.items.push(newItem);
    this._save(cart);
    return cart;
  },

  /**
   * Sets an item's quantity directly. A quantity <= 0 removes the item.
   * @param {string} productId
   * @param {number} quantity
   */
  updateQuantity(productId, quantity) {
    const qty = parseInt(quantity, 10) || 0;
    if (qty <= 0) return this.removeItem(productId);

    const cart = this.getCart();
    const item = cart.items.find((i) => i.Product_ID === String(productId));
    if (item) {
      item.Quantity = qty;
      this._save(cart);
    }
    return cart;
  },

  /**
   * Removes an item from the cart entirely.
   * @param {string} productId
   */
  removeItem(productId) {
    const cart = this.getCart();
    cart.items = cart.items.filter((i) => i.Product_ID !== String(productId));
    this._save(cart);
    return cart;
  },

  /**
   * Empties the cart. Used after a successful order.
   */
  clearCart() {
    const cart = { items: [] };
    this._save(cart);
    return cart;
  },

  /**
   * Computes subtotal (BDT) and total item count for the current cart.
   */
  getSummary() {
    const cart = this.getCart();
    const itemCount = cart.items.reduce((acc, i) => acc + (parseInt(i.Quantity, 10) || 0), 0);
    const subtotal = cart.items.reduce(
      (acc, i) => acc + (parseFloat(i.Price) || 0) * (parseInt(i.Quantity, 10) || 0),
      0
    );
    return { itemCount, subtotal };
  }
};
