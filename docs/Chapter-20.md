# 实际案例与最佳实践

> 本章节通过具体的策略案例，展示QMT和PTrade在实际量化交易中的应用，提供可直接使用的策略模板和最佳实践指导。

## 📋 目录导航

- [1. 经典策略案例](#1-经典策略案例)
- [2. 高级策略实现](#2-高级策略实现)
- [3. 风险管理实践](#3-风险管理实践)
- [4. 性能优化案例](#4-性能优化案例)
- [5. 实盘交易经验](#5-实盘交易经验)
- [6. 策略评估方法](#6-策略评估方法)

---

## 1. 经典策略案例

### 1.1 双均线策略（完整版）

这是最经典的趋势跟踪策略，通过短期和长期均线的交叉来判断买卖时机。

```python
class DualMovingAverageStrategy:
    """双均线策略完整实现"""
    
    def __init__(self):
        self.name = "双均线策略"
        self.version = "2.0"
        
        # 策略参数
        self.short_window = 5      # 短期均线周期
        self.long_window = 20      # 长期均线周期
        self.position_size = 0.95  # 仓位大小
        
        # 风控参数
        self.stop_loss = 0.08      # 止损8%
        self.take_profit = 0.15    # 止盈15%
        self.max_positions = 5     # 最大持仓数
        
        # 运行时变量
        self.positions = {}
        self.signals_history = {}
        self.performance_metrics = {}

def init(ContextInfo):
    """策略初始化"""
    # 创建策略实例
    ContextInfo.strategy = DualMovingAverageStrategy()
    
    # 设置交易账户
    ContextInfo.set_account('你的账户ID')
    
    # 设置股票池 - 选择流动性好的大盘股
    stock_pool = [
        '000001.SZ', '000002.SZ', '000858.SZ', '000725.SZ',
        '600000.SH', '600036.SH', '600519.SH', '600887.SH',
        '000858.SZ', '002415.SZ', '300059.SZ', '300750.SZ'
    ]
    ContextInfo.set_universe(stock_pool)
    
    # 设置基准
    ContextInfo.set_benchmark('000300.SH')  # 沪深300
    
    # 设置手续费
    ContextInfo.set_order_cost(OrderCostType.by_money, cost=0.0003, min_cost=5)
    
    print(f"策略初始化完成: {ContextInfo.strategy.name} v{ContextInfo.strategy.version}")
    print(f"股票池数量: {len(stock_pool)}")

def handlebar(ContextInfo):
    """主策略逻辑"""
    
    # 只在最新K线执行
    if not ContextInfo.is_last_bar():
        return
    
    strategy = ContextInfo.strategy
    current_time = ContextInfo.get_bar_timetag(ContextInfo.barpos)
    
    # 获取当前股票池
    universe = ContextInfo.get_universe()
    
    for stock in universe:
        try:
            # 获取历史数据
            data = ContextInfo.get_market_data_ex(
                field_list=['open', 'high', 'low', 'close', 'volume'],
                stock_code=[stock],
                period='1d',
                count=max(strategy.long_window + 5, 30),
                dividend_type='front_ratio'
            )
            
            if stock not in data or len(data[stock]) < strategy.long_window:
                continue
                
            df = data[stock]
            
            # 计算技术指标
            signals = calculate_trading_signals(df, strategy)
            
            # 执行交易逻辑
            execute_trading_decision(stock, signals, ContextInfo)
            
        except Exception as e:
            print(f"处理股票 {stock} 时出错: {str(e)}")
            continue

def calculate_trading_signals(df, strategy):
    """计算交易信号"""
    
    # 计算移动平均线
    df['ma_short'] = df['close'].rolling(window=strategy.short_window).mean()
    df['ma_long'] = df['close'].rolling(window=strategy.long_window).mean()
    
    # 计算信号
    current_short = df['ma_short'].iloc[-1]
    current_long = df['ma_long'].iloc[-1]
    prev_short = df['ma_short'].iloc[-2]
    prev_long = df['ma_long'].iloc[-2]
    
    current_price = df['close'].iloc[-1]
    current_volume = df['volume'].iloc[-1]
    avg_volume = df['volume'].rolling(20).mean().iloc[-1]
    
    # 生成信号
    signals = {
        'golden_cross': current_short > current_long and prev_short <= prev_long,
        'death_cross': current_short < current_long and prev_short >= prev_long,
        'trend_up': current_short > current_long,
        'trend_down': current_short < current_long,
        'volume_confirm': current_volume > avg_volume * 1.2,  # 成交量放大确认
        'price': current_price,
        'ma_short': current_short,
        'ma_long': current_long
    }
    
    # 计算信号强度
    if signals['golden_cross'] and signals['volume_confirm']:
        signals['strength'] = 1.0  # 强买入
    elif signals['golden_cross']:
        signals['strength'] = 0.7  # 一般买入
    elif signals['death_cross'] and signals['volume_confirm']:
        signals['strength'] = -1.0  # 强卖出
    elif signals['death_cross']:
        signals['strength'] = -0.7  # 一般卖出
    else:
        signals['strength'] = 0.0  # 无信号
    
    return signals

def execute_trading_decision(stock, signals, ContextInfo):
    """执行交易决策"""
    
    strategy = ContextInfo.strategy
    account_id = ContextInfo.get_account()
    
    # 获取当前持仓
    current_positions = get_trade_detail_data(account_id, 'POSITION')
    position_count = len([p for p in current_positions if p.m_nVolume > 0])
    
    # 检查是否已持有该股票
    has_position = any(p.m_strInstrumentID == stock and p.m_nVolume > 0 
                      for p in current_positions)
    
    # 买入逻辑
    if signals['strength'] > 0.5 and not has_position:
        if position_count < strategy.max_positions:
            # 计算买入金额
            account_info = get_trade_detail_data(account_id, 'ACCOUNT')[0]
            available_cash = account_info.m_dAvailable
            
            # 每只股票分配相等资金
            target_value = available_cash * strategy.position_size / strategy.max_positions
            target_shares = int(target_value / signals['price'] / 100) * 100  # 整手
            
            if target_shares >= 100:  # 至少一手
                # 执行买入
                order_id = passorder(
                    23,           # 普通交易
                    1101,         # 买入
                    account_id,   # 账户
                    stock,        # 股票代码
                    5,            # 限价
                    signals['price'] * 1.01,  # 稍高于当前价格
                    target_shares,  # 数量
                    strategy.name,  # 策略名
                    1,            # 立即下单
                    "",           # 用户订单ID
                    ContextInfo
                )
                
                # 记录买入信息
                strategy.positions[stock] = {
                    'entry_price': signals['price'],
                    'entry_time': ContextInfo.get_bar_timetag(ContextInfo.barpos),
                    'shares': target_shares,
                    'stop_loss_price': signals['price'] * (1 - strategy.stop_loss),
                    'take_profit_price': signals['price'] * (1 + strategy.take_profit)
                }
                
                print(f"买入信号: {stock}, 价格: {signals['price']:.2f}, 数量: {target_shares}")
    
    # 卖出逻辑
    elif has_position:
        position_info = next(p for p in current_positions 
                           if p.m_strInstrumentID == stock and p.m_nVolume > 0)
        
        current_price = signals['price']
        entry_price = strategy.positions.get(stock, {}).get('entry_price', position_info.m_dOpenPrice)
        
        # 止损止盈检查
        should_sell = False
        sell_reason = ""
        
        if signals['strength'] < -0.5:
            should_sell = True
            sell_reason = "技术信号卖出"
        elif current_price <= entry_price * (1 - strategy.stop_loss):
            should_sell = True
            sell_reason = "止损卖出"
        elif current_price >= entry_price * (1 + strategy.take_profit):
            should_sell = True
            sell_reason = "止盈卖出"
        
        if should_sell:
            # 执行卖出
            order_id = passorder(
                23,           # 普通交易
                1102,         # 卖出
                account_id,   # 账户
                stock,        # 股票代码
                5,            # 限价
                current_price * 0.99,  # 稍低于当前价格
                position_info.m_nVolume,  # 全部卖出
                strategy.name,  # 策略名
                1,            # 立即下单
                "",           # 用户订单ID
                ContextInfo
            )
            
            # 计算收益
            if stock in strategy.positions:
                profit_loss = (current_price - entry_price) / entry_price
                print(f"{sell_reason}: {stock}, 买入价: {entry_price:.2f}, "
                      f"卖出价: {current_price:.2f}, 收益率: {profit_loss:.2%}")
                
                # 清除持仓记录
                del strategy.positions[stock]

# 策略评估函数
def evaluate_strategy_performance(ContextInfo):
    """评估策略表现"""
    
    strategy = ContextInfo.strategy
    account_id = ContextInfo.get_account()
    
    # 获取账户信息
    account_info = get_trade_detail_data(account_id, 'ACCOUNT')[0]
    current_value = account_info.m_dBalance
    
    # 计算基本指标
    total_return = (current_value - 1000000) / 1000000  # 假设初始资金100万
    
    # 获取成交记录
    deals = get_trade_detail_data(account_id, 'DEAL')
    
    if deals:
        # 计算胜率
        profitable_trades = sum(1 for deal in deals if deal.m_dProfit > 0)
        total_trades = len(deals)
        win_rate = profitable_trades / total_trades if total_trades > 0 else 0
        
        # 计算平均收益
        avg_profit = sum(deal.m_dProfit for deal in deals) / total_trades if total_trades > 0 else 0
        
        print(f"策略表现评估:")
        print(f"总收益率: {total_return:.2%}")
        print(f"交易次数: {total_trades}")
        print(f"胜率: {win_rate:.2%}")
        print(f"平均每笔收益: {avg_profit:.2f}")
    
    return {
        'total_return': total_return,
        'current_value': current_value,
        'positions': len(strategy.positions)
    }
```

### 1.2 均值回归策略

基于布林带的均值回归策略，适合震荡市场。

```python
class MeanReversionStrategy:
    """均值回归策略"""
    
    def __init__(self):
        self.name = "布林带均值回归"
        self.bb_period = 20        # 布林带周期
        self.bb_std = 2.0          # 标准差倍数
        self.rsi_period = 14       # RSI周期
        self.position_size = 0.1   # 单只股票仓位
        
        # 信号阈值
        self.oversold_threshold = 30    # RSI超卖阈值
        self.overbought_threshold = 70  # RSI超买阈值

def calculate_bollinger_bands(prices, period=20, std_dev=2):
    """计算布林带"""
    ma = prices.rolling(window=period).mean()
    std = prices.rolling(window=period).std()
    
    upper_band = ma + (std * std_dev)
    lower_band = ma - (std * std_dev)
    
    return upper_band, ma, lower_band

def calculate_rsi(prices, period=14):
    """计算RSI指标"""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def mean_reversion_signals(df, strategy):
    """生成均值回归信号"""
    
    close = df['close']
    
    # 计算技术指标
    upper_bb, middle_bb, lower_bb = calculate_bollinger_bands(close, strategy.bb_period, strategy.bb_std)
    rsi = calculate_rsi(close, strategy.rsi_period)
    
    current_price = close.iloc[-1]
    current_rsi = rsi.iloc[-1]
    current_upper = upper_bb.iloc[-1]
    current_lower = lower_bb.iloc[-1]
    current_middle = middle_bb.iloc[-1]
    
    signals = {
        'price': current_price,
        'upper_bb': current_upper,
        'lower_bb': current_lower,
        'middle_bb': current_middle,
        'rsi': current_rsi,
        'buy_signal': False,
        'sell_signal': False,
        'strength': 0
    }
    
    # 买入信号：价格触及下轨且RSI超卖
    if current_price <= current_lower and current_rsi <= strategy.oversold_threshold:
        signals['buy_signal'] = True
        signals['strength'] = 1.0
        
    # 卖出信号：价格触及上轨且RSI超买
    elif current_price >= current_upper and current_rsi >= strategy.overbought_threshold:
        signals['sell_signal'] = True
        signals['strength'] = -1.0
        
    # 中性信号：价格回归中轨
    elif abs(current_price - current_middle) / current_middle < 0.02:
        signals['strength'] = 0
    
    return signals

# 在主策略中使用
def handlebar_mean_reversion(ContextInfo):
    """均值回归策略主函数"""
    
    if not ContextInfo.is_last_bar():
        return
    
    strategy = ContextInfo.mean_reversion_strategy
    universe = ContextInfo.get_universe()
    
    for stock in universe:
        try:
            # 获取数据
            data = ContextInfo.get_market_data_ex(
                field_list=['close', 'volume'],
                stock_code=[stock],
                period='1d',
                count=50
            )
            
            if stock not in data:
                continue
                
            df = data[stock]
            
            # 计算信号
            signals = mean_reversion_signals(df, strategy)
            
            # 执行交易
            if signals['buy_signal']:
                order_target_percent(stock, strategy.position_size)
                print(f"均值回归买入: {stock}, 价格: {signals['price']:.2f}, RSI: {signals['rsi']:.1f}")
                
            elif signals['sell_signal']:
                order_target_percent(stock, 0)
                print(f"均值回归卖出: {stock}, 价格: {signals['price']:.2f}, RSI: {signals['rsi']:.1f}")
                
        except Exception as e:
            print(f"均值回归策略处理 {stock} 出错: {str(e)}")
```

---

## 2. 高级策略实现

### 2.1 多因子选股策略

结合基本面和技术面因子的综合选股策略。

```python
class MultiFactorStrategy:
    """多因子选股策略"""
    
    def __init__(self):
        self.name = "多因子选股策略"
        
        # 因子权重配置
        self.factor_weights = {
            'momentum': 0.25,      # 动量因子
            'value': 0.25,         # 价值因子
            'quality': 0.25,       # 质量因子
            'technical': 0.25      # 技术因子
        }
        
        # 选股参数
        self.stock_count = 20      # 选股数量
        self.rebalance_freq = 20   # 调仓频率（天）
        self.position_size = 0.95  # 总仓位
        
        # 因子计算参数
        self.momentum_period = 20
        self.value_lookback = 252
        self.technical_period = 10

def calculate_momentum_factor(df, period=20):
    """计算动量因子"""
    returns = df['close'].pct_change()
    momentum = returns.rolling(window=period).sum()
    return momentum.iloc[-1]

def calculate_value_factor(stock_code, current_price):
    """计算价值因子（简化版）"""
    try:
        # 获取基本面数据（这里用模拟数据）
        # 实际应用中需要接入基本面数据源
        pe_ratio = 15.0  # 市盈率
        pb_ratio = 2.0   # 市净率
        
        # 价值评分（PE和PB越低越好）
        value_score = 1 / pe_ratio + 1 / pb_ratio
        return value_score
        
    except:
        return 0

def calculate_quality_factor(stock_code):
    """计算质量因子（简化版）"""
    try:
        # 模拟质量指标
        roe = 0.15      # 净资产收益率
        debt_ratio = 0.3  # 资产负债率
        
        # 质量评分
        quality_score = roe * (1 - debt_ratio)
        return quality_score
        
    except:
        return 0

def calculate_technical_factor(df, period=10):
    """计算技术因子"""
    try:
        close = df['close']
        volume = df['volume']
        
        # 计算技术指标
        rsi = calculate_rsi(close, 14).iloc[-1]
        
        # 成交量相对强度
        volume_ratio = volume.iloc[-1] / volume.rolling(period).mean().iloc[-1]
        
        # 技术评分
        technical_score = (50 - abs(rsi - 50)) / 50 + min(volume_ratio, 2) / 2
        return technical_score
        
    except:
        return 0

def calculate_composite_score(stock_code, df, strategy):
    """计算综合评分"""
    
    scores = {}
    
    # 动量因子
    scores['momentum'] = calculate_momentum_factor(df, strategy.momentum_period)
    
    # 价值因子
    current_price = df['close'].iloc[-1]
    scores['value'] = calculate_value_factor(stock_code, current_price)
    
    # 质量因子
    scores['quality'] = calculate_quality_factor(stock_code)
    
    # 技术因子
    scores['technical'] = calculate_technical_factor(df, strategy.technical_period)
    
    # 计算加权综合评分
    composite_score = sum(
        scores[factor] * strategy.factor_weights[factor]
        for factor in strategy.factor_weights
    )
    
    return composite_score, scores

def multi_factor_stock_selection(ContextInfo):
    """多因子选股"""
    
    strategy = ContextInfo.multi_factor_strategy
    
    # 获取股票池（这里使用沪深300成分股）
    stock_pool = ContextInfo.get_stock_list_in_sector('沪深300')
    
    stock_scores = {}
    
    print("开始多因子选股...")
    
    for stock in stock_pool[:100]:  # 限制处理数量以提高效率
        try:
            # 获取历史数据
            data = ContextInfo.get_market_data_ex(
                field_list=['open', 'high', 'low', 'close', 'volume'],
                stock_code=[stock],
                period='1d',
                count=60
            )
            
            if stock not in data or len(data[stock]) < 30:
                continue
                
            df = data[stock]
            
            # 计算综合评分
            composite_score, factor_scores = calculate_composite_score(stock, df, strategy)
            
            stock_scores[stock] = {
                'composite_score': composite_score,
                'factor_scores': factor_scores,
                'current_price': df['close'].iloc[-1]
            }
            
        except Exception as e:
            print(f"处理股票 {stock} 时出错: {str(e)}")
            continue
    
    # 按综合评分排序
    sorted_stocks = sorted(stock_scores.items(), 
                          key=lambda x: x[1]['composite_score'], 
                          reverse=True)
    
    # 选择前N只股票
    selected_stocks = sorted_stocks[:strategy.stock_count]
    
    print(f"选股完成，共选择 {len(selected_stocks)} 只股票:")
    for stock, info in selected_stocks[:5]:  # 显示前5只
        print(f"{stock}: 综合评分 {info['composite_score']:.4f}, "
              f"价格 {info['current_price']:.2f}")
    
    return [stock for stock, _ in selected_stocks]

def rebalance_portfolio(selected_stocks, ContextInfo):
    """调仓操作"""
    
    strategy = ContextInfo.multi_factor_strategy
    account_id = ContextInfo.get_account()
    
    # 获取当前持仓
    current_positions = get_trade_detail_data(account_id, 'POSITION')
    current_stocks = set(p.m_strInstrumentID for p in current_positions if p.m_nVolume > 0)
    
    selected_set = set(selected_stocks)
    
    # 需要卖出的股票
    to_sell = current_stocks - selected_set
    
    # 需要买入的股票
    to_buy = selected_set - current_stocks
    
    print(f"调仓操作: 卖出 {len(to_sell)} 只, 买入 {len(to_buy)} 只")
    
    # 执行卖出
    for stock in to_sell:
        order_target_percent(stock, 0)
        print(f"卖出: {stock}")
    
    # 执行买入
    target_weight = strategy.position_size / len(selected_stocks)
    for stock in to_buy:
        order_target_percent(stock, target_weight)
        print(f"买入: {stock}, 目标权重: {target_weight:.2%}")

# 主策略函数
def handlebar_multi_factor(ContextInfo):
    """多因子策略主函数"""
    
    if not ContextInfo.is_last_bar():
        return
    
    strategy = ContextInfo.multi_factor_strategy
    
    # 检查是否需要调仓
    current_bar = ContextInfo.barpos
    
    if not hasattr(strategy, 'last_rebalance'):
        strategy.last_rebalance = 0
    
    if current_bar - strategy.last_rebalance >= strategy.rebalance_freq:
        # 执行选股和调仓
        selected_stocks = multi_factor_stock_selection(ContextInfo)
        rebalance_portfolio(selected_stocks, ContextInfo)
        
        strategy.last_rebalance = current_bar
        print(f"第 {current_bar} 根K线完成调仓")
```

### 2.2 配对交易策略

基于统计套利的配对交易策略。

```python
class PairTradingStrategy:
    """配对交易策略"""
    
    def __init__(self):
        self.name = "配对交易策略"
        
        # 策略参数
        self.lookback_period = 60    # 回看周期
        self.entry_threshold = 2.0   # 开仓阈值（标准差倍数）
        self.exit_threshold = 0.5    # 平仓阈值
        self.stop_loss = 3.0         # 止损阈值
        
        # 配对股票
        self.pairs = [
            ('000001.SZ', '600036.SH'),  # 平安银行 vs 招商银行
            ('000002.SZ', '000858.SZ'),  # 万科A vs 五粮液
            ('600519.SH', '000858.SZ'),  # 茅台 vs 五粮液
        ]
        
        self.pair_positions = {}

def calculate_spread(price1, price2, method='ratio'):
    """计算价差"""
    if method == 'ratio':
        return price1 / price2
    elif method == 'difference':
        return price1 - price2
    else:
        # 对数价差
        import numpy as np
        return np.log(price1) - np.log(price2)

def calculate_zscore(spread, window=60):
    """计算Z分数"""
    mean = spread.rolling(window=window).mean()
    std = spread.rolling(window=window).std()
    zscore = (spread - mean) / std
    return zscore

def pair_trading_signals(stock1_data, stock2_data, strategy):
    """生成配对交易信号"""
    
    # 计算价差
    spread = calculate_spread(stock1_data['close'], stock2_data['close'], 'ratio')
    
    # 计算Z分数
    zscore = calculate_zscore(spread, strategy.lookback_period)
    
    current_zscore = zscore.iloc[-1]
    
    signals = {
        'zscore': current_zscore,
        'spread': spread.iloc[-1],
        'action': 'hold'
    }
    
    # 生成交易信号
    if current_zscore > strategy.entry_threshold:
        # 价差过高，做空价差（卖出股票1，买入股票2）
        signals['action'] = 'short_spread'
        signals['stock1_action'] = 'sell'
        signals['stock2_action'] = 'buy'
        
    elif current_zscore < -strategy.entry_threshold:
        # 价差过低，做多价差（买入股票1，卖出股票2）
        signals['action'] = 'long_spread'
        signals['stock1_action'] = 'buy'
        signals['stock2_action'] = 'sell'
        
    elif abs(current_zscore) < strategy.exit_threshold:
        # 价差回归，平仓
        signals['action'] = 'close'
        
    elif abs(current_zscore) > strategy.stop_loss:
        # 止损
        signals['action'] = 'stop_loss'
    
    return signals

def execute_pair_trade(pair, signals, ContextInfo):
    """执行配对交易"""
    
    stock1, stock2 = pair
    strategy = ContextInfo.pair_trading_strategy
    
    if signals['action'] in ['long_spread', 'short_spread']:
        # 开仓
        position_size = 50000  # 每只股票5万元
        
        if signals['action'] == 'long_spread':
            # 买入股票1，卖出股票2
            order_target_value(stock1, position_size)
            order_target_value(stock2, -position_size)
            
            strategy.pair_positions[pair] = {
                'type': 'long_spread',
                'entry_zscore': signals['zscore'],
                'entry_time': ContextInfo.get_bar_timetag(ContextInfo.barpos)
            }
            
            print(f"开仓做多价差: {stock1} vs {stock2}, Z分数: {signals['zscore']:.2f}")
            
        else:  # short_spread
            # 卖出股票1，买入股票2
            order_target_value(stock1, -position_size)
            order_target_value(stock2, position_size)
            
            strategy.pair_positions[pair] = {
                'type': 'short_spread',
                'entry_zscore': signals['zscore'],
                'entry_time': ContextInfo.get_bar_timetag(ContextInfo.barpos)
            }
            
            print(f"开仓做空价差: {stock1} vs {stock2}, Z分数: {signals['zscore']:.2f}")
            
    elif signals['action'] == 'close' and pair in strategy.pair_positions:
        # 平仓
        order_target_value(stock1, 0)
        order_target_value(stock2, 0)
        
        position_info = strategy.pair_positions[pair]
        profit = (signals['zscore'] - position_info['entry_zscore']) * 10000  # 简化收益计算
        
        print(f"平仓: {stock1} vs {stock2}, 入场Z分数: {position_info['entry_zscore']:.2f}, "
              f"出场Z分数: {signals['zscore']:.2f}, 预估收益: {profit:.2f}")
        
        del strategy.pair_positions[pair]
        
    elif signals['action'] == 'stop_loss' and pair in strategy.pair_positions:
        # 止损
        order_target_value(stock1, 0)
        order_target_value(stock2, 0)
        
        print(f"止损: {stock1} vs {stock2}, Z分数: {signals['zscore']:.2f}")
        del strategy.pair_positions[pair]

# 主策略函数
def handlebar_pair_trading(ContextInfo):
    """配对交易主函数"""
    
    if not ContextInfo.is_last_bar():
        return
    
    strategy = ContextInfo.pair_trading_strategy
    
    for pair in strategy.pairs:
        stock1, stock2 = pair
        
        try:
            # 获取两只股票的数据
            data1 = ContextInfo.get_market_data_ex(
                field_list=['close'],
                stock_code=[stock1],
                period='1d',
                count=strategy.lookback_period + 10
            )
            
            data2 = ContextInfo.get_market_data_ex(
                field_list=['close'],
                stock_code=[stock2],
                period='1d',
                count=strategy.lookback_period + 10
            )
            
            if stock1 not in data1 or stock2 not in data2:
                continue
                
            # 确保数据长度一致
            min_len = min(len(data1[stock1]), len(data2[stock2]))
            if min_len < strategy.lookback_period:
                continue
                
            stock1_data = data1[stock1].tail(min_len)
            stock2_data = data2[stock2].tail(min_len)
            
            # 生成交易信号
            signals = pair_trading_signals(stock1_data, stock2_data, strategy)
            
            # 执行交易
            execute_pair_trade(pair, signals, ContextInfo)
            
        except Exception as e:
            print(f"配对交易处理 {pair} 时出错: {str(e)}")
```

---

## 3. 风险管理实践

### 3.1 动态仓位管理

根据市场波动率动态调整仓位大小的风险管理策略。

```python
class DynamicPositionManager:
    """动态仓位管理器"""
    
    def __init__(self):
        self.base_position = 0.6       # 基础仓位60%
        self.max_position = 0.9        # 最大仓位90%
        self.min_position = 0.2        # 最小仓位20%
        
        self.volatility_window = 20    # 波动率计算窗口
        self.volatility_threshold = 0.02  # 波动率阈值2%
        
        self.drawdown_threshold = 0.05 # 回撤阈值5%
        self.recovery_factor = 0.8     # 恢复因子
        
    def calculate_market_volatility(self, benchmark_data):
        """计算市场波动率"""
        returns = benchmark_data['close'].pct_change().dropna()
        volatility = returns.rolling(window=self.volatility_window).std().iloc[-1]
        return volatility * (252 ** 0.5)  # 年化波动率
    
    def calculate_portfolio_drawdown(self, portfolio_values):
        """计算组合回撤"""
        peak = portfolio_values.expanding().max()
        drawdown = (portfolio_values - peak) / peak
        return drawdown.iloc[-1]
    
    def adjust_position_size(self, current_volatility, current_drawdown):
        """调整仓位大小"""
        
        # 基于波动率的调整
        if current_volatility > self.volatility_threshold * 1.5:
            volatility_factor = 0.7  # 高波动率，降低仓位
        elif current_volatility > self.volatility_threshold:
            volatility_factor = 0.85
        else:
            volatility_factor = 1.0  # 正常波动率
        
        # 基于回撤的调整
        if abs(current_drawdown) > self.drawdown_threshold:
            drawdown_factor = self.recovery_factor
        else:
            drawdown_factor = 1.0
        
        # 计算调整后的仓位
        adjusted_position = self.base_position * volatility_factor * drawdown_factor
        
        # 限制在最大最小仓位之间
        final_position = max(self.min_position, 
                           min(self.max_position, adjusted_position))
        
        return final_position, volatility_factor, drawdown_factor

def implement_dynamic_position_management(ContextInfo):
    """实施动态仓位管理"""
    
    position_manager = ContextInfo.position_manager
    
    # 获取基准数据（沪深300）
    benchmark_data = ContextInfo.get_market_data_ex(
        field_list=['close'],
        stock_code=['000300.SH'],
        period='1d',
        count=50
    )
    
    if '000300.SH' not in benchmark_data:
        return
    
    # 计算市场波动率
    market_volatility = position_manager.calculate_market_volatility(
        benchmark_data['000300.SH']
    )
    
    # 获取组合净值历史
    account_info = get_trade_detail_data(ContextInfo.get_account(), 'ACCOUNT')[0]
    current_value = account_info.m_dBalance
    
    # 模拟组合净值序列（实际应用中需要记录历史净值）
    if not hasattr(position_manager, 'portfolio_history'):
        position_manager.portfolio_history = [1000000]  # 初始资金
    
    position_manager.portfolio_history.append(current_value)
    
    # 保持最近50个净值
    if len(position_manager.portfolio_history) > 50:
        position_manager.portfolio_history = position_manager.portfolio_history[-50:]
    
    import pandas as pd
    portfolio_series = pd.Series(position_manager.portfolio_history)
    
    # 计算组合回撤
    current_drawdown = position_manager.calculate_portfolio_drawdown(portfolio_series)
    
    # 调整仓位
    target_position, vol_factor, dd_factor = position_manager.adjust_position_size(
        market_volatility, current_drawdown
    )
    
    print(f"动态仓位管理:")
    print(f"市场波动率: {market_volatility:.2%}")
    print(f"组合回撤: {current_drawdown:.2%}")
    print(f"波动率因子: {vol_factor:.2f}")
    print(f"回撤因子: {dd_factor:.2f}")
    print(f"目标仓位: {target_position:.2%}")
    
    return target_position

# 在策略中应用动态仓位管理
def handlebar_with_dynamic_position(ContextInfo):
    """带动态仓位管理的策略"""
    
    if not ContextInfo.is_last_bar():
        return
    
    # 获取动态仓位
    target_position = implement_dynamic_position_management(ContextInfo)
    
    # 获取当前持仓
    current_positions = get_trade_detail_data(ContextInfo.get_account(), 'POSITION')
    current_position_ratio = sum(p.m_dMarketValue for p in current_positions) / \
                           get_trade_detail_data(ContextInfo.get_account(), 'ACCOUNT')[0].m_dBalance
    
    # 如果当前仓位与目标仓位差异较大，进行调整
    if abs(current_position_ratio - target_position) > 0.05:  # 5%的调整阈值
        
        adjustment_factor = target_position / max(current_position_ratio, 0.01)
        
        # 按比例调整所有持仓
        for position in current_positions:
            if position.m_nVolume > 0:
                current_weight = position.m_dMarketValue / \
                               get_trade_detail_data(ContextInfo.get_account(), 'ACCOUNT')[0].m_dBalance
                new_weight = current_weight * adjustment_factor
                
                order_target_percent(position.m_strInstrumentID, new_weight)
                print(f"调整持仓 {position.m_strInstrumentID}: {current_weight:.2%} -> {new_weight:.2%}")
```

### 3.2 多层次止损体系

```python
class MultiLevelStopLoss:
    """多层次止损系统"""
    
    def __init__(self):
        # 个股止损参数
        self.individual_stop_loss = 0.08    # 个股止损8%
        self.individual_take_profit = 0.15  # 个股止盈15%
        
        # 组合止损参数
        self.portfolio_stop_loss = 0.12     # 组合止损12%
        self.daily_loss_limit = 0.03        # 日损失限制3%
        
        # 行业止损参数
        self.sector_loss_limit = 0.10       # 行业损失限制10%
        
        # 动态止损参数
        self.trailing_stop_ratio = 0.05     # 移动止损5%
        
        # 记录变量
        self.position_peaks = {}            # 持仓最高点
        self.daily_start_value = None       # 日初净值
        self.sector_positions = {}          # 行业持仓
    
    def update_position_peaks(self, positions):
        """更新持仓最高点"""
        for position in positions:
            stock = position.m_strInstrumentID
            current_value = position.m_dMarketValue
            
            if stock not in self.position_peaks:
                self.position_peaks[stock] = current_value
            else:
                self.position_peaks[stock] = max(self.position_peaks[stock], current_value)
    
    def check_individual_stops(self, positions):
        """检查个股止损止盈"""
        stop_orders = []
        
        for position in positions:
            if position.m_nVolume <= 0:
                continue
                
            stock = position.m_strInstrumentID
            current_price = position.m_dLastPrice
            cost_price = position.m_dOpenPrice
            profit_ratio = (current_price - cost_price) / cost_price
            
            # 固定止损
            if profit_ratio <= -self.individual_stop_loss:
                stop_orders.append({
                    'stock': stock,
                    'action': 'stop_loss',
                    'reason': f'个股止损，亏损{profit_ratio:.2%}',
                    'target_position': 0
                })
            
            # 固定止盈
            elif profit_ratio >= self.individual_take_profit:
                stop_orders.append({
                    'stock': stock,
                    'action': 'take_profit',
                    'reason': f'个股止盈，盈利{profit_ratio:.2%}',
                    'target_position': 0.5  # 部分止盈
                })
            
            # 移动止损
            elif stock in self.position_peaks:
                peak_value = self.position_peaks[stock]
                current_value = position.m_dMarketValue
                drawdown_from_peak = (peak_value - current_value) / peak_value
                
                if drawdown_from_peak > self.trailing_stop_ratio:
                    stop_orders.append({
                        'stock': stock,
                        'action': 'trailing_stop',
                        'reason': f'移动止损，从高点回撤{drawdown_from_peak:.2%}',
                        'target_position': 0
                    })
        
        return stop_orders
    
    def check_portfolio_stops(self, current_portfolio_value, initial_value):
        """检查组合级别止损"""
        portfolio_return = (current_portfolio_value - initial_value) / initial_value
        
        if portfolio_return <= -self.portfolio_stop_loss:
            return {
                'action': 'portfolio_stop_loss',
                'reason': f'组合止损，总亏损{portfolio_return:.2%}',
                'severity': 'critical'
            }
        
        return None
    
    def check_daily_loss_limit(self, current_value):
        """检查日损失限制"""
        if self.daily_start_value is None:
            self.daily_start_value = current_value
            return None
        
        daily_return = (current_value - self.daily_start_value) / self.daily_start_value
        
        if daily_return <= -self.daily_loss_limit:
            return {
                'action': 'daily_loss_limit',
                'reason': f'触发日损失限制，当日亏损{daily_return:.2%}',
                'severity': 'high'
            }
        
        return None
    
    def execute_stop_orders(self, stop_orders, ContextInfo):
        """执行止损订单"""
        for order in stop_orders:
            try:
                if order['target_position'] == 0:
                    # 全部卖出
                    order_target_percent(order['stock'], 0)
                else:
                    # 部分卖出
                    order_target_percent(order['stock'], order['target_position'])
                
                print(f"执行{order['action']}: {order['stock']}, {order['reason']}")
                
            except Exception as e:
                print(f"执行止损订单失败 {order['stock']}: {str(e)}")

# 在策略中使用多层次止损
def handlebar_with_multilevel_stops(ContextInfo):
    """带多层次止损的策略"""
    
    if not ContextInfo.is_last_bar():
        return
    
    stop_loss_system = ContextInfo.stop_loss_system
    account_id = ContextInfo.get_account()
    
    # 获取当前持仓和账户信息
    positions = get_trade_detail_data(account_id, 'POSITION')
    account_info = get_trade_detail_data(account_id, 'ACCOUNT')[0]
    current_value = account_info.m_dBalance
    
    # 更新持仓最高点
    stop_loss_system.update_position_peaks(positions)
    
    # 检查各级止损
    individual_stops = stop_loss_system.check_individual_stops(positions)
    portfolio_stop = stop_loss_system.check_portfolio_stops(current_value, 1000000)
    daily_stop = stop_loss_system.check_daily_loss_limit(current_value)
    
    # 执行止损
    if individual_stops:
        stop_loss_system.execute_stop_orders(individual_stops, ContextInfo)
    
    if portfolio_stop:
        print(f"组合级别风控触发: {portfolio_stop['reason']}")
        # 清空所有持仓
        for position in positions:
            if position.m_nVolume > 0:
                order_target_percent(position.m_strInstrumentID, 0)
    
    if daily_stop:
        print(f"日损失限制触发: {daily_stop['reason']}")
        # 暂停交易或减少仓位
        for position in positions:
            if position.m_nVolume > 0:
                order_target_percent(position.m_strInstrumentID, 0.5)  # 减半仓位
```

---

## 4. 性能优化案例

### 4.1 数据缓存优化

```python
import time
import pickle
import os
from functools import wraps

class DataCache:
    """数据缓存管理器"""
    
    def __init__(self, cache_dir='cache', default_timeout=300):
        self.cache_dir = cache_dir
        self.default_timeout = default_timeout
        self.memory_cache = {}
        
        # 创建缓存目录
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir)
    
    def _get_cache_key(self, func_name, args, kwargs):
        """生成缓存键"""
        key_str = f"{func_name}_{str(args)}_{str(sorted(kwargs.items()))}"
        return hash(key_str)
    
    def _get_cache_file(self, cache_key):
        """获取缓存文件路径"""
        return os.path.join(self.cache_dir, f"cache_{cache_key}.pkl")
    
    def get_from_memory(self, cache_key):
        """从内存缓存获取数据"""
        if cache_key in self.memory_cache:
            data, timestamp = self.memory_cache[cache_key]
            if time.time() - timestamp < self.default_timeout:
                return data
            else:
                del self.memory_cache[cache_key]
        return None
    
    def save_to_memory(self, cache_key, data):
        """保存到内存缓存"""
        self.memory_cache[cache_key] = (data, time.time())
    
    def get_from_disk(self, cache_key):
        """从磁盘缓存获取数据"""
        cache_file = self._get_cache_file(cache_key)
        
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'rb') as f:
                    data, timestamp = pickle.load(f)
                
                if time.time() - timestamp < self.default_timeout * 10:  # 磁盘缓存保持更久
                    return data
                else:
                    os.remove(cache_file)
            except:
                pass
        
        return None
    
    def save_to_disk(self, cache_key, data):
        """保存到磁盘缓存"""
        cache_file = self._get_cache_file(cache_key)
        
        try:
            with open(cache_file, 'wb') as f:
                pickle.dump((data, time.time()), f)
        except:
            pass
    
    def cached_function(self, timeout=None):
        """缓存装饰器"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                cache_key = self._get_cache_key(func.__name__, args, kwargs)
                
                # 先尝试内存缓存
                result = self.get_from_memory(cache_key)
                if result is not None:
                    return result
                
                # 再尝试磁盘缓存
                result = self.get_from_disk(cache_key)
                if result is not None:
                    self.save_to_memory(cache_key, result)
                    return result
                
                # 执行函数并缓存结果
                result = func(*args, **kwargs)
                
                self.save_to_memory(cache_key, result)
                self.save_to_disk(cache_key, result)
                
                return result
            
            return wrapper
        return decorator

# 使用缓存优化数据获取
cache_manager = DataCache()

@cache_manager.cached_function(timeout=60)
def get_cached_market_data(stock_code, period='1d', count=100):
    """带缓存的市场数据获取"""
    try:
        data = ContextInfo.get_market_data_ex(
            field_list=['open', 'high', 'low', 'close', 'volume'],
            stock_code=[stock_code],
            period=period,
            count=count,
            dividend_type='front_ratio'
        )
        
        if stock_code in data:
            return data[stock_code]
        else:
            return None
            
    except Exception as e:
        print(f"获取数据失败 {stock_code}: {str(e)}")
        return None

@cache_manager.cached_function(timeout=300)
def get_cached_technical_indicators(stock_code, period='1d', count=50):
    """带缓存的技术指标计算"""
    
    data = get_cached_market_data(stock_code, period, count)
    
    if data is None or len(data) < 20:
        return None
    
    # 计算技术指标
    close = data['close']
    
    indicators = {
        'ma5': close.rolling(5).mean().iloc[-1],
        'ma20': close.rolling(20).mean().iloc[-1],
        'rsi': calculate_rsi(close, 14).iloc[-1],
        'bb_upper': (close.rolling(20).mean() + close.rolling(20).std() * 2).iloc[-1],
        'bb_lower': (close.rolling(20).mean() - close.rolling(20).std() * 2).iloc[-1],
        'current_price': close.iloc[-1]
    }
    
    return indicators
```

### 4.2 并行处理优化

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import multiprocessing as mp
from functools import partial

class ParallelProcessor:
    """并行处理器"""
    
    def __init__(self, max_workers=None):
        if max_workers is None:
            max_workers = min(mp.cpu_count(), 8)  # 最多8个线程
        self.max_workers = max_workers
    
    def process_stocks_parallel(self, stock_list, processing_func, timeout=30):
        """并行处理股票列表"""
        
        results = {}
        failed_stocks = []
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # 提交所有任务
            future_to_stock = {
                executor.submit(processing_func, stock): stock 
                for stock in stock_list
            }
            
            # 收集结果
            for future in as_completed(future_to_stock, timeout=timeout):
                stock = future_to_stock[future]
                
                try:
                    result = future.result(timeout=5)  # 单个任务5秒超时
                    if result is not None:
                        results[stock] = result
                    else:
                        failed_stocks.append(stock)
                        
                except Exception as e:
                    print(f"处理股票 {stock} 失败: {str(e)}")
                    failed_stocks.append(stock)
        
        return results, failed_stocks
    
    def batch_data_loading(self, stock_list, batch_size=50):
        """批量数据加载"""
        
        all_data = {}
        
        # 分批处理
        for i in range(0, len(stock_list), batch_size):
            batch = stock_list[i:i + batch_size]
            
            try:
                # 批量获取数据
                batch_data = ContextInfo.get_market_data_ex(
                    field_list=['open', 'high', 'low', 'close', 'volume'],
                    stock_code=batch,
                    period='1d',
                    count=50,
                    dividend_type='front_ratio'
                )
                
                all_data.update(batch_data)
                
            except Exception as e:
                print(f"批量获取数据失败，批次 {i//batch_size + 1}: {str(e)}")
                
                # 降级到单个获取
                for stock in batch:
                    try:
                        single_data = ContextInfo.get_market_data_ex(
                            field_list=['open', 'high', 'low', 'close', 'volume'],
                            stock_code=[stock],
                            period='1d',
                            count=50
                        )
                        if stock in single_data:
                            all_data[stock] = single_data[stock]
                    except:
                        continue
        
        return all_data

# 优化后的策略处理
def process_single_stock_optimized(stock, market_data=None):
    """优化的单股票处理函数"""
    
    try:
        # 使用预加载的数据或缓存数据
        if market_data and stock in market_data:
            data = market_data[stock]
        else:
            data = get_cached_market_data(stock)
        
        if data is None or len(data) < 20:
            return None
        
        # 计算技术指标
        indicators = get_cached_technical_indicators(stock)
        
        if indicators is None:
            return None
        
        # 生成交易信号
        signal_strength = 0
        
        # 均线信号
        if indicators['ma5'] > indicators['ma20']:
            signal_strength += 0.3
        
        # RSI信号
        if indicators['rsi'] < 30:
            signal_strength += 0.4
        elif indicators['rsi'] > 70:
            signal_strength -= 0.4
        
        # 布林带信号
        if indicators['current_price'] < indicators['bb_lower']:
            signal_strength += 0.3
        elif indicators['current_price'] > indicators['bb_upper']:
            signal_strength -= 0.3
        
        return {
            'stock': stock,
            'signal_strength': signal_strength,
            'current_price': indicators['current_price'],
            'indicators': indicators
        }
        
    except Exception as e:
        print(f"处理股票 {stock} 时出错: {str(e)}")
        return None

def optimized_strategy_execution(ContextInfo):
    """优化的策略执行"""
    
    if not ContextInfo.is_last_bar():
        return
    
    processor = ParallelProcessor(max_workers=6)
    universe = ContextInfo.get_universe()
    
    print(f"开始处理 {len(universe)} 只股票...")
    start_time = time.time()
    
    # 批量预加载数据
    market_data = processor.batch_data_loading(universe, batch_size=30)
    print(f"数据加载完成，耗时 {time.time() - start_time:.2f} 秒")
    
    # 并行处理股票
    processing_func = partial(process_single_stock_optimized, market_data=market_data)
    results, failed = processor.process_stocks_parallel(universe, processing_func)
    
    print(f"股票处理完成，成功 {len(results)} 只，失败 {len(failed)} 只，"
          f"总耗时 {time.time() - start_time:.2f} 秒")
    
    # 根据信号强度排序
    sorted_results = sorted(
        [(stock, info) for stock, info in results.items() if info is not None],
        key=lambda x: x[1]['signal_strength'],
        reverse=True
    )
    
    # 执行交易
    target_position_size = 0.8 / min(len(sorted_results), 10)  # 最多持有10只股票
    
    for i, (stock, info) in enumerate(sorted_results[:10]):
        if info['signal_strength'] > 0.5:
            order_target_percent(stock, target_position_size)
            print(f"买入 {stock}: 信号强度 {info['signal_strength']:.2f}, "
                  f"价格 {info['current_price']:.2f}")
        elif info['signal_strength'] < -0.5:
            order_target_percent(stock, 0)
            print(f"卖出 {stock}: 信号强度 {info['signal_strength']:.2f}")
```

---

## 5. 实盘交易经验

### 5.1 实盘与回测差异处理

```python
class LiveTradingAdapter:
    """实盘交易适配器"""
    
    def __init__(self):
        self.slippage_model = {
            'large_cap': 0.001,    # 大盘股滑点0.1%
            'mid_cap': 0.002,      # 中盘股滑点0.2%
            'small_cap': 0.005     # 小盘股滑点0.5%
        }
        
        self.commission_rates = {
            'stock': 0.0003,       # 股票手续费万三
            'etf': 0.0001,         # ETF手续费万一
            'bond': 0.0001         # 债券手续费万一
        }
        
        self.min_order_size = 100  # 最小下单量（股）
        self.max_order_ratio = 0.01  # 单笔订单不超过日均成交量1%
    
    def adjust_for_liquidity(self, stock, target_amount, market_data):
        """根据流动性调整订单"""
        
        if stock not in market_data:
            return 0
        
        data = market_data[stock]
        avg_volume = data['volume'].rolling(20).mean().iloc[-1]
        
        # 计算最大可交易量
        max_tradeable = int(avg_volume * self.max_order_ratio)
        
        # 调整订单大小
        adjusted_amount = min(abs(target_amount), max_tradeable)
        
        if target_amount < 0:
            adjusted_amount = -adjusted_amount
        
        # 确保最小交易单位
        if adjusted_amount > 0:
            adjusted_amount = max(adjusted_amount, self.min_order_size)
        elif adjusted_amount < 0:
            adjusted_amount = min(adjusted_amount, -self.min_order_size)
        
        return int(adjusted_amount / 100) * 100  # 整手交易
    
    def calculate_realistic_slippage(self, stock, order_amount, market_data):
        """计算真实滑点"""
        
        # 根据股票市值确定滑点
        if stock.startswith('00030') or stock.startswith('51030'):  # 沪深300ETF等
            base_slippage = self.slippage_model['large_cap']
        elif stock.startswith('000') or stock.startswith('600'):
            base_slippage = self.slippage_model['large_cap']
        else:
            base_slippage = self.slippage_model['mid_cap']
        
        # 根据订单大小调整滑点
        if stock in market_data:
            avg_volume = market_data[stock]['volume'].rolling(20).mean().iloc[-1]
            order_ratio = abs(order_amount) / avg_volume
            
            if order_ratio > 0.005:  # 订单超过日均成交量0.5%
                base_slippage *= (1 + order_ratio * 10)
        
        return base_slippage
    
    def execute_order_with_adaptation(self, stock, target_amount, ContextInfo):
        """执行适应性订单"""
        
        # 获取市场数据
        market_data = ContextInfo.get_market_data_ex(
            field_list=['close', 'volume'],
            stock_code=[stock],
            period='1d',
            count=30
        )
        
        if stock not in market_data:
            print(f"无法获取 {stock} 的市场数据")
            return False
        
        # 调整订单大小
        adjusted_amount = self.adjust_for_liquidity(stock, target_amount, market_data)
        
        if abs(adjusted_amount) < self.min_order_size:
            print(f"订单金额过小，跳过 {stock}")
            return False
        
        # 计算滑点
        slippage = self.calculate_realistic_slippage(stock, adjusted_amount, market_data)
        current_price = market_data[stock]['close'].iloc[-1]
        
        # 调整价格
        if adjusted_amount > 0:  # 买入
            order_price = current_price * (1 + slippage)
        else:  # 卖出
            order_price = current_price * (1 - slippage)
        
        try:
            # 执行订单
            order_id = passorder(
                23,                    # 普通交易
                1101 if adjusted_amount > 0 else 1102,  # 买入/卖出
                ContextInfo.get_account(),
                stock,
                5,                     # 限价
                order_price,
                abs(adjusted_amount),
                "实盘适配策略",
                1,                     # 立即下单
                "",
                ContextInfo
            )
            
            print(f"实盘订单: {stock}, 数量: {adjusted_amount}, "
                  f"价格: {order_price:.2f}, 预期滑点: {slippage:.3%}")
            
            return True
            
        except Exception as e:
            print(f"订单执行失败 {stock}: {str(e)}")
            return False

# 实盘交易监控
def monitor_live_trading(ContextInfo):
    """实盘交易监控"""
    
    account_id = ContextInfo.get_account()
    
    # 获取今日委托
    orders = get_trade_detail_data(account_id, 'ORDER')
    
    # 获取今日成交
    deals = get_trade_detail_data(account_id, 'DEAL')
    
    # 统计执行情况
    total_orders = len(orders)
    filled_orders = len([o for o in orders if o.m_nOrderStatus == 3])  # 全部成交
    partial_filled = len([o for o in orders if o.m_nOrderStatus == 1])  # 部分成交
    cancelled_orders = len([o for o in orders if o.m_nOrderStatus == 5])  # 已撤销
    
    # 计算成交率
    fill_rate = filled_orders / total_orders if total_orders > 0 else 0
    
    # 计算平均滑点
    total_slippage = 0
    slippage_count = 0
    
    for deal in deals:
        # 这里需要获取下单时的预期价格来计算实际滑点
        # 简化处理，假设有记录
        if hasattr(deal, 'expected_price') and deal.expected_price > 0:
            actual_slippage = abs(deal.m_dPrice - deal.expected_price) / deal.expected_price
            total_slippage += actual_slippage
            slippage_count += 1
    
    avg_slippage = total_slippage / slippage_count if slippage_count > 0 else 0
    
    print(f"实盘交易监控报告:")
    print(f"总委托数: {total_orders}")
    print(f"全部成交: {filled_orders}")
    print(f"部分成交: {partial_filled}")
    print(f"已撤销: {cancelled_orders}")
    print(f"成交率: {fill_rate:.2%}")
    print(f"平均滑点: {avg_slippage:.3%}")
    
    return {
        'total_orders': total_orders,
        'fill_rate': fill_rate,
        'avg_slippage': avg_slippage
    }
```

### 5.2 交易时机优化

```python
class TradingTimingOptimizer:
    """交易时机优化器"""
    
    def __init__(self):
        # 避开的时间段
        self.avoid_periods = [
            ('09:30:00', '09:45:00'),  # 开盘前15分钟
            ('11:25:00', '11:30:00'),  # 上午收盘前5分钟
            ('13:00:00', '13:15:00'),  # 下午开盘前15分钟
            ('14:45:00', '15:00:00'),  # 收盘前15分钟
        ]
        
        # 最佳交易时间段
        self.optimal_periods = [
            ('10:00:00', '11:00:00'),  # 上午中段
            ('14:00:00', '14:30:00'),  # 下午前段
        ]
        
        self.volume_threshold = 1.5  # 成交量放大阈值
    
    def is_good_trading_time(self, current_time):
        """判断是否为良好的交易时机"""
        
        time_str = current_time.strftime('%H:%M:%S')
        
        # 检查是否在避开时段
        for start, end in self.avoid_periods:
            if start <= time_str <= end:
                return False, f"避开时段: {start}-{end}"
        
        # 检查是否在最佳时段
        for start, end in self.optimal_periods:
            if start <= time_str <= end:
                return True, f"最佳时段: {start}-{end}"
        
        return True, "普通时段"
    
    def check_market_conditions(self, benchmark_data):
        """检查市场条件"""
        
        if len(benchmark_data) < 5:
            return False, "数据不足"
        
        # 检查市场波动率
        returns = benchmark_data['close'].pct_change().dropna()
        current_volatility = returns.rolling(5).std().iloc[-1]
        
        if current_volatility > 0.03:  # 日内波动率超过3%
            return False, f"市场波动过大: {current_volatility:.2%}"
        
        # 检查成交量
        current_volume = benchmark_data['volume'].iloc[-1]
        avg_volume = benchmark_data['volume'].rolling(20).mean().iloc[-1]
        volume_ratio = current_volume / avg_volume
        
        if volume_ratio < 0.5:  # 成交量过低
            return False, f"成交量不足: {volume_ratio:.1f}倍"
        
        return True, "市场条件良好"
    
    def optimize_order_timing(self, orders, ContextInfo):
        """优化订单时机"""
        
        current_time = datetime.now()
        
        # 检查交易时机
        time_ok, time_msg = self.is_good_trading_time(current_time)
        
        if not time_ok:
            print(f"延迟交易: {time_msg}")
            return []  # 延迟执行
        
        # 检查市场条件
        benchmark_data = ContextInfo.get_market_data_ex(
            field_list=['close', 'volume'],
            stock_code=['000300.SH'],
            period='1m',
            count=30
        )
        
        if '000300.SH' in benchmark_data:
            market_ok, market_msg = self.check_market_conditions(benchmark_data['000300.SH'])
            
            if not market_ok:
                print(f"延迟交易: {market_msg}")
                return []
        
        print(f"交易时机良好: {time_msg}")
        return orders

# 在策略中使用时机优化
def handlebar_with_timing_optimization(ContextInfo):
    """带时机优化的策略"""
    
    if not ContextInfo.is_last_bar():
        return
    
    timing_optimizer = ContextInfo.timing_optimizer
    
    # 生成交易信号
    pending_orders = []
    
    # ... 策略逻辑生成订单 ...
    
    # 优化交易时机
    optimized_orders = timing_optimizer.optimize_order_timing(pending_orders, ContextInfo)
    
    # 执行优化后的订单
    for order in optimized_orders:
        execute_optimized_order(order, ContextInfo)
```

---

## 6. 策略评估方法

### 6.1 综合绩效评估

```python
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

class PerformanceEvaluator:
    """策略绩效评估器"""
    
    def __init__(self):
        self.risk_free_rate = 0.03  # 无风险利率3%
        self.benchmark_return = 0.08  # 基准收益率8%
    
    def calculate_returns(self, portfolio_values):
        """计算收益率序列"""
        returns = pd.Series(portfolio_values).pct_change().dropna()
        return returns
    
    def calculate_sharpe_ratio(self, returns):
        """计算夏普比率"""
        excess_returns = returns.mean() * 252 - self.risk_free_rate
        volatility = returns.std() * np.sqrt(252)
        
        if volatility == 0:
            return 0
        
        return excess_returns / volatility
    
    def calculate_max_drawdown(self, portfolio_values):
        """计算最大回撤"""
        values = pd.Series(portfolio_values)
        peak = values.expanding().max()
        drawdown = (values - peak) / peak
        max_drawdown = drawdown.min()
        
        # 找到最大回撤的开始和结束时间
        max_dd_end = drawdown.idxmin()
        max_dd_start = values[:max_dd_end].idxmax()
        
        return {
            'max_drawdown': max_drawdown,
            'start_date': max_dd_start,
            'end_date': max_dd_end,
            'duration': max_dd_end - max_dd_start
        }
    
    def calculate_calmar_ratio(self, returns, max_drawdown):
        """计算卡玛比率"""
        annual_return = returns.mean() * 252
        
        if max_drawdown == 0:
            return float('inf')
        
        return annual_return / abs(max_drawdown)
    
    def calculate_win_rate(self, trades):
        """计算胜率"""
        if len(trades) == 0:
            return 0
        
        profitable_trades = sum(1 for trade in trades if trade['profit'] > 0)
        return profitable_trades / len(trades)
    
    def calculate_profit_loss_ratio(self, trades):
        """计算盈亏比"""
        profitable_trades = [t['profit'] for t in trades if t['profit'] > 0]
        losing_trades = [t['profit'] for t in trades if t['profit'] < 0]
        
        if len(profitable_trades) == 0 or len(losing_trades) == 0:
            return 0
        
        avg_profit = np.mean(profitable_trades)
        avg_loss = abs(np.mean(losing_trades))
        
        return avg_profit / avg_loss
    
    def calculate_information_ratio(self, strategy_returns, benchmark_returns):
        """计算信息比率"""
        excess_returns = strategy_returns - benchmark_returns
        tracking_error = excess_returns.std() * np.sqrt(252)
        
        if tracking_error == 0:
            return 0
        
        return (excess_returns.mean() * 252) / tracking_error
    
    def comprehensive_evaluation(self, portfolio_values, trades, benchmark_values=None):
        """综合绩效评估"""
        
        returns = self.calculate_returns(portfolio_values)
        
        # 基础指标
        total_return = (portfolio_values[-1] - portfolio_values[0]) / portfolio_values[0]
        annual_return = returns.mean() * 252
        annual_volatility = returns.std() * np.sqrt(252)
        
        # 风险调整指标
        sharpe_ratio = self.calculate_sharpe_ratio(returns)
        max_dd_info = self.calculate_max_drawdown(portfolio_values)
        calmar_ratio = self.calculate_calmar_ratio(returns, max_dd_info['max_drawdown'])
        
        # 交易指标
        win_rate = self.calculate_win_rate(trades)
        profit_loss_ratio = self.calculate_profit_loss_ratio(trades)
        
        # 基准比较
        information_ratio = 0
        if benchmark_values is not None:
            benchmark_returns = self.calculate_returns(benchmark_values)
            information_ratio = self.calculate_information_ratio(returns, benchmark_returns)
        
        evaluation_result = {
            '总收益率': f"{total_return:.2%}",
            '年化收益率': f"{annual_return:.2%}",
            '年化波动率': f"{annual_volatility:.2%}",
            '夏普比率': f"{sharpe_ratio:.2f}",
            '最大回撤': f"{max_dd_info['max_drawdown']:.2%}",
            '卡玛比率': f"{calmar_ratio:.2f}",
            '胜率': f"{win_rate:.2%}",
            '盈亏比': f"{profit_loss_ratio:.2f}",
            '信息比率': f"{information_ratio:.2f}",
            '交易次数': len(trades),
            '回撤持续期': max_dd_info['duration']
        }
        
        return evaluation_result

# 使用示例
def evaluate_strategy_performance(ContextInfo):
    """评估策略表现"""
    
    evaluator = PerformanceEvaluator()
    
    # 获取组合净值历史（需要在策略中记录）
    if not hasattr(ContextInfo, 'portfolio_history'):
        ContextInfo.portfolio_history = []
    
    # 获取当前净值
    account_info = get_trade_detail_data(ContextInfo.get_account(), 'ACCOUNT')[0]
    current_value = account_info.m_dBalance
    ContextInfo.portfolio_history.append(current_value)
    
    # 获取交易记录
    deals = get_trade_detail_data(ContextInfo.get_account(), 'DEAL')
    trades = []
    
    for deal in deals:
        trades.append({
            'stock': deal.m_strInstrumentID,
            'profit': deal.m_dProfit,
            'return': deal.m_dProfit / (deal.m_dPrice * deal.m_nVolume) if deal.m_nVolume > 0 else 0
        })
    
    # 执行评估
    if len(ContextInfo.portfolio_history) > 10:  # 至少10个数据点
        evaluation = evaluator.comprehensive_evaluation(
            ContextInfo.portfolio_history,
            trades
        )
        
        print("策略绩效评估报告:")
        print("=" * 40)
        for metric, value in evaluation.items():
            print(f"{metric}: {value}")
        print("=" * 40)
        
        return evaluation
    
    return None
```

### 6.2 策略诊断与优化建议

```python
class StrategyDiagnostic:
    """策略诊断器"""
    
    def __init__(self):
        self.performance_thresholds = {
            'sharpe_ratio': {'excellent': 2.0, 'good': 1.0, 'poor': 0.5},
            'max_drawdown': {'excellent': 0.05, 'good': 0.10, 'poor': 0.20},
            'win_rate': {'excellent': 0.60, 'good': 0.50, 'poor': 0.40},
            'profit_loss_ratio': {'excellent': 2.0, 'good': 1.5, 'poor': 1.0}
        }
    
    def diagnose_performance(self, evaluation_result):
        """诊断策略表现"""
        
        diagnosis = {
            'strengths': [],
            'weaknesses': [],
            'recommendations': []
        }
        
        # 解析评估结果
        sharpe = float(evaluation_result['夏普比率'])
        max_dd = float(evaluation_result['最大回撤'].strip('%')) / 100
        win_rate = float(evaluation_result['胜率'].strip('%')) / 100
        pl_ratio = float(evaluation_result['盈亏比'])
        
        # 诊断夏普比率
        if sharpe >= self.performance_thresholds['sharpe_ratio']['excellent']:
            diagnosis['strengths'].append("夏普比率优秀，风险调整后收益表现出色")
        elif sharpe >= self.performance_thresholds['sharpe_ratio']['good']:
            diagnosis['strengths'].append("夏普比率良好，风险收益平衡合理")
        else:
            diagnosis['weaknesses'].append("夏普比率偏低，需要提高收益或降低风险")
            diagnosis['recommendations'].append("建议优化选股逻辑或加强风险管理")
        
        # 诊断最大回撤
        if max_dd <= self.performance_thresholds['max_drawdown']['excellent']:
            diagnosis['strengths'].append("最大回撤控制优秀，风险管理到位")
        elif max_dd <= self.performance_thresholds['max_drawdown']['good']:
            diagnosis['strengths'].append("最大回撤控制良好")
        else:
            diagnosis['weaknesses'].append("最大回撤过大，风险控制不足")
            diagnosis['recommendations'].append("建议加强止损机制和仓位管理")
        
        # 诊断胜率
        if win_rate >= self.performance_thresholds['win_rate']['excellent']:
            diagnosis['strengths'].append("胜率优秀，选股能力强")
        elif win_rate >= self.performance_thresholds['win_rate']['good']:
            diagnosis['strengths'].append("胜率良好")
        else:
            diagnosis['weaknesses'].append("胜率偏低，选股准确性有待提高")
            diagnosis['recommendations'].append("建议优化买入信号和选股条件")
        
        # 诊断盈亏比
        if pl_ratio >= self.performance_thresholds['profit_loss_ratio']['excellent']:
            diagnosis['strengths'].append("盈亏比优秀，盈利交易质量高")
        elif pl_ratio >= self.performance_thresholds['profit_loss_ratio']['good']:
            diagnosis['strengths'].append("盈亏比良好")
        else:
            diagnosis['weaknesses'].append("盈亏比偏低，需要提高单笔盈利或控制亏损")
            diagnosis['recommendations'].append("建议优化止盈策略和止损设置")
        
        return diagnosis
    
    def generate_optimization_suggestions(self, diagnosis, trades_analysis):
        """生成优化建议"""
        
        suggestions = []
        
        # 基于弱点生成建议
        if "夏普比率偏低" in str(diagnosis['weaknesses']):
            suggestions.append({
                'category': '收益优化',
                'suggestion': '考虑增加技术指标过滤条件，提高信号质量',
                'priority': 'high'
            })
        
        if "最大回撤过大" in str(diagnosis['weaknesses']):
            suggestions.append({
                'category': '风险控制',
                'suggestion': '实施动态仓位管理，根据市场波动调整仓位',
                'priority': 'critical'
            })
        
        if "胜率偏低" in str(diagnosis['weaknesses']):
            suggestions.append({
                'category': '选股优化',
                'suggestion': '增加基本面筛选条件，避免问题股票',
                'priority': 'high'
            })
        
        if "盈亏比偏低" in str(diagnosis['weaknesses']):
            suggestions.append({
                'category': '交易优化',
                'suggestion': '调整止盈止损比例，让利润充分奔跑',
                'priority': 'medium'
            })
        
        # 基于交易分析生成建议
        if trades_analysis.get('avg_holding_period', 0) < 3:
            suggestions.append({
                'category': '持仓优化',
                'suggestion': '持仓时间过短，考虑延长持仓周期',
                'priority': 'medium'
            })
        
        return suggestions

# 完整的策略诊断流程
def comprehensive_strategy_diagnosis(ContextInfo):
    """综合策略诊断"""
    
    # 执行绩效评估
    evaluation = evaluate_strategy_performance(ContextInfo)
    
    if evaluation is None:
        print("数据不足，无法进行诊断")
        return
    
    # 执行诊断
    diagnostic = StrategyDiagnostic()
    diagnosis = diagnostic.diagnose_performance(evaluation)
    
    # 分析交易记录
    deals = get_trade_detail_data(ContextInfo.get_account(), 'DEAL')
    trades_analysis = analyze_trading_patterns(deals)
    
    # 生成优化建议
    suggestions = diagnostic.generate_optimization_suggestions(diagnosis, trades_analysis)
    
    # 输出诊断报告
    print("\n策略诊断报告:")
    print("=" * 50)
    
    print("\n优势:")
    for strength in diagnosis['strengths']:
        print(f"✓ {strength}")
    
    print("\n劣势:")
    for weakness in diagnosis['weaknesses']:
        print(f"✗ {weakness}")
    
    print("\n改进建议:")
    for rec in diagnosis['recommendations']:
        print(f"→ {rec}")
    
    print("\n优化建议:")
    for suggestion in suggestions:
        priority_icon = "🔴" if suggestion['priority'] == 'critical' else "🟡" if suggestion['priority'] == 'high' else "🟢"
        print(f"{priority_icon} [{suggestion['category']}] {suggestion['suggestion']}")
    
    return {
        'evaluation': evaluation,
        'diagnosis': diagnosis,
        'suggestions': suggestions
    }

def analyze_trading_patterns(deals):
    """分析交易模式"""
    
    if not deals:
        return {}
    
    # 计算平均持仓时间（简化处理）
    # 实际应用中需要匹配买入卖出记录
    
    analysis = {
        'total_trades': len(deals),
        'profitable_trades': len([d for d in deals if d.m_dProfit > 0]),
        'avg_profit_per_trade': sum(d.m_dProfit for d in deals) / len(deals),
        'largest_profit': max(d.m_dProfit for d in deals),
        'largest_loss': min(d.m_dProfit for d in deals),
    }
    
    return analysis
```

---

## 📋 总结

本章节通过详细的实际案例展示了量化交易策略的完整实现过程，包括：

### ✅ 核心内容回顾

**1. 经典策略案例**
- 双均线策略的完整实现
- 均值回归策略的实际应用
- 多因子选股策略的系统化方法
- 配对交易策略的统计套利实现

**2. 高级策略技术**
- 动态仓位管理系统
- 多层次止损体系
- 并行处理优化方案
- 数据缓存机制

**3. 实盘交易适配**
- 回测与实盘差异处理
- 流动性和滑点管理
- 交易时机优化
- 订单执行监控

**4. 绩效评估体系**
- 综合绩效指标计算
- 策略诊断与分析
- 优化建议生成
- 风险控制评估

### 🎯 最佳实践要点

1. **策略设计** - 从简单开始，逐步优化
2. **风险管理** - 多层次风控体系必不可少
3. **性能优化** - 合理使用缓存和并行处理
4. **实盘适配** - 充分考虑市场微观结构
5. **持续改进** - 定期评估和优化策略表现

### 🚀 进阶发展方向

- **机器学习** - 集成AI算法提升策略效果
- **另类数据** - 利用情绪、新闻等非传统数据
- **高频交易** - 探索更短时间框架的策略
- **跨市场套利** - 扩展到期货、期权等衍生品
- **组合优化** - 使用现代投资组合理论

通过这些实际案例和最佳实践，您应该能够构建出稳定可靠的量化交易系统。记住，成功的量化交易不仅需要好的策略，更需要严格的风险管理和持续的优化改进！ 📈
# 实际案例与最佳实践

> 本章节通过具体的策略案例，展示QMT和PTrade在实际量化交易中的应用，提供可直接使用的策略模板和最佳实践指导。

## 📋 目录导航

- [1. 经典策略案例](#1-经典策略案例)
- [2. 高级策略实现](#2-高级策略实现)
- [3. 风险管理实践](#3-风险管理实践)
- [4. 性能优化案例](#4-性能优化案例)
- [5. 实盘交易经验](#5-实盘交易经验)
- [6. 策略评估方法](#6-策略评估方法)

---

## 1. 经典策略案例

### 1.1 双均线策略（完整版）

这是最经典的趋势跟踪策略，通过短期和长期均线的交叉来判断买卖时机。

```python
class DualMovingAverageStrategy:
    """双均线策略完整实现"""
    
    def __init__(self):
        self.name = "双均线策略"
        self.version = "2.0"
        
        # 策略参数
        self.short_window = 5      # 短期均线周期
        self.long_window = 20      # 长期均线周期
        self.position_size = 0.95  # 仓位大小
        
        # 风控参数
        self.stop_loss = 0.08      # 止损8%
        self.take_profit = 0.15    # 止盈15%
        self.max_positions = 5     # 最大持仓数
        
        # 运行时变量
        self.positions = {}
        self.signals_history = {}
        self.performance_metrics = {}

def init(ContextInfo):
    """策略初始化"""
    # 创建策略实例
    ContextInfo.strategy = DualMovingAverageStrategy()
    
    # 设置交易账户
    ContextInfo.set_account('你的账户ID')
    
    # 设置股票池 - 选择流动性好的大盘股
    stock_pool = [
        '000001.SZ', '000002.SZ', '000858.SZ', '000725.SZ',
        '600000.SH', '600036.SH', '600519.SH', '600887.SH',
        '000858.SZ', '002415.SZ', '300059.SZ', '300750.SZ'
    ]
    ContextInfo.set_universe(stock_pool)
    
    # 设置基准
    ContextInfo.set_benchmark('000300.SH')  # 沪深300
    
    # 设置手续费
    ContextInfo.set_order_cost(OrderCostType.by_money, cost=0.0003, min_cost=5)
    
    print(f"策略初始化完成: {ContextInfo.strategy.name} v{ContextInfo.strategy.version}")
    print(f"股票池数量: {len(stock_pool)}")

def handlebar(ContextInfo):
    """主策略逻辑"""
    
    # 只在最新K线执行
    if not ContextInfo.is_last_bar():
        return
    
    strategy = ContextInfo.strategy
    current_time = ContextInfo.get_bar_timetag(ContextInfo.barpos)
    
    # 获取当前股票池
    universe = ContextInfo.get_universe()
    
    for stock in universe:
        try:
            # 获取历史数据
            data = ContextInfo.get_market_data_ex(
                field_list=['open', 'high', 'low', 'close', 'volume'],
                stock_code=[stock],
                period='1d',
                count=max(strategy.long_window + 5, 30),
                dividend_type='front_ratio'
            )
            
            if stock not in data or len(data[stock]) < strategy.long_window:
                continue
                
            df = data[stock]
            
            # 计算技术指标
            signals = calculate_trading_signals(df, strategy)
            
            # 执行交易逻辑
            execute_trading_decision(stock, signals, ContextInfo)
            
        except Exception as e:
            print(f"处理股票 {stock} 时出错: {str(e)}")
            continue

def calculate_trading_signals(df, strategy):
    """计算交易信号"""
    
    # 计算移动平均线
    df['ma_short'] = df['close'].rolling(window=strategy.short_window).mean()
    df['ma_long'] = df['close'].rolling(window=strategy.long_window).mean()
    
    # 计算信号
    current_short = df['ma_short'].iloc[-1]
    current_long = df['ma_long'].iloc[-1]
    prev_short = df['ma_short'].iloc[-2]
    prev_long = df['ma_long'].iloc[-2]
    
    current_price = df['close'].iloc[-1]
    current_volume = df['volume'].iloc[-1]
    avg_volume = df['volume'].rolling(20).mean().iloc[-1]
    
    # 生成信号
    signals = {
        'golden_cross': current_short > current_long and prev_short <= prev_long,
        'death_cross': current_short < current_long and prev_short >= prev_long,
        'trend_up': current_short > current_long,
        'trend_down': current_short < current_long,
        'volume_confirm': current_volume > avg_volume * 1.2,  # 成交量放大确认
        'price': current_price,
        'ma_short': current_short,
        'ma_long': current_long
    }
    
    # 计算信号强度
    if signals['golden_cross'] and signals['volume_confirm']:
        signals['strength'] = 1.0  # 强买入
    elif signals['golden_cross']:
        signals['strength'] = 0.7  # 一般买入
    elif signals['death_cross'] and signals['volume_confirm']:
        signals['strength'] = -1.0  # 强卖出
    elif signals['death_cross']:
        signals['strength'] = -0.7  # 一般卖出
    else:
        signals['strength'] = 0.0  # 无信号
    
    return signals

def execute_trading_decision(stock, signals, ContextInfo):
    """执行交易决策"""
    
    strategy = ContextInfo.strategy
    account_id = ContextInfo.get_account()
    
    # 获取当前持仓
    current_positions = get_trade_detail_data(account_id, 'POSITION')
    position_count = len([p for p in current_positions if p.m_nVolume > 0])
    
    # 检查是否已持有该股票
    has_position = any(p.m_strInstrumentID == stock and p.m_nVolume > 0 
                      for p in current_positions)
    
    # 买入逻辑
    if signals['strength'] > 0.5 and not has_position:
        if position_count < strategy.max_positions:
            # 计算买入金额
            account_info = get_trade_detail_data(account_id, 'ACCOUNT')[0]
            available_cash = account_info.m_dAvailable
            
            # 每只股票分配相等资金
            target_value = available_cash * strategy.position_size / strategy.max_positions
            target_shares = int(target_value / signals['price'] / 100) * 100  # 整手
            
            if target_shares >= 100:  # 至少一手
                # 执行买入
                order_id = passorder(
                    23,           # 普通交易
                    1101,         # 买入
                    account_id,   # 账户
                    stock,        # 股票代码
                    5,            # 限价
                    signals['price'] * 1.01,  # 稍高于当前价格
                    target_shares,  # 数量
                    strategy.name,  # 策略名
                    1,            # 立即下单
                    "",           # 用户订单ID
                    ContextInfo
                )
                
                # 记录买入信息
                strategy.positions[stock] = {
                    'entry_price': signals['price'],
                    'entry_time': ContextInfo.get_bar_timetag(ContextInfo.barpos),
                    'shares': target_shares,
                    'stop_loss_price': signals['price'] * (1 - strategy.stop_loss),
                    'take_profit_price': signals['price'] * (1 + strategy.take_profit)
                }
                
                print(f"买入信号: {stock}, 价格: {signals['price']:.2f}, 数量: {target_shares}")
    
    # 卖出逻辑
    elif has_position:
        position_info = next(p for p in current_positions 
                           if p.m_strInstrumentID == stock and p.m_nVolume > 0)
        
        current_price = signals['price']
        entry_price = strategy.positions.get(stock, {}).get('entry_price', position_info.m_dOpenPrice)
        
        # 止损止盈检查
        should_sell = False
        sell_reason = ""
        
        if signals['strength'] < -0.5:
            should_sell = True
            sell_reason = "技术信号卖出"
        elif current_price <= entry_price * (1 - strategy.stop_loss):
            should_sell = True
            sell_reason = "止损卖出"
        elif current_price >= entry_price * (1 + strategy.take_profit):
            should_sell = True
            sell_reason = "止盈卖出"
        
        if should_sell:
            # 执行卖出
            order_id = passorder(
                23,           # 普通交易
                1102,         # 卖出
                account_id,   # 账户
                stock,        # 股票代码
                5,            # 限价
                current_price * 0.99,  # 稍低于当前价格
                position_info.m_nVolume,  # 全部卖出
                strategy.name,  # 策略名
                1,            # 立即下单
                "",           # 用户订单ID
                ContextInfo
            )
            
            # 计算收益
            if stock in strategy.positions:
                profit_loss = (current_price - entry_price) / entry_price
                print(f"{sell_reason}: {stock}, 买入价: {entry_price:.2f}, "
                      f"卖出价: {current_price:.2f}, 收益率: {profit_loss:.2%}")
                
                # 清除持仓记录
                del strategy.positions[stock]

# 策略评估函数
def evaluate_strategy_performance(ContextInfo):
    """评估策略表现"""
    
    strategy = ContextInfo.strategy
    account_id = ContextInfo.get_account()
    
    # 获取账户信息
    account_info = get_trade_detail_data(account_id, 'ACCOUNT')[0]
    current_value = account_info.m_dBalance
    
    # 计算基本指标
    total_return = (current_value - 1000000) / 1000000  # 假设初始资金100万
    
    # 获取成交记录
    deals = get_trade_detail_data(account_id, 'DEAL')
    
    if deals:
        # 计算胜率
        profitable_trades = sum(1 for deal in deals if deal.m_dProfit > 0)
        total_trades = len(deals)
        win_rate = profitable_trades / total_trades if total_trades > 0 else 0
        
        # 计算平均收益
        avg_profit = sum(deal.m_dProfit for deal in deals) / total_trades if total_trades > 0 else 0
        
        print(f"策略表现评估:")
        print(f"总收益率: {total_return:.2%}")
        print(f"交易次数: {total_trades}")
        print(f"胜率: {win_rate:.2%}")
        print(f"平均每笔收益: {avg_profit:.2f}")
    
    return {
        'total_return': total_return,
        'current_value': current_value,
        'positions': len(strategy.positions)
    }
```

### 1.2 均值回归策略

基于布林带的均值回归策略，适合震荡市场。

```python
class MeanReversionStrategy:
    """均值回归策略"""
    
    def __init__(self):
        self.name = "布林带均值回归"
        self.bb_period = 20        # 布林带周期
        self.bb_std = 2.0          # 标准差倍数
        self.rsi_period = 14       # RSI周期
        self.position_size = 0.1   # 单只股票仓位
        
        # 信号阈值
        self.oversold_threshold = 30    # RSI超卖阈值
        self.overbought_threshold = 70  # RSI超买阈值

def calculate_bollinger_bands(prices, period=20, std_dev=2):
    """计算布林带"""
    ma = prices.rolling(window=period).mean()
    std = prices.rolling(window=period).std()
    
    upper_band = ma + (std * std_dev)
    lower_band = ma - (std * std_dev)
    
    return upper_band, ma, lower_band

def calculate_rsi(prices, period=14):
    """计算RSI指标"""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def mean_reversion_signals(df, strategy):
    """生成均值回归信号"""
    
    close = df['close']
    
    # 计算技术指标
    upper_bb, middle_bb, lower_bb = calculate_bollinger_bands(close, strategy.bb_period, strategy.bb_std)
    rsi = calculate_rsi(close, strategy.rsi_period)
    
    current_price = close.iloc[-1]
    current_rsi = rsi.iloc[-1]
    current_upper = upper_bb.iloc[-1]
    current_lower = lower_bb.iloc[-1]
    current_middle = middle_bb.iloc[-1]
    
    signals = {
        'price': current_price,
        'upper_bb': current_upper,
        'lower_bb': current_lower,
        'middle_bb': current_middle,
        'rsi': current_rsi,
        'buy_signal': False,
        'sell_signal': False,
        'strength': 0
    }
    
    # 买入信号：价格触及下轨且RSI超卖
    if current_price <= current_lower and current_rsi <= strategy.oversold_threshold:
        signals['buy_signal'] = True
        signals['strength'] = 1.0
        
    # 卖出信号：价格触及上轨且RSI超买
    elif current_price >= current_upper and current_rsi >= strategy.overbought_threshold:
        signals['sell_signal'] = True
        signals['strength'] = -1.0
        
    # 中性信号：价格回归中轨
    elif abs(current_price - current_middle) / current_middle < 0.02:
        signals['strength'] = 0
    
    return signals

# 在主策略中使用
def handlebar_mean_reversion(ContextInfo):
    """均值回归策略主函数"""
    
    if not ContextInfo.is_last_bar():
        return
    
    strategy = ContextInfo.mean_reversion_strategy
    universe = ContextInfo.get_universe()
    
    for stock in universe:
        try:
            # 获取数据
            data = ContextInfo.get_market_data_ex(
                field_list=['close', 'volume'],
                stock_code=[stock],
                period='1d',
                count=50
            )
            
            if stock not in data:
                continue
                
            df = data[stock]
            
            # 计算信号
            signals = mean_reversion_signals(df, strategy)
            
            # 执行交易
            if signals['buy_signal']:
                order_target_percent(stock, strategy.position_size)
                print(f"均值回归买入: {stock}, 价格: {signals['price']:.2f}, RSI: {signals['rsi']:.1f}")
                
            elif signals['sell_signal']:
                order_target_percent(stock, 0)
                print(f"均值回归卖出: {stock}, 价格: {signals['price']:.2f}, RSI: {signals['rsi']:.1f}")
                
        except Exception as e:
            print(f"均值回归策略处理 {stock} 出错: {str(e)}")
```

---

## 2. 高级策略实现

### 2.1 多因子选股策略

结合基本面和技术面因子的综合选股策略。

```python
class MultiFactorStrategy:
    """多因子选股策略"""
    
    def __init__(self):
        self.name = "多因子选股策略"
        
        # 因子权重配置
        self.factor_weights = {
            'momentum': 0.25,      # 动量因子
            'value': 0.25,         # 价值因子
            'quality': 0.25,       # 质量因子
            'technical': 0.25      # 技术因子
        }
        
        # 选股参数
        self.stock_count = 20      # 选股数量
        self.rebalance_freq = 20   # 调仓频率（天）
        self.position_size = 0.95  # 总仓位
        
        # 因子计算参数
        self.momentum_period = 20
        self.value_lookback = 252
        self.technical_period = 10

def calculate_momentum_factor(df, period=20):
    """计算动量因子"""
    returns = df['close'].pct_change()
    momentum = returns.rolling(window=period).sum()
    return momentum.iloc[-1]

def calculate_value_factor(stock_code, current_price):
    """计算价值因子（简化版）"""
    try:
        # 获取基本面数据（这里用模拟数据）
        # 实际应用中需要接入基本面数据源
        pe_ratio = 15.0  # 市盈率
        pb_ratio = 2.0   # 市净率
        
        # 价值评分（PE和PB越低越好）
        value_score = 1 / pe_ratio + 1 / pb_ratio
        return value_score
        
    except:
        return 0

def calculate_quality_factor(stock_code):
    """计算质量因子（简化版）"""
    try:
        # 模拟质量指标
        roe = 0.15      # 净资产收益率
        debt_ratio = 0.3  # 资产负债率
        
        # 质量评分
        quality_score = roe * (1 - debt_ratio)
        return quality_score
        
    except:
        return 0

def calculate_technical_factor(df, period=10):
    """计算技术因子"""
    try:
        close = df['close']
        volume = df['volume']
        
        # 计算技术指标
        rsi = calculate_rsi(close, 14).iloc[-1]
        
        # 成交量相对强度
        volume_ratio = volume.iloc[-1] / volume.rolling(period).mean().iloc[-1]
        
        # 技术评分
        technical_score = (50 - abs(rsi - 50)) / 50 + min(volume_ratio, 2) / 2
        return technical_score
        
    except:
        return 0

def calculate_composite_score(stock_code, df, strategy):
    """计算综合评分"""
    
    scores = {}
    
    # 动量因子
    scores['momentum'] = calculate_momentum_factor(df, strategy.momentum_period)
    
    # 价值因子
    current_price = df['close'].iloc[-1]
    scores['value'] = calculate_value_factor(stock_code, current_price)
    
    # 质量因子
    scores['quality'] = calculate_quality_factor(stock_code)
    
    # 技术因子
    scores['technical'] = calculate_technical_factor(df, strategy.technical_period)
    
    # 计算加权综合评分
    composite_score = sum(
        scores[factor] * strategy.factor_weights[factor]
        for factor in strategy.factor_weights
    )
    
    return composite_score, scores

def multi_factor_stock_selection(ContextInfo):
    """多因子选股"""
    
    strategy = ContextInfo.multi_factor_strategy
    
    # 获取股票池（这里使用沪深300成分股）
    stock_pool = ContextInfo.get_stock_list_in_sector('沪深300')
    
    stock_scores = {}
    
    print("开始多因子选股...")
    
    for stock in stock_pool[:100]:  # 限制处理数量以提高效率
        try:
            # 获取历史数据
            data = ContextInfo.get_market_data_ex(
                field_list=['open', 'high', 'low', 'close', 'volume'],
                stock_code=[stock],
                period='1d',
                count=60
            )
            
            if stock not in data or len(data[stock]) < 30:
                continue
                
            df = data[stock]
            
            # 计算综合评分
            composite_score, factor_scores = calculate_composite_score(stock, df, strategy)
            
            stock_scores[stock] = {
                'composite_score': composite_score,
                'factor_scores': factor_scores,
                'current_price': df['close'].iloc[-1]
            }
            
        except Exception as e:
            print(f"处理股票 {stock} 时出错: {str(e)}")
            continue
    
    # 按综合评分排序
    sorted_stocks = sorted(stock_scores.items(), 
                          key=lambda x: x[1]['composite_score'], 
                          reverse=True)
    
    # 选择前N只股票
    selected_stocks = sorted_stocks[:strategy.stock_count]
    
    print(f"选股完成，共选择 {len(selected_stocks)} 只股票:")
    for stock, info in selected_stocks[:5]:  # 显示前5只
        print(f"{stock}: 综合评分 {info['composite_score']:.4f}, "
              f"价格 {info['current_price']:.2f}")
    
    return [stock for stock, _ in selected_stocks]

def rebalance_portfolio(selected_stocks, ContextInfo):
    """调仓操作"""
    
    strategy = ContextInfo.multi_factor_strategy
    account_id = ContextInfo.get_account()
    
    # 获取当前持仓
    current_positions = get_trade_detail_data(account_id, 'POSITION')
    current_stocks = set(p.m_strInstrumentID for p in current_positions if p.m_nVolume > 0)
    
    selected_set = set(selected_stocks)
    
    # 需要卖出的股票
    to_sell = current_stocks - selected_set
    
    # 需要买入的股票
    to_buy = selected_set - current_stocks
    
    print(f"调仓操作: 卖出 {len(to_sell)} 只, 买入 {len(to_buy)} 只")
    
    # 执行卖出
    for stock in to_sell:
        order_target_percent(stock, 0)
        print(f"卖出: {stock}")
    
    # 执行买入
    target_weight = strategy.position_size / len(selected_stocks)
    for stock in to_buy:
        order_target_percent(stock, target_weight)
        print(f"买入: {stock}, 目标权重: {target_weight:.2%}")

# 主策略函数
def handlebar_multi_factor(ContextInfo):
    """多因子策略主函数"""
    
    if not ContextInfo.is_last_bar():
        return
    
    strategy = ContextInfo.multi_factor_strategy
    
    # 检查是否需要调仓
    current_bar = ContextInfo.barpos
    
    if not hasattr(strategy, 'last_rebalance'):
        strategy.last_rebalance = 0
    
    if current_bar - strategy.last_rebalance >= strategy.rebalance_freq:
        # 执行选股和调仓
        selected_stocks = multi_factor_stock_selection(ContextInfo)
        rebalance_portfolio(selected_stocks, ContextInfo)
        
        strategy.last_rebalance = current_bar
        print(f"第 {current_bar} 根K线完成调仓")
```

### 2.2 配对交易策略

基于统计套利的配对交易策略。

```python
class PairTradingStrategy:
    """配对交易策略"""
    
    def __init__(self):
        self.name = "配对交易策略"
        
        # 策略参数
        self.lookback_period = 60    # 回看周期
        self.entry_threshold = 2.0   # 开仓阈值（标准差倍数）
        self.exit_threshold = 0.5    # 平仓阈值
        self.stop_loss = 3.0         # 止损阈值
        
        # 配对股票
        self.pairs = [
            ('000001.SZ', '600036.SH'),  # 平安银行 vs 招商银行
            ('000002.SZ', '000858.SZ'),  # 万科A vs 五粮液
            ('600519.SH', '000858.SZ'),  # 茅台 vs 五粮液
        ]
        
        self.pair_positions = {}

def calculate_spread(price1, price2, method='ratio'):
    """计算价差"""
    if method == 'ratio':
        return price1 / price2
    elif method == 'difference':
        return price1 - price2
    else:
        # 对数价差
        import numpy as np
        return np.log(price1) - np.log(price2)

def calculate_zscore(spread, window=60):
    """计算Z分数"""
    mean = spread.rolling(window=window).mean()
    std = spread.rolling(window=window).std()
    zscore = (spread - mean) / std
    return zscore

def pair_trading_signals(stock1_data, stock2_data, strategy):
    """生成配对交易信号"""
    
    # 计算价差
    spread = calculate_spread(stock1_data['close'], stock2_data['close'], 'ratio')
    
    # 计算Z分数
    zscore = calculate_zscore(spread, strategy.lookback_period)
    
    current_zscore = zscore.iloc[-1]
    
    signals = {
        'zscore': current_zscore,
        'spread': spread.iloc[-1],
        'action': 'hold'
    }
    
    # 生成交易信号
    if current_zscore > strategy.entry_threshold:
        # 价差过高，做空价差（卖出股票1，买入股票2）
        signals['action'] = 'short_spread'
        signals['stock1_action'] = 'sell'
        signals['stock2_action'] = 'buy'
        
    elif current_zscore < -strategy.entry_threshold:
        # 价差过低，做多价差（买入股票1，卖出股票2）
        signals['action'] = 'long_spread'
        signals['stock1_action'] = 'buy'
        signals['stock2_action'] = 'sell'
        
    elif abs(current_zscore) < strategy.exit_threshold:
        # 价差回归，平仓
        signals['action'] = 'close'
        
    elif abs(current_zscore) > strategy.stop_loss:
        # 止损
        signals['action'] = 'stop_loss'
    
    return signals

def execute_pair_trade(pair, signals, ContextInfo):
    """执行配对交易"""
    
    stock1, stock2 = pair
    strategy = ContextInfo.pair_trading_strategy
    
    if signals['action'] in ['long_spread', 'short_spread']:
        # 开仓
        position_size = 50000  # 每只股票5万元
        
        if signals['action'] == 'long_spread':
            # 买入股票1，卖出股票2
            order_target_value(stock1, position_size)
            order_target_value(stock2, -position_size)
            
            strategy.pair_positions[pair] = {
                'type': 'long_spread',
                'entry_zscore': signals['zscore'],
                'entry_time': ContextInfo.get_bar_timetag(ContextInfo.barpos)
            }
            
            print(f"开仓做多价差: {stock1} vs {stock2}, Z分数: {signals['zscore']:.2f}")
            
        else:  # short_spread
            # 卖出股票1，买入股票2
            order_target_value(stock1, -position_size)
            order_target_value(stock2, position_size)
            
            strategy.pair_positions[pair] = {
                'type': 'short_spread',
                'entry_zscore': signals['zscore'],
                'entry_time': ContextInfo.get_bar_timetag(ContextInfo.barpos)
            }
            
            print(f"开仓做空