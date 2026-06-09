/**
 * Docsify 文档内部锚点导航修复脚本
 * 
 * 问题场景：
 * 当点击文档内部目录链接（如 [6. 账户管理API](#6-账户管理api)）时，
 * 会跳转到父级文档顶部而不是准确定位到对应的章节标题。
 * 
 * 修复原理：
 * 1. 监听所有锚点链接的点击事件
 * 2. 检测是否为文档内部锚点跳转（同页面内的 # 链接）
 * 3. 精确匹配目标标题元素的 ID（兼容多种编码方式）
 * 4. 使用平滑滚动准确定位到目标位置
 * 5. 考虑顶部固定导航栏的高度偏移
 */

(function() {
  'use strict';

  // 顶部固定导航栏的高度偏移量（像素）
  const TOP_OFFSET = 88;

  /**
   * 规范化锚点ID，处理多种可能的编码格式
   * @param {string} id - 原始ID字符串
   * @returns {string[]} - 可能的ID变体数组
   */
  function normalizeAnchorId(id) {
    if (!id) return [];
    
    // 移除开头的 # 号
    id = id.replace(/^#/, '');
    
    // 生成可能的ID变体
    const variants = new Set();
    
    // 原始ID
    variants.add(id);
    
    // URL解码版本
    try {
      variants.add(decodeURIComponent(id));
    } catch (e) {
      // 忽略解码错误
    }
    
    // URL编码版本
    try {
      variants.add(encodeURIComponent(id));
    } catch (e) {
      // 忽略编码错误
    }
    
    // 转换为小写（Docsify默认处理方式）
    variants.add(id.toLowerCase());
    
    // 小写 + URL解码
    try {
      variants.add(decodeURIComponent(id).toLowerCase());
    } catch (e) {
      // 忽略解码错误
    }
    
    return Array.from(variants);
  }

  /**
   * 查找匹配的标题元素
   * @param {string} targetId - 目标锚点ID
   * @returns {HTMLElement|null} - 匹配的元素或null
   */
  function findTargetElement(targetId) {
    // 获取所有可能的ID变体
    const idVariants = normalizeAnchorId(targetId);
    
    // 1. 首先尝试直接ID匹配
    for (const variant of idVariants) {
      const el = document.getElementById(variant);
      if (el) {
        console.log('[锚点修复] 直接ID匹配成功:', variant);
        return el;
      }
    }
    
    // 2. 查找所有标题元素
    const headings = document.querySelectorAll(
      '.markdown-section h1[id], .markdown-section h2[id], .markdown-section h3[id], ' +
      '.markdown-section h4[id], .markdown-section h5[id], .markdown-section h6[id]'
    );
    
    // 3. 遍历标题，查找ID匹配的元素
    for (const heading of headings) {
      const headingId = heading.getAttribute('id') || '';
      const headingIdVariants = normalizeAnchorId(headingId);
      
      // 检查是否有任何变体匹配
      for (const targetVariant of idVariants) {
        if (headingIdVariants.includes(targetVariant)) {
          console.log('[锚点修复] 标题ID匹配成功:', headingId, '<=>', targetVariant);
          return heading;
        }
      }
    }
    
    // 4. 兜底：模糊匹配标题文本内容
    const cleanTargetId = targetId.replace(/^#+/, '').replace(/-/g, '').toLowerCase();
    for (const heading of headings) {
      const headingText = (heading.textContent || '').replace(/\s+/g, '').toLowerCase();
      if (headingText.includes(cleanTargetId) || cleanTargetId.includes(headingText)) {
        console.log('[锚点修复] 文本模糊匹配成功:', heading.textContent);
        return heading;
      }
    }
    
    console.warn('[锚点修复] 未找到匹配元素:', targetId);
    return null;
  }

  /**
   * 平滑滚动到目标元素
   * @param {HTMLElement} targetElement - 目标元素
   */
  function scrollToElement(targetElement) {
    if (!targetElement) return;
    
    try {
      // 获取元素位置
      const elementRect = targetElement.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const targetPosition = absoluteElementTop - TOP_OFFSET;
      
      // 平滑滚动
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // 添加高亮效果（可选）
      targetElement.style.transition = 'background-color 0.5s ease';
      const originalBg = targetElement.style.backgroundColor;
      targetElement.style.backgroundColor = 'rgba(66, 185, 131, 0.15)';
      
      setTimeout(() => {
        targetElement.style.backgroundColor = originalBg;
      }, 1500);
      
      // 触发自定义事件，通知 ScrollSpy 更新侧边栏高亮
      setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
      }, 100);
      
      console.log('[锚点修复] 滚动成功:', targetElement.textContent);
    } catch (e) {
      console.error('[锚点修复] 滚动失败:', e);
    }
  }

  /**
   * 处理锚点链接点击
   * @param {Event} e - 点击事件
   */
  function handleAnchorClick(e) {
    const link = e.target.closest('a[href]');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    // 只处理当前页面的锚点链接（格式：#xxx 或 ./xxx#xxx 或相对路径#xxx）
    const anchorPart = href.match(/#(.+)$/);
    
    if (!anchorPart) return; // 不是锚点链接
    
    const targetId = anchorPart[1];
    const linkPath = href.replace(/#.*$/, '');
    
    // 获取当前页面路径（去掉锚点部分）
    const currentHash = location.hash || '#/';
    const currentPath = currentHash.replace(/#[^#]*$/, '');
    
    // 判断是否为同页面内的锚点跳转
    let isSamePage = false;
    
    // 情兵1：纯锚点链接 #xxx
    if (href.startsWith('#') && !href.includes('/')) {
      isSamePage = true;
      console.log('[锚点修复] 检测到纯锚点链接:', href);
    }
    // 情兵2：包含文件路径的锚点链接，检查路径是否匹配
    else if (linkPath) {
      // 规范化路径比较
      const normalizePath = (p) => {
        return p.replace(/^#?\//, '').replace(/^\.\//, '').replace(/\/+$/, '');
      };
      
      const normalizedLinkPath = normalizePath(linkPath);
      const normalizedCurrentPath = normalizePath(currentPath);
      
      // 如果路径匹配或当前路径包含链接路径，认为是同页面
      if (normalizedLinkPath === normalizedCurrentPath || 
          normalizedCurrentPath.includes(normalizedLinkPath)) {
        isSamePage = true;
        console.log('[锚点修复] 检测到同页面锚点跳转:', href);
      }
    }
    
    if (!isSamePage) {
      // 跨页面跳转，需要等待页面加载后再定位
      console.log('[锚点修复] 跨页面跳转，等待页面加载:', href);
      
      // 保存目标锚点ID，等待页面加载后处理
      sessionStorage.setItem('pendingAnchor', targetId);
      return; // 不阻止默认行为，让 Docsify 处理跳转
    }
    
    // 同页面跳转，阻止默认行为
    e.preventDefault();
    e.stopPropagation();
    
    // 延迟查找元素，确保DOM已渲染
    setTimeout(() => {
      const targetElement = findTargetElement(targetId);
      if (targetElement) {
        // 更新URL（不触发页面跳转）
        if (window.history && window.history.pushState) {
          const newHash = currentPath + '#' + targetId;
          window.history.pushState(null, '', newHash);
        }
        
        // 滚动到目标位置
        scrollToElement(targetElement);
      } else {
        console.warn('[锚点修复] 未找到目标元素，使用默认行为');
        // 如果找不到元素，恢复默认行为
        window.location.hash = targetId;
      }
    }, 100);
  }

  /**
   * 初始化锚点修复功能
   */
  function initAnchorFix() {
    console.log('[锚点修复] 初始化锚点导航修复功能');
    
    // 使用事件委托监听所有链接点击
    document.body.addEventListener('click', handleAnchorClick, true);
    
    // 处理页面加载时的锚点跳转
    function handleInitialAnchor() {
      const hash = window.location.hash;
      const anchorMatch = hash.match(/#([^#]+)$/);
      
      // 优先检查 sessionStorage 中是否有待处理的锚点
      const pendingAnchor = sessionStorage.getItem('pendingAnchor');
      if (pendingAnchor) {
        console.log('[锚点修复] 处理待处理锚点:', pendingAnchor);
        sessionStorage.removeItem('pendingAnchor');
        
        setTimeout(() => {
          const targetElement = findTargetElement(pendingAnchor);
          if (targetElement) {
            scrollToElement(targetElement);
          }
        }, 500); // 给更多时间让 Docsify 渲染页面
        return;
      }
      
      if (anchorMatch && anchorMatch[1]) {
        const targetId = anchorMatch[1];
        console.log('[锚点修复] 处理初始锚点:', targetId);
        
        setTimeout(() => {
          const targetElement = findTargetElement(targetId);
          if (targetElement) {
            scrollToElement(targetElement);
          }
        }, 300);
      }
    }
    
    // 监听hash变化
    window.addEventListener('hashchange', handleInitialAnchor);
    
    // 处理初始加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleInitialAnchor);
    } else {
      handleInitialAnchor();
    }
  }

  // 集成到Docsify插件系统
  if (window.$docsify) {
    window.$docsify.plugins = window.$docsify.plugins || [];
    window.$docsify.plugins.push(function(hook, vm) {
      hook.ready(function() {
        initAnchorFix();
      });
      
      hook.doneEach(function() {
        // 每次页面渲染完成后，重新处理可能存在的锚点
        setTimeout(() => {
          const hash = window.location.hash;
          const anchorMatch = hash.match(/#([^#]+)$/);
          if (anchorMatch && anchorMatch[1]) {
            const targetElement = findTargetElement(anchorMatch[1]);
            if (targetElement) {
              scrollToElement(targetElement);
            }
          }
        }, 200);
      });
    });
  } else {
    // 如果Docsify未加载，直接初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAnchorFix);
    } else {
      initAnchorFix();
    }
  }

  console.log('[锚点修复] 脚本加载完成');
})();
