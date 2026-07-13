# 第十三章：QMT实时事件回调机制详解

QMT量化交易平台提供了强大的实时事件回调机制，允许策略在特定事件发生时自动执行相应的处理逻辑。这些回调函数是构建高效量化交易系统的重要组件。

---

## 13.1 回调机制概述

### 13.1.1 回调函数特点

**主推函数定义**：主推函数是无需开发者主动调用的特殊函数，当特定事件发生时，QMT系统会自动触发执行。

**核心特征**：
- **事件驱动**：基于交易事件自动触发
- **实时响应**：事件发生时立即执行
- **无需调用**：系统自动管理函数执行
- **状态同步**：实时反映账户和交易状态变化

### 13.1.2 使用条件与限制

**重要提醒**：
- 回调函数仅在**实盘运行模式**下生效
- 必须在"策略交易"界面中运行策略
- 策略代码必须包含相应的回调函数定义
- 在策略编辑器中无法观察到执行效果

**部署要求**：
1. 策略必须在实盘模式下运行
2. 需要通过`ContextInfo.set_account()`设置账户
3. 相关交易事件必须实际发生才能触发回调

---

## 13.2 账户状态回调

### 13.2.1 资金账户变化回调

**函数名称**：`account_callback()`

**触发条件**：当资金账户状态发生变化时自动执行

**函数签名**：
```python
def account_callback(ContextInfo, accountInfo):
    pass
```

**参数说明**：
- `ContextInfo`：策略上下文对象
- `accountInfo`：账户信息对象，包含完整的账户状态数据

**实现示例**：
```python
# coding:gbk

def init(ContextInfo):
    # 设置监控的资金账户
    ContextInfo.set_account('410038216969')  # 请替换为实际账户

def account_callback(ContextInfo, accountInfo):
    """资金账户状态变化处理"""
    print('========== 账户状态更新 ==========')
    
    # 基础账户信息
    print(f"账户ID: {accountInfo.m_strAccountID}")
    print(f"账户类型: {get_account_type_desc(accountInfo.m_nBrokerType)}")
    print(f"账户状态: {accountInfo.m_strStatus}")
    print(f"交易日期: {accountInfo.m_strTradingDate}")
    
    # 资金信息
    print(f"总资产: {accountInfo.m_dBalance:.2f}")
    print(f"可用资金: {accountInfo.m_dAvailable:.2f}")
    print(f"可取资金: {accountInfo.m_dFetchBalance:.2f}")
    print(f"冻结资金: {accountInfo.m_dFrozenCash:.2f}")
    
    # 持仓信息
    print(f"股票市值: {accountInfo.m_dStockValue:.2f}")
    print(f"基金市值: {accountInfo.m_dFundValue:.2f}")
    print(f"债券市值: {accountInfo.m_dLoanValue:.2f}")
    print(f"总市值: {accountInfo.m_dInstrumentValue:.2f}")
    
    # 盈亏信息
    print(f"持仓盈亏: {accountInfo.m_dPositionProfit:.2f}")
    print(f"手续费: {accountInfo.m_dCommission:.2f}")
    
    # 风险控制信息
    if accountInfo.m_nBrokerType == 1:  # 期货账户
        print(f"保证金比率: {accountInfo.m_dMaxMarginRate:.4f}")
        print(f"风险度: {accountInfo.m_dRisk:.4f}")
        print(f"占用保证金: {accountInfo.m_dCurrMargin:.2f}")
    
    # 触发风险预警检查
    check_account_risk(accountInfo)

def get_account_type_desc(account_type):
    """获取账户类型描述"""
    type_map = {
        1: "期货账户",
        2: "股票账户", 
        3: "信用账户",
        5: "期货期权账户",
        6: "股票期权账户",
        7: "沪港通账户",
        11: "深港通账户"
    }
    return type_map.get(account_type, f"未知类型({account_type})")

def check_account_risk(accountInfo):
    """账户风险检查"""
    # 可用资金预警
    if accountInfo.m_dAvailable < 10000:
        print("⚠️ 警告：可用资金不足1万元")
    
    # 期货账户风险度检查
    if accountInfo.m_nBrokerType == 1 and accountInfo.m_dRisk > 0.8:
        print("🚨 严重警告：期货账户风险度超过80%")
    
    # 持仓集中度检查
    if accountInfo.m_dStockValue > accountInfo.m_dBalance * 0.9:
        print("⚠️ 警告：股票持仓过于集中")
```

