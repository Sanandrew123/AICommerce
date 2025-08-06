@echo off
:: AI电商平台 - Windows启动脚本
:: 
:: 心理过程：
:: 1. 检测Windows环境和依赖
:: 2. 启动PostgreSQL和Redis服务
:: 3. 启动后端Spring Boot应用
:: 4. 启动Python AI服务
:: 5. 启动React前端开发服务器

echo ================================
echo   AI电商平台 - Windows环境启动
echo ================================
echo.

:: 设置编码为UTF-8
chcp 65001 > nul

:: 检查Java环境
echo [1/6] 检查Java环境...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Java环境，请安装JDK 17或更高版本
    echo 下载地址: https://adoptium.net/
    pause
    exit /b 1
)
echo ✅ Java环境检查通过

:: 检查Node.js环境
echo [2/6] 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Node.js环境，请安装Node.js 16或更高版本
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js环境检查通过

:: 检查Python环境
echo [3/6] 检查Python环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Python环境，请安装Python 3.8或更高版本
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python环境检查通过

:: 创建必要的目录
echo [4/6] 创建Windows临时目录...
if not exist "C:\temp\ai-ecommerce\logs" mkdir "C:\temp\ai-ecommerce\logs"
if not exist "C:\temp\ai-ecommerce\uploads" mkdir "C:\temp\ai-ecommerce\uploads"
echo ✅ 目录创建完成

:: 检查并启动PostgreSQL
echo [5/6] 检查数据库服务...
pg_isready -h localhost -p 5432 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  警告: PostgreSQL服务未运行
    echo 请确保PostgreSQL已安装并启动，或使用Docker:
    echo docker run --name postgres-ai-ecommerce -e POSTGRES_DB=ai_ecommerce_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:13
    echo.
    echo 是否继续启动应用？ ^(Y/N^)
    set /p continue=
    if /i "%continue%" neq "Y" exit /b 1
)

:: 检查并启动Redis
echo 检查Redis服务...
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  警告: Redis服务未运行
    echo 请确保Redis已安装并启动，或使用Docker:
    echo docker run --name redis-ai-ecommerce -p 6379:6379 -d redis:6-alpine
    echo.
)

echo [6/6] 启动应用服务...
echo.

:: 设置JAVA_OPTS适合Windows环境
set JAVA_OPTS=-Xms512m -Xmx1024m -Dspring.profiles.active=windows

:: 启动后端服务
echo 🚀 启动Spring Boot后端服务...
start "AI电商-后端服务" /min cmd /c "cd /d %~dp0backend && mvn spring-boot:run -Dspring-boot.run.profiles=windows"

:: 等待后端启动
echo ⏳ 等待后端服务启动 (30秒)...
timeout /t 30 >nul

:: 启动AI服务
echo 🤖 启动Python AI服务...
start "AI电商-AI服务" /min cmd /c "cd /d %~dp0ai-service && python app.py"

:: 等待AI服务启动
echo ⏳ 等待AI服务启动 (15秒)...
timeout /t 15 >nul

:: 启动前端开发服务器
echo 🌐 启动React前端服务...
start "AI电商-前端服务" /min cmd /c "cd /d %~dp0frontend && npm start"

:: 等待前端启动
echo ⏳ 等待前端服务启动 (20秒)...
timeout /t 20 >nul

echo.
echo ================================
echo 🎉 AI电商平台启动完成！
echo ================================
echo.
echo 📱 前端地址: http://localhost:3000
echo 🔧 后端API: http://localhost:8080/api
echo 🤖 AI服务:  http://localhost:5000
echo.
echo 💡 提示:
echo - 所有服务正在后台运行
echo - 可以通过任务栏查看各个服务窗口
echo - 按Ctrl+C可以停止当前脚本
echo - 要完全停止所有服务，请运行 stop-windows.bat
echo.
echo 📚 查看日志: C:\temp\ai-ecommerce\logs\application.log
echo 📁 上传目录: C:\temp\ai-ecommerce\uploads\
echo.

:: 等待用户输入以保持窗口打开
echo 按任意键退出启动脚本 (服务将继续运行)...
pause >nul