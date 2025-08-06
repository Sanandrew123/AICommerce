import { apiClient } from './api';
import { Order, PaginatedResponse, ApiResponse } from '../types';

export interface CreateOrderRequest {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  shippingAddress: {
    recipientName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: string;
  couponCode?: string;
}

export interface OrderSearchParams {
  page?: number;
  size?: number;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

class OrderService {
  async getUserOrders(params: OrderSearchParams = {}): Promise<PaginatedResponse<Order>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    return await apiClient.get<PaginatedResponse<Order>>(`/orders?${queryParams.toString()}`);
  }

  async getOrderById(id: number): Promise<ApiResponse<Order>> {
    return await apiClient.get<Order>(`/orders/${id}`);
  }

  async createOrder(request: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return await apiClient.post<Order>('/orders', request);
  }

  async cancelOrder(id: number): Promise<ApiResponse<void>> {
    return await apiClient.post<void>(`/orders/${id}/cancel`);
  }

  async confirmReceived(id: number): Promise<ApiResponse<void>> {
    return await apiClient.post<void>(`/orders/${id}/confirm`);
  }

  async requestRefund(id: number, reason: string): Promise<ApiResponse<void>> {
    return await apiClient.post<void>(`/orders/${id}/refund`, { reason });
  }

  async reorder(id: number): Promise<ApiResponse<void>> {
    return await apiClient.post<void>(`/orders/${id}/reorder`);
  }

  async getOrderStats(): Promise<ApiResponse<any>> {
    return await apiClient.get<any>('/orders/stats');
  }
}

export const orderService = new OrderService();