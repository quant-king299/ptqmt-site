// VS Code风格代码高亮和行号功能
document.addEventListener('DOMContentLoaded', function() {
    // 为正文中的代码块添加行号和复制功能
    function addCodeFeatures() {
        const codeBlocks = document.querySelectorAll('.markdown-section pre code');
        
        codeBlocks.forEach(function(codeBlock) {
            // 避免重复处理
            if (codeBlock.classList.contains('code-enhanced')) {
                return;
            }
            
            const pre = codeBlock.parentElement;
            const lines = codeBlock.textContent.split('\n');
            
            // 创建行号容器
            const lineNumbersContainer = document.createElement('div');
            lineNumbersContainer.className = 'line-numbers';
            lineNumbersContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                width: 3.5rem;
                background: #252526;
                border-right: 1px solid #3c3c3c;
                padding: 1.2rem 0.5rem;
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                font-size: 14px;
                line-height: 1.6;
                color: #858585;
                text-align: right;
                user-select: none;
                z-index: 1;
            `;
            
            // 生成行号
            for (let i = 1; i <= lines.length; i++) {
                const lineNumber = document.createElement('div');
                lineNumber.textContent = i;
                lineNumber.style.cssText = `
                    height: 1.6em;
                    line-height: 1.6;
                `;
                lineNumbersContainer.appendChild(lineNumber);
            }
            
            // 添加复制按钮
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-code-btn';
            copyButton.textContent = 'Copy';
            copyButton.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                background: #3c3c3c;
                color: #d4d4d4;
                border: none;
                padding: 6px 10px;
                border-radius: 3px;
                font-size: 12px;
                cursor: pointer;
                z-index: 10;
                transition: all 0.2s ease;
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                opacity: 0;
                visibility: hidden;
            `;
            
            copyButton.onclick = function() {
                // 使用现代的 Clipboard API
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                        copyButton.textContent = 'Copied!';
                        setTimeout(() => {
                            copyButton.textContent = 'Copy';
                        }, 2000);
                    });
                } else {
                    // 降级到传统方法
                    const textArea = document.createElement('textarea');
                    textArea.value = codeBlock.textContent;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                    }, 2000);
                }
            };
            
            // 鼠标悬停事件
            pre.addEventListener('mouseenter', function() {
                copyButton.style.opacity = '1';
                copyButton.style.visibility = 'visible';
            });
            
            pre.addEventListener('mouseleave', function() {
                copyButton.style.opacity = '0';
                copyButton.style.visibility = 'hidden';
            });
            
            // 复制按钮悬停效果
            copyButton.addEventListener('mouseenter', function() {
                copyButton.style.background = '#007acc';
                copyButton.style.color = 'white';
                copyButton.style.transform = 'translateY(-1px)';
            });
            
            copyButton.addEventListener('mouseleave', function() {
                copyButton.style.background = '#3c3c3c';
                copyButton.style.color = '#d4d4d4';
                copyButton.style.transform = 'translateY(0)';
            });
            
            // 设置pre为相对定位
            pre.style.position = 'relative';
            
            // 添加行号容器和复制按钮
            pre.appendChild(lineNumbersContainer);
            pre.appendChild(copyButton);
            
            // 标记已处理
            codeBlock.classList.add('code-enhanced');
        });
    }
    
    // 初始化
    addCodeFeatures();
    
    // 监听页面变化，为动态加载的代码块添加功能
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                addCodeFeatures();
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});