# EasyXT — 一站式量化交易框架

> `pip install easyxt` · 多源数据聚合 · QMT 直连交易 · 本地 DuckDB 加速 · 内置策略库
> GitHub：https://github.com/quant-king299/EasyXT

<div class="tech-nav-container">
  <a href="https://github.com/quant-king299/EasyXT" class="tech-nav-button ai-code-button"><span class="tech-icon">🧭</span> GitHub</a>
  <a href="#/docs/EasyXT快速入门指南" class="tech-nav-button docs-button"><span class="tech-icon">📘</span> 官方文档</a>
  <a href="https://pypi.org/project/easyxt/" class="tech-nav-button tech-share-button"><span class="tech-icon">📦</span> PyPI</a>
</div>

## 功能亮点

| 能力 | 说明 |
|------|------|
| **多源数据** | QMT、Tushare、通达信(TDX)、东方财富，自动降级切换 |
| **本地存储** | DuckDB 高性能列式数据库，回测速度提升 10-30 倍 |
| **策略框架** | 内置红利低波、双低/三低可转债、ETF 趋势、涨停板等经典策略 |
| **因子分析** | 101 因子分析平台，支持 191 个 Alpha 因子计算与回测 |
| **QMT 直连** | 同时支持大 QMT（XtItClient）和 miniQMT，一键对接实盘/仿真交易 |
| **跨平台** | Windows/Mac/Linux 均可（Mac/Linux 通过 xqshare 远程连接 QMT） |

## 安装

```bash
# 一行安装
pip install easyxt

# 如需完整项目（含 GUI / 回测 / 策略）
git clone https://github.com/quant-king299/EasyXT.git
cd EasyXT
pip install -e .
```

## 快速开始（3 行代码）

```python
```python
from easy_xt import get_api

api = get_api()
api.init_data()

```
# 获取平安银行最近 20 根日线（前复权）
```
```python
df = api.get_price(['000001.SZ'], period='1d', count=20, adjust='front')
print(df[['close', 'volume']])

```
## 获取实时行情

```python
# 多只股票实时快照
```
```python
df = api.get_current_price(['000001.SZ', '600519.SH', '300750.SZ'])
for _, row in df.iterrows():
    print(f"{row['code']}: {row['price']:.2f}")

```
## 获取财务数据

```python
# 获取三大报表
```
```python
data = api.get_financial_data(['000001.SZ'],
    tables=['Balance', 'Income', 'CashFlow'],
    start='20240101')

income = data['000001.SZ']['Income']
print(income[['revenue', 'net_profit_incl_min_int_inc']])

```
## 下单交易

```python
# 初始化交易（需 QMT 在线）
```python
api.init_trade(r'D:/QMT交易端/userdata_mini', session_id=99)
api.add_account('你的资金账号', 'STOCK')

```
# 限价买入
```
```python
order_id = api.trade.buy('你的资金账号', '000001.SZ',
                         volume=100, price=12.50, price_type='limit')

```
## 运行内置策略

```bash
# 红利低波策略（安全模式，不下单）
python strategies/quant_strategies/run_dividend_lowvol.py

# 确认信号后实盘
python strategies/quant_strategies/run_dividend_lowvol.py --trade
```

## 启动 GUI

```bash
python run_gui.py
```

GUI 功能：数据下载、Tushare 批量下载、五维复权查看器、网格交易配置、多策略管理

## 系统架构

```
用户界面（GUI / CLI / Streamlit）
    ↓
EasyXT API 层（DataAPI / TradeAPI / ExtendedAPI）
    ↓
核心引擎（FallbackFetcher / BacktestEngine / Scheduler / AutoLogin）
    ↓
数据 & 交易层（DuckDB / QMT xtquant / Tushare / TDX / 东方财富 / xqshare）
```

## 官方文档

| 文档 | 说明 |
|------|------|
| [快速入门指南](docs/EasyXT快速入门指南.html) | 安装配置 → 启动 GUI → 下载数据 → 跑通第一个策略 |
| [核心 API 手册](docs/EasyXT核心API手册.html) | `get_price`、`get_financial_data`、交易接口完整参数 |
| [回测系统文档](docs/EasyXT回测系统文档.html) | DataManager → BacktestEngine → 绩效分析 → 因子平台 |
| [GUI 操作手册](docs/EasyXT_GUI操作手册.html) | 界面导览、数据下载、网格交易、多策略管理 |
| [策略开发指南](docs/EasyXT策略开发指南.html) | 策略模板、DuckDB→QMT 降级、多因子排名、实盘部署 |
| [架构与部署](docs/EasyXT架构与部署.html) | 系统架构、数据管道、自动登录、跨平台、生产部署 |

## 数据源降级链

```
QMT (xtquant) → 通达信 (TDX) → 东方财富 → 兜底备份
```

无需手动切换，系统自动选择最佳可用数据源。

## 支持的周期

`tick` / `1m` / `5m` / `15m` / `30m` / `1h` / `1d`

## 复权类型

`none`（不复权）/ `front`（前复权）/ `back`（后复权）/ `front_ratio`（等比前复权，回测推荐）/ `back_ratio`（等比后复权）

## FAQ

- **Q: Python 版本？** A: 3.8 - 3.12，推荐 3.11。xtquant 不支持 3.13。
- **Q: Mac/Linux 能用吗？** A: 通过 xqshare 远程连接 Windows QMT。数据获取和回测完全支持。
- **Q: 没有 Tushare 积分怎么办？** A: 不影响，用 QMT 本地数据即可。分红策略也支持 QMT `get_divid_factors` 降级。
- **Q: 大 QMT 和 miniQMT 用哪个？** A: 都可以。大 QMT 数据更全，GUI 支持直接导入。同时运行大 QMT 时自动跳过 miniQMT 检测。
