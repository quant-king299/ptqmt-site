# 量化交易必备！这个开源工具让数据获取提速200倍，29个基本面因子免费用

---

> **来源**：王者quant


> **保存时间**：2026/7/7 15:30:19

---

特别声明
文中提及的任何策略、指标或方法均存在局限性，过往表现不代表未来收益，且可能随市场环境变化而失效。文章仅为技术分享学习使用，不可直接用于实盘。
EasyXT项目介绍

EasyXT是基于miniqmt中xtquant的二次开发封装库，旨在简化xtquant的使用，提供更友好的API接口。通过统一的接口设计、智能参数处理和完善的错误处理，让量化交易开发变得更加简单高效。

项目地址: https://github.com/quant-king299/EasyXT

## 🛠️ 环境准备

### 系统要求

操作系统：Windows 10/11（PowerShell 7）

Python：3.9+（建议 3.10+），并将 Python 加入 PATH

### ptrade/QMT账号获取指导



## 😰 量化交易的痛点

做量化交易的你，是不是经常遇到这些问题？

❌ **数据获取慢** - 每次都要从网络API下载，等待时间长 ❌ **API不稳定** - akshare、tushare经常报错，数据缺失严重 ❌ **因子计算麻烦** - 想算个基本面因子，要写一堆代码 ❌ **资金流向难获取** - 北向资金、行业资金流数据散落各处 ❌ **数据无法复用** - 每次运行都要重新下载，浪费资源

如果你有以上困扰，那么今天这篇文章**一定要看到最后**！

## 💎 解决方案：EasyFactor v3.1

我们开源了 **EasyFactor v3.1**，一个专为量化交易设计的**本地化因子库和数据管理工具**。

### 核心亮点

特性

说明

🗄️ **本地数据库**

767万条历史数据，DuckDB存储（2.5GB）

⚡ **智能缓存**

首次下载，后续读取本地，提速**200-400倍**

📊 **29个基本面因子**

估值、动量、波动率、质量、流动性全覆盖

💰 **资金流向数据**

行业/概念/北向资金/个股资金流，一网打尽

🎯 **开箱即用**

3行代码即可开始选股策略

## 🚀 快速上手

### 安装

pip install pandas numpy duckdb qstock

### 3行代码开始量化选股

from easy_xt.factor_library import create_easy_factor

# 初始化（自动连接767万条本地数据）
ef = create_easy_factor(r'D:/StockData/stock_data.ddb', enable_extended_modules=True)

# 获取29个基本面因子
from easy_xt.fundamental_enhanced import get_enhanced_fundamental_factors
df = get_enhanced_fundamental_factors('000001.SZ', ef.duckdb_reader)
print(df)

**输出**：

 price_to_ma20 price_to_ma60 price_percentile ... rsi_14
000001.SZ 0.973 0.951 0.024 ... 21.11

就这么简单！29个专业级基本面因子，**一行代码**全部搞定。

## 📊 29个基本面因子全解析

我们基于767万条真实市场数据，实现了**5大类共29个基本面因子**：

### 1️⃣ 估值因子（3个）

price_to_ma20/60 - 股价相对20/60日均线位置
price_percentile - 价格在历史中的分位数
dist_from_high_252 - 距离52周高点的百分比

**实战用法**：

# 找出被低估的股票
df_selected = df[
 (df['price_to_ma60'] < 0.95) & # 股价低于60日均线
 (df['price_percentile'] < 0.3) # 价格历史分位数<30%
]

### 2️⃣ 动量因子（8个）

momentum_1/5/10/20/60/120/252d - 多周期收益率
momentum_accel - 动量加速度
rsi_14 - 相对强弱指数

**实战用法**：

# 动量选股策略
df_selected = df[
 (df['momentum_20d'] > 0) & # 短期向上
 (df['momentum_60d'] > 0) & # 中期向上
 (df['rsi_14'] < 70) # 不超买
]

### 3️⃣ 波动率因子（6个）

volatility_20/60/120d - 历史波动率（年化）
atr_14 - 平均真实波幅
volatility_percentile - 波动率分位数

### 4️⃣ 质量因子（5个）

