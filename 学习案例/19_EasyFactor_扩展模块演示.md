# EasyXT 第19课：EasyFactor 扩展模块演示（完整版）

> EasyFactor 扩展模块演示（完整版）

展示整合后的EasyFactor功能：

【qstock数据源】
- 同花顺行业/概念资金流向（90行业+387概念）
- 北向资金流向（外资流向）
- 同花顺个股资金流向（5175只股票）

【DuckDB本地数据源】
- 767万条历史数据记录（2015-2026）
- 增强版基本面因子（29个因子）
- 智能缓存（首次下载，后续读取本地）

【新增：factors统一模块】
- 定价因子：Fama-French三因子/四因子
- 因子分析：IC/IR分析、分组回测
- 自定义因子：小市值质量因子等

【导入方式说明】
# 方式1：从easy_xt导入（原有方式，仍然有效）
from easy_xt.factor_library import create_easy_factor
from easy_xt.fundamental_enhanced import FundamentalAnalyzerEnhanced

# 方式2：从factors导入（推荐，统一接口）
from factors import EasyFactor, FundamentalAnalyzerEnhanced
from factors.pricing import FamaFrenchCalculator
from factors.analysis import ICAnalyzer, GroupBacktester
from factors.custom import SmallCapQualityFactor

源码：[19_EasyFactor_扩展模块演示.py](https://github.com/quant-king299/EasyXT/blob/main/学习实例/19_EasyFactor_扩展模块演示.py)

---
