# Windows环境配置指南

## 🖥️ Windows环境快速启动

为了方便Windows用户学习和开发，项目提供了完整的Windows环境配置支持。

## 📋 环境要求

### 必需软件
- **Java JDK 17+** - [下载链接](https://adoptium.net/)
- **Node.js 16+** - [下载链接](https://nodejs.org/)
- **Python 3.8+** - [下载链接](https://www.python.org/downloads/)
- **Maven 3.6+** - [下载链接](https://maven.apache.org/download.cgi)

### 数据库 (二选一)
**方案一: Docker (推荐)**
```bash
# PostgreSQL
docker run --name postgres-ai-ecommerce -e POSTGRES_DB=ai_ecommerce_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:13

# Redis
docker run --name redis-ai-ecommerce -p 6379:6379 -d redis:6-alpine
```

**方案二: 本地安装**
- **PostgreSQL 13+** - [下载链接](https://www.postgresql.org/download/windows/)
- **Redis** - [下载链接](https://redis.io/download)

## 🚀 快速启动

### 1. 一键启动所有服务
```batch
start-windows.bat
```

这个脚本会：
- ✅ 检查所有环境依赖
- 🗂️ 创建必要的Windows目录
- 🚀 启动后端、AI服务、前端
- 🌐 自动打开浏览器

### 2. 停止所有服务
```batch
stop-windows.bat
```

### 3. 手动启动 (开发调试用)

**启动后端**:
```batch
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=windows
```

**启动AI服务**:
```batch
cd ai-service
python app.py
```

**启动前端**:
```batch
cd frontend
npm start
```

## 🔧 Windows专用配置

### 应用配置文件
项目使用 `application-windows.yml` 提供Windows优化配置：

```yaml
# Windows环境特定配置
spring:
  profiles:
    active: windows
  datasource:
    url: jdbc:postgresql://localhost:5432/ai_ecommerce_db
    username: postgres
    password: postgres

# Windows文件路径
file:
  upload:
    path: C:/temp/ai-ecommerce/uploads/

# 日志配置
logging:
  file:
    name: C:/temp/ai-ecommerce/logs/application.log
```

### 目录结构 (Windows)
```
C:\temp\ai-ecommerce\
├── logs\                  # 应用日志
│   └── application.log
├── uploads\              # 文件上传目录
├── temp\                 # 临时文件
└── data\                 # 数据备份
```

## 🌐 服务地址

启动完成后，访问以下地址：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:3000 | React开发服务器 |
| 后端API | http://localhost:8080/api | Spring Boot REST API |
| AI服务 | http://localhost:5000 | Python Flask AI服务 |
| API文档 | http://localhost:8080/api/swagger-ui.html | Swagger接口文档 |

## 🛠️ 开发调试

### IDE配置建议

**IntelliJ IDEA (推荐)**:
1. 导入Maven项目
2. 设置JDK 17
3. 启用Spring Boot支持
4. 配置环境变量: `SPRING_PROFILES_ACTIVE=windows`

**VS Code**:
1. 安装Java扩展包
2. 安装Spring Boot扩展
3. 配置launch.json:
```json
{
  "type": "java",
  "name": "Spring Boot-AiEcommerceApplication",
  "request": "launch",
  "mainClass": "com.aicommerce.AiEcommerceApplication",
  "projectName": "ai-ecommerce-backend",
  "args": "--spring.profiles.active=windows"
}
```

### 数据库管理

**推荐工具**:
- **DBeaver** - 免费的数据库管理工具
- **pgAdmin** - PostgreSQL专用管理工具
- **Redis Desktop Manager** - Redis可视化工具

**连接信息**:
```
PostgreSQL:
- Host: localhost
- Port: 5432
- Database: ai_ecommerce_db
- Username: postgres
- Password: postgres

Redis:
- Host: localhost
- Port: 6379
```

## 📊 性能优化 (Windows)

### JVM参数调优
```batch
set JAVA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200
```

### Maven构建优化
```batch
set MAVEN_OPTS=-Xmx1024m -XX:ReservedCodeCacheSize=128m
```

### Node.js内存限制
```batch
set NODE_OPTIONS=--max-old-space-size=4096
```

## 🔍 故障排除

### 常见问题

**1. 端口占用**
```batch
# 检查端口占用
netstat -ano | findstr :8080
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# 结束占用进程
taskkill /PID <进程ID> /F
```

**2. Java版本问题**
```batch
# 检查Java版本
java -version
javac -version

# 设置JAVA_HOME
set JAVA_HOME=C:\Program Files\Java\jdk-17
```

**3. 数据库连接失败**
```batch
# 测试PostgreSQL连接
pg_isready -h localhost -p 5432

# 创建数据库 (如果不存在)
createdb -h localhost -U postgres ai_ecommerce_db
```

**4. 权限问题**
- 确保C:\temp\ai-ecommerce\目录有写入权限
- 以管理员身份运行命令提示符

**5. 防火墙问题**
- 允许Java、Node.js、Python通过Windows防火墙
- 开放端口: 3000, 5000, 5432, 6379, 8080

### 日志查看

**应用日志**:
```
C:\temp\ai-ecommerce\logs\application.log
```

**实时日志监控**:
```batch
# PowerShell
Get-Content C:\temp\ai-ecommerce\logs\application.log -Wait -Tail 50

# 命令提示符  
tail -f C:\temp\ai-ecommerce\logs\application.log
```

## 📚 学习资源

### 推荐学习顺序
1. **环境搭建** - 按本指南配置Windows环境
2. **后端学习** - Spring Boot + JPA + Security
3. **前端学习** - React + TypeScript + API集成
4. **AI服务学习** - Python + Flask + 机器学习
5. **整体架构** - 微服务 + 数据库 + 缓存

### 调试技巧
- 使用IDE断点调试Java代码
- 使用Chrome DevTools调试React应用
- 使用Python debugger调试AI服务
- 查看数据库执行的SQL语句

## 🆘 获取帮助

如果遇到问题：
1. 查看日志文件定位错误
2. 检查Windows事件查看器
3. 确认所有服务正常启动
4. 验证数据库连接状态

**Windows特有注意事项**:
- 使用反斜杠 `\` 作为路径分隔符
- 注意文件权限和防火墙设置
- 某些杀毒软件可能阻止服务启动
- 建议使用PowerShell而不是命令提示符