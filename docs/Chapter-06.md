# 第六章：MiniQMT下载与安装

## 概述

MiniQMT是迅投QMT的轻量化版本，专为个人投资者和小型机构设计。它保留了QMT的核心功能，同时简化了安装和使用流程，是量化交易入门的理想选择。

---

## 6.1 系统要求

### 6.1.1 硬件要求

**最低配置**：
- CPU：Intel i3或AMD同等性能处理器
- 内存：4GB RAM
- 硬盘：2GB可用空间
- 网络：稳定的互联网连接

**推荐配置**：
- CPU：Intel i5或AMD同等性能处理器
- 内存：8GB RAM或更高
- 硬盘：10GB可用空间（SSD推荐）
- 网络：宽带连接，延迟低于50ms

### 6.1.2 软件要求

**操作系统支持**：
- Windows 10/11 (64位)
- Windows Server 2016/2019/2022
- 支持.NET Framework 4.7.2或更高版本

**依赖组件**：
- Microsoft Visual C++ 2019 Redistributable
- .NET Framework 4.7.2+
- Python 3.7+ (可选，用于策略开发)

---

## 6.2 下载MiniQMT

### 6.2.1 官方下载渠道

**主要下载地址**：
1. **官方网站**：https://www.xtquant.com/miniQMT
2. **技术支持**：联系客服获取最新安装包
3. **合作伙伴**：通过授权代理商获取

### 6.2.2 版本选择

**当前版本信息**：
- **稳定版**：MiniQMT v2.1.0（推荐）
- **测试版**：MiniQMT v2.2.0 Beta
- **历史版本**：支持回退到v2.0.x系列

**版本特性对比**：

| 功能特性 | v2.0.x | v2.1.0 | v2.2.0 Beta |
|---------|--------|--------|-------------|
| 基础交易 | ✓ | ✓ | ✓ |
| 策略回测 | ✓ | ✓ | ✓ |
| 实时行情 | ✓ | ✓ | ✓ |
| 多账户支持 | ✗ | ✓ | ✓ |
| 云端同步 | ✗ | ✗ | ✓ |
| API增强 | ✗ | ✓ | ✓ |

### 6.2.3 下载注意事项

**下载前准备**：
```bash
# 检查系统版本
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"

# 检查.NET Framework版本
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full\" /v Release
```

**文件完整性验证**：
- 安装包大小：约150MB
- MD5校验值：请从官网获取最新校验值
- 数字签名：验证迅投科技数字证书

---

## 6.3 安装步骤

### 6.3.1 标准安装流程

**步骤1：运行安装程序**
```
1. 右键点击安装包，选择"以管理员身份运行"
2. 如出现Windows安全提示，点击"更多信息" → "仍要运行"
3. 等待安装程序初始化完成
```

**步骤2：选择安装选项**
```
安装类型选择：
□ 完整安装（推荐）- 包含所有功能模块
□ 自定义安装 - 可选择特定组件
□ 最小安装 - 仅核心功能

安装路径：
默认：C:\Program Files\XTQuant\MiniQMT\
自定义：可选择其他路径（建议使用默认路径）
```

**步骤3：组件选择**（自定义安装时）
```
核心组件：
☑ MiniQMT主程序 [必需]
☑ 行情数据模块 [必需]
☑ 交易执行模块 [必需]

可选组件：
☑ Python策略开发环境
☑ 历史数据下载工具
☑ 策略模板库
☑ 帮助文档
```

**步骤4：完成安装**
```
1. 点击"安装"开始安装过程
2. 等待文件复制完成（约2-5分钟）
3. 安装完成后，选择是否立即启动MiniQMT
4. 点击"完成"退出安装程序
```

### 6.3.2 静默安装

**命令行安装**：
```cmd
# 静默安装到默认路径
MiniQMT_Setup.exe /S

# 静默安装到指定路径
MiniQMT_Setup.exe /S /D=C:\MyPrograms\MiniQMT

# 静默安装并指定组件
MiniQMT_Setup.exe /S /COMPONENTS="core,python,templates"
```

**批量部署脚本**：
```batch
@echo off
echo 开始安装MiniQMT...

# 检查管理员权限
net session >nul 2>&1
if %errorLevel% == 0 (
    echo 管理员权限确认
) else (
    echo 请以管理员身份运行此脚本
    pause
    exit /b 1
)

# 执行安装
MiniQMT_Setup.exe /S /D=%ProgramFiles%\XTQuant\MiniQMT

# 验证安装
if exist "%ProgramFiles%\XTQuant\MiniQMT\MiniQMT.exe" (
    echo 安装成功！
) else (
    echo 安装失败，请检查错误日志
)

pause
```

---

## 6.4 首次配置

### 6.4.1 启动MiniQMT

**首次启动**：
1. 双击桌面快捷方式或从开始菜单启动
2. 首次启动会进行初始化配置
3. 等待必要组件加载完成

**启动参数**：
```cmd
# 标准启动
MiniQMT.exe

# 调试模式启动
MiniQMT.exe --debug

# 指定配置文件
MiniQMT.exe --config="custom_config.xml"

# 安全模式启动
MiniQMT.exe --safe-mode
```