---

## 13.3 交易执行回调

### 13.3.1 任务状态变化回调

**函数名称**：`task_callback()`

**触发条件**：当交易任务状态发生变化时自动执行

**函数签名**：
```python
def task_callback(ContextInfo, taskInfo):
    pass
```

**实现示例**：
```python
def init(ContextInfo):
    ContextInfo.set_account('410038216969')

def task_callback(ContextInfo, taskInfo):
    """交易任务状态变化处理"""
    print('========== 交易任务状态更新 ==========')
    
    # 任务基本信息
    print(f"任务ID: {taskInfo.m_nTaskId}")
    print(f"任务状态: {get_task_status_desc(taskInfo.m_eStatus)}")
    print(f"状态消息: {taskInfo.m_strMsg}")
    
    # 交易信息
    print(f"证券代码: {taskInfo.m_stockCode}")
    print(f"账户ID: {taskInfo.m_strAccountID}")
    print(f"操作类型: {get_operation_type_desc(taskInfo.m_eOperationType)}")
    print(f"委托价格: {taskInfo.m_dFixPrice}")
    print(f"委托数量: {taskInfo.m_nNum}")
    print(f"已成交量: {taskInfo.m_nBusinessNum}")
    
    # 时间信息
    print(f"开始时间: {format_timestamp(taskInfo.m_startTime)}")
    if taskInfo.m_endTime != 2147483647:
        print(f"结束时间: {format_timestamp(taskInfo.m_endTime)}")
    
    # 任务完成度分析
    if taskInfo.m_nNum > 0:
        completion_rate = taskInfo.m_nBusinessNum / taskInfo.m_nNum
        print(f"完成度: {completion_rate:.2%}")
        
        if completion_rate == 1.0:
            print("✅ 任务已完全成交")
        elif completion_rate > 0:
            print(f"🔄 任务部分成交，剩余: {taskInfo.m_nNum - taskInfo.m_nBusinessNum}")

def get_task_status_desc(status):
    """获取任务状态描述"""
    status_map = {
        0: "未知状态",
        1: "等待中",
        2: "执行中", 
        3: "已完成",
        4: "已取消",
        5: "执行失败"
    }
    return status_map.get(status, f"状态码({status})")

def get_operation_type_desc(op_type):
    """获取操作类型描述"""
    # 这里可以根据实际的操作类型码进行映射
    return f"操作类型({op_type})"

def format_timestamp(timestamp):
    """格式化时间戳"""
    if timestamp == 2147483647:
        return "未设置"
    return str(timestamp)  # 可以进一步格式化为可读时间
```

### 13.3.2 委托状态变化回调

**函数名称**：`order_callback()`

**触发条件**：当委托订单状态发生变化时自动执行

