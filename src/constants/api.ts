import { Platform } from 'react-native';

// Switch between live production cloud backend and local dev server
const USE_LOCAL_API = false;

const LOCAL_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

const PRODUCTION_URL = 'https://pulse-backend-h0t6.onrender.com';

export const API_BASE_URL = USE_LOCAL_API ? LOCAL_URL : PRODUCTION_URL;

export const API_TIMEOUT = 15000;
