import { create } from 'zustand';
import useCartStore from './cartStore';
import useAuthStore from './authStore';
import { supabase } from '../lib/supabase';

const CONTACT_KEY = 'usj_cart_contact';

/**
 * Reads the stored contact info from sessionStorage.
 * Returns { name, phone } or null.
 */
const getStoredContact = () => {
  try {
    const raw = sessionStorage.getItem(CONTACT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.name && parsed?.phone) return parsed;
    return null;
  } catch {
    return null;
  }
};

const useContactStore = create((set, get) => ({
  // Modal state
  isModalOpen: false,
  pendingProduct: null,
  pendingQty: 1,
  pendingCallbacks: null,

  // Whether contact has been captured this session
  hasContact: !!getStoredContact(),

  /**
   * Gate for adding to cart.
   * If contact already captured → immediately add to cart.
   * Otherwise → open the modal and defer the add.
   */
  requestContact: (product, qty = 1, callbacks = {}) => {
    const stored = getStoredContact();
    if (stored) {
      // Contact already captured this session — proceed directly
      useCartStore.getState().addItem(product, qty);
      callbacks.onAfterAdd?.();
      return;
    }

    // No contact yet — show modal
    set({
      isModalOpen: true,
      pendingProduct: product,
      pendingQty: qty,
      pendingCallbacks: callbacks,
    });
  },

  /**
   * Called when the modal form is submitted.
   * Stores contact, inserts cart_lead (+ guest_cart_items), then adds to cart.
   */
  submitContact: async ({ name, phone }) => {
    const { pendingProduct, pendingQty, pendingCallbacks } = get();

    // 1. Persist to sessionStorage
    const contact = { name, phone };
    sessionStorage.setItem(CONTACT_KEY, JSON.stringify(contact));

    // 2. Get user_id if logged in
    const userId = useAuthStore.getState().user?.id ?? null;

    // 3. Insert cart_lead into Supabase
    const leadId = crypto.randomUUID();
    const { error: leadError } = await supabase
      .from('cart_leads')
      .insert({
        id: leadId,
        name,
        phone,
        user_id: userId,
      });

    if (leadError) {
      console.warn('Failed to insert cart_lead:', leadError);
    }

    // 4. Insert guest_cart_items — snapshot current cart + the pending product
    const currentItems = useCartStore.getState().items;
    const guestItems = [];

    // Add existing cart items
    for (const item of currentItems) {
      guestItems.push({
        lead_id: leadId,
        product_id: item.product.id,
        product_name: item.product.name,
        brand_name: item.product.brand_name ?? null,
        image_url: item.product.primary_image_url ?? null,
        quantity: item.qty,
      });
    }

    // Add the pending product (if not already in cart)
    if (pendingProduct && !currentItems.find((i) => i.product.id === pendingProduct.id)) {
      guestItems.push({
        lead_id: leadId,
        product_id: pendingProduct.id,
        product_name: pendingProduct.name,
        brand_name: pendingProduct.brand_name ?? null,
        image_url: pendingProduct.primary_image_url ?? null,
        quantity: pendingQty,
      });
    }

    if (guestItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('guest_cart_items')
        .insert(guestItems);
      if (itemsError) {
        console.warn('Failed to insert guest_cart_items:', itemsError);
      }
    }

    // 5. Now actually add the pending product to cart
    if (pendingProduct) {
      useCartStore.getState().addItem(pendingProduct, pendingQty);
      pendingCallbacks?.onAfterAdd?.();
    }

    // 6. Close modal and update state
    set({
      isModalOpen: false,
      pendingProduct: null,
      pendingQty: 1,
      pendingCallbacks: null,
      hasContact: true,
    });
  },

  /**
   * Close the modal without adding to cart.
   */
  closeModal: () => {
    set({
      isModalOpen: false,
      pendingProduct: null,
      pendingQty: 1,
      pendingCallbacks: null,
    });
  },
}));

export default useContactStore;
