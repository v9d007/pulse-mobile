import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';
import { RootState } from '../app/store';
import { logout, setTokens } from '../features/auth/authSlice';
import { AuthTokens } from '../types/auth';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, apiCtx, extraOptions) => {
  let result = await baseQuery(args, apiCtx, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = (apiCtx.getState() as RootState).auth.refreshToken;
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        apiCtx,
        extraOptions,
      );

      if (refreshResult.data) {
        const { tokens } = refreshResult.data as { tokens: AuthTokens };
        apiCtx.dispatch(setTokens(tokens));
        // Retry the initial request with new access token
        result = await baseQuery(args, apiCtx, extraOptions);
      } else {
        apiCtx.dispatch(logout());
      }
    } else {
      apiCtx.dispatch(logout());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Chat', 'Message'],
  endpoints: () => ({}),
});
