/**
 * AWS风格头部导航组件
 * 
 * 心理过程：
 * 1. 参考AWS控制台的顶部导航栏
 * 2. 左侧LOGO和导航，右侧用户操作
 * 3. 搜索栏居中，响应式设计
 * 4. 深色背景配橙色点缀色
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  UserIcon,
  Bars3Icon,
  BellIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  // 模拟用户状态
  const isLoggedIn = false; // 这里应该从认证状态管理中获取
  const cartItemsCount = 3; // 这里应该从购物车状态中获取

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-aws-navy shadow-aws-lg relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左侧：Logo和菜单按钮 */}
          <div className="flex items-center">
            {/* 移动端菜单按钮 */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-aws-gray-400 hover:text-white hover:bg-aws-navy-light transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            {/* Logo */}
            <Link to="/" className="flex items-center ml-2 lg:ml-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-aws-orange rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-white font-semibold text-lg">
                    Commerce
                  </h1>
                  <p className="text-aws-gray-400 text-xs -mt-1">
                    智能电商平台
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* 中间：搜索栏 */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-aws-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索商品、品牌或类别..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-aws-gray-300 rounded-lg focus:ring-2 focus:ring-aws-orange focus:border-transparent transition-all"
                />
              </div>
            </form>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center space-x-4">
            {/* 移动端搜索按钮 */}
            <button className="md:hidden p-2 rounded-md text-aws-gray-400 hover:text-white hover:bg-aws-navy-light transition-colors">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {/* 智能客服 */}
            <Link
              to="/chat"
              className="p-2 rounded-md text-aws-gray-400 hover:text-white hover:bg-aws-navy-light transition-colors relative"
              title="AI智能客服"
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-aws-orange rounded-full animate-pulse"></span>
            </Link>

            {/* 通知 */}
            <button className="p-2 rounded-md text-aws-gray-400 hover:text-white hover:bg-aws-navy-light transition-colors relative">
              <BellIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            {/* 购物车 */}
            <Link
              to="/cart"
              className="p-2 rounded-md text-aws-gray-400 hover:text-white hover:bg-aws-navy-light transition-colors relative"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-aws-orange text-white text-xs rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* 用户菜单 */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center p-2 rounded-md text-aws-gray-400 hover:text-white hover:bg-aws-navy-light transition-colors"
              >
                <UserIcon className="h-6 w-6" />
                <span className="hidden sm:block ml-2 text-sm">
                  {isLoggedIn ? '用户中心' : '登录'}
                </span>
              </button>

              {/* 用户下拉菜单 */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-aws-xl border border-aws-gray-200 py-2">
                  {isLoggedIn ? (
                    <>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-aws-gray-700 hover:bg-aws-gray-100 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        个人中心
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-aws-gray-700 hover:bg-aws-gray-100 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        我的订单
                      </Link>
                      <div className="border-t border-aws-gray-200 my-2"></div>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-aws-gray-100 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        退出登录
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-aws-gray-700 hover:bg-aws-gray-100 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        登录
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-aws-gray-700 hover:bg-aws-gray-100 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        注册
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 移动端搜索栏 */}
      <div className="md:hidden border-t border-aws-navy-light px-4 py-3">
        <form onSubmit={handleSearch} className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-aws-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索商品..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-aws-gray-300 rounded-lg focus:ring-2 focus:ring-aws-orange focus:border-transparent"
          />
        </form>
      </div>
    </header>
  );
};

export default Header;