**实现示例**：
```python
def init(ContextInfo):
    ContextInfo.set_account('410038216969')

def order_callback(ContextInfo, orderInfo):
    """委托状态变化处理"""
    print('========== 委托状态更新 ==========')
    
    # 委托基本信息
    print(f"账户: {orderInfo.m_strAccountID}")
    print(f"证券代码: {orderInfo.m_strInstrumentID}")
    print(f"证券名称: {orderInfo.m_strInstrumentName}")
    print(f"委托号: {orderInfo.m_strOrderSysID}")
    print(f"内部委托号: {orderInfo.m_strOrderRef}")
    
    # 委托详情
    print(f"交易方向: {get_direction_desc(orderInfo.m_nDirection)}")
    print(f"委托价格: {orderInfo.m_dLimitPrice}")
    print(f"委托数量: {orderInfo.m_nVolumeTotalOriginal}")
    print(f"已成交量: {orderInfo.m_nVolumeTraded}")
    print(f"剩余数量: {orderInfo.m_nVolumeTotal}")
    
    # 状态信息
    print(f"委托状态: {get_order_status_desc(orderInfo.m_nOrderStatus)}")
    print(f"委托时间: {orderInfo.m_strInsertDate} {orderInfo.m_strInsertTime}")
    
    # 成交信息
    if orderInfo.m_nVolumeTraded > 0:
        print(f"成交均价: {orderInfo.m_dTradedPrice}")
        print(f"成交金额: {orderInfo.m_dTradeAmount}")
    
    # 错误信息
    if orderInfo.m_nErrorID != 2147483647:
        print(f"错误代码: {orderInfo.m_nErrorID}")
        print(f"错误信息: {orderInfo.m_strErrorMsg}")
    
    # 冻结资金信息
    print(f"冻结金额: {orderInfo.m_dFrozenMargin}")
    print(f"冻结手续费: {orderInfo.m_dFrozenCommission}")
    
    # 委托状态分析
    analyze_order_status(orderInfo)

def get_direction_desc(direction):
    """获取交易方向描述"""
    direction_map = {
        48: "买入",
        49: "卖出"
    }
    return direction_map.get(direction, f"方向({direction})")

def get_order_status_desc(status):
    """获取委托状态描述"""
    status_map = {
        48: "未知状态",
        49: "尚未触发",
        50: "已提交",
        51: "已接受",
        52: "部分成交",
        53: "全部成交",
        54: "已撤销",
        55: "已拒绝"
    }
    return status_map.get(status, f"状态({status})")

def analyze_order_status(orderInfo):
    """委托状态分析"""
    if orderInfo.m_nOrderStatus == 53:  # 全部成交
        print("✅ 委托已全部成交")
    elif orderInfo.m_nOrderStatus == 52:  # 部分成交
        fill_rate = orderInfo.m_nVolumeTraded / orderInfo.m_nVolumeTotalOriginal
        print(f"🔄 委托部分成交，成交率: {fill_rate:.2%}")
    elif orderInfo.m_nOrderStatus == 54:  # 已撤销
        print("❌ 委托已被撤销")
    elif orderInfo.m_nOrderStatus == 55:  # 已拒绝
        print("🚫 委托被拒绝")
```

### 13.3.3 成交状态变化回调

**函数名称**：`deal_callback()`

**触发条件**：当发生实际成交时自动执行

**实现示例**：
```python
def init(ContextInfo):
    ContextInfo.set_account('410038216969')

def deal_callback(ContextInfo, dealInfo):
    """成交状态变化处理"""
    print('========== 成交记录更新 ==========')
    
    # 成交基本信息
    print(f"账户: {dealInfo.m_strAccountID}")
    print(f"证券代码: {dealInfo.m_strInstrumentID}")
    print(f"证券名称: {dealInfo.m_strInstrumentName}")
    print(f"成交编号: {dealInfo.m_strTradeID}")
    print(f"委托号: {dealInfo.m_strOrderSysID}")
    
    # 成交详情
    print(f"交易方向: {get_direction_desc(dealInfo.m_nDirection)}")
    print(f"成交价格: {dealInfo.m_dPrice}")
    print(f"成交数量: {dealInfo.m_nVolume}")
    print(f"成交金额: {dealInfo.m_dTradeAmount}")
    print(f"手续费: {dealInfo.m_dComssion}")
    
    # 时间信息
    print(f"成交日期: {dealInfo.m_strTradeDate}")
    print(f"成交时间: {dealInfo.m_strTradeTime}")
    
    # 期货相关信息
    if dealInfo.m_nOffsetFlag != 48:  # 非股票交易
        print(f"开平标志: {get_offset_flag_desc(dealInfo.m_nOffsetFlag)}")
        print(f"平今数量: {dealInfo.m_nCloseTodayVolume}")
        print(f"平仓盈亏: {dealInfo.m_dCloseProfit}")
    
    # 港股通相关
    if dealInfo.m_dPriceRMB > 0:
        print(f"港股通成交价(RMB): {dealInfo.m_dPriceRMB}")
        print(f"港股通成交额(RMB): {dealInfo.m_dTradeAmountRMB}")
        print(f"汇率: {dealInfo.m_dReferenceRate}")
    
    # 成交分析
    analyze_deal(dealInfo)

def get_offset_flag_desc(offset_flag):
    """获取开平标志描述"""
    offset_map = {
        48: "开仓",
        49: "平仓",
        50: "平今",
        51: "平昨"
    }
    return offset_map.get(offset_flag, f"标志({offset_flag})")

def analyze_deal(dealInfo):
    """成交分析"""
    # 计算成交成本
    total_cost = dealInfo.m_dTradeAmount + dealInfo.m_dComssion
    print(f"💰 总成本: {total_cost:.2f}")
    
    # 大额成交提醒
    if dealInfo.m_dTradeAmount > 100000:
        print("🔔 大额成交提醒：成交金额超过10万元")
    
    # 高手续费提醒
    if dealInfo.m_dComssion > dealInfo.m_dTradeAmount * 0.001:
        print("⚠️ 手续费较高，请检查费率设置")
```

