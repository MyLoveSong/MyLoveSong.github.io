@echo off
echo 🚀 启动本地开发服务器...
echo.

REM 检查Python是否可用
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 使用Python启动服务器...
    echo 📍 服务器地址: http://localhost:8000
    echo 📁 项目目录: %cd%
    echo.
    echo 💡 请在浏览器中访问: http://localhost:8000
    echo 💡 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8000
    goto :end
)

REM 检查Python3是否可用
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 使用Python3启动服务器...
    echo 📍 服务器地址: http://localhost:8000
    echo 📁 项目目录: %cd%
    echo.
    echo 💡 请在浏览器中访问: http://localhost:8000
    echo 💡 按 Ctrl+C 停止服务器
    echo.
    python3 -m http.server 8000
    goto :end
)

REM 检查Node.js是否可用
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 使用Node.js启动服务器...
    echo 📍 服务器地址: http://localhost:8000
    echo 📁 项目目录: %cd%
    echo.
    echo 💡 请在浏览器中访问: http://localhost:8000
    echo 💡 按 Ctrl+C 停止服务器
    echo.
    npx http-server -p 8000 -o
    goto :end
)

REM 如果都没有，提示安装
echo ❌ 未找到Python或Node.js
echo.
echo 📥 请安装以下任一工具：
echo   1. Python: https://www.python.org/downloads/
echo   2. Node.js: https://nodejs.org/
echo.
echo 💡 或者使用其他本地服务器工具
echo.

:end
pause
