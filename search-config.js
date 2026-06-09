// 搜索功能增强配置
window.searchConfig = {
  // 搜索索引配置
  index: {
    // 需要索引的字段
    fields: ['title', 'content', 'tags', 'keywords'],
    // 搜索权重
    weights: {
      title: 10,
      content: 1,
      tags: 5,
      keywords: 8
    }
  },
  
  // 搜索结果优化
  results: {
    // 最大显示结果数
    maxResults: 20,
    // 高亮配置
    highlight: {
      pre: '<mark class="search-highlight">',
      post: '</mark>'
    },
    // 摘要长度
    excerptLength: 150
  },
  
  // 搜索建议（已禁用）
  suggestions: {
    enabled: false,
    // 热门搜索词
    popular: [],
    // 搜索历史
    history: {
      enabled: false,
      maxItems: 0
    }
  },
  
  // 搜索分类
  categories: {
    'QMT相关': ['Chapter-01', 'Chapter-02', 'Chapter-04', 'Chapter-05', 'Chapter-11', 'Chapter-12', 'Chapter-13', 'Chapter-14', 'Chapter-15', 'Chapter-17', 'Chapter-19', 'Chapter-20'],
    'PTrade相关': ['Chapter-07', 'Chapter-08', 'Chapter-09', 'Chapter-10', 'Chapter-18', 'Chapter-21'],
    'XtQuant相关': ['Chapter-06', 'Chapter-16'],
    'API参考': ['Chapter-17', 'Chapter-21'],
    '环境配置': ['Chapter-01', 'Chapter-06', 'Chapter-18'],
    '实战案例': ['Chapter-08', 'Chapter-20'],
    '问题解答': ['Chapter-14', 'Chapter-19']
  }
};

// 搜索功能增强
(function() {
  'use strict';
  
  // 等待docsify加载完成
  if (typeof window.$docsify !== 'undefined') {
    // 扩展搜索配置
    window.$docsify.search = Object.assign(window.$docsify.search || {}, {
      maxAge: 86400000, // 24小时缓存
      paths: 'auto',
      placeholder: {
        '/': '🔍 搜索文档内容... (支持中英文)'
      },
      noData: {
        '/': '😞 没有找到相关内容，试试其他关键词'
      },
      depth: 6,
      hideOtherSidebarContent: false,
      namespace: 'quant-docs-search',
      
      // 确保搜索所有路径
      paths: 'auto',
      
      // 自定义搜索函数
      searchMaxDepth: 6,
      pathNamespaces: ['/docs', '/学习案例'],
      
      // 搜索结果处理
      formatResult: function(query, content, title, path) {
        // 添加分类标签
        const category = getDocumentCategory(path);
        const categoryTag = category ? `<span class="search-category">${category}</span>` : '';
        
        // 高亮搜索词
        const highlightedTitle = highlightSearchTerm(title, query);
        const highlightedContent = highlightSearchTerm(content, query);
        
        return {
          title: highlightedTitle,
          content: highlightedContent,
          path: path,
          category: categoryTag
        };
      }
    });
  }
  
  // 获取文档分类
  function getDocumentCategory(path) {
    const categories = window.searchConfig.categories;
    for (const [category, chapters] of Object.entries(categories)) {
      if (chapters.some(chapter => path.includes(chapter))) {
        return category;
      }
    }
    return null;
  }
  
  // 高亮搜索词
  function highlightSearchTerm(text, query) {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }
  
  // 搜索历史管理（已禁用）
  const SearchHistory = {
    key: 'quant-docs-search-history',
    maxItems: 0,
    
    get: function() {
      return [];
    },
    
    add: function(query) {
      // 已禁用搜索历史功能
    },
    
    clear: function() {
      // 已禁用搜索历史功能
    }
  };
  
  // 搜索建议功能（已禁用）
  function initSearchSuggestions() {
    // 已禁用搜索建议功能
  }
  
  function showSuggestions(query, container) {
    // 已禁用搜索建议功能
  }
  
  function hideSuggestions(container) {
    // 已禁用搜索建议功能
  }
  
  function generateSuggestions(query) {
    // 已禁用搜索建议功能
    return [];
  }
  
  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchSuggestions);
  } else {
    initSearchSuggestions();
  }
  
  // 导出到全局
  window.SearchHistory = SearchHistory;
})();