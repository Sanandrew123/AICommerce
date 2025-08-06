/**
 * 商品详情页面组件
 * 
 * 心理过程：
 * 1. 设计思路：参考Amazon商品页面布局，左侧图片展示+右侧商品信息
 * 2. 功能架构：图片轮播、商品基本信息、价格显示、规格选择、购买操作
 * 3. AI集成：价格趋势预测、相似商品推荐、智能评价分析
 * 4. 用户体验：放大镜效果、评价系统、问答区域、收藏和分享
 * 5. 响应式设计：移动端友好的图片查看和操作体验
 * 6. 性能优化：图片懒加载、组件按需渲染
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HeartIcon,
  ShareIcon,
  ShoppingCartIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ChartBarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';
import { Product, Recommendation } from '../types';
import { apiClient, aiApiClient, handleApiError } from '../services/api';
import Layout from '../components/Layout';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, productName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* 主图显示 */}
      <div className="relative bg-white rounded-lg overflow-hidden border border-aws-gray-200">
        <div className="aspect-w-1 aspect-h-1 w-full">
          <img
            src={images[currentImageIndex] || '/placeholder-product.jpg'}
            alt={productName}
            className={`w-full h-96 object-cover cursor-zoom-in transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
        </div>
        
        {/* 导航按钮 */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}
        
        {/* 图片指示器 */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* 缩略图列表 */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                index === currentImageIndex 
                  ? 'border-aws-blue' 
                  : 'border-aws-gray-200 hover:border-aws-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface PricePredictionProps {
  productId: number;
  currentPrice: number;
}

const PricePrediction: React.FC<PricePredictionProps> = ({ productId, currentPrice }) => {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const response = await aiApiClient.post('/analytics/price-prediction', {
          product_id: productId
        });
        setPrediction(response.data);
      } catch (err) {
        console.error('获取价格预测失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [productId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <ChartBarIcon className="h-5 w-5 text-blue-600 animate-pulse" />
          <h3 className="font-medium text-aws-gray-900">AI价格预测</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-blue-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const trend = prediction.trend || 'stable';
  const confidence = prediction.confidence || 0;
  const predictedPrice = prediction.predicted_price || currentPrice;
  const changePercent = ((predictedPrice - currentPrice) / currentPrice * 100).toFixed(1);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <ChartBarIcon className="h-5 w-5 text-blue-600" />
        <h3 className="font-medium text-aws-gray-900">AI价格预测</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-aws-gray-600">30天预测价格</span>
          <span className="font-semibold text-aws-gray-900">
            ¥{predictedPrice.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-aws-gray-600">趋势预测</span>
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-red-600' : 
            trend === 'down' ? 'text-green-600' : 
            'text-aws-gray-600'
          }`}>
            {trend === 'up' ? `↗ +${changePercent}%` : 
             trend === 'down' ? `↘ ${changePercent}%` : 
             '→ 稳定'}
          </span>
        </div>
        
        <div className="text-xs text-aws-gray-500 mt-2">
          预测准确度: {(confidence * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<any>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);

  // 获取商品详情
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<Product>(`/products/${id}`);
      setProduct(response.data);
      
      // 获取相关商品推荐
      if (response.data.category?.id) {
        const recommendationsResponse = await aiApiClient.post('/recommendations', {
          context: {
            current_product_id: parseInt(id),
            category_id: response.data.category.id
          },
          limit: 4,
          strategy: 'content'
        });
        
        if (recommendationsResponse.data.recommendations) {
          const productIds = recommendationsResponse.data.recommendations.map((rec: any) => rec.product_id);
          const relatedResponse = await apiClient.post('/products/batch', { ids: productIds });
          setRelatedProducts(relatedResponse.data);
        }
      }
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 添加到购物车
  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      await apiClient.post('/cart/add', {
        productId: product.id,
        quantity,
        selectedAttributes: Object.keys(selectedAttributes).length > 0 ? JSON.stringify(selectedAttributes) : undefined
      });
      
      // TODO: 显示成功提示
      console.log('商品已添加到购物车');
    } catch (err: any) {
      console.error('添加到购物车失败:', err);
      // TODO: 显示错误提示
    } finally {
      setAddingToCart(false);
    }
  }, [product, quantity, selectedAttributes]);

  // 立即购买
  const handleBuyNow = useCallback(async () => {
    await handleAddToCart();
    navigate('/cart');
  }, [handleAddToCart, navigate]);

  // 切换收藏状态
  const handleToggleFavorite = useCallback(() => {
    setIsFavorite(!isFavorite);
    // TODO: 调用API更新收藏状态
  }, [isFavorite]);

  // 分享商品
  const handleShare = useCallback(() => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      // TODO: 显示复制成功提示
    }
  }, [product]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // 解析商品属性和图片
  const productImages = useMemo(() => {
    if (!product?.images) return [];
    try {
      return JSON.parse(product.images);
    } catch {
      return [];
    }
  }, [product?.images]);

  const productAttributes = useMemo(() => {
    if (!product?.attributes) return {};
    try {
      return JSON.parse(product.attributes);
    } catch {
      return {};
    }
  }, [product?.attributes]);

  const hasDiscount = product?.discountPrice && product.discountPrice < product.price;
  const discount = hasDiscount ? Math.round((1 - product.discountPrice! / product.price) * 100) : 0;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aws-blue"></div>
          <span className="ml-2 text-aws-gray-600">加载中...</span>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || '商品不存在'}</p>
          <button 
            onClick={() => navigate('/products')}
            className="btn-aws-primary"
          >
            返回商品列表
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* 面包屑导航 */}
      <nav className="flex items-center gap-2 text-sm text-aws-gray-600 mb-6">
        <Link to="/" className="hover:text-aws-blue">首页</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-aws-blue">商品</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link 
              to={`/products?category=${product.category.id}`} 
              className="hover:text-aws-blue"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-aws-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* 左侧：商品图片 */}
        <div>
          <ProductImageGallery images={productImages} productName={product.name} />
        </div>

        {/* 右侧：商品信息 */}
        <div className="space-y-6">
          {/* 商品标题和操作 */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-aws-gray-900">
                {product.name}
              </h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className="p-2 rounded-full hover:bg-aws-gray-100 transition-colors"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-aws-gray-400" />
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full hover:bg-aws-gray-100 transition-colors"
                >
                  <ShareIcon className="h-6 w-6 text-aws-gray-400" />
                </button>
              </div>
            </div>
            
            {product.brand && (
              <p className="text-aws-gray-600 mb-2">品牌: {product.brand}</p>
            )}
            
            {product.sku && (
              <p className="text-sm text-aws-gray-500">商品编号: {product.sku}</p>
            )}
          </div>

          {/* 评分和评价 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <StarSolidIcon
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-aws-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-aws-gray-600">
                {product.rating.toFixed(1)} ({product.reviewCount} 条评价)
              </span>
            </div>
          </div>

          {/* 价格 */}
          <div className="bg-aws-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-3xl font-bold text-aws-orange">
                ¥{(hasDiscount ? product.discountPrice! : product.price).toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-aws-gray-500 line-through">
                    ¥{product.price.toLocaleString()}
                  </span>
                  <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                    -{discount}%
                  </span>
                </>
              )}
            </div>
            {hasDiscount && (
              <p className="text-sm text-red-600">
                限时优惠，节省 ¥{(product.price - product.discountPrice!).toLocaleString()}
              </p>
            )}
          </div>

          {/* AI价格预测 */}
          <PricePrediction productId={product.id} currentPrice={product.price} />

          {/* 商品属性选择 */}
          {Object.keys(productAttributes).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-aws-gray-900">规格选择</h3>
              {Object.entries(productAttributes).map(([attrName, attrValues]: [string, any]) => (
                <div key={attrName}>
                  <label className="block text-sm font-medium text-aws-gray-700 mb-2">
                    {attrName}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(attrValues) ? attrValues.map((value: any) => (
                      <button
                        key={value}
                        onClick={() => setSelectedAttributes(prev => ({ ...prev, [attrName]: value }))}
                        className={`px-3 py-2 border rounded-md text-sm transition-colors ${
                          selectedAttributes[attrName] === value
                            ? 'border-aws-blue bg-aws-blue text-white'
                            : 'border-aws-gray-300 hover:border-aws-gray-400'
                        }`}
                      >
                        {value}
                      </button>
                    )) : (
                      <span className="px-3 py-2 bg-aws-gray-100 rounded-md text-sm">
                        {attrValues}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 数量选择 */}
          <div>
            <label className="block text-sm font-medium text-aws-gray-700 mb-2">
              数量
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-aws-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-aws-gray-100 transition-colors"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="p-2 hover:bg-aws-gray-100 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-aws-gray-600">
                库存 {product.stockQuantity} 件
              </span>
            </div>
          </div>

          {/* 购买按钮 */}
          <div className="space-y-3">
            <button
              onClick={handleBuyNow}
              disabled={product.stockQuantity === 0 || addingToCart}
              className="w-full btn-aws-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.stockQuantity === 0 ? '缺货' : '立即购买'}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0 || addingToCart}
              className="w-full btn-aws-secondary py-3 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {addingToCart ? '添加中...' : '加入购物车'}
            </button>
          </div>

          {/* 服务保障 */}
          <div className="bg-aws-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-aws-gray-900 mb-3">服务保障</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <TruckIcon className="h-5 w-5 text-aws-blue" />
                <span className="text-sm text-aws-gray-700">全国包邮，48小时内发货</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="h-5 w-5 text-aws-blue" />
                <span className="text-sm text-aws-gray-700">正品保证，假一赔十</span>
              </div>
              <div className="flex items-center gap-3">
                <ArrowPathIcon className="h-5 w-5 text-aws-blue" />
                <span className="text-sm text-aws-gray-700">7天无理由退换货</span>
              </div>
              <div className="flex items-center gap-3">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-aws-blue" />
                <span className="text-sm text-aws-gray-700">24/7 客服支持</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 商品详情描述 */}
      <div className="bg-white rounded-lg shadow-sm border border-aws-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-aws-gray-900 mb-4">商品详情</h2>
        <div className="prose max-w-none text-aws-gray-700">
          {product.description ? (
            <p className="whitespace-pre-line">{product.description}</p>
          ) : (
            <p>暂无详细描述</p>
          )}
        </div>
      </div>

      {/* 相关商品推荐 */}
      {relatedProducts.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center gap-2 mb-6">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-aws-gray-900">相关商品推荐</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => {
              const relatedImages = relatedProduct.images ? JSON.parse(relatedProduct.images) : [];
              const relatedHasDiscount = relatedProduct.discountPrice && relatedProduct.discountPrice < relatedProduct.price;
              
              return (
                <Link
                  key={relatedProduct.id}
                  to={`/products/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-sm border border-aws-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-w-1 aspect-h-1">
                    <img
                      src={relatedImages[0] || '/placeholder-product.jpg'}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-aws-gray-900 group-hover:text-aws-blue line-clamp-2 mb-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <StarSolidIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(relatedProduct.rating) ? 'text-yellow-400' : 'text-aws-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-aws-gray-500 ml-1">
                        ({relatedProduct.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-aws-orange">
                        ¥{(relatedHasDiscount ? relatedProduct.discountPrice! : relatedProduct.price).toLocaleString()}
                      </span>
                      {relatedHasDiscount && (
                        <span className="text-sm text-aws-gray-500 line-through">
                          ¥{relatedProduct.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductDetailPage;