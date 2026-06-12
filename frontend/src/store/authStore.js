import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('usj_user') || 'null'),
  token: localStorage.getItem('usj_token') || null,
  isAuthenticated: !!localStorage.getItem('usj_token'),
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', credentials);
      const { token, user } = data.data || data;
      localStorage.setItem('usj_token', token);
      localStorage.setItem('usj_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
      toast.success(`Welcome back, ${user.name}!`);
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', userData);
      const { token, user } = data.data || data;
      localStorage.setItem('usj_token', token);
      localStorage.setItem('usj_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
      toast.success(`Welcome to USJ Technologies, ${user.name}!`);
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem('usj_token');
    localStorage.removeItem('usj_user');
    set({ user: null, token: null, isAuthenticated: false });
    toast.success('Logged out successfully');
  },

  getMe: async () => {
    if (!get().token) return;
    set({ isLoading: true });
    try {
      const { data } = await api.get('/auth/me');
      const userData = data.data?.user || data.user;
      localStorage.setItem('usj_user', JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.put('/auth/profile', profileData);
      const updatedUser = data.data?.user || data.user;
      localStorage.setItem('usj_user', JSON.stringify(updatedUser));
      set({ user: updatedUser, isLoading: false });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  },
}));

export default useAuthStore;
