交易函数下单 和 手动在交易界面中点击下单 ，二者的流程其实是一样的，唯一的区别是：交易函数下单通过解析下单函数接口传过来的参数，形成相应的下单任务；而手动点击下单通过解析界面的输入、选择，形成相应的下单任务。

运行策略模型的流程如下：

一、编写测试代码，并保存。

```python
# 第十二章：QMT交易函数完整参考手册

本章提供QMT量化交易平台所有交易相关函数的详细说明和使用示例。这些函数是构建量化交易策略的核心工具，涵盖了从基础下单到高级算法交易的全部功能。

---

## 12.1 核心交易函数

### 12.1.1 综合交易下单函数

**函数名称**：`passorder()`

**功能描述**：QMT平台的核心交易函数，支持多种交易类型和订单模式。

**函数语法**：
```python
passorder(opType, opCode, accountGroup, stockCode, priceType, price, volume, contextInfo)
```

**参数说明**：
- `opType`：操作类型（23-股票交易，60-ETF申赎等）
- `opCode`：操作代码（1101-买入，1102-卖出等）
- `accountGroup`：账户组名称
- `stockCode`：证券代码
- `priceType`：价格类型（5-最新价，-1-市价等）
- `price`：委托价格
- `volume`：委托数量
- `contextInfo`：上下文信息对象

**使用示例**：

def init(ContextInfo):
    pass

def handlebar(ContextInfo):
    passorder(23,1101,'6000000248','000001.SZ',5,-1,ContextInfo)
    # 在帐户 6000000248 中，买入（23）单支股票（1101），代码为 000001.SZ，按最新价（5），无论价格类型（-1），回传ContextInfo     
```



二、运行策略程序

请点击主界面上的“模型交易”按钮，以切换到模型交易界面。在此界面左侧，找到刚刚保存的策略代码。

