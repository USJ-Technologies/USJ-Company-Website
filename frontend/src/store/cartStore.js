/**
 * Cart store — works for both guests and signed-in users.
 *
 * Guests:  all state in localStorage, no DB calls.
 * Signed-in: localStorage is the source of truth during a session;
 *            DB is synced on login (merge) and can be used for persistence.
 */

import { create } from 'zustand';
import toast from 'react-hot-toast';

const CART_KEY = 'usj_cart';

const loadFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveToStorage = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

const useCartStore = create((set, get) => ({
  items: loadFromStorage(),

  // ── Derived values ────────────────────────────────────────
  get itemCount() {
    return get().items.reduce((acc, item) => acc + item.qty, 0);
  },

  // ── Add or increment ──────────────────────────────────────
  addItem: (product, qty = 1) => {
    const items = get().items;
    const existing = items.find((i) => i.product.id === product.id);
    let newItems;
    if (existing) {
      newItems = items.map((i) =>
        i.product.id === product.id ? { ...i, qty: i.qty + qty } : i
      );
    } else {
      newItems = [...items, { product, qty }];
    }
    saveToStorage(newItems);
    set({ items: newItems });
    toast.success(`${product.name} added to cart`);
  },

  // ── Remove one product ────────────────────────────────────
  removeItem: (productId) => {
    const newItems = get().items.filter((i) => i.product.id !== productId);
    saveToStorage(newItems);
    set({ items: newItems });
    toast.success('Item removed');
  },

  // ── Set exact quantity ────────────────────────────────────
  updateQty: (productId, qty) => {
    if (qty < 1) {
      get().removeItem(productId);
      return;
    }
    const newItems = get().items.map((i) =>
      i.product.id === productId ? { ...i, qty } : i
    );
    saveToStorage(newItems);
    set({ items: newItems });
  },

  // ── Clear entire cart ─────────────────────────────────────
  clearCart: () => {
    localStorage.removeItem(CART_KEY);
    set({ items: [] });
  },

  // ── Merge guest cart with DB cart on login ────────────────
  mergeWithDb: (dbItems) => {
    const localItems = get().items;
    const merged = [...localItems];

    for (const dbItem of dbItems) {
      const product = dbItem.products; // joined via select
      if (!product) continue;
      const existing = merged.find((i) => i.product.id === product.id);
      if (existing) {
        existing.qty = Math.max(existing.qty, dbItem.quantity);
      } else {
        merged.push({ product, qty: dbItem.quantity });
      }
    }

    saveToStorage(merged);
    set({ items: merged });
  },
}));

export default useCartStore;
