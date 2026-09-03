export interface SafeUser {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  profile_image_url: string | null;
  status: string;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: SafeUser;
  tokens: AuthTokens;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  status?: string;
  profileImageUrl?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresInSeconds: number;
}
