# 第八章：定时交易策略实现

## 概述

在量化交易中，定时执行特定交易操作是一个重要的功能需求。本章将详细介绍如何在QMT平台中实现定时交易策略，包括盘后逆回购操作和新股新债申购等实用功能。

---

## 8.1 盘后逆回购策略

### 8.1.1 逆回购基础知识

**逆回购交易机制**：
- **交易时间**：交易日15:00收盘后至15:30
- **资金利用**：将闲置资金进行短期出借
- **收益特点**：低风险、稳定收益
- **流动性**：T+1到账，资金占用时间短

**主要逆回购品种**：

```python
REVERSE_REPO_PRODUCTS = {
    'shanghai_market': {
        '204001.SH': {'name': 'GC001', 'period': '1天', 'min_amount': 100000},
        '204002.SH': {'name': 'GC002', 'period': '2天', 'min_amount': 100000},
        '204003.SH': {'name': 'GC003', 'period': '3天', 'min_amount': 100000},
        '204007.SH': {'name': 'GC007', 'period': '7天', 'min_amount': 100000},
        '204014.SH': {'name': 'GC014', 'period': '14天', 'min_amount': 100000},
        '204028.SH': {'name': 'GC028', 'period': '28天', 'min_amount': 100000}
    },
    'shenzhen_market': {
        '131810.SZ': {'name': 'R-001', 'period': '1天', 'min_amount': 1000},
        '131811.SZ': {'name': 'R-002', 'period': '2天', 'min_amount': 1000},
        '131800.SZ': {'name': 'R-003', 'period': '3天', 'min_amount': 1000},
        '131801.SZ': {'name': 'R-007', 'period': '7天', 'min_amount': 1000},
        '131802.SZ': {'name': 'R-014', 'period': '14天', 'min_amount': 1000},
        '131803.SZ': {'name': 'R-028', 'period': '28天', 'min_amount': 1000}
    }
}
```

### 8.1.2 自动逆回购策略实现

**智能逆回购系统**：

