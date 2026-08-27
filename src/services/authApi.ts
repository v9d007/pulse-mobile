import { api } from './api';
import {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  SafeUser,
  SignupRequest,
} from '../types/auth';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (credentials) => ({
        url: '/auth/signup',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    logoutApi: builder.mutation<
      { message: string },
      { refreshToken?: string } | void
    >({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body: body || {},
      }),
      invalidatesTags: ['User'],
    }),

    refreshTokenApi: builder.mutation<
      { tokens: AuthTokens },
      { refreshToken: string }
    >({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),

    getMe: builder.query<SafeUser, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutApiMutation,
  useRefreshTokenApiMutation,
  useGetMeQuery,
} = authApi;
