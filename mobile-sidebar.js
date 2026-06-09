// 移动端侧边栏控制脚本
(function() {
    'use strict';
    
    // 检查是否为移动设备
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // 创建侧边栏切换按钮
    function createSidebarToggle() {
        // 检查是否已经存在
        let existingToggle = document.querySelector('.sidebar-toggle');
        let existingOverlay = document.querySelector('.sidebar-overlay');
        
        // 创建按钮和遮罩层
        if (!existingToggle) {
            existingToggle = document.createElement('button');
            existingToggle.className = 'sidebar-toggle';
            existingToggle.innerHTML = '☰';
            existingToggle.setAttribute('aria-label', '切换侧边栏');
            existingToggle.id = 'mobile-sidebar-toggle';
            // 插入到body的开头
            document.body.insertBefore(existingToggle, document.body.firstChild);
        }
        
        if (!existingOverlay) {
            existingOverlay = document.createElement('div');
            existingOverlay.className = 'sidebar-overlay';
            existingOverlay.id = 'mobile-sidebar-overlay';
            document.body.appendChild(existingOverlay);
        }
        
        return { toggleBtn: existingToggle, overlay: existingOverlay };
    }
    
    // 切换侧边栏显示状态
    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        const toggleBtn = document.querySelector('.sidebar-toggle');
        
        if (!sidebar || !overlay || !toggleBtn) return;
        
        const isVisible = sidebar.classList.contains('show');
        
        if (isVisible) {
            // 隐藏侧边栏
            hideSidebar();
        } else {
            // 显示侧边栏
            showSidebar();
        }
    }
    
    // 隐藏侧边栏
    function hideSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        const toggleBtn = document.querySelector('.sidebar-toggle');
        
        if (sidebar) {
            sidebar.classList.remove('show');
        }
        if (overlay) {
            overlay.classList.remove('show');
        }
        if (toggleBtn) {
            toggleBtn.innerHTML = '☰';
        }
    }
    
    // 显示侧边栏
    function showSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        const toggleBtn = document.querySelector('.sidebar-toggle');
        
        if (sidebar) {
            sidebar.classList.add('show');
        }
        if (overlay) {
            overlay.classList.add('show');
        }
        if (toggleBtn) {
            toggleBtn.innerHTML = '✕';
        }
    }
    
    // 初始化移动端侧边栏
    function initMobileSidebar() {
        // 创建必要的元素
        const elements = createSidebarToggle();
        if (!elements.toggleBtn || !elements.overlay) return;
        
        const { toggleBtn, overlay } = elements;
        
        // 添加点击事件 - 使用事件委托确保不会重复绑定
        toggleBtn.removeEventListener('click', handleToggleClick);
        toggleBtn.addEventListener('click', handleToggleClick);
        
        // 添加遮罩层点击事件
        overlay.removeEventListener('click', handleOverlayClick);
        overlay.addEventListener('click', handleOverlayClick);
        
        // 为侧边栏内的链接添加点击事件
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            // 移除旧的事件监听器
            sidebar.removeEventListener('click', handleSidebarLinkClick, true);
            // 添加新的事件监听器（捕获阶段）
            sidebar.addEventListener('click', handleSidebarLinkClick, true);
        }
        
        // 窗口大小变化时重新检查
        window.addEventListener('resize', handleResize);
        
        // 初始化显示状态
        handleResize();
    }
    
    // 处理切换按钮点击
    function handleToggleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
    }
    
    // 处理遮罩层点击
    function handleOverlayClick(e) {
        if (e.target === this) {
            hideSidebar();
        }
    }
    
    // 处理侧边栏链接点击
    function handleSidebarLinkClick(e) {
        // 如果点击的是链接，则在延迟后隐藏侧边栏
        if (e.target.tagName === 'A') {
            setTimeout(() => {
                hideSidebar();
            }, 100);
        }
    }
    
    // 处理窗口大小变化
    function handleResize() {
        const sidebar = document.querySelector('.sidebar');
        const toggle = document.querySelector('.sidebar-toggle');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (!isMobile()) {
            // 桌面端：隐藏移动端控件
            if (toggle) toggle.style.display = 'none';
            if (overlay) overlay.style.display = 'none';
            if (sidebar) {
                sidebar.classList.remove('show');
            }
        } else {
            // 移动端：显示移动端控件
            if (toggle) {
                toggle.style.display = 'block';
                // 确保按钮在正确位置
                toggle.style.position = 'fixed';
                toggle.style.top = '12px';
                toggle.style.left = '12px';
                toggle.style.zIndex = '201';
            }
            if (overlay) {
                overlay.style.display = 'block';
            }
            if (sidebar) {
                sidebar.style.transform = 'translateX(-100%)';
            }
        }
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initMobileSidebar, 100);
        });
    } else {
        setTimeout(initMobileSidebar, 100);
    }
    
    // docsify钩子
    if (window.$docsify) {
        window.$docsify.plugins = (window.$docsify.plugins || []).concat([
            function(hook) {
                hook.doneEach(function() {
                    setTimeout(initMobileSidebar, 100);
                });
                
                hook.mounted(function() {
                    setTimeout(initMobileSidebar, 100);
                });
            }
        ]);
    }
    
    // 定时检查并初始化（备用方案）
    let checkCount = 0;
    const checkInterval = setInterval(function() {
        checkCount++;
        if (checkCount > 30) {
            clearInterval(checkInterval);
            return;
        }
        
        if (document.querySelector('.sidebar')) {
            initMobileSidebar();
            clearInterval(checkInterval);
        }
    }, 300);
    
})();