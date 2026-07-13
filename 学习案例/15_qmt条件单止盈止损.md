# EasyXT 第15课：QMT条件单止盈止损策略实战案例

> QMT条件单止盈止损策略实战案例
基于条件单框架实现实际的自动止盈止损委托

功能特点：
1. 支持四种止盈止损策略
2. 自动创建条件单并监控
3. 触发后自动执行实际交易委托
4. 可视化管理多个条件单

策略体系：
1. 策略1(首选核心)：浮盈A至B，回落C止损
2. 策略2(次选核心)：最高价涨幅超A + 回落B止损
3. 策略3(场景补充)：高开超A, 最高价高于开盘价B, 回落C止损
4. 策略4(纪律底线)：总体浮亏超A止损

作者：王者quant
日期：2025-02-24

## 函数列表

- **__init__()** — 初始化管理器
- **init_trade_connection()** — 初始化交易连接
- **create_advanced_stop_loss_order()** — 监控并执行条件单
- **start_monitoring()** — 启动持续监控
- **list_orders()** — 列出所有条件单
- **demo_create_orders()** — 演示创建条件单
- **demo_simple_usage()** — 演示简单用法
- **main()** — 主函数

源码：[15_qmt条件单止盈止损.py](https://github.com/quant-king299/EasyXT/blob/main/学习实例/15_qmt条件单止盈止损.py)

---
