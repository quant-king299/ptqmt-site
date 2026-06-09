import requests
import time
import json
import sys

# 配置
BASE_URL = "http://localhost:80"  # 根据实际情况修改
TOKEN = "test_token"  # 根据实际情况修改

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

def test_get_signals():
    """测试获取信号"""
    print("\n测试获取信号...")
    try:
        headers = {
            "Authorization": f"Bearer {TOKEN}"
        }
        
        response = requests.get(
            f"{BASE_URL}/api/get_signals",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 获取信号成功")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            return result.get("signals", [])
        else:
            print(f"❌ 获取信号失败: {response.status_code}")
            print(response.text)
            return []
    except requests.exceptions.ConnectionError:
        print("❌ 获取信号异常: 无法连接到服务，请确保服务已启动")
        return []
    except Exception as e:
        print(f"❌ 获取信号异常: {e}")
        return []

def test_report_result(signal_id):
    """测试报告执行结果"""
    print("\n测试报告执行结果...")
    if not signal_id:
        print("❌ 无信号ID，跳过测试")
        return
        
    try:
        headers = {
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "signal_id": signal_id,
            "success": True,
            "order_id": "test_order_12345",
            "timestamp": int(time.time())
        }
        
        response = requests.post(
            f"{BASE_URL}/api/report_result",
            headers=headers,
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 报告执行结果成功")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(f"❌ 报告执行结果失败: {response.status_code}")
            print(response.text)
    except requests.exceptions.ConnectionError:
        print("❌ 报告执行结果异常: 无法连接到服务，请确保服务已启动")
    except Exception as e:
        print(f"❌ 报告执行结果异常: {e}")

def test_get_result(signal_id):
    """测试获取执行结果"""
    print("\n测试获取执行结果...")
    if not signal_id:
        print("❌ 无信号ID，跳过测试")
        return
        
    try:
        headers = {
            "Authorization": f"Bearer {TOKEN}"
        }
        
        response = requests.get(
            f"{BASE_URL}/api/get_result/{signal_id}",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 获取执行结果成功")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(f"❌ 获取执行结果失败: {response.status_code}")
            print(response.text)
    except requests.exceptions.ConnectionError:
        print("❌ 获取执行结果异常: 无法连接到服务，请确保服务已启动")
    except Exception as e:
        print(f"❌ 获取执行结果异常: {e}")

def main():
    """主测试函数"""
    print("PTQMT中转服务测试工具")
    print("=" * 50)
    
    # 测试健康检查
    test_health_check()
    
    # 测试发送信号
    signal_id = test_send_signal()
    
    # 等待一下让信号被处理
    time.sleep(1)
    
    # 测试获取信号
    signals = test_get_signals()
    
    # 测试报告执行结果
    test_report_result(signal_id)
    
    # 等待一下让结果被处理
    time.sleep(1)
    
    # 测试获取执行结果
    test_get_result(signal_id)
    
    print("\n" + "=" * 50)
    print("测试完成")
    
    # 等待用户按键
    input("\n按回车键退出...")

if __name__ == "__main__":
    main()