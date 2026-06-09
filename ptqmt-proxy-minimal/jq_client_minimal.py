import requests
import time
import json
from datetime import datetime
from typing import Any, Dict, Optional

class QMTClient:
    """QMT客户端 - 用于与中转服务通信"""
    
    def __init__(self, base_url="http://localhost", token=None):
        """初始化QMT客户端
        
        Args:
            base_url: 中转服务地址
            token: 访问令牌
        """
        self.base_url = base_url.rstrip('/')
        self.token = token
        self.headers = {"Authorization": f"Bearer {token}"} if token else {}
        self.session = requests.Session()
    
    def send_signal(self, strategy_name: str, stock_code: str, order_type: int, 
                   order_volume: int, price_type: int, price: float) -> Optional[str]:
        """发送交易信号到中转服务
        
        Args:
            strategy_name: 策略名称
            stock_code: 股票代码
            order_type: 订单类型 (23=买入, 24=卖出)
            order_volume: 订单数量
            price_type: 价格类型 (11=限价, 44=市价)
            price: 订单价格
            
        Returns:
            str: 信号ID，如果失败返回None
        """
        try:
            payload = {
                "strategy_name": strategy_name,
                "stock_code": stock_code,
                "order_type": order_type,
                "order_volume": order_volume,
                "price_type": price_type,
                "price": price
            }
            
            response = self.session.post(
                f"{self.base_url}/api/send_signal",
                json=payload,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    return result.get('signal_id')
                else:
                    print(f"❌ 信号发送失败: {result.get('message')}")
                    return None
            else:
                print(f"❌ HTTP错误: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ 异常: {e}")
            return None
    
    def get_result(self, signal_id: str) -> Optional[Dict]:
        """获取交易执行结果
        
        Args:
            signal_id: 信号ID
            
        Returns:
            Dict: 执行结果，如果失败返回None
        """
        try:
            response = self.session.get(
                f"{self.base_url}/api/get_result/{signal_id}",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    return result.get('result')
                else:
                    print(f"❌ 结果查询失败: {result.get('message')}")
                    return None
            else:
                print(f"❌ HTTP错误: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ 异常: {e}")
            return None

# 使用示例
def send_order_example():
    # 初始化客户端
    client = QMTClient(
        base_url="http://localhost",
        token="jq_strategy_token"  # 请替换为实际的密钥
    )
    
    # 发送买入信号
    signal_id = client.send_signal(
        strategy_name="MyStrategy",
        stock_code="600000.SH",
        order_type=23,  # 买入
        order_volume=1000,
        price_type=11,  # 限价
        price=10.5
    )
    
    if signal_id:
        print(f"✅ 信号发送成功，信号ID: {signal_id}")
        
        # 可以定期查询执行结果
        # result = client.get_result(signal_id)
        # print(f"执行结果: {result}")
    else:
        print("❌ 信号发送失败")

if __name__ == "__main__":
    send_order_example()