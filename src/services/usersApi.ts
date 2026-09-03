import { api } from './api';
import {
  PresignedUrlResponse,
  SafeUser,
  UpdateProfileRequest,
} from '../types/auth';

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<SafeUser, UpdateProfileRequest>({
      query: (body) => ({
        url: '/users/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    getAvatarUploadUrl: builder.mutation<
      PresignedUrlResponse,
      { fileType: string }
    >({
      query: (body) => ({
        url: '/users/avatar/upload-url',
        method: 'POST',
        body,
      }),
    }),

    searchUsers: builder.query<SafeUser[], string>({
      query: (query) => `/users/search?q=${encodeURIComponent(query)}`,
    }),

    getUserById: builder.query<SafeUser, string>({
      query: (id) => `/users/${id}`,
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useGetAvatarUploadUrlMutation,
  useSearchUsersQuery,
  useGetUserByIdQuery,
} = usersApi;
