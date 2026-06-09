# PTQMT中转服务本地准备完成报告

## 🎯 项目概述

您已成功在本地电脑上完成PTQMT中转服务的准备工作，该服务将使用独立IP域名 [www.ptqmt.com](http://www.ptqmt.com) 作为聚宽策略与QMT交易终端之间的稳定中转服务。

## 📦 已完成的准备工作

1. **创建部署目录结构** - 在本地创建了完整的部署文件目录
2. **配置服务参数** - 已配置好适用于生产环境的参数
3. **准备所有必要文件** - 包括服务主程序、配置文件、依赖列表、启动脚本等
4. **创建部署文档** - 提供了详细的部署说明和操作指南
5. **打包部署文件** - 创建了压缩包便于传输到服务器

## 📁 生成的文件列表

- `ptqmt-deployment-package/` - 完整的部署目录
- `ptqmt-proxy-deployment.zip` - 压缩后的部署包
- `ptqmt-deployment-package/DEPLOYMENT_INSTRUCTIONS.md` - 详细部署指南
- `ptqmt-deployment-package/quick_deploy.bat` - 快速部署脚本

## 🚀 下一步操作步骤

### 1. 传输文件到阿里云服务器

将 `ptqmt-proxy-deployment.zip` 文件传输到您的阿里云Windows服务器。

### 2. 在服务器上解压部署包

在服务器上解压文件到 `C:\ptqmt-proxy` 目录：

```powershell
Expand-Archive -Path ptqmt-proxy-deployment.zip -DestinationPath C:\
```

### 3. 运行快速部署脚本

进入部署目录并运行快速部署脚本：

```cmd
cd C:\ptqmt-proxy
quick_deploy.bat
```

### 4. 安装为Windows服务（推荐）

以管理员身份运行PowerShell，执行：

```powershell
cd C:\ptqmt-proxy
.\install_ptqmt_service.ps1 -Install
.\install_ptqmt_service.ps1 -Start
```

### 5. 配置域名解析

确保域名 [www.ptqmt.com](http://www.ptqmt.com) 已正确解析到您的阿里云服务器IP地址。

## 🔧 服务使用说明

### 聚宽策略端配置

在聚宽策略中使用以下配置连接中转服务：

```python
client = QMTClient(
    base_url="http://www.ptqmt.com",
    token="jq_strategy_token"  # 使用配置文件中定义的token
)
```

### QMT客户端配置

在运行QMT的电脑上使用以下配置：

```python
client = QMTSignalClient(
    base_url="http://www.ptqmt.com",
    token="qmt_client_token"  # 使用配置文件中定义的token
)
```

## 🔒 安全建议

1. **定期更换Token** - 建议定期更新访问令牌以提高安全性
2. **配置IP白名单** - 在 `proxy_config.json` 中配置允许访问的IP地址
3. **启用HTTPS** - 在生产环境中建议配置SSL证书使用HTTPS协议
4. **监控日志** - 定期检查服务日志文件 `ptqmt_proxy.log`

## 📞 技术支持

如有任何问题，请参考部署包中的文档或联系技术支持。

---
报告生成时间: 2025-11-03