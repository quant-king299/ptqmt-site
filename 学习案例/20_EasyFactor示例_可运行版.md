# EasyXT 第20课：EasyFactor 使用示例 - 可运行版本 (DuckDB版)

> EasyFactor 使用示例 - 可运行版本 (DuckDB版)

展示EasyFactor的主要功能

【导入方式说明】
# 方式1：从easy_xt导入（原有方式，仍然有效）
from easy_xt.factor_library import EasyFactor, create_easy_factor

# 方式2：从factors导入（推荐，统一接口）
from factors import EasyFactor, create_easy_factor

# 新增功能导入
from factors.pricing import FamaFrenchCalculator
from factors.analysis import ICAnalyzer, GroupBacktester
from factors.custom import SmallCapQualityFactor

源码：[20_EasyFactor示例_可运行版.py](https://github.com/quant-king299/EasyXT/blob/main/学习实例/20_EasyFactor示例_可运行版.py)

---
