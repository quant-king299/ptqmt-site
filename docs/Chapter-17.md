# PTrade 快速入门

> PTrade 由恒生电子开发，运行在券商机房，属于托管模式，稳定性高于 QMT。策略部署后无人值守，无需额外购买云服务器或本地电脑。

## 平台特点

| 特性 | 说明 |
|------|------|
| **运行模式** | 托管在券商机房，7×24 小时运行 |
| **交易品种** | 股票、ETF、可转债（T+0）、债券、期货 |
| **行情粒度** | tick 级别，最小时间粒度 3 秒 |
| **委托档位** | 默认十档行情 |
| **开发环境** | Windows 客户端编辑策略 |
| **网络环境** | 券商内网，无法连接互联网 |
| **第三方库** | 仅支持内置库，不能 pip install |

## 策略生命周期

每个 PTrade 策略都遵循固定的生命周期：

```python
def initialize(context):
    """初始化 — 策略启动时执行一次。设置参数、股票池等"""
    g.stock = '600000.SH'
    set_universe([g.stock])
    set_benchmark('000300.SH')

def before_trading_start(context):
    """盘前准备 — 每个交易日开盘前执行"""
    pass

def handle_data(context, data):
    """主逻辑 — 每分钟/每天执行一次（根据策略周期）"""
    pass

def after_trading_end(context):
    """盘后处理 — 每个交易日收盘后执行"""
    pass

def on_order_response(context, order):
    """委托主推 — 委托状态变化时自动回调"""
    pass

def on_trade_response(context, trades):
    """成交主推 — 有成交时自动回调"""
    pass
```

## 最简单的策略

```python
def initialize(context):
    g.stock = '600000.SH'
    set_universe([g.stock])

def handle_data(context, data):
    # 获取当前价格
    price = data.current(g.stock, 'close')

    # 如果持仓为0，买入100股
    if context.portfolio.positions[g.stock].amount == 0:
        order(g.stock, 100)
```

## 策略运行周期

| 周期 | 说明 |
|------|------|
| **日线** | 每天 `handle_data` 执行一次，在开盘期间 |
| **分钟线** | 每分钟执行一次 `handle_data` |
| **tick** | 每笔成交执行 `tick_data` |

## 支持的代码尾缀

| 代码 | 市场 |
|------|------|
| `600000.SH` | 上交所股票 |
| `000001.SZ` | 深交所股票 |
| `688001.SH` | 科创板（上交所） |
| `300750.SZ` | 创业板（深交所） |

## 新建策略

1. 打开 PTrade 客户端 → 研究 → 新建策略
2. 填写策略名称、选择运行周期（日线/分钟/tick）
3. 在编辑器中写代码
4. 保存 → 回测验证 → 模拟盘测试 → 实盘上线

## 注意事项

- PTrade 内网环境，`pip install` 不可用，只能使用内置库
- 策略代码需在 Windows 客户端编辑，但运行在券商机房
- 模拟盘和实盘有微小差异，实盘前务必模拟盘验证
- 限价单的价格必须在涨跌停范围内，否则废单
