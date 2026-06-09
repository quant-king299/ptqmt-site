@echo off
chcp 65001 >nul
title 离线配置Nginx（无需宝塔面板网络）

echo.
echo ========================================
echo        离线配置Nginx优化
echo ========================================
echo.

echo [说明]
echo 此方法不依赖宝塔面板网络连接
echo 直接修改Nginx配置文件
echo.

echo [操作步骤]
echo 1. 找到Nginx配置文件位置
echo 2. 备份原配置文件
echo 3. 应用优化配置
echo 4. 重启Nginx服务
echo.

set /p CONTINUE="是否继续离线配置？(y/N): "
if /i not "%CONTINUE%"=="y" (
    echo 操作已取消
    pause
    exit
)

echo.
echo [步骤1] 查找Nginx配置文件...
echo 常见位置：
echo - D:\BtSoft\nginx\conf\vhost\ptqmt.com.conf
echo - C:\BtSoft\nginx\conf\vhost\ptqmt.com.conf
echo.

set /p CONFIG_PATH="请输入配置文件完整路径: "

if not exist "%CONFIG_PATH%" (
    echo 文件不存在，请检查路径
    pause
    exit
)

echo.
echo [步骤2] 备份原配置文件...
copy "%CONFIG_PATH%" "%CONFIG_PATH%.backup" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ✓ 备份成功: %CONFIG_PATH%.backup
) else (
    echo ✗ 备份失败，请检查权限
    pause
    exit
)

echo.
echo [步骤3] 应用优化配置...
if exist "nginx-ptqmt-fixed.conf" (
    copy "nginx-ptqmt-fixed.conf" "%CONFIG_PATH%" >nul 2>&1
    if %ERRORLEVEL%==0 (
        echo ✓ 配置应用成功
    ) else (
        echo ✗ 配置应用失败
        echo 正在还原备份...
        copy "%CONFIG_PATH%.backup" "%CONFIG_PATH%" >nul 2>&1
        pause
        exit
    )
) else (
    echo ✗ 未找到优化配置文件
    pause
    exit
)

echo.
echo [步骤4] 重启Nginx服务...
net stop nginx >nul 2>&1
timeout /t 2 >nul
net start nginx >nul 2>&1

if %ERRORLEVEL%==0 (
    echo ✓ Nginx重启成功
) else (
    echo ✗ Nginx重启失败，正在还原配置...
    copy "%CONFIG_PATH%.backup" "%CONFIG_PATH%" >nul 2>&1
    net start nginx >nul 2>&1
    echo 配置已还原，请检查配置文件语法
    pause
    exit
)

echo.
echo ========================================
echo           配置完成！
echo ========================================
echo.
echo ✓ 原配置已备份
echo ✓ 优化配置已应用
echo ✓ Nginx服务已重启
echo.
echo 请运行 检测配置.bat 验证效果
echo.

pause