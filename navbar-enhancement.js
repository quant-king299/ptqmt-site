/* ==================== 顶部导航栏增强 - 面包屑和主题切换 ==================== */

(function() {
  'use strict';

  // 主题状态
  let isDarkMode = localStorage.getItem('theme-mode') === 'dark';

  // 初始化主题
  function initTheme() {
    // 尝试获取主题切换按钮，无论是在导航栏还是侧边栏中
    let themeToggle = document.getElementById('theme-toggle');
    
    // 如果没找到，尝试通过类名查找
    if (!themeToggle) {
      const toggles = document.querySelectorAll('#theme-toggle, .navbar-theme-toggle');
      if (toggles.length > 0) {
        themeToggle = toggles[0];
      }
    }
    
    if (!themeToggle) {
      // 如果还没找到，设置一个定时器稍后重试
      setTimeout(initTheme, 100);
      return;
    }

    // 应用保存的主题
    applyTheme(isDarkMode);
    
    // 直接添加事件监听器，而不克隆节点
    // 检查是否已经添加过监听器，避免重复添加
    if (!themeToggle.hasAttribute('data-theme-listener-added')) {
      themeToggle.setAttribute('data-theme-listener-added', 'true');
      themeToggle.addEventListener('click', function() {
        isDarkMode = !isDarkMode;
        applyTheme(isDarkMode);
        localStorage.setItem('theme-mode', isDarkMode ? 'dark' : 'light');
      });
    }
  }

  // 应用主题
  function applyTheme(dark) {
    // 获取或创建深色主题CSS文件
    let darkCss = document.getElementById('dark-theme-css');
    
    if (dark) {
      // 如果深色主题CSS还未添加，则添加它
      if (!darkCss) {
        darkCss = document.createElement('link');
        darkCss.id = 'dark-theme-css';
        darkCss.rel = 'stylesheet';
        darkCss.href = 'themes/dark.css';
        document.head.appendChild(darkCss);
      }
      
      // 启用深色主题CSS
      darkCss.disabled = false;
      
      // 更新主题切换按钮的文本和提示（月亮图标代表深色主题）
      const toggles = document.querySelectorAll('#theme-toggle, .navbar-theme-toggle');
      toggles.forEach(toggle => {
        toggle.textContent = '🌙';
        toggle.title = '切换到浅色主题';
      });
    } else {
      // 如果深色主题CSS存在，则移除它
      if (darkCss) {
        darkCss.parentNode.removeChild(darkCss);
      }
      
      // 更新主题切换按钮的文本和提示（太阳图标代表浅色主题）
      const toggles = document.querySelectorAll('#theme-toggle, .navbar-theme-toggle');
      toggles.forEach(toggle => {
        toggle.textContent = '☀️';
        toggle.title = '切换到深色主题';
      });
    }
  }

  // 更新面包屑导航
  function updateBreadcrumb() {
    const breadcrumbEl = document.getElementById('breadcrumb');
    if (!breadcrumbEl) return;

    const path = window.location.hash.slice(2).split('/');
    const breadcrumbs = [];

    // 主页
    breadcrumbs.push('<a href="#/">🏠 首页</a>');

    // 构建路径
    let currentPath = '#/';
    for (let i = 0; i < path.length - 1; i++) {
      const segment = decodeURIComponent(path[i]);
      currentPath += segment + '/';
      breadcrumbs.push(`<a href="${currentPath}">${segment}</a>`);
    }

    // 当前页面（不可点击）
    const currentPage = decodeURIComponent(path[path.length - 1]);
    if (currentPage && currentPage !== '') {
      breadcrumbs.push(`<span>${currentPage}</span>`);
    }

    // 渲染
    breadcrumbEl.innerHTML = breadcrumbs.join('<span class="breadcrumb-separator"> / </span>');
  }

  // 页面加载完成时初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initTheme();
      updateBreadcrumb();
    });
  } else {
    initTheme();
    updateBreadcrumb();
  }

  // Docsify 钩子
  if (window.$docsify) {
    const originalPlugins = window.$docsify.plugins || [];
    window.$docsify.plugins = [].concat(originalPlugins, function(hook) {
      // 页面切换时更新面包屑
      hook.doneEach(function() {
        updateBreadcrumb();
        // 重新初始化主题切换按钮，确保在页面切换后仍能正常工作
        initTheme();
      });
    });
  }

  // 监听哈希变化
  window.addEventListener('hashchange', function() {
    updateBreadcrumb();
  });
})();