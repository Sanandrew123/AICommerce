import { ApiResponse } from '../types';

// AI服务的基础URL
const AI_SERVICE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:5000';

export interface RecommendationRequest {
  userId?: number;
  productId?: number;
  limit?: number;
  type?: 'collaborative' | 'content' | 'hybrid';
}

export interface ChatMessage {
  id?: string;
  message: string;
  sender_type: 'user' | 'ai';
  timestamp?: string;
  suggestions?: string[];
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  context?: any;
}

class AiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'AI服务请求失败',
        data: null as any
      };
    }
  }

  async getRecommendations(params: RecommendationRequest): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    return await this.makeRequest<any[]>(`/recommendations?${queryParams.toString()}`);
  }

  async getProductRecommendations(productId: number, limit: number = 5): Promise<ApiResponse<any[]>> {
    return await this.getRecommendations({
      productId,
      limit,
      type: 'content'
    });
  }

  async getUserRecommendations(userId: number, limit: number = 10): Promise<ApiResponse<any[]>> {
    return await this.getRecommendations({
      userId,
      limit,
      type: 'collaborative'
    });
  }

  async chat(message: string, sessionId?: string): Promise<ApiResponse<{ 
    response: string; 
    suggestions?: string[];
    sessionId?: string;
  }>> {
    return await this.makeRequest<{ 
      response: string; 
      suggestions?: string[];
      sessionId?: string;
    }>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    });
  }

  async predictPrice(productId: number): Promise<ApiResponse<{ 
    predicted_price: number; 
    confidence: number;
    trend: 'up' | 'down' | 'stable';
  }>> {
    return await this.makeRequest<{ 
      predicted_price: number; 
      confidence: number;
      trend: 'up' | 'down' | 'stable';
    }>('/analytics/price-prediction', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  async getUserBehaviorAnalysis(userId: number): Promise<ApiResponse<any>> {
    return await this.makeRequest<any>(`/analytics/user/${userId}/behavior`);
  }

  async getPopularProducts(): Promise<ApiResponse<any[]>> {
    return await this.makeRequest<any[]>('/analytics/popular-products');
  }
}

export const aiService = new AiService();