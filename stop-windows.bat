@echo off
:: AI电商平台 - Windows停止脚本
:: 
:: 心理过程：
:: 1. 优雅地停止所有相关服务
:: 2. 清理临时文件和进程
:: 3. 显示停止状态

echo ================================
echo   AI电商平台 - 停止所有服务
echo ================================
echo.

:: 设置编码为UTF-8
chcp 65001 > nul

echo 🛑 正在停止AI电商平台服务...
echo.

:: 停止Spring Boot应用 (通过端口)
echo [1/4] 停止后端服务 (端口8080)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080" ^| findstr "LISTENING"') do (
    if "%%a" neq "" (
        echo 找到后端进程: %%a
        taskkill /PID %%a /F >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✅ 后端服务已停止
        ) else (
            echo ⚠️  后端服务停止失败
        )
    )
)

:: 停止Python AI服务 (通过端口)
echo [2/4] 停止AI服务 (端口5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    if "%%a" neq "" (
        echo 找到AI服务进程: %%a
        taskkill /PID %%a /F >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✅ AI服务已停止
        ) else (
            echo ⚠️  AI服务停止失败
        )
    )
)

:: 停止React开发服务器 (通过端口)
echo [3/4] 停止前端服务 (端口3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    if "%%a" neq "" (
        echo 找到前端进程: %%a
        taskkill /PID %%a /F >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✅ 前端服务已停止
        ) else (
            echo ⚠️  前端服务停止失败
        )
    )
)

:: 停止相关Java进程
echo [4/4] 清理相关进程...
tasklist | findstr "java.exe" >nul
if %errorlevel% equ 0 (
    echo 发现Java进程，正在检查...
    wmic process where "name='java.exe' and commandline like '%%spring-boot%%'" delete >nul 2>&1
    wmic process where "name='java.exe' and commandline like '%%ai-ecommerce%%'" delete >nul 2>&1
)

:: 停止Node.js进程
tasklist | findstr "node.exe" >nul
if %errorlevel% equ 0 (
    echo 发现Node.js进程，正在检查...
    wmic process where "name='node.exe' and commandline like '%%react-scripts%%'" delete >nul 2>&1
    wmic process where "name='node.exe' and commandline like '%%3000%%'" delete >nul 2>&1
)

:: 停止Python进程
tasklist | findstr "python.exe" >nul
if %errorlevel% equ 0 (
    echo 发现Python进程，正在检查...
    wmic process where "name='python.exe' and commandline like '%%app.py%%'" delete >nul 2>&1
    wmic process where "name='python.exe' and commandline like '%%5000%%'" delete >nul 2>&1
)

:: 关闭相关窗口
taskkill /F /FI "WINDOWTITLE eq AI电商-后端服务*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq AI电商-AI服务*" >nul 2>&1  
taskkill /F /FI "WINDOWTITLE eq AI电商-前端服务*" >nul 2>&1

echo.
echo ================================
echo 🎯 服务停止完成！
echo ================================
echo.
echo 📊 服务状态检查:
echo.

:: 检查端口状态
netstat -an | findstr ":8080.*LISTENING" >nul
if %errorlevel% neq 0 (
    echo ✅ 后端服务 (8080): 已停止
) else (
    echo ❌ 后端服务 (8080): 仍在运行
)

netstat -an | findstr ":5000.*LISTENING" >nul
if %errorlevel% neq 0 (
    echo ✅ AI服务 (5000): 已停止
) else (
    echo ❌ AI服务 (5000): 仍在运行
)

netstat -an | findstr ":3000.*LISTENING" >nul
if %errorlevel% neq 0 (
    echo ✅ 前端服务 (3000): 已停止
) else (
    echo ❌ 前端服务 (3000): 仍在运行
)

echo.
echo 💡 提示:
echo - 如果某个服务仍在运行，可能需要手动停止
echo - 可以使用任务管理器查看和结束进程
echo - 重新启动请运行: start-windows.bat
echo.
echo 📁 临时文件位置: C:\temp\ai-ecommerce\
echo 📚 日志文件保留在: C:\temp\ai-ecommerce\logs\
echo.

pause