/**
 * 注册页面
 * 
 * 心理过程：
 * 1. 用户注册体验流畅，减少摩擦
 * 2. 实时验证用户名和邮箱可用性
 * 3. 密码强度检查和确认
 * 4. 清晰的错误提示和成功反馈
 * 5. 注册成功后自动登录跳转
 */

import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationStatus {
  username: { checked: boolean; available: boolean };
  email: { checked: boolean; available: boolean };
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    username: { checked: false, available: false },
    email: { checked: false, available: false }
  });

  // 密码强度检查
  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 0, text: '密码太短' };
    if (password.length < 8) return { strength: 1, text: '密码较弱' };
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) return { strength: 1, text: '密码较弱' };
    return { strength: 2, text: '密码强度良好' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // 验证用户名可用性
  const checkUsername = useCallback(async (username: string) => {
    if (username.length < 3) return;
    
    try {
      const response = await authService.checkUsername(username);
      setValidationStatus(prev => ({
        ...prev,
        username: { checked: true, available: response.available }
      }));
    } catch (err) {
      console.error('检查用户名失败:', err);
    }
  }, []);

  // 验证邮箱可用性
  const checkEmail = useCallback(async (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;
    
    try {
      const response = await authService.checkEmail(email);
      setValidationStatus(prev => ({
        ...prev,
        email: { checked: true, available: response.available }
      }));
    } catch (err) {
      console.error('检查邮箱失败:', err);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');

    // 实时验证
    if (name === 'username' && value !== formData.username) {
      setValidationStatus(prev => ({
        ...prev,
        username: { checked: false, available: false }
      }));
      if (value.length >= 3) {
        setTimeout(() => checkUsername(value), 500);
      }
    }

    if (name === 'email' && value !== formData.email) {
      setValidationStatus(prev => ({
        ...prev,
        email: { checked: false, available: false }
      }));
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) {
        setTimeout(() => checkEmail(value), 500);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('请填写完整的注册信息');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (passwordStrength.strength < 1) {
      setError('密码强度不足，请使用更强的密码');
      return;
    }

    if (!validationStatus.username.available) {
      setError('用户名不可用');
      return;
    }

    if (!validationStatus.email.available) {
      setError('邮箱不可用');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      if (response.success) {
        // 注册成功后自动登录
        const loginResponse = await authService.login({
          username: formData.username,
          password: formData.password
        });
        
        if (loginResponse.success) {
          navigate('/', { replace: true });
        } else {
          navigate('/login', { 
            state: { message: '注册成功，请登录' }
          });
        }
      } else {
        setError(response.message || '注册失败');
      }
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 头部 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-aws-orange to-red-500 bg-clip-text text-transparent">
              加入AI商城
            </h1>
            <p className="text-gray-600 mt-2">创建您的账户</p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 注册表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-orange focus:border-transparent transition-all"
                  placeholder="请输入用户名"
                  disabled={loading}
                />
                {validationStatus.username.checked && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {validationStatus.username.available ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {validationStatus.username.checked && (
                <p className={`text-xs mt-1 ${validationStatus.username.available ? 'text-green-600' : 'text-red-600'}`}>
                  {validationStatus.username.available ? '用户名可用' : '用户名已被占用'}
                </p>
              )}
            </div>

            {/* 邮箱 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-orange focus:border-transparent transition-all"
                  placeholder="请输入邮箱地址"
                  disabled={loading}
                />
                {validationStatus.email.checked && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {validationStatus.email.available ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {validationStatus.email.checked && (
                <p className={`text-xs mt-1 ${validationStatus.email.available ? 'text-green-600' : 'text-red-600'}`}>
                  {validationStatus.email.available ? '邮箱可用' : '邮箱已被注册'}
                </p>
              )}
            </div>

            {/* 密码 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-orange focus:border-transparent transition-all"
                  placeholder="请输入密码"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1 bg-gray-200 rounded">
                      <div 
                        className={`h-1 rounded transition-all ${
                          passwordStrength.strength === 0 ? 'bg-red-400 w-1/3' :
                          passwordStrength.strength === 1 ? 'bg-yellow-400 w-2/3' :
                          'bg-green-400 w-full'
                        }`}
                      />
                    </div>
                    <span className={`text-xs ${
                      passwordStrength.strength === 0 ? 'text-red-600' :
                      passwordStrength.strength === 1 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 确认密码 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                确认密码
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-orange focus:border-transparent transition-all"
                  placeholder="请再次输入密码"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">密码不一致</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-aws-orange to-red-500 text-white py-3 rounded-lg font-medium hover:from-red-500 hover:to-aws-orange transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '注册账户'}
            </button>
          </form>

          {/* 登录链接 */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              已有账户？
              <Link 
                to="/login" 
                className="text-aws-orange hover:text-red-500 font-medium ml-1 transition-colors"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;