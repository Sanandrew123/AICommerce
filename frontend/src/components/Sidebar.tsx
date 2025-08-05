/**
 * AWS风格侧边栏组件
 * 
 * 心理过程：
 * 1. 参考AWS控制台的左侧导航栏
 * 2. 分类清晰的导航结构
 * 3. 图标+文字的导航项设计
 * 4. 可折叠的子菜单
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  CubeIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItemProps {
  to?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children?: NavItemProps[];
  badge?: string | number;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, children, badge, onClick }) => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const isActive = to ? location.pathname === to : false;
  const hasChildren = children && children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    }
    if (onClick) {
      onClick();
    }
  };

  const baseClasses = "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group";
  const activeClasses = isActive 
    ? "bg-aws-orange text-white shadow-aws" 
    : "text-aws-gray-600 hover:bg-aws-gray-100 hover:text-aws-gray-900";

  const content = (
    <div className={`${baseClasses} ${activeClasses}`}>
      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="ml-2 px-2 py-1 text-xs bg-aws-orange text-white rounded-full">
          {badge}
        </span>
      )}
      {hasChildren && (
        <ChevronDownIcon 
          className={`h-4 w-4 ml-2 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      )}
    </div>
  );

  return (
    <>
      {to && !hasChildren ? (
        <Link to={to} onClick={onClick}>
          {content}
        </Link>
      ) : (
        <button onClick={handleClick} className="w-full text-left">
          {content}
        </button>
      )}
      
      {hasChildren && expanded && (
        <div className="ml-4 mt-1 space-y-1">
          {children.map((child, index) => (
            <NavItem key={index} {...child} onClick={onClick} />
          ))}
        </div>
      )}
    </>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navItems: NavItemProps[] = [
    {
      to: '/',
      icon: HomeIcon,
      label: '首页'
    },
    {
      to: '/products',
      icon: CubeIcon,
      label: '商品中心',
      children: [
        { to: '/products', icon: CubeIcon, label: '全部商品' },
        { to: '/products?category=electronics', icon: CubeIcon, label: '电子产品' },
        { to: '/products?category=clothing', icon: CubeIcon, label: '服装' },
        { to: '/products?category=books', icon: CubeIcon, label: '图书' },
        { to: '/products?category=sports', icon: CubeIcon, label: '运动' }
      ]
    },
    {
      to: '/cart',
      icon: ShoppingBagIcon,
      label: '购物车',
      badge: 3
    },
    {
      to: '/chat',
      icon: ChatBubbleLeftRightIcon,
      label: 'AI智能客服',
      badge: 'AI'
    },
    {
      icon: SparklesIcon,
      label: 'AI功能',
      children: [
        { to: '/recommendations', icon: SparklesIcon, label: '智能推荐' },
        { to: '/analytics', icon: ChartBarIcon, label: '购买分析' },
        { to: '/trends', icon: ChartBarIcon, label: '趋势预测' }
      ]
    },
    {
      icon: UserIcon,
      label: '用户中心',
      children: [
        { to: '/profile', icon: UserIcon, label: '个人信息' },
        { to: '/orders', icon: ShoppingBagIcon, label: '我的订单' },
        { to: '/favorites', icon: HomeIcon, label: '收藏夹' }
      ]
    },
    {
      to: '/settings',
      icon: Cog6ToothIcon,
      label: '设置'
    }
  ];

  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-aws-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-4 space-y-2">
                {/* 导航标题 */}
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-aws-gray-500 uppercase tracking-wider">
                    导航菜单
                  </h3>
                </div>
                
                {navItems.map((item, index) => (
                  <NavItem key={index} {...item} />
                ))}
              </nav>
            </div>
            
            {/* 底部用户信息 */}
            <div className="flex-shrink-0 flex border-t border-aws-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-aws-orange rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-aws-gray-700">游客用户</p>
                  <p className="text-xs text-aws-gray-500">未登录</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 移动端侧边栏 */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-4 border-b border-aws-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-aws-orange rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h2 className="text-lg font-semibold text-aws-gray-900">Commerce</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-aws-gray-400 hover:text-aws-gray-600 hover:bg-aws-gray-100"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navItems.map((item, index) => (
              <NavItem key={index} {...item} onClick={onClose} />
            ))}
          </nav>
          
          {/* 移动端底部 */}
          <div className="border-t border-aws-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-aws-orange rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-aws-gray-700">游客用户</p>
                <Link 
                  to="/login"
                  className="text-sm text-aws-blue hover:text-aws-blue-light"
                  onClick={onClose}
                >
                  点击登录
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;