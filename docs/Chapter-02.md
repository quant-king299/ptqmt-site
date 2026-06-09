# 实时行情数据管理与订阅系统

在量化交易系统中，实时行情数据是策略决策的核心驱动力。本章将深入探讨QMT平台的行情数据管理体系，包括数据订阅、获取、处理等完整的技术方案。

## 行情数据架构概览

QMT平台的行情数据系统采用分层架构设计：

- **数据源层**：连接交易所实时行情源
- **缓存层**：本地数据缓存和历史数据存储
- **订阅层**：灵活的数据订阅和推送机制
- **应用层**：策略程序的数据消费接口

这种架构确保了数据的实时性、完整性和高可用性。

---

## 单股行情订阅机制

### 2.01 精准单股数据订阅

单股订阅是针对特定标的进行精确数据获取的核心方法，适用于重点关注少数标的的交易策略。

**核心特性**：
- 支持多时间周期的实时数据推送
- 内置历史数据缓存机制
- 灵活的回调函数处理模式
- 建议单次订阅数量控制在50只以内

**函数语法**：

```python
subscribe_quote(
    stock_code,      # 标的代码
    period='1d',     # 数据周期
    start_time='',   # 历史数据起始时间
    end_time='',     # 历史数据结束时间
    count=0,         # 历史数据条数
    callback=None    # 数据推送回调函数
)
```

**参数详解**：

| 参数名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| stock_code | string | 合约代码标识 | '600031.SH' |
| period | string | 数据时间周期 | '1m', '5m', '1d' |
| start_time | string | 历史数据开始时间 | '20240101' |
| end_time | string | 历史数据结束时间 | '20241231' |
| count | int | 历史数据获取条数 | 0表示仅订阅实时数据 |
| callback | function | 数据推送处理函数 | on_data(datas) |

**实际应用示例**：

```python
from xtquant import xtdata
import time

class MarketDataHandler:
    """市场数据处理器"""
    
    def __init__(self):
        self.subscriptions = {}
        self.data_cache = {}
    
    def on_market_data(self, datas):
        """行情数据回调处理"""
        for stock_code, data_list in datas.items():
            if not data_list:
                continue
                
            latest_data = data_list[-1]
            
            # 数据质量检查
            if self.validate_data(latest_data):
                self.process_market_data(stock_code, latest_data)
            else:
                print(f"数据质量异常: {stock_code}")
    
    def validate_data(self, data):
        """数据有效性验证"""
        required_fields = ['time', 'open', 'high', 'low', 'close', 'volume']
        
        for field in required_fields:
            if field not in data or data[field] is None:
                return False
        
        # 价格合理性检查
        if data['high'] < data['low'] or data['close'] <= 0:
            return False
            
        return True
    
    def process_market_data(self, stock_code, data):
        """处理有效的市场数据"""
        # 更新数据缓存
        if stock_code not in self.data_cache:
            self.data_cache[stock_code] = []
        
        self.data_cache[stock_code].append(data)
        
        # 保持缓存大小
        if len(self.data_cache[stock_code]) > 1000:
            self.data_cache[stock_code] = self.data_cache[stock_code][-500:]
        
        # 计算技术指标
        indicators = self.calculate_indicators(stock_code)
        
        # 触发策略信号
        self.check_trading_signals(stock_code, data, indicators)
    
    def calculate_indicators(self, stock_code):
        """计算技术指标"""
        if stock_code not in self.data_cache or len(self.data_cache[stock_code]) < 20:
            return {}
        
        prices = [item['close'] for item in self.data_cache[stock_code][-20:]]
        volumes = [item['volume'] for item in self.data_cache[stock_code][-20:]]
        
        # 移动平均线
        ma5 = sum(prices[-5:]) / 5 if len(prices) >= 5 else prices[-1]
        ma10 = sum(prices[-10:]) / 10 if len(prices) >= 10 else prices[-1]
        ma20 = sum(prices) / len(prices)
        
        # 成交量移动平均
        vol_ma5 = sum(volumes[-5:]) / 5 if len(volumes) >= 5 else volumes[-1]
        
        return {
            'ma5': ma5,
            'ma10': ma10,
            'ma20': ma20,
            'vol_ma5': vol_ma5,
            'current_price': prices[-1],
            'price_change': (prices[-1] - prices[-2]) / prices[-2] * 100 if len(prices) > 1 else 0
        }
    
    def check_trading_signals(self, stock_code, data, indicators):
        """检查交易信号"""
        if not indicators:
            return
        
        current_price = indicators['current_price']
        ma5 = indicators['ma5']
        ma20 = indicators['ma20']
        
        # 金叉信号
        if ma5 > ma20 and indicators.get('prev_ma5', 0) <= indicators.get('prev_ma20', 0):
            print(f"金叉信号: {stock_code}, 价格: {current_price}")
        
        # 死叉信号
        elif ma5 < ma20 and indicators.get('prev_ma5', 0) >= indicators.get('prev_ma20', 0):
            print(f"死叉信号: {stock_code}, 价格: {current_price}")
    
    def subscribe_stocks(self, stock_list, period='1m'):
        """批量订阅股票行情"""
        for stock_code in stock_list:
            subscription_id = xtdata.subscribe_quote(
                stock_code=stock_code,
                period=period,
                count=100,  # 获取100条历史数据用于指标计算
                callback=self.on_market_data
            )
            
            self.subscriptions[stock_code] = subscription_id
            print(f"订阅成功: {stock_code}, 订阅号: {subscription_id}")

# 使用示例
handler = MarketDataHandler()
stock_list = ['600031.SH', '600036.SH', '000001.SZ']
handler.subscribe_stocks(stock_list, period='1m')

# 保持程序运行
xtdata.run()
```

