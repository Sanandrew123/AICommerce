import apiClient from './api';
import { Product, Category, PaginatedResponse, ApiResponse } from '../types';

export interface ProductSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
  inStock?: boolean;
}

class ProductService {
  async getProducts(params: ProductSearchParams = {}): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    return await apiClient.get<PaginatedResponse<Product>>(`/products?${queryParams.toString()}`);
  }

  async getProductById(id: number): Promise<ApiResponse<Product>> {
    return await apiClient.get<Product>(`/products/${id}`);
  }

  async searchProducts(keyword: string, params: Omit<ProductSearchParams, 'keyword'> = {}): Promise<PaginatedResponse<Product>> {
    return await this.getProducts({ ...params, keyword });
  }

  async getProductsByCategory(categoryId: number, params: Omit<ProductSearchParams, 'category'> = {}): Promise<PaginatedResponse<Product>> {
    return await this.getProducts({ ...params, category: String(categoryId) });
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return await apiClient.get<Category[]>('/categories');
  }

  async getRelatedProducts(productId: number): Promise<ApiResponse<Product[]>> {
    return await apiClient.get<Product[]>(`/products/${productId}/related`);
  }

  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return await apiClient.get<Product[]>('/products/featured');
  }

  async getNewArrivals(): Promise<ApiResponse<Product[]>> {
    return await apiClient.get<Product[]>('/products/new');
  }

  async getPopularProducts(): Promise<ApiResponse<Product[]>> {
    return await apiClient.get<Product[]>('/products/popular');
  }
}

export const productService = new ProductService();