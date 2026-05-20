import { create } from 'zustand';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('safenet_user'));
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('safenet_token') || null,
  isAuthenticated: !!localStorage.getItem('safenet_token'),

  setAuth: (user, token) => {
    localStorage.setItem('safenet_token', token);
    localStorage.setItem('safenet_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('safenet_token');
    localStorage.removeItem('safenet_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