---

## 全市场行情订阅

### 2.02 全推行情数据流

全推行情订阅适用于需要监控整个市场或大量标的的场景，提供了高效的批量数据处理能力。

**核心优势**：
- 一次订阅获取全市场数据
- 减少网络请求开销
- 支持自定义数据过滤
- 适合市场扫描和机会发现

**函数语法**：

```python
subscribe_whole_quote(callback=None)
```

**高级应用示例**：

```python
class MarketScanner:
    """市场扫描器"""
    
    def __init__(self):
        self.market_data = {}
        self.scan_results = []
        self.filters = {
            'min_volume': 1000000,      # 最小成交量
            'max_price_change': 0.095,  # 最大涨跌幅
            'min_price': 5.0,           # 最低价格
            'max_price': 100.0          # 最高价格
        }
    
    def on_whole_market_data(self, datas):
        """全市场数据处理"""
        filtered_data = self.apply_filters(datas)
        
        for stock_code, data in filtered_data.items():
            self.analyze_opportunity(stock_code, data)
    
    def apply_filters(self, datas):
        """应用数据过滤条件"""
        filtered = {}
        
        for stock_code, data in datas.items():
            if self.meets_criteria(data):
                filtered[stock_code] = data
        
        return filtered
    
    def meets_criteria(self, data):
        """检查是否满足筛选条件"""
        if not data or 'volume' not in data or 'close' not in data:
            return False
        
        # 成交量过滤
        if data['volume'] < self.filters['min_volume']:
            return False
        
        # 价格区间过滤
        price = data['close']
        if price < self.filters['min_price'] or price > self.filters['max_price']:
            return False
        
        # 涨跌幅过滤
        if 'preClose' in data and data['preClose'] > 0:
            price_change = abs(price - data['preClose']) / data['preClose']
            if price_change > self.filters['max_price_change']:
                return False
        
        return True
    
    def analyze_opportunity(self, stock_code, data):
        """分析投资机会"""
        # 计算关键指标
        volume_ratio = self.calculate_volume_ratio(stock_code, data)
        price_momentum = self.calculate_momentum(stock_code, data)
        
        # 机会评分
        opportunity_score = self.calculate_opportunity_score(
            volume_ratio, price_momentum, data
        )
        
        if opportunity_score > 0.7:  # 高分机会
            self.scan_results.append({
                'stock_code': stock_code,
                'score': opportunity_score,
                'volume_ratio': volume_ratio,
                'momentum': price_momentum,
                'price': data['close'],
                'timestamp': data.get('time', 0)
            })
    
    def calculate_volume_ratio(self, stock_code, data):
        """计算成交量比率"""
        if stock_code not in self.market_data:
            return 1.0
        
        historical_volumes = [
            item.get('volume', 0) 
            for item in self.market_data[stock_code][-20:]
        ]
        
        if not historical_volumes:
            return 1.0
        
        avg_volume = sum(historical_volumes) / len(historical_volumes)
        current_volume = data.get('volume', 0)
        
        return current_volume / avg_volume if avg_volume > 0 else 1.0
    
    def calculate_momentum(self, stock_code, data):
        """计算价格动量"""
        if stock_code not in self.market_data or len(self.market_data[stock_code]) < 5:
            return 0.0
        
        recent_prices = [
            item.get('close', 0) 
            for item in self.market_data[stock_code][-5:]
        ]
        
        if len(recent_prices) < 2:
            return 0.0
        
        # 计算价格变化趋势
        price_changes = [
            (recent_prices[i] - recent_prices[i-1]) / recent_prices[i-1]
            for i in range(1, len(recent_prices))
        ]
        
        return sum(price_changes) / len(price_changes)
    
    def calculate_opportunity_score(self, volume_ratio, momentum, data):
        """计算机会评分"""
        score = 0.0
        
        # 成交量异常加分
        if volume_ratio > 2.0:
            score += 0.3
        elif volume_ratio > 1.5:
            score += 0.2
        
        # 价格动量加分
        if 0.01 < momentum < 0.05:  # 温和上涨
            score += 0.4
        elif momentum > 0.05:  # 强势上涨
            score += 0.3
        
        # 价格位置加分
        if 'high' in data and 'low' in data:
            price_position = (data['close'] - data['low']) / (data['high'] - data['low'])
            if price_position > 0.8:  # 接近高点
                score += 0.2
        
        return min(score, 1.0)  # 最高分为1.0

# 使用示例
scanner = MarketScanner()
xtdata.subscribe_whole_quote(callback=scanner.on_whole_market_data)
xtdata.run()
```

