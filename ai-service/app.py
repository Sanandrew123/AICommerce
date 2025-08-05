"""
AI服务应用入口

心理过程：
1. 使用应用工厂模式创建Flask应用
2. 配置日志记录
3. 设置开发和生产环境
"""

from app import create_app
import os
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = create_app()

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)