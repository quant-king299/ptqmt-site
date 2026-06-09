# PTrade 完整API参考手册

> **来源**: 恒生PTrade平台官方文档与实战经验  
> **平台**: PTrade 量化交易平台  
> **更新时间**: 2024年11月

本文档提供PTrade平台的完整API参考，包括平台特性、策略生命周期、数据获取、交易执行、账户管理等所有核心功能。

## 快速了解PTrade

PTrade是恒生电子开发的托管型量化交易平台，以其高稳定性和无需维护本地服务器的特点被广泛使用。

### 平台特性

**运行模式**：托管在券商机房，无需维护本地服务器或云服务器
- 稳定性高于QMT，属于内网托管模式
- 策略每天自动运行，无需人工干预
- 如需停止，仅需在PTrade界面点击"停止"按钮

**开发环境**：Windows系统编辑
- 支持虚拟机上安装运行
- MacOS/Linux用户可先安装虚拟机，将PTrade安装在虚拟机上
- 虚拟机可退出，策略继续在券商机房运行

**开发便利性**
- 提供内置量化工具，无需编程也可运行基础策略
- 工具包括：ETF趋势交易、网格交易、大股东增持策略、拐点交易、盘口扫单、篮子交易、追涨停、可转债套利等

### 支持的交易品种（回测）

1. 普通股票买卖 - 单位：股
2. 可转债买卖 - 单位：张，T+0交易
3. 融资融券担保品买卖 - 单位：股
4. 期货投机类型交易 - 单位：手，T+0
5. LOF基金买卖 - 单位：股
6. ETF基金买卖 - 单位：股

### 支持的交易品种（实盘）

1. 普通股票买卖 - 单位：股
2. 可转债买卖 - 单位：由券商决定，T+0
3. 融资融券交易 - 单位：股
4. ETF申赎套利 - 单位：份
5. 国债逆回购 - 单位：份
6. 期货投机类型交易 - 单位：手，T+0
7. LOF基金买卖 - 单位：股
8. ETF基金买卖 - 单位：股

### 行情数据特点

- **最小粒度**：3秒（tick级别）
- **委托档位**：默认十档行情
- **数据频率**：支持日线、分钟线、tick级别数据

### 内外网限制

- **内网环境**：PTrade处于内网，无法直接连接互联网
- **第三方库**：仅支持内置第三方库，无法通过pip安装第三方库
- **突破方案**：少数券商支持PTrade连接外网，可通过HTTP接口传输数据

### 常见问题速览

**Q: PTrade与QMT的主要区别？**

A: PTrade由恒生电子开发，托管在券商机房；QMT为本地运行。PTrade稳定性更高，无需维护服务器，但功能可能不如QMT全面。

**Q: 如何在MacOS/Linux上使用PTrade？**

A: PTrade仅支持Windows环境。MacOS/Linux用户需先安装虚拟机，在虚拟机上安装Windows和PTrade，之后可退出虚拟机，策略仍在券商机房运行。

**Q: 是否有资金门槛？**

A: 因为是券商采购提供，会有一定资金要求门槛，具体要求因券商而异。可扫描公众号二维码咨询相关券商。

---

## 目录