---

## 订阅管理与控制

### 2.03 智能订阅管理系统

有效的订阅管理是保证系统稳定运行的关键，包括订阅的创建、监控、取消等完整生命周期管理。

**函数语法**：

```python
unsubscribe_quote(subscribe_id)
```

**订阅管理器实现**：

```python
class SubscriptionManager:
    """订阅管理器"""
    
    def __init__(self):
        self.active_subscriptions = {}
        self.subscription_stats = {}
        self.max_subscriptions = 100
    
    def create_subscription(self, stock_code, period='1m', callback=None):
        """创建新订阅"""
        if len(self.active_subscriptions) >= self.max_subscriptions:
            self.cleanup_inactive_subscriptions()
        
        if len(self.active_subscriptions) >= self.max_subscriptions:
            raise Exception("订阅数量已达上限")
        
        try:
            subscription_id = xtdata.subscribe_quote(
                stock_code=stock_code,
                period=period,
                callback=callback or self.default_callback
            )
            
            self.active_subscriptions[subscription_id] = {
                'stock_code': stock_code,
                'period': period,
                'create_time': time.time(),
                'last_data_time': 0,
                'data_count': 0
            }
            
            return subscription_id
            
        except Exception as e:
            print(f"订阅创建失败: {stock_code}, 错误: {str(e)}")
            return None
    
    def cancel_subscription(self, subscription_id):
        """取消订阅"""
        try:
            xtdata.unsubscribe_quote(subscription_id)
            
            if subscription_id in self.active_subscriptions:
                stock_code = self.active_subscriptions[subscription_id]['stock_code']
                del self.active_subscriptions[subscription_id]
                print(f"订阅已取消: {stock_code}")
                return True
                
        except Exception as e:
            print(f"取消订阅失败: {subscription_id}, 错误: {str(e)}")
        
        return False
    
    def cleanup_inactive_subscriptions(self):
        """清理不活跃的订阅"""
        current_time = time.time()
        inactive_threshold = 300  # 5分钟无数据视为不活跃
        
        inactive_subscriptions = []
        
        for sub_id, info in self.active_subscriptions.items():
            if current_time - info['last_data_time'] > inactive_threshold:
                inactive_subscriptions.append(sub_id)
        
        for sub_id in inactive_subscriptions:
            self.cancel_subscription(sub_id)
    
    def default_callback(self, datas):
        """默认数据回调"""
        current_time = time.time()
        
        for stock_code, data_list in datas.items():
            # 更新订阅统计
            for sub_id, info in self.active_subscriptions.items():
                if info['stock_code'] == stock_code:
                    info['last_data_time'] = current_time
                    info['data_count'] += len(data_list)
                    break
    
    def get_subscription_stats(self):
        """获取订阅统计信息"""
        stats = {
            'total_subscriptions': len(self.active_subscriptions),
            'active_subscriptions': 0,
            'data_flow_rate': 0
        }
        
        current_time = time.time()
        total_data_count = 0
        
        for info in self.active_subscriptions.values():
            if current_time - info['last_data_time'] < 60:  # 1分钟内有数据
                stats['active_subscriptions'] += 1
            total_data_count += info['data_count']
        
        # 计算数据流速率（条/分钟）
        if self.active_subscriptions:
            avg_create_time = sum(
                info['create_time'] for info in self.active_subscriptions.values()
            ) / len(self.active_subscriptions)
            
            time_elapsed = (current_time - avg_create_time) / 60  # 转换为分钟
            if time_elapsed > 0:
                stats['data_flow_rate'] = total_data_count / time_elapsed
        
        return stats

# 使用示例
manager = SubscriptionManager()

# 创建订阅
sub_id1 = manager.create_subscription('600031.SH', '1m')
sub_id2 = manager.create_subscription('000001.SZ', '1m')

# 监控订阅状态
import threading
import time

def monitor_subscriptions():
    while True:
        stats = manager.get_subscription_stats()
        print(f"订阅统计: {stats}")
        time.sleep(30)

monitor_thread = threading.Thread(target=monitor_subscriptions)
monitor_thread.daemon = True
monitor_thread.start()
```

