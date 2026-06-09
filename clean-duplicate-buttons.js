/* ==================== 轻量级：只删除重复的左下角按钮 ==================== */

(function() {
  'use strict';

  function cleanDuplicateButtons() {
    const preElements = document.querySelectorAll('.markdown-section pre');
    
    preElements.forEach(pre => {
      const buttons = Array.from(pre.querySelectorAll('button'));
      
      // 只保留第一个button（右上角官方按钮），删除其他的
      if (buttons.length > 1) {
        for (let i = 1; i < buttons.length; i++) {
          buttons[i].remove();
        }
      }
    });
  }

  // 仅在DOMContentLoaded时执行一次
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanDuplicateButtons);
  } else {
    cleanDuplicateButtons();
  }

  // Docsify切换页面时执行
  if (window.$docsify) {
    const originalPlugins = window.$docsify.plugins || [];
    window.$docsify.plugins = [].concat(originalPlugins, function(hook) {
      hook.doneEach(function() {
        setTimeout(cleanDuplicateButtons, 100);
      });
    });
  }
})();
