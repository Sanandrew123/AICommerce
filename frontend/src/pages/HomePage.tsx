/**
 * AWS风格首页组件
 * 
 * 心理过程：
 * 1. 参考AWS官网的Hero区域设计
 * 2. 突出AI功能和现代科技感
 * 3. 卡片式布局展示核心功能
 * 4. 渐变背景和微妙动画效果
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  ChatBubbleLeftRightIcon, 
  ChartBarIcon,
  CubeIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  UsersIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: SparklesIcon,
      title: 'AI智能推荐',
      description: '基于机器学习算法，为您推荐最符合偏好的商品',
      link: '/recommendations',
      color: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: '智能客服',
      description: '24/7 AI客服助手，即时解答您的购物疑问',
      link: '/chat',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
      icon: ChartBarIcon,
      title: '数据分析',
      description: '深度分析用户行为，提供个性化购物体验',
      link: '/analytics',
      color: 'bg-gradient-to-br from-green-500 to-teal-500'
    },
    {
      icon: CubeIcon,
      title: '商品管理',
      description: '先进的商品管理系统，支持智能分类和搜索',
      link: '/products',
      color: 'bg-gradient-to-br from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { label: '注册用户', value: '10,000+', icon: UsersIcon },
    { label: '商品种类', value: '50,000+', icon: CubeIcon },
    { label: '成功订单', value: '100,000+', icon: ShoppingBagIcon },
    { label: '服务地区', value: '全国', icon: GlobeAltIcon }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero区域 */}
      <section className="relative overflow-hidden bg-aws-gradient">
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-aws-orange opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-aws-blue opacity-10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* 主标题 */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              AI驱动的
              <span className="text-aws-gradient bg-gradient-to-r from-aws-orange to-aws-blue bg-clip-text text-transparent">
                智能电商
              </span>
              平台
            </h1>
            
            {/* 副标题 */}
            <p className="text-xl md:text-2xl text-aws-gray-300 mb-8 max-w-3xl mx-auto animate-slide-up">
              体验下一代购物方式：智能推荐、AI客服、数据分析，让购物更简单、更智能
            </p>
            
            {/* CTA按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
              <Link
                to="/products"
                className="btn-aws-primary text-lg px-8 py-4 inline-flex items-center group"
              >
                开始购物
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/chat"
                className="btn-aws-secondary text-lg px-8 py-4 bg-white bg-opacity-10 border-white border-opacity-30 text-white hover:bg-opacity-20"
              >
                体验AI客服
              </Link>
            </div>
            
            {/* 技术标签 */}
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {['Spring Boot', 'React', 'TypeScript', 'AI/ML', 'Docker', 'PostgreSQL'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-white bg-opacity-10 text-white text-sm rounded-full backdrop-blur-sm border border-white border-opacity-20"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 功能特性区域 */}
      <section className="py-24 bg-aws-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-aws-gray-900 mb-4">
              强大的AI功能
            </h2>
            <p className="text-xl text-aws-gray-600 max-w-2xl mx-auto">
              集成最新的人工智能技术，为您提供前所未有的购物体验
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                to={feature.link}
                className="group card-aws p-6 hover:shadow-aws-xl transform hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-aws-gray-900 mb-2 group-hover:text-aws-blue transition-colors">
                  {feature.title}
                </h3>
                <p className="text-aws-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-aws-blue group-hover:text-aws-blue-light transition-colors">
                  <span className="text-sm font-medium">了解更多</span>
                  <ArrowRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 统计数据区域 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-aws-orange bg-opacity-10 rounded-xl mb-4 group-hover:bg-opacity-20 transition-colors">
                  <stat.icon className="h-8 w-8 text-aws-orange" />
                </div>
                <div className="text-3xl font-bold text-aws-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-aws-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 产品展示区域 */}
      <section className="py-24 bg-aws-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-aws-gray-900 mb-4">
              热门商品推荐
            </h2>
            <p className="text-xl text-aws-gray-600">
              AI为您精选的优质商品
            </p>
          </div>

          {/* 商品卡片网格 - 这里可以后续集成真实商品数据 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="card-aws group cursor-pointer">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-xl bg-aws-gray-200">
                  <div className="w-full h-48 bg-gradient-to-br from-aws-gray-200 to-aws-gray-300 flex items-center justify-center">
                    <CubeIcon className="h-12 w-12 text-aws-gray-400" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-aws-gray-900 group-hover:text-aws-blue transition-colors">
                    智能商品 {item}
                  </h3>
                  <p className="text-aws-gray-600 text-sm mt-1">
                    AI推荐的高质量商品
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-2xl font-bold text-aws-orange">
                      ¥{(item * 299).toLocaleString()}
                    </span>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★★★★★</span>
                      <span className="text-aws-gray-500 text-sm ml-1">(99)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/products"
              className="btn-aws-primary inline-flex items-center"
            >
              查看更多商品
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="py-16 bg-aws-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            准备开始您的智能购物之旅？
          </h2>
          <p className="text-xl text-aws-gray-300 mb-8 max-w-2xl mx-auto">
            加入我们，体验AI驱动的个性化购物服务
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-aws-primary bg-aws-orange hover:bg-aws-orange-dark"
            >
              立即注册
            </Link>
            <Link
              to="/chat"
              className="btn-aws-secondary bg-transparent border-white text-white hover:bg-white hover:text-aws-navy"
            >
              体验AI客服
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;