```python
def initialize(context):
    """策略初始化"""
    # 设置逆回购执行时间（收盘后）
    run_daily(context, execute_reverse_repo, '15:10')
    
    # 策略参数配置
    context.reverse_repo_config = {
        'reserve_cash': 1010,  # 预留资金（新债中签缴费）
        'preferred_products': ['131810.SZ', '204001.SH'],  # 优先选择的产品
        'min_investment': 1000,  # 最小投资金额
        'max_investment_ratio': 0.95  # 最大投资比例
    }
    
    # 收益率阈值设置
    context.yield_thresholds = {
        '1_day': 0.015,    # 1天期最低收益率1.5%
        '7_day': 0.025,    # 7天期最低收益率2.5%
        '14_day': 0.035,   # 14天期最低收益率3.5%
        '28_day': 0.045    # 28天期最低收益率4.5%
    }

def execute_reverse_repo(context):
    """执行逆回购操作"""
    try:
        # 获取可用资金
        available_cash = context.portfolio.cash
        log.info(f"当前可用资金: {available_cash:.2f}元")
        
        # 计算投资金额
        investment_amount = available_cash - context.reverse_repo_config['reserve_cash']
        
        if investment_amount < context.reverse_repo_config['min_investment']:
            log.info(f"可投资金额不足，需要至少{context.reverse_repo_config['min_investment']}元")
            return
        
        # 选择最优逆回购产品
        best_product = select_best_reverse_repo_product(context, investment_amount)
        
        if best_product:
            # 执行逆回购交易
            execute_repo_trade(context, best_product, investment_amount)
        else:
            log.info("未找到符合条件的逆回购产品")
            
    except Exception as e:
        log.error(f"逆回购执行失败: {str(e)}")

def select_best_reverse_repo_product(context, investment_amount):
    """选择最优逆回购产品"""
    best_product = None
    best_yield = 0
    
    # 获取当前逆回购收益率
    for product_code in context.reverse_repo_config['preferred_products']:
        try:
            # 获取实时报价
            current_data = get_current_data([product_code])
            current_price = current_data[product_code].last_price
            
            # 计算年化收益率
            annual_yield = calculate_repo_yield(product_code, current_price)
            
            # 获取产品信息
            product_info = get_product_info(product_code)
            period_key = f"{product_info['period']}_day"
            
            # 检查是否满足收益率阈值
            threshold = context.yield_thresholds.get(period_key, 0)
            
            if annual_yield > threshold and annual_yield > best_yield:
                # 检查资金是否满足最小投资要求
                min_amount = product_info['min_amount']
                if investment_amount >= min_amount:
                    best_product = {
                        'code': product_code,
                        'price': current_price,
                        'yield': annual_yield,
                        'period': product_info['period'],
                        'min_amount': min_amount
                    }
                    best_yield = annual_yield
                    
        except Exception as e:
            log.warning(f"获取{product_code}数据失败: {str(e)}")
    
    if best_product:
        log.info(f"选择逆回购产品: {best_product['code']}, "
                f"年化收益率: {best_product['yield']:.3f}%, "
                f"期限: {best_product['period']}天")
    
    return best_product

def execute_repo_trade(context, product, investment_amount):
    """执行逆回购交易"""
    product_code = product['code']
    min_amount = product['min_amount']
    
    # 计算交易数量（向下取整到最小交易单位）
    trade_quantity = int(investment_amount / min_amount) * (min_amount // 10)
    
    if trade_quantity > 0:
        # 执行卖出操作（逆回购是卖出操作）
        order_result = order(product_code, -trade_quantity)
        
        if order_result:
            log.info(f"逆回购委托成功: {product_code}, "
                    f"数量: {trade_quantity}, "
                    f"预期收益率: {product['yield']:.3f}%")
        else:
            log.error(f"逆回购委托失败: {product_code}")
    else:
        log.warning(f"计算的交易数量为0，无法执行交易")

def calculate_repo_yield(product_code, current_price):
    """计算逆回购年化收益率"""
    # 逆回购年化收益率 = (100 - 价格) / 价格 * 365 / 期限天数 * 100
    product_info = get_product_info(product_code)
    period_days = product_info['period']
    
    if current_price > 0:
        daily_yield = (100 - current_price) / current_price
        annual_yield = daily_yield * 365 / period_days * 100
        return annual_yield
    else:
        return 0

def get_product_info(product_code):
    """获取逆回购产品信息"""
    all_products = {**REVERSE_REPO_PRODUCTS['shanghai_market'], 
                   **REVERSE_REPO_PRODUCTS['shenzhen_market']}
    return all_products.get(product_code, {'period': 1, 'min_amount': 1000})

def before_trading_start(context, data):
    """开盘前准备"""
    import datetime
    current_date = datetime.datetime.now().strftime('%Y-%m-%d')
    log.info(f"交易日期: {current_date}")
    
    # 检查是否为特殊交易日（如节假日前）
    context.is_special_day = check_special_trading_day(current_date)
    
    if context.is_special_day:
        log.info("检测到特殊交易日，调整逆回购策略")
        # 节假日前可能选择更长期限的逆回购
        context.yield_thresholds = {
            '1_day': 0.020,    # 提高收益率要求
            '7_day': 0.030,
            '14_day': 0.040,
            '28_day': 0.050
        }

def check_special_trading_day(date_str):
    """检查是否为特殊交易日"""
    # 这里可以添加节假日判断逻辑
    # 简化处理，实际应用中需要接入交易日历API
    import datetime
    date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d')
    weekday = date_obj.weekday()
    
    # 周五被认为是特殊交易日（周末前）
    return weekday == 4

def handle_data(context, data):
    """主策略逻辑（盘中不执行逆回购）"""
    pass

def on_order_response(context, order_list):
    """委托回报处理"""
    for order_info in order_list:
        if order_info['stock_code'] in [code for codes in REVERSE_REPO_PRODUCTS.values() for code in codes.keys()]:
            log.info(f"逆回购委托回报: {order_info}")
            
            if order_info['status'] == '2':  # 委托成功
                log.info(f"逆回购委托成功 - 代码: {order_info['stock_code']}, "
                        f"数量: {order_info['amount']}, "
                        f"价格: {order_info['price']}")
            elif order_info['error_info']:
                log.error(f"逆回购委托失败: {order_info['error_info']}")
```

---

## 8.2 新股新债申购策略

### 8.2.1 申购机制详解

**新股申购规则**：
- **申购时间**：交易日9:30-11:30, 13:00-15:00
- **申购单位**：沪市1000股，深市500股
- **申购上限**：根据持有市值确定
- **中签缴费**：T+2日16:00前缴费

