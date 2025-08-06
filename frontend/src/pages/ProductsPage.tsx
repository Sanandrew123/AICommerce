/**
 * 商品列表页面组件
 * 
 * 心理过程：
 * 1. 设计思路：参考Amazon和淘宝的商品展示页面，结合AWS控制台的现代UI风格
 * 2. 功能架构：左侧过滤器+右侧商品网格，顶部搜索栏和排序选项
 * 3. AI集成：智能推荐算法、个性化排序、搜索建议
 * 4. 用户体验：无限滚动/分页、快速筛选、收藏功能、价格范围滑块
 * 5. 响应式设计：移动端优先，渐进增强到桌面端
 * 6. 状态管理：使用React hooks管理复杂的筛选和搜索状态
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  SparklesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';
import { Product, Category, ProductFilters, PaginatedResponse } from '../types';
import { apiClient, aiApiClient, handleApiError } from '../services/api';
import Layout from '../components/Layout';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onAddToCart: (productId: number) => void;
  onToggleFavorite: (productId: number) => void;
  favorites: Set<number>;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode, 
  onAddToCart, 
  onToggleFavorite, 
  favorites 
}) => {
  const isFavorite = favorites.has(product.id);
  const images = product.images ? JSON.parse(product.images) : [];
  const mainImage = images[0] || '/placeholder-product.jpg';
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discount = hasDiscount ? Math.round((1 - product.discountPrice! / product.price) * 100) : 0;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-aws-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex gap-6">
          <Link to={`/products/${product.id}`} className="flex-shrink-0">
            <img 
              src={mainImage} 
              alt={product.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <Link 
                to={`/products/${product.id}`}
                className="text-lg font-medium text-aws-gray-900 hover:text-aws-blue line-clamp-2"
              >
                {product.name}
              </Link>
              <button
                onClick={() => onToggleFavorite(product.id)}
                className="flex-shrink-0 p-1 ml-2"
              >
                {isFavorite ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-aws-gray-400 hover:text-red-500" />
                )}
              </button>
            </div>
            
            <p className="text-aws-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarSolidIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-aws-gray-300'
                    }`}
                  />
                ))}
                <span className="text-sm text-aws-gray-500 ml-1">
                  ({product.reviewCount})
                </span>
              </div>
              
              {product.brand && (
                <span className="text-sm text-aws-gray-500">
                  {product.brand}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-aws-orange">
                  ¥{(hasDiscount ? product.discountPrice! : product.price).toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-aws-gray-500 line-through">
                      ¥{product.price.toLocaleString()}
                    </span>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>
              
              <button
                onClick={() => onAddToCart(product.id)}
                disabled={product.stockQuantity === 0}
                className="btn-aws-primary py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stockQuantity === 0 ? '缺货' : '加入购物车'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-aws-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative">
        <Link to={`/products/${product.id}`}>
          <img 
            src={mainImage} 
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        <button
          onClick={() => onToggleFavorite(product.id)}
          className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-colors"
        >
          {isFavorite ? (
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-aws-gray-600" />
          )}
        </button>
        
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            -{discount}%
          </div>
        )}
        
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium">缺货</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <Link 
          to={`/products/${product.id}`}
          className="text-lg font-medium text-aws-gray-900 hover:text-aws-blue line-clamp-2 block mb-2"
        >
          {product.name}
        </Link>
        
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <StarSolidIcon
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-aws-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-aws-gray-500 ml-1">
            ({product.reviewCount})
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-aws-orange">
              ¥{(hasDiscount ? product.discountPrice! : product.price).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-aws-gray-500 line-through">
                ¥{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onAddToCart(product.id)}
          disabled={product.stockQuantity === 0}
          className="w-full btn-aws-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingCartIcon className="h-4 w-4" />
          {product.stockQuantity === 0 ? '缺货' : '加入购物车'}
        </button>
      </div>
    </div>
  );
};

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Product[]>([]);
  
  // 分页状态
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true
  });
  
  // 筛选状态
  const [filters, setFilters] = useState<ProductFilters>({
    keyword: searchParams.get('q') || '',
    categoryId: searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined,
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    brand: searchParams.get('brand') || undefined,
    rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined,
    inStock: searchParams.get('inStock') === 'true' || undefined
  });
  
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(
    searchParams.get('sortDir') as 'asc' | 'desc' || 'desc'
  );
  
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || 0,
    max: filters.maxPrice || 10000
  });

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.get<Category[]>('/categories');
      setCategories(response.data);
    } catch (err: any) {
      console.error('获取分类失败:', err);
    }
  }, []);

  // 获取商品列表
  const fetchProducts = useCallback(async (page: number = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', pagination.size.toString());
      params.append('sortBy', sortBy);
      params.append('sortDir', sortDir);
      
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.inStock) params.append('inStock', filters.inStock.toString());
      
      const response = await apiClient.get<PaginatedResponse<Product>>(`/products?${params}`);
      
      if (response.data.success) {
        setProducts(response.data.content);
        setPagination({
          page: response.data.page,
          size: response.data.size,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements,
          first: response.data.first,
          last: response.data.last
        });
      }
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortDir, pagination.size]);

  // 获取AI推荐
  const fetchAiRecommendations = useCallback(async () => {
    try {
      const response = await aiApiClient.post('/recommendations', {
        context: {
          category_id: filters.categoryId,
          search_query: filters.keyword
        },
        limit: 4,
        strategy: 'hybrid'
      });
      
      if (response.data.recommendations) {
        // 获取推荐商品的详细信息
        const productIds = response.data.recommendations.map((rec: any) => rec.product_id);
        const productsResponse = await apiClient.post('/products/batch', { ids: productIds });
        setAiRecommendations(productsResponse.data);
      }
    } catch (err: any) {
      console.error('获取AI推荐失败:', err);
    }
  }, [filters.categoryId, filters.keyword]);

  // 更新URL参数
  const updateSearchParams = useCallback((newFilters: ProductFilters, newSortBy?: string, newSortDir?: 'asc' | 'desc') => {
    const params = new URLSearchParams();
    
    if (newFilters.keyword) params.set('q', newFilters.keyword);
    if (newFilters.categoryId) params.set('category', newFilters.categoryId.toString());
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.brand) params.set('brand', newFilters.brand);
    if (newFilters.rating) params.set('rating', newFilters.rating.toString());
    if (newFilters.inStock) params.set('inStock', newFilters.inStock.toString());
    if (newSortBy) params.set('sortBy', newSortBy);
    if (newSortDir) params.set('sortDir', newSortDir);
    
    setSearchParams(params);
  }, [setSearchParams]);

  // 应用筛选器
  const applyFilters = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
    updateSearchParams(newFilters, sortBy, sortDir);
  }, [sortBy, sortDir, updateSearchParams]);

  // 重置筛选器
  const resetFilters = useCallback(() => {
    const newFilters: ProductFilters = { keyword: '' };
    setFilters(newFilters);
    setPriceRange({ min: 0, max: 10000 });
    updateSearchParams(newFilters, sortBy, sortDir);
  }, [sortBy, sortDir, updateSearchParams]);

  // 添加到购物车
  const handleAddToCart = useCallback(async (productId: number) => {
    try {
      await apiClient.post('/cart/add', {
        productId,
        quantity: 1
      });
      // TODO: 显示成功提示
    } catch (err: any) {
      console.error('添加到购物车失败:', err);
      // TODO: 显示错误提示
    }
  }, []);

  // 切换收藏状态
  const handleToggleFavorite = useCallback((productId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  }, []);

  // 页面加载时获取数据
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
    fetchAiRecommendations();
  }, [fetchProducts, fetchAiRecommendations]);

  // 计算品牌列表
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(product => {
      if (product.brand) brands.add(product.brand);
    });
    return Array.from(brands).sort();
  }, [products]);

  const sortOptions = [
    { value: 'createdAt-desc', label: '最新上架' },
    { value: 'price-asc', label: '价格从低到高' },
    { value: 'price-desc', label: '价格从高到低' },
    { value: 'rating-desc', label: '评分最高' },
    { value: 'reviewCount-desc', label: '销量最高' }
  ];

  return (
    <Layout>
      <div className="max-w-none -mx-4 sm:-mx-6 lg:-mx-8">
        {/* 页面标题和搜索栏 */}
        <div className="bg-white border-b border-aws-gray-200 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-aws-gray-900">商品中心</h1>
                <p className="text-aws-gray-600 mt-1">
                  {pagination.totalElements > 0 && `共 ${pagination.totalElements.toLocaleString()} 件商品`}
                </p>
              </div>
              
              {/* 搜索栏 */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-aws-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索商品..."
                    value={filters.keyword || ''}
                    onChange={(e) => {
                      const newFilters = { ...filters, keyword: e.target.value };
                      if (e.target.value === '') {
                        applyFilters(newFilters);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        applyFilters({ ...filters, keyword: e.currentTarget.value });
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-aws-gray-300 rounded-lg focus:ring-2 focus:ring-aws-blue focus:border-aws-blue"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左侧筛选器 */}
            <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-lg shadow-sm border border-aws-gray-200 p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-aws-gray-900">筛选器</h2>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-aws-blue hover:text-aws-blue-dark"
                  >
                    重置
                  </button>
                </div>

                {/* 分类筛选 */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-aws-gray-900 mb-3">分类</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={!filters.categoryId}
                        onChange={() => applyFilters({ ...filters, categoryId: undefined })}
                        className="text-aws-blue focus:ring-aws-blue"
                      />
                      <span className="ml-2 text-sm text-aws-gray-700">全部分类</span>
                    </label>
                    {categories.map(category => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          checked={filters.categoryId === category.id}
                          onChange={() => applyFilters({ ...filters, categoryId: category.id })}
                          className="text-aws-blue focus:ring-aws-blue"
                        />
                        <span className="ml-2 text-sm text-aws-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 价格范围 */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-aws-gray-900 mb-3">价格范围</h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="最低价"
                        value={priceRange.min || ''}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 text-sm border border-aws-gray-300 rounded-md focus:ring-2 focus:ring-aws-blue focus:border-aws-blue"
                      />
                      <input
                        type="number"
                        placeholder="最高价"
                        value={priceRange.max || ''}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseFloat(e.target.value) || 10000 }))}
                        className="w-full px-3 py-2 text-sm border border-aws-gray-300 rounded-md focus:ring-2 focus:ring-aws-blue focus:border-aws-blue"
                      />
                    </div>
                    <button
                      onClick={() => applyFilters({ 
                        ...filters, 
                        minPrice: priceRange.min || undefined,
                        maxPrice: priceRange.max || undefined 
                      })}
                      className="w-full btn-aws-secondary text-sm py-2"
                    >
                      应用价格筛选
                    </button>
                  </div>
                </div>

                {/* 品牌筛选 */}
                {availableBrands.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-aws-gray-900 mb-3">品牌</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="brand"
                          checked={!filters.brand}
                          onChange={() => applyFilters({ ...filters, brand: undefined })}
                          className="text-aws-blue focus:ring-aws-blue"
                        />
                        <span className="ml-2 text-sm text-aws-gray-700">全部品牌</span>
                      </label>
                      {availableBrands.map(brand => (
                        <label key={brand} className="flex items-center">
                          <input
                            type="radio"
                            name="brand"
                            checked={filters.brand === brand}
                            onChange={() => applyFilters({ ...filters, brand })}
                            className="text-aws-blue focus:ring-aws-blue"
                          />
                          <span className="ml-2 text-sm text-aws-gray-700">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 评分筛选 */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-aws-gray-900 mb-3">评分</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <label key={rating} className="flex items-center">
                        <input
                          type="radio"
                          name="rating"
                          checked={filters.rating === rating}
                          onChange={() => applyFilters({ ...filters, rating })}
                          className="text-aws-blue focus:ring-aws-blue"
                        />
                        <div className="ml-2 flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarSolidIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < rating ? 'text-yellow-400' : 'text-aws-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-sm text-aws-gray-700">及以上</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 库存筛选 */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock || false}
                      onChange={(e) => applyFilters({ ...filters, inStock: e.target.checked || undefined })}
                      className="text-aws-blue focus:ring-aws-blue"
                    />
                    <span className="ml-2 text-sm text-aws-gray-700">仅显示有货商品</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 右侧商品列表 */}
            <div className="flex-1 min-w-0">
              {/* AI推荐区域 */}
              {aiRecommendations.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6 border border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <SparklesIcon className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-aws-gray-900">AI为您推荐</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {aiRecommendations.map(product => (
                      <div key={product.id} className="bg-white rounded-lg p-4 shadow-sm">
                        <Link to={`/products/${product.id}`}>
                          <img 
                            src={product.images ? JSON.parse(product.images)[0] : '/placeholder-product.jpg'} 
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-md mb-2"
                          />
                          <h3 className="text-sm font-medium text-aws-gray-900 line-clamp-2 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-lg font-bold text-aws-orange">
                            ¥{product.price.toLocaleString()}
                          </p>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 工具栏 */}
              <div className="bg-white rounded-lg shadow-sm border border-aws-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden btn-aws-secondary text-sm py-2 px-3 flex items-center gap-2"
                    >
                      <FunnelIcon className="h-4 w-4" />
                      筛选器
                    </button>
                    
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-sm text-aws-gray-700">视图:</span>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md ${
                          viewMode === 'grid' 
                            ? 'bg-aws-blue text-white' 
                            : 'bg-aws-gray-100 text-aws-gray-600 hover:bg-aws-gray-200'
                        }`}
                      >
                        <Squares2X2Icon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md ${
                          viewMode === 'list' 
                            ? 'bg-aws-blue text-white' 
                            : 'bg-aws-gray-100 text-aws-gray-600 hover:bg-aws-gray-200'
                        }`}
                      >
                        <ListBulletIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <select
                      value={`${sortBy}-${sortDir}`}
                      onChange={(e) => {
                        const [newSortBy, newSortDir] = e.target.value.split('-');
                        setSortBy(newSortBy);
                        setSortDir(newSortDir as 'asc' | 'desc');
                        updateSearchParams(filters, newSortBy, newSortDir as 'asc' | 'desc');
                      }}
                      className="text-sm border border-aws-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-aws-blue focus:border-aws-blue"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 商品网格/列表 */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aws-blue"></div>
                  <span className="ml-2 text-aws-gray-600">加载中...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button 
                    onClick={() => fetchProducts()}
                    className="btn-aws-secondary"
                  >
                    重试
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-aws-gray-600 mb-4">未找到匹配的商品</p>
                  <button 
                    onClick={resetFilters}
                    className="btn-aws-secondary"
                  >
                    重置筛选条件
                  </button>
                </div>
              ) : (
                <>
                  <div className={
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                      : 'space-y-4'
                  }>
                    {products.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                        onAddToCart={handleAddToCart}
                        onToggleFavorite={handleToggleFavorite}
                        favorites={favorites}
                      />
                    ))}
                  </div>

                  {/* 分页 */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button
                        onClick={() => fetchProducts(pagination.page - 1)}
                        disabled={pagination.first}
                        className="btn-aws-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        上一页
                      </button>
                      
                      <span className="px-4 py-2 text-sm text-aws-gray-600">
                        第 {pagination.page + 1} 页，共 {pagination.totalPages} 页
                      </span>
                      
                      <button
                        onClick={() => fetchProducts(pagination.page + 1)}
                        disabled={pagination.last}
                        className="btn-aws-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        下一页
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;