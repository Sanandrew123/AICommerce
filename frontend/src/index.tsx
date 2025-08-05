/**
 * React应用入口文件
 * 
 * 心理过程：
 * 1. 设置React 18的严格模式
 * 2. 集成错误边界处理
 * 3. 添加性能监控
 * 4. AWS风格的全局样式初始化
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode }, 
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('应用错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-aws-dark flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-semibold text-white mb-4">
              应用遇到了错误
            </h1>
            <p className="text-aws-gray-400 mb-6">
              我们已经记录了这个问题，请稍后重试
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-aws-orange hover:bg-aws-orange-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// 性能监控
reportWebVitals((metric) => {
  // 在生产环境中，您可以将这些指标发送到分析服务
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
});