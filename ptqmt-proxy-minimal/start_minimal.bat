@echo off
REM PTQMT中转服务精简版启动脚本

echo ==================================================
echo PTQMT中转服务精简版启动脚本
echo ==================================================
echo.

REM 检查Python是否已安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Python，请确保Python已安装并添加到PATH环境变量
    echo 请访问 https://www.python.org/downloads/ 下载并安装Python
    pause
    exit /b 1
)

REM 检查依赖文件
if not exist "requirements_proxy.txt" (
    echo 警告: 未找到 requirements_proxy.txt 文件
    echo 请确保在正确的目录中运行此脚本
    echo.
)

REM 安装依赖（如果需要）
echo 检查并安装Python依赖...
pip install -r requirements_proxy.txt >nul 2>&1
if %errorlevel% neq 0 (
    echo 警告: 安装依赖时出现问题，请手动运行以下命令:
    echo pip install -r requirements_proxy.txt
    echo.
)

echo.
echo ==================================================
echo 正在启动PTQMT中转服务...
echo 访问地址: http://localhost:80
echo API文档: http://localhost:80/docs
echo ==================================================
echo.

REM 启动服务
python ptqmt_proxy_server.py

if %errorlevel% neq 0 (
    echo.
    echo ==================================================
    echo 服务启动失败，请检查错误信息
    echo ==================================================
) else (
    echo.
    echo ==================================================
    echo 服务已停止
    echo ==================================================
)

pause