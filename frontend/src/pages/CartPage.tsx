/**
 * 购物车页面组件
 * 
 * 心理过程：
 * 1. 设计思路：参考主流电商的购物车设计，左侧商品列表+右侧结算区域
 * 2. 功能架构：商品展示、数量调整、删除操作、优惠券、配送选择、价格计算
 * 3. AI集成：智能优惠券推荐、凑单建议、价格优化提醒
 * 4. 用户体验：批量操作、保存稍后购买、实时价格更新、结算流程优化
 * 5. 响应式设计：移动端友好的操作体验，滑动删除等手势
 * 6. 状态管理：购物车状态同步、实时更新、乐观更新策略
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  HeartIcon,
  ShoppingBagIcon,
  TagIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  GiftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';
import { CartItem, Product } from '../types';
import { apiClient, aiApiClient, handleApiError } from '../services/api';
import Layout from '../components/Layout';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
  onMoveToWishlist: (itemId: number) => void;
  selected: boolean;
  onSelect: (itemId: number, selected: boolean) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onMoveToWishlist,
  selected,
  onSelect
}) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [updating, setUpdating] = useState(false);

  const product = item.product!;
  const images = product.images ? JSON.parse(product.images) : [];
  const mainImage = images[0] || '/placeholder-product.jpg';
  const selectedAttributes = item.selectedAttributes ? JSON.parse(item.selectedAttributes) : {};
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const unitPrice = hasDiscount ? product.discountPrice : product.price;
  const totalPrice = unitPrice * quantity;

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > product.stockQuantity) return;
    
    setQuantity(newQuantity);
    setUpdating(true);
    
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } catch (error) {
      setQuantity(item.quantity); // 回滚
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-aws-gray-200 p-6 hover:shadow-sm transition-shadow">
      <div className="flex gap-4">
        {/* 选择框 */}
        <div className="flex-shrink-0 pt-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(item.id, e.target.checked)}
            className="text-aws-blue focus:ring-aws-blue rounded"
          />
        </div>

        {/* 商品图片 */}
        <Link to={`/products/${product.id}`} className="flex-shrink-0">
          <img
            src={mainImage}
            alt={product.name}
            className="w-24 h-24 object-cover rounded-lg border border-aws-gray-200"
          />
        </Link>

        {/* 商品信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <Link
              to={`/products/${product.id}`}
              className="text-lg font-medium text-aws-gray-900 hover:text-aws-blue line-clamp-2"
            >
              {product.name}
            </Link>
            <button
              onClick={() => onRemove(item.id)}
              className="flex-shrink-0 p-1 text-aws-gray-400 hover:text-red-500 transition-colors ml-2"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>

          {/* 商品属性 */}
          {Object.keys(selectedAttributes).length > 0 && (
            <div className="mb-2">
              {Object.entries(selectedAttributes).map(([key, value]) => (
                <span key={key} className="text-sm text-aws-gray-600 mr-3">
                  {key}: {value}
                </span>
              ))}
            </div>
          )}

          {/* 库存状态 */}
          {product.stockQuantity === 0 ? (
            <p className="text-red-600 text-sm mb-2">缺货</p>
          ) : product.stockQuantity < 10 ? (
            <p className="text-orange-600 text-sm mb-2">
              仅剩 {product.stockQuantity} 件
            </p>
          ) : null}

          <div className="flex items-center justify-between">
            {/* 价格 */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-aws-orange">
                ¥{unitPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-aws-gray-500 line-through">
                  ¥{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* 操作区域 */}
            <div className="flex items-center gap-4">
              {/* 数量调整 */}
              <div className="flex items-center border border-aws-gray-300 rounded-md">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || updating}
                  className="p-2 hover:bg-aws-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center">
                  {updating ? '...' : quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stockQuantity || updating}
                  className="p-2 hover:bg-aws-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              {/* 小计 */}
              <div className="text-right min-w-[100px]">
                <p className="text-lg font-semibold text-aws-gray-900">
                  ¥{totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* 底部操作 */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => onMoveToWishlist(item.id)}
              className="text-sm text-aws-gray-600 hover:text-aws-blue flex items-center gap-1 transition-colors"
            >
              <HeartIcon className="h-4 w-4" />
              移入收藏夹
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CouponCardProps {
  coupon: any;
  onApply: (couponId: string) => void;
  applied: boolean;
  applicable: boolean;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, onApply, applied, applicable }) => {
  return (
    <div className={`border rounded-lg p-4 ${
      applied ? 'border-aws-blue bg-blue-50' : 
      applicable ? 'border-aws-gray-300 hover:border-aws-gray-400' : 
      'border-aws-gray-200 opacity-50'
    } transition-colors`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-aws-orange text-white text-xs px-2 py-1 rounded">
            {coupon.type === 'AMOUNT' ? '满减' : '折扣'}
          </div>
          <div>
            <h4 className="font-medium text-aws-gray-900">
              {coupon.type === 'AMOUNT' 
                ? `满¥${coupon.minAmount}减¥${coupon.discount}`
                : `${coupon.discount}折优惠`
              }
            </h4>
            <p className="text-sm text-aws-gray-600">{coupon.description}</p>
          </div>
        </div>
        
        <button
          onClick={() => onApply(coupon.id)}
          disabled={!applicable || applied}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            applied ? 'bg-aws-blue text-white' :
            applicable ? 'bg-aws-blue text-white hover:bg-aws-blue-dark' :
            'bg-aws-gray-200 text-aws-gray-500 cursor-not-allowed'
          }`}
        >
          {applied ? '已使用' : applicable ? '使用' : '不可用'}
        </button>
      </div>
    </div>
  );
};

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [coupons, setCoupons] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [smartRecommendations, setSmartRecommendations] = useState<Product[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);

  // 获取购物车数据
  const fetchCartItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<CartItem[]>('/cart');
      setCartItems(response.data);
      
      // 默认选中所有有库存的商品
      const availableItemIds = response.data
        .filter(item => item.product && item.product.stockQuantity > 0)
        .map(item => item.id);
      setSelectedItems(new Set(availableItemIds));
      
      // 获取可用优惠券
      const couponsResponse = await apiClient.get('/coupons/available');
      setCoupons(couponsResponse.data);
      
      // 获取智能推荐
      if (response.data.length > 0) {
        const productIds = response.data.map(item => item.productId);
        const recommendationsResponse = await aiApiClient.post('/recommendations', {
          context: {
            cart_products: productIds
          },
          limit: 4,
          strategy: 'collaborative'
        });
        
        if (recommendationsResponse.data.recommendations) {
          const recProductIds = recommendationsResponse.data.recommendations.map((rec: any) => rec.product_id);
          const productsResponse = await apiClient.post('/products/batch', { ids: recProductIds });
          setSmartRecommendations(productsResponse.data);
        }
      }
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新商品数量
  const handleUpdateQuantity = useCallback(async (itemId: number, quantity: number) => {
    try {
      await apiClient.put(`/cart/${itemId}`, { quantity });
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } catch (err: any) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // 删除商品
  const handleRemoveItem = useCallback(async (itemId: number) => {
    try {
      await apiClient.delete(`/cart/${itemId}`);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    } catch (err: any) {
      console.error('删除商品失败:', err);
    }
  }, []);

  // 移入收藏夹
  const handleMoveToWishlist = useCallback(async (itemId: number) => {
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;
    
    try {
      await apiClient.post('/wishlist/add', { productId: item.productId });
      await handleRemoveItem(itemId);
    } catch (err: any) {
      console.error('移入收藏夹失败:', err);
    }
  }, [cartItems, handleRemoveItem]);

  // 选择/取消选择商品
  const handleSelectItem = useCallback((itemId: number, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  }, []);

  // 全选/取消全选
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      const availableItemIds = cartItems
        .filter(item => item.product && item.product.stockQuantity > 0)
        .map(item => item.id);
      setSelectedItems(new Set(availableItemIds));
    } else {
      setSelectedItems(new Set());
    }
  }, [cartItems]);

  // 应用优惠券
  const handleApplyCoupon = useCallback((couponId: string) => {
    setAppliedCoupon(appliedCoupon === couponId ? null : couponId);
  }, [appliedCoupon]);

  // 结算
  const handleCheckout = useCallback(async () => {
    if (selectedItems.size === 0) {
      // TODO: 显示提示
      return;
    }
    
    setCheckingOut(true);
    try {
      const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
      
      const orderData = {
        items: selectedCartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedAttributes: item.selectedAttributes
        })),
        couponId: appliedCoupon
      };
      
      const response = await apiClient.post('/orders/create', orderData);
      
      if (response.data.success) {
        // 清除已结算的购物车商品
        for (const itemId of selectedItems) {
          await apiClient.delete(`/cart/${itemId}`);
        }
        
        navigate(`/orders/${response.data.data.id}`);
      }
    } catch (err: any) {
      console.error('结算失败:', err);
      // TODO: 显示错误提示
    } finally {
      setCheckingOut(false);
    }
  }, [selectedItems, cartItems, appliedCoupon, navigate]);

  // 计算价格信息
  const priceInfo = useMemo(() => {
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    
    let subtotal = 0;
    let totalDiscount = 0;
    
    selectedCartItems.forEach(item => {
      const product = item.product!;
      const hasDiscount = product.discountPrice && product.discountPrice < product.price;
      const unitPrice = hasDiscount ? product.discountPrice : product.price;
      const itemSubtotal = unitPrice * item.quantity;
      
      subtotal += itemSubtotal;
      
      if (hasDiscount) {
        totalDiscount += (product.price - product.discountPrice) * item.quantity;
      }
    });
    
    // 计算优惠券折扣
    let couponDiscount = 0;
    if (appliedCoupon) {
      const coupon = coupons.find(c => c.id === appliedCoupon);
      if (coupon) {
        if (coupon.type === 'AMOUNT' && subtotal >= coupon.minAmount) {
          couponDiscount = Math.min(coupon.discount, subtotal);
        } else if (coupon.type === 'PERCENTAGE') {
          couponDiscount = subtotal * (coupon.discount / 100);
        }
      }
    }
    
    const total = subtotal - couponDiscount;
    
    return {
      subtotal,
      totalDiscount,
      couponDiscount,
      total,
      itemCount: selectedCartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [cartItems, selectedItems, appliedCoupon, coupons]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const allSelected = selectedItems.size > 0 && 
    selectedItems.size === cartItems.filter(item => item.product && item.product.stockQuantity > 0).length;

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

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchCartItems()}
            className="btn-aws-primary"
          >
            重试
          </button>
        </div>
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <ShoppingBagIcon className="h-16 w-16 text-aws-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-aws-gray-900 mb-2">购物车为空</h2>
          <p className="text-aws-gray-600 mb-6">去逛逛，发现更多好商品</p>
          <Link to="/products" className="btn-aws-primary">
            开始购物
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-aws-gray-900 mb-6">购物车</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：购物车商品列表 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 全选和批量操作 */}
            <div className="bg-white rounded-lg border border-aws-gray-200 p-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="text-aws-blue focus:ring-aws-blue rounded"
                  />
                  <span className="text-sm text-aws-gray-700">
                    全选 ({selectedItems.size}/{cartItems.filter(item => item.product && item.product.stockQuantity > 0).length})
                  </span>
                </label>
                
                {selectedItems.size > 0 && (
                  <button
                    onClick={() => {
                      selectedItems.forEach(itemId => handleRemoveItem(itemId));
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    删除选中商品
                  </button>
                )}
              </div>
            </div>

            {/* 商品列表 */}
            <div className="space-y-4">
              {cartItems.map(item => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                  onMoveToWishlist={handleMoveToWishlist}
                  selected={selectedItems.has(item.id)}
                  onSelect={handleSelectItem}
                />
              ))}
            </div>

            {/* 智能推荐 */}
            {smartRecommendations.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                  <SparklesIcon className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-aws-gray-900">为您推荐</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {smartRecommendations.map(product => {
                    const images = product.images ? JSON.parse(product.images) : [];
                    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                    
                    return (
                      <div key={product.id} className="bg-white rounded-lg p-4 border border-aws-gray-200">
                        <div className="flex gap-3">
                          <Link to={`/products/${product.id}`}>
                            <img
                              src={images[0] || '/placeholder-product.jpg'}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          </Link>
                          <div className="flex-1">
                            <Link
                              to={`/products/${product.id}`}
                              className="text-sm font-medium text-aws-gray-900 hover:text-aws-blue line-clamp-2 mb-1"
                            >
                              {product.name}
                            </Link>
                            <div className="flex items-center justify-between">
                              <span className="text-aws-orange font-semibold">
                                ¥{(hasDiscount ? product.discountPrice! : product.price).toLocaleString()}
                              </span>
                              <button
                                onClick={async () => {
                                  try {
                                    await apiClient.post('/cart/add', {
                                      productId: product.id,
                                      quantity: 1
                                    });
                                    fetchCartItems();
                                  } catch (err) {
                                    console.error('添加到购物车失败:', err);
                                  }
                                }}
                                className="text-xs btn-aws-secondary py-1 px-2"
                              >
                                加入购物车
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：结算区域 */}
          <div className="space-y-6">
            {/* 优惠券 */}
            {coupons.length > 0 && (
              <div className="bg-white rounded-lg border border-aws-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className="h-5 w-5 text-aws-orange" />
                  <h3 className="text-lg font-semibold text-aws-gray-900">优惠券</h3>
                </div>
                
                <div className="space-y-3">
                  {coupons.map(coupon => {
                    const applicable = coupon.type === 'AMOUNT' 
                      ? priceInfo.subtotal >= coupon.minAmount 
                      : true;
                    
                    return (
                      <CouponCard
                        key={coupon.id}
                        coupon={coupon}
                        onApply={handleApplyCoupon}
                        applied={appliedCoupon === coupon.id}
                        applicable={applicable}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* 价格明细 */}
            <div className="bg-white rounded-lg border border-aws-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-aws-gray-900 mb-4">结算明细</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-aws-gray-600">商品总价</span>
                  <span className="text-aws-gray-900">¥{priceInfo.subtotal.toLocaleString()}</span>
                </div>
                
                {priceInfo.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-aws-gray-600">商品优惠</span>
                    <span className="text-green-600">-¥{priceInfo.totalDiscount.toLocaleString()}</span>
                  </div>
                )}
                
                {priceInfo.couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-aws-gray-600">优惠券优惠</span>
                    <span className="text-green-600">-¥{priceInfo.couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <TruckIcon className="h-4 w-4 text-aws-gray-500" />
                    <span className="text-aws-gray-600">运费</span>
                  </div>
                  <span className="text-green-600">免费</span>
                </div>
              </div>
              
              <div className="border-t border-aws-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-aws-gray-900">应付总额</span>
                  <span className="text-2xl font-bold text-aws-orange">
                    ¥{priceInfo.total.toLocaleString()}
                  </span>
                </div>
                {priceInfo.itemCount > 0 && (
                  <p className="text-sm text-aws-gray-600 mt-1">
                    共 {priceInfo.itemCount} 件商品
                  </p>
                )}
              </div>
              
              {/* 服务保障 */}
              <div className="bg-aws-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-aws-gray-700">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span>支持7天无理由退换货</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={selectedItems.size === 0 || checkingOut}
                className="w-full btn-aws-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checkingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    结算中...
                  </>
                ) : (
                  <>
                    去结算 ({selectedItems.size})
                    <ArrowRightIcon className="h-5 w-5" />
                  </>
                )}
              </button>
              
              {selectedItems.size === 0 && (
                <p className="text-center text-sm text-aws-gray-500 mt-2">
                  请选择要结算的商品
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;