---

## 13.4 持仓状态回调

### 13.4.1 持仓变化回调

**函数名称**：`position_callback()`

**触发条件**：当账户持仓状态发生变化时自动执行

**特殊说明**：此回调函数可以在策略编辑器中直接运行测试

**实现示例**：
```python
def init(ContextInfo):
    ContextInfo.set_account('410038216969')

def position_callback(ContextInfo, positionInfo):
    """持仓状态变化处理"""
    print('========== 持仓状态更新 ==========')
    
    # 持仓基本信息
    print(f"账户: {positionInfo.m_strAccountID}")
    print(f"证券代码: {positionInfo.m_strInstrumentID}")
    print(f"证券名称: {positionInfo.m_strInstrumentName}")
    print(f"股东账户: {positionInfo.m_strStockHolder}")
    
    # 持仓数量信息
    print(f"持仓数量: {positionInfo.m_nVolume}")
    print(f"可用数量: {positionInfo.m_nCanUseVolume}")
    print(f"冻结数量: {positionInfo.m_nFrozenVolume}")
    print(f"在途股份: {positionInfo.m_nOnRoadVolume}")
    print(f"昨日持仓: {positionInfo.m_nYesterdayVolume}")
    
    # 成本和价格信息
    print(f"持仓成本: {positionInfo.m_dOpenPrice:.4f}")
    print(f"开仓均价: {positionInfo.m_dAvgOpenPrice:.4f}")
    print(f"最新价格: {positionInfo.m_dLastPrice:.4f}")
    print(f"结算价格: {positionInfo.m_dSettlementPrice:.4f}")
    
    # 盈亏信息
    print(f"持仓成本总额: {positionInfo.m_dPositionCost:.2f}")
    print(f"市值: {positionInfo.m_dMarketValue:.2f}")
    print(f"浮动盈亏: {positionInfo.m_dFloatProfit:.2f}")
    print(f"持仓盈亏: {positionInfo.m_dPositionProfit:.2f}")
    print(f"盈亏比例: {positionInfo.m_dProfitRate:.4f}")
    
    # 期货相关信息
    if positionInfo.m_nDirection != 48:  # 非股票
        print(f"交易方向: {get_direction_desc(positionInfo.m_nDirection)}")
        print(f"占用保证金: {positionInfo.m_dMargin:.2f}")
        print(f"平仓盈亏: {positionInfo.m_dCloseProfit:.2f}")
    
    # 期权相关信息
    if positionInfo.m_eSideFlag != 0:
        print(f"持仓类型: {get_side_flag_desc(positionInfo.m_eSideFlag)}")
        print(f"权利金: {positionInfo.m_dRoyalty:.2f}")
        print(f"备兑数量: {positionInfo.m_nCoveredVolume}")
    
    # 持仓分析
    analyze_position(positionInfo)

def get_side_flag_desc(side_flag):
    """获取持仓类型描述"""
    side_map = {
        0: "普通持仓",
        1: "权利仓",
        2: "义务仓",
        3: "备兑仓"
    }
    return side_map.get(side_flag, f"类型({side_flag})")

def analyze_position(positionInfo):
    """持仓分析"""
    # 盈亏分析
    if positionInfo.m_dPositionProfit > 0:
        print(f"📈 盈利持仓，收益率: {positionInfo.m_dProfitRate:.2%}")
    elif positionInfo.m_dPositionProfit < 0:
        print(f"📉 亏损持仓，亏损率: {abs(positionInfo.m_dProfitRate):.2%}")
    
    # 风险提醒
    if abs(positionInfo.m_dProfitRate) > 0.1:
        print("⚠️ 持仓盈亏幅度较大，请注意风险控制")
    
    # 流动性检查
    if positionInfo.m_nFrozenVolume > positionInfo.m_nVolume * 0.5:
        print("🔒 大部分持仓被冻结，注意流动性风险")
```

