import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'TAILOR';
  tailorProfile?: {
    id: string;
    shopName: string;
    ownerName: string;
    address: string;
    contactPhone: string;
    workingHours: string;
    bio?: string | null;
  } | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitialized = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('fmt_token', action.payload.token);
        localStorage.setItem('fmt_user', JSON.stringify(action.payload.user));
      }
    },
    updateUserProfile: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('fmt_user', JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fmt_token');
        localStorage.removeItem('fmt_user');
      }
    },
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('fmt_token');
        const userStr = localStorage.getItem('fmt_user');
        if (token && userStr) {
          try {
            state.token = token;
            state.user = JSON.parse(userStr);
            state.isAuthenticated = true;
          } catch {
            localStorage.removeItem('fmt_token');
            localStorage.removeItem('fmt_user');
          }
        }
      }
      state.isInitialized = true;
    },
  },
});

export const { setCredentials, updateUserProfile, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
