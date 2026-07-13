# 告别收费API！这个开源量化因子库让你轻松实现50+因子计算！

---

> **来源**：王者quant


> **保存时间**：2026/7/7 15:30:20

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



量化交易路上，你是否也遇到过这些痛点？

❌ **量化数据源要收费**，动辄数千元的授权费劝退了个人投资者 ❌ **因子计算太复杂**，动量、波动率、RSI...每个都要自己写代码 ❌ **批量分析效率低**，分析100只股票要等好几分钟 ❌ **数据源不好找**，免费的数据接口要么不稳定，要么限制太多

## 🎯 今天给大家介绍一个完全开源、免费的量化因子库

**EasyFactor** - 基于 DuckDB 的高性能量化因子计算库，支持 50多种**因子** 计算，完全免费！

### ✨ 核心亮点

特性

说明

💰 **完全免费**

基于 DuckDB 本地数据库，无需购买任何授权

⚡ **高性能**

批量分析100只股票仅需几秒，比传统方法快10倍+

📊 **39+因子**

覆盖技术面、基本面、量价等主流因子

🔧 **开箱即用**

API 简洁直观，10行代码就能完成因子分析

🎓 **易于学习**

完整的示例代码和文档，新手友好

## 📦 一、支持的因子类型（50+类）

### 📈 技术面因子

**动量类（4种）**
momentum_5d/10d/20d/60d
 - 不同周期的价格动量

**反转类（3种）**
reversal_short/mid/long
 - 短中长期反转因子

**波动率类（4种）**
volatility_20d/60d/120d
 - 历史波动率
max_drawdown
 - 最大回撤

**技术指标（7种）**
rsi
 - 相对强弱指数
macd
 - MACD指标
kdj
 - 随机指标
atr
 - 平均真实波幅
obv
 - 能量潮
bollinger
 - 布林带位置

**量价因子（5种）**
volume_ratio
 - 量比
turnover_rate
 - 换手率
amplitude
 - 振幅

### 💼 基本面因子（框架已建立）

**估值因子（5种）**
pe_ttm
 - 滚动市盈率
pb
 - 市净率
ps
 - 市销率
pcf
 - 市现率
market_cap
 - 市值

**质量因子（5种）**
roe
 - 净资产收益率
roa
 - 总资产收益率
gross_margin
 - 毛利率
net_margin
 - 净利率
debt_ratio
 - 资产负债率

## 💻 二、快速上手

### 安装依赖

pip install pandas numpy duckdb

### 3分钟上手示例

```python
from easy_xt.factor_library import EasyFactor, create_easy_factor

```
# 1. 初始化（只需指定DuckDB数据库路径）
```python
ef = create_easy_factor('D:/StockData/stock_data.ddb')

```
# 2. 计算单个因子
```python
momentum = ef.get_factor('000001.SZ', 'momentum_20d', '2024-01-01', '2024-11-30')
print(f"20日动量: {momentum['momentum_20d'].iloc[-1]:.2%}")

```
# 3. 批量分析多只股票（高效！）
```python
stock_list = ['000001.SZ', '600000.SH', '600519.SH', '000858.SZ']
results = ef.analyze_batch(
 stock_list=stock_list,
 start_date='2024-01-01',
 end_date='2024-11-30'
)

```
# 4. 查看综合评分
```python
print(results['score'].sort_values('score', ascending=False))

```
**输出示例：**

 score rating max_score
000858.SZ 82.50 A 100.0
600519.SH 75.30 B 100.0
000001.SZ 68.20 B 100.0
600000.SH 45.10 C 100.0

## 🎯 三、实战案例：动量选股策略

### 场景：从全市场筛选动量强势股

```python
from easy_xt.factor_library import create_easy_factor

```
# 初始化
```python
ef = create_easy_factor('D:/StockData/stock_data.ddb')

```
# 获取股票列表
```python
all_stocks = ef.get_stock_list(limit=100) # 获取前100只股票

```
# 批量计算动量因子
```python
stock_list = all_stocks['stock_code'].tolist()
results = ef.analyze_batch(stock_list, '2024-01-01', '2024-11-30')

```
# 筛选条件：
# 1. 20日动量 > 10%
# 2. RSI 在 30-70 之间（不超买也不超卖）
# 3. 波动率 < 30%（风险可控）
```python
momentum_20 = results['momentum'][results['momentum']['period'] == '20日']
rsi = results['technical'][results['technical']['indicator'] == 'rsi']
volatility = results['volatility']

```
# 综合筛选
selected_stocks = momentum_20[
 (momentum_20['momentum_pct'] > 10) &
 (momentum_20['momentum_pct'] < 50) # 排除过度投机
]

```python
print(f"筛选出 {len(selected_stocks)} 只强势股：")
print(selected_stocks[['stock_code', 'momentum_pct', 'current_price']].head(10))

```
## 📊 四、性能优势

### 本地计算 vs 远程API

对比项

传统远程API

EasyFactor（本地DuckDB）
**费用**
💰 需要购买授权

🆓 完全免费
**数据源**
远程API（限流）

本地DuckDB（无限制）
**因子数量**
通常30-40类

50+类
**批量分析**
慢（网络限制）

快（本地计算）
**100只股票分析**
~30秒

~3秒 ⚡
**使用难度**
需配置token

开箱即用

**性能提升：批量分析速度提升 10倍+！**

## 🛠️ 五、核心API一览

### 1. 市场数据获取

# 获取日线数据
```python
df = ef.get_market_data_ex(
 stock_code='000001.SZ',
 start_time='2024-01-01',
 end_time='2024-11-30',
 period='daily'
)

```
### 2. 单个因子计算

