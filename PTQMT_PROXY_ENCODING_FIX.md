# PTQMT中转服务启动问题修复指南

## 🐛 问题分析

您遇到的错误：
```
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xb8 in position 95
```

**原因**：配置文件的编码不是UTF-8，可能被保存为GBK或其他中文编码。

## ✅ 修复方案

### 步骤1：删除旧的配置文件

1. 打开文件浏览器，进入 `C:\ptqmt-proxy` 目录
2. 找到 `proxy_config.json` 文件
3. **删除它**（右键 → 删除）

### 步骤2：创建新的配置文件

在 `C:\ptqmt-proxy` 目录中，创建一个新文件 `proxy_config.json`：

**方法A：使用记事本（推荐）**

1. 在 `C:\ptqmt-proxy` 目录中右键 → 新建 → 文本文档
2. 将其命名为 `config.txt`
3. 双击打开，复制以下内容：

```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 80,
    "debug": true
  },
  "security": {
    "tokens": [
      "test_token"
    ],
    "allowed_ips": []
  },
  "storage": {
    "type": "memory"
  },
  "logging": {
    "level": "DEBUG",
    "file": "ptqmt_proxy.log"
  },
  "limits": {
    "max_signals_per_request": 20
  }
}
```

4. 按 **Ctrl+S** 保存
5. **重要**：选择"另存为"，设置编码为 **UTF-8**
6. 改名为 `proxy_config.json`

**方法B：使用VS Code（更安全）**

1. 打开VS Code
2. File → Open Folder → 选择 `C:\ptqmt-proxy`
3. 创建新文件 `proxy_config.json`
4. 粘贴上面的JSON内容
5. 确保右下角显示 **UTF-8** 编码
6. 按 **Ctrl+S** 保存

### 步骤3：验证配置文件

保存后，确保文件大小约为 400 字节左右，这说明文件已正确保存。

## 🚀 重新启动服务

现在在 `C:\ptqmt-proxy` 目录中运行：

```cmd
python ptqmt_proxy_server.py
```

您应该看到如下输出（**中文正常显示**）：

```
==================================================
PTQMT中转服务精简版启动脚本
==================================================

管理员权限: 已获得
检查Python环境...
正在启动PTQMT中转服务...
访问地址: http://localhost:80
API文档: http://localhost:80/docs
==================================================
```

然后是：

```
启动PTQMT中转服务...
监听地址: 0.0.0.0:80
配置文件: proxy_config.json
INFO:     Started server process [12345]
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:80
```

## ⚠️ 常见错误

### 错误1：仍然出现编码错误

检查文件编码：
```cmd
# 在PowerShell中运行
file -i C:\ptqmt-proxy\proxy_config.json
```

如果显示GBK，需要重新保存为UTF-8。

### 错误2：JSON格式错误

检查JSON语法，确保：
- 没有多余的逗号
- 所有引号都是直引号（不是弯引号）
- 没有中文标点符号

## 🔧 Python脚本修复

如果问题仍未解决，可以修改 `ptqmt_proxy_server.py` 第32行，改为兼容多种编码：

```python
# 原代码：
with open(CONFIG_FILE, 'r', encoding='utf-8') as f:

# 改为：
with open(CONFIG_FILE, 'r', encoding='utf-8-sig') as f:
```

## 📞 快速检查清单

- [ ] 删除了旧的 `proxy_config.json`
- [ ] 创建了新的 `proxy_config.json`
- [ ] 确认编码为 UTF-8
- [ ] JSON格式正确（可用在线JSON验证工具检查）
- [ ] 文件保存在 `C:\ptqmt-proxy` 目录中
- [ ] 服务成功启动，显示 "Uvicorn running on http://0.0.0.0:80"

完成以上步骤后，服务应该能正常启动！