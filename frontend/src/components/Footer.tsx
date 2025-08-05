/**
 * AWS风格底部组件
 * 
 * 心理过程：
 * 1. 简洁的底部设计，不占用过多空间
 * 2. 链接分组清晰，易于导航
 * 3. 深色背景保持与头部一致
 * 4. 包含版权信息和社交链接
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    '产品服务': [
      { name: '智能推荐', href: '/recommendations' },
      { name: 'AI客服', href: '/chat' },
      { name: '商品搜索', href: '/products' },
      { name: '数据分析', href: '/analytics' }
    ],
    '帮助支持': [
      { name: '使用指南', href: '/help' },
      { name: '常见问题', href: '/faq' },
      { name: '联系我们', href: '/contact' },
      { name: 'API文档', href: '/docs' }
    ],
    '关于我们': [
      { name: '公司介绍', href: '/about' },
      { name: '技术团队', href: '/team' },
      { name: '开源项目', href: '/opensource' },
      { name: '加入我们', href: '/careers' }
    ]
  };

  return (
    <footer className="bg-aws-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 品牌信息 */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-aws-orange rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">AI</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">AI Commerce</h3>
                <p className="text-aws-gray-400 text-sm">智能电商平台</p>
              </div>
            </div>
            <p className="text-aws-gray-400 text-sm leading-relaxed mb-6">
              基于人工智能技术的现代化电商平台，为用户提供个性化购物体验和智能化服务。
            </p>
            
            {/* 技术标签 */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-aws-navy-light text-aws-gray-300 text-xs rounded-full">
                Spring Boot
              </span>
              <span className="px-3 py-1 bg-aws-navy-light text-aws-gray-300 text-xs rounded-full">
                React
              </span>
              <span className="px-3 py-1 bg-aws-navy-light text-aws-gray-300 text-xs rounded-full">
                AI/ML
              </span>
              <span className="px-3 py-1 bg-aws-navy-light text-aws-gray-300 text-xs rounded-full">
                Docker
              </span>
            </div>
          </div>

          {/* 链接分组 */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="col-span-1">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-aws-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 分割线 */}
        <div className="border-t border-aws-navy-light mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* 版权信息 */}
            <div className="text-aws-gray-400 text-sm">
              <p>© {currentYear} AI Commerce. 学习项目 - 仅供教育用途</p>
              <p className="mt-1">
                基于现代技术栈构建：Java + Python + React + AI
              </p>
            </div>

            {/* 技术信息 */}
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-6 text-sm text-aws-gray-400">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
                <a 
                  href="http://localhost:8080/swagger-ui.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  API文档
                </a>
                <span className="text-aws-gray-500">|</span>
                <span className="text-aws-gray-500">
                  学习项目
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 额外信息 */}
        <div className="mt-6 pt-6 border-t border-aws-navy-light">
          <div className="text-center">
            <p className="text-aws-gray-500 text-xs">
              🚀 本项目展示了现代全栈开发和AI应用的完整技术栈
            </p>
            <p className="text-aws-gray-500 text-xs mt-1">
              包含用户认证、商品管理、智能推荐、聊天机器人等完整功能
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;