---

## 历史数据获取与管理

### 2.04 本地数据高效访问

本地数据访问是量化策略回测和历史分析的基础，提供了快速、稳定的数据获取能力。

**函数语法**：

```python
get_local_data(
    field_list=[],      # 数据字段列表
    stock_list=[],      # 股票代码列表
    period='1d',        # 数据周期
    start_time='',      # 开始时间
    end_time='',        # 结束时间
    count=-1,           # 数据条数
    dividend_type='none',  # 复权类型
    fill_data=True,     # 数据填充
    data_dir=None       # 数据目录
)
```

**高级数据管理器**：

```python
class HistoricalDataManager:
    """历史数据管理器"""
    
    def __init__(self, data_dir=None):
        self.data_dir = data_dir
        self.cache = {}
        self.cache_size_limit = 1000  # MB
        self.current_cache_size = 0
    
    def get_market_data(self, stock_list, period='1d', start_date=None, end_date=None, fields=None):
        """获取市场数据"""
        if fields is None:
            fields = ['open', 'high', 'low', 'close', 'volume', 'amount']
        
        # 检查缓存
        cache_key = self.generate_cache_key(stock_list, period, start_date, end_date, fields)
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        try:
            data = xtdata.get_local_data(
                field_list=fields,
                stock_list=stock_list,
                period=period,
                start_time=start_date or '',
                end_time=end_date or '',
                fill_data=True,
                data_dir=self.data_dir
            )
            
            # 数据质量检查
            cleaned_data = self.clean_data(data)
            
            # 更新缓存
            self.update_cache(cache_key, cleaned_data)
            
            return cleaned_data
            
        except Exception as e:
            print(f"数据获取失败: {str(e)}")
            return {}
    
    def clean_data(self, raw_data):
        """数据清洗"""
        cleaned = {}
        
        for field, data_frame in raw_data.items():
            if data_frame is None or data_frame.empty:
                continue
            
            # 移除异常值
            cleaned_df = data_frame.copy()
            
            # 价格数据异常值处理
            if field in ['open', 'high', 'low', 'close']:
                # 移除零值和负值
                cleaned_df = cleaned_df[cleaned_df > 0]
                
                # 移除极端异常值（超过3个标准差）
                for stock in cleaned_df.index:
                    stock_data = cleaned_df.loc[stock]
                    mean_val = stock_data.mean()
                    std_val = stock_data.std()
                    
                    if std_val > 0:
                        outlier_mask = abs(stock_data - mean_val) > 3 * std_val
                        cleaned_df.loc[stock, outlier_mask] = None
            
            # 成交量数据处理
            elif field == 'volume':
                # 移除负值
                cleaned_df = cleaned_df[cleaned_df >= 0]
            
            # 前向填充缺失值
            cleaned_df = cleaned_df.fillna(method='ffill')
            
            cleaned[field] = cleaned_df
        
        return cleaned
    
    def generate_cache_key(self, stock_list, period, start_date, end_date, fields):
        """生成缓存键"""
        key_components = [
            ','.join(sorted(stock_list)),
            period,
            start_date or 'None',
            end_date or 'None',
            ','.join(sorted(fields))
        ]
        return '|'.join(key_components)
    
    def update_cache(self, cache_key, data):
        """更新缓存"""
        # 估算数据大小（简化计算）
        data_size = sum(
            df.memory_usage(deep=True).sum() / 1024 / 1024  # 转换为MB
            for df in data.values() if df is not None
        )
        
        # 检查缓存大小限制
        if self.current_cache_size + data_size > self.cache_size_limit:
            self.cleanup_cache()
        
        self.cache[cache_key] = data
        self.current_cache_size += data_size
    
    def cleanup_cache(self):
        """清理缓存"""
        # 简单的LRU策略：清理一半缓存
        cache_items = list(self.cache.items())
        items_to_remove = len(cache_items) // 2
        
        for i in range(items_to_remove):
            del self.cache[cache_items[i][0]]
        
        self.current_cache_size *= 0.5  # 简化的大小估算
    
    def calculate_technical_indicators(self, stock_code, data, indicators=['MA', 'RSI', 'MACD']):
        """计算技术指标"""
        if 'close' not in data or stock_code not in data['close'].index:
            return {}
        
        close_prices = data['close'].loc[stock_code].dropna()
        if len(close_prices) < 20:
            return {}
        
        results = {}
        
        # 移动平均线
        if 'MA' in indicators:
            results['MA5'] = close_prices.rolling(window=5).mean()
            results['MA10'] = close_prices.rolling(window=10).mean()
            results['MA20'] = close_prices.rolling(window=20).mean()
        
        # RSI指标
        if 'RSI' in indicators:
            results['RSI'] = self.calculate_rsi(close_prices)
        
        # MACD指标
        if 'MACD' in indicators:
            macd_data = self.calculate_macd(close_prices)
            results.update(macd_data)
        
        return results
    
    def calculate_rsi(self, prices, period=14):
        """计算RSI指标"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def calculate_macd(self, prices, fast=12, slow=26, signal=9):
        """计算MACD指标"""
        ema_fast = prices.ewm(span=fast).mean()
        ema_slow = prices.ewm(span=slow).mean()
        
        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal).mean()
        histogram = macd_line - signal_line
        
        return {
            'MACD': macd_line,
            'MACD_Signal': signal_line,
            'MACD_Histogram': histogram
        }

# 使用示例
data_manager = HistoricalDataManager()

# 获取历史数据
stock_list = ['600031.SH', '000001.SZ']
data = data_manager.get_market_data(
    stock_list=stock_list,
    period='1d',
    start_date='20240101',
    end_date='20241231'
)

# 计算技术指标
for stock in stock_list:
    indicators = data_manager.calculate_technical_indicators(stock, data)
    print(f"{stock} 技术指标计算完成")
```

