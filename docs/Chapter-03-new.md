# 量化策略开发与回测系统

本章将深入探讨QMT平台的策略开发环境，从策略创建、编写、调试到历史回测的完整开发流程。通过系统化的学习，您将掌握构建专业量化交易策略的核心技能。

## 策略开发环境概览

QMT平台提供了完整的策略开发生态系统，包括：

- **集成开发环境**：代码编辑器、语法高亮、智能补全
- **策略管理系统**：策略导入导出、版本控制、加密保护
- **回测引擎**：高精度历史数据回测和性能分析
- **实时运行环境**：策略实盘运行和监控系统

---

## 策略管理与创建

### 3.01 策略工作空间

成功登录QMT平台后，策略列表是您的核心工作区域。这里集中管理着所有的量化策略，支持分类组织和快速检索。

**策略列表功能特性**：
- 个人策略库管理
- 策略分类和标签系统
- 快速搜索和过滤功能
- 策略运行状态监控

![策略管理界面](./Chapter-15.assets/xtqmt09.9b7d81e0.png)

### 3.02 策略导入导出机制

QMT支持策略的安全导入导出，采用加密技术保护策略知识产权，同时便于策略的迁移和分享。

**核心特性**：
- **加密保护**：策略源码采用高强度加密算法
- **版本控制**：支持策略版本管理和回滚
- **批量操作**：支持多策略批量导入导出
- **兼容性检查**：自动检测策略依赖和兼容性

**操作流程**：

```
# 策略导入示例
# 1. 点击"导入策略"按钮
# 2. 选择策略文件（.qmt格式）
# 3. 输入解密密码（如需要）
# 4. 确认导入配置
# 5. 完成导入并验证
```

### 3.03 新建策略向导

创建新策略时，QMT提供了智能化的策略向导，帮助开发者快速搭建策略框架。

**策略模板类型**：
- **趋势跟踪策略**：基于技术指标的趋势识别
- **均值回归策略**：价格偏离修正策略
- **套利策略**：跨品种或跨市场套利
- **多因子策略**：基于多维度因子的选股策略
- **自定义策略**：完全自定义的策略框架

**策略创建实例**：