- [1. 基础概念](#1-基础概念)
- [2. 策略生命周期](#2-策略生命周期)
- [3. 基础配置API](#3-基础配置api)
- [4. 数据获取API](#4-数据获取api)
- [5. 交易执行API](#5-交易执行api)
- [6. 账户管理API](#6-账户管理api)
- [7. 查询函数](#7-查询函数)
- [8. 融资融券API](#8-融资融券api)
- [9. 期货交易API](#9-期货交易api)
- [10. 期权交易API](#10-期权交易api)
- [11. 港股通API](#11-港股通api)
- [12. 技术指标API](#12-技术指标api)
- [13. 常见用法示例](#13-常见用法示例)
- [14. 常见问题](#14-常见问题)
- [15. 相关资源](#15-相关资源)

---

## 1. 基础概念

### 持久化处理

由于托管在券商机房，PTrade处于内网环境，无法连接互联网。PTrade内部无法通过python的pip安装第三方库，仅允许使用内置的第三方库。

但某些券商的PTrade支持连接外网功能，可通过HTTP接口方式与PTrade进行数据传输。可以实时将数据传输给PTrade执行下单，有效解决PTrade缺乏某些因子数据的问题。

#### 框架持久化机制

框架会在以下事件后自动触发持久化：
- `before_trading_start`之后（隔日开始）
- `handle_data`之后
- `after_trading_end`之后

使用pickle模块保存股票池、账户信息、订单信息、全局变量g等内容。

#### 持久化注意事项

1. **变量恢复顺序**：券商升级/环境重启后恢复交易时，框架先执行`initialize`，再执行持久化信息恢复
2. **变量覆盖**：持久化信息中的变量会覆盖`initialize`中的同名变量
3. **不可序列化对象**：全局变量g中不能被序列化的对象（如文件、实例化类对象）将不会被保存
4. **私有变量**：名字以`__`开头的变量被视为私有变量，不会被持久化，可在`initialize`中初始化

#### 自定义持久化示例

```python
import pickle
from collections import defaultdict

NOTEBOOK_PATH = '/home/fly/notebook/'

def initialize(context):
    # 尝试从pickle文件恢复
    try:
        with open(NOTEBOOK_PATH+'hold_days.pkl','rb') as f:
            g.hold_days = pickle.load(f)
    except:
        g.hold_days = defaultdict(list)
    
    g.security = '600570.SS'
    set_universe(g.security)

def before_trading_start(context, data):
    # 仓龄增加一天
    if g.hold_days:
        g.hold_days[g.security] += 1

def handle_data(context, data):
    # 下单逻辑
    if g.security not in list(context.portfolio.positions.keys()):
        order(g.security, 100)
        g.hold_days[g.security] = 1
    
    # 卖出条件
    if g.hold_days.get(g.security, 0) > 5:
        order(g.security, -100)
        del g.hold_days[g.security]
    
    # 持久化保存
    with open(NOTEBOOK_PATH+'hold_days.pkl','wb') as f:
        pickle.dump(g.hold_days, f, -1)
```

---

## 2. 策略生命周期

### 事件驱动模型

PTrade量化引擎以事件触发为基础，通过以下事件完成每个交易日的策略任务：

| 事件 | 说明 | 必需 | 备注 |
|------|------|------|------|
| `initialize` | 初始化事件 | ✓ | 在回测/交易启动时执行一次 |
| `before_trading_start` | 盘前事件 | - | 每天交易前执行一次 |
| `handle_data` | 盘中事件 | ✓ | 按周期频率运行（日/分钟） |
| `tick_data` | Tick事件 | - | 每3秒执行一次（交易模式） |
| `after_trading_end` | 盘后事件 | - | 每天交易结束执行一次 |
| `on_order_response` | 委托主推 | - | 委托状态变化时触发（交易模式） |
| `on_trade_response` | 成交主推 | - | 成交时触发（交易模式） |

### 回测周期与运行时间

#### 日线级别 (Daily)
- **频率**：每天运行一次
- **执行时间**：每天盘后 (15:00)
- **handle_data调用**：1次/天

#### 分钟级别 (Minute)
- **频率**：每分钟运行一次
- **执行时间**：9:31~15:00（回测）/ 9:30~14:59（交易）
- **handle_data调用**：N次/天

#### Tick级别（仅交易模式）
- **频率**：每3秒运行一次
- **执行时间**：9:30~14:59
- **使用函数**：`tick_data()` 或 `run_interval()`

### 交易时间分段

#### 盘前运行 (Pre-Market)
- **时间**：9:30前
- **支持函数**：`before_trading_start()`、`run_daily()`指定time
- **注意**：9:10前开启交易时，实时行情可能未更新，建议sleep或使用run_daily

#### 盘中运行 (Trading Hours)
- **回测**：9:31~15:00（日线）/ 9:31~15:00（分钟）
- **交易**：9:30~15:00（日线）/ 9:30~14:59（分钟）
- **支持函数**：`handle_data()`、`tick_data()`、`run_daily()`、`run_interval()`

#### 盘后运行 (Post-Market)
- **时间**：15:30（定时）或15:00之后（run_daily指定time）
- **支持函数**：`after_trading_end()`（15:30执行）、`run_daily()`

---

## 3. 基础配置API

### 3.1 策略初始化函数

#### initialize()

策略初始化函数

**使用场景**：回测、交易模式下必需

**语法**：
```python
def initialize(context):
    pass
```

**描述**：
- 策略启动时（回测/交易）执行一次
- 用于初始化全局变量`g`、设置股票池、配置基准等
- 是策略的必需函数之一

**可调用接口**：
set_universe、set_benchmark、set_commission、set_fixed_slippage、set_slippage、set_volume_ratio、set_limit_mode、set_yesterday_position、run_daily、run_interval、get_trading_day、convert_position_from_csv、get_user_name、is_trade、set_future_commission、set_margin_rate、get_margin_rate、create_dir

**示例**：
```python
def initialize(context):
    g.security = '600570.SS'
    set_universe(g.security)
    set_benchmark('000300.SS')
    set_commission(0.0003)
    run_daily(context, get_finance, time='9:31')
```

#### before_trading_start()

盘前处理函数（可选）

**语法**：
```python
def before_trading_start(context, data):
    pass
```

**描述**：
- 每天交易前被调用一次
- 回测中在8:30执行；交易中在开启时立即执行，后续每天9:10执行（默认）
- 用于每日初始化信息

**注意事项**：
- 9:10前调用实时行情接口可能获取过期数据，建议sleep或改用run_daily

**可调用接口**：
set_universe、get_Ashares、set_yesterday_position、get_stock_info、get_index_stocks、get_fundamentals、get_trading_day、get_all_trades_days、get_trade_days、get_history、get_price、get_individual_entrust、get_individual_transcation、get_stock_name、get_stock_status、get_stock_exrights、get_stock_blocks、get_etf_list、get_industry_stocks、get_user_name、get_cb_list、get_deliver、get_fundjour、get_market_list、get_market_detail等

**示例**：
```python
def before_trading_start(context, data):
    fin = get_fundamentals(g.security, 'balance_statement', 'total_assets')
    log.info(fin)
```

#### handle_data()

盘中处理函数（必需）

**语法**：
```python
def handle_data(context, data):
    pass
```

**描述**：
- 交易时间内按指定周期频率运行
- 用于处理策略交易逻辑
- 是策略的必需函数之一

**注意事项**：
- 日线：每天执行一次（15:00）
- 分钟：每分钟执行一次（9:31-15:00回测，9:30-14:59交易）
- 不会在非交易日触发

**参数**：
- `context`：Context对象，包含账户及持仓信息
- `data`：dict，key为股票代码，value为SecurityUnitData对象

**示例**：
```python
def handle_data(context, data):
    # 获取历史数据
    hist = get_history('600570.SS', ['close', 'volume'], 20, '1d')
    
    # 计算移动平均
    ma = hist['close'].mean()
    current = data['600570.SS']['close']
    
    # 交易信号
    if current > ma:
        order('600570.SS', 1000, 1)  # 买入
    else:
        order_target('600570.SS', 0)  # 清仓
```

#### after_trading_end()

盘后处理函数（可选）

**语法**：
```python
def after_trading_end(context, data):
    pass
```

**描述**：
- 每天交易结束后调用一次
- 执行时间一般为15:30（由券商配置决定）
- 用于处理收盘后的操作

**示例**：
```python
def after_trading_end(context, data):
    positions = get_positions()
    log.info(f"今日持仓数: {len(positions)}")
```

#### tick_data()

Tick级别处理函数（可选，仅交易模式）

**语法**：
```python
def tick_data(context, data):
    pass
```

**描述**：
- 处理tick级别策略的交易逻辑
- 每隔3秒执行一次
- 仅在交易模块可用，回测不支持

**注意事项**：
- 执行时间为9:30-14:59
- 仅能使用`order_tick`进行下单

**data参数结构**：
```python
{
    '股票代码': {
        'order': DataFrame/None,      # 逐笔委托
        'tick': DataFrame,            # 当前tick数据
        'transcation': DataFrame/None # 逐笔成交
    }
}
```

**示例**：
```python
def tick_data(context, data):
    # 获取买一价
    bid_price = data['600570.SS']['tick']['bid_grp'][1][0]
    
    if bid_price > 38.19:
        order_tick('600570.SS', 100, 1)  # 按买一档价格下单
```

#### on_order_response()

委托主推函数（可选，仅交易模式）

**语法**：
```python
def on_order_response(context, order_list):
    pass
```

**描述**：
- 委托主推回调时响应
- 比引擎、get_order()更新速度更快
- 适合对速度要求高的策略

**参数**：
order_list为列表，每个元素为dict，包含：entrust_no、error_info、order_time、stock_code、amount、price、business_amount、status、order_id、entrust_type、entrust_prop

**注意**：
- 可接收股票、可转债、ETF、LOF、期货代码
- 接收策略外交易产生的主推时，order_id字段为""
- 需要判断处理，避免无限迭代循环

#### on_trade_response()

成交主推函数（可选，仅交易模式）

**语法**：
```python
def on_trade_response(context, trade_list):
    pass
```

**描述**：
- 成交主推回调时响应
- 比get_trades()更新速度更快

**参数**：
trade_list为列表，每个元素为dict，包含：entrust_no、business_time、stock_code、entrust_bs、business_amount、business_price、business_balance、business_id、status、order_id

### 3.2 配置函数

#### set_universe()

设置股票池

**语法**：
```python
def set_universe(symbols)
```

**参数**：
- `symbols` (str/list): 股票代码或代码列表

**描述**：
- 设置或更新策略要操作的股票池
- 用于限制get_history的默认security_list参数
- 对order等下单函数无限制

**示例**：
```python
# 设置单个股票
set_universe('600570.SS')

# 设置多个股票
set_universe(['600570.SS', '600571.SS', '000001.SZ'])
```

#### set_benchmark()

设置基准

**语法**：
```python
def set_benchmark(symbol)
```

**参数**：
- `symbol` (str): 股票/指数/ETF代码

**默认值**：沪深300 (000300.SS)

**描述**：
- 设置策略的基准指数
- 前端展现的策略评价指标基于此设置
- 仅能在initialize中调用

**示例**：
```python
set_benchmark('000001.SZ')      # 深成指
set_benchmark('000016.SS')      # 上证50
```

#### set_commission()

设置佣金费率（回测专用）

**语法**：
```python
def set_commission(commission_ratio=0.0003, min_commission=5.0, type="STOCK")
```

**参数**：
- `commission_ratio` (float): 佣金费率，默认股票0.03%，ETF/LOF 0.08%
- `min_commission` (float): 最低佣金，默认5元
- `type` (str): 交易类型，'STOCK'、'ETF'、'LOF'

**费用计算**：
```
手续费 = 佣金费 + 经手费
佣金费 = 佣金费率 * 交易总金额（若小于最低佣金，取最低佣金）
经手费 = 万分之0.487 * 交易总金额
```

**示例**：
```python
set_commission(commission_ratio=0.0003, min_commission=3.0, type="STOCK")
set_commission(commission_ratio=0.0008, type="ETF")
```

#### set_fixed_slippage()

设置固定滑点（回测专用）

**语法**：
```python
def set_fixed_slippage(fixedslippage=0.0)
```

**参数**：
- `fixedslippage` (float): 固定滑点值（元）

**描述**：
- 成交价格 = 委托价格 ± fixedslippage/2

**示例**：
```python
set_fixed_slippage(0.2)  # 买10元变10.1元，卖10元变9.9元
```

#### set_slippage()

设置百分比滑点（回测专用）

**语法**：
```python
def set_slippage(slippage=0.1)
```

**参数**：
- `slippage` (float): 滑点比例，默认0.1为0.1%

**描述**：
- 成交价格 = 委托价格 ± 委托价格 * slippage/2

**示例**：
```python
set_slippage(0.2)  # 买10元变10.01元
```

#### set_volume_ratio()

设置成交比例（回测专用）

**语法**：
```python
def set_volume_ratio(volume_ratio=0.25)
```

**参数**：
- `volume_ratio` (float): 成交比例，默认0.25

**描述**：
- 设置单笔委托的最大成交数量为本周期可成交总量的指定比例

#### set_limit_mode()

设置成交数量限制模式（回测专用）

**语法**：
```python
def set_limit_mode(limit_mode='LIMIT')
```

**参数**：
- `limit_mode` (str): 'LIMIT'（限制）或 'UNLIMITED'（不限制）

**描述**：
- 'LIMIT'：撮合成交量不能超过本周期实际成交总量
- 'UNLIMITED'：不做限制，适合月度调仓等低频策略

#### set_yesterday_position()

设置底仓（回测专用）

**语法**：
```python
def set_yesterday_position(poslist)
```

**参数**：
```python
poslist = [{
    'sid': '600570.SS',      # 股票代码
    'amount': 1000,          # 持仓数量
    'enable_amount': 600,    # 可用数量
    'cost_basis': 55.0       # 成本价
}]
```

**描述**：
- 设置回测的初始底仓
- 会在策略初始化运行时创建持仓对象

#### run_daily()

按日周期处理

**语法**：
```python
def run_daily(context, func, time='9:31')
```

**参数**：
- `context`：Context对象
- `func`：自定义函数名称（必须以context作为参数）
- `time`：指定运行时间，格式'HH:MM'

**描述**：
- 以日为单位周期性运行指定函数
- 仅在initialize中调用
- 可多次设定实现多个定时任务

**示例**：
```python
def initialize(context):
    run_daily(context, get_finance, time='9:31')
    run_daily(context, risk_control, time='14:30')

def get_finance(context):
    fin = get_fundamentals(g.security, 'balance_statement', 'total_assets')
    log.info(fin)
```

#### run_interval()

按设定周期处理（交易专用）

**语法**：
```python
def run_interval(context, func, seconds=10)
```

**参数**：
- `context`：Context对象
- `func`：自定义函数名称
- `seconds`：时间间隔（秒），最小3秒

**描述**：
- 以设定时间间隔周期性运行指定函数
- 仅在交易模块可用
- 可多次设定，以多线程并行运行

**注意**：
- 注意处理不同线程间的逻辑关联

**示例**：
```python
def initialize(context):
    run_interval(context, check_price, seconds=10)

def check_price(context):
    snapshot = get_snapshot(g.security)
    log.info(snapshot)
```

---

## 4. 数据获取API

### 4.1 历史数据获取

#### get_history()

获取历史行情（以条数指定）

**使用场景**：回测、交易模式

**语法**：
```python
def get_history(count, frequency='1d', field='close', security_list=None, fq=None, include=False, fill='nan')
```

**参数**：
- `count` (int): K线数量，大于0
- `frequency` (str): K线频率（默认'1d'）
  - '1m', '5m', '15m', '30m', '60m', '120m' - 分钟级
  - '1d', '1w'/'weekly', 'mo'/'monthly', '1q'/'quarter', '1y'/'yearly' - 日线及以上
- `field` (str/list): 返回字段（默认'close'）
  - 'open', 'high', 'low', 'close', 'volume', 'money', 'price'
  - 'preclose', 'high_limit', 'low_limit', 'unlimited'（仅日线）
- `security_list` (str/list): 股票代码（默认为Universe）
- `fq` (str): 复权方式，'pre'、'post'、'dypre'、None（默认不复权）
- `include` (bool): 是否包含当前周期（默认False）
- `fill` (str): 数据填充方式，'pre'、'nan'（仅交易）

**返回值**：
- 单股票单字段：DataFrame，索引为datetime，列为字段
- 多股票单字段：DataFrame，索引为datetime，列为股票代码
- 多股票多字段：Panel，items为字段、major_axis为datetime、minor_axis为股票代码

**示例**：
```python
# 单股票单字段
df = get_history(10, '1d', 'close', security_list='600570.SS')
log.info(df['close'][-1])

# 多股票单字段
df = get_history(5, '1d', 'close')
log.info(df['600570.SS'])

# 多股票多字段（返回Panel）
panel = get_history(2, '1d', ['open','close'])
open_df = panel['open']
```

#### get_price()

获取历史数据（指定日期范围）

**使用场景**：研究、回测、交易

**语法**：
```python
def get_price(security, start_date=None, end_date=None, frequency='1d', fields=None, fq=None, count=None)
```

**参数**：
- `security` (str/list): 股票代码或代码列表
- `start_date` (str): 开始日期，格式'YYYY-MM-DD'或'YYYYmmdd'
- `end_date` (str): 结束日期
- `frequency` (str): 数据频率，形式同get_history
- `fields` (str/list): 返回字段
- `fq` (str): 复权方式
- `count` (int): 数量（与start_date二选一）

**重要**：
- start_date与count必须且只能选择一个
- 不包含当天数据
- 周线、月线等不支持start_date和end_date组合

**示例**：
```python
# 指定范围
data = get_price('600570.SS', start_date='2024-01-01', end_date='2024-12-31')

# 指定日期前的条数
data = get_price('600570.SS', end_date='2024-12-31', count=20)

# 多股票
data = get_price(['600570.SS','600571.SS'], start_date='2024-08-01', end_date='2024-08-31')
```

### 4.2 股票信息获取

#### get_stock_name()

获取股票名称

**使用场景**：研究、回测、交易

**语法**：
```python
def get_stock_name(stocks)
```

**参数**：
- `stocks` (str/list): 股票代码或列表

**返回值**：
dict，key为股票代码，value为股票名称

**示例**：
```python
name = get_stock_name('600570.SS')
log.info(name['600570.SS'])  # 恒生电子
```

#### get_stock_info()

获取股票基础信息

**使用场景**：研究、回测、交易

**语法**：
```python
def get_stock_info(stocks, field=None)
```

**参数**：
- `stocks` (str/list): 股票代码
- `field` (str/list): 返回字段（不编时仅返回stock_name）
  - 'stock_name' - 股票名称
  - 'listed_date' - 上市日期
  - 'de_listed_date' - 退市日期

**返回值**：
dict，嵌套结构包含指定字段

**示例**：
```python
info = get_stock_info('600570.SS', ['stock_name', 'listed_date', 'de_listed_date'])
```

#### get_stock_status()

获取股票状态信息

**使用场景**：研究、回测、交易

**语法**：
```python
def get_stock_status(stocks, query_type='ST', query_date=None)
```

**参数**：
- `stocks` (str/list): 股票代码（必传）
- `query_type` (str): 查询类型（默认'ST'）
  - 'ST' - ST股票
  - 'HALT' - 停牌
  - 'DELISTING' - 退市
- `query_date` (str): 查询日期，格式YYYYmmdd

**返回值**：
dict，key为股票代码，value为True/False/None

**示例**：
```python
def handle_data(context, data):
    status = get_stock_status('600570.SS', 'ST')
    if status['600570.SS'] is not True:
        order('600570.SS', 100)
```

#### get_stock_blocks()

获取股票所属板块

**使用场景**：研究、回测、交易

**语法**：
```python
def get_stock_blocks(stock_code)
```

**返回值**：
dict，包含行业、板块等信息

**示例**：
```python
blocks = get_stock_blocks('600570.SS')
# 返回 {'HY': [...], 'GN': [...], ...}
```

#### get_stock_exrights()

获取股票除权除息信息

**使用场景**：研究、回测、交易

**语法**：
```python
def get_stock_exrights(stock_code, date=None)
```

**返回值**：
DataFrame或None

**示例**：
```python
exrights = get_stock_exrights('600570.SS')
```

#### get_index_stocks()

获取指数成分股

**使用场景**：研究、回测、交易

**语法**：
```python
def get_index_stocks(index_code, date=None)
```

**参数**：
- `index_code` (str): 指数代码，例如'000300.SS'、'000001.SZ'
- `date` (str): 日期（不编时为当前日期）

**返回值**：
list，成分股代码列表

**示例**：
```python
def initialize(context):
    securities = get_index_stocks('000300.SS')  # 沪深300成分股
    set_universe(securities)
```

#### get_fundamentals()

获取财务数据

**使用场景**：研究、回测、交易

**语法**：
```python
def get_fundamentals(symbols, report_type='annual', fields=None)
```

**参数**：
- `symbols` (str/list): 股票代码
- `report_type` (str): 报告类型，'annual'或'quarterly'
- `fields` (list): 财务指标字段

**返回值**：
DataFrame

**示例**：
```python
def before_trading_start(context, data):
    fin = get_fundamentals('600570.SS', 'annual', ['revenue', 'net_profit', 'roe'])
    log.info(fin)
```

#### get_Ashares()

获取A股列表

**使用场景**：研究、回测、交易

**返回值**：
list，A股全部代码

#### get_industry_stocks()

获取行业成员股

**使用场景**：研究、回测、交易

**语法**：
```python
def get_industry_stocks(industry_code, date=None)
```

---

## 5. 交易执行API

### 5.1 基础下单函数

#### order()

按数量买卖

**语法**：
```python
def order(security, quantity)
```

**参数**：
- `security` (str): 股票代码
- `quantity` (int): 交易数量（正数为买，负数为卖）

**返回值**：
Order对象

**描述**：
- 基础下单函数
- 直接报单到柜台

**示例**：
```python
# 买入1000股
order('600570.SS', 1000)

# 卖出500股
order('600570.SS', -500)
```

#### order_target()

指定目标数量买卖

**语法**：
```python
def order_target(security, quantity)
```

**参数**：
- `security` (str): 股票代码
- `quantity` (int): 最终持仓数量

**描述**：
- 自动调整持仓至指定数量
- 若当前持仓800股，目标1000股，则自动买入200股

**示例**：
```python
order_target('600570.SS', 1000)  # 调整至1000股
order_target('600570.SS', 0)     # 清仓
```

#### order_value()

指定投资金额买卖

**语法**：
```python
def order_value(security, value)
```

**参数**：
- `security` (str): 股票代码
- `value` (float): 投资金额

**描述**：
- 按指定金额自动计算数量并下单

**示例**：
```python
order_value('600570.SS', 100000)  # 投资10万元
```

#### order_target_value()

指定持仓市值买卖

**语法**：
```python
def order_target_value(security, value)
```

**参数**：
- `security` (str): 股票代码
- `value` (float): 目标持仓市值

**描述**：
- 调整持仓至指定市值

**示例**：
```python
order_target_value('600570.SS', 500000)  # 调整至50万市值
```

### 5.2 订单管理函数

#### cancel_order()

撤销订单

**语法**：
```python
def cancel_order(order_id)
```

**参数**：
- `order_id` (int/str): 订单ID

**返回值**：
bool

**示例**：
```python
cancel_order(123456)
```

#### get_open_orders()

获取未完成订单

**语法**：
```python
def get_open_orders(symbols=None)
```

**参数**：
- `symbols` (str/list): 股票代码（可选）

**返回值**：
DataFrame，未完成订单列表

**示例**：
```python
# 获取所有未完成订单
orders = get_open_orders()

# 获取特定股票的未完成订单
orders = get_open_orders('600570.SS')
```

#### get_orders()

获取订单历史

**语法**：
```python
def get_orders(status=None, symbols=None, start_date=None, end_date=None)
```

**参数**：
- `status` (int): 订单状态（可选）
- `symbols` (str/list): 股票代码
- `start_date` (str): 开始日期
- `end_date` (str): 结束日期

**返回值**：
DataFrame，订单历史

#### get_trades()

获取成交记录

**语法**：
```python
def get_trades(symbols=None, start_date=None, end_date=None)
```

**参数**：
- `symbols` (str/list): 股票代码
- `start_date` (str): 开始日期
- `end_date` (str): 结束日期

**返回值**：
DataFrame，成交记录

**示例**：
```python
# 获取今日成交记录
trades = get_trades(start_date='2024-11-01')

# 获取特定股票成交记录
trades = get_trades('600570.SS', '2024-08-01', '2024-11-01')
```

---

## 6. 账户管理API

### 6.1 持仓查询

#### get_position()

获取单只股票持仓

**语法**：
```python
def get_position(security)
```

**参数**：
- `security` (str): 股票代码

**返回值**：
dict，持仓信息

**示例**：
```python
pos = get_position('600570.SS')
print(f"持仓数量: {pos['amount']}")
print(f"持仓市值: {pos['value']}")
```

#### get_positions()

获取全部持仓

**语法**：
```python
def get_positions(symbols=None)
```

**参数**：
- `symbols` (str/list): 股票代码（可选）

**返回值**：
DataFrame，持仓信息

**示例**：
```python
# 获取所有持仓
positions = get_positions()

# 获取特定持仓
pos = get_positions('600570.SS')
```

---

## 7. 查询函数

### 7.1 日期相关

#### get_trading_day()

获取交易日期

**语法**：
```python
def get_trading_day(day=0)
```

**参数**：
- `day` (int): 天数偏移，0表示当前交易日，正数表示未来，负数表示过去

**返回值**：
datetime.date，交易日期

**示例**：
```python
today = get_trading_day()        # 当前交易日
tomorrow = get_trading_day(1)    # 下一个交易日
yesterday = get_trading_day(-1)  # 前一个交易日
```

#### get_trade_days()

获取交易日期范围

**语法**：
```python
def get_trade_days(start_date=None, end_date=None, count=None)
```

**参数**：
- `start_date` (str): 开始日期，与count二选一
- `end_date` (str): 结束日期
- `count` (int): 交易天数，与start_date二选一

**返回值**：
numpy.ndarray，交易日期列表

**示例**：
```python
# 指定范围
days = get_trade_days('2024-01-01', '2024-12-31')

# 指定条数
days = get_trade_days(count=100)  # 最近100个交易日
```

#### get_all_trades_days()

获取全部交易日期

**语法**：
```python
def get_all_trades_days(date=None)
```

**参数**：
- `date` (str): 指定日期之前的所有交易日

**返回值**：
numpy.ndarray，历史全部交易日期

---

## 8. 融资融券API

### 8.1 融资融券交易

#### margincash_open()

融资买入

**语法**：
```python
def margincash_open(security, quantity)
```

**参数**：
- `security` (str): 股票代码
- `quantity` (int): 融资买入数量

#### margincash_close()

卖券还款

**语法**：
```python
def margincash_close(security, quantity)
```

**参数**：
- `security` (str): 股票代码
- `quantity` (int): 卖出数量

#### marginsec_open()

融券卖出

**语法**：
```python
def marginsec_open(security, quantity)
```

#### marginsec_close()

买券还券

**语法**：
```python
def marginsec_close(security, quantity)
```

### 8.2 融资融券查询

#### get_margin_asset()

信用资产查询

**语法**：
```python
def get_margin_asset()
```

**返回值**：
dict，融资融券资产信息

**示例**：
```python
margin_info = get_margin_asset()
print(f"可融资额度: {margin_info['cash_available']}")
```

#### get_margincash_stocks()

获取融资标的

**语法**：
```python
def get_margincash_stocks()
```

**返回值**：
list，可融资股票列表

#### get_marginsec_stocks()

获取融券标的

**语法**：
```python
def get_marginsec_stocks()
```

**返回值**：
list，可融券股票列表

---

## 9. 期货交易API

正根据清单：PTrade平台支持以下期货相关函数。具体的函数签名、参数与使用示例请参考官方文档。

### 9.1 期货交易类函数

- `buy_open()` - 开多
- `sell_close()` - 多平
- `sell_open()` - 空开
- `buy_close()` - 空平

### 9.2 期货查询类函数

- `get_margin_rate()` - 获取用户设置的保证金比例
- `get_instruments()` - 获取合约信息
- `get_dominant_contract()` - 获取主力合约代码

### 9.3 期货设置类函数

- `set_future_commission()` - 设置期货手续费
- `set_margin_rate()` - 设置期货保证金比例

> **提示**: 期货交易功能的具体实现和参数请引用正式文档或联系技术支持。

---

## 10. 期权交易API

正根据清单：PTrade平台支持以下期权相关函数。具体的函数签名、参数与使用示例请参考官方文档。

### 10.1 期权查询类函数

- `get_opt_objects()` - 获取期权标的列表
- `get_opt_last_dates()` - 获取期权标的到期日列表
- `get_opt_contracts()` - 获取期权标的对应合约列表
- `get_contract_info()` - 获取期权合约信息
- `get_covered_lock_amount()` - 获取期权标的可备兵锁定数量
- `get_covered_unlock_amount()` - 获取期权标的允许备兵解锁数量

### 10.2 期权交易类函数

- `option_buy_open()` - 权利仓开仓
- `option_sell_close()` - 权利仓平仓
- `option_sell_open()` - 义务仓开仓
- `option_buy_close()` - 义务仓平仓
- `open_prepared()` - 备兵开仓
- `close_prepared()` - 备兵平仓
- `option_exercise()` - 行权

### 10.3 期权其他函数

- `option_covered_lock()` - 期权标的备兵锁定
- `option_covered_unlock()` - 期权标的备兵解锁

> **提示**: 期权交易功能的具体实现和参数请引用正式文档或联系技术支持。

---

## 11. 港股通API

正根据清单：PTrade平台支持以下港股通相关函数。具体的函数签名、参数与使用示例请参考官方文档。

### 11.1 港股通查询类函数

- `get_hks_list()` - 获取港股通代码
- `get_hks_price_gap()` - 港股通价差查询
- `get_hks_unit_amount()` - 获取港股通标的委托单位数量

### 11.2 港股通交易类函数

- `hks_order()` - 港股通买卖
- `hks_odd_lot_order()` - 港股通零股卖出

> **提示**: 港股通交易功能的具体实现和参数请引用正式文档或联系技术支持。

---

## 12. 技术指标API

PTrade平台提供了常用的技术指标计算函数。具体的函数签名、参数与使用示例请参考官方文档。

### 12.1 技术指标计算函数

- `get_MACD()` - 异同移动平均线
- `get_KDJ()` - 随机指标
- `get_RSI()` - 相对强弱指标
- `get_CCI()` - 顺势指标

> **提示**: 技术指标的具体实现和参数请引用正式文档或联系技术支持。

---

## 13. 常见用法示例

### 13.1 完整策略模板

```python
def initialize(context):
    """策略初始化"""
    set_universe(['600570.SS', '600571.SS'])
    set_benchmark('000300.SS')
    set_commission(0.0003)
    run_daily(context, risk_control, time='14:30')

def before_trading_start(context, data):
    """盘前准备"""
    log.info("盘前初始化")

def handle_data(context, data):
    """盘中处理"""
    # 获取历史数据
    hist = get_history('600570.SS', ['close', 'volume'], 20, '1d')
    
    # 计算指标
    ma = hist['close'].mean()
    current = data['600570.SS']['close']
    
    # 交易逻辑
    if current > ma * 1.01:
        order('600570.SS', 1000)
    elif current < ma:
        order_target('600570.SS', 0)

def after_trading_end(context, data):
    """盘后处理"""
    positions = get_positions()
    log.info(f"今日持仓: {len(positions)}")

def risk_control(context):
    """风险控制"""
    positions = get_positions()
    for pos in positions:
        if pos['value'] > context.portfolio.total_value * 0.1:
            order_target_value(pos['security'], 
                             context.portfolio.total_value * 0.08)
```

### 13.2 风险管理示例

```python
def risk_control(context):
    """单个持仓最大占比控制"""
    positions = get_positions()
    
    for pos in positions:
        ratio = pos['value'] / context.portfolio.total_value
        
        if ratio > 0.1:  # 超过10%，减仓至8%
            target_value = context.portfolio.total_value * 0.08
            order_target_value(pos['security'], target_value)
```

### 13.3 数据分析示例

```python
def analyze_stock(symbol):
    """股票分析"""
    # 获取一年数据
    data = get_price(symbol, start_date='2023-11-01', end_date='2024-11-01')
    
    # 计算收益率
    returns = data['close'].pct_change()
    
    # 计算关键指标
    annual_return = (data['close'].iloc[-1] / data['close'].iloc[0] - 1)
    volatility = returns.std() * (252 ** 0.5)  # 年化波动率
    sharpe = returns.mean() / returns.std() * (252 ** 0.5)  # 夏普比率
    
    return {
        'annual_return': annual_return,
        'volatility': volatility,
        'sharpe': sharpe
    }
```

---

## 14. 常见问题

**Q: 为什么实时行情无法获取？**

A: 9:10前开启交易时，实时行情可能未更新，建议sleep至9:10或改用run_daily。

**Q: 成交数据何时更新？**

A: 成交数据在委托成交后更新，基于轮询机制，非实时推送。

**Q: 是否支持批量下单？**

A: 官方不支持批量下单接口，需要循环调用单个下单函数。

**Q: 如何设置底仓？**

A: 使用set_yesterday_position()函数设置初始底仓。

**Q: 数据是否包含复权处理？**

A: 默认返回前复权数据，需要特殊处理时可手动调整。

**Q: PTrade与QMT的主要区别？**

A: 
- PTrade由恒生电子开发，托管在券商机房
- QMT为本地运行
- PTrade稳定性更高，无需维护服务器
- QMT功能可能更全面

**Q: 是否有资金门槛？**

A: PTrade由券商采购提供，会有一定资金要求，具体因券商而异。

---

## 15. 相关资源

- [PTrade官方文档](http://180.169.107.9:7766/hub/help/api)
- [量化交易最佳实践](https://quant.com)
- [Python数据分析库](https://pandas.pydata.org/)
- [技术指标参考](https://www.investopedia.com)

---

**最后更新**: 2024年11月  
**维护者**: EasyXT社区
