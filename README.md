# AI电商平台 (AI E-commerce Platform)

一个完整的AI驱动电商平台，支持多环境部署，特别优化了Windows开发环境配置。

## 🌟 项目特色

- **🤖 AI驱动**: 智能商品推荐、价格预测、客服聊天
- **🏗️ 微服务架构**: Spring Boot + Python Flask + React TypeScript
- **🌐 跨平台支持**: Linux、Windows、Docker多环境配置
- **💻 Windows优化**: 专为Windows学习者优化的配置和脚本
- **🔒 企业级安全**: JWT认证、数据加密、权限控制
- **📱 响应式设计**: AWS风格现代UI，支持移动端

## 🚀 快速启动

### Windows环境 (推荐学习者)

```batch
# 一键启动所有服务
start-windows.bat

# 停止所有服务  
stop-windows.bat
```

详细配置请参考: [Windows环境配置指南](WINDOWS_SETUP_GUIDE.md)

### Linux/Docker环境

```bash
# Docker一键启动
docker-compose up -d

# 手动启动
./start.sh
```

## 🛠️ 技术栈

### 后端服务 (Java Spring Boot)
- **框架**: Spring Boot 3.2, Spring Security 6
- **数据库**: PostgreSQL + JPA/Hibernate  
- **缓存**: Redis
- **认证**: JWT Token
- **API文档**: OpenAPI 3.0 (Swagger)

### AI服务 (Python Flask)
- **框架**: Flask + scikit-learn
- **功能**: 协同过滤推荐、内容推荐、价格预测
- **模型**: 机器学习算法、自然语言处理

### 前端应用 (React TypeScript)
- **框架**: React 18 + TypeScript
- **样式**: Tailwind CSS + AWS设计系统
- **状态管理**: React Hooks + Context API
- **HTTP客户端**: Axios with 自动token管理

### 数据存储
- **主数据库**: PostgreSQL 13+
- **缓存**: Redis 6+
- **文件存储**: 本地文件系统 (可扩展对象存储)

## 📋 功能模块

### 🔐 用户系统
- [x] 用户注册/登录/登出
- [x] JWT Token自动刷新
- [x] 用户资料管理
- [x] 密码安全策略

### 🛍️ 商品系统  
- [x] 商品浏览和搜索
- [x] 分类筛选和排序
- [x] 商品详情展示
- [x] 图片轮播和缩放

### 🛒 购物车系统
- [x] 添加/移除商品
- [x] 数量修改和价格计算
- [x] 优惠券支持
- [x] 购物车持久化

### 📋 订单系统
- [x] 订单创建和支付
- [x] 订单状态跟踪
- [x] 订单历史查询
- [x] 订单操作 (取消/确认/退款)

### 🤖 AI功能
- [x] 基于用户行为的商品推荐
- [x] 智能价格预测
- [x] AI客服聊天机器人
- [x] 用户行为分析

### 👤 用户中心
- [x] 个人信息编辑
- [x] 安全设置管理
- [x] 通知偏好配置
- [x] 订单和购物统计

## 🌍 环境配置

### 开发环境切换

**Windows环境**:
```batch
set SPRING_PROFILES_ACTIVE=windows
```

**Linux环境**:
```bash
export SPRING_PROFILES_ACTIVE=dev
```

**Docker环境**:
```bash
export SPRING_PROFILES_ACTIVE=docker
```

### 配置文件说明

| 配置文件 | 环境 | 说明 |
|---------|------|------|
| `application.yml` | 默认 | 基础配置和开发环境 |
| `application-windows.yml` | Windows | Windows开发环境优化 |
| `application-docker.yml` | Docker | 容器化部署配置 |
| `application-prod.yml` | 生产 | 生产环境配置 |

## 🔧 开发调试

### 项目结构
```
ai-ecommerce-app/
├── backend/                 # Spring Boot后端
│   ├── src/main/java/      # Java源码
│   ├── src/main/resources/ # 配置文件
│   └── pom.xml             # Maven依赖
├── ai-service/             # Python AI服务
│   ├── app/               # Flask应用
│   ├── requirements.txt   # Python依赖  
│   └── app.py            # 启动文件
├── frontend/              # React前端
│   ├── src/              # TypeScript源码
│   ├── public/           # 静态资源
│   └── package.json      # Node.js依赖
├── database/             # 数据库脚本
├── start-windows.bat     # Windows启动脚本
├── stop-windows.bat      # Windows停止脚本
└── docker-compose.yml    # Docker编排
```

### API接口设计

**认证接口**:
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/refresh` - Token刷新

**商品接口**:
- `GET /api/products` - 商品列表 (支持分页/筛选)
- `GET /api/products/{id}` - 商品详情
- `GET /api/categories` - 商品分类

**购物车接口**:
- `GET /api/cart` - 获取购物车
- `POST /api/cart/items` - 添加商品到购物车
- `PUT /api/cart/items/{id}` - 更新购物车商品
- `DELETE /api/cart/items/{id}` - 移除购物车商品

**AI接口**:
- `GET /recommendations` - 获取推荐商品
- `POST /chat` - AI聊天对话
- `POST /analytics/price-prediction` - 价格预测

### 数据库设计

核心数据表:
- `users` - 用户信息
- `products` - 商品信息  
- `categories` - 商品分类
- `cart_items` - 购物车项目
- `orders` - 订单信息
- `order_items` - 订单详情

详细DDL参考: [database/init.sql](database/init.sql)

## 📊 监控和日志

### 应用监控
- **健康检查**: `/actuator/health`
- **应用指标**: `/actuator/metrics`
- **API文档**: `/api/swagger-ui.html`

### 日志配置
- **Windows**: `C:/temp/ai-ecommerce/logs/`
- **Linux**: `./logs/`
- **Docker**: 容器日志输出

## 🧪 测试

### 后端测试
```bash
cd backend
mvn test
```

### 前端测试  
```bash
cd frontend
npm test
```

### 集成测试
```bash
# 启动所有服务后
npm run test:e2e
```

## 📚 学习指南

推荐按以下顺序学习:

1. **环境搭建** - Windows/Docker环境配置
2. **后端学习** - Spring Boot + JPA + Security
3. **前端学习** - React + TypeScript + API集成  
4. **AI服务学习** - Python + Flask + ML算法
5. **架构理解** - 微服务通信和数据流

详细学习路径: [项目阅读指南](READING_GUIDE.md)

## 🐛 故障排除

### 常见问题

**端口占用**: 检查8080, 3000, 5000, 5432, 6379端口
**数据库连接**: 确认PostgreSQL和Redis服务启动
**内存不足**: 调整JVM参数 `-Xmx1024m`
**权限问题**: Windows环境需要管理员权限

详细故障排除: [Windows配置指南](WINDOWS_SETUP_GUIDE.md#故障排除)

## 🤝 贡献指南

1. Fork项目到个人仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交代码: `git commit -m 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`  
5. 提交Pull Request

## 📄 许可证

本项目仅供学习使用，不用于商业用途。

## 📞 技术支持

- **项目地址**: [GitHub Repository](https://github.com/Sanandrew123/AICommerce)
- **问题反馈**: GitHub Issues
- **学习交流**: 欢迎Star和Fork

---

**开发初心**: 为学习者提供一个完整、实用的现代Web应用开发案例，特别关注Windows环境的友好性和易用性。

🎯 **适合人群**: Java/Python/React学习者、全栈开发初学者、微服务架构学习者