![新建策略交易](https://zilchyao.github.io/xuntou_yao/assets/img/xtqmt27.a36e7054.png)

点击选择之后，会弹出 “新建策略交易” 窗口

![新建策略交易](data:image/png;base64,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)

在此窗口中，请选择指定你的帐号类型、资金帐号、主图代码、运行周期。最后记得点击 “确定”。

此时，应该可以在中间的策略列表部分看到刚刚选择的策略，其中策略名称就是上一步中选择的策略名称，主图标的、策略周期都是在“新建策略交易”窗口中的设定值，请仔细核对一下。

此时请点击“运行模式”下面的按钮，以切换到“实盘”模式，

![确定运行策略](data:image/png;base64,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)

在弹出的“提示”窗口中，点击“确定”

![核对策略名称](https://zilchyao.github.io/xuntou_yao/assets/img/xtqmt07.02a6563a.png)

然后，请点击 “操作”下面的 三角符号，该策略即开始运行。在下面的“成交”标签页中，如果看到了实际成交的股标，即表示该帐号已经通畅可用。

如果下单失败，可能需要 管理端 开放权限，这需要与券商 以及 讯投软件商 联系。

------

迅投 QMT 系统提供了一系列的 Python 下单函数接口，本节将详细一一介绍。

一个策略模型在下单交易时，通常是如下的流程：

（1）下单之前，首先会查询一下资金账号的信息，如：判定资金是否充足，账号是否在登录状态，统计持仓情况等等。 通常会用到 `get_trade_detail_data()` 函数； （2）等待策略模型中要求的条件是否达到（满足），条件达到了，可用下单函数，如： `passorder()` 或 `order_shares` 等方法执行交易指令； （3）下单后，即时获取 委托 和 成交 最新id，即订单号， 需要用到 `get_last_order_id()`函数获取，以便判断是否交易执行成功， 再执行后续的动作。注意如果委托生成了，就有了委托号，这个Id需要自己保存做一个全局控制。 （4）用获到的 委托号 检查 委托单 的状态，以便判断各种情况等。通常用 `get_value_by_order_id()`函数。当一个 委托单 的状态变成 “已成”后，那么就会生成一条对应的成交单（ deal）；用原 委托号 就可直接查看成交情况。委托单 和 成交单 的 Id号是一样的，都是对象 m_strOrderSysID 的属性值。可根据 Position 持仓信息进一步验证。 （5）根据 委托号 获取 委托信息，根据委托状态，或模型条件的要求，用 cancel 取消委托。

------

注：在回测模式中，交易函数调用虚拟账号进行交易，在历史 K 线上记录买卖点，用以计算策略净值/回测指标；实盘运行调用策略中设置的资金账号进行交易，产生实际委托；模拟运行模式下交易函数无效。其中，can_cancel_order, cancel_task, cancel和do_order交易函数在回测模式中无实际意义，不建议使用。

1. 交易函数

| 序号 | 函数（方法）名称      | 表达意义                     |      |
| ---- | --------------------- | ---------------------------- | ---- |
| 1    | passorder             | 综合交易下单                 |      |
| 2    | algo_passorder        | 算法交易下单                 |      |
| 3    | smart_algo_passorder  | 智能算法交易                 |      |
| 5    | get_value_by_order_id | 根据委托Id取委托或成交信息   |      |
| 6    | get_last_order_id     | 获取最新的委托或成交的委托Id |      |
| 7    | can_cancel_order      | 查询委托是否可撤销           |      |
| 8    | cancel                | 取消委托                     |      |
| 9    | cancel_task           | 撤销任务                     |      |
| 10   | pause_task            | 暂停任务                     |      |
| 11   | resume_task           | 继续任务                     |      |
| 12   | do_order              | 实时触发前一根 bar 信号函数  |      |

1. 股票下单函数

| 序号 | 函数（方法）名称     | 表达意义     |      |
| ---- | -------------------- | ------------ | ---- |
| 1    | order_lots           | 指定手数交易 |      |
| 2    | order_value          | 指定价值交易 |      |
| 3    | order_percent        | 一定比例下单 |      |
| 4    | order_target_value   | 目标价值下单 |      |
| 5    | order_target_percent | 目标比例下单 |      |
| 6    | order_shares         | 指定股数交易 |      |

1. 期货下单函数

| 序号 | 函数（方法）名称     | 表达意义           |      |
| ---- | -------------------- | ------------------ | ---- |
| 1    | buy_open             | 买入开仓           |      |
| 2    | sell_close_tdayfirst | 卖出平仓，平今优先 |      |
| 3    | sell_close_ydayfirst | 卖出平仓，平昨优先 |      |
| 4    | sell_open            | 卖出开仓           |      |
| 5    | buy_close_tdayfirst  | 买入平仓，平今优先 |      |
| 6    | buy_close_ydayfirst  | 买入平仓，平昨优先 |      |

### 2.01 综合交易下单 passorder()

TIP

这是唯一必须要理解的下单函数。别的方法（函数）如果不理解也罢了，这个必须掌握。

释义： 综合交易下单。注意：对 账号组 的操作相当于对账号组里的每个账号做同样的操作，如

```python
passorder(23,1202, 'testS', '000001.SZ', 5, -1, 50000, ContextInfo)
# 对账号组 testS 里的所有账号都以最新价开仓买入 50000 元市值的 000001.SZ 平安银行 

passorder(60,1101,"test",'510050.SH',5,-1,1,ContextInfo)
# 对账号组 test 申购1个单位(900000股)的华夏上证50ETF(只申购不买入成分股)。
```



语法：

```python
 passorder(
           opType,        # 操作动作。如 23 表示买入A股品种，24 表示卖出A股品种
           orderType,     # 下单方式。如 1101 表示 单股、单账号、普通、股/手方式下单
           accountid,     # 下单的账号ID
           orderCode,     # 交易品种代码
           prType,        # 下单时选择的价格。
           price,         # 下单价格
           volume,        # 交易量(手数)
           [strategyName, # 策略名称，可省缺
            quickTrade,   # 即时下单，可省缺
            userOrderId,  # 用户自设委托 ID， 可省缺
           ] 
           ContextInfo    # 必须对象参数
          )
```



参数：

1. optype 操作动作：

| 参数值       | 表达意义                                             | 备注 |
| ------------ | ---------------------------------------------------- | ---- |
| 用于期货六键 |                                                      |      |
| 0            | 开多                                                 |      |
| 1            | 平昨多                                               |      |
| 2            | 平今多                                               |      |
| 3            | 平开空                                               |      |
| 4            | 平昨空                                               |      |
| 5            | 平今空                                               |      |
| 用于期货四键 |                                                      |      |
| 6            | 平多，优先平今                                       |      |
| 7            | 平多，优先平昨                                       |      |
| 8            | 平空，优先平今                                       |      |
| 9            | 平空，优先平昨                                       |      |
| 用于期货两键 |                                                      |      |
| 10           | 卖出，如有多仓，优先平仓，优先平今，如有余量，再开空 |      |
| 11           | 卖出，如有多仓，优先平仓，优先平昨，如有余量，再开空 |      |
| 12           | 买入，如有空仓，优先平仓，优先平今，如有余量，再开多 |      |
| 13           | 买入，如有空仓，优先平仓，优先平昨，如有余量，再开多 |      |
| 14           | 买入，不优先平仓                                     |      |
| 15           | 卖出，不优先平仓                                     |      |
| 股票买卖     |                                                      |      |
| 23           | 买入A股，沪港通、深港通 的股票                       |      |
| 24           | 卖出A股，沪港通、深港通 的股票                       |      |
| 融资融券     |                                                      |      |
| 27           | 融资买入                                             |      |
| 28           | 融券卖出                                             |      |
| 29           | 买券还券                                             |      |
| 30           | 直接还券                                             |      |
| 31           | 卖券还款                                             |      |
| 32           | 直接还款                                             |      |
| 33           | 信用帐号股票买入                                     |      |
| 34           | 信用帐号股票卖出                                     |      |
| 组合交易     |                                                      |      |
| 25           | 组合买入，或沪港通、深港通的组合买入                 |      |
| 26           | 组合卖出，或沪港通、深港通的组合卖出                 |      |
| 27           | 融资买入                                             |      |
| 28           | 融券卖出                                             |      |
| 29           | 买券还券                                             |      |
| 31           | 卖券还款                                             |      |
| 33           | 信用账号股票买入                                     |      |
| 34           | 信用账号股票卖出                                     |      |
| 35           | 普通账号一键买卖                                     |      |
| 36           | 信用账号一键买卖                                     |      |
| 40           | 期货组合开多                                         |      |
| 43           | 期货组合开空                                         |      |
| 46           | 期货组合平多,优先平今                                |      |
| 47           | 期货组合平多,优先平昨                                |      |
| 48           | 期货组合平空,优先平今                                |      |
| 49           | 期货组合平空,优先平昨                                |      |
| 期权交易     |                                                      |      |
| 50           | 买入开仓                                             |      |
| 51           | 卖出平仓                                             |      |
| 52           | 卖出开仓                                             |      |
| 53           | 买入平仓                                             |      |
| 54           | 备兑开仓                                             |      |
| 55           | 备兑平仓                                             |      |
| 56           | 认购行权                                             |      |
| 57           | 认沽行权                                             |      |
| 58           | 证券锁定                                             |      |
| 59           | 证券解锁                                             |      |
| ETF交易      |                                                      |      |
| 60           | 申购                                                 |      |
| 61           | 赎回                                                 |      |
| 专项两融     |                                                      |      |
| 70           | 专项融资买入                                         |      |
| 71           | 专项融券卖出                                         |      |
| 72           | 专项买券还券                                         |      |
| 73           | 专项直接还券                                         |      |
| 74           | 专项卖券还款                                         |      |
| 75           | 专项直接还款                                         |      |
| 可转债       |                                                      |      |
| 80           | 普通账户转股                                         |      |
| 81           | 普通账户回售                                         |      |
| 82           | 信用账户转股                                         |      |
| 83           | 信用账户回售                                         |      |

1. orderType，下单方式

| 参数值 | 表达意义                                                     | 备注                         |
| ------ | ------------------------------------------------------------ | ---------------------------- |
| 1101   | 单股、单账号、普通、股/手方式下单                            |                              |
| 1102   | 单股、单账号、普通、金额（元）方式下单                       | （只支持股票，不支持期货）   |
| 1113   | 单股、单账号、总资产、比例 [0 ~ 1] 方式下单                  |                              |
| 1123   | 单股、单账号、可用、比例[0 ~ 1]方式下单                      |                              |
| 1201   | 单股、账号组（无权重）、普通、股/手方式下单                  |                              |
| 1202   | 单股、账号组（无权重）、普通、金额（元）方式下单             | （只支持股票，不支持期货）   |
| 1213   | 单股、账号组（无权重）、总资产、比例 [0 ~ 1] 方式下单        |                              |
| 1223   | 单股、账号组（无权重）、可用、比例 [0 ~ 1] 方式下单          |                              |
| 2101   | 组合、单账号、普通、按组合股票数量（篮子中股票设定的数量）方式下单 > 对应 volume 的单位为篮子的份 |                              |
| 2102   | 组合、单账号、普通、按组合股票权重（篮子中股票设定的权重）方式下单 > 对应 volume 的单位为元 |                              |
| 2103   | 组合、单账号、普通、按账号可用方式下单 > （底层篮子股票的分配方式是按可用资金比例后按篮子中股票权重分配，如用户没填权重则按相等权重分配） | 只对股票篮子支持             |
| 2201   | 组合、账号组（无权重）、普通、按组合股票数量方式下单         |                              |
| 2202   | 组合、账号组（无权重）、普通、按组合股票权重方式下单         |                              |
| 2203   | 组合、账号组（无权重）、普通、按账号可用方式下单只对股票篮子支持 |                              |
| 2331   | 组合、套利、合约价值自动套利、按组合股票数量方式下单         | 对应组合套利交易接口特殊设置 |
| 2332   | 组合、套利、按合约价值自动套利、按组合股票权重方式下单       | 对应组合套利交易接口特殊设置 |
| 2333   | 组合、套利、按合约价值自动套利、按账号可用方式下单           | 对应组合套利交易接口特殊设置 |

1. accountID

下单的账号ID。（可以写多个帐号 或 账号组的名称 或 套利组的名称（一个篮子一个套利账号，如 accountID = '股票账户名, 期货账号'）

1. orderCode，交易的品种代码
   a、如果是单独一个 股票 或 期货、港股 品种，此处直接填写品种合约代码即可；
   b、如果是组合交易，此处填写篮子名称；
   c、如果是组合套利，则填一个篮子名和一个期货合约名（如orderCode = '篮子名, 期货合约名'）
2. prType，下单时选择的价格。在套利交易中，这个 prType 只对篮子起作用，期货的采用默认的方式：

| 参数值 | 表达意义                     | 备注                                                |
| ------ | ---------------------------- | --------------------------------------------------- |
| -1     | 无效                         | 实际下单时,取交易面板上的交易函数设定的选价类型为准 |
| 0      | 卖5价                        |                                                     |
| 1      | 卖4价                        |                                                     |
| 2      | 卖3价                        |                                                     |
| 3      | 卖2价                        |                                                     |
| 4      | 卖1价                        |                                                     |
| 5      | 最新价                       |                                                     |
| 6      | 买1价                        |                                                     |
| 7      | 买2价                        | 组合不支持                                          |
| 8      | 买3价                        | 组合不支持                                          |
| 9      | 买4价                        | 组合不支持                                          |
| 10     | 买5价                        | 组合不支持                                          |
| 11     | 指定价模型价                 | 只对单股情况支持,对组合交易不支持                   |
| 12     | 涨跌停价                     |                                                     |
| 13     | 挂单价                       |                                                     |
| 14     | 对手价                       |                                                     |
| 27     | 市价即成剩撤                 | 仅对股票期权申报有效                                |
| 28     | 市价即全成否则撤             | 仅对股票期权申报有效                                |
| 29     | 市价剩转限价                 | 仅对股票期权申报有效                                |
| 42     | 最优五档即时成交剩余撤销申报 | 仅对上交所申报有效                                  |
| 43     | 最优五档即时成交剩转限价申报 | 仅对上交所申报有效                                  |
| 44     | 对手方最优价格委托           | 仅对深交所申报有效                                  |
| 45     | 本方最优价格委托             | 仅对深交所申报有效                                  |
| 46     | 即时成交剩余撤销委托         | 仅对深交所申报有效                                  |
| 47     | 最优五档即时成交剩余撤销委托 | 仅对深交所申报有效                                  |
| 48     | 全额成交或撤销委托           | 仅对深交所申报有效                                  |
| 49     | 科创板盘后定价               |                                                     |

1. price，下单价格。单股下单时， prType 参数为 11，49 时，此参数才有效，其它情况无效。如果 prType 参数不为 11，49 时，此参数也需要填写，可随意写任意数值，如 -1，0，2，100 等；组合下单时，是组合套利时，price 作套利比例有效，其它情况无效。
2. volume，下单数量（股 / 手 / 元 / %），即交易量。根据参数 orderType 的值，最后一位确定 volume 的单位：

| 参数值     | 表达意义             | 备注 |
| ---------- | -------------------- | ---- |
| 单股下单时 |                      |      |
| 1          | 股 / 手              |      |
| 2          | 金额（元）           |      |
| 3          | 比例（%）            |      |
| 组合下单时 |                      |      |
| 1          | 按组合股票数量（份） |      |
| 2          | 按组合股票权重（元） |      |
| 3          | 按账号可用（%）      |      |

1. strategyName，字型串型（String），自定义的策略名，用来区分 order 委托和 deal 成交来自不同的策略。根据策略名，get_trade_detail_data，get_last_order_id 方法（函数）可以获取对应的策略名称，对应的委托或持仓结果。此参数可缺省。此参数 strategyName 只对同账号本地客户端有效，即只对当前客户端下的单进行策略区分，且该策略区分只能当前客户端使用。
2. quickTrade，整数型（Int）表示是否立即触发下单。 0表示 否 ；1表示 是。passorder 执行时是对最后一根K线完全走完后，在下一根K线的第一个tick时触发下单交易；当此参数 quickTrade 设置为1时，非历史 bar上执行时（ContextInfo.is_last_bar()为True），只要策略模型中调用到就触发下单交易。当此参数 quickTrade 设置为 2 时，不判断 bar （K线）状态，只要在策略模型中调用到就触发下单交易，历史的 bar上也能触发下单，因此，在实盘运用时，可能会触 发重复下单，请谨慎使用。
3. userOrderId，整数型（String）用户自设委托 ID，可缺省不写。此参数必须必须和前面的 strategyName 和 quickTrade 参数一起使用。对应 order 委托对象和 deal 成交对象中的 m_strRemark 属性，通过 get_trade_detail_data 函数 或 委托主推函数 order_callback 和 成交主推函数 deal_callback 可以获取到 这两个对象信息。
4. userOrderParam，字符串（String），用户自定义交易参数模板名称，可缺省。如果要使用，则必须必须与前面 的 strategyName 和 quickTrade 参数一起使用。

返回：无

示例：

```python
def handlebar(ContextInfo):
	# 单股单账号期货最新价买入 10 手
	passorder(0, 1101, 'test', target, 5, -1, 10, ContextInfo)

	# 单股单账号期货指定价买入 10 手
	passorder(0, 1101, 'test', target, 11, 3000, ContextInfo)

	# 单股单账号股票最新价买入 100 股（1 手）
	passorder(23, 1101, 'test', target, 5, 0, 100, ContextInfo)

	# 单股单账号股票指定价买入 100 股（1 手）
	passorder(23, 1101, 'test', target, 11, 7, 100, ContextInfo)
```



### 2.02 智能算法交易 smart_algo_passorder()

释义： 智能算法交易

语法：

```text
smart_algo_passorder(
                     opType,
                     orderType,
                     accountid,
                     orderCode,
                     prType,
                     modelprice,
                     volume,
                     strageName,
                     quickTrade,
                     userid,
                     smartAlgoType,
                     limitOverRate,
                     minAmountPerOrder,
                     [targetPriceLevel,startTime,endTime,limitControl],
                     ContextInfo
                    )
```



参数：

1. opType 表示操作类型

| 参数值   | 表达意义                       | 备注 |
| -------- | ------------------------------ | ---- |
| 股票买卖 |                                |      |
| 23       | A股 或 沪港通、深港通 股票买入 |      |
| 24       | A股 或 沪港通、深港通 股票卖出 |      |
| 融资融券 |                                |      |
| 27       | 融资买入                       |      |
| 28       | 融券卖出                       |      |
| 29       | 买券还券                       |      |
| 30       | 直接还券                       |      |
| 31       | 卖券还款                       |      |
| 32       | 直接还款                       |      |
| 33       | 信用账号股票买入               |      |
| 34       | 信用账号股票卖出               |      |
| 35       | 普通账号一键买卖               |      |
| 36       | 信用账号一键买卖               |      |

1. orderType 表示下单方式

| 参数值 | 表达意义                                              | 备注       |
| ------ | ----------------------------------------------------- | ---------- |
| 1101   | 单股、单账号、普通、股/手方式下单                     |            |
| 1102   | 单股、单账号、普通、金额（元）方式下单                | 只支持股票 |
| 1113   | 单股、单账号、总资产、比例 [0 ~ 1] 方式下单           |            |
| 1123   | 单股、单账号、可用、比例[0 ~ 1]方式下单               |            |
| 1201   | 单股、账号组（无权重）、普通、股/手方式下单           |            |
| 1202   | 单股、账号组（无权重）、普通、金额（元）方式下单      | 只支持股票 |
| 1213   | 单股、账号组（无权重）、总资产、比例 [0 ~ 1] 方式下单 |            |
| 1223   | 单股、账号组（无权重）、可用、比例 [0 ~ 1] 方式下单   |            |

1. accountID 资金账号，下单的账号ID（可多个）或 账号组的名称 或 套利组名称（一个篮子一个套利账号,如accountID=’股票 账户名,期货账号’）
2. orderCode，下单的合约品种代码。此此的品种代码有两种，一种是 单股 或 单期货、港股,此参数填写合约代码即可，如 ‘600000.SH’；如果是组合交易,则该参数填写篮子名称；如果是组合套利,则填一个篮子名和一个期货合约名（如orderCode=’篮子名,期货合约名’）
3. prType，下单的价格类型。特殊的情况是对于套利：此参数 prType 只对篮子起作用，期货的采用默认的方式。

| 参数值 | 表达意义     | 备注                              |
| ------ | ------------ | --------------------------------- |
| 0      | 卖5价        |                                   |
| 1      | 卖4价        |                                   |
| 2      | 卖3价        |                                   |
| 3      | 卖2价        |                                   |
| 4      | 卖1价        |                                   |
| 5      | 最新价       |                                   |
| 6      | 买1价        |                                   |
| 7      | 买2价        | 组合不支持                        |
| 8      | 买3价        | 组合不支持                        |
| 9      | 买4价        | 组合不支持                        |
| 10     | 买5价        | 组合不支持                        |
| 11     | 指定价模型价 | 只对单股情况支持,对组合交易不支持 |
| 12     | 涨跌停价     |                                   |
| 13     | 挂单价       |                                   |
| 14     | 对手价       |                                   |

1. price，下单价格。仅当参数 prType 为 11 时，即模型价时，此参数 price 才有效；其它情况无效。
2. volume，下单数量，即交易量（股 / 元 / %）。根据参数 orderType 值的最后一位来确定此参数 volume 的单位：在单股下单时：1：表示股；2：金额（元）；3：表示比例（%）
3. strageName，策略名称，与方法 passorder 不同，此处不可缺省
4. quickTrade，整数值（Int），表示是否立马触发下单，0 表示 否，1表示 是
5. userid，投资备注。与方法 passorder 不同，此处不可缺省
6. smartAlgoType，字符串型（String），表示 智能算法类型

| 参数值  | 表达意义 | 备注 |
| ------- | -------- | ---- |
| VWAP    | VWAP     |      |
| TWAP    | TWAP     |      |
| VP      | 跟量     |      |
| PINLINE | 跟价     |      |
| DMA     | 快捷     |      |
| FLOAT   | 盘口     |      |
| SWITCH  | 换仓     |      |
| ICEBERG | 冰山     |      |
| MOC     | 尾盘     |      |

1. limitOverRate，整数型（Int）量比，数据范围 0 -100，如果输入其他无效值，则limitOverRate为0。网格算法无此项。
2. minAmountPerOrder，整数型（Int），智能算法最小委托金额，数据范围 0 -- 100000，默认为0。
3. targetPriceLevel，智能算法目标价格

| 参数值 | 表达意义  | 备注 |
| ------ | --------- | ---- |
| 1      | 己方盘口1 |      |
| 2      | 己方盘口2 |      |
| 3      | 己方盘口3 |      |
| 4      | 己方盘口4 |      |
| 5      | 己方盘口5 |      |
| 6      | 最新价    |      |
| 7      | 对方盘口  |      |

注： 一、输入无效值则targetPriceLevel为1； 二、本项只针对冰山算法,其他算法可缺省。

1. startTime/endTime，智能算法 开始和结束时间， 格式"HH:MM:SS"，如"10:30:00"。如果缺省值，则默认为"09:30:00"，"15:30:00"
2. limitControl，涨跌停控制 1：涨停不卖跌停不卖 0：无； 默认值为1

返回： 无

示例：

```python
def handlebar(ContextInfo):
	# 账户600000105 最新价 开仓 买入50000 000001.SZ平安银行,使用TWAP智能算法,量比20%,最小买卖金额0
    smart_algo_passorder(
                         23,
                         1101,
                         '600000105',
                         '000001.SZ',
                         5,
                         -1,
                         50000,
                         "strageName",
                         0,
                         "remark",
                         "TWAP",
                         20,
                         0,
                         ContextInfo
                        )
    # 账户600000105最新价快速交易开仓买入50000股的000001.SZ平安银行,使用TWAP智能算法,量比20%,最小买卖金额0 且有效时长为 09:30-14:00
	smart_algo_passorder(
                         23,
                         1101,
                         '600000105',
                         '000001.SZ',
                         5,
                         -1,
                         50000,
                         "strageName",
                         1,
                         "remark",
                         "TWAP",
                         20,
                         0,
                         0,
                         '09:30:00',
                         '14:00:00',
                         ContextInfo
                        )
    # 账户600000105最新价快速交易开仓买入50000股的000001.SZ平安银行,使用TWAP智能算法,量比20%,最小买卖金额0且有效时长为09:30-14:00,不对智能算法涨停做限制
	smart_algo_passorder(
                         23,
                         1101,
                         '600000105',
                         '000001.SZ',
                         5,
                         -1,
                         50000,
                         "strageName",
                         1,
                         "remark",
                         "TWAP",
                         20,
                         0,
                         0,
                         '09:30:00',
                         '14:00:00',
                         0,
                         ContextInfo
                        )
```



### 2.03 根据委托号获取委托或成交信息 get_value_by_order_id()

释义： 根据当天的 委托号 获取 委托单 或 成交单 的信息。

语法：

```text
 get_value_by_order_id(
                       orderId, 
                       accountID, 
                       strAccountType, 
                       strDatatype
                      )
```



参数：
orderId —— 字符串（String）委托号。
accountID —— 字符串（String）资金账号。
strAccountType —— 字符串型（String）账号类型。

| 参数值         | 表达意义 | 备注 |
| -------------- | -------- | ---- |
| 'FUTURE'       | 期货     |      |
| 'STOCK'        | 股票     |      |
| 'CREDIT'       | 信用     |      |
| 'HUGANGTONG'   | 沪港通   |      |
| 'SHENGANGTONG' | 深港通   |      |
| 'STOCK_OPTION' | 期权     |      |

strDatatype —— 字符串型（String）'ORDER' 表示 委托单 ，'DEAL'表示已成交的单子
返回：一个对象（PythonObj）

示例：

```python
#coding:gbk

def init(ContextInfo):
	ContextInfo.accid = '6000000248'

def handlebar(ContextInfo):
	orderid = get_last_order_id(ContextInfo.accid, 'stock', 'order')
	print(orderid)

    obj = get_value_by_order_id(orderid,ContextInfo.accid, 'stock', 'order')
	print(obj.m_strInstrumentID)
```



### 2.04 获取最新的委托或成交的委托号 get_last_order_id()

释义： 获取最新的委托或成交的委托号。

语法：

```text
get_last_order_id(
                  accountID, 
                  strAccountType, 
                  strDatatype, 
                  strategyName
                 ) 
```



参数： accountID —— 字符型（String）资金账号。 strAccountType —— 字符型（String）账号类型，可选值：

| 参数值         | 表达意义 | 备注 |
| -------------- | -------- | ---- |
| 'FUTURE'       | 期货     |      |
| 'STOCK'        | 股票     |      |
| 'CREDIT'       | 信用     |      |
| 'HUGANGTONG'   | 沪港通   |      |
| 'SHENGANGTONG' | 深港通   |      |
| 'STOCK_OPTION' | 期权     |      |

strDatatype —— 字符型（String）'ORDER' 表示 委托单 ，'DEAL'表示已成交的单子
strategyName —— 字符型（String）表达策略名称，对应 passorder 下单函数中的参数strategyName 的值。
返回： 字符型（String）表示委托号，如果没找到返回 '-1'
示例代码见上例

### 2.05 查询委托是否可撤销 can_cancel_order()

释义： 查询指定的委托单是否可撤销。 语法：

```text
can_cancel_order(
                 orderId, 
                 accountID, 
                 strAccountType
                )
```



参数：
orderId —— 字符串（String），委托订单号。
accountID —— 字符串（String）资金账号。
strAccountType —— 字符串（String）账号类型

| 参数值         | 表达意义 | 备注 |
| -------------- | -------- | ---- |
| 'FUTURE'       | 期货     |      |
| 'STOCK'        | 股票     |      |
| 'CREDIT'       | 信用     |      |
| 'HUGANGTONG'   | 沪港通   |      |
| 'SHENGANGTONG' | 深港通   |      |
| 'STOCK_OPTION' | 期权     |      |

返回： 布尔值（Bool），True：表示撤销，False：表示不可撤销

示例：

```python
#coding:gbk

def init(ContextInfo):
	ContextInfo.accid = '6000000248'

def handlebar(ContextInfo):
	orderid = get_last_order_id(ContextInfo.accid,'stock','order')
	print("获取到的委托单号为：",orderid)
	
    can_cancel = can_cancel_order(orderid,ContextInfo.accid,'stock')
	print("委托单 ",orderid,' 是否可撤消:', can_cance
```



### 2.06 取消委托 cancel()

释义： 取消指定的委托 语法：

```text
cancel(
       orderId, 
       accountId, 
       accountType, 
       ContextInfo
      ) 
```



参数：
orderId —— 字符串型（String）想要取消的委托订单号。
accountID —— 字符串型（String）资金账号。
strAccountType —— 字符串型（String）账号类型

| 参数值         | 表达意义 | 备注 |
| -------------- | -------- | ---- |
| 'FUTURE'       | 期货     |      |
| 'STOCK'        | 股票     |      |
| 'CREDIT'       | 信用     |      |
| 'HUGANGTONG'   | 沪港通   |      |
| 'SHENGANGTONG' | 深港通   |      |
| 'STOCK_OPTION' | 期权     |      |

ContextInfo —— 对象（pythonobj） 默认参数，可缺省

返回： 布尔值（Bool）是否发出了取消委托信号， True 表示 是 False表示 否

示例：

```python
#coding:gbk

def init(ContextInfo):
	ContextInfo.accid = '6000000248'

def handlebar(ContextInfo):
	orderid = get_last_order_id(ContextInfo.accid, 'stock', 'order')
	print(cancel(orderid, ContextInfo.accid, 'stock', ContextInfo))
```



### 2.07 取消任务 cancel_task()

释义： 撤销任务。

语法：

```text
cancel_task(
            taskId,
            accountId,
            accountType,
            ContextInfo
           )
```



参数：
taskId —— 字符串型（String）任务编号。如果此参数为空，则表示撤销该资金账号上所有可撤销的任务。
accountID —— 字符串型（String）资金账号。
strAccountType —— 字符串型（String）账号类型

| 参数值         | 表达意义 | 备注 |
| -------------- | -------- | ---- |
| 'FUTURE'       | 期货     |      |
| 'STOCK'        | 股票     |      |
| 'CREDIT'       | 信用     |      |
| 'HUGANGTONG'   | 沪港通   |      |
| 'SHENGANGTONG' | 深港通   |      |
| 'STOCK_OPTION' | 期权     |      |

ContextInfo —— 对象（pythonobj） 默认参数，可缺省

返回： 布尔值（Bool）是否发出了取消任务信号， True 表示 是 False表示 否
示例：

```python
#coding:gbk

def init(ContextInfo):
	ContextInfo.accid = '6000000248'

def handlebar(ContextInfo):
	objlist = get_trade_detail_data(ContextInfo.accid,'stock','task')
	for obj in obj_list:
		cancel_task(obj.m_nTaskId,ContextInfo.accid,'stock',ContextInfo)
```



### 2.08 暂停任务 pause_task()

释义： 暂停智能算法任务。

语法：

```text
pause_task(
           taskId,
           accountId,
           accountType,
           ContextInfo
          )
```



参数：

taskId —— 字符串型（String）任务编号。如果此参数为空，则表示暂停该资金账号上所有可暂停的任务。
accountID —— 字符串型（String）资金账号。
strAccountType —— 字符串型（String）账号类型

| 参数值         | 表达意义 | 备注 |
| -------------- | -------- | ---- |
| 'FUTURE'       | 期货     |      |
| 'STOCK'        | 股票     |      |
| 'CREDIT'       | 信用     |      |
| 'HUGANGTONG'   | 沪港通   |      |
| 'SHENGANGTONG' | 深港通   |      |
| 'STOCK_OPTION' | 期权     |      |

ContextInfo —— 对象（pythonobj） 默认参数，可缺省

返回： 布尔值（Bool）是否发出了暂停委托信号， True 表示 是 False表示 否

示例：

```python
#coding:gbk

def init(ContextInfo):
	ContextInfo.accid = '6000000248'

def handlebar(ContextInfo):
	objlist = get_trade_detail_data(ContextInfo.accid,'stock','task')
	for obj in obj_list:
		pause_task(obj.m_nTaskId,ContextInfo.accid,'stock',ContextInfo)
```



### 2.09 继续任务 resume_task()

释义： 继续智能算法任务。

```text
resume_task(
           taskId,
           accountId,
           accountType,
           ContextInfo
          )
```



参数：

taskId —— 字符串型（String）任务编号。如果此参数为空，则表示暂停该资金账号上所有可暂停的任务。
accountID —— 字符串型（String）资金账号。
strAccountType —— 字符串型（String）账号类型

| 参数值         | 表达意义 | 备注 |
| -------------- | -------- | ---- |
| 'FUTURE'       | 期货     |      |
| 'STOCK'        | 股票     |      |
| 'CREDIT'       | 信用     |      |
| 'HUGANGTONG'   | 沪港通   |      |
| 'SHENGANGTONG' | 深港通   |      |
| 'STOCK_OPTION' | 期权     |      |

ContextInfo —— 对象（pythonobj） 默认参数，可缺省

返回： 布尔值（Bool）是否发出了继续任务的指令， True 表示 是， False表示 否

示例：

```python
#coding:gbk

def init(ContextInfo):
	ContextInfo.accid = '6000000248'

def handlebar(ContextInfo):
	objlist = get_trade_detail_data(ContextInfo.accid,'stock','task')
	for obj in obj_list:
		resume_task(obj.m_nTaskId,ContextInfo.accid,'stock',ContextInfo)
```



### 2.10 实时触发前一根K线信号 do_order()

释义： 实时触发前一根 K 线信号函数。 系统实盘中交易下单函数一般是把上一个周期产生的信号在最新的周期的第一个 tick 下单出去，而日 K 线第一个 tick 是在 9:25 分集合竞价结束时产生，如果策略模型在 9:25 分之后跑又想把前一天的下单信号发出去，就可用 do_order 函数配合实现。 特别需要注意的是，有调用 do_order 函数的策略模型跑在 9:25 分之前或别的日内周期下时，原有下单 函数和 do_order 函数都有下单信号，有可能导致重复下单。

参数： 无

返回： 无 示例：

```python
#coding:gbk

# 实现跑日 K 线及以上周期下,在固定时间点把前一周期的交易信号发送出去
def init(ContextInfo):
	pass

def handlebar(ContextInfo):
	order_lots('000002.SZ', 1, ContextInfo, '600000248')
	ticktimetag = ContextInfo.get_tick_timetag()
	int_time = int(timetag_to_datetime(ticktimetag, '%H%M%S'))
	if 100500 <= int_time < 100505:
		do_order(ContextInfo)
```



### 2.11 指定手数交易 order_lots()

释义： 按指定手数进行， 买/卖单交易。

语法：

```text
order_lots(
           stockcode, 
           lots[, 
           style, 
           price], 
           ContextInfo[, 
           accId]
          )
```



参数：
stockcode —— 股票品种代码，字符型（String），如 '000002.SZ'
lots —— 手数，整数型（Int）
style —— 下单选价类型，字符串型（String）默认为最新价 'LATEST'

| 参数值                                      | 表达意义 | 备注   |
| ------------------------------------------- | -------- | ------ |
| 'LATEST'                                    | 最新价   | 默认值 |
| 'FIX'                                       | 指定     |        |
| 'HANG'                                      | 挂单     |        |
| 'COMPETE'                                   | 对手     |        |
| 'MARKET'                                    | 市价     |        |
| 'SALE5', 'SALE4', 'SALE3', 'SALE2', 'SALE1' | 卖5-1价  |        |
| 'BUY1', 'BUY2', 'BUY3', 'BUY4', 'BUY5'      | 买1-5价  |        |

price —— 价格，双精度浮点型（Double）
ContextInfo —— Python 对象（PythonObj），这里必须是 ContextInfo
accId —— 账号，字符型（String）
返回： 无
示例：

```python
#coding:gbk

def init(ContextInfo):
	pass

def handlebar(ContextInfo):
	# 按最新价下 1 手买入
	order_lots('000002.SZ', 1, ContextInfo, '600000248')
	# 用对手价下 1 手卖出
	order_lots('000002.SZ', -1, 'COMPETE', ContextInfo, '600000248')
	# 用指定价 37.5 下 2 手卖出
	order_lots('000002.SZ', -2, 'fix', 37.5, ContextInfo, '600000248')
```



### 2.12 指定价值交易 order_value()

释义： 按指定金额进行， 买/卖单交易。

语法：

```text
order_value(
           stockcode, 
           value[, 
           style, 
           price], 
           ContextInfo[, 
           accId]
          )
```



参数：
stockcode —— 股票品种代码，字符型（String），如 '000002.SZ'
value —— 金额，双精度浮点型（Double）
style —— 下单选价类型，字符串型（String）默认为最新价 'LATEST'

| 参数值                                      | 表达意义 | 备注   |
| ------------------------------------------- | -------- | ------ |
| 'LATEST'                                    | 最新价   | 默认值 |
| 'FIX'                                       | 指定     |        |
| 'HANG'                                      | 挂单     |        |
| 'COMPETE'                                   | 对手     |        |
| 'MARKET'                                    | 市价     |        |
| 'SALE5', 'SALE4', 'SALE3', 'SALE2', 'SALE1' | 卖5-1价  |        |
| 'BUY1', 'BUY2', 'BUY3', 'BUY4', 'BUY5'      | 买1-5价  |        |

price —— 价格，双精度浮点型（Double）
ContextInfo —— Python 对象（PythonObj），这里必须是 ContextInfo
accId —— 账号，字符型（String）
返回： 无
示例：

```python
#coding:gbk

def init(ContextInfo):
	pass

def handlebar(ContextInfo):
	# 按最新价下 10000 元买入
	order_value('000002.SZ', 10000, ContextInfo, '600000248')
	# 用对手价下 10000 元卖出
	order_value('000002.SZ', -10000, 'COMPETE', ContextInfo, '600000248')
	# 用指定价 37.5 下 20000 元卖出
	order_value('000002.SZ', -20000, 'fix', 37.5, ContextInfo,'60000248')
```



### 2.13 指定比例交易 order_percent()

释义： 指定一个比例值，发送一个等于目前投资组合价值（市场价值和目前现金的总和）一定百分比的买/ 卖单，正数代表买，负数代表卖。股票的股数总是会被调整成对应的一手的股票数的倍数（1 手是 100股）。百分比是一个小数，并且小于或等于1（小于等于100%），0.5 表示的是 50%。需要注意，如果资金不足，将不会发送交易指令。

语法：

```text
 order_percent(
               stockcode, 
               percent,
               style,
               price, 
               ContextInfo,
               accId
              )
```



参数：
stockcode —— 股票品种代码，字符型（String），如 '000002.SZ'
percent —— 百分比，双精度浮点型（Double）。1 表示 100%，因此通常设置的数值小于1，如 0.5 表示 50%
style —— 下单选价类型，字符串型（String）默认为最新价 'LATEST'

| 参数值                                      | 表达意义 | 备注   |
| ------------------------------------------- | -------- | ------ |
| 'LATEST'                                    | 最新价   | 默认值 |
| 'FIX'                                       | 指定     |        |
| 'HANG'                                      | 挂单     |        |
| 'COMPETE'                                   | 对手     |        |
| 'MARKET'                                    | 市价     |        |
| 'SALE5', 'SALE4', 'SALE3', 'SALE2', 'SALE1' | 卖5-1价  |        |
| 'BUY1', 'BUY2', 'BUY3', 'BUY4', 'BUY5'      | 买1-5价  |        |

price —— 价格，双精度浮点型（Double）
ContextInfo —— Python 对象（PythonObj），这里必须是 ContextInfo
accId —— 账号，字符型（String）
返回： 无
示例：

```python
#coding:gbk

def init(ContextInfo):
	pass

def handlebar(ContextInfo):
	# 按最新价下 5.1% 价值买入
	order_percent('000002.SZ', 0.051, ContextInfo, '600000248')
	
    # 用对手价下 5.1% 价值卖出
	order_percent('000002.SZ', -0.051, 'COMPETE', ContextInfo, '600000248')
	
    # 用指定价 37.5 下 10.2% 价值卖出
	order_percent('000002.SZ', -0.102, 'fix', 37.5, ContextInfo, '600000248')
```



### 2.14 指定目标价值交易 order_target_value()

释义： 指定目标品种价值，去执行交易 买入/卖出操作，并且自动调整该证券的仓位到一个目标价值。如果还没有任何该证券的仓位，那么会买入全部目标价值的证券；如果已经有了该证券的仓位，则会买入 / 卖出调整该证券的现在仓位和目标仓位的价值差值的数目的证券。需要注意，如果资金不足，将不会发送交易订单。

语法：

```text
 order_target_value(
                    stockcode, 
                    tar_value[, 
                    style, 
                    price], 
                    ContextInfo[, 
                    accId]
                   )
```



参数：
stockcode —— 股票品种代码，字符型（String），如 '000002.SZ'
tar_value —— 目标价值金额（元），非负数，双精度浮点型（Double）。
style —— 下单选价类型，字符串型（String）默认为最新价 'LATEST'

| 参数值                                      | 表达意义 | 备注   |
| ------------------------------------------- | -------- | ------ |
| 'LATEST'                                    | 最新价   | 默认值 |
| 'FIX'                                       | 指定     |        |
| 'HANG'                                      | 挂单     |        |
| 'COMPETE'                                   | 对手     |        |
| 'MARKET'                                    | 市价     |        |
| 'SALE5', 'SALE4', 'SALE3', 'SALE2', 'SALE1' | 卖5-1价  |        |
| 'BUY1', 'BUY2', 'BUY3', 'BUY4', 'BUY5'      | 买1-5价  |        |

price —— 价格，双精度浮点型（Double）
ContextInfo —— Python 对象（PythonObj），这里必须是 ContextInfo
accId —— 账号，字符型（String）
返回： 无
示例：

```python
#coding:gbk

def init(ContextInfo):
	pass

def handlebar(ContextInfo):
	# 按最新价下调仓到 10000 元持仓
	order_target_value('000002.SZ', 10000, ContextInfo, '600000248')

    # 用对手价调仓到 10000 元持仓
	order_target_value('000002.SZ', 10000, 'COMPETE', ContextInfo,'600000248')

    # 用指定价 37.5 下调仓到 20000 元持仓
    order_target_value('000002.SZ', 20000, 'fix', 37.5, ContextInfo,'600000248')
```



### 2.15 指定目标比例交易 order_target_percent()

释义： 指定目标比例交易，买入 / 卖出证券以自动调整该证券的仓位到占有一个指定的投资组合的目标百分比。投资组合价值等于所有已有仓位的价值和剩余现金的总和。买 / 卖单会被下舍入一手股数（A股是 100 的倍数）的倍数。目标百分比应该是一个小数，并且最大值应该小于等于1，比如 0.5 表示50%，需要注意，如果资金不足，该API将不会创建发送订单。

语法：

```text
 order_target_percent(
                    stockcode, 
                    tar_percent[, 
                    style, 
                    price], 
                    ContextInfo[, 
                    accId]
                   )
```



参数：
stockcode —— 股票品种代码，字符型（String），如 '000002.SZ'
tar_percent —— 目标百分比 [0 ~ 1]，双精度浮点型（Double）。
style —— 下单选价类型，字符串型（String）默认为最新价 'LATEST'

| 参数值                                      | 表达意义 | 备注   |
| ------------------------------------------- | -------- | ------ |
| 'LATEST'                                    | 最新价   | 默认值 |
| 'FIX'                                       | 指定     |        |
| 'HANG'                                      | 挂单     |        |
| 'COMPETE'                                   | 对手     |        |
| 'MARKET'                                    | 市价     |        |
| 'SALE5', 'SALE4', 'SALE3', 'SALE2', 'SALE1' | 卖5-1价  |        |
| 'BUY1', 'BUY2', 'BUY3', 'BUY4', 'BUY5'      | 买1-5价  |        |

price —— 价格，双精度浮点型（Double）
ContextInfo —— Python 对象（PythonObj），这里必须是 ContextInfo
accId —— 账号，字符型（String）
返回： 无
示例：

```python
#coding:gbk

def init(ContextInfo):
	pass

def handlebar(ContextInfo):
	# 按最新价下买入调仓到 5.1% 持仓
	order_target_percent('000002.SZ', 0.051, ContextInfo, '600000248')

	# 用对手价调仓到 5.1% 持仓
	order_target_percent('000002.SZ', 0.051, 'COMPETE', ContextInfo,'600000248')
	# 用指定价 37.5 调仓到 10.2% 持仓
	order_target_percent('000002.SZ', 0.102, 'fix', 37.5, ContextInfo,'600000248')
```




### 2.16 指定股数交易 order_shares()

释义：指定股票数量，下单交易买 / 卖单，这是最常见的下单方式之一。参数 style 可用于设定交易时的选价类型，默认为最新价 'LATEST'

语法：

```text
order_shares(
             stockcode, 
             shares[, 
             style, 
             price], 
             ContextInfo[, 
             accId]
            )
```



参数：
stockcode —— 股票品种代码，字符型（String），如 '000002.SZ'
shares —— 想要交易的股票数量，整数型（Int）。为 100 的整数倍
style —— 下单选价类型，字符串型（String）默认为最新价 'LATEST'

| 参数值                                      | 表达意义 | 备注   |
| ------------------------------------------- | -------- | ------ |
| 'LATEST'                                    | 最新价   | 默认值 |
| 'FIX'                                       | 指定     |        |
| 'HANG'                                      | 挂单     |        |
| 'COMPETE'                                   | 对手     |        |
| 'MARKET'                                    | 市价     |        |
| 'SALE5', 'SALE4', 'SALE3', 'SALE2', 'SALE1' | 卖5-1价  |        |
| 'BUY1', 'BUY2', 'BUY3', 'BUY4', 'BUY5'      | 买1-5价  |        |

price —— 价格，双精度浮点型（Double）
ContextInfo —— Python 对象（PythonObj），这里必须是 ContextInfo
accId —— 账号，字符型（String）
返回： 无

示例：

```python
def handlebar(ContextInfo):
	# 按最新价下 100 股买入
	order_shares('000002.SZ', 100, ContextInfo, '600000248')
	
    # 用对手价下 100 股卖出
	order_shares('000002.SZ', -100, 'COMPETE', ContextInfo, '600000248')

    # 用指定价 37.5 下 200 股卖出
	order_shares('000002.SZ', -200, 'fix', 37.5, ContextInfo, '600000248')
```



### 2.17 期货买入开仓 buy_open()

释义： 期货买入开仓

语法：

```text
buy_open(
         stockcode, 
         amount[, 
         style, 
         price], 
         ContextInfo[, 
         accId]
        )
```



参数：
stockcode —— 品种代码，字符型（String），如 'IF1805.IF'
amount —— 想要交易的手数，整数型（Int）。
style —— 下单选价类型，字符串型（String）默认为最新价 'LATEST'

| 参数值    | 表达意义 | 备注   |
| --------- | -------- | ------ |
| 'LATEST'  | 最新价   | 默认值 |
| 'FIX'     | 指定     |        |
| 'HANG'    | 挂单     |        |
| 'COMPETE' | 对手     |        |
| 'MARKET'  | 市价     |        |
| 'SALE1'   | 卖1价    |        |
| 'BUY1'    | 买1价    |        |

price —— 价格，双精度浮点型（Double）
ContextInfo —— Python 对象（PythonObj），这里必须是 ContextInfo
accId —— 账号，字符型（String）
返回： 无

```python
def handlebar(ContextInfo):
	# 按最新价 1 手买入开仓
	buy_open('IF1805.IF', 1, ContextInfo, '110476')

    # 用对手价 1 手买入开仓
	buy_open('IF1805.IF', 1, 'COMPETE', ContextInfo, '110476')

    # 用指定价 3750 元 2 手买入开仓
    buy_open('IF1805.IF', 2, 'fix', 3750, ContextInfo, '110476')
```



### 2.18 期货买入平仓（平今优先） buy_close_tdayfirst()

释义： 期货买入平仓，平今优先

语法：

```text
buy_close_tdayfirst(
         stockcode, 
         amount[, 
         style, 
         price], 
         ContextInfo[, 
         accId]
        )
```



参数：
stockcode —— 品种代码，字符型（String），如 'IF1805.IF'
amount —— 想要交易的手数，整数型（Int）。
style —— 下单选价类型，字符串型（String）默认为最新价 'LATEST'

| 参数值    | 表达意义 | 备注   |
| --------- | -------- | ------ |
| 'LATEST'  | 最新价   | 默认值 |
| 'FIX'     | 指定     |        |
| 'HANG'    | 挂单     |        |
| 'COMPETE' | 对手     |        |
| 'MARKET'  | 市价     |        |
| 'SALE1'   | 卖1价    |        |
| 'BUY1'    | 买1价    |        |

price —— 价格，双精度浮点型（Double）
ContextInfo —— Python 对象（PythonObj），这里必须是 ContextInfo
accId —— 账号，字符型（String）
返回： 无

```python
def handlebar(ContextInfo):
	# 按最新价 1 手买入开仓，平今优先
	buy_close_tdayfirst('IF1805.IF', 1, ContextInfo, '110476')

    # 用对手价 1 手买入开仓，平今优先
	buy_close_tdayfirst('IF1805.IF', 1, 'COMPETE', ContextInfo, '110476')

    # 用指定价 3750 元 2 手买入开仓，平今优先
    buy_close_tdayfirst('IF1805.IF', 2, 'fix', 3750, ContextInfo, '110476')
```



### 2.19 期货买入平仓（平昨优先） buy_close_ydayfirst()

释义： 期货买入开仓，平昨优先

语法：

```text
buy_close_ydayfirst(
         stockcode, 
         amount[, 
         style, 
         price], 
         ContextInfo[, 
         accId]
        )
```



参数：
stockcode —— 品种代码，字符型（String），如 'IF1805.IF'
amount —— 想要交易的手数，整数型（Int）。
style —— 下单选价类型，字符串型（String）默认为最新价 'LATEST'

| 参数值    | 表达意义 | 备注   |
| --------- | -------- | ------ |
| 'LATEST'  | 最新价   | 默认值 |
| 'FIX'     | 指定     |        |
| 'HANG'    | 挂单     |        |
| 'COMPETE' | 对手     |        |
| 'MARKET'  | 市价     |        |
| 'SALE1'   | 卖1价    |        |
| 'BUY1'    | 买1价    |        |

price —— 价格，双精度浮点型（Double） ContextInfo —— Python 对象（PythonObj），这里必须是 ContextInfo accId —— 账号，字符型（String） 返回： 无

```python
def handlebar(ContextInfo):
	# 按最新价 1 手买入开仓，平昨优先
	buy_close_ydayfirst('IF1805.IF', 1, ContextInfo, '110476')

    # 用对手价 1 手买入开仓，平昨优先
	buy_close_ydayfirst('IF1805.IF', 1, 'COMPETE', ContextInfo, '110476')

    # 用指定价 3750 元 2 手买入开仓，平昨优先
    buy_close_ydayfirst('IF1805.IF', 2, 'fix', 3750, ContextInfo, '110476')
```



### 2.20 期货卖出开仓 sell_open()

释义： 期货卖出开仓

语法：

```text
sell_open(
         stockcode, 
         amount[, 
         style, 
         price], 
         ContextInfo[, 
         accId]
        )
```



参数：
stockcode —— 品种代码，字符型（String），如 'IF1805.IF'
amount —— 想要交易的手数，整数型（Int）。
style —— 下单选价类型，字符串型（String）默认为最新价 'LATEST'

| 参数值    | 表达意义 | 备注   |
| --------- | -------- | ------ |
| 'LATEST'  | 最新价   | 默认值 |
| 'FIX'     | 指定     |        |
| 'HANG'    | 挂单     |        |
| 'COMPETE' | 对手     |        |
| 'MARKET'  | 市价     |        |
| 'SALE1'   | 卖1价    |        |
| 'BUY1'    | 买1价    |        |

price —— 价格，双精度浮点型（Double）
ContextInfo —— Python 对象（PythonObj），这里必须是 ContextInfo
accId —— 账号，字符型（String）
返回： 无

```python
def handlebar(ContextInfo):
	# 按最新价 1 手卖出开仓
	buy_open('IF1805.IF', 1, ContextInfo, '110476')

    # 用对手价 1 手卖出开仓
	buy_open('IF1805.IF', 1, 'COMPETE', ContextInfo, '110476')

    # 用指定价 3750 元 2 手卖出开仓
    buy_open('IF1805.IF', 2, 'fix', 3750, ContextInfo, '110476')
```



### 2.21 期货卖出平仓（平今优先） sell_close_tdayfirst()

释义： 期货卖出平仓，平今优先

语法：

```text
sell_close_tdayfirst(
         stockcode, 
         amount[, 
         style, 
         price], 
         ContextInfo[, 
         accId]
        )
```


stockcode —— 品种代码，字符型（String），如 'IF1805.IF'
amount —— 想要交易的手数，整数型（Int）。
style —— 下单选价类型，字符串型（String）默认为最新价 'LATEST'

| 参数值    | 表达意义 | 备注   |
| --------- | -------- | ------ |
| 'LATEST'  | 最新价   | 默认值 |
| 'FIX'     | 指定     |        |
| 'HANG'    | 挂单     |        |
| 'COMPETE' | 对手     |        |
| 'MARKET'  | 市价     |        |
| 'SALE1'   | 卖1价    |        |
| 'BUY1'    | 买1价    |        |

price —— 价格，双精度浮点型（Double）
ContextInfo —— Python 对象（PythonObj），这里必须是 ContextInfo
accId —— 账号，字符型（String）
返回： 无

```python
def handlebar(ContextInfo):
	# 按最新价 1 手买入开仓，平今优先
	sell_close_tdayfirst('IF1805.IF', 1, ContextInfo, '110476')

    # 用对手价 1 手买入开仓，平今优先
	sell_close_tdayfirst('IF1805.IF', 1, 'COMPETE', ContextInfo, '110476')

    # 用指定价 3750 元 2 手买入开仓，平今优先
    sell_close_tdayfirst('IF1805.IF', 2, 'fix', 3750, ContextInfo, '110476')
```



### 2.22 期货卖出平仓（平昨优先） sell_close_ydayfirst()

释义： 期货卖出平仓，平昨优先

语法：

```text
sell_close_tdayfirst(
         stockcode, 
         amount[, 
         style, 
         price], 
         ContextInfo[, 
         accId]
        )
```



参数：
stockcode —— 品种代码，字符型（String），如 'IF1805.IF'
amount —— 想要交易的手数，整数型（Int）。
style —— 下单选价类型，字符串型（String）默认为最新价 'LATEST'

| 参数值    | 表达意义 | 备注   |
| --------- | -------- | ------ |
| 'LATEST'  | 最新价   | 默认值 |
| 'FIX'     | 指定     |        |
| 'HANG'    | 挂单     |        |
| 'COMPETE' | 对手     |        |
| 'MARKET'  | 市价     |        |
| 'SALE1'   | 卖1价    |        |
| 'BUY1'    | 买1价    |        |

price —— 价格，双精度浮点型（Double）
ContextInfo —— Python 对象（PythonObj），这里必须是 ContextInfo
accId —— 账号，字符型（String）
返回： 无

```python
def handlebar(ContextInfo):
	# 按最新价 1 手买入开仓，平昨优先
	sell_close_ydayfirst('IF1805.IF', 1, ContextInfo, '110476')

    # 用对手价 1 手买入开仓，平昨优先
	sell_close_ydayfirst('IF1805.IF', 1, 'COMPETE', ContextInfo, '110476')

    # 用指定价 3750 元 2 手买入开仓，平昨优先
    sell_close_ydayfirst('IF1805.IF', 2, 'fix', 3750, ContextInfo, '110476')
```



### 2.23 [已弃用]获取两融负债合约明细 （5.24） get_debt_contract()

已弃用

### 2.24 获取两融担保标的明细 get_assure_contract()

释义： 获取信用账户担保合约明细
语法： get_debt_contract(accId)
参数：

accId —— 信用账户

```python
def handlebar(ContextInfo):
	obj_list = get_assure_contract('6000000248')
	for obj in obj_list:
		# 输出担保合约名
		print(obj.m_strInstrumentName)
```



### 2.25 获取可融券明细 get_enable_short_contract()

释义： 获取信用账户当前可融券的明细
语法： get_enable_short_contract(accId)
参数：

accId —— 信用账户

```python
def handlebar(ContextInfo):
	obj_list = get_enable_short_contract('6000000248')
	for obj in obj_list:
	# 输出可融券合约名
		print(obj.m_strInstrumentName)
```



### 2.26 算法交易下单 algo_passorder()

释义： 算法交易下单，此时使用交易面板-程序交易-函数交易-函数交易参数中设置的下单类型（普通交 易,算法交易,随机量交易）。 如果函数交易参数使用未修改的默认值，此函数和passorder函数一致。 设置了函数交易参数后，将会使用函数交易参数的超价等拆单参数,如果入参的prType = -1，同 时将会使用函数交易参数的报价方式。

用法：

```text
algo_passorder(
               opType, 
               orderType, 
               accountid, 
               orderCode, 
               prType, 
               modelprice, 
               volume[, 
               strategyName, 
               quickTrade, 
               userOrderId, 
               userOrderParam], 
               ContextInfo
              )
```



示例： 可参考 4.02 智能算法交易

### 2.27 获取股票篮子 get_basket()

释义： 获取股票篮子

参数：

basketName —— 字符串（String）股票篮子名称

用法： `get_basket(basketName)`

示例：

```
print( get_basket('basket1') )
```

### 2.28 设置股票篮子 set_basket()

释义： 设置passorder的股票篮子,仅用于passorder进行篮子交易,设置成功后,用get_basket可以取出后 即可进行passorder组合交易下单

语法： `set_basket(basketDict)`

参数：

basketDict —— 字典类型（Dict）表示一个股票篮子，格式如下：

```text
{'name':股票篮子名称, 

 'stocks':[
           {'stock':股票名称,
            'weight':权重,
            'quantity':数量,
            'optType':交易类型
           }
          ]
}  
```



### 2.29 获取未了结负债合约明细 get_unclosed_compacts()

释义： 获取未了结负债合约明细

语法： `get_unclosed_compacts(accountID,accountType)`

参数：

accountID —— 字符串型（String）表示资金账号

accountType —— 字符串型（String）账号类型

返回： 一个列表（List）`[ CStkUnclosedCompacts, ... ]`

其中 CStkUnclosedCompacts 属性如下：

| 属性名称                | 数据类型           | 表示意义     | 备注                                                         |
| ----------------------- | ------------------ | ------------ | ------------------------------------------------------------ |
| m_strAccountID          | 字符串型（String） | 账号ID       |                                                              |
| m_nBrokerType           | 整数型（Int）      | 账号类型     | 1-期货账号, 2-股票账号, 3-信用账号, 5-期货期权账号, 6-股票期权账号, 7-沪港通账号, 11-深港通账号) |
| m_strExchangeID         | 字符串型（String） | 市场代码     |                                                              |
| m_strInstrumentID       | 字符串型（String） | 证券代码     |                                                              |
| m_eCompactType          | 整数型（Int）      | 合约类型     | 32-不限制,48-融资,49-融券                                    |
| m_eCashgroupProp        | 整数型（Int）      | 头寸来源     | 32-不限制,48-普通头寸,49-专项头寸                            |
| m_nOpenDate             | 整数型（Int）      | 开仓日期     | 如'20201231'                                                 |
| m_nBusinessVol          | 整数型（Int）      | 合约证券数量 |                                                              |
| m_nRealCompactVol       | 整数型（Int）      | 未还合约数量 |                                                              |
| m_nRetEndDate           | 整数型（Int）      | 到期日       | 如'20201231'                                                 |
| m_dBusinessBalance      | 浮点型(Float)      | 合约金额     |                                                              |
| m_dBusinessFare         | 浮点型(Float)      | 合约息费     |                                                              |
| m_dRealCompactBalance   | 浮点型(Float)      | 未还合约金额 |                                                              |
| m_dRealCompactFare      | 浮点型(Float)      | 未还合约息费 |                                                              |
| m_dRepaidFare           | 浮点型(Float)      | 已还息费     |                                                              |
| m_dRepaidBalance        | 浮点型(Float)      | 已还金额     |                                                              |
| m_strCompactId          | 整数型（Int）      | 合约编号     |                                                              |
| m_strEntrustNo          | 字符串型（String） | 委托编号     |                                                              |
| m_nRepayPriority        | 整数型（Int）      | 偿还优先级   |                                                              |
| m_strPositionStr        | 字符串型（String） | 定位串       |                                                              |
| m_eCompactRenewalStatus | 整数型（Int）      | 合约展期状态 | 48-可申请, 49-已申请, 50-审批通过, 51-审批不通过, 52-不可申请, 53-已执行, 54-已取消 |
| m_nDeferTimes           | 整数型（Int）      | 展期次数     |                                                              |

示例：

```
get_unclosed_compacts('6000000248', 'CREDIT')
```

### 2.30 获取已了结负债合约明细 get_closed_compacts()

释义： 获取已了结负债合约明细

语法： `get_closed_compacts(accountID,accountType)`

参数： accountID —— 字符串型（String）资金账号 accountType —— 字符串型（String），账号类型

返回： 一个列表（List）`[ CStkUnclosedCompacts, ... ]`

其中 CStkUnclosedCompacts 属性如前 4.29 获取未了结负债合约明细 中的描述一致。

### 2.31 获取沪深港通汇率数据 get_hkt_exchange_rate()

释义： 获取沪深港通汇率数据

用法： `get_hkt_exchange_rate(accountID,accountType)`

参数： accountID —— 字符串型（String）资金账号 accountType —— 字符串型（String），账号类型。必须填HUGANGTONG或者SHENGANGTONG

返回：一个字典（Dict）字段释义： bidReferenceRate:买入参考汇率 askReferenceRate:卖出参考汇率 dayBuyRiseRate:日间买入参考汇率浮动比例

### 2.32 取可融券明细 get_enable_short_contract()

释义： 取可融券明细

用法： get_enable_short_contract(accountID)

参数： accountID —— 字符串型（String）资金账号

返回： 列表（List）,其中是 PythonObj ，通过 dir(pythonobj) 可返回对象的属性列表

示例：

```python
def handlebar(ContextInfo):
    obj_list = get_enable_short_contract('6000000248')
    for obj in obj_list:
        print( obj.m_strInstrumentName)
```



### 2.33 取期权标的持仓 get_option_subject_position()

释义： 取期权标的持仓

用法：get_option_subject_position(accountID)

accountID —— 字符串型（String）资金账号

返回： 列表（List）,其中是 PythonObj ，通过 dir(pythonobj) 可返回对象的属性列表

示例：

```python
def handlebar(ContextInfo)
	data=get_option_subject_position('880399990383')
	print(len(data));
	for obj in data:
	print(obj.m_strInstrumentName,obj.m_lockVol,obj.m_coveredVol);
```



### 2.34 取期权组合持仓 get_comb_option()

释义： 取期权组合持仓

用法： get_comb_option(accountID)

参数： accountID —— 字符串型（String）资金账号

返回： 列表（List）,其中是 PythonObj ，通过 dir(pythonobj) 可返回对象的属性列表

```python
obj_list=get_comb_option('880399990383')
print(len(obj_list));
forobjinobj_list:
print(obj.m_strCombCodeName,obj.m_strCombID,obj.m_nVolume,obj.m_nFrozenVolume)
```



### 2.35 构建期权组合持仓 make_option_combination()

释义： 构建期权组合持仓

语法：

```text
make_option_combination(
                        combType,
                        orderCodeDict,
                        modelVolume,
                        accountID,
                        strategyName,
                        userOrderId,
                        ContextInfo
                       ) 
```



参数：
combType —— 组合策略类型
50:认购牛市价差策略
51:认沽熊市价差策略
52:认沽牛市价差策略
53:认购熊市价差策略
54:跨式空头
55:宽跨式空头
56:保证金开仓转备兑开仓
57:备兑开仓转保证金开仓

orderCodeDict —— 期权组合，{option:holdType}。
option —— 期权代码,格式如 10000001.SHO，
holdType —— 48:权利 ， 49:义务 ， 50:备兑
modelVolume —— 下单量
strategyName —— 策略名
userOrderId —— 投资备注

示例：

```python
ContextInfo.accid='880399990383'
make_option_combination(50,
{'10003006.SHO':48,'10003259.SHO':49},1,ContextInfo.accid,'stragegyName','str
Remark',ContextInfo);
#第一个参数50为认购牛市价差策略
#第二个参数10003006.SHO(50ETF购6月3400),48(权利仓)10003259.SHO(50ETF购6月
4400)49(义务仓)
#50ETF购6月3400/50ETF购6月4400g构建认购牛市价差策略
```



### 2.36 解除期权组合持仓 release_option_combination()

释义： 解除期权组合持仓

用法：

```text
release_option_combination(
                           combID,
                           accountID,
                           strategyName,
                           userOrderId,
                           contextInfo
                          )
```



参数： combID —— 持仓中期权组合编码
accountID —— 字符串型（String）表示账号
strategyName —— 字符串型（String）表示 策略名
userOrderId —— 字符串型（String）投资备注

示例：

```python
ContextInfo.accid='880399990383'
release_option_combination('V950034404',ContextInfo.accid,'strategyName','use
rOrderId',ContextInfo)
# 解除组合号码为V950034404的组合期权(同组合策略持仓中的组合号码)
```