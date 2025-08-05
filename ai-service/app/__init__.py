"""
AI服务应用初始化模块

心理过程：
1. 创建Flask应用工厂模式
2. 配置CORS支持跨域请求
3. 注册蓝图模块化路由
4. 初始化数据库和Redis连接
"""

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import redis
import os

db = SQLAlchemy()
redis_client = None

def create_app():
    app = Flask(__name__)
    
    # 配置
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{os.getenv('DB_USER', 'admin')}:"
        f"{os.getenv('DB_PASSWORD', 'password123')}@"
        f"{os.getenv('DB_HOST', 'localhost')}:"
        f"{os.getenv('DB_PORT', '5432')}/"
        f"{os.getenv('DB_NAME', 'ai_ecommerce')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'ai-ecommerce-secret-key')
    
    # 初始化扩展
    db.init_app(app)
    CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080"])
    
    # 初始化Redis
    global redis_client
    redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', '6379')),
        db=0,
        decode_responses=True
    )
    
    # 注册蓝图
    from app.routes import recommendation, chat, analytics
    app.register_blueprint(recommendation.bp)
    app.register_blueprint(chat.bp)
    app.register_blueprint(analytics.bp)
    
    # 健康检查端点
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'ai-service'}
    
    return app