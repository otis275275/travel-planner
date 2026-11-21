import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState } from '../../types/user.types';
import { authApi } from '../../services/authApi';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
  //for external store updating with API
  extraReducers: (builder) => {
    builder
      // Login success
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        if (payload.data) {
          state.user = payload.data;
          state.isAuthenticated = true;
          state.isInitialized = true;
        }
      })
      // Get current user (/me) success
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
        if (payload.data) {
          state.user = payload.data;
          state.isAuthenticated = true;
        }
        state.isInitialized = true;
      })
      // Get current user (/me) failed (e.g. 401 unauthenticated)
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      })
      // Logout success
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });
  },
});

export const { setCredentials, setUser, logout, setInitialized } = authSlice.actions;

export default authSlice.reducer;