---

## 指数成分股管理

### 2.05 指数权重数据处理

指数成分股数据是构建指数化投资策略和风险管理的重要基础。

**核心功能**：
- 获取指数成分股列表和权重
- 支持权重变化历史追踪
- 提供成分股调整事件监控

**函数语法**：

```python
# 下载指数权重数据
download_index_weight()

# 获取指数权重信息
get_index_weight(index_code)
```

**指数管理器实现**：

```python
class IndexManager:
    """指数管理器"""
    
    def __init__(self):
        self.index_data = {}
        self.weight_history = {}
        self.rebalance_dates = {}
    
    def download_and_update_weights(self):
        """下载并更新权重数据"""
        try:
            xtdata.download_index_weight()
            print("指数权重数据下载完成")
            return True
        except Exception as e:
            print(f"权重数据下载失败: {str(e)}")
            return False
    
    def get_index_composition(self, index_code, date=None):
        """获取指数成分股构成"""
        try:
            weights = xtdata.get_index_weight(index_code)
            
            if not weights:
                return {}
            
            # 按权重排序
            sorted_weights = dict(sorted(weights.items(), key=lambda x: x[1], reverse=True))
            
            # 计算累计权重
            total_weight = sum(sorted_weights.values())
            cumulative_weight = 0
            composition_analysis = {}
            
            for stock_code, weight in sorted_weights.items():
                cumulative_weight += weight
                composition_analysis[stock_code] = {
                    'weight': weight,
                    'weight_pct': weight / total_weight * 100,
                    'cumulative_weight_pct': cumulative_weight / total_weight * 100
                }
            
            return composition_analysis
            
        except Exception as e:
            print(f"获取指数构成失败: {index_code}, 错误: {str(e)}")
            return {}
    
    def analyze_index_concentration(self, index_code, top_n=10):
        """分析指数集中度"""
        composition = self.get_index_composition(index_code)
        
        if not composition:
            return {}
        
        # 获取前N大权重股
        top_stocks = list(composition.items())[:top_n]
        top_weight = sum(item[1]['weight'] for item in top_stocks)
        total_weight = sum(item[1]['weight'] for item in composition.items())
        
        # 计算集中度指标
        concentration_ratio = top_weight / total_weight * 100
        
        # 计算赫芬达尔指数（HHI）
        hhi = sum((weight['weight'] / total_weight) ** 2 for weight in composition.values()) * 10000
        
        return {
            'index_code': index_code,
            'total_stocks': len(composition),
            f'top_{top_n}_concentration': concentration_ratio,
            'herfindahl_index': hhi,
            'top_stocks': [
                {
                    'stock_code': stock_code,
                    'weight': info['weight'],
                    'weight_pct': info['weight_pct']
                }
                for stock_code, info in top_stocks
            ]
        }
    
    def create_index_portfolio(self, index_code, target_amount=1000000, min_weight=0.001):
        """创建指数投资组合"""
        composition = self.get_index_composition(index_code)
        
        if not composition:
            return {}
        
        portfolio = {}
        total_weight = sum(info['weight'] for info in composition.values())
        
        for stock_code, info in composition.items():
            # 过滤权重过小的股票
            if info['weight'] / total_weight < min_weight:
                continue
            
            # 计算目标投资金额
            target_investment = target_amount * (info['weight'] / total_weight)
            
            portfolio[stock_code] = {
                'weight': info['weight'],
                'target_amount': target_investment,
                'weight_pct': info['weight_pct']
            }
        
        return portfolio
    
    def monitor_index_changes(self, index_code):
        """监控指数成分变化"""
        current_composition = self.get_index_composition(index_code)
        
        if index_code in self.index_data:
            previous_composition = self.index_data[index_code]
            
            # 检测新增股票
            new_stocks = set(current_composition.keys()) - set(previous_composition.keys())
            # 检测移除股票
            removed_stocks = set(previous_composition.keys()) - set(current_composition.keys())
            
            # 检测权重变化
            weight_changes = {}
            for stock_code in set(current_composition.keys()) & set(previous_composition.keys()):
                old_weight = previous_composition[stock_code]['weight']
                new_weight = current_composition[stock_code]['weight']
                
                if abs(new_weight - old_weight) > 0.01:  # 权重变化超过0.01%
                    weight_changes[stock_code] = {
                        'old_weight': old_weight,
                        'new_weight': new_weight,
                        'change': new_weight - old_weight
                    }
            
            changes = {
                'new_stocks': list(new_stocks),
                'removed_stocks': list(removed_stocks),
                'weight_changes': weight_changes
            }
            
            if any(changes.values()):
                print(f"指数 {index_code} 发生变化:")
                if new_stocks:
                    print(f"  新增股票: {new_stocks}")
                if removed_stocks:
                    print(f"  移除股票: {removed_stocks}")
                if weight_changes:
                    print(f"  权重变化: {len(weight_changes)} 只股票")
        
        # 更新缓存
        self.index_data[index_code] = current_composition
        return current_composition

# 使用示例
index_manager = IndexManager()

# 下载权重数据
if index_manager.download_and_update_weights():
    # 分析沪深300指数
    analysis = index_manager.analyze_index_concentration('000300.SH', top_n=10)
    print(f"沪深300指数分析结果: {analysis}")
    
    # 创建投资组合
    portfolio = index_manager.create_index_portfolio('000300.SH', target_amount=1000000)
    print(f"投资组合创建完成，包含 {len(portfolio)} 只股票")
```

