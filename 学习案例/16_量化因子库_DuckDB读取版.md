# EasyXT 第16课：量化因子库 - DuckDB数据读取版

> 量化因子库 - DuckDB数据读取版

功能：
1. 直接从DuckDB读取历史数据
2. 进行完整的因子分析
3. 支持自定义股票列表

使用方法：
1. 确保DuckDB数据库存在: D:/StockData/stock_data.ddb
2. 修改要分析的股票列表
3. 运行脚本

作者：EasyXT团队
日期：2026-02-06

## 函数列表

- **_detect_duckdb_path()** — 自动检测DuckDB数据库路径
- **__init__()** — 计算所有因子
- **_calculate_momentum()** — 计算动量因子
- **_calculate_volatility()** — 计算波动率因子
- **_calculate_max_drawdown()** — 计算最大回撤
- **_calculate_volume_price()** — 计算量价因子
- **_calculate_technical()** — 计算技术指标
- **_calculate_composite_score()** — 计算综合评分
- **_get_rating()** — 获取评级
- **generate_report()** — 生成分析报告
- **main()** — 主程序

源码：[16_量化因子库_DuckDB读取版.py](https://github.com/quant-king299/EasyXT/blob/main/学习实例/16_量化因子库_DuckDB读取版.py)

---
