# 第十一章：QMT自动化登录解决方案

在量化交易实践中，QMT客户端的自动登录是确保策略连续运行的关键环节。本章将介绍一套完整的QMT自动登录解决方案，解决部分券商QMT软件无法实现自动登录的技术难题。

---

## 11.1 自动登录技术架构

### 11.1.1 核心技术组件

自动登录系统基于以下核心技术：

- **PyAutoGUI**：实现GUI自动化操作
- **PyWinAuto**：Windows应用程序控制
- **Schedule**：定时任务调度
- **多渠道通知系统**：支持QQ邮件、微信、钉钉通知

### 11.1.2 系统工作流程

```
启动检测 → 进程管理 → 界面操作 → 登录验证 → 状态通知
```

---

## 11.2 自动登录核心实现

### 11.2.1 登录管理器类设计

```python
import time
import pyautogui as pa
import pywinauto as pw
import schedule
import yagmail
import requests
import json
import random
from datetime import datetime

class QMTAutoLoginManager:
    """
    QMT自动登录管理器
    支持模拟盘和实盘环境的自动登录
    """
    
    def __init__(self, 
                 client_path=r'D:\国金QMT交易端模拟\bin.x64\XtItClient.exe',
                 account_id='',
                 account_password='',
                 notification_type='email',
                 sender_email='example@qq.com',
                 email_auth_code='your_auth_code',
                 recipient_list=['recipient@qq.com']):
        """
        初始化登录管理器
        
        参数说明：
        client_path: QMT客户端安装路径
        account_id: 交易账户ID
        account_password: 账户密码
        notification_type: 通知方式 (email/wechat/dingtalk)
        sender_email: 发送邮箱
        email_auth_code: 邮箱授权码
        recipient_list: 接收通知的账户列表
        """
        self.client_path = client_path
        self.account_id = account_id
        self.account_password = account_password
        self.application = None
        self.notification_type = notification_type
        self.sender_email = sender_email
        self.email_auth_code = email_auth_code
        self.recipient_list = recipient_list
```

### 11.2.2 多渠道通知系统

```python
    def send_dingtalk_notification(self, message='交易系统状态更新', 
                                  webhook_tokens=['your_webhook_token']):
        """
        发送钉钉群通知
        """
        webhook_token = random.choice(webhook_tokens)
        api_url = f'https://oapi.dingtalk.com/robot/send?access_token={webhook_token}'
        
        headers = {'Content-Type': 'application/json;charset=utf-8'}
        payload = {
            "msgtype": "text",
            "at": {
                "isAtAll": False,
            },
            "text": {
                "content": message,
            }
        }
        
        try:
            response = requests.post(api_url, data=json.dumps(payload), headers=headers)
            result = response.json()
            
            if result.get('errmsg') == 'ok':
                print('钉钉通知发送成功')
                return True
            else:
                print(f'钉钉通知发送失败: {result}')
                return False
        except Exception as e:
            print(f'钉钉通知异常: {str(e)}')
            return False

    def send_email_notification(self, content='系统状态通知', 
                               sender_email=None, auth_code=None, 
                               recipient=None):
        """
        发送QQ邮件通知
        """
        sender = sender_email or self.sender_email
        password = auth_code or self.email_auth_code
        recipient = recipient or self.recipient_list[0]
        
        try:
            mail_client = yagmail.SMTP(
                user=sender, 
                password=password, 
                host='smtp.qq.com'
            )
            mail_client.send(
                to=recipient, 
                contents=content, 
                subject='QMT交易系统通知'
            )
            print('邮件通知发送成功')
            return True
        except Exception as e:
            print(f'邮件发送失败: {str(e)}')
            return False

    def send_wechat_notification(self, message='交易系统状态更新', 
                                webhook_tokens=[]):
        """
        发送企业微信通知
        """
        webhook_token = random.choice(webhook_tokens)
        api_url = f'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key={webhook_token}'
        
        headers = {'Content-Type': 'application/json;charset=utf-8'}
        payload = {
            "msgtype": "text",
            "at": {
                "isAtAll": False,
            },
            "text": {
                "content": message,
            }
        }
        
        try:
            response = requests.post(api_url, data=json.dumps(payload), headers=headers)
            result = response.json()
            
            if result.get('errmsg') == 'ok':
                print('微信通知发送成功')
                return True
            else:
                print(f'微信通知发送失败: {result}')
                return False
        except Exception as e:
            print(f'微信通知异常: {str(e)}')
            return False

    def dispatch_notification(self, message=''):
        """
        统一通知分发器
        """
        if self.notification_type == 'email':
            self.send_email_notification(
                content=message,
                sender_email=self.sender_email,
                auth_code=self.email_auth_code,
                recipient=self.recipient_list[0]
            )
        elif self.notification_type == 'wechat':
            self.send_wechat_notification(
                message=message,
                webhook_tokens=self.recipient_list
            )
        elif self.notification_type == 'dingtalk':
            self.send_dingtalk_notification(
                message=message,
                webhook_tokens=self.recipient_list
            )
        else:
            # 默认使用邮件通知
            self.send_email_notification(
                content=message,
                sender_email=self.sender_email,
                auth_code=self.email_auth_code,
                recipient=self.recipient_list[0]
            )
```

### 11.2.3 登录核心逻辑

