import { create } from 'zustand';
import toast from 'react-hot-toast';
import { upsertCartItem, removeCartItem, updateCartItemQty } from '../lib/queries';
import useAuthStore from './authStore';

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

const getUserId = () => useAuthStore.getState().user?.id ?? null;

const useCartStore = create((set, get) => ({
  items: loadFromStorage(),

  itemCount: () => get().items.reduce((acc, item) => acc + item.qty, 0),

  addItem: (product, qty = 1) => {
    const items = get().items;
    const existing = items.find((i) => i.product.id === product.id);
    let newItems;
    let newQty;
    if (existing) {
      newQty = existing.qty + qty;
      newItems = items.map((i) =>
        i.product.id === product.id ? { ...i, qty: newQty } : i
      );
    } else {
      newQty = qty;
      newItems = [...items, { product, qty }];
    }
    saveToStorage(newItems);
    set({ items: newItems });

    const userId = getUserId();
    if (userId) upsertCartItem(userId, product.id, newQty).catch(console.warn);

    toast.success(`${product.name} added to cart`);
  },

  removeItem: (productId) => {
    const newItems = get().items.filter((i) => i.product.id !== productId);
    saveToStorage(newItems);
    set({ items: newItems });

    const userId = getUserId();
    if (userId) removeCartItem(userId, productId).catch(console.warn);

    toast.success('Item removed');
  },

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

    const userId = getUserId();
    if (userId) updateCartItemQty(userId, productId, qty).catch(console.warn);
  },

  clearCart: () => {
    localStorage.removeItem(CART_KEY);
    set({ items: [] });
  },

  mergeWithDb: (dbItems) => {
    const localItems = get().items;
    const merged = [...localItems];

    for (const dbItem of dbItems) {
      const product = dbItem.products;
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
