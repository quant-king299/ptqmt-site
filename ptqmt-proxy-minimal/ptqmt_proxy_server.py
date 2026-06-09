import argparse
import json
import os
import sys
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import List, Dict, Any
import uuid
import time
from datetime import datetime
import uvicorn

# 读取配置文件
CONFIG_FILE = "proxy_config.json"
config = {
    "server": {
        "host": "0.0.0.0",
        "port": 80,
        "debug": False
    },
    "security": {
        "tokens": ["test_token"],
        "allowed_ips": []
    },
    "storage": {
        "type": "memory"
    }
}

if os.path.exists(CONFIG_FILE):
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        config.update(json.load(f))

app = FastAPI(
    title="PTQMT中转服务", 
    description="聚宽策略与QMT交易终端的中转服务",
    debug=config["server"]["debug"]
)

# 信号存储（实际部署时应使用数据库）
signal_queue = []  # 待处理信号队列
processed_signals = {}  # 已处理信号结果

class SignalRequest(BaseModel):
    strategy_name: str
    stock_code: str
    order_type: int  # 23=买入, 24=卖出
    order_volume: int
    price_type: int  # 11=限价, 44=市价
    price: float
    timestamp: int = int(time.time())
    signal_id: str = str(uuid.uuid4())

def verify_token(token: str) -> bool:
    """验证Token"""
    if not token or not token.startswith("Bearer "):
        return False
    
    actual_token = token[7:]  # 移除 "Bearer " 前缀
    return actual_token in config["security"]["tokens"]

def verify_ip(client_ip: str) -> bool:
    """验证客户端IP"""
    allowed_ips = config["security"]["allowed_ips"]
    
    # 如果没有配置IP限制，则允许所有IP
    if not allowed_ips:
        return True
    
    return client_ip in allowed_ips

@app.post("/api/send_signal", summary="接收交易信号")
async def receive_signal(signal: SignalRequest, authorization: str = Header(None)):
    """
    接收聚宽策略发送的交易信号
    """
    # 验证授权
    if not verify_token(authorization):
        raise HTTPException(status_code=401, detail="未授权访问")
    
    # 存储信号到队列
    signal_dict = signal.dict()
    signal_queue.append(signal_dict)
    
    print(f"接收到信号: {signal_dict}")
    
    return {
        "success": True,
        "message": "信号接收成功",
        "signal_id": signal.signal_id
    }

@app.get("/api/get_signals", summary="获取待处理信号")
async def get_pending_signals(authorization: str = Header(None)):
    """
    QMT客户端获取待处理的交易信号
    """
    # 验证授权
    if not verify_token(authorization):
        raise HTTPException(status_code=401, detail="未授权访问")
    
    # 返回待处理信号（最多返回配置中指定的数量）
    max_signals = config.get("limits", {}).get("max_signals_per_request", 10)
    pending_signals = signal_queue[:max_signals]
    
    # 从队列中移除已返回的信号
    del signal_queue[:len(pending_signals)]
    
    print(f"返回{len(pending_signals)}个待处理信号")
    
    return {
        "success": True,
        "signals": pending_signals
    }

@app.post("/api/report_result", summary="报告执行结果")
async def report_execution_result(result: dict, authorization: str = Header(None)):
    """
    QMT客户端报告交易执行结果
    """
    # 验证授权
    if not verify_token(authorization):
        raise HTTPException(status_code=401, detail="未授权访问")
    
    # 存储执行结果
    signal_id = result.get("signal_id")
    if signal_id:
        processed_signals[signal_id] = result
        print(f"接收到执行结果: {result}")
    
    return {
        "success": True,
        "message": "结果接收成功"
    }

@app.get("/api/get_result/{signal_id}", summary="查询执行结果")
async def get_execution_result(signal_id: str, authorization: str = Header(None)):
    """
    聚宽策略查询交易执行结果
    """
    # 验证授权
    if not verify_token(authorization):
        raise HTTPException(status_code=401, detail="未授权访问")
    
    # 返回执行结果
    result = processed_signals.get(signal_id)
    if not result:
        raise HTTPException(status_code=404, detail="未找到执行结果")
    
    return {
        "success": True,
        "result": result
    }

@app.get("/api/health", summary="健康检查")
async def health_check():
    """
    检查服务是否正常运行
    """
    return {
        "status": "healthy",
        "timestamp": int(time.time()),
        "version": "1.0.0"
    }

@app.get("/", summary="API文档")
async def root():
    """
    API根路径，返回API文档链接
    """
    return {
        "message": "PTQMT中转服务已启动",
        "docs": "/docs",
        "redoc": "/redoc"
    }

def run_server(host=None, port=None):
    """运行服务器"""
    # 使用配置文件中的设置，或使用传入的参数
    server_host = host or config["server"]["host"]
    server_port = port or config["server"]["port"]
    
    print(f"启动PTQMT中转服务...")
    print(f"监听地址: {server_host}:{server_port}")
    print(f"配置文件: {CONFIG_FILE}")
    
    uvicorn.run(
        app, 
        host=server_host, 
        port=server_port,
        reload=config["server"]["debug"]
    )

# Windows服务支持
class WindowsService:
    def __init__(self):
        self.stop_requested = False
    
    def start(self):
        """启动服务"""
        try:
            run_server()
        except KeyboardInterrupt:
            print("服务已停止")
        except Exception as e:
            print(f"服务启动失败: {e}")
    
    def stop(self):
        """停止服务"""
        self.stop_requested = True
        print("正在停止服务...")

if __name__ == "__main__":
    # 检查是否作为Windows服务运行
    if len(sys.argv) > 1 and sys.argv[1] == "service":
        # 作为Windows服务运行
        service = WindowsService()
        service.start()
    else:
        # 解析命令行参数
        parser = argparse.ArgumentParser(description="PTQMT中转服务")
        parser.add_argument("--host", default=config["server"]["host"], help="服务监听地址")
        parser.add_argument("--port", type=int, default=config["server"]["port"], help="服务端口")
        parser.add_argument("--config", default=CONFIG_FILE, help="配置文件路径")
        parser.add_argument("--service", action="store_true", help="作为Windows服务运行")
        
        args = parser.parse_args()
        
        # 更新配置
        config["server"]["host"] = args.host
        config["server"]["port"] = args.port
        
        # 运行服务器
        run_server(args.host, args.port)