price_cv_60d - 价格变异系数（稳定性）
trend_strength_60d - 趋势强度
consecutive_up/down_days - 连续涨跌天数
price_position_52w - 52周价格位置

### 5️⃣ 流动性因子（7个）

avg_volume_5/20/60d - 均量
volume_ratio - 量比
turnover_5/20d - 换手率

## 💰 qstock资金流向数据

我们集成了**qstock**的完整资金流向数据，覆盖全面且智能缓存：

### 📈 同花顺行业/概念资金流向

# 获取90个行业的资金流向
industry_flow = ef.get_ths_industry_money_flow(top_n=20, use_cache=True)

# 获取387个概念的资金流向
concept_flow = ef.get_ths_concept_money_flow(top_n=20, use_cache=True)

**数据字段**：

行业名称、涨跌幅

净流入(万)

上涨家数、下跌家数

领涨股票

**智能缓存**：

首次运行：[OK] 从qstock下载行业资金流向: 90 个行业
再次运行：[OK] 从DuckDB缓存读取行业资金流向数据
速度提升：200-400倍 ⚡

### 🌊 北向资金流向（外资）

# 获取北向资金历史流向（2,616条记录）
north_flow = ef.get_north_money_flow(days=30, use_cache=True)

# 获取北向资金行业流向（86个行业）
north_sector = ef.get_north_money_sector(top_n=20)

# 获取北向资金个股流向（2,767只股票）
north_stock = ef.get_north_money_stock(top_n=20)

**数据覆盖**：

历史记录：2,616条（2014-11-17 至 2026-02-06）

行业覆盖：86个行业

个股覆盖：2,767只股票

### 🎯 个股资金流向（5,175只股票）

# 获取个股资金流向排名TOP20
stock_flow = ef.get_ths_stock_money_flow(top_n=20, use_cache=True)

# 查询特定股票
single = ef.get_ths_stock_money_flow(stock_code='000001')

## 🎯 实战案例1：多因子选股

from easy_xt.factor_library import create_easy_factor
from easy_xt.fundamental_enhanced import get_batch_enhanced_factors

# 初始化
ef = create_easy_factor(r'D:/StockData/stock_data.ddb', enable_extended_modules=True)

# 获取股票池
stock_list = ['000001.SZ', '000002.SZ', '600000.SH', '600036.SH', '600519.SH']

# 计算基本面因子
df = get_batch_enhanced_factors(stock_list, ef.duckdb_reader)

# 多因子筛选
df_selected = df[
 (df['momentum_20d'] > 0) & # 20日动量>0
 (df['momentum_60d'] > 0) & # 60日动量>0
 (df['rsi_14'] < 70) & # 不超买
 (df['volatility_20d'] < 0.3) # 风险适中
]

print("符合条件的股票：")
print(df_selected[['momentum_20d', 'momentum_60d', 'rsi_14']])

## 🎯 实战案例2：资金流向+技术面双筛选

# 1. 获取资金流入TOP20的股票
stock_flow = ef.get_ths_stock_money_flow(top_n=20, use_cache=True)

# 2. 计算这些股票的基本面因子
stock_list = stock_flow['股票代码'].tolist()
df_factors = get_batch_enhanced_factors(stock_list, ef.duckdb_reader)

# 3. 双筛选：资金流入 + 技术面向好
df_selected = df_factors[
 (df_factors['momentum_20d'] > 0) & # 趋势向上
 (df_factors['trend_strength_60d'] > 0) # 趋势强度高
]

print("资金流入且技术面强势的股票：")
print(df_selected)

## 🎯 实战案例3：板块轮动策略

# 1. 获取行业资金流向
industry_flow = ef.get_ths_industry_money_flow(top_n=10, use_cache=True)

# 2. 筛选资金流入>1亿元的热门行业
hot_industries = industry_flow[industry_flow['净流入(万)'] > 10000]

# 3. 获取热门行业的成分股
for _, row in hot_industries.iterrows():
 industry_name = row['行业名称']
 print(f"\n🔥 热门行业：{industry_name}，净流入：{row['净流入(万)']}万")

## ⚡ 性能对比

### 场景：获取20只股票的基本面因子

方案

耗时

依赖网络