---

## 系统运行控制

### 2.06 程序生命周期管理

在订阅模式下，程序需要保持运行状态以持续接收数据推送。`run()` 方法提供了稳定的运行环境。

**函数语法**：

```python
run()
```

**高级运行控制器**：

```python
class ApplicationController:
    """应用程序控制器"""
    
    def __init__(self):
        self.is_running = False
        self.subscriptions = []
        self.error_count = 0
        self.max_errors = 10
        self.restart_delay = 5  # 秒
    
    def start(self):
        """启动应用程序"""
        self.is_running = True
        
        try:
            print("应用程序启动中...")
            self.setup_subscriptions()
            
            # 启动监控线程
            monitor_thread = threading.Thread(target=self.monitor_system)
            monitor_thread.daemon = True
            monitor_thread.start()
            
            # 主运行循环
            xtdata.run()
            
        except Exception as e:
            print(f"应用程序运行异常: {str(e)}")
            self.handle_error(e)
    
    def setup_subscriptions(self):
        """设置订阅"""
        # 这里可以添加具体的订阅逻辑
        pass
    
    def monitor_system(self):
        """系统监控"""
        while self.is_running:
            try:
                # 检查系统状态
                self.check_system_health()
                time.sleep(30)  # 每30秒检查一次
                
            except Exception as e:
                print(f"监控异常: {str(e)}")
                self.error_count += 1
    
    def check_system_health(self):
        """检查系统健康状态"""
        # 检查内存使用
        import psutil
        memory_percent = psutil.virtual_memory().percent
        
        if memory_percent > 90:
            print(f"内存使用率过高: {memory_percent}%")
        
        # 检查订阅状态
        if hasattr(self, 'subscription_manager'):
            stats = self.subscription_manager.get_subscription_stats()
            if stats['active_subscriptions'] == 0:
                print("警告: 没有活跃的订阅")
    
    def handle_error(self, error):
        """错误处理"""
        self.error_count += 1
        
        if self.error_count >= self.max_errors:
            print("错误次数过多，程序退出")
            self.stop()
        else:
            print(f"程序将在 {self.restart_delay} 秒后重启")
            time.sleep(self.restart_delay)
            self.start()
    
    def stop(self):
        """停止应用程序"""
        self.is_running = False
        print("应用程序正在停止...")
        
        # 清理订阅
        for subscription in self.subscriptions:
            try:
                xtdata.unsubscribe_quote(subscription)
            except:
                pass
        
        print("应用程序已停止")

# 使用示例
controller = ApplicationController()
controller.start()
```

---

## 总结

本章详细介绍了QMT平台行情数据管理的完整体系，包括：

1. **单股订阅机制**：精确的个股数据获取和处理
2. **全市场订阅**：高效的批量数据处理和市场扫描
3. **订阅管理**：完整的订阅生命周期管理
4. **历史数据访问**：本地数据的高效获取和缓存
5. **指数管理**：成分股权重数据的处理和分析
6. **系统控制**：稳定的程序运行环境

通过这些功能的组合使用，可以构建出功能完整、性能优异的量化交易数据处理系统。在下一章中，我们将探讨如何将这些数据转化为实际的交易信号和策略执行。
