import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,

  // Called once in App.jsx on mount — sets up the auth listener
  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await get()._applySession(session);
    } else {
      set({ isLoading: false });
    }

    // Listen for auth state changes (login, logout, token refresh)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await get()._applySession(session);
      } else {
        set({ user: null, session: null, profile: null, isAuthenticated: false, isLoading: false });
      }
    });
  },

  // Internal: load profile and set state from a session
  _applySession: async (session) => {
    set({ session, user: session.user, isAuthenticated: true });
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    set({ profile, isLoading: false });
  },

  login: async ({ email, password }) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ isLoading: false });
      toast.error(error.message);
      return { success: false, message: error.message };
    }
    toast.success(`Welcome back!`);
    return { success: true };
  },

  register: async ({ name, email, password, phone, organization }) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      set({ isLoading: false });
      toast.error(error.message);
      return { success: false, message: error.message };
    }

    // Update the auto-created profile with extra fields
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        email,
        phone: phone ?? null,
        organization: organization ?? null,
      });
    }

    toast.success(`Welcome to USJ Technologies, ${name}!`);
    return { success: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null, isAuthenticated: false });
    toast.success('Logged out successfully');
  },

  updateProfile: async (fields) => {
    const userId = get().user?.id;
    if (!userId) return { success: false };
    set({ isLoading: true });

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      set({ isLoading: false });
      toast.error('Profile update failed');
      return { success: false };
    }

    set({ profile, isLoading: false });
    toast.success('Profile updated');
    return { success: true };
  },

  deleteAccount: async (password) => {
    const { user, session, profile } = get();
    if (!user?.email || !session) {
      return { success: false, message: 'Not authenticated' };
    }

    if (['admin', 'manager', 'staff'].includes(profile?.role)) {
      return {
        success: false,
        message: 'Team accounts must be removed by an administrator.',
      };
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (authError) {
      return { success: false, message: 'Incorrect password' };
    }

    const { error: deleteError } = await supabase.rpc('delete_own_account');

    if (deleteError) {
      toast.error(deleteError.message || 'Account deletion failed');
      return {
        success: false,
        message: deleteError.message || 'Account deletion failed',
      };
    }

    localStorage.removeItem('usj_cart');
    localStorage.removeItem('usj_wishlist');

    await supabase.auth.signOut();
    set({
      user: null,
      session: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast.success('Your account has been deleted');
    return { success: true };
  },

  isAdmin: () => get().profile?.role === 'admin',
  hasRole: (...roles) => roles.includes(get().profile?.role),
  isVendor: () => get().profile?.role === 'vendor',
  getVendorId: () => get().profile?.vendor_id || null,
}));

export default useAuthStore;
