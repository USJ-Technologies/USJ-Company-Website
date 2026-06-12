import { create } from 'zustand';
import api from '../services/api';
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
  isLoading: false,

  get itemCount() {
    return get().items.reduce((acc, item) => acc + item.qty, 0);
  },

  get subtotal() {
    return get().items.reduce((acc, item) => {
      const price = item.product.salePrice || item.product.price || 0;
      return acc + price * item.qty;
    }, 0);
  },

  addItem: (product, qty = 1) => {
    const items = get().items;
    const existing = items.find((i) => i.product._id === product._id);
    let newItems;
    if (existing) {
      newItems = items.map((i) =>
        i.product._id === product._id ? { ...i, qty: i.qty + qty } : i
      );
    } else {
      newItems = [...items, { product, qty, price: product.salePrice || product.price }];
    }
    saveToStorage(newItems);
    set({ items: newItems });
    toast.success(`${product.name} added to cart`);
  },

  removeItem: (productId) => {
    const newItems = get().items.filter((i) => i.product._id !== productId);
    saveToStorage(newItems);
    set({ items: newItems });
    toast.success('Item removed from cart');
  },

  updateQty: (productId, qty) => {
    if (qty < 1) return;
    const newItems = get().items.map((i) =>
      i.product._id === productId ? { ...i, qty } : i
    );
    saveToStorage(newItems);
    set({ items: newItems });
  },

  clearCart: () => {
    localStorage.removeItem(CART_KEY);
    set({ items: [] });
  },

  syncWithBackend: async () => {
    const token = localStorage.getItem('usj_token');
    if (!token) return;
    set({ isLoading: true });
    try {
      const { data } = await api.get('/cart');
      const cartItems = data.data?.cart?.items || data.cart?.items || data.items || [];
      if (cartItems.length > 0) {
        const syncedItems = cartItems.map((i) => ({
          product: i.product,
          qty: i.qty,
          price: i.price,
        }));
        saveToStorage(syncedItems);
        set({ items: syncedItems, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));

export default useCartStore;
