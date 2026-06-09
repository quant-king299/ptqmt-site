import requests
import json

# 配置
BASE_URL = "http://localhost:80"  # 根据实际情况修改
TOKEN = "ptqmt_secret_token_2025"  # 根据实际情况修改

def test_health_check():
    """测试服务健康检查"""
    print("测试健康检查...")
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        if response.status_code == 200:
            print("✅ 健康检查通过")
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ 健康检查异常: 无法连接到服务，请确保服务已启动")
    except Exception as e:
        print(f"❌ 健康检查异常: {e}")

def test_send_signal():
    """测试发送信号"""
    print("\n测试发送信号...")
    try:
        headers = {
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "strategy_name": "TestStrategy",
            "stock_code": "600000.SH",
            "order_type": 23,  # 买入
            "order_volume": 100,
            "price_type": 11,  # 限价
            "price": 10.5
        }
        
        response = requests.post(
            f"{BASE_URL}/api/send_signal",
            headers=headers,
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 信号发送成功")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            return result.get("signal_id")
        else:
            print(f"❌ 信号发送失败: {response.status_code}")
            print(response.text)
            return None
    except requests.exceptions.ConnectionError:
        print("❌ 信号发送异常: 无法连接到服务，请确保服务已启动")
        return None
    except Exception as e:
        print(f"❌ 信号发送异常: {e}")
        return None

def main():
    """主测试函数"""
    print("PTQMT中转服务精简版测试工具")
    print("=" * 50)
    
    # 测试健康检查
    test_health_check()
    
    # 测试发送信号
    signal_id = test_send_signal()
    
    print("\n" + "=" * 50)
    print("测试完成")

if __name__ == "__main__":
    main()