**新债申购特点**：
- **申购门槛**：无需持有股票市值
- **申购数量**：通常每个账户10张（1000元）
- **中签概率**：相对较高
- **上市表现**：首日涨幅通常10%-30%

### 8.2.2 智能申购系统

**全自动申购策略**：

```python
def initialize(context):
    """初始化申购策略"""
    # 设置申购执行时间
    run_daily(context, execute_ipo_subscription, '13:30')
    
    # 申购配置参数
    context.ipo_config = {
        'enable_stock_ipo': True,      # 启用新股申购
        'enable_bond_ipo': True,       # 启用新债申购
        'enable_etf_ipo': True,        # 启用ETF申购
        'max_single_amount': 100000,   # 单只最大申购金额
        'reserve_cash': 50000,         # 预留现金
        'auto_payment': True           # 自动缴费
    }
    
    # 申购黑名单（避免申购某些股票）
    context.ipo_blacklist = [
        # 可以添加不想申购的股票代码
    ]
    
    # 申购统计
    context.ipo_stats = {
        'total_subscriptions': 0,
        'successful_subscriptions': 0,
        'total_winnings': 0,
        'total_profit': 0
    }

def execute_ipo_subscription(context):
    """执行新股新债申购"""
    try:
        log.info("开始执行新股新债申购")
        
        # 获取当日可申购的新股新债
        available_ipos = get_available_ipos()
        
        if not available_ipos:
            log.info("今日无可申购的新股新债")
            return
        
        # 执行申购
        for ipo_info in available_ipos:
            if should_subscribe(context, ipo_info):
                execute_single_ipo(context, ipo_info)
        
        # 更新申购统计
        update_ipo_statistics(context)
        
    except Exception as e:
        log.error(f"申购执行失败: {str(e)}")

def get_available_ipos():
    """获取当日可申购的新股新债列表"""
    try:
        # 调用QMT内置函数获取新股新债信息
        ipo_list = ipo_stocks_order()  # 这会返回可申购的列表
        
        available_ipos = []
        
        # 解析申购信息
        for ipo in ipo_list:
            ipo_info = {
                'code': ipo.get('stock_code', ''),
                'name': ipo.get('stock_name', ''),
                'type': determine_ipo_type(ipo.get('stock_code', '')),
                'max_quantity': ipo.get('max_qty', 0),
                'price': ipo.get('price', 0),
                'market': ipo.get('market', ''),
                'subscription_date': ipo.get('subscription_date', ''),
                'listing_date': ipo.get('listing_date', '')
            }
            available_ipos.append(ipo_info)
        
        log.info(f"发现{len(available_ipos)}只可申购的新股新债")
        return available_ipos
        
    except Exception as e:
        log.error(f"获取申购信息失败: {str(e)}")
        return []

def determine_ipo_type(stock_code):
    """判断申购类型"""
    if stock_code.startswith('78') or stock_code.startswith('787'):
        return 'STAR_STOCK'  # 科创板新股
    elif stock_code.startswith('30'):
        return 'GEM_STOCK'   # 创业板新股
    elif stock_code.startswith('12') or stock_code.startswith('11'):
        return 'CONVERTIBLE_BOND'  # 可转债
    elif stock_code.startswith('51') or stock_code.startswith('15'):
        return 'ETF'         # ETF
    else:
        return 'MAIN_STOCK'  # 主板新股

def should_subscribe(context, ipo_info):
    """判断是否应该申购"""
    # 检查黑名单
    if ipo_info['code'] in context.ipo_blacklist:
        log.info(f"跳过黑名单股票: {ipo_info['code']} {ipo_info['name']}")
        return False
    
    # 检查申购类型开关
    ipo_type = ipo_info['type']
    if ipo_type in ['STAR_STOCK', 'GEM_STOCK', 'MAIN_STOCK'] and not context.ipo_config['enable_stock_ipo']:
        return False
    elif ipo_type == 'CONVERTIBLE_BOND' and not context.ipo_config['enable_bond_ipo']:
        return False
    elif ipo_type == 'ETF' and not context.ipo_config['enable_etf_ipo']:
        return False
    
    # 检查资金充足性（主要针对可转债）
    if ipo_type == 'CONVERTIBLE_BOND':
        required_cash = ipo_info['max_quantity'] * ipo_info['price'] / 10  # 转换为元
        available_cash = context.portfolio.cash - context.ipo_config['reserve_cash']
        
        if required_cash > available_cash:
            log.warning(f"资金不足，无法申购{ipo_info['name']}")
            return False
    
    # 检查单只申购金额限制
    subscription_amount = ipo_info['max_quantity'] * ipo_info['price'] / 10
    if subscription_amount > context.ipo_config['max_single_amount']:
        log.warning(f"{ipo_info['name']}申购金额超过限制")
        return False
    
    return True

def execute_single_ipo(context, ipo_info):
    """执行单只新股新债申购"""
    try:
        stock_code = ipo_info['code']
        max_quantity = ipo_info['max_quantity']
        stock_name = ipo_info['name']
        ipo_type = ipo_info['type']
        
        # 计算申购数量
        if ipo_type == 'CONVERTIBLE_BOND':
            # 可转债通常申购上限为10张
            subscription_qty = min(max_quantity, 10)
        else:
            # 新股申购使用最大可申购数量
            subscription_qty = max_quantity
        
        if subscription_qty > 0:
            # 执行申购
            order_result = order(stock_code, subscription_qty)
            
            if order_result:
                log.info(f"申购成功: {stock_code} {stock_name}, 数量: {subscription_qty}")
                context.ipo_stats['total_subscriptions'] += 1
                
                # 记录申购信息
                record_subscription(context, ipo_info, subscription_qty)
            else:
                log.error(f"申购失败: {stock_code} {stock_name}")
        else:
            log.warning(f"申购数量为0: {stock_code} {stock_name}")
            
    except Exception as e:
        log.error(f"申购{ipo_info['name']}时发生错误: {str(e)}")

def record_subscription(context, ipo_info, quantity):
    """记录申购信息"""
    subscription_record = {
        'date': get_current_date(),
        'code': ipo_info['code'],
        'name': ipo_info['name'],
        'type': ipo_info['type'],
        'quantity': quantity,
        'price': ipo_info['price'],
        'amount': quantity * ipo_info['price'] / 10
    }
    
    # 可以将记录保存到文件或数据库
    log.info(f"申购记录: {subscription_record}")

def update_ipo_statistics(context):
    """更新申购统计信息"""
    log.info(f"申购统计 - 总申购次数: {context.ipo_stats['total_subscriptions']}, "
            f"成功次数: {context.ipo_stats['successful_subscriptions']}, "
            f"中签次数: {context.ipo_stats['total_winnings']}")

def check_ipo_results(context):
    """检查申购结果和中签情况"""
    try:
        # 获取持仓信息，查看是否有新增的新股
        positions = context.portfolio.positions
        
        for stock_code, position in positions.items():
            if position.total_amount > 0:
                # 检查是否为新申购的股票
                if is_recent_ipo(stock_code):
                    log.info(f"中签通知: {stock_code}, 数量: {position.total_amount}")
                    context.ipo_stats['total_winnings'] += 1
                    
                    # 如果启用自动缴费，确保账户有足够资金
                    if context.ipo_config['auto_payment']:
                        ensure_payment_funds(context, stock_code, position.total_amount)
        
    except Exception as e:
        log.error(f"检查申购结果失败: {str(e)}")

def is_recent_ipo(stock_code):
    """判断是否为最近申购的新股"""
    # 简化判断，实际应用中需要维护申购记录
    return stock_code.startswith(('78', '787', '30', '12', '11'))

def ensure_payment_funds(context, stock_code, quantity):
    """确保有足够资金缴费"""
    try:
        # 获取股票价格信息
        current_data = get_current_data([stock_code])
        if stock_code in current_data:
            price = current_data[stock_code].last_price
            required_amount = quantity * price
            
            available_cash = context.portfolio.cash
            
            if available_cash < required_amount:
                log.warning(f"资金不足，无法缴费 {stock_code}, "
                           f"需要: {required_amount:.2f}, "
                           f"可用: {available_cash:.2f}")
            else:
                log.info(f"资金充足，可以缴费 {stock_code}")
                
    except Exception as e:
        log.error(f"检查缴费资金失败: {str(e)}")

def before_trading_start(context, data):
    """开盘前准备"""
    import datetime
    current_date = datetime.datetime.now().strftime('%Y-%m-%d')
    log.info(f"交易日期: {current_date}")
    
    # 检查申购结果
    check_ipo_results(context)

def handle_data(context, data):
    """主策略逻辑"""
    pass

def on_order_response(context, order_list):
    """委托回报处理"""
    for order_info in order_list:
        # 检查是否为申购委托
        if is_ipo_order(order_info['stock_code']):
            log.info(f"申购委托回报: {order_info}")
            
            if order_info['status'] == '2':  # 委托成功
                context.ipo_stats['successful_subscriptions'] += 1
                log.info(f"申购委托成功 - 代码: {order_info['stock_code']}")
            elif order_info['error_info']:
                log.error(f"申购委托失败: {order_info['error_info']}")

def is_ipo_order(stock_code):
    """判断是否为申购订单"""
    ipo_prefixes = ['78', '787', '30', '12', '11', '51', '15']
    return any(stock_code.startswith(prefix) for prefix in ipo_prefixes)

def get_current_date():
    """获取当前日期"""
    import datetime
    return datetime.datetime.now().strftime('%Y-%m-%d')
```

