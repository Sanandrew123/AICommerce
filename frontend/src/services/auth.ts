import { ApiResponse } from '../types';
import { apiClient } from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.accessToken) {
      // 存储tokens
      localStorage.setItem('accessToken', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/auth/register', userData);
  }

  async checkUsername(username: string): Promise<ApiResponse<{ available: boolean }>> {
    return await apiClient.get<{ available: boolean }>(`/auth/check-username?username=${encodeURIComponent(username)}`);
  }

  async checkEmail(email: string): Promise<ApiResponse<{ available: boolean }>> {
    return await apiClient.get<{ available: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`);
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();