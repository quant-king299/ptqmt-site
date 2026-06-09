import requests
import time

class QMTSignalClient:
    def __init__(self, base_url="http://localhost", token=None):
        self.base_url = base_url.rstrip('/')
        self.token = token
        self.headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    def get_pending_signals(self):
        """
        从中转服务获取待处理的交易信号
        """
        try:
            response = requests.get(
                f"{self.base_url}/api/get_signals",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    return result.get('signals', [])
                else:
                    print(f"❌ 获取信号失败: {result.get('message')}")
                    return []
            else:
                print(f"❌ HTTP错误: {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ 异常: {e}")
            return []
    
    def report_result(self, result):
        """
        向中转服务报告执行结果
        """
        try:
            response = requests.post(
                f"{self.base_url}/api/report_result",
                json=result,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('success', False)
            else:
                print(f"❌ HTTP错误: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 异常: {e}")
            return False
    
    def run(self):
        """
        运行信号处理循环
        """
        print("开始监听交易信号...")
        while True:
            try:
                # 获取待处理信号
                signals = self.get_pending_signals()
                
                # 处理每个信号
                for signal in signals:
                    print(f"处理信号: {signal}")
                    
                    # 这里应该调用QMT的交易接口执行交易
                    # 为了示例，我们只是模拟执行结果
                    execution_result = {
                        "signal_id": signal.get('signal_id'),
                        "success": True,
                        "order_id": f"order_{int(time.time())}",
                        "timestamp": int(time.time())
                    }
                    
                    # 报告结果
                    self.report_result(execution_result)
                    print(f"执行结果已报告: {execution_result}")
                
                # 等待一段时间再检查
                time.sleep(5)
            except KeyboardInterrupt:
                print("程序已退出")
                break
            except Exception as e:
                print(f"❌ 处理信号时发生错误: {e}")
                time.sleep(5)

# 使用示例
if __name__ == "__main__":
    # 初始化客户端
    client = QMTSignalClient(
        base_url="http://localhost",
        token="qmt_client_token"  # 请替换为实际的密钥
    )
    
    # 运行信号处理循环
    client.run()