# 计算动量因子
```python
momentum = ef.get_factor('000001.SZ', 'momentum_20d', '2024-01-01', '2024-11-30')

```
# 计算RSI
```python
rsi = ef.get_factor('000001.SZ', 'rsi', '2024-01-01', '2024-11-30')

```
# 计算波动率
```python
volatility = ef.get_factor('000001.SZ', 'volatility_20d', '2024-01-01', '2024-11-30')

```
### 3. 批量因子分析 ⭐推荐

# 一次计算多个因子类型
```python
results = ef.analyze_batch(
 stock_list=['000001.SZ', '600000.SH'],
 start_date='2024-01-01',
 end_date='2024-11-30',
 factors=['momentum', 'volatility', 'technical', 'score']
)

```
# 查看各类因子
```python
print(results['momentum']) # 动量因子
print(results['volatility']) # 波动率
print(results['technical']) # 技术指标
print(results['score']) # 综合评分

```
### 4. 综合评分选股

# 多因子加权评分
```python
scores = ef.get_comprehensive_score(stock_list)

```
# 筛选A级股票
```python
a_stocks = scores[scores['rating'] == 'A']
print(f"推荐股票: {a_stocks.index.tolist()}")

```
## 📁 六、项目结构

easy_xt/
├── factor_library.py # EasyFactor主模块
├── duckdb_client.py # DuckDB数据读取器
└── ...

学习实例/
├── EasyFactor_DuckDB示例.py # 完整示例（推荐）
├── EasyFactor示例_可运行版.py # 可运行版本
├── 12_量化因子库_完整版_DuckDB.py # 完整实战案例
└── ...

## 🎓 七、学习资源

### 示例文件

**EasyFactor_DuckDB示例.py** - 完整功能演示

7个详细示例

涵盖所有核心功能

包含最佳实践

**EasyFactor示例_可运行版.py** - 快速上手

即插即用的代码

适合新手学习

10分钟跑通

**12_量化因子库_完整版_DuckDB.py** - 实战案例

完整的因子分析流程

综合评分系统

适合量化研究

### 完整文档

easy_xt/EasyFactor_README.md

## 🚀 八、适用场景

### ✅ 适合使用 EasyFactor 的场景：

📊 **全市场扫描** - 批量分析1000只股票

🎯 **因子选股** - 动量、价值、质量等多因子策略

📈 **策略回测** - 基于因子的历史回测

💼 **量化研究** - 因子有效性分析

🔬 **组合优化** - 多因子组合构建

### 💡 扩展提示：

EasyFactor 当前版本主要针对日线数据优化。如需分钟级、tick级数据分析：

DuckDB 数据库本身支持存储任意周期数据（tick/1分钟/5分钟等）

可自行扩展数据表结构和因子计算逻辑

参考项目文档中的数据表结构进行定制

## 💡 九、常见问题

**Q1: DuckDB数据库如何准备？**

A: 可以使用项目中的数据下载脚本，将通达信/QMT数据导入到DuckDB。数据表结构：

CREATE TABLE stock_daily (
 stock_code VARCHAR,
 date DATE,
 open DECIMAL,
 high DECIMAL,
 low DECIMAL,
 close DECIMAL,
 volume BIGINT,
 amount DECIMAL,
 PRIMARY KEY (stock_code, date)
```python
);

```
**Q2: 支持哪些日期格式？**

A: DuckDB要求使用 YYYY-MM-DD 格式，例如：

# ✅ 正确
```python
df = ef.get_market_data_ex('000001.SZ', '2024-01-01', '2024-12-31')

```
# ❌ 错误
```python
df = ef.get_market_data_ex('000001.SZ', '20240101', '20241231')

```
**Q3: 如何添加自定义因子？**

A: 可以继承 EasyFactor 类，添加自己的因子计算方法：

```python
class CustomEasyFactor(EasyFactor):
 def _calc_custom_factor(self, df):
```
 """自定义因子计算"""
 # 你的计算逻辑
```python
 pass

```
## 🎉 十、总结

### EasyFactor 核心优势：

💰 **完全免费** - 无需购买任何授权

⚡ **高性能** - 批量分析速度提升10倍+

📊 **50+因子** - 覆盖主流技术面和基本面因子

🔧 **开箱即用** - API简洁，10行代码完成分析

🎓 **易于学习** - 完整示例和文档

### 适用人群：

✅ 量化交易个人投资者

✅ Python量化学习者

✅ 因子研究爱好者

✅ 算法交易开发者

## 📥 如何获取？

### GitHub 项目
https://github.com/quant-king299/EasyXT
### 核心文件

# 安装
pip install pandas numpy duckdb

# 使用
```python
from easy_xt.factor_library import EasyFactor, create_easy_factor

ef = create_easy_factor('你的数据路径.ddb')
results = ef.analyze_batch(stock_list, '2024-01-01', '2024-11-30')

```
## 💬 互动话题

💬 **你平时使用哪些因子进行选股？**💬 **在量化交易中遇到过哪些痛点？**💬 **希望EasyFactor增加哪些功能？**

欢迎在评论区留言交流！

## 📱 关注我们



📚 **分享内容**: 量化交易、Python编程、投资策略
🎯 **更新频率**: 持续更新，干货满满


📈 最新的量化交易策略分享

💻 Python量化编程技巧

📊 市场分析和投资心得

🚀 EasyXT功能更新和使用技巧

💡 量化交易实战案例

*本教程仅供学习参考，实际交易请谨慎操作！*