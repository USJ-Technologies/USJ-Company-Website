import { create } from 'zustand';

const WISHLIST_KEY = 'usj_wishlist';

const loadFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveToStorage = (items) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
};

const useWishlistStore = create((set, get) => ({
  items: loadFromStorage(),

  addItem: (product) => {
    const items = get().items;
    if (items.find((i) => i._id === product._id)) return;
    const newItems = [...items, product];
    saveToStorage(newItems);
    set({ items: newItems });
  },

  removeItem: (productId) => {
    const newItems = get().items.filter((i) => i._id !== productId);
    saveToStorage(newItems);
    set({ items: newItems });
  },

  toggleItem: (product) => {
    const isIn = get().isInWishlist(product._id);
    if (isIn) {
      get().removeItem(product._id);
    } else {
      get().addItem(product);
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((i) => i._id === productId);
  },
}));

export default useWishlistStore;
