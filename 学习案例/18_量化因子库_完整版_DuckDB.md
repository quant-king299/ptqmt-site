# 从人工打分到机器学习：我给量化策略加了一个"AI大脑"

---

> **来源**：王者quant


> **保存时间**：2026/7/7 15:29:48

---

# 特别声明


只用 17 个技术因子 + LightGBM，4 秒训练，IC 从负转正。

做量化交易的朋友应该都有这种感觉：因子写了一堆，但怎么组合权重？拍脑袋？等权？回测跑几轮看哪个权重好？

我最近给自己的 miniqmt 系统加了一个轻量 ML 模块。没用什么复杂的框架，**直接从 DuckDB 读数据 → 算因子 → 训练 → 预测**，一条线走通。效果出乎意料的好。

## 为什么不用 Qlib？

最开始我也想过接入微软的 Qlib 框架。但研究完发现一个核心问题：

**Qlib 需要自己的二进制数据格式。** 而我所有数据已经在 DuckDB 里了——PTrade 本地回测用 DuckDB、miniQMT 回测用 DuckDB、GUI 数据查看也用 DuckDB。再导出一份 Qlib 格式，意味着：

两份数据，来回同步

多一个数据转换环节

项目复杂度翻倍

最终决定：**直接用 LightGBM + DuckDB，不引入 Qlib。**

## 架构：20 行代码讲清楚

DuckDB stock_daily (5127只股票, 2016-2026)
 │
 ▼
 17个技术因子（纯pandas计算, 无框架）
 │
 ▼
 LightGBM 训练（scikit-learn接口, 4秒）
 │
 ▼
 预测信号 → EnhancedBacktestEngine 回测

核心代码不到 200 行。全链路依赖只有一个外部包：pip install lightgbm。

## 17 个因子是什么

没有用 Alpha158 那种 158 维特征，我就选了最经典的技术指标：

类别

因子

数量

收益率

ret_1d, ret_5d, ret_20d

3

均线偏离

ma5/10/20/60_bias

4

波动率

vol_5d, vol_20d

2

量价

vol_ratio_5/20, amount_ratio

3

价格位置

high_low_ratio, close_position

2

技术指标

RSI_14

1

规模

turnover_proxy, size_proxy

2

17 个因子，纯 Python 用 pandas groupby + rolling 实现，一行依赖都不需要。

## 跑一下看看效果

用 200 只股票做测试：

训练集: 2022 年（242 天, 43,332 样本）
验证集: 2023 上半年（118 天, 18,594 样本）
标签: 未来 5 日累计收益率
模型: LightGBM (100棵树, lr=0.1)

**4 秒钟训练完成。**

结果：

IC: 0.0624 ← 预测值与真实收益正相关
Rank IC: 0.0559 ← 排序能力有效
Top 20%: +0.159% ← 模型看多的股票平均收益
Bottom 20%: -0.373% ← 模型看空的股票平均收益
Spread: 0.532% ← 多空分化明显

IC 0.062 在日频预测里不算差。更重要的是 **Top 20% 和 Bottom 20% 差距达到 0.53%**，说明模型确实能区分好股票和坏股票——这比 IC 值本身更有说服力。

## 预测信号怎么用

训练好的模型保存为 pickle，预测单日只需一行：

from easyxt_backtest.ml import ModelPredictor

predictor = ModelPredictor("models/lightgbm_model.pkl")
scores = predictor.predict("2023-07-03", stock_pool=all_stocks)

# scores = {"000007.SZ": 0.031, "600519.SH": 0.025, ...}
# 分数越高 = 预期收益越高

把 score 传入现有的 EnhancedBacktestEngine 选股逻辑里，替代原来的人工打分就可以回测了。

## 和之前人工打分的区别

之前的多因子打分：

alpha101因子 → 等权/主观权重 → 排序选股 → 回测

现在的 ML 打分：

17个技术因子 → LightGBM 自动学权重 → 预测分数 → 选股 → 回测

**区别在于权重从"拍脑袋"变成了"模型自动学"。** LightGBM 会自动发现：震荡市里动量因子权重应该降低、趋势市里均线偏离权重应该提高——这些非线性关系人工很难调出来。

## 下一步

**加入 alpha101/191 因子**：17 个技术因子只是起点，把现有因子库里的 300+ 因子作为特征喂进去

**行业中性化**：用现有的 neutralization.py 去除行业暴露

**滚动训练**：每月用最新数据重训，适应市场风格切换

**接入实盘**：预测信号 → QMT 下单，形成闭环

## 代码在哪

核心模块在 easyxt_backtest/ml/：

ml/
├── __init__.py
├── trainer.py # 训练器（DuckDB读取 + 特征计算 + 训练）
└── predictor.py # 预测器（加载模型 + 单日/批量预测）

训练一行启动：

python -m easyxt_backtest.ml.trainer \
 --stock-pool all \
 --train-start 2020-01-01 \
 --train-end 2023-12-31 \
 --n-estimators 300

## 总结

给量化策略加 ML 能力，不需要搞一个复杂的 Qlib 框架。**17 个因子 + LightGBM + DuckDB，200 行代码，4 秒训练**，就能让选股从人工打分升级为模型预测。

核心心法：**不要为了用框架而用框架。** 你的数据在哪，模型就在哪训练。

## 项目地址：github.com/quant-king299/EasyXT

## 📱 关注我们



📚 **分享内容**: 量化交易、Python编程、投资策略
🎯 **更新频率**: 持续更新，干货满满


📈 最新的量化交易策略分享

💻 Python量化编程技巧

📊 市场分析和投资心得

🚀 EasyXT功能更新和使用技巧

💡 量化交易实战案例

*
*