### 6.4.2 账户配置

**券商账户设置**：
```
支持的券商：
- 华泰证券
- 中信证券  
- 国泰君安
- 招商证券
- 广发证券
- 其他支持CTP接口的券商

配置步骤：
1. 点击"账户管理" → "添加账户"
2. 选择券商类型
3. 输入账户信息（账号、密码、服务器地址）
4. 测试连接
5. 保存配置
```

**模拟账户设置**：
```
内置模拟账户：
- 账户资金：100万元（虚拟）
- 支持股票、期货、期权交易
- 实时行情数据
- 完整的交易功能

激活步骤：
1. 选择"模拟交易"模式
2. 系统自动创建模拟账户
3. 开始模拟交易
```

### 6.4.3 数据源配置

**行情数据源**：
```xml
<!-- 配置文件示例：data_config.xml -->
<DataSources>
    <MarketData>
        <Provider name="XTQuant" enabled="true">
            <Server>market.xtquant.com</Server>
            <Port>7709</Port>
            <Username>your_username</Username>
            <Password>your_password</Password>
        </Provider>
        
        <Provider name="Backup" enabled="false">
            <Server>backup.xtquant.com</Server>
            <Port>7709</Port>
        </Provider>
    </MarketData>
    
    <HistoricalData>
        <CacheSize>1GB</CacheSize>
        <UpdateInterval>1h</UpdateInterval>
        <DataPath>.\Data\Historical\</DataPath>
    </HistoricalData>
</DataSources>
```

---

## 6.5 验证安装

### 6.5.1 功能测试

**基础功能检查**：
```python
# 测试脚本：test_installation.py
import xtquant as xt

def test_basic_functions():
    """测试基础功能"""
    try:
        # 测试数据获取
        data = xt.get_market_data(['000001.SZ'], period='1d', count=10)
        print("✓ 数据获取功能正常")
        
        # 测试账户连接
        accounts = xt.get_trading_accounts()
        print(f"✓ 发现 {len(accounts)} 个交易账户")
        
        # 测试策略框架
        from xtquant.xttrader import XtQuantTrader
        trader = XtQuantTrader()
        print("✓ 策略框架加载正常")
        
        return True
        
    except Exception as e:
        print(f"✗ 功能测试失败: {str(e)}")
        return False

if __name__ == "__main__":
    print("开始MiniQMT安装验证...")
    if test_basic_functions():
        print("🎉 安装验证成功！MiniQMT已准备就绪。")
    else:
        print("❌ 安装验证失败，请检查安装或联系技术支持。")
```

### 6.5.2 性能测试

**系统性能评估**：
```python
import time
import psutil
import xtquant as xt

def performance_test():
    """性能测试"""
    print("开始性能测试...")
    
    # 内存使用测试
    process = psutil.Process()
    initial_memory = process.memory_info().rss / 1024 / 1024  # MB
    print(f"初始内存使用: {initial_memory:.1f} MB")
    
    # 数据获取速度测试
    start_time = time.time()
    symbols = ['000001.SZ', '000002.SZ', '600000.SH', '600036.SH', '000858.SZ']
    
    for symbol in symbols:
        data = xt.get_market_data([symbol], period='1d', count=100)
    
    end_time = time.time()
    data_fetch_time = end_time - start_time
    
    final_memory = process.memory_info().rss / 1024 / 1024  # MB
    memory_increase = final_memory - initial_memory
    
    print(f"数据获取耗时: {data_fetch_time:.2f} 秒")
    print(f"内存增长: {memory_increase:.1f} MB")
    print(f"最终内存使用: {final_memory:.1f} MB")
    
    # 性能评级
    if data_fetch_time < 2.0 and memory_increase < 50:
        print("🟢 性能评级: 优秀")
    elif data_fetch_time < 5.0 and memory_increase < 100:
        print("🟡 性能评级: 良好")
    else:
        print("🔴 性能评级: 需要优化")

if __name__ == "__main__":
    performance_test()
```

---

## 6.6 常见问题解决

### 6.6.1 安装问题

**问题1：安装程序无法运行**
```
症状：双击安装包无反应或报错
解决方案：
1. 检查文件是否完整下载
2. 验证MD5校验值
3. 以管理员身份运行
4. 临时关闭杀毒软件
5. 检查Windows版本兼容性
```

**问题2：安装过程中断**
```
症状：安装进度停止或报错退出
解决方案：
1. 清理临时文件：%TEMP%\XTQuant\
2. 重启计算机后重新安装
3. 检查磁盘空间是否充足
4. 关闭其他占用资源的程序
```

**问题3：缺少依赖组件**
```
症状：提示缺少.NET Framework或VC++运行库
解决方案：
1. 下载安装.NET Framework 4.7.2+
2. 安装Visual C++ 2019 Redistributable
3. 运行Windows Update更新系统
4. 使用离线安装包
```

### 6.6.2 启动问题

