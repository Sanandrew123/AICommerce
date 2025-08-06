#!/bin/bash

# AI电商项目启动脚本
# 心理过程：提供一键启动开发环境的便捷方式

set -e

echo "🚀 启动AI电商学习项目..."

# 检查Docker是否运行
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 检查docker-compose是否安装
if ! command -v docker-compose >/dev/null 2>&1; then
    echo "❌ docker-compose未安装，请先安装docker-compose"
    exit 1
fi

# 创建网络（如果不存在）
docker network create ai-ecommerce-network 2>/dev/null || true

echo "📦 构建和启动服务..."

# 启动数据库和Redis
echo "🗄️  启动数据库和缓存服务..."
docker-compose up -d postgres redis

# 等待数据库启动
echo "⏳ 等待数据库启动..."
sleep 10

# 启动后端服务
echo "🔧 启动Java后端服务..."
docker-compose up -d backend

# 启动AI服务
echo "🤖 启动Python AI服务..."
docker-compose up -d ai-service

# 启动前端服务
echo "🎨 启动React前端服务..."
docker-compose up -d frontend

echo "✅ 所有服务启动完成！"
echo ""
echo "🌐 访问地址："
echo "  前端应用: http://localhost:3000"
echo "  后端API: http://localhost:8081/api"
echo "  AI服务:  http://localhost:5000"
echo "  API文档: http://localhost:8081/swagger-ui.html"
echo ""
echo "🗄️  数据库连接："
echo "  主机: localhost:5433"
echo "  数据库: ai_ecommerce"
echo "  用户名: admin"
echo "  密码: password123"
echo ""
echo "📊 查看服务状态: docker-compose ps"
echo "📝 查看日志: docker-compose logs -f [service_name]"
echo "🛑 停止服务: docker-compose down"