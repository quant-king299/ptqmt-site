# PTQMT中转服务精简版

## 🎯 项目简介

这是一个专为聚宽(JoinQuant)策略与QMT交易终端设计的精简版中转服务，用于解决内网穿透不稳定的问题，提供稳定可靠的信号传输通道。

## 📁 目录结构

```
ptqmt-proxy-minimal/
├── ptqmt_proxy_server.py       # 中转服务主程序
├── proxy_config.json           # 配置文件
├── requirements_proxy.txt      # Python依赖列表
├── start_minimal.bat           # Windows启动脚本
├── test_minimal.py             # 服务测试脚本
├── qmt_client_minimal.py       # QMT客户端示例
├── jq_client_minimal.py        # 聚宽策略客户端示例
└── DEPLOYMENT_MINIMAL.md       # 部署说明
```

## 🚀 快速开始

1. 安装Python依赖:
   ```bash
   pip install -r requirements_proxy.txt
   ```

2. 启动服务:
   ```bash
   python ptqmt_proxy_server.py
   ```
   或双击运行 `start_minimal.bat`

3. 测试服务:
   ```bash
   python test_minimal.py
   ```

## 📞 技术支持

如有问题，请参考部署说明或联系技术支持。