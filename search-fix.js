// 搜索框显示修复脚本 - 最终强化版

// 移除重复搜索框的函数
function removeDuplicateSearchBoxes() {
    // 查找所有搜索容器
    const searchContainers = Array.from(document.querySelectorAll('.search, .docsify-search'));
    const searchInputs = Array.from(document.querySelectorAll('input[type="search"]'));
    
    console.log('搜索容器数量:', searchContainers.length);
    console.log('搜索输入框数量:', searchInputs.length);
    
    // 只保留第一个搜索容器
    if (searchContainers.length > 1) {
        console.log('发现重复搜索框，正在清理...');
        for (let i = 1; i < searchContainers.length; i++) {
            if (searchContainers[i] && searchContainers[i].parentNode) {
                searchContainers[i].parentNode.removeChild(searchContainers[i]);
            }
        }
        console.log('搜索容器清理完成');
    }
    
    // 只保留第一个搜索输入框
    if (searchInputs.length > 1) {
        console.log('发现重复搜索输入框，正在清理...');
        for (let i = 1; i < searchInputs.length; i++) {
            if (searchInputs[i] && searchInputs[i].parentNode) {
                searchInputs[i].parentNode.removeChild(searchInputs[i]);
            }
        }
        console.log('搜索输入框清理完成');
    }
    
    // 特别处理：确保侧边栏中只有一个搜索容器
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const sidebarSearchContainers = Array.from(sidebar.querySelectorAll('.search'));
        if (sidebarSearchContainers.length > 1) {
            console.log('侧边栏中发现重复搜索框，正在清理...');
            for (let i = 1; i < sidebarSearchContainers.length; i++) {
                if (sidebarSearchContainers[i] && sidebarSearchContainers[i].parentNode) {
                    sidebarSearchContainers[i].parentNode.removeChild(sidebarSearchContainers[i]);
                }
            }
            console.log('侧边栏搜索框清理完成');
        }
    }
}

// 强制显示第一个搜索框
function forceShowFirstSearchBox() {
    const firstSearchContainer = document.querySelector('.search, .docsify-search');
    const firstSearchInput = document.querySelector('input[type="search"]');
    
    if (firstSearchContainer) {
        firstSearchContainer.style.setProperty('display', 'block', 'important');
        firstSearchContainer.style.setProperty('visibility', 'visible', 'important');
        firstSearchContainer.style.setProperty('opacity', '1', 'important');
    }
    
    if (firstSearchInput) {
        firstSearchInput.style.setProperty('display', 'block', 'important');
        firstSearchInput.style.setProperty('visibility', 'visible', 'important');
        firstSearchInput.style.setProperty('opacity', '1', 'important');
    }
}

// 页面加载完成后确保只有一个搜索框
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(removeDuplicateSearchBoxes, 500);
    setTimeout(removeDuplicateSearchBoxes, 1500);
    setTimeout(forceShowFirstSearchBox, 1000);
});

// 页面完全加载后再检查一次
window.addEventListener('load', function() {
    setTimeout(removeDuplicateSearchBoxes, 1000);
    setTimeout(removeDuplicateSearchBoxes, 3000);
    setTimeout(forceShowFirstSearchBox, 2000);
});

// 监听页面路由变化
window.addEventListener('hashchange', function() {
    setTimeout(removeDuplicateSearchBoxes, 300);
    setTimeout(forceShowFirstSearchBox, 500);
});