---

## 13.5 异常处理回调

### 13.5.1 下单异常回调

**函数名称**：`orderError_callback()`

**触发条件**：当下单操作发生异常时自动执行

**实现示例**：
```python
def init(ContextInfo):
    ContextInfo.set_account('410038216969')

def orderError_callback(ContextInfo, orderArgs):
    """下单异常处理"""
    print('========== 下单异常处理 ==========')
    
    # 基本信息
    print(f"账户ID: {orderArgs.m_strAccountID}")
    print(f"证券代码: {orderArgs.m_strInstrumentID}")
    print(f"证券名称: {orderArgs.m_strInstrumentName}")
    
    # 异常分析和处理
    print("🚨 下单操作发生异常，请检查：")
    print("1. 账户资金是否充足")
    print("2. 证券代码是否正确")
    print("3. 交易时间是否在允许范围内")
    print("4. 委托价格和数量是否符合规则")
    
    # 记录异常信息用于后续分析
    log_order_error(orderArgs)

def log_order_error(orderArgs):
    """记录下单异常信息"""
    # 这里可以将异常信息记录到文件或数据库
    # 用于后续的异常分析和策略优化
    pass
```

---

## 13.6 回调函数最佳实践

### 13.6.1 性能优化建议

1. **避免耗时操作**：回调函数应快速执行，避免复杂计算
2. **异步处理**：对于复杂逻辑，考虑异步处理机制
3. **异常处理**：添加适当的异常处理，防止回调函数崩溃
4. **日志记录**：记录关键事件和异常信息

### 13.6.2 实际应用场景

```python
def init(ContextInfo):
    ContextInfo.set_account('410038216969')
    # 初始化策略参数
    ContextInfo.strategy_params = {
        'max_position_ratio': 0.8,  # 最大持仓比例
        'stop_loss_ratio': 0.05,    # 止损比例
        'take_profit_ratio': 0.15   # 止盈比例
    }

def position_callback(ContextInfo, positionInfo):
    """基于持仓变化的风险控制"""
    params = ContextInfo.strategy_params
    
    # 止损检查
    if positionInfo.m_dProfitRate < -params['stop_loss_ratio']:
        print(f"触发止损：{positionInfo.m_strInstrumentID}")
        # 执行止损操作
        execute_stop_loss(ContextInfo, positionInfo)
    
    # 止盈检查
    elif positionInfo.m_dProfitRate > params['take_profit_ratio']:
        print(f"触发止盈：{positionInfo.m_strInstrumentID}")
        # 执行止盈操作
        execute_take_profit(ContextInfo, positionInfo)

def execute_stop_loss(ContextInfo, positionInfo):
    """执行止损操作"""
    # 实现止损逻辑
    pass

def execute_take_profit(ContextInfo, positionInfo):
    """执行止盈操作"""
    # 实现止盈逻辑
    pass
```

通过合理使用这些回调函数，可以构建出响应迅速、风险可控的量化交易系统。回调机制是实现高频交易、风险管理和实时监控的重要技术基础。