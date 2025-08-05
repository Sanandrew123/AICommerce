# AI电商项目开发指南

## 开发心理过程总结

```
技术选型思路：
1. Java Spring Boot - 企业级后端框架，易于学习和扩展
2. Python Flask - 轻量级AI服务，专注机器学习算法
3. React + TypeScript - 现代前端技术栈，类型安全
4. PostgreSQL + Redis - 关系数据库 + 缓存，完整的数据方案
5. Docker容器化 - 统一开发和部署环境

架构设计思路：
1. 微服务架构 - 主服务(Java) + AI服务(Python)分离
2. 前后端分离 - RESTful API设计
3. 缓存策略 - Redis缓存热点数据和推荐结果
4. AI集成 - 推荐系统、智能客服、用户行为分析
```

## 快速开始

### 环境要求
- Docker 20.10+
- Docker Compose 2.0+
- 8GB+ 内存
- 20GB+ 磁盘空间

### 一键启动
```bash
./start.sh
```

### 手动启动
```bash
# 启动基础服务
docker-compose up -d postgres redis

# 启动应用服务
docker-compose up -d backend ai-service frontend
```

## 服务端口

| 服务 | 端口 | 描述 |
|------|------|------|
| 前端 | 3000 | React应用 |
| 后端API | 8080 | Spring Boot API |
| AI服务 | 5000 | Python Flask AI服务 |
| PostgreSQL | 5432 | 数据库 |
| Redis | 6379 | 缓存 |

## 项目结构详解

### 后端服务 (Java Spring Boot)
```
backend/
├── src/main/java/com/aicommerce/
│   ├── model/          # 数据模型
│   ├── repository/     # 数据访问层
│   ├── service/        # 业务逻辑层
│   ├── controller/     # API控制器
│   ├── security/       # 安全配置
│   └── config/         # 应用配置
├── src/main/resources/ # 配置文件
└── pom.xml            # Maven依赖配置
```

**核心功能：**
- JWT认证和授权
- 用户管理
- 商品和分类管理
- 订单系统
- API文档生成

### AI服务 (Python Flask)
```
ai-service/
├── app/
│   ├── models/         # AI模型
│   ├── services/       # AI服务
│   ├── routes/         # API路由
│   └── __init__.py     # 应用初始化
├── requirements.txt    # Python依赖
└── app.py             # 应用入口
```

**AI功能：**
- 协同过滤推荐
- 基于内容的推荐
- 智能客服机器人
- 用户行为分析

### 前端应用 (React + TypeScript)
```
frontend/
├── src/
│   ├── components/     # 通用组件
│   ├── pages/         # 页面组件
│   ├── services/      # API服务
│   ├── hooks/         # 自定义Hook
│   └── types/         # TypeScript类型定义
├── package.json       # npm依赖配置
└── tailwind.config.js # Tailwind配置
```

## 开发工作流

### 1. 后端开发
```bash
# 进入后端目录
cd backend

# 本地开发（需要Java 17+）
mvn spring-boot:run

# 或者使用Docker开发
docker-compose up backend
```

### 2. AI服务开发
```bash
# 进入AI服务目录
cd ai-service

# 本地开发（需要Python 3.11+）
pip install -r requirements.txt
python app.py

# 或者使用Docker开发
docker-compose up ai-service
```

### 3. 前端开发
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start

# 或者使用Docker开发
docker-compose up frontend
```

## API接口文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新token

### 商品接口
- `GET /api/products` - 获取商品列表
- `GET /api/products/{id}` - 获取商品详情
- `POST /api/products` - 创建商品（管理员）

### AI接口
- `GET /recommendations/user/{id}` - 获取用户推荐
- `GET /recommendations/similar/{id}` - 获取相似商品
- `POST /chat/message` - 智能客服对话

## 数据库设计

### 核心表结构
- `users` - 用户信息
- `products` - 商品信息
- `categories` - 商品分类
- `orders` - 订单信息
- `user_behaviors` - 用户行为记录
- `ai_recommendations` - AI推荐记录

## 学习要点

### Java Spring Boot学习重点
1. **依赖注入** - 理解IoC容器和Bean管理
2. **Spring Security** - JWT认证和权限控制
3. **JPA/Hibernate** - ORM映射和数据库操作
4. **RESTful API** - 设计规范的API接口

### Python AI学习重点
1. **推荐算法** - 协同过滤和内容推荐
2. **自然语言处理** - 中文分词和意图识别
3. **数据处理** - pandas和numpy的使用
4. **Flask框架** - 轻量级Web框架

### React前端学习重点
1. **TypeScript** - 类型安全的JavaScript
2. **状态管理** - React Query和Zustand
3. **UI组件** - Tailwind CSS和组件设计
4. **路由管理** - React Router使用

## 扩展功能建议

### 短期扩展（1-2周）
- [ ] 购物车功能完善
- [ ] 订单管理系统
- [ ] 商品评价系统
- [ ] 用户个人中心

### 中期扩展（1-2月）
- [ ] 支付集成（支付宝/微信）
- [ ] 库存管理系统
- [ ] 优惠券系统
- [ ] 物流跟踪

### 长期扩展（3-6月）
- [ ] 多租户架构
- [ ] 分布式缓存
- [ ] 消息队列集成
- [ ] 微服务治理

## 故障排除

### 常见问题
1. **端口占用** - 检查端口是否被其他应用占用
2. **内存不足** - 调整Docker内存限制
3. **网络问题** - 检查Docker网络配置
4. **权限问题** - 确保启动脚本有执行权限

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f ai-service
docker-compose logs -f frontend
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交代码
4. 创建Pull Request

## 学习资源

- [Spring Boot官方文档](https://spring.io/projects/spring-boot)
- [Flask官方文档](https://flask.palletsprojects.com/)
- [React官方文档](https://react.dev/)
- [Docker官方文档](https://docs.docker.com/)

---

**开发愉快！Happy Coding! 🚀**