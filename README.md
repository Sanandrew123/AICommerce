# AI电商学习项目

## 开发心理过程
```
技术栈设计思路：
1. 选择微服务架构：Java主服务 + Python AI服务，便于学习不同语言协作
2. 现代前端技术：React + TypeScript，学习类型安全的前端开发
3. 数据层设计：PostgreSQL存储 + Redis缓存，理解持久化与缓存策略
4. AI功能集成：商品推荐、智能客服、图像识别，体验AI在电商中的应用
5. 容器化部署：Docker统一环境，学习现代部署实践
```

## 技术栈
- **后端主服务**: Spring Boot (Java 17)
- **AI服务**: Python Flask + TensorFlow/PyTorch
- **前端**: React 18 + TypeScript + Tailwind CSS
- **数据库**: PostgreSQL + Redis
- **认证**: JWT + Spring Security
- **AI集成**: OpenAI API, 推荐算法
- **部署**: Docker + Docker Compose

## 项目结构
```
ai-ecommerce-app/
├── backend/                    # Java Spring Boot主服务
│   ├── src/main/java/
│   ├── src/main/resources/
│   ├── pom.xml
│   └── Dockerfile
├── ai-service/                 # Python AI服务
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # React前端
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── database/                   # 数据库脚本
│   └── init.sql
├── docker-compose.yml
└── README.md
```

## 主要功能
- 用户注册/登录（JWT认证）
- 商品管理（CRUD）
- 购物车和订单系统
- AI商品推荐
- 智能客服聊天机器人
- 商品图像识别和分类
- 用户行为分析

## 开发顺序
1. 环境搭建和项目结构创建
2. 数据库设计和初始化
3. Java后端API开发
4. Python AI服务开发
5. React前端开发
6. AI功能集成
7. 容器化和部署
8. 测试和优化