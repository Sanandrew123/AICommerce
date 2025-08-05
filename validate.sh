#!/bin/bash

# AI电商项目验证脚本
# 心理过程：全面检查项目的完整性和可运行性

set -e

echo "🔍 开始验证AI电商项目..."

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 验证函数
validate_step() {
    echo -e "${BLUE}🔎 $1${NC}"
    if $2; then
        echo -e "${GREEN}✅ $1 - 通过${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 - 失败${NC}"
        return 1
    fi
}

# 检查文件存在性
check_file_exists() {
    [ -f "$1" ]
}

# 检查目录存在性
check_dir_exists() {
    [ -d "$1" ]
}

# 检查Docker和Docker Compose
check_docker() {
    docker --version > /dev/null 2>&1 && docker-compose --version > /dev/null 2>&1
}

# 检查端口是否可用
check_port_available() {
    ! nc -z localhost $1 2>/dev/null
}

echo -e "${YELLOW}📋 项目结构验证${NC}"

# 验证根目录文件
validate_step "项目README文档" "check_file_exists README.md"
validate_step "Docker Compose配置" "check_file_exists docker-compose.yml" 
validate_step "启动脚本" "check_file_exists start.sh"
validate_step "项目总览文档" "check_file_exists PROJECT_OVERVIEW.md"
validate_step "开发指南文档" "check_file_exists DEVELOPMENT.md"

echo -e "\n${YELLOW}🗄️ 数据库配置验证${NC}"
validate_step "数据库初始化脚本" "check_file_exists database/init.sql"

echo -e "\n${YELLOW}☕ 后端Java服务验证${NC}"
validate_step "后端目录结构" "check_dir_exists backend/src/main/java/com/aicommerce"
validate_step "Maven配置文件" "check_file_exists backend/pom.xml"
validate_step "应用配置文件" "check_file_exists backend/src/main/resources/application.yml"
validate_step "主应用类" "check_file_exists backend/src/main/java/com/aicommerce/AiEcommerceApplication.java"
validate_step "用户模型" "check_file_exists backend/src/main/java/com/aicommerce/model/User.java"
validate_step "商品模型" "check_file_exists backend/src/main/java/com/aicommerce/model/Product.java"
validate_step "购物车模型" "check_file_exists backend/src/main/java/com/aicommerce/model/CartItem.java"
validate_step "认证控制器" "check_file_exists backend/src/main/java/com/aicommerce/controller/AuthController.java"
validate_step "商品控制器" "check_file_exists backend/src/main/java/com/aicommerce/controller/ProductController.java"
validate_step "购物车控制器" "check_file_exists backend/src/main/java/com/aicommerce/controller/CartController.java"
validate_step "JWT工具类" "check_file_exists backend/src/main/java/com/aicommerce/security/JwtUtil.java"
validate_step "安全配置" "check_file_exists backend/src/main/java/com/aicommerce/config/SecurityConfig.java"
validate_step "后端Dockerfile" "check_file_exists backend/Dockerfile"

echo -e "\n${YELLOW}🐍 AI服务Python验证${NC}"
validate_step "AI服务目录结构" "check_dir_exists ai-service/app"
validate_step "Python依赖文件" "check_file_exists ai-service/requirements.txt"
validate_step "AI服务入口" "check_file_exists ai-service/app.py"
validate_step "Flask应用初始化" "check_file_exists ai-service/app/__init__.py"
validate_step "推荐算法模型" "check_file_exists ai-service/app/models/recommendation.py"
validate_step "智能客服服务" "check_file_exists ai-service/app/services/chat_service.py"
validate_step "推荐API路由" "check_file_exists ai-service/app/routes/recommendation.py"
validate_step "客服API路由" "check_file_exists ai-service/app/routes/chat.py"
validate_step "分析API路由" "check_file_exists ai-service/app/routes/analytics.py"
validate_step "AI服务Dockerfile" "check_file_exists ai-service/Dockerfile"

echo -e "\n${YELLOW}⚛️ 前端React验证${NC}"
validate_step "前端目录结构" "check_dir_exists frontend/src"
validate_step "package.json配置" "check_file_exists frontend/package.json"
validate_step "TypeScript配置" "check_file_exists frontend/tsconfig.json"
validate_step "Tailwind配置" "check_file_exists frontend/tailwind.config.js"
validate_step "HTML模板" "check_file_exists frontend/public/index.html"
validate_step "React入口文件" "check_file_exists frontend/src/index.tsx"
validate_step "主应用组件" "check_file_exists frontend/src/App.tsx"
validate_step "全局样式文件" "check_file_exists frontend/src/index.css"
validate_step "布局组件" "check_file_exists frontend/src/components/Layout.tsx"
validate_step "头部组件" "check_file_exists frontend/src/components/Header.tsx"
validate_step "侧边栏组件" "check_file_exists frontend/src/components/Sidebar.tsx"
validate_step "底部组件" "check_file_exists frontend/src/components/Footer.tsx"
validate_step "首页组件" "check_file_exists frontend/src/pages/HomePage.tsx"
validate_step "API客户端" "check_file_exists frontend/src/services/api.ts"
validate_step "类型定义" "check_file_exists frontend/src/types/index.ts"
validate_step "前端Dockerfile" "check_file_exists frontend/Dockerfile"
validate_step "Nginx配置" "check_file_exists frontend/nginx.conf"

echo -e "\n${YELLOW}🔧 环境依赖验证${NC}"
validate_step "Docker环境" "check_docker"

echo -e "\n${YELLOW}🌐 端口可用性检查${NC}"
validate_step "前端端口 3000" "check_port_available 3000"
validate_step "后端端口 8080" "check_port_available 8080" 
validate_step "AI服务端口 5000" "check_port_available 5000"
validate_step "数据库端口 5432" "check_port_available 5432"
validate_step "Redis端口 6379" "check_port_available 6379"

echo -e "\n${YELLOW}📊 项目统计${NC}"
echo "Java文件: $(find . -name "*.java" | wc -l)"
echo "Python文件: $(find . -name "*.py" | wc -l)"
echo "TypeScript文件: $(find . -name "*.ts" -o -name "*.tsx" | wc -l)"
echo "配置文件: $(find . -name "*.json" -o -name "*.yml" -o -name "*.xml" | wc -l)"
echo "Docker文件: $(find . -name "Dockerfile" -o -name "docker-compose.yml" | wc -l)"
echo "总文件数: $(find . -type f | wc -l)"

echo -e "\n${GREEN}🎉 项目验证完成！${NC}"
echo -e "${BLUE}📝 下一步操作：${NC}"
echo "1. 运行 ./start.sh 启动项目"
echo "2. 访问 http://localhost:3000 查看前端"
echo "3. 访问 http://localhost:8080/swagger-ui.html 查看API文档"
echo "4. 访问 http://localhost:5000/health 检查AI服务"

echo -e "\n${YELLOW}⚠️  注意事项：${NC}"
echo "- 确保Docker和Docker Compose已正确安装"
echo "- 首次运行需要下载镜像，可能需要几分钟"
echo "- 如果遇到端口占用，请先停止相关服务"
echo "- 数据库初始化需要等待，请耐心等待"

echo -e "\n${GREEN}✨ 项目特色：${NC}"
echo "🤖 AI智能推荐算法"
echo "💬 智能客服机器人" 
echo "🛒 完整购物车系统"
echo "🔐 JWT安全认证"
echo "📱 响应式AWS风格界面"
echo "🐳 Docker容器化部署"