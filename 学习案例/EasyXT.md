# EasyXT — 基于 MiniQMT xtquant 的易用封装库

> 统一接口 · 智能参数 · 完善错误处理，让量化开发更简单高效  
> 仓库：https://github.com/quant-king299/EasyXT

<div class="tech-nav-container">
  <a href="https://github.com/quant-king299/EasyXT" class="tech-nav-button ai-code-button"><span class="tech-icon">🧭</span>GitHub</a>
  <a href="#/学习案例/01基础入门教程" class="tech-nav-button docs-button"><span class="tech-icon">🚀</span>快速入门</a>
  <a href="#/学习案例/01基础入门教程?id=环境准备" class="tech-nav-button tech-share-button"><span class="tech-icon">⚙️</span>安装指南</a>
  <a href="easyxt.html" class="tech-nav-button resource-button"><span class="tech-icon">🔬</span>立即体验</a>
</div>

## 功能亮点
- 统一接口：对 xtquant 多模块统一命名与参数风格
- 智能参数：自动容错与默认值注入，减少样板代码
- 错误处理：分级异常与重试机制，提升稳定性
- 开发友好：明确返回结构与类型提示，便于集成

## 安装与环境配置
```python
# 本地引入示例（根据你的 MiniQMT 实际路径调整）
import sys, os
EASYXT_HOME = r"D:\QMT交易端\userdata_mini\xtquant\EasyXT"
sys.path.append(EASYXT_HOME)

# 环境变量（如需）
os.environ['XTQUANT_HOME'] = r"D:\QMT交易端\userdata_mini"
# 对接 PTrade 可选：
# os.environ['PTRADE_HOME'] = r"C:\PTrade"
```

## 快速示例（3-6行即可跑）
```python
from easyxt import Market, Trade

# 拉取行情（自动处理代码/市场格式）
df = Market.fetch_kline("SH.600000", period="1m", count=100)

# 下单示例（带风控与错误处理）
order_id = Trade.buy("SH.600000", price=10.23, volume=100)
print(df.tail())
```

## 3.2 交易功能测试

账户绑定完成后，需要验证交易功能是否正常：

### 测试代码示例
```python
# 交易功能连通性测试（示例）
from easyxt import Trade

# 1) 初始化并绑定账户（替换为你的实际路径与资金账号）
api = Trade()
api.init_trade(r"D:/国金QMT交易端模拟/userdata_mini", account="39020958")

# 2) 查询账户与持仓，确认连接正常
account_info = api.get_account_info()
positions = api.get_positions()
print("账户信息:", account_info.get("account_id", "N/A"))
print("当前持仓数量:", len(positions))

# 3) 下发一笔小额限价买入（示例代码，请在模拟环境中测试）
order_id = api.buy("SH.600000", volume=100, price=10.50)  # 示例价格
print("委托编号:", order_id)

# 4) 撤单示例（如需）
if order_id:
    cancel_ok = api.cancel_order(order_id)
    print("撤单结果:", cancel_ok)
```

## 模块架构
```
EasyXT
├─ Market      # 行情层：统一订阅/拉取/缓存
├─ Trade       # 交易层：下单/撤单/查询（支持风控钩子）
├─ Events      # 事件层：集中式回调分发
├─ Utils       # 工具层：代码归一化/重试/日志
└─ Adapters    # 适配层：对接 xtquant 原始 API
```

## 与原生 xtquant 的对比优势
- 接口统一 vs 原始接口分散
- 参数智能 vs 手动校验
- 错误分级与重试 vs 自行处理异常
- 统一返回结构 vs 数据形态多样
- 插件化扩展 vs 需自拼装

## FAQ
- Q: QMT未启动如何学习？  
  A: 支持模拟模式，先跑“01基础入门教程”中的示例。
- Q: 推荐的数据周期？  
  A: 推荐 1d/1m/5m，避免 15m/30m/1h。
- Q: 实时价格拿不到？  
  A: 检查代码格式（如 SH.600000）和交易时段。

## 关联资源
- GitHub仓库：<https://github.com/quant-king299/EasyXT>  
- 入门教程：[#/学习案例/01基础入门教程](#/学习案例/01基础入门教程)  
- 体验页：<easyxt.html>

