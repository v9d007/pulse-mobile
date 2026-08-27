import { SafeUser } from '../types/auth';

/**
 * Storage service abstraction for tokens and session data.
 */
class SessionStorage {
  private cache: Record<string, string | null> = {};

  async setItem(key: string, value: string): Promise<void> {
    this.cache[key] = value;
  }

  async getItem(key: string): Promise<string | null> {
    return this.cache[key] ?? null;
  }

  async removeItem(key: string): Promise<void> {
    delete this.cache[key];
  }

  async clear(): Promise<void> {
    this.cache = {};
  }

  // Helper getters and setters
  async setAccessToken(token: string): Promise<void> {
    await this.setItem('pulse_access_token', token);
  }

  async getAccessToken(): Promise<string | null> {
    return this.getItem('pulse_access_token');
  }

  async setRefreshToken(token: string): Promise<void> {
    await this.setItem('pulse_refresh_token', token);
  }

  async getRefreshToken(): Promise<string | null> {
    return this.getItem('pulse_refresh_token');
  }

  async setUser(user: SafeUser): Promise<void> {
    await this.setItem('pulse_user', JSON.stringify(user));
  }

  async getUser(): Promise<SafeUser | null> {
    const raw = await this.getItem('pulse_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SafeUser;
    } catch {
      return null;
    }
  }

  async clearSession(): Promise<void> {
    await this.removeItem('pulse_access_token');
    await this.removeItem('pulse_refresh_token');
    await this.removeItem('pulse_user');
  }
}

export const Storage = new SessionStorage();
