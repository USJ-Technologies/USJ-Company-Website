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

  login: async ({ email, password, accountType = 'customer' }) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ isLoading: false });
      toast.error(error.message);
      return { success: false, message: error.message };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      await supabase.auth.signOut();
      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
      toast.error('Could not load account profile');
      return { success: false, message: 'Could not load account profile' };
    }

    const roleMatches = (() => {
      switch (accountType) {
        case 'usj_partner':
          // An applicant keeps role 'customer' until an admin approves them,
          // so matching on the role alone locked every pending and rejected
          // applicant out of the account they had just created. A partner_id
          // means an application exists, which is enough to sign in and see
          // where it stands — PartnerRoute still guards the dashboard itself.
          return profile.role === 'usj_partner' || profile.partner_id != null;
        case 'employee':
          return ['admin', 'manager', 'staff'].includes(profile.role);
        case 'customer':
        default:
          return profile.role === 'customer';
      }
    })();

    if (!roleMatches) {
      await supabase.auth.signOut();
      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });

      const messages = {
        customer: 'This account is not registered as a customer.',
        usj_partner:
          'No USJ Partner account or application found for this login. Sign in as a Customer, or apply to become a partner.',
        employee: 'This account does not have employee access.',
      };
      toast.error(messages[accountType] || messages.customer);
      return { success: false, message: messages[accountType] };
    }

    set({
      user: data.user,
      session: data.session,
      profile,
      isAuthenticated: true,
      isLoading: false,
    });
    toast.success('Welcome back!');
    // The profile goes back to the caller so it can route on the real role
    // rather than the tab that was clicked — a pending applicant picks
    // "USJ Partner" but must not be sent to the partner dashboard.
    return { success: true, accountType, profile };
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
  isPartner: () => get().profile?.role === 'usj_partner',
  getPartnerId: () => get().profile?.partner_id || null,
}));

export default useAuthStore;
