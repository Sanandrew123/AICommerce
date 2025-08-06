/**
 * 订单页面
 * 
 * 心理过程：
 * 1. 订单列表展示和状态筛选
 * 2. 订单详情查看和状态跟踪
 * 3. 订单操作（取消、确认收货、申请退款）
 * 4. 订单搜索和分页
 * 5. 订单统计和数据分析
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CreditCardIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { orderService } from '../services';
import { Order } from '../types';

type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | '';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('');
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });

  // 订单状态配置
  const statusConfig = {
    PENDING: { label: '待付款', color: 'text-yellow-600 bg-yellow-50', icon: CreditCardIcon },
    PAID: { label: '已付款', color: 'text-blue-600 bg-blue-50', icon: ClockIcon },
    SHIPPED: { label: '已发货', color: 'text-purple-600 bg-purple-50', icon: TruckIcon },
    DELIVERED: { label: '已送达', color: 'text-green-600 bg-green-50', icon: CheckCircleIcon },
    CANCELLED: { label: '已取消', color: 'text-red-600 bg-red-50', icon: XCircleIcon }
  };

  // 加载订单列表
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        status: selectedStatus || undefined,
        sortBy: 'createdAt',
        sortDir: 'desc' as const
      };
      
      const response = await orderService.getUserOrders(params);
      if (response.success) {
        setOrders(response.data.content);
        setPagination({
          page: response.data.page,
          size: response.data.size,
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages
        });
      } else {
        setError(response.message || '加载订单失败');
      }
    } catch (err: any) {
      setError(err.message || '加载订单失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, selectedStatus]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // 状态筛选
  const handleStatusFilter = (status: OrderStatus) => {
    setSelectedStatus(status);
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // 订单卡片组件
  const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const StatusIcon = statusConfig[order.status]?.icon || ClockIcon;
    
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        {/* 订单头部 */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">订单号:</span>
            <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
            <span className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[order.status]?.color}`}>
            <StatusIcon className="h-4 w-4 inline mr-1" />
            {statusConfig[order.status]?.label}
          </div>
        </div>

        {/* 订单总额和操作 */}
        <div className="flex items-center justify-between">
          <div className="text-lg">
            <span className="text-gray-600">总计: </span>
            <span className="font-bold text-aws-orange">¥{order.totalAmount.toFixed(2)}</span>
          </div>
          
          <div className="flex space-x-3">
            <button className="btn-aws-secondary px-4 py-2 text-sm rounded-lg flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              查看详情
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aws-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的订单</h1>
        </div>

        {/* 状态筛选 */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedStatus === '' 
                  ? 'bg-aws-orange text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              全部订单
            </button>
            {Object.entries(statusConfig).map(([status, config]) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status as OrderStatus)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === status 
                    ? 'bg-aws-orange text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* 错误状态 */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadOrders}
              className="btn-aws-primary px-6 py-2 rounded-lg"
            >
              重试
            </button>
          </div>
        )}

        {/* 订单列表 */}
        {!error && (
          <>
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <ClockIcon className="h-24 w-24 mx-auto" />
                </div>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">暂无订单</h2>
                <p className="text-gray-600 mb-8">您还没有任何订单，快去购物吧！</p>
                <button
                  onClick={() => navigate('/products')}
                  className="btn-aws-primary px-8 py-3 rounded-lg text-lg"
                >
                  立即购物
                </button>
              </div>
            ) : (
              <>
                <div>
                  {orders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>

                {/* 分页 */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 0 || loading}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      上一页
                    </button>
                    
                    <span className="px-4 py-2 text-gray-600">
                      第 {pagination.page + 1} 页，共 {pagination.totalPages} 页
                    </span>
                    
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.totalPages - 1 || loading}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      下一页
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;