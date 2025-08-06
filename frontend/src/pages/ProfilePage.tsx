/**
 * 用户中心页面
 * 
 * 心理过程：
 * 1. 用户个人信息管理和编辑
 * 2. 安全设置和密码修改
 * 3. 通知设置和偏好配置
 * 4. 账户统计和活动历史
 * 5. 现代化的标签页设计
 */

import React, { useState, useEffect } from 'react';
import {
  UserCircleIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { authService } from '../services';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  fullName?: string;
  phone?: string;
  birthday?: string;
  gender?: string;
  address?: string;
  createdAt: string;
}

type TabType = 'profile' | 'security' | 'notifications';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(false);

  // 标签页配置
  const tabs = [
    { id: 'profile' as TabType, label: '个人资料', icon: UserCircleIcon },
    { id: 'security' as TabType, label: '安全设置', icon: ShieldCheckIcon },
    { id: 'notifications' as TabType, label: '通知设置', icon: BellIcon },
  ];

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData(currentUser);
    }
  }, []);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 保存个人资料
  const handleSave = async () => {
    setLoading(true);
    try {
      // 这里应该调用API保存用户信息
      // const response = await userService.updateProfile(formData);
      
      // 模拟保存成功
      const updatedUser = { ...user, ...formData } as UserProfile;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditMode(false);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setFormData(user || {});
    setEditMode(false);
  };

  // 个人资料部分
  const ProfileSection: React.FC = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">个人资料</h2>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="btn-aws-secondary flex items-center space-x-2 px-4 py-2 rounded-lg"
          >
            <PencilIcon className="h-4 w-4" />
            <span>编辑</span>
          </button>
        )}
      </div>

      {/* 头像部分 */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="头像" className="w-full h-full object-cover" />
            ) : (
              <UserCircleIcon className="w-16 h-16 text-gray-400" />
            )}
          </div>
          {editMode && (
            <button className="absolute bottom-0 right-0 bg-aws-orange text-white rounded-full p-2 hover:bg-red-500 transition-colors">
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{user?.username}</h3>
          <p className="text-gray-600">{user?.email}</p>
          <p className="text-sm text-gray-500">
            加入时间: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '未知'}
          </p>
        </div>
      </div>

      {/* 表单字段 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName || ''}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-orange focus:border-transparent disabled:bg-gray-50"
            placeholder="请输入您的姓名"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-orange focus:border-transparent disabled:bg-gray-50"
            placeholder="请输入手机号"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">生日</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday || ''}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-orange focus:border-transparent disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
          <select
            name="gender"
            value={formData.gender || ''}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-orange focus:border-transparent disabled:bg-gray-50"
          >
            <option value="">请选择</option>
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">地址</label>
          <input
            type="text"
            name="address"
            value={formData.address || ''}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-orange focus:border-transparent disabled:bg-gray-50"
            placeholder="请输入您的地址"
          />
        </div>
      </div>

      {/* 编辑模式按钮 */}
      {editMode && (
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-aws-primary flex items-center space-x-2 px-6 py-2 rounded-lg disabled:opacity-50"
          >
            <CheckIcon className="h-4 w-4" />
            <span>{loading ? '保存中...' : '保存'}</span>
          </button>
          <button
            onClick={handleCancel}
            className="btn-aws-secondary flex items-center space-x-2 px-6 py-2 rounded-lg"
          >
            <XMarkIcon className="h-4 w-4" />
            <span>取消</span>
          </button>
        </div>
      )}
    </div>
  );

  // 安全设置部分
  const SecuritySection: React.FC = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">安全设置</h2>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">修改密码</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">当前密码</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-orange focus:border-transparent"
              placeholder="请输入当前密码"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">新密码</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-orange focus:border-transparent"
              placeholder="请输入新密码"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">确认新密码</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-orange focus:border-transparent"
              placeholder="请再次输入新密码"
            />
          </div>
          <button className="btn-aws-primary px-6 py-2 rounded-lg">
            更新密码
          </button>
        </div>
      </div>
    </div>
  );

  // 通知设置部分
  const NotificationsSection: React.FC = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">通知设置</h2>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-medium text-gray-900">订单通知</h4>
              <p className="text-sm text-gray-500">订单状态变更时接收通知</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-aws-orange/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aws-orange"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-medium text-gray-900">促销通知</h4>
              <p className="text-sm text-gray-500">接收促销活动和优惠信息</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-aws-orange/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aws-orange"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 标签页导航 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-aws-orange text-aws-orange'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-xl shadow-md p-8">
          {activeTab === 'profile' && <ProfileSection />}
          {activeTab === 'security' && <SecuritySection />}
          {activeTab === 'notifications' && <NotificationsSection />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;