传统方案（Tushare）

~30秒

✅ 是

Akshare方案

~15秒

✅ 是
**EasyFactor（DuckDB）****~0.1秒**
 ⚡

❌ 否

**速度提升：300倍！**

### 场景：获取行业资金流向数据

方案

耗时

数据完整性

首次运行（qstock下载）

~3秒

100%
**再次运行（DuckDB缓存）****~0.01秒**
 ⚡

100%

**速度提升：300倍！**

## 🗄️ DuckDB本地数据库详解

### 数据规模

总记录数：7,675,290条
数据范围：2015-10-26 到 2026-02-02
覆盖股票：5,190只
数据库大小：2.5 GB

### 缓存表结构

表名

数据量

说明

stock_daily

767万条

日线数据（OHLCV）

ths_industry_money_flow

90行业

行业资金流向

ths_concept_money_flow

387概念

概念资金流向

ths_stock_money_flow

5,175股票

个股资金流向

north_money_flow

2,616条

北向资金历史

**数据持久化**：关闭程序后数据不会丢失，下次打开直接使用！✅

## 📈 为什么选择EasyFactor？

### ✅ 优势
**完全本地化**
 - 767万条数据存储在本地，无需网络
**速度极快**
 - 智能缓存机制，提速200-400倍
**数据丰富**
 - 29个基本面因子 + 资金流向全覆盖
**开箱即用**
 - 3行代码即可开始量化选股
**免费开源**
 - 无需付费，无数据限制
**稳定可靠**
 - 基于DuckDB，不会因API变化失效

### ⚠️ vs 传统方案

对比项

Tushare Pro

Akshare
**EasyFactor**
费用

收费

免费
**免费**
 ✅

速度

慢

慢
**快**
 ⚡

稳定性

高

低（API常变）
**高**
 ✅

基本面因子

需自己算

需自己算
**29个内置**
 ✅

资金流向

部分付费

部分缺失
**全覆盖**
 ✅

本地缓存

无

无
**智能缓存**
 ✅

## 📚 完整示例文件

我们提供了丰富的学习示例：

文件名

说明
EasyFactor_扩展模块演示.py**完整功能演示**
（推荐）
12_量化因子库_完整版_DuckDB.py
因子库完整教程
test_fundamental_enhanced.py
基本面因子测试
check_financial_details.py
数据详情检查

## 🎓 快速学习路径

### 第1步：运行演示文件

cd 学习实例
python EasyFactor_扩展模块演示.py

### 第2步：理解29个基本面因子

查看因子计算逻辑：

# easy_xt/fundamental_enhanced.py

### 第3步：实战应用

复制示例代码，修改选股条件，开始自己的量化策略！

## 💡 使用建议

### 日常使用（推荐）

# 使用智能缓存，速度快
ef = create_easy_factor(
 r'D:/StockData/stock_data.ddb',
 enable_extended_modules=True
)

# 所有数据都会自动缓存
industry = ef.get_ths_industry_money_flow(top_n=20)

### 更新缓存

# 每天运行一次，更新数据
result = ef.update_ths_money_flow()

## 📊 总结

EasyFactor v3.1 是一个**完全本地化、高速、稳定**的量化交易工具箱：

✅ **767万条本地数据** - 无需等待网络 ✅ **29个基本面因子** - 覆盖估值、动量、波动率、质量、流动性 ✅ **qstock完整集成** - 行业/概念/北向资金/个股资金流 ✅ **智能缓存机制** - 提速200-400倍 ✅ **开箱即用** - 3行代码开始量化选股

**现在就开始使用吧！** 🚀

💬 **留言互动**

你在量化交易中遇到的最大困难是什么？欢迎在评论区告诉我们！

**点赞 + 在看 + 转发**，支持我们继续更新！

## 📱 关注我们



📚 **分享内容**: 量化交易、Python编程、投资策略
🎯 **更新频率**: 持续更新，干货满满


📈 最新的量化交易策略分享

💻 Python量化编程技巧

📊 市场分析和投资心得

🚀 EasyXT功能更新和使用技巧

💡 量化交易实战案例

*本教程仅供学习参考，实际交易请谨慎操作！*