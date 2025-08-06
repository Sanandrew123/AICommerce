import { apiClient } from './api';
import { CartItem, ApiResponse } from '../types';

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

class CartService {
  async getCartItems(): Promise<ApiResponse<CartItem[]>> {
    return await apiClient.get<CartItem[]>('/cart');
  }

  async addToCart(request: AddToCartRequest): Promise<ApiResponse<CartItem>> {
    return await apiClient.post<CartItem>('/cart/items', request);
  }

  async updateCartItem(itemId: number, request: UpdateCartItemRequest): Promise<ApiResponse<CartItem>> {
    return await apiClient.put<CartItem>(`/cart/items/${itemId}`, request);
  }

  async removeFromCart(itemId: number): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/cart/items/${itemId}`);
  }

  async clearCart(): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>('/cart/clear');
  }

  async getCartTotal(): Promise<ApiResponse<{ total: number; itemCount: number }>> {
    return await apiClient.get<{ total: number; itemCount: number }>('/cart/total');
  }
}

export const cartService = new CartService();