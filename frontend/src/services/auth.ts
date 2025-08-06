import { ApiResponse } from '../types';
import apiClient from './api';

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
    // 后端期望 identifier 字段，前端传 username
    const backendRequest = {
      identifier: credentials.username,
      password: credentials.password
    };
    
    const response = await apiClient.post<AuthResponse>('/auth/login', backendRequest);
    
    if (response.success && response.data?.accessToken) {
      // 存储tokens
      localStorage.setItem('accessToken', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response.data || response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/auth/register', userData);
  }

  async checkUsername(username: string): Promise<ApiResponse<{ available: boolean }>> {
    // 后端使用POST方法
    return await apiClient.post<{ available: boolean }>('/auth/check-username', { username });
  }

  async checkEmail(email: string): Promise<ApiResponse<{ available: boolean }>> {
    // 后端使用POST方法
    return await apiClient.post<{ available: boolean }>('/auth/check-email', { email });
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