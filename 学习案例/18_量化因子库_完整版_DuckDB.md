# EasyXT 第18课：量化因子库完整应用 - QMT + DuckDB 完整版本

> 量化因子库完整应用 - QMT + DuckDB 完整版本

功能：
1. 从QMT下载历史数据到DuckDB数据库
2. 完整的50+类因子计算
3. 多因子综合评分
4. 详细的因子分析报告

包含的因子类型：
- 估值因子：PE、PB、PS、PCF、市值
- 质量因子：ROE、ROA、毛利率、净利率、负债率
- 成长因子：营收增长、利润增长、EPS增长
- 动量因子：5/10/20/60日动量
- 反转因子：短期、中期、长期反转
- 波动率因子：历史波动率、特质波动率
- 技术因子：均线、MACD、RSI、布林带
- 量价因子：量比、换手率、资金流向
- 风格因子：规模、动量、波动、价值、质量

作者：EasyXT团队
日期：2026-02-06
版本：2.0 完整版

## 函数列表

- **_detect_duckdb_path()** — 计算所有因子
- **_momentum_factor()** — 动量因子：N日涨跌幅
- **_momentum_volume_factor()** — 量价动量因子：价格和成交量同时变化
- **_reversal_factor()** — 反转因子：过去N日收益率，预期未来反转
- **_volatility_factor()** — 历史波动率因子
- **_max_drawdown_factor()** — 最大回撤因子
- **_volume_ratio_factor()** — 量比因子：当前成交量 / N日平均成交量
- **_volume_ma_factor()** — 量均线因子：成交量在均线之上/之下
- **_price_volume_trend_factor()** — 价量趋势因子：价格上涨且成交量增加
- **_turnover_rate_factor()** — 换手率因子（简化版：使用成交额/市值估算）
- **_amplitude_factor()** — 振幅因子：（最高价 - 最低价）/ 最低价
- **_ma_signal_factor()** — 均线信号因子：价格在均线之上/之下
- **_ma_trend_factor()** — 均线趋势因子：短期均线在长期均线之上
- **_bollinger_factor()** — 布林带因子：价格在布林带中的位置
- **_rsi_factor()** — RSI因子：相对强弱指数
- **_price_position_factor()** — 价格位置因子：当前价格在N日内的位置
- **_displacement_factor()** — 位移因子：当前价格相对N日前价格的变化
- **_gap_ratio_factor()** — 跳空因子：跳空缺口的比例
- **_price_acceleration_factor()** — 价格加速度因子：二阶动量
- **_size_factor()** — 规模因子：市值（使用成交额作为代理）
- **_beta_factor()** — Beta因子：相对市场的波动性（使用第一只股票作为基准）
- **_alpha_factor()** — Alpha因子：超额收益
- **_sharpe_ratio_factor()** — 夏普比率因子
- **_calmar_ratio_factor()** — 卡尔马比率因子：年化收益 / 最大回撤
- **_sortino_ratio_factor()** — 索提诺比率因子：只考虑下行波动
- **_skewness_factor()** — 偏度因子：收益分布的不对称性
- **_kurtosis_factor()** — 峰度因子：收益分布的尖锐程度
- **_capture_ratio_factor()** — 捕获比率因子
- **_composite_score()** — 综合评分：多因子加权
- **generate_comprehensive_report()** — 生成综合报告 - 增强版
- **main()** — 主程序

源码：[18_量化因子库_完整版_DuckDB.py](https://github.com/quant-king299/EasyXT/blob/main/学习实例/18_量化因子库_完整版_DuckDB.py)

---
