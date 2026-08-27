import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SafeUser, AuthTokens } from '../../types/auth';
import { Storage } from '../../services/storage';

export interface AuthState {
  user: SafeUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoggedIn: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: SafeUser; tokens: AuthTokens }>,
    ) => {
      const { user, tokens } = action.payload;
      state.user = user;
      state.accessToken = tokens.accessToken;
      state.refreshToken = tokens.refreshToken;
      state.isLoggedIn = true;
      state.isLoading = false;

      // Sync with storage
      void Storage.setAccessToken(tokens.accessToken);
      void Storage.setRefreshToken(tokens.refreshToken);
      void Storage.setUser(user);
    },

    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      const tokens = action.payload;
      state.accessToken = tokens.accessToken;
      state.refreshToken = tokens.refreshToken;

      // Sync with storage
      void Storage.setAccessToken(tokens.accessToken);
      void Storage.setRefreshToken(tokens.refreshToken);
    },

    setUser: (state, action: PayloadAction<SafeUser>) => {
      state.user = action.payload;
      void Storage.setUser(action.payload);
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoggedIn = false;
      state.isLoading = false;

      void Storage.clearSession();
    },
  },
});

export const { setCredentials, setTokens, setUser, setLoading, logout } =
  authSlice.actions;

export default authSlice.reducer;