**问题1：程序无法启动**
```
症状：点击图标无反应或闪退
解决方案：
1. 检查安装路径是否正确
2. 以管理员身份运行
3. 检查防火墙设置
4. 查看事件查看器中的错误日志
5. 重新安装程序
```

**问题2：网络连接失败**
```
症状：无法连接到数据服务器
解决方案：
1. 检查网络连接
2. 配置防火墙例外
3. 检查代理设置
4. 联系网络管理员开放端口
5. 尝试使用备用服务器
```

### 6.6.3 功能问题

**问题1：数据获取异常**
```
症状：无法获取行情数据或数据不完整
解决方案：
1. 检查账户权限
2. 验证数据源配置
3. 清理数据缓存
4. 重新登录账户
5. 联系数据服务商
```

**问题2：策略运行错误**
```
症状：策略无法正常执行或报错
解决方案：
1. 检查Python环境配置
2. 验证策略代码语法
3. 查看详细错误日志
4. 更新策略模板
5. 重置策略环境
```

---

## 6.7 升级与维护

### 6.7.1 版本升级

**自动更新**：
```
设置 → 系统设置 → 自动更新
☑ 启用自动检查更新
☑ 自动下载更新包
☐ 自动安装更新（建议手动确认）

更新频率：
○ 每日检查
● 每周检查  
○ 每月检查
○ 手动检查
```

**手动升级**：
```
1. 备份当前配置和策略文件
2. 下载最新版本安装包
3. 卸载旧版本（可选，支持覆盖安装）
4. 安装新版本
5. 恢复配置文件
6. 验证功能正常
```

### 6.7.2 数据维护

**定期维护任务**：
```python
# 维护脚本：maintenance.py
import os
import shutil
from datetime import datetime, timedelta

def cleanup_old_data():
    """清理过期数据"""
    data_path = r"C:\Program Files\XTQuant\MiniQMT\Data"
    cutoff_date = datetime.now() - timedelta(days=90)
    
    for root, dirs, files in os.walk(data_path):
        for file in files:
            file_path = os.path.join(root, file)
            if os.path.getmtime(file_path) < cutoff_date.timestamp():
                try:
                    os.remove(file_path)
                    print(f"删除过期文件: {file}")
                except Exception as e:
                    print(f"删除失败: {file}, 错误: {e}")

def backup_config():
    """备份配置文件"""
    config_path = r"C:\Program Files\XTQuant\MiniQMT\Config"
    backup_path = f"C:\\Backup\\MiniQMT_{datetime.now().strftime('%Y%m%d')}"
    
    try:
        shutil.copytree(config_path, backup_path)
        print(f"配置备份完成: {backup_path}")
    except Exception as e:
        print(f"备份失败: {e}")

if __name__ == "__main__":
    print("开始系统维护...")
    cleanup_old_data()
    backup_config()
    print("维护完成！")
```

---

## 6.8 技术支持

### 6.8.1 获取帮助

**官方支持渠道**：
- **技术文档**：https://docs.xtquant.com/miniQMT
- **用户论坛**：https://forum.xtquant.com
- **在线客服**：工作日 9:00-18:00
- **技术QQ群**：123456789
- **邮件支持**：support@xtquant.com

### 6.8.2 问题反馈

**反馈信息收集**：
```
请提供以下信息以便快速定位问题：

1. 系统信息：
   - 操作系统版本
   - MiniQMT版本号
   - 硬件配置

2. 问题描述：
   - 具体症状
   - 复现步骤
   - 错误截图

3. 日志文件：
   - 应用程序日志
   - 系统事件日志
   - 错误堆栈信息
```

**日志收集脚本**：
```batch
@echo off
echo 收集MiniQMT诊断信息...

set LOG_DIR=%USERPROFILE%\Desktop\MiniQMT_Logs_%date:~0,4%%date:~5,2%%date:~8,2%
mkdir "%LOG_DIR%"

# 复制应用日志
copy "%ProgramFiles%\XTQuant\MiniQMT\Logs\*.*" "%LOG_DIR%\"

# 导出系统信息
systeminfo > "%LOG_DIR%\system_info.txt"

# 导出事件日志
wevtutil epl Application "%LOG_DIR%\Application.evtx"
wevtutil epl System "%LOG_DIR%\System.evtx"

echo 诊断信息已保存到: %LOG_DIR%
echo 请将此文件夹打包发送给技术支持
pause
```

---

## 总结

MiniQMT的下载与安装过程相对简单，但需要注意系统要求和依赖组件。通过本章的详细指导，您应该能够：

1. **正确下载**：从官方渠道获取最新版本
2. **顺利安装**：按照标准流程完成安装配置
3. **验证功能**：确保所有功能正常工作
4. **解决问题**：处理常见的安装和使用问题
5. **维护升级**：保持系统最新和稳定运行

安装完成后，建议先使用模拟账户熟悉系统功能，然后再进行实盘交易。下一章我们将详细介绍xtquant框架的使用方法。

> **重要提示**：如在安装过程中遇到问题，请及时联系技术支持，避免因配置错误影响后续使用。