/**
 * API客户端配置
 * 
 * 心理过程：
 * 1. 统一的HTTP客户端配置
 * 2. 自动token管理和刷新
 * 3. 错误处理和响应拦截
 * 4. 类型安全的API调用
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API基础配置
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
const AI_SERVICE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:5000';

// 创建主API实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 创建AI服务API实例
const aiApiClient: AxiosInstance = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000, // AI服务可能需要更长时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token管理
const TokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },
  
  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  
  clearTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
};

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token && !TokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理token刷新和错误
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 后端返回 { success, data, message } 格式，转换为前端期望格式
    if (response.data && typeof response.data === 'object') {
      return { ...response, data: response.data };
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // 处理401错误 - token过期
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          const { accessToken } = response.data;
          TokenManager.setTokens(accessToken, refreshToken);
          
          // 重试原始请求
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // 刷新失败，清除token并跳转到登录页
          TokenManager.clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // 没有refresh token，跳转到登录页
        TokenManager.clearTokens();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// AI服务请求拦截器
aiApiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token && !TokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 通用API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  success: boolean;
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// API错误处理
export const handleApiError = (error: AxiosError): string => {
  if (error.response) {
    // 服务器响应错误
    const data = error.response.data as any;
    return data?.message || data?.error || '服务器错误';
  } else if (error.request) {
    // 网络错误
    return '网络连接失败，请检查网络';
  } else {
    // 其他错误
    return error.message || '未知错误';
  }
};

// API客户端包装器
export class ApiClient {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url);
      return this.transformResponse(response.data);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data);
      return this.transformResponse(response.data);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data);
      return this.transformResponse(response.data);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url);
      return this.transformResponse(response.data);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  private transformResponse<T>(data: any): ApiResponse<T> {
    // 后端返回格式：{ success, message, content/product/user, ... }
    if (data && typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message,
        data: data.content || data.product || data.user || data
      };
    }
    
    // 如果不是标准格式，包装成标准格式
    return {
      success: true,
      data: data
    };
  }

  private handleError<T>(error: AxiosError): ApiResponse<T> {
    return {
      success: false,
      message: handleApiError(error),
      data: null as any
    };
  }
}

// 创建API客户端实例
export const apiClientWrapper = new ApiClient(apiClient);

// 导出API客户端
export { apiClient, aiApiClient, TokenManager };
export default apiClientWrapper;