# PTQMT中转服务精简版部署指南

## 📋 精简版内容说明

本精简版部署包只包含聚宽转QMT中转服务的核心文件，去除了所有无关文件：

```
ptqmt-proxy-minimal/
├── ptqmt_proxy_server.py       # 中转服务主程序
├── proxy_config.json           # 配置文件
├── requirements_proxy.txt      # Python依赖列表
├── start_ptqmt_proxy.bat       # Windows启动脚本
├── qmt_client.py              # QMT客户端示例
├── test_ptqmt_proxy.py         # 服务测试脚本
└── DEPLOYMENT_MINIMAL.md      # 本部署说明
```

## 🚀 部署步骤

### 1. 上传部署包到服务器

将整个部署包目录上传到阿里云Windows服务器的 `C:\ptqmt-proxy` 目录。

### 2. 安装Python依赖

在服务器上打开PowerShell，执行以下命令：

```powershell
cd C:\ptqmt-proxy
pip install -r requirements_proxy.txt
```

### 3. 配置服务参数

编辑 [proxy_config.json](proxy_config.json) 文件，根据需要修改以下配置：

```json
{
  "server": {
    "host": "0.0.0.0",     # 服务监听地址
    "port": 80,            # 服务端口
    "debug": false         # 调试模式
  },
  "security": {
    "tokens": [            # 访问令牌列表
      "ptqmt_secret_token_2025",
      "jq_strategy_token",
      "qmt_client_token"
    ]
  }
}
```

### 4. 配置防火墙

确保Windows防火墙允许相应端口的访问：

```powershell
# PowerShell (以管理员身份运行)
New-NetFirewallRule -DisplayName "PTQMT Proxy" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
```

### 5. 测试服务

运行测试脚本验证服务是否正常工作：

```powershell
cd C:\ptqmt-proxy
python test_ptqmt_proxy.py
```

### 6. 启动服务

双击运行 [start_ptqmt_proxy.bat](start_ptqmt_proxy.bat) 或在命令行中执行：

```cmd
cd C:\ptqmt-proxy
python ptqmt_proxy_server.py
```

## 📞 技术支持

如有问题，请参考完整版部署文档或联系技术支持。