/**
 * 主应用组件
 * 
 * 心理过程：
 * 1. 使用React Router设置路由
 * 2. 集成状态管理和API客户端
 * 3. 配置全局样式和主题
 * 4. 设置错误边界和加载状态
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// 页面组件
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';

// 样式
import './index.css';

// React Query 客户端配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-aws-gray-50">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<div>商品页面开发中...</div>} />
              <Route path="/products/:id" element={<div>商品详情页开发中...</div>} />
              <Route path="/cart" element={<div>购物车页面开发中...</div>} />
              <Route path="/login" element={<div>登录页面开发中...</div>} />
              <Route path="/register" element={<div>注册页面开发中...</div>} />
              <Route path="/profile" element={<div>个人中心开发中...</div>} />
              <Route path="/chat" element={<div>AI客服页面开发中...</div>} />
            </Routes>
          </Layout>
          
          {/* 全局通知组件 */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#232f3e',
                color: '#fff',
                borderRadius: '8px',
                border: '1px solid #37475a',
              },
              success: {
                style: {
                  background: '#ff9900',
                  color: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;