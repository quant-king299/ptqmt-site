# PTrade 策略 API 完整参考

> 来源：恒生 PTrade 平台官方文档

## 策略引擎函数（必选/可选）

### initialize(context) — 必选
策略初始化，启动时执行一次。设置参数、股票池、基准、费率等。

```python
def initialize(context):
    set_universe(['600000.SH'])
    set_benchmark('000300.SH')
    set_commission(0.0003)
```

### handle_data(context, data) — 必选
主策略逻辑，根据周期（日线/分钟线）定时执行。

```python
def handle_data(context, data):
    price = data.current('600000.SH', 'close')
    # 策略逻辑...
```

### before_trading_start(context) — 可选
每个交易日在开盘前执行。适合做盘前准备工作。

### after_trading_end(context) — 可选
每个交易日收盘后执行。适合做盘后统计、日志记录。

### tick_data(context, data) — 可选（tick 策略）
每笔成交数据到达时执行。仅 tick 级别策略有效。

### on_order_response(context, order) — 可选
委托状态变化时自动回调（已报/部成/已成/废单等）。

### on_trade_response(context, trades) — 可选
有成交发生时自动回调。

---

## 设置函数

### set_universe(stock_list)
设置股票池（回测时使用）。

```python
set_universe(['600000.SH', '000001.SZ'])
```

### set_benchmark(benchmark)
设置基准指数，用于对比收益。

```python
set_benchmark('000300.SH')
```

### set_commission(commission)
设置佣金费率。默认万三。

```python
set_commission(0.0003)  # 万三
```

### set_slippage(slippage)
设置滑点（比例或固定值）。

```python
set_slippage(0.01)  # 1%
```

### set_parameters(**kwargs)
设置策略配置参数，可在 PTrade 界面中修改。

```python
set_parameters(
    stock='600000.SH',
    fast_period=5,
    slow_period=20
)
```

---

## 定时周期性函数

### run_daily(func, time='09:30')
每天指定时间执行一次函数。

```python
def my_morning_routine(context):
    log.info('早盘检查')

run_daily(my_morning_routine, time='09:30')
```

### run_interval(func, interval)
按设定周期（秒）执行函数。

```python
def check_price(context):
    pass

run_interval(check_price, interval=60)  # 每60秒
```

---

## 获取信息函数

### get_price(code, start, end, frequency, fields, fq)
获取历史行情数据。

| 参数 | 类型 | 说明 |
|------|------|------|
| code | str | 股票代码，如 `'600000.SH'` |
| start | str | 开始日期 `'2024-01-01'` |
| end | str | 结束日期 |
| frequency | str | `'1d'`/`'1m'`/`'5m'`/`'30m'` |
| fields | list | `['close','open','high','low','volume']` |
| fq | str | 复权：`'pre'`(前复权)/`'post'`(后复权)/`None` |

```python
# 获取日线
df = get_price('600000.SH', '2024-01-01', '2024-12-31', '1d',
               ['close', 'volume'], fq='pre')

# 获取分钟线
df = get_price('600000.SH', '2024-01-01', '2024-01-05', '5m')
```

### get_today()
获取当前交易日。

```python
today = get_today()  # '20240115'
```

### get_history(n, unit, field, security_list, include_now, fq)
获取历史数据条数。

```python
# 获取最近10天的收盘价
prices = get_history(10, '1d', 'close', ['600000.SH'], fq='pre')
```

### get_fundamentals(table, fields, code, date, count)
获取基本面/财务数据。

table 可选：
- `'balance_sheet'` — 资产负债表
- `'income_statement'` — 利润表
- `'cash_flow_statement'` — 现金流量表
- `'financial_derivative'` — 财务衍生指标

```python
# 获取市盈率
pe_data = get_fundamentals('financial_derivative', 'pe_ratio',
                           '600000.SH', '2024-01-01')
```

### get_index_weights(index_code, date)
获取指数权重。

```python
weights = get_index_weights('000300.SH', '2024-01-01')
```

### get_trade_days(start, end)
获取交易日列表。

```python
days = get_trade_days('2024-01-01', '2024-12-31', 'SH')
```

---

## 下单交易函数

### order(code, amount, price=None, side='buy', order_type='limit')
下单（兼容聚宽风格）。

```python
# 买入100股
order('600000.SH', 100)

# 限价卖出
order('600000.SH', -100, price=10.50)

# 指定买卖方向
order('600000.SH', 200, side='buy')
```

### order_value(code, value, price=None, side='buy')
按金额下单（自动计算股数）。

```python
# 买入约1万元的股票
order_value('600000.SH', 10000)
```

### order_tick(code, amount, price, side)
按 tick 下单（用于 tick 策略）。

### order_target(code, target_amount, price=None)
调仓到目标股数。

```python
# 调整持仓到500股
order_target('600000.SH', 500)
```

### order_target_value(code, target_value, price=None)
调仓到目标金额。

```python
# 调整持仓到2万元
order_target_value('600000.SH', 20000)
```

### cancel_order(order_id)
撤单。

```python
cancel_order(order_id)
```

### get_orders()
获取所有委托。

### get_trades()
获取所有成交。

---

## 账户与持仓

### context.portfolio
账户对象，包含：

| 属性 | 说明 |
|------|------|
| `available_cash` | 可用资金 |
| `total_value` | 总资产 |
| `positions` | 持仓字典 |
| `market_value` | 持仓市值 |

```python
cash = context.portfolio.available_cash
total = context.portfolio.total_value
pos = context.portfolio.positions['600000.SH']
print(f"持仓量: {pos.amount}, 成本: {pos.cost_basis}")
```

### data.current(code, field)
获取当前数据。

| field | 说明 |
|------|------|
| `close` | 最新价 |
| `open` | 开盘价 |
| `high` | 最高价 |
| `low` | 最低价 |
| `volume` | 成交量 |
| `amount` | 成交额 |

```python
price = data.current('600000.SH', 'close')
```

---

## 回测支持业务类型

| 类型 | 代码 |
|------|------|
| 普通股票 | `security` |
| 可转债 | `cb` |
| 期货 | `future` |
| LOF基金 | `lof` |
| ETF基金 | `etf` |

---

## 常见问题

**Q: PTrade 支持 pip install 吗？**
A: 不支持。PTrade 内网环境，只能使用内置第三方库。

**Q: 策略多久执行一次？**
A: 取决于运行周期：日线每天一次，分钟线每分钟一次，tick 每笔成交一次。

**Q: Mac/Linux 能用吗？**
A: 策略编辑需要 Windows 客户端（或在虚拟机上），但策略运行在券商机房，Mac 用户用虚拟机编辑后即可。

**Q: 模拟盘和实盘有什么区别？**
A: 交易逻辑相同，但实盘有流动性限制和滑点，模拟盘成交率 100%。实盘前务必模拟盘充分验证。
