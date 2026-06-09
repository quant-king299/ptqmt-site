# QMT API函数完整参考手册

> 本手册提供QMT量化交易平台所有核心API函数的详细说明，包括数据获取、交易执行、策略管理等各个方面的功能接口。

## 📚 目录导航

- [1. 数据获取类API](#1-数据获取类api)
- [2. 交易执行类API](#2-交易执行类api)
- [3. 账户管理类API](#3-账户管理类api)
- [4. 策略控制类API](#4-策略控制类api)
- [5. 技术指标类API](#5-技术指标类api)
- [6. 时间处理类API](#6-时间处理类api)
- [7. 工具辅助类API](#7-工具辅助类api)

---

## 1. 数据获取类API

### 1.1 市场行情数据获取

#### 📊 获取K线历史数据 - get_market_data_ex()

**功能描述：** 获取指定品种的历史K线数据，支持多种周期和数据字段

**调用语法：**
```python
data = ContextInfo.get_market_data_ex(
    field_list=['open', 'high', 'low', 'close', 'volume'],
    stock_code=['000001.SZ'],
    period='1d',
    start_time='',
    end_time='',
    count=100,
    dividend_type='front_ratio',
    fill_data=True
)
```

**参数详解：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| field_list | list | 否 | 数据字段列表，空列表表示获取全部字段 |
| stock_code | list | 是 | 股票代码列表，如['000001.SZ', '000002.SZ'] |
| period | str | 否 | 数据周期：'1m','5m','15m','30m','1h','1d','1w','1mon' |
| start_time | str | 否 | 开始时间，格式：'20230101' 或 '20230101 09:30:00' |
| end_time | str | 否 | 结束时间，格式同上 |
| count | int | 否 | 获取数据条数，默认100 |
| dividend_type | str | 否 | 复权方式：'none','front','back','front_ratio','back_ratio' |
| fill_data | bool | 否 | 是否填充停牌数据，默认True |

**返回值：** 字典类型，键为股票代码，值为包含历史数据的DataFrame

**使用示例：**
```python
def init(ContextInfo):
    # 获取平安银行最近30天的日K数据
    data = ContextInfo.get_market_data_ex(
        field_list=['open', 'high', 'low', 'close', 'volume'],
        stock_code=['000001.SZ'],
        period='1d',
        count=30
    )
    
    if '000001.SZ' in data:
        df = data['000001.SZ']
        print(f"获取到{len(df)}条数据")
        print(f"最新收盘价：{df['close'].iloc[-1]}")
```

#### 📈 获取实时行情快照 - get_full_tick()

**功能描述：** 获取指定股票的实时逐笔行情数据

**调用语法：**
```python
tick_data = ContextInfo.get_full_tick(stock_list=['000001.SZ'])
```

**参数详解：**
- `stock_list`: 股票代码列表，支持批量获取

**返回数据字段：**
```python
{
    '000001.SZ': {
        'lastPrice': 12.50,      # 最新价
        'lastClose': 12.30,      # 昨收价
        'open': 12.35,           # 开盘价
        'high': 12.60,           # 最高价
        'low': 12.20,            # 最低价
        'volume': 1500000,       # 成交量
        'amount': 18750000.0,    # 成交额
        'time': '14:30:00',      # 时间
        'askPrice': [12.51, 12.52, 12.53, 12.54, 12.55],  # 卖价
        'askVol': [100, 200, 300, 400, 500],               # 卖量
        'bidPrice': [12.50, 12.49, 12.48, 12.47, 12.46],  # 买价
        'bidVol': [150, 250, 350, 450, 550]                # 买量
    }
}
```

**实战应用：**
```python
def handlebar(ContextInfo):
    # 获取多只股票实时行情
    stocks = ['000001.SZ', '000002.SZ', '600000.SH']
    tick_data = ContextInfo.get_full_tick(stocks)
    
    for stock in stocks:
        if stock in tick_data:
            price = tick_data[stock]['lastPrice']
            change_pct = (price / tick_data[stock]['lastClose'] - 1) * 100
            print(f"{stock}: 价格{price}, 涨跌幅{change_pct:.2f}%")
```

### 1.2 板块与行业数据

#### 🏢 获取板块成分股 - get_stock_list_in_sector()

**功能描述：** 获取指定板块内的所有股票代码

**调用语法：**
```python
stock_list = ContextInfo.get_stock_list_in_sector(sector_name, time_point=None)
```

**参数说明：**
- `sector_name`: 板块名称，如'沪深300'、'创业板'、'科创板'等
- `time_point`: 时间点，可选参数，用于获取历史某时点的成分股

**常用板块列表：**
```python
# 主要指数板块
index_sectors = [
    '沪深300', '上证50', '中证500', '创业板指',
    '科创50', '深证100', '中小板指', '上证180'
]

# 行业板块
industry_sectors = [
    '银行', '保险', '证券', '房地产', '钢铁',
    '煤炭', '有色金属', '石油石化', '电力'
]

# 概念板块
concept_sectors = [
    '新能源汽车', '人工智能', '5G概念', '芯片概念',
    '医药生物', '军工概念', '新材料', '环保概念'
]
```

**使用示例：**
```python
def init(ContextInfo):
    # 获取沪深300成分股
    hs300_stocks = ContextInfo.get_stock_list_in_sector('沪深300')
    print(f"沪深300包含{len(hs300_stocks)}只股票")
    
    # 获取新能源汽车概念股
    new_energy_stocks = ContextInfo.get_stock_list_in_sector('新能源汽车')
    
    # 设置股票池为沪深300前50只股票
    ContextInfo.set_universe(hs300_stocks[:50])
```

#### 🏭 获取行业分类数据 - get_industry()

**功能描述：** 根据行业分类标准获取相关股票

**调用语法：**
```python
industry_stocks = ContextInfo.get_industry(industry_name)
```

**行业分类体系：**
```python
# 证监会行业分类（CSRC）
csrc_industries = [
    'CSRC1采矿业', 'CSRC2制造业', 'CSRC3电力热力燃气及水生产和供应业',
    'CSRC4建筑业', 'CSRC5批发和零售业', 'CSRC6交通运输仓储和邮政业',
    'CSRC7住宿和餐饮业', 'CSRC8信息传输软件和信息技术服务业',
    'CSRC9金融业', 'CSRC10房地产业', 'CSRC11租赁和商务服务业',
    'CSRC12科学研究和技术服务业', 'CSRC13水利环境和公共设施管理业',
    'CSRC14居民服务修理和其他服务业', 'CSRC15教育',
    'CSRC16卫生和社会工作', 'CSRC17文化体育和娱乐业',
    'CSRC18综合', 'CSRC19农林牧渔业'
]

# 申万行业分类（SW）
sw_industries = [
    'SW1农林牧渔', 'SW2采掘', 'SW3化工', 'SW4钢铁', 'SW5有色金属',
    'SW6电子', 'SW7家用电器', 'SW8食品饮料', 'SW9纺织服装',
    'SW10轻工制造', 'SW11医药生物', 'SW12公用事业', 'SW13交通运输',
    'SW14房地产', 'SW15商业贸易', 'SW16休闲服务', 'SW17综合',
    'SW18建筑材料', 'SW19建筑装饰', 'SW20电气设备', 'SW21国防军工',
    'SW22计算机', 'SW23传媒', 'SW24通信', 'SW25银行', 'SW26非银金融',
    'SW27汽车', 'SW28机械设备'
]
```

### 1.3 基础数据查询

#### 📋 获取股票基本信息 - get_instrumentdetail()

**功能描述：** 获取股票的详细基本面信息

**调用语法：**
```python
detail_info = ContextInfo.get_instrumentdetail(stock_code)
```

**返回字段详解：**
```python
{
    'InstrumentID': '000001',           # 证券代码
    'InstrumentName': '平安银行',        # 证券名称
    'ExchangeID': 'SZ',                # 交易所代码
    'ProductClass': 'Stock',           # 产品类别
    'VolumeMultiple': 1,               # 合约乘数
    'PriceTick': 0.01,                 # 最小变动价位
    'CreateDate': '19910403',          # 上市日期
    'OpenDate': '19910403',            # 开始交易日期
    'ExpireDate': '20991231',          # 到期日期
    'StartDelivDate': '',              # 开始交割日期
    'EndDelivDate': '',                # 结束交割日期
    'InstLifePhase': 'Started',        # 合约生命周期状态
    'IsTrading': 1,                    # 当前是否交易
    'PositionType': 'Net',             # 持仓类型
    'PositionDateType': 'UseHistory',  # 持仓日期类型
    'LongMarginRatio': 1.0,            # 多头保证金率
    'ShortMarginRatio': 1.0,           # 空头保证金率
    'MaxMarginSideAlgorithm': 'Yes',   # 是否使用大额单边保证金算法
    'UnderlyingInstrID': '',           # 基础商品代码
    'StrikePrice': 0.0,                # 执行价
    'OptionsType': 'NotOptions',       # 期权类型
    'UnderlyingMultiple': 0.0,         # 合约基础商品乘数
    'CombinationType': 'Future',       # 组合类型
    'TotalVolumn': 19405918198,        # 总股本
    'FloatVolumn': 19405918198,        # 流通股本
    'IndustryType': 'SW25银行',        # 行业类型
    'Currency': 'CNY'                  # 币种
}
```

**实用查询函数：**
```python
def get_stock_basic_info(stock_code):
    """获取股票基础信息摘要"""
    detail = ContextInfo.get_instrumentdetail(stock_code)
    if detail:
        return {
            '股票代码': detail['InstrumentID'],
            '股票名称': detail['InstrumentName'],
            '上市日期': detail['CreateDate'],
            '总股本': detail['TotalVolumn'],
            '流通股本': detail['FloatVolumn'],
            '所属行业': detail['IndustryType'],
            '交易状态': '正常交易' if detail['IsTrading'] else '停牌'
        }
    return None

# 使用示例
def init(ContextInfo):
    info = get_stock_basic_info('000001.SZ')
    print(info)
```

#### 💰 获取财务数据相关

**获取流通股本：**
```python
float_shares = ContextInfo.get_last_volume('000001.SZ')
```

**获取总股本：**
```python
total_shares = ContextInfo.get_total_share('000001.SZ')
```

**获取换手率：**
```python
turnover_rate = ContextInfo.get_turnover_rate(
    stock_list=['000001.SZ'],
    start_time='20230101',
    end_time='20230131'
)
```

---

## 2. 交易执行类API

### 2.1 下单交易函数

#### 🛒 通用下单函数 - passorder()

**功能描述：** 执行买卖交易指令的核心函数

**调用语法：**
```python
passorder(
    opType,           # 操作类型
    orderType,        # 订单类型  
    accountid,        # 账户ID
    orderCode,        # 股票代码
    priceType,        # 价格类型
    price,            # 委托价格
    volume,           # 委托数量
    strategyName,     # 策略名称
    quickTrade,       # 是否立即下单
    userOrderId,      # 用户订单ID
    ContextInfo       # 上下文对象
)
```

**参数详细说明：**

| 参数 | 类型 | 说明 | 常用值 |
|------|------|------|--------|
| opType | int | 操作类型 | 23=普通交易, 24=信用交易 |
| orderType | int | 订单类型 | 1101=买入, 1102=卖出 |
| accountid | str | 资金账号 | 如'12345678' |
| orderCode | str | 股票代码 | 如'000001.SZ' |
| priceType | int | 价格类型 | 5=限价, 11=市价, 12=对手价 |
| price | float | 委托价格 | 具体价格或-1(市价) |
| volume | int | 委托数量 | 股数(必须是100的整数倍) |
| strategyName | str | 策略名称 | 用于区分不同策略 |
| quickTrade | int | 立即下单 | 0=K线结束后, 1=立即, 2=强制立即 |
| userOrderId | str | 用户订单ID | 自定义订单标识 |

**价格类型详解：**
```python
PRICE_TYPES = {
    5: '限价单',      # 指定价格委托
    11: '市价单',     # 市场价格委托
    12: '对手价',     # 以对手方最优价格委托
    13: '本方价',     # 以本方最优价格委托
    14: '即时成交剩余撤销',
    15: '全额成交或撤销',
    16: '五档即成剩撤'
}
```

**实用交易函数封装：**
```python
def buy_stock(stock_code, price, volume, account_id, strategy_name="默认策略"):
    """买入股票的便捷函数"""
    return passorder(
        23,              # 普通交易
        1101,            # 买入
        account_id,      # 账户
        stock_code,      # 股票代码
        5,               # 限价
        price,           # 价格
        volume,          # 数量
        strategy_name,   # 策略名
        1,               # 立即下单
        "",              # 用户订单ID
        ContextInfo      # 上下文
    )

def sell_stock(stock_code, price, volume, account_id, strategy_name="默认策略"):
    """卖出股票的便捷函数"""
    return passorder(
        23,              # 普通交易
        1102,            # 卖出
        account_id,      # 账户
        stock_code,      # 股票代码
        5,               # 限价
        price,           # 价格
        volume,          # 数量
        strategy_name,   # 策略名
        1,               # 立即下单
        "",              # 用户订单ID
        ContextInfo      # 上下文
    )

# 使用示例
def handlebar(ContextInfo):
    account = '12345678'
    
    # 限价买入平安银行
    buy_stock('000001.SZ', 12.50, 1000, account, "价值投资策略")
    
    # 市价卖出万科A
    sell_stock('000002.SZ', -1, 500, account, "止损策略")
```

#### 📊 按金额下单 - order_value()

**功能描述：** 按指定金额买入股票，自动计算股数

**调用语法：**
```python
order_value(stock_code, value, ContextInfo, account_id)
```

**参数说明：**
- `stock_code`: 股票代码
- `value`: 买入金额（元）
- `account_id`: 账户ID

**使用示例：**
```python
def handlebar(ContextInfo):
    # 用10万元买入平安银行
    order_value('000001.SZ', 100000, ContextInfo, '12345678')
    
    # 用5万元买入万科A
    order_value('000002.SZ', 50000, ContextInfo, '12345678')
```

#### 📈 按比例下单 - order_percent()

**功能描述：** 按账户总资产的百分比买入股票

**调用语法：**
```python
order_percent(stock_code, percent, ContextInfo, account_id)
```

**使用示例：**
```python
def handlebar(ContextInfo):
    # 用总资产的10%买入平安银行
    order_percent('000001.SZ', 0.1, ContextInfo, '12345678')
    
    # 用总资产的5%买入万科A  
    order_percent('000002.SZ', 0.05, ContextInfo, '12345678')
```

### 2.2 持仓管理函数

#### 📋 查询持仓信息 - get_trade_detail_data()

**功能描述：** 获取账户的详细持仓和交易信息

**调用语法：**
```python
trade_data = get_trade_detail_data(
    account_id,
    data_type,
    strategy_name=""
)
```

**数据类型说明：**
```python
DATA_TYPES = {
    'POSITION': '持仓信息',
    'ORDER': '委托信息', 
    'DEAL': '成交信息',
    'CANCEL': '撤单信息',
    'ACCOUNT': '资金信息'
}
```

**持仓信息字段：**
```python
position_fields = {
    'm_strInstrumentID': '股票代码',
    'm_strInstrumentName': '股票名称',
    'm_nVolume': '持仓数量',
    'm_dOpenPrice': '持仓成本',
    'm_dLastPrice': '最新价格',
    'm_dMarketValue': '市值',
    'm_dPositionProfit': '持仓盈亏',
    'm_dProfitRate': '盈亏比例',
    'm_nCanUseVolume': '可用数量',
    'm_nFrozenVolume': '冻结数量'
}
```

**实用查询函数：**
```python
def get_position_summary(account_id):
    """获取持仓汇总信息"""
    positions = get_trade_detail_data(account_id, 'POSITION')
    
    summary = {
        '总持仓数': len(positions),
        '总市值': sum([pos.m_dMarketValue for pos in positions]),
        '总盈亏': sum([pos.m_dPositionProfit for pos in positions]),
        '持仓明细': []
    }
    
    for pos in positions:
        detail = {
            '代码': pos.m_strInstrumentID,
            '名称': pos.m_strInstrumentName,
            '数量': pos.m_nVolume,
            '成本': pos.m_dOpenPrice,
            '现价': pos.m_dLastPrice,
            '市值': pos.m_dMarketValue,
            '盈亏': pos.m_dPositionProfit,
            '盈亏率': f"{pos.m_dProfitRate:.2%}"
        }
        summary['持仓明细'].append(detail)
    
    return summary

# 使用示例
def handlebar(ContextInfo):
    account = '12345678'
    summary = get_position_summary(account)
    print(f"当前持仓{summary['总持仓数']}只股票，总市值{summary['总市值']:.2f}元")
```

---

## 3. 账户管理类API

### 3.1 账户设置与查询

#### 🏦 设置交易账户 - set_account()

**功能描述：** 设置策略使用的交易账户

**调用语法：**
```python
ContextInfo.set_account(account_id)
```

**多账户管理：**
```python
def init(ContextInfo):
    # 设置多个账户
    accounts = ['12345678', '87654321', '11111111']
    
    for account in accounts:
        ContextInfo.set_account(account)
    
    # 保存账户列表供后续使用
    ContextInfo.accounts = accounts
```

#### 💰 获取资金信息 - get_account_info()

**功能描述：** 获取账户资金状况

**返回字段：**
```python
account_info = {
    'm_dBalance': '总资产',
    'm_dAvailable': '可用资金',
    'm_dMarketValue': '持仓市值',
    'm_dPositionProfit': '持仓盈亏',
    'm_dCloseProfit': '平仓盈亏',
    'm_dCommission': '手续费',
    'm_dFrozenCash': '冻结资金',
    'm_dFetchBalance': '可取资金'
}
```

**资金监控函数：**
```python
def monitor_account_funds(account_id):
    """监控账户资金状况"""
    account_data = get_trade_detail_data(account_id, 'ACCOUNT')
    
    if account_data:
        info = account_data[0]  # 通常只有一条记录
        
        funds_info = {
            '总资产': info.m_dBalance,
            '可用资金': info.m_dAvailable,
            '持仓市值': info.m_dMarketValue,
            '持仓盈亏': info.m_dPositionProfit,
            '资金使用率': (info.m_dMarketValue / info.m_dBalance) * 100,
            '风险等级': get_risk_level(info.m_dAvailable, info.m_dBalance)
        }
        
        return funds_info
    return None

def get_risk_level(available, total):
    """根据资金使用情况评估风险等级"""
    usage_rate = (total - available) / total
    
    if usage_rate < 0.3:
        return '低风险'
    elif usage_rate < 0.7:
        return '中风险'
    else:
        return '高风险'
```

---

## 4. 策略控制类API

### 4.1 策略生命周期管理

#### ⚙️ 初始化函数 - init()

**功能描述：** 策略启动时执行的初始化函数

**标准初始化模板：**
```python
def init(ContextInfo):
    """策略初始化函数"""
    
    # 1. 设置基本参数
    ContextInfo.set_account('12345678')  # 设置交易账户
    
    # 2. 设置回测参数
    ContextInfo.capital = 1000000        # 初始资金100万
    ContextInfo.set_commission(0.0003)   # 手续费万三
    ContextInfo.set_slippage(1, 0.01)    # 滑点1分钱
    
    # 3. 设置股票池
    stock_pool = ContextInfo.get_stock_list_in_sector('沪深300')
    ContextInfo.set_universe(stock_pool[:50])  # 选择前50只
    
    # 4. 初始化策略参数
    ContextInfo.strategy_params = {
        'ma_short': 5,      # 短期均线
        'ma_long': 20,      # 长期均线
        'position_size': 0.1,  # 单只股票仓位
        'stop_loss': 0.1,   # 止损比例
        'take_profit': 0.2  # 止盈比例
    }
    
    # 5. 初始化全局变量
    ContextInfo.positions = {}           # 持仓记录
    ContextInfo.signals = {}             # 信号记录
    ContextInfo.last_prices = {}         # 价格记录
    
    # 6. 设置定时任务
    ContextInfo.run_time("daily_check", "1nDay", "09:30:00", "SH")
    
    print("策略初始化完成")
```

#### 📊 主策略函数 - handlebar()

**功能描述：** 每个K线周期执行的主要策略逻辑

**标准策略模板：**
```python
def handlebar(ContextInfo):
    """主策略执行函数"""
    
    # 1. 获取当前时间和位置
    current_time = ContextInfo.get_bar_timetag(ContextInfo.barpos)
    current_date = timetag_to_datetime(current_time, '%Y%m%d')
    
    # 2. 只在最新K线执行交易逻辑
    if not ContextInfo.is_last_bar():
        return
    
    # 3. 获取股票池
    universe = ContextInfo.get_universe()
    
    # 4. 遍历股票池执行策略
    for stock in universe:
        try:
            # 获取历史数据
            data = ContextInfo.get_market_data_ex(
                field_list=['open', 'high', 'low', 'close', 'volume'],
                stock_code=[stock],
                period=ContextInfo.period,
                count=30
            )
            
            if stock not in data or len(data[stock]) < 20:
                continue
                
            df = data[stock]
            
            # 计算技术指标
            signals = calculate_signals(df, ContextInfo.strategy_params)
            
            # 执行交易逻辑
            execute_trading_logic(stock, signals, ContextInfo)
            
        except Exception as e:
            print(f"处理股票{stock}时出错: {str(e)}")
            continue

def calculate_signals(df, params):
    """计算交易信号"""
    signals = {}
    
    # 计算移动平均线
    df['ma_short'] = df['close'].rolling(params['ma_short']).mean()
    df['ma_long'] = df['close'].rolling(params['ma_long']).mean()
    
    # 生成买卖信号
    current_price = df['close'].iloc[-1]
    ma_short = df['ma_short'].iloc[-1]
    ma_long = df['ma_long'].iloc[-1]
    
    signals['buy'] = ma_short > ma_long and df['ma_short'].iloc[-2] <= df['ma_long'].iloc[-2]
    signals['sell'] = ma_short < ma_long and df['ma_short'].iloc[-2] >= df['ma_long'].iloc[-2]
    signals['current_price'] = current_price
    
    return signals

def execute_trading_logic(stock, signals, ContextInfo):
    """执行交易逻辑"""
    account = '12345678'  # 从ContextInfo获取账户
    
    # 获取当前持仓
    positions = get_trade_detail_data(account, 'POSITION')
    current_position = 0
    
    for pos in positions:
        if pos.m_strInstrumentID == stock:
            current_position = pos.m_nVolume
            break
    
    # 执行买入信号
    if signals['buy'] and current_position == 0:
        buy_amount = ContextInfo.capital * ContextInfo.strategy_params['position_size']
        volume = int(buy_amount / signals['current_price'] / 100) * 100  # 整百股
        if volume > 0:
            buy_stock(stock, signals['current_price'], volume, account)
    
    # 执行卖出信号
    elif signals['sell'] and current_position > 0:
        sell_stock(stock, signals['current_price'], current_position, account)
```

#### 🛑 策略停止函数 - stop()

**功能描述：** 策略停止时执行的清理函数

```python
def stop(ContextInfo):
    """策略停止时的清理工作"""
    
    # 1. 保存策略运行数据
    save_strategy_data(ContextInfo)
    
    # 2. 发送策略停止通知
    send_notification("策略已停止运行")
    
    # 3. 清理资源
    cleanup_resources(ContextInfo)
    
    print("策略已安全停止")

def save_strategy_data(ContextInfo):
    """保存策略数据"""
    import json
    from datetime import datetime
    
    data = {
        'stop_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'positions': getattr(ContextInfo, 'positions', {}),
        'signals': getattr(ContextInfo, 'signals', {}),
        'performance': calculate_performance(ContextInfo)
    }
    
    # 这里可以保存到文件或数据库
    print("策略数据已保存")
```

### 4.2 定时任务管理

#### ⏰ 设置定时器 - run_time()

**功能描述：** 设置定时执行的任务

**调用语法：**
```python
ContextInfo.run_time(function_name, period, start_time, market)
```

**时间周期格式：**
```python
TIME_PERIODS = {
    '5nSecond': '每5秒执行一次',
    '1nMinute': '每1分钟执行一次',
    '5nMinute': '每5分钟执行一次',
    '1nHour': '每1小时执行一次',
    '1nDay': '每1天执行一次',
    '500nMilliSecond': '每500毫秒执行一次'
}
```

**定时任务示例：**
```python
def init(ContextInfo):
    # 每天开盘前检查
    ContextInfo.run_time("pre_market_check", "1nDay", "09:25:00", "SH")
    
    # 每5分钟监控持仓
    ContextInfo.run_time("monitor_positions", "5nMinute", "09:30:00", "SH")
    
    # 每小时更新数据
    ContextInfo.run_time("update_data", "1nHour", "09:30:00", "SH")

def pre_market_check(ContextInfo):
    """开盘前检查"""
    print("执行开盘前检查...")
    
    # 检查账户状态
    account_status = check_account_status()
    
    # 检查股票池
    update_stock_universe(ContextInfo)
    
    # 检查风险控制
    check_risk_controls(ContextInfo)

def monitor_positions(ContextInfo):
    """监控持仓"""
    positions = get_trade_detail_data('12345678', 'POSITION')
    
    for pos in positions:
        # 检查止损止盈
        check_stop_loss_profit(pos, ContextInfo)
        
        # 检查风险敞口
        check_risk_exposure(pos, ContextInfo)

def update_data(ContextInfo):
    """更新数据"""
    # 更新股票池
    update_stock_universe(ContextInfo)
    
    # 更新技术指标
    update_technical_indicators(ContextInfo)
    
    # 更新风险参数
    update_risk_parameters(ContextInfo)
```

---

## 5. 技术指标类API

### 5.1 常用技术指标计算

#### 📈 移动平均线计算

```python
def calculate_ma(prices, period):
    """计算移动平均线"""
    if len(prices) < period:
        return None
    return sum(prices[-period:]) / period

def calculate_ema(prices, period, alpha=None):
    """计算指数移动平均线"""
    if alpha is None:
        alpha = 2 / (period + 1)
    
    ema = [prices[0]]
    for price in prices[1:]:
        ema.append(alpha * price + (1 - alpha) * ema[-1])
    
    return ema

# 使用示例
def calculate_technical_indicators(df):
    """计算技术指标"""
    close_prices = df['close'].tolist()
    
    # 移动平均线
    df['ma5'] = df['close'].rolling(5).mean()
    df['ma10'] = df['close'].rolling(10).mean()
    df['ma20'] = df['close'].rolling(20).mean()
    
    # 指数移动平均线
    df['ema12'] = df['close'].ewm(span=12).mean()
    df['ema26'] = df['close'].ewm(span=26).mean()
    
    return df
```

#### 📊 MACD指标计算

```python
def calculate_macd(df, fast=12, slow=26, signal=9):
    """计算MACD指标"""
    # 计算EMA
    ema_fast = df['close'].ewm(span=fast).mean()
    ema_slow = df['close'].ewm(span=slow).mean()
    
    # 计算MACD线
    macd_line = ema_fast - ema_slow
    
    # 计算信号线
    signal_line = macd_line.ewm(span=signal).mean()
    
    # 计算柱状图
    histogram = macd_line - signal_line
    
    return {
        'macd': macd_line,
        'signal': signal_line,
        'histogram': histogram
    }
```

#### 📉 RSI指标计算

```python
def calculate_rsi(df, period=14):
    """计算RSI指标"""
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    
    return rsi
```

#### 📊 布林带计算

```python
def calculate_bollinger_bands(df, period=20, std_dev=2):
    """计算布林带"""
    # 中轨（移动平均线）
    middle_band = df['close'].rolling(period).mean()
    
    # 标准差
    std = df['close'].rolling(period).std()
    
    # 上轨和下轨
    upper_band = middle_band + (std * std_dev)
    lower_band = middle_band - (std * std_dev)
    
    return {
        'upper': upper_band,
        'middle': middle_band,
        'lower': lower_band
    }
```

---

## 6. 时间处理类API

### 6.1 时间转换函数

#### 🕐 时间戳转换 - timetag_to_datetime()

**功能描述：** 将毫秒时间戳转换为日期时间格式

**调用语法：**
```python
datetime_str = timetag_to_datetime(timestamp, format_str)
```

**常用格式：**
```python
TIME_FORMATS = {
    '%Y-%m-%d': '2023-01-15',
    '%Y%m%d': '20230115',
    '%Y-%m-%d %H:%M:%S': '2023-01-15 14:30:00',
    '%Y%m%d %H:%M:%S': '20230115 14:30:00',
    '%H:%M:%S': '14:30:00',
    '%H%M%S': '143000'
}
```

**使用示例：**
```python
def handlebar(ContextInfo):
    # 获取当前K线时间戳
    current_timestamp = ContextInfo.get_bar_timetag(ContextInfo.barpos)
    
    # 转换为不同格式
    date_str = timetag_to_datetime(current_timestamp, '%Y-%m-%d')
    time_str = timetag_to_datetime(current_timestamp, '%H:%M:%S')
    full_str = timetag_to_datetime(current_timestamp, '%Y-%m-%d %H:%M:%S')
    
    print(f"日期: {date_str}, 时间: {time_str}, 完整: {full_str}")
```

#### 📅 获取交易日历

```python
def get_trading_calendar(start_date, end_date):
    """获取交易日历"""
    trading_dates = get_trading_dates(start_date, end_date)
    
    calendar_info = {
        'total_days': len(trading_dates),
        'trading_dates': trading_dates,
        'start_date': start_date,
        'end_date': end_date
    }
    
    return calendar_info

def is_trading_day(date_str):
    """判断是否为交易日"""
    trading_dates = get_trading_dates(date_str, date_str)
    return len(trading_dates) > 0

# 使用示例
def init(ContextInfo):
    # 获取最近30个交易日
    import datetime
    end_date = datetime.datetime.now().strftime('%Y%m%d')
    start_date = (datetime.datetime.now() - datetime.timedelta(days=45)).strftime('%Y%m%d')
    
    calendar = get_trading_calendar(start_date, end_date)
    print(f"最近45天内有{calendar['total_days']}个交易日")
```

---

## 7. 工具辅助类API

### 7.1 数据处理工具

#### 🔧 数据清洗函数

```python
def clean_market_data(data):
    """清洗市场数据"""
    cleaned_data = {}
    
    for stock, df in data.items():
        if df is None or len(df) == 0:
            continue
            
        # 去除异常数据
        df = df[df['volume'] > 0]  # 去除成交量为0的数据
        df = df[df['high'] >= df['low']]  # 去除高价低于低价的异常数据
        df = df[df['close'] > 0]  # 去除价格为0的数据
        
        # 填充缺失数据
        df = df.fillna(method='ffill')  # 前向填充
        
        cleaned_data[stock] = df
    
    return cleaned_data

def calculate_returns(prices):
    """计算收益率"""
    if len(prices) < 2:
        return []
    
    returns = []
    for i in range(1, len(prices)):
        ret = (prices[i] - prices[i-1]) / prices[i-1]
        returns.append(ret)
    
    return returns

def calculate_volatility(returns, period=252):
    """计算波动率"""
    import math
    
    if len(returns) < 2:
        return 0
    
    # 计算标准差
    mean_return = sum(returns) / len(returns)
    variance = sum([(r - mean_return) ** 2 for r in returns]) / (len(returns) - 1)
    volatility = math.sqrt(variance * period)  # 年化波动率
    
    return volatility
```

#### 📊 性能分析工具

```python
def calculate_performance_metrics(ContextInfo):
    """计算策略性能指标"""
    # 获取净值数据
    net_values = []
    for i in range(ContextInfo.barpos + 1):
        nv = ContextInfo.get_net_value(i)
        if nv > 0:
            net_values.append(nv)
    
    if len(net_values) < 2:
        return {}
    
    # 计算收益率
    returns = calculate_returns(net_values)
    
    # 计算性能指标
    total_return = (net_values[-1] - net_values[0]) / net_values[0]
    annual_return = (1 + total_return) ** (252 / len(net_values)) - 1
    volatility = calculate_volatility(returns)
    
    # 计算最大回撤
    max_drawdown = calculate_max_drawdown(net_values)
    
    # 计算夏普比率
    risk_free_rate = 0.03  # 假设无风险利率3%
    sharpe_ratio = (annual_return - risk_free_rate) / volatility if volatility > 0 else 0
    
    metrics = {
        '总收益率': f"{total_return:.2%}",
        '年化收益率': f"{annual_return:.2%}",
        '年化波动率': f"{volatility:.2%}",
        '最大回撤': f"{max_drawdown:.2%}",
        '夏普比率': f"{sharpe_ratio:.2f}",
        '交易天数': len(net_values)
    }
    
    return metrics

def calculate_max_drawdown(net_values):
    """计算最大回撤"""
    max_drawdown = 0
    peak = net_values[0]
    
    for value in net_values:
        if value > peak:
            peak = value
        
        drawdown = (peak - value) / peak
        if drawdown > max_drawdown:
            max_drawdown = drawdown
    
    return max_drawdown
```

### 7.2 风险控制工具

#### ⚠️ 风险监控函数

```python
def check_risk_limits(ContextInfo):
    """检查风险限制"""
    account = '12345678'
    
    # 获取账户信息
    account_data = get_trade_detail_data(account, 'ACCOUNT')
    positions = get_trade_detail_data(account, 'POSITION')
    
    if not account_data:
        return
    
    account_info = account_data[0]
    total_assets = account_info.m_dBalance
    
    risk_alerts = []
    
    # 1. 检查总仓位
    total_position_value = sum([pos.m_dMarketValue for pos in positions])
    position_ratio = total_position_value / total_assets
    
    if position_ratio > 0.95:
        risk_alerts.append(f"总仓位过高: {position_ratio:.1%}")
    
    # 2. 检查单只股票仓位
    for pos in positions:
        single_ratio = pos.m_dMarketValue / total_assets
        if single_ratio > 0.2:
            risk_alerts.append(f"{pos.m_strInstrumentName}仓位过高: {single_ratio:.1%}")
    
    # 3. 检查止损
    for pos in positions:
        loss_ratio = pos.m_dPositionProfit / pos.m_dMarketValue
        if loss_ratio < -0.1:  # 单只股票亏损超过10%
            risk_alerts.append(f"{pos.m_strInstrumentName}亏损过大: {loss_ratio:.1%}")
    
    # 4. 发送风险提醒
    if risk_alerts:
        send_risk_alert(risk_alerts)
    
    return risk_alerts

def send_risk_alert(alerts):
    """发送风险提醒"""
    alert_msg = "风险提醒:\n" + "\n".join(alerts)
    print(alert_msg)
    
    # 这里可以添加邮件、短信等通知方式
    # send_email(alert_msg)
    # send_sms(alert_msg)
```

---

## 📝 使用建议与最佳实践

### 1. 策略开发流程

```python
# 标准策略开发模板
def init(ContextInfo):
    """1. 策略初始化"""
    # 设置基本参数
    setup_basic_parameters(ContextInfo)
    
    # 设置股票池
    setup_stock_universe(ContextInfo)
    
    # 初始化策略变量
    initialize_strategy_variables(ContextInfo)

def handlebar(ContextInfo):
    """2. 主策略逻辑"""
    # 数据获取与处理
    data = get_and_process_data(ContextInfo)
    
    # 信号生成
    signals = generate_signals(data, ContextInfo)
    
    # 风险控制
    if not check_risk_controls(ContextInfo):
        return
    
    # 执行交易
    execute_trades(signals, ContextInfo)

def stop(ContextInfo):
    """3. 策略清理"""
    cleanup_and_save(ContextInfo)
```

### 2. 性能优化建议

- **数据获取优化**: 批量获取数据，避免频繁调用API
- **计算优化**: 缓存计算结果，避免重复计算
- **内存管理**: 及时清理不需要的数据
- **异常处理**: 添加完善的异常处理机制

### 3. 风险管理要点

- **仓位控制**: 严格控制单只股票和总仓位
- **止损止盈**: 设置合理的止损止盈点
- **分散投资**: 避免过度集中投资
- **实时监控**: 建立完善的风险监控体系

---

## 🔗 相关链接

- [QMT官方文档](https://dict.thinktrader.net)
- [策略示例库](./Chapter-08.md)
- [常见问题解答](./Chapter-14.md)
- [技术分析指标](./Chapter-15.md)

---

*本手册持续更新中，如有问题请联系技术支持。*