// 监听DOM变化，确保不会出现重复的搜索框
const observer = new MutationObserver(function(mutations) {
    let shouldCheck = false;
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    if (node.classList && (
                        node.classList.contains('search') || 
                        node.classList.contains('docsify-search') ||
                        node.querySelector && node.querySelector('.search') ||
                        node.querySelector && node.querySelector('input[type="search"]')
                    )) {
                        shouldCheck = true;
                    }
                }
            });
        }
    });
    
    if (shouldCheck) {
        setTimeout(removeDuplicateSearchBoxes, 100);
        setTimeout(forceShowFirstSearchBox, 200);
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// 如果docsify已经加载，也执行一次
if (window.$docsify) {
    window.$docsify.plugins = window.$docsify.plugins || [];
    window.$docsify.plugins.push(function(hook, vm) {
        hook.ready(function() {
            setTimeout(function() {
                // 确保搜索框显示
                const searchContainers = document.querySelectorAll('.search');
                const searchInputs = document.querySelectorAll('.search input[type="search"]');
                
                searchContainers.forEach(function(container) {
                    if (container) {
                        container.style.setProperty('display', 'block', 'important');
                        container.style.setProperty('visibility', 'visible', 'important');
                        container.style.setProperty('opacity', '1', 'important');
                    }
                });
                
                searchInputs.forEach(function(input) {
                    if (input) {
                        input.style.setProperty('display', 'block', 'important');
                        input.style.setProperty('visibility', 'visible', 'important');
                        input.style.setProperty('opacity', '1', 'important');
                    }
                });
            }, 200);
        });
    });
}

// 页面完全加载后的最终检查
window.addEventListener('load', function() {
    setTimeout(function() {
        // 调试：查看页面上所有的搜索相关元素
        console.log('=== 搜索框调试信息 ===');
        const allSearchElements = document.querySelectorAll('.search, .docsify-search, input[type="search"], input[placeholder*="搜索"]');
        console.log('找到的搜索相关元素数量:', allSearchElements.length);
        allSearchElements.forEach((el, index) => {
            console.log(`元素 ${index}:`, el.tagName, el.className, el.placeholder || '');
            console.log('  父元素:', el.parentElement ? el.parentElement.className : '无');
        });
        
        // 移除重复的搜索框
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            // 查找所有搜索容器
            const searchContainers = Array.from(sidebar.querySelectorAll('.search'));
            console.log('侧边栏中的搜索容器数量:', searchContainers.length);
            
            // 如果有多个搜索容器，只保留第一个
            if (searchContainers.length > 1) {
                console.log('移除多余的搜索容器...');
                // 从最后一个开始移除，直到只剩一个
                while (searchContainers.length > 1) {
                    const containerToRemove = searchContainers.pop();
                    console.log('移除搜索容器:', containerToRemove);
                    containerToRemove.remove();
                }
            }
            
            // 查找所有搜索输入框
            const searchInputs = Array.from(sidebar.querySelectorAll('input[type="search"]'));
            console.log('侧边栏中的搜索输入框数量:', searchInputs.length);
            
            // 如果有多个搜索输入框，只保留第一个
            if (searchInputs.length > 1) {
                console.log('移除多余的搜索输入框...');
                // 从最后一个开始移除，直到只剩一个
                while (searchInputs.length > 1) {
                    const inputToRemove = searchInputs.pop();
                    console.log('移除搜索输入框:', inputToRemove);
                    inputToRemove.remove();
                }
            }
            
            // 特别处理：查找并移除任何不在.search容器内的独立搜索输入框
            const allInputs = Array.from(sidebar.querySelectorAll('input'));
            allInputs.forEach(input => {
                // 如果这是一个搜索输入框，但不在.search容器内
                if ((input.type === 'search' || (input.placeholder && input.placeholder.includes('搜索'))) && 
                    !input.closest('.search')) {
                    console.log('移除独立的搜索输入框:', input);
                    input.remove();
                }
            });
            
            // 最后检查：确保只有一个.search容器，并且它包含一个搜索输入框
            const finalSearchContainers = sidebar.querySelectorAll('.search');
            if (finalSearchContainers.length === 1) {
                const container = finalSearchContainers[0];
                const inputsInContainer = container.querySelectorAll('input[type="search"]');
                console.log('最终搜索容器中的输入框数量:', inputsInContainer.length);
                
                // 如果容器中没有搜索输入框，添加一个
                if (inputsInContainer.length === 0) {
                    const input = document.createElement('input');
                    input.type = 'search';
                    input.placeholder = '🔍 搜索文档内容...';
                    input.className = 'search-input';
                    container.appendChild(input);
                    console.log('添加缺失的搜索输入框');
                }
                // 如果容器中有多个搜索输入框，只保留第一个
                else if (inputsInContainer.length > 1) {
                    console.log('移除容器中多余的搜索输入框...');
                    for (let i = 1; i < inputsInContainer.length; i++) {
                        console.log('移除输入框:', inputsInContainer[i]);
                        inputsInContainer[i].remove();
                    }
                }
            }
        }
    }, 2000);
});

// 执行搜索的函数
function performSearch(query) {
    console.log('执行搜索:', query);
    // 这里可以添加实际的搜索逻辑
    // 例如触发Docsify的搜索功能
}