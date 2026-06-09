# PTQMT中转服务配置指南

## 📋 配置文件详细说明

配置文件位置：`C:\ptqmt-proxy\proxy_config.json`

### 1. 服务器配置（server）

```json
"server": {
  "host": "0.0.0.0",    // 监听地址，0.0.0.0表示监听所有网卡
  "port": 80,           // 监听端口，80是HTTP默认端口
  "debug": false        // 调试模式，生产环境应设为false
}
```

**说明：**
- `host`: 通常保持为 `0.0.0.0`，这样所有IP都可以访问
- `port`: 如果80端口被占用，可改为其他端口（如8080、8888等）
- `debug`: 生产环境一定要设为 `false`，否则会暴露敏感信息

### 2. 安全配置（security）

```json
"security": {
  "tokens": [
    "ptqmt_secret_token_2025",  // Token 1
    "jq_strategy_token",        // Token 2（聚宽策略用）
    "qmt_client_token"          // Token 3（QMT客户端用）
  ],
  "allowed_ips": [
    "127.0.0.1",                // 本机IP
    "192.168.1.0/24"            // 允许的IP段
  ]
}
```

**说明：**
- `tokens`: 这是访问密钥，调用API时必须在请求头中包含：
  ```
  Authorization: Bearer ptqmt_secret_token_2025
  ```
- 可以添加多个Token供不同的客户端使用
- **建议修改这些Token为更安全的值**（如使用UUID生成）
- `allowed_ips`: IP白名单，可以为空表示不限制，或添加允许的IP地址

**更改Token的方法：**
- 使用UUID生成器生成随机字符串，替换现有Token值
- 或使用以下Python代码生成：
  ```python
  import uuid
  print(uuid.uuid4().hex)  # 生成UUID格式的Token
  ```

### 3. 存储配置（storage）

```json
"storage": {
  "type": "memory"  // 存储类型，目前仅支持内存存储
}
```

**说明：**
- `type`: 当前版本只支持 `memory`（内存存储）
- 内存存储的信号在服务重启后会丢失
- 对于生产环境，建议使用Redis或数据库存储（需要后续扩展）

### 4. 日志配置（logging）

```json
"logging": {
  "level": "INFO",              // 日志级别
  "file": "ptqmt_proxy.log"     // 日志文件名
}
```

**说明：**
- `level`: 日志级别，可选值：
  - `DEBUG`: 调试信息（最详细）
  - `INFO`: 一般信息（推荐）
  - `WARNING`: 警告信息
  - `ERROR`: 错误信息
  - `CRITICAL`: 严重错误（最简洁）
- `file`: 日志文件将保存在 `C:\ptqmt-proxy\ptqmt_proxy.log`

### 5. 限制配置（limits）

```json
"limits": {
  "max_signals_per_request": 20  // 每次请求最多返回的信号数
}
```

**说明：**
- `max_signals_per_request`: 控制每次API请求返回的最大信号数量
- 防止单次请求过大影响性能
- 可根据实际需要调整

## 🔐 安全建议

### 1. 修改默认Token

**强烈建议**修改所有默认Token为更安全的值：

```json
"tokens": [
  "生成的UUID1",
  "生成的UUID2", 
  "生成的UUID3"
]
```

### 2. 设置IP白名单

如果只有特定IP需要访问，设置allowed_ips：

```json
"allowed_ips": [
  "127.0.0.1",           // 本机
  "192.168.1.100",       // 聚宽服务器IP
  "192.168.1.200"        // QMT客户端IP
]
```

### 3. 使用HTTPS（可选）

对于生产环境，建议配置SSL证书使用HTTPS。这需要修改 `ptqmt_proxy_server.py` 中的启动代码。

### 4. 定期更新Token

建议每3-6个月更新一次Token，提高安全性。

## 📝 常见配置场景

### 场景1：本地测试

```json
{
  "server": {
    "host": "127.0.0.1",
    "port": 8080,
    "debug": true
  },
  "security": {
    "tokens": ["test_token"],
    "allowed_ips": ["127.0.0.1"]
  },
  "logging": {
    "level": "DEBUG"
  }
}
```

### 场景2：生产环境（单服务器）

```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 80,
    "debug": false
  },
  "security": {
    "tokens": [
      "复杂的UUID或密钥1",
      "复杂的UUID或密钥2",
      "复杂的UUID或密钥3"
    ],
    "allowed_ips": []
  },
  "logging": {
    "level": "INFO",
    "file": "ptqmt_proxy.log"
  }
}
```

### 场景3：内网环境

```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 80,
    "debug": false
  },
  "security": {
    "tokens": ["内部Token"],
    "allowed_ips": [
      "192.168.1.0/24",
      "10.0.0.0/8"
    ]
  }
}
```

## 🔄 修改后如何生效

1. **修改配置文件**后保存
2. **重启服务**：
   ```cmd
   # 如果服务正在运行，先停止它（按Ctrl+C）
   # 然后重新运行
   python ptqmt_proxy_server.py
   ```
3. 新的配置会在服务重启后立即生效

## ⚠️ 注意事项

1. **JSON格式严格** - 确保JSON格式正确，否则服务无法启动
   - 不要在最后一个元素后面加逗号
   - 字符串必须用双引号

2. **Token要复杂** - 使用简单的Token会降低安全性

3. **保存配置文件** - 修改后务必保存文件

4. **定期备份** - 建议定期备份配置文件

## 📞 配置验证

启动服务后，如果配置有问题，会在命令行显示错误信息。如果看到类似以下输出说明配置正确：

```
启动PTQMT中转服务...
监听地址: 0.0.0.0:80
配置文件: proxy_config.json
INFO:     Started server process [12345]
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:80
```