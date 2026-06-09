# PTQMT代理服务安装脚本
# 将PTQMT代理服务注册为Windows系统服务

param(
    [string]$ServiceName = "PTQMTProxy",
    [string]$ServiceDisplayName = "PTQMT Proxy Service",
    [string]$ServiceDescription = "PTQMT中转服务 - 聚宽策略与QMT交易终端的中转服务",
    [string]$InstallPath = "C:\ptqmt-proxy",
    [string]$PythonPath = "python",
    [switch]$Install,
    [switch]$Uninstall,
    [switch]$Start,
    [switch]$Stop
)

# 检查管理员权限
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "错误: 需要管理员权限运行此脚本" -ForegroundColor Red
    Write-Host "请以管理员身份运行PowerShell" -ForegroundColor Yellow
    exit 1
}

# 服务可执行文件路径
$ServiceExePath = Join-Path $InstallPath "WinSW.exe"
$ServiceConfigPath = Join-Path $InstallPath "ptqmt-proxy-service.xml"

function Install-PTQMTService {
    Write-Host "安装 PTQMT 代理服务..." -ForegroundColor Yellow
    
    # 创建服务包装器配置
    $serviceConfig = @"
<service>
    <id>$ServiceName</id>
    <name>$ServiceDisplayName</name>
    <description>$ServiceDescription</description>
    <executable>$PythonPath</executable>
    <arguments>ptqmt_proxy_server.py</arguments>
    <workingdirectory>$InstallPath</workingdirectory>
    <logmode>rotate</logmode>
    <logpath>$InstallPath\logs</logpath>
    <onfailure action="restart" delay="10 sec"/>
    <onfailure action="restart" delay="20 sec"/>
    <onfailure action="reboot"/>
</service>
"@
    
    $serviceConfig | Out-File -FilePath $ServiceConfigPath -Encoding UTF8
    
    # 下载WinSW (Windows Service Wrapper)
    $winswUrl = "https://github.com/winsw/winsw/releases/download/v2.12.0/WinSW.NET4.exe"
    $winswPath = Join-Path $InstallPath "WinSW.exe"
    
    if (-not (Test-Path $winswPath)) {
        Write-Host "下载 Windows Service Wrapper..." -ForegroundColor Yellow
        try {
            Invoke-WebRequest -Uri $winswUrl -OutFile $winswPath -UseBasicParsing
            Write-Host "下载完成" -ForegroundColor Green
        } catch {
            Write-Host "下载失败: $_" -ForegroundColor Red
            Write-Host "请手动下载 WinSW.exe 到 $InstallPath 目录" -ForegroundColor Yellow
            return
        }
    }
    
    # 安装服务
    try {
        & $ServiceExePath install $ServiceConfigPath
        Write-Host "服务安装成功" -ForegroundColor Green
        
        # 设置服务启动类型为自动
        Set-Service -Name $ServiceName -StartupType Automatic
        Write-Host "服务启动类型设置为自动" -ForegroundColor Green
        
    } catch {
        Write-Host "服务安装失败: $_" -ForegroundColor Red
    }
}

function Uninstall-PTQMTService {
    Write-Host "卸载 PTQMT 代理服务..." -ForegroundColor Yellow
    
    try {
        # 停止服务
        Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
        
        # 卸载服务
        & $ServiceExePath uninstall $ServiceConfigPath
        Write-Host "服务卸载成功" -ForegroundColor Green
        
        # 清理文件
        Remove-Item $ServiceExePath -Force -ErrorAction SilentlyContinue
        Remove-Item $ServiceConfigPath -Force -ErrorAction SilentlyContinue
        
    } catch {
        Write-Host "服务卸载失败: $_" -ForegroundColor Red
    }
}

function Start-PTQMTService {
    Write-Host "启动 PTQMT 代理服务..." -ForegroundColor Yellow
    try {
        Start-Service -Name $ServiceName
        Write-Host "服务启动成功" -ForegroundColor Green
    } catch {
        Write-Host "服务启动失败: $_" -ForegroundColor Red
    }
}

function Stop-PTQMTService {
    Write-Host "停止 PTQMT 代理服务..." -ForegroundColor Yellow
    try {
        Stop-Service -Name $ServiceName -Force
        Write-Host "服务停止成功" -ForegroundColor Green
    } catch {
        Write-Host "服务停止失败: $_" -ForegroundColor Red
    }
}

# 执行操作
if ($Install) {
    Install-PTQMTService
} elseif ($Uninstall) {
    Uninstall-PTQMTService  
} elseif ($Start) {
    Start-PTQMTService
} elseif ($Stop) {
    Stop-PTQMTService
} else {
    Write-Host "PTQMT 代理服务管理器" -ForegroundColor Green
    Write-Host "用法:" -ForegroundColor Yellow
    Write-Host "  安装服务: .\install_ptqmt_service.ps1 -Install" -ForegroundColor White
    Write-Host "  卸载服务: .\install_ptqmt_service.ps1 -Uninstall" -ForegroundColor White
    Write-Host "  启动服务: .\install_ptqmt_service.ps1 -Start" -ForegroundColor White
    Write-Host "  停止服务: .\install_ptqmt_service.ps1 -Stop" -ForegroundColor White
    Write-Host ""
    Write-Host "当前服务状态:" -ForegroundColor Yellow
    try {
        $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
        if ($service) {
            Write-Host "  服务名: $($service.Name)" -ForegroundColor White
            Write-Host "  显示名: $($service.DisplayName)" -ForegroundColor White
            Write-Host "  状态: $($service.Status)" -ForegroundColor White
            Write-Host "  启动类型: $((Get-WmiObject -Class Win32_Service -Filter "Name='$ServiceName'").StartMode)" -ForegroundColor White
        } else {
            Write-Host "  服务未安装" -ForegroundColor Red
        }
    } catch {
        Write-Host "  无法获取服务状态" -ForegroundColor Red
    }
}