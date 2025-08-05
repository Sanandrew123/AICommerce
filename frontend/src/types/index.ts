/**
 * 全局类型定义
 * 
 * 心理过程：
 * 1. 定义与后端API对应的类型
 * 2. 确保类型安全的数据传输
 * 3. 复用常用的接口定义
 * 4. 支持前端状态管理
 */

// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  preferences?: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}

export interface LoginRequest {
  identifier: string; // 用户名或邮箱
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
}

// 商品相关类型
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  category?: Category;
  brand?: string;
  sku?: string;
  stockQuantity: number;
  images?: string; // JSON字符串
  attributes?: string; // JSON字符串
  tags?: string; // JSON字符串
  rating: number;
  reviewCount: number;
  aiFeatures?: string; // JSON字符串
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent?: Category;
  children?: Category[];
  imageUrl?: string;
  createdAt: string;
}

// 购物车相关类型
export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  product?: Product;
  quantity: number;
  selectedAttributes?: string; // JSON字符串
  createdAt: string;
  updatedAt?: string;
}

// 订单相关类型
export interface Order {
  id: number;
  userId: number;
  user?: User;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  shippingAddress: string; // JSON字符串
  paymentMethod?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  notes?: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  selectedAttributes?: string; // JSON字符串
  createdAt: string;
}

// AI推荐相关类型
export interface Recommendation {
  product_id: number;
  score: number;
  reason: string;
  source: 'collaborative' | 'content' | 'popular' | 'hybrid';
  product_info?: Product;
}

export interface RecommendationRequest {
  user_id?: number;
  context?: {
    current_product_id?: number;
    category_id?: number;
    search_query?: string;
  };
  limit?: number;
  strategy?: 'collaborative' | 'content' | 'hybrid';
}

// 聊天相关类型
export interface ChatMessage {
  id?: string;
  message: string;
  response?: string;
  sender_type: 'user' | 'ai' | 'agent';
  timestamp: string;
  intent?: string;
  suggestions?: string[];
}

export interface ChatSession {
  session_id: string;
  user_id?: number;
  messages: ChatMessage[];
  status: 'active' | 'closed';
  created_at: string;
}

// 用户行为分析类型
export interface UserBehavior {
  id: number;
  userId?: number;
  sessionId?: string;
  behaviorType: 'VIEW' | 'CLICK' | 'ADD_TO_CART' | 'PURCHASE' | 'SEARCH';
  productId?: number;
  categoryId?: number;
  searchQuery?: string;
  metadata?: string; // JSON字符串
  timestamp: string;
}

// API通用类型
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

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

// 搜索过滤类型
export interface ProductFilters {
  categoryId?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  rating?: number;
  inStock?: boolean;
}

// 表单验证类型
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
}

// 状态管理类型
export interface AppState {
  auth: AuthState;
  cart: CartState;
  products: ProductState;
  ui: UIState;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  error: string | null;
}

export interface ProductState {
  products: Product[];
  categories: Category[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
  };
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  loading: {
    global: boolean;
    [key: string]: boolean;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: string;
}