```
# ===== 策略框架模板 =====
# coding: utf-8
import pandas as pd
import numpy as np
import talib
from datetime import datetime, timedelta

class QuantStrategy:
    """量化策略基础类"""
    
    def __init__(self):
        self.name = "智能均线策略"
        self.version = "1.0.0"
        self.author = "Quant Developer"
        self.description = "基于动态均线的趋势跟踪策略"
        
        # 策略参数
        self.params = {
            'fast_period': 5,      # 快速均线周期
            'slow_period': 20,     # 慢速均线周期
            'signal_period': 9,    # 信号线周期
            'position_size': 0.95, # 仓位大小
            'stop_loss': 0.05,     # 止损比例
            'take_profit': 0.15    # 止盈比例
        }
        
        # 运行时变量
        self.positions = {}
        self.orders = {}
        self.performance = {}

def init(ContextInfo):
    """策略初始化函数"""
    # 设置基础参数
    ContextInfo.accountid = '55002616'  # 资金账户
    ContextInfo.stock_pool = ['000001.SZ', '000002.SZ', '600036.SH']  # 股票池
    ContextInfo.benchmark = '000300.SH'  # 基准指数
    
    # 策略参数
    ContextInfo.fast_ma = 5      # 快速均线
    ContextInfo.slow_ma = 20     # 慢速均线
    ContextInfo.position_ratio = 0.95  # 仓位比例
    
    # 风控参数
    ContextInfo.max_position_per_stock = 0.2  # 单股最大仓位
    ContextInfo.stop_loss_ratio = 0.05        # 止损比例
    ContextInfo.max_drawdown = 0.15           # 最大回撤限制
    
    # 初始化数据
    ContextInfo.last_prices = {}
    ContextInfo.entry_prices = {}
    ContextInfo.signals = {}
    
    # 下载历史数据
    for stock in ContextInfo.stock_pool:
        download_history_data(stock, "1d", "", "")
    
    print(f"策略初始化完成")
    print(f"股票池: {ContextInfo.stock_pool}")
    print(f"基准指数: {ContextInfo.benchmark}")
    print("=" * 50)

def handlebar(ContextInfo):
    """主策略逻辑函数"""
    # 获取当前时间信息
    current_time = get_current_time(ContextInfo)
    bar_time = timetag_to_datetime(ContextInfo.get_bar_timetag(ContextInfo.barpos-1), '%Y-%m-%d %H:%M:%S')
    
    # 显示账户信息
    display_account_info(ContextInfo)
    
    # 获取当前持仓
    current_positions = get_current_positions(ContextInfo.accountid)
    
    # 遍历股票池执行策略逻辑
    for stock_code in ContextInfo.stock_pool:
        try:
            # 获取历史数据
            market_data = get_market_data(ContextInfo, stock_code, bar_time)
            if not market_data:
                continue
            
            # 计算技术指标
            indicators = calculate_indicators(market_data, ContextInfo)
            
            # 生成交易信号
            signal = generate_trading_signal(stock_code, indicators, ContextInfo)
            
            # 执行交易逻辑
            execute_trading_logic(stock_code, signal, current_positions, ContextInfo)
            
        except Exception as e:
            print(f"处理股票 {stock_code} 时发生错误: {str(e)}")
    
    # 风险管理
    risk_management(ContextInfo, current_positions)
    
    # 绩效监控
    update_performance_metrics(ContextInfo)

def get_market_data(ContextInfo, stock_code, end_time):
    """获取市场数据"""
    try:
        data = ContextInfo.get_market_data_ex(
            ['open', 'high', 'low', 'close', 'volume'],
            stock_code=[stock_code],
            end_time=end_time,
            period='1d',
            count=50,  # 获取50天数据用于指标计算
            dividend_type='front',
            fill_data=True,
            subscribe=True
        )
        
        if stock_code in data and len(data[stock_code]) > 0:
            return data[stock_code]
        return None
        
    except Exception as e:
        print(f"获取 {stock_code} 市场数据失败: {str(e)}")
        return None

def calculate_indicators(market_data, ContextInfo):
    """计算技术指标"""
    if len(market_data) < max(ContextInfo.fast_ma, ContextInfo.slow_ma):
        return None
    
    # 提取价格数据
    closes = [bar.close for bar in market_data]
    highs = [bar.high for bar in market_data]
    lows = [bar.low for bar in market_data]
    volumes = [bar.volume for bar in market_data]
    
    # 计算移动平均线
    fast_ma = np.mean(closes[-ContextInfo.fast_ma:])
    slow_ma = np.mean(closes[-ContextInfo.slow_ma:])
    
    # 计算MACD
    macd_line, macd_signal, macd_hist = calculate_macd(closes)
    
    # 计算RSI
    rsi = calculate_rsi(closes, period=14)
    
    # 计算布林带
    bb_upper, bb_middle, bb_lower = calculate_bollinger_bands(closes, period=20)
    
    # 计算成交量指标
    volume_ma = np.mean(volumes[-10:])  # 10日成交量均线
    volume_ratio = volumes[-1] / volume_ma if volume_ma > 0 else 1
    
    return {
        'current_price': closes[-1],
        'fast_ma': fast_ma,
        'slow_ma': slow_ma,
        'macd_line': macd_line,
        'macd_signal': macd_signal,
        'macd_hist': macd_hist,
        'rsi': rsi,
        'bb_upper': bb_upper,
        'bb_middle': bb_middle,
        'bb_lower': bb_lower,
        'volume_ratio': volume_ratio,
        'price_change': (closes[-1] - closes[-2]) / closes[-2] * 100 if len(closes) > 1 else 0
    }

def calculate_macd(prices, fast=12, slow=26, signal=9):
    """计算MACD指标"""
    if len(prices) < slow:
        return 0, 0, 0
    
    prices_array = np.array(prices)
    ema_fast = talib.EMA(prices_array, timeperiod=fast)
    ema_slow = talib.EMA(prices_array, timeperiod=slow)
    
    macd_line = ema_fast[-1] - ema_slow[-1]
    
    # 简化的信号线计算
    macd_values = ema_fast - ema_slow
    macd_signal = talib.EMA(macd_values, timeperiod=signal)[-1]
    macd_hist = macd_line - macd_signal
    
    return macd_line, macd_signal, macd_hist

def calculate_rsi(prices, period=14):
    """计算RSI指标"""
    if len(prices) < period + 1:
        return 50
    
    prices_array = np.array(prices)
    rsi = talib.RSI(prices_array, timeperiod=period)
    return rsi[-1] if not np.isnan(rsi[-1]) else 50

def calculate_bollinger_bands(prices, period=20, std_dev=2):
    """计算布林带"""
    if len(prices) < period:
        current_price = prices[-1]
        return current_price * 1.02, current_price, current_price * 0.98
    
    prices_array = np.array(prices)
    bb_upper, bb_middle, bb_lower = talib.BBANDS(
        prices_array, timeperiod=period, nbdevup=std_dev, nbdevdn=std_dev
    )
    
    return bb_upper[-1], bb_middle[-1], bb_lower[-1]

def generate_trading_signal(stock_code, indicators, ContextInfo):
    """生成交易信号"""
    if not indicators:
        return 'HOLD'
    
    current_price = indicators['current_price']
    fast_ma = indicators['fast_ma']
    slow_ma = indicators['slow_ma']
    rsi = indicators['rsi']
    macd_hist = indicators['macd_hist']
    volume_ratio = indicators['volume_ratio']
    
    # 多重条件判断
    buy_conditions = [
        fast_ma > slow_ma,           # 快线上穿慢线
        current_price > fast_ma,     # 价格在快线之上
        rsi < 70,                    # RSI未超买
        macd_hist > 0,               # MACD柱状图为正
        volume_ratio > 1.2           # 成交量放大
    ]
    
    sell_conditions = [
        fast_ma < slow_ma,           # 快线下穿慢线
        current_price < fast_ma,     # 价格跌破快线
        rsi > 30,                    # RSI未超卖
        macd_hist < 0                # MACD柱状图为负
    ]
    
    # 信号强度评估
    buy_score = sum(buy_conditions)
    sell_score = sum(sell_conditions)
    
    # 生成信号
    if buy_score >= 4:  # 至少满足4个买入条件
        return 'BUY'
    elif sell_score >= 3:  # 至少满足3个卖出条件
        return 'SELL'
    else:
        return 'HOLD'

def execute_trading_logic(stock_code, signal, current_positions, ContextInfo):
    """执行交易逻辑"""
    stock_name = ContextInfo.get_stock_name(stock_code)
    current_price = get_current_price(stock_code, ContextInfo)
    
    if not current_price:
        return
    
    # 检查是否已持仓
    is_holding = stock_code in current_positions and current_positions[stock_code] > 0
    
    # 执行买入逻辑
    if signal == 'BUY' and not is_holding:
        execute_buy_order(stock_code, stock_name, current_price, ContextInfo)
    
    # 执行卖出逻辑
    elif signal == 'SELL' and is_holding:
        execute_sell_order(stock_code, stock_name, current_price, current_positions[stock_code], ContextInfo)

def execute_buy_order(stock_code, stock_name, price, ContextInfo):
    """执行买入订单"""
    try:
        # 计算买入数量
        total_assets = get_total_assets(ContextInfo.accountid)
        available_cash = get_available_cash(ContextInfo.accountid)
        
        # 单股最大投资金额
        max_investment = total_assets * ContextInfo.max_position_per_stock
        target_investment = min(available_cash * ContextInfo.position_ratio, max_investment)
        
        # 计算买入股数（手数）
        shares_to_buy = int(target_investment / price / 100) * 100
        
        if shares_to_buy >= 100:  # 至少买入1手
            # 提交买入订单
            order_id = passorder(
                23,  # 买入操作
                1101,  # 订单类型
                ContextInfo.accountid,
                stock_code,
                11,  # 价格类型
                price * 1.01,  # 稍微提高价格确保成交
                shares_to_buy,
                '策略买入',
                1,
                '买入订单',
                ContextInfo
            )
            
            if order_id:
                print(f"买入订单提交成功: {stock_name}({stock_code})")
                print(f"  价格: {price:.2f}, 数量: {shares_to_buy}, 金额: {shares_to_buy * price:.2f}")
                
                # 记录入场价格
                ContextInfo.entry_prices[stock_code] = price
            else:
                print(f"买入订单提交失败: {stock_name}({stock_code})")
        
    except Exception as e:
        print(f"执行买入订单时发生错误: {str(e)}")

def execute_sell_order(stock_code, stock_name, price, position_size, ContextInfo):
    """执行卖出订单"""
    try:
        if position_size > 0:
            # 提交卖出订单
            order_id = passorder(
                24,  # 卖出操作
                1101,  # 订单类型
                ContextInfo.accountid,
                stock_code,
                11,  # 价格类型
                price * 0.99,  # 稍微降低价格确保成交
                position_size,
                '策略卖出',
                1,
                '卖出订单',
                ContextInfo
            )
            
            if order_id:
                print(f"卖出订单提交成功: {stock_name}({stock_code})")
                print(f"  价格: {price:.2f}, 数量: {position_size}, 金额: {position_size * price:.2f}")
                
                # 计算盈亏
                if stock_code in ContextInfo.entry_prices:
                    entry_price = ContextInfo.entry_prices[stock_code]
                    profit_loss = (price - entry_price) / entry_price * 100
                    print(f"  盈亏: {profit_loss:.2f}%")
                    
                    # 清除入场价格记录
                    del ContextInfo.entry_prices[stock_code]
            else:
                print(f"卖出订单提交失败: {stock_name}({stock_code})")
    
    except Exception as e:
        print(f"执行卖出订单时发生错误: {str(e)}")

def risk_management(ContextInfo, current_positions):
    """风险管理"""
    try:
        # 检查止损
        for stock_code, position_size in current_positions.items():
            if position_size > 0 and stock_code in ContextInfo.entry_prices:
                current_price = get_current_price(stock_code, ContextInfo)
                entry_price = ContextInfo.entry_prices[stock_code]
                
                if current_price and entry_price:
                    # 计算亏损比例
                    loss_ratio = (entry_price - current_price) / entry_price
                    
                    # 触发止损
                    if loss_ratio >= ContextInfo.stop_loss_ratio:
                        stock_name = ContextInfo.get_stock_name(stock_code)
                        print(f"触发止损: {stock_name}({stock_code}), 亏损: {loss_ratio*100:.2f}%")
                        execute_sell_order(stock_code, stock_name, current_price, position_size, ContextInfo)
        
        # 检查总体风险
        total_assets = get_total_assets(ContextInfo.accountid)
        available_cash = get_available_cash(ContextInfo.accountid)
        position_ratio = (total_assets - available_cash) / total_assets
        
        if position_ratio > 0.95:  # 仓位过重
            print(f"警告: 当前仓位比例过高 {position_ratio*100:.1f}%")
    
    except Exception as e:
        print(f"风险管理检查时发生错误: {str(e)}")

# ===== 辅助函数 =====

def get_current_positions(account_id):
    """获取当前持仓"""
    positions = {}
    try:
        position_list = get_trade_detail_data(account_id, 'STOCK', 'POSITION')
        for position in position_list:
            stock_code = f"{position.m_strInstrumentID}.{position.m_strExchangeID}"
            positions[stock_code] = position.m_nVolume
    except Exception as e:
        print(f"获取持仓信息失败: {str(e)}")
    return positions

def get_total_assets(account_id):
    """获取总资产"""
    try:
        account_info = get_trade_detail_data(account_id, 'STOCK', 'ACCOUNT')
        for account in account_info:
            return account.m_dBalance
    except Exception as e:
        print(f"获取总资产失败: {str(e)}")
    return 0

def get_available_cash(account_id):
    """获取可用资金"""
    try:
        account_info = get_trade_detail_data(account_id, 'STOCK', 'ACCOUNT')
        for account in account_info:
            return account.m_dAvailable
    except Exception as e:
        print(f"获取可用资金失败: {str(e)}")
    return 0

def get_current_price(stock_code, ContextInfo):
    """获取当前价格"""
    try:
        current_time = timetag_to_datetime(ContextInfo.get_bar_timetag(ContextInfo.barpos-1), '%Y%m%d%H%M%S')
        data = ContextInfo.get_market_data_ex(
            ['close'],
            stock_code=[stock_code],
            end_time=current_time,
            period='1d',
            count=1,
            dividend_type='front',
            fill_data=True,
            subscribe=True
        )
        
        if stock_code in data and len(data[stock_code]) > 0:
            return data[stock_code][-1].close
    except Exception as e:
        print(f"获取 {stock_code} 当前价格失败: {str(e)}")
    return None

def display_account_info(ContextInfo):
    """显示账户信息"""
    try:
        account_info = get_trade_detail_data(ContextInfo.accountid, 'STOCK', 'ACCOUNT')
        for account in account_info:
            print(f"账户信息 - 总资产: {account.m_dBalance:.2f}, "
                  f"可用资金: {account.m_dAvailable:.2f}, "
                  f"持仓盈亏: {account.m_dPositionProfit:.2f}")
    except Exception as e:
        print(f"显示账户信息失败: {str(e)}")

def get_current_time(ContextInfo):
    """获取当前时间"""
    return timetag_to_datetime(ContextInfo.get_bar_timetag(ContextInfo.barpos-1), '%Y-%m-%d %H:%M:%S')

def update_performance_metrics(ContextInfo):
    """更新绩效指标"""
    try:
        # 计算持仓比例
        total_assets = get_total_assets(ContextInfo.accountid)
        available_cash = get_available_cash(ContextInfo.accountid)
        
        if total_assets > 0:
            position_ratio = (total_assets - available_cash) / total_assets
            ContextInfo.paint('持仓比例', position_ratio, -1, 2, 'red', 'noaxis')
    
    except Exception as e:
        print(f"更新绩效指标失败: {str(e)}")