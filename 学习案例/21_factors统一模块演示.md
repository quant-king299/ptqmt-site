# EasyXT 第21课：factors统一模块演示

> factors统一模块演示

展示新增的factors模块功能：
- 定价因子（Fama-French三因子/四因子）
- 因子分析（IC/IR分析）
- 分组回测
- 自定义因子（小市值质量因子）

【导入方式】
# 推荐方式：从factors统一导入
from factors import EasyFactor, FundamentalAnalyzerEnhanced
from factors.pricing import FamaFrenchCalculator
from factors.analysis import ICAnalyzer, GroupBacktester
from factors.custom import SmallCapQualityFactor

# 或者直接从子模块导入
from factors.pricing.fama_french import FamaFrenchCalculator
from factors.analysis.ic_analyzer import ICAnalyzer

源码：[21_factors统一模块演示.py](https://github.com/quant-king299/EasyXT/blob/main/学习实例/21_factors统一模块演示.py)

---