---

## 8.3 定时策略优化

### 8.3.1 执行时间优化

**最佳执行时间选择**：

```python
OPTIMAL_EXECUTION_TIMES = {
    'reverse_repo': {
        'primary_time': '15:10',    # 主要执行时间
        'backup_time': '15:20',     # 备用执行时间
        'latest_time': '15:25'      # 最晚执行时间
    },
    'ipo_subscription': {
        'morning_time': '10:30',    # 上午申购时间
        'afternoon_time': '13:30',  # 下午申购时间（推荐）
        'late_time': '14:30'        # 较晚申购时间
    },
    'special_situations': {
        'holiday_before': '14:50',  # 节假日前提前执行
        'month_end': '15:05',       # 月末提前执行
        'quarter_end': '15:00'      # 季末提前执行
    }
}
```

### 8.3.2 异常处理机制

**健壮的错误处理**：

```python
class TimedStrategyManager:
    """定时策略管理器"""
    
    def __init__(self):
        self.retry_config = {
            'max_retries': 3,
            'retry_interval': 60,  # 秒
            'exponential_backoff': True
        }
        self.execution_log = []
    
    def execute_with_retry(self, func, context, *args, **kwargs):
        """带重试机制的执行"""
        for attempt in range(self.retry_config['max_retries']):
            try:
                result = func(context, *args, **kwargs)
                self.log_execution(func.__name__, 'success', attempt + 1)
                return result
                
            except Exception as e:
                self.log_execution(func.__name__, 'failed', attempt + 1, str(e))
                
                if attempt < self.retry_config['max_retries'] - 1:
                    # 计算重试间隔
                    if self.retry_config['exponential_backoff']:
                        wait_time = self.retry_config['retry_interval'] * (2 ** attempt)
                    else:
                        wait_time = self.retry_config['retry_interval']
                    
                    log.warning(f"执行失败，{wait_time}秒后重试: {str(e)}")
                    time.sleep(wait_time)
                else:
                    log.error(f"执行最终失败: {str(e)}")
                    raise e
    
    def log_execution(self, func_name, status, attempt, error_msg=None):
        """记录执行日志"""
        log_entry = {
            'timestamp': get_current_time(),
            'function': func_name,
            'status': status,
            'attempt': attempt,
            'error': error_msg
        }
        self.execution_log.append(log_entry)
        
        # 保持日志大小
        if len(self.execution_log) > 1000:
            self.execution_log = self.execution_log[-500:]
```

---

## 总结

本章详细介绍了QMT平台中定时交易策略的实现方法，包括：

1. **盘后逆回购策略**：自动化的资金管理和收益优化
2. **新股新债申购**：全自动申购系统和中签管理
3. **定时执行优化**：最佳时间选择和异常处理

这些定时策略可以帮助投资者：
- **提高资金利用效率**：通过逆回购获得额外收益
- **把握申购机会**：自动参与新股新债申购
- **降低操作成本**：减少人工干预和操作失误

在实际应用中，建议根据个人资金规模和风险偏好调整相关参数，并定期监控策略执行效果。

下一章我们将探讨更高级的量化策略开发技巧。