```python
    def execute_login(self):
        """
        执行自动登录流程
        """
        # 检查并关闭已存在的QMT进程
        automation_app = pw.application.Application(backend="uia")
        
        try:
            # 查找现有QMT进程
            existing_process = pw.application.process_from_module("XtItClient.exe")
            print(f'发现现有进程ID: {existing_process}')
            
            # 连接并关闭现有进程
            connected_app = automation_app.connect(process=existing_process)
            connected_app.top_window().dump_tree()
            connected_app.kill()
            print('已关闭现有QMT进程')
        except Exception as e:
            print(f'未发现现有进程或关闭失败: {str(e)}')
        
        # 启动新的QMT客户端
        try:
            self.application = pw.Application(backend='uia').start(
                self.client_path, timeout=10
            )
            time.sleep(5)
            
            # 获取顶层窗口
            main_window = self.application.top_window()
            time.sleep(5)
            
            # 输入账户信息
            pa.typewrite(self.account_id)
            time.sleep(1)
            pa.hotkey('tab')  # 切换到密码输入框
            time.sleep(1)
            pa.typewrite(self.account_password)
            time.sleep(1)
            pa.hotkey('enter')  # 确认登录
            time.sleep(3)
            
            # 验证登录结果
            self._verify_login_status()
            
        except Exception as e:
            error_message = f'{datetime.now()} QMT启动失败: {str(e)}'
            self.dispatch_notification(error_message)
            print(error_message)

    def _verify_login_status(self):
        """
        验证登录状态
        """
        # 提取客户端名称用于窗口标题匹配
        client_name = str(self.client_path).split(":/")[-1].split('/bin.x64')[0]
        login_window_title = f"{client_name} 1.0.0.29456"
        
        try:
            # 尝试查找登录失败窗口
            login_window = self.application.window_(
                title=login_window_title, 
                control_type="Pane"
            )
            login_window.wait('visible', timeout=1)
            
            # 如果找到登录窗口，说明登录失败
            failure_message = f'{datetime.now()} QMT登录失败'
            self.dispatch_notification(failure_message)
            print('登录验证失败！')
            
        except (pw.findwindows.ElementNotFoundError, pw.timings.TimeoutError):
            # 未找到登录窗口，说明登录成功
            success_message = f'{datetime.now()} QMT登录成功'
            self.dispatch_notification(success_message)
            print(f'{datetime.now()} 登录验证成功！')

    def terminate_application(self):
        """
        安全终止QMT应用程序
        """
        if self.application:
            try:
                self.application.kill()
                print('QMT应用程序已安全关闭')
            except Exception as e:
                print(f'关闭应用程序时发生错误: {str(e)}')
```

---

## 11.3 定时任务调度系统

### 11.3.1 交易时间管理

```python
def setup_trading_schedule(login_manager):
    """
    配置交易时间调度
    """
    # 每日开盘前自动登录
    schedule.every().day.at('09:10').do(login_manager.execute_login)
    
    # 每日收盘后安全退出
    schedule.every().day.at('15:30').do(login_manager.terminate_application)
    
    # 周末维护时间重启
    schedule.every().saturday.at('10:00').do(login_manager.execute_login)
    
    print('交易调度任务已配置完成')

def run_scheduler():
    """
    运行调度器主循环
    """
    while True:
        schedule.run_pending()
        time.sleep(60)  # 每分钟检查一次
```

### 11.3.2 完整使用示例

```python
if __name__ == '__main__':
    # 配置登录管理器
    login_manager = QMTAutoLoginManager(
        client_path=r'D:/国金QMT交易端模拟/bin.x64/XtItClient.exe',
        account_id='55011919',
        account_password='259800',
        notification_type='email',
        sender_email='1752515969@qq.com',
        email_auth_code='your_auth_code',
        recipient_list=['1029762153@qq.com']
    )
    
    # 选择运行模式
    run_mode = 'test'  # 'test' 或 'production'
    
    if run_mode == 'test':
        print('=== 测试模式：执行单次登录测试 ===')
        login_manager.execute_login()
        time.sleep(10)  # 等待10秒观察结果
        login_manager.terminate_application()
        
    else:
        print('=== 生产模式：启动定时调度 ===')
        setup_trading_schedule(login_manager)
        run_scheduler()
```

---

## 11.4 部署注意事项

### 11.4.1 环境配置要求

1. **Python依赖包安装**：
```bash
pip install pyautogui pywinauto schedule yagmail requests
```

2. **系统权限设置**：
   - 确保脚本具有管理员权限
   - 配置Windows防火墙允许QMT通信
   - 设置屏幕分辨率和缩放比例固定

### 11.4.2 安全性考虑

1. **账户信息保护**：
   - 使用环境变量存储敏感信息
   - 实施密码加密存储
   - 定期更换授权码

2. **网络安全**：
   - 配置VPN连接（如需要）
   - 监控异常登录行为
   - 实施访问日志记录

### 11.4.3 故障处理机制

1. **异常恢复**：
   - 登录失败自动重试
   - 网络断线重连机制
   - 进程异常自动重启

2. **监控告警**：
   - 实时状态监控
   - 异常情况及时通知
   - 日志文件定期清理

通过这套完整的自动登录解决方案，可以有效解决QMT客户端的登录自动化问题，确保量化